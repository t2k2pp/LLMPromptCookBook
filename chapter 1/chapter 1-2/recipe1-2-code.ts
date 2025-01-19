// domain/interfaces/IOrderService.ts
export interface IOrderService {
  createOrder(order: CreateOrderDto): Promise<Order>;
  updateOrder(id: string, order: UpdateOrderDto): Promise<Order>;
  cancelOrder(id: string): Promise<void>;
}

// domain/interfaces/IInventoryService.ts
export interface IInventoryService {
  checkAvailability(items: OrderItem[]): Promise<InventoryCheckResult>;
  reserveItems(orderId: string, items: OrderItem[]): Promise<void>;
}

// domain/services/OrderService.ts
@Injectable()
export class OrderService implements IOrderService {
  constructor(
    @Inject('IInventoryService')
    private readonly inventoryService: IInventoryService,
    @Inject('IPaymentService')
    private readonly paymentService: IPaymentService,
    private readonly orderRepository: OrderRepository,
  ) {}

  @Transactional()
  async createOrder(orderDto: CreateOrderDto): Promise<Order> {
    // 在庫チェック
    const inventoryCheck = await this.inventoryService.checkAvailability(
      orderDto.items
    );
    
    if (!inventoryCheck.isAvailable) {
      throw new OrderValidationError(
        'Some items are not available',
        inventoryCheck.unavailableItems
      );
    }

    // 注文エンティティの作成
    const order = await this.orderRepository.create({
      ...orderDto,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    });

    try {
      // 在庫の予約
      await this.inventoryService.reserveItems(
        order.id,
        orderDto.items
      );

      // 支払い処理
      await this.paymentService.processPayment({
        orderId: order.id,
        amount: order.totalAmount,
        currency: order.currency,
      });

      // 注文の確定
      order.status = OrderStatus.CONFIRMED;
      await this.orderRepository.save(order);

      return order;
    } catch (error) {
      // エラーハンドリングとロールバック
      order.status = OrderStatus.FAILED;
      await this.orderRepository.save(order);
      throw new OrderProcessingError(
        'Failed to process order',
        error
      );
    }
  }

  // その他のメソッド実装...
}

// domain/services/OrderService.spec.ts
describe('OrderService', () => {
  let orderService: OrderService;
  let inventoryService: MockType<IInventoryService>;
  let paymentService: MockType<IPaymentService>;
  let orderRepository: MockType<OrderRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: 'IInventoryService',
          useFactory: () => ({
            checkAvailability: jest.fn(),
            reserveItems: jest.fn(),
          }),
        },
        // その他のモック設定...
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    inventoryService = module.get('IInventoryService');
    // その他のサービス取得...
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      // テストの実装...
    });

    it('should handle inventory unavailability', async () => {
      // テストの実装...
    });

    it('should handle payment failure', async () => {
      // テストの実装...
    });
  });
});