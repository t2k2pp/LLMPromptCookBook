// domain/interfaces/IOrderProcessor.ts
export interface IOrderProcessor {
  processOrder(order: CreateOrderCommand): Promise<OrderResult>;
  getOrderStatus(orderId: string): Promise<OrderStatus>;
  cancelOrder(orderId: string): Promise<void>;
}

// domain/services/OrderProcessor.ts
@Injectable()
export class OrderProcessor implements IOrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @Inject('IInventoryService')
    private readonly inventoryService: IInventoryService,
    @Inject('IPaymentService')
    private readonly paymentService: IPaymentService,
    @Inject('ICacheManager')
    private readonly cacheManager: ICacheManager,
    private readonly orderRepository: OrderRepository,
    private readonly metricsService: MetricsService,
  ) {}

  @Transactional()
  @RateLimit({
    ttl: 60000,
    limit: 1000,
  })
  async processOrder(command: CreateOrderCommand): Promise<OrderResult> {
    const span = trace.getTracer('order-service').startSpan('process-order');
    const startTime = Date.now();

    try {
      // べき等性チェック
      const idempotencyKey = `order:${command.idempotencyKey}`;
      const existingOrder = await this.cacheManager.get(idempotencyKey);
      if (existingOrder) {
        return existingOrder as OrderResult;
      }

      // バリデーション
      this.validateOrder(command);

      // 在庫チェックと予約
      const inventoryResult = await this.inventoryService.checkAndReserve(
        command.items,
        { timeout: 5000 } // 5秒のタイムアウト
      );

      if (!inventoryResult.success) {
        throw new OrderValidationError(
          'Insufficient inventory',
          inventoryResult.errors
        );
      }

      // 注文の作成
      const order = await this.orderRepository.create({
        ...command,
        status: OrderStatus.PENDING,
        metadata: {
          trace_id: span.spanContext().traceId,
          created_at: new Date(),
        },
      });

      // 支払い処理
      try {
        await this.paymentService.processPayment({
          orderId: order.id,
          amount: order.totalAmount,
          currency: order.currency,
        });

        order.status = OrderStatus.CONFIRMED;
      } catch (error) {
        // 補償トランザクション - 在庫の解放
        await this.inventoryService.releaseReservation(
          command.items,
          order.id
        );
        throw error;
      }

      // べき等性キーの保存（24時間）
      await this.cacheManager.set(idempotencyKey, order, 86400);

      // メトリクスの記録
      const processingTime = Date.now() - startTime;
      this.metricsService.recordOrderProcessingTime(processingTime);

      this.logger.log(
        `Order ${order.id} processed successfully in ${processingTime}ms`
      );

      return order;
    } catch (error) {
      this.logger.error(
        `Order processing failed: ${error.message}`,
        error.stack
      );
      throw error;
    } finally {
      span.end();
    }
  }

  private validateOrder(command: CreateOrderCommand): void {
    // 入力バリデーション
    if (!command.items?.length) {
      throw new OrderValidationError('No items in order');
    }

    // 金額チェック
    if (command.totalAmount <= 0) {
      throw new OrderValidationError('Invalid order amount');
    }

    // PIIデータの検証と匿名化
    if (command.customerData) {
      command.customerData = this.anonymizeCustomerData(
        command.customerData
      );
    }
  }

  private anonymizeCustomerData(data: CustomerData): CustomerData {
    return {
      ...data,
      email: this.maskEmail(data.email),
      phone: this.maskPhone(data.phone),
    };
  }
}

// テストケース
describe('OrderProcessor', () => {
  let orderProcessor: OrderProcessor;
  let inventoryService: MockType<IInventoryService>;
  let cacheManager: MockType<ICacheManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProcessor,
        {
          provide: 'IInventoryService',
          useFactory: jest.fn(() => ({
            checkAndReserve: jest.fn(),
            releaseReservation: jest.fn(),
          })),
        },
        // その他のモック設定...
      ],
    }).compile();

    orderProcessor = module.get<OrderProcessor>(OrderProcessor);
    inventoryService = module.get('IInventoryService');
  });

  describe('processOrder', () => {
    it('should handle idempotent requests', async () => {
      // テスト実装...
    });

    it('should handle inventory check failure', async () => {
      // テスト実装...
    });

    it('should perform compensation transaction on payment failure', async () => {
      // テスト実装...
    });

    it('should meet performance requirements', async () => {
      // パフォーマンステスト実装...
    });
  });
});