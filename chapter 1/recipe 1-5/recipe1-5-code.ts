// types/user.ts
export interface UserRegistrationRequest {
  email: string;
  password: string;
  profile: {
    name: string;
    language: string;
  };
}

// errors/registration.error.ts
export class UserRegistrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'UserRegistrationError';
  }
}

// services/user-registration.service.ts
@Injectable()
export class UserRegistrationService {
  private readonly logger = new Logger(UserRegistrationService.name);
  
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepo: IUserRepository,
    @Inject('EMAIL_SERVICE')
    private readonly emailService: IEmailService,
    @Inject('RATE_LIMITER')
    private readonly rateLimiter: IRateLimiter,
    private readonly configService: ConfigService,
  ) {}

  @Retryable({
    maxAttempts: 3,
    backOff: 1000,
    excludeFor: [UserRegistrationError],
  })
  async registerUser(
    request: UserRegistrationRequest,
    clientIp: string
  ): Promise<User> {
    try {
      // レート制限チェック
      await this.checkRateLimit(clientIp);

      // 入力値の検証
      await this.validateRegistrationRequest(request);

      // トランザクション開始
      return await this.userRepo.transaction(async (transaction) => {
        // メールアドレスの重複チェック（悲観的ロック）
        const existingUser = await this.userRepo.findByEmail(
          request.email,
          { lock: true, transaction }
        );

        if (existingUser) {
          throw new UserRegistrationError(
            'Email already registered',
            'EMAIL_DUPLICATE'
          );
        }

        // パスワードのハッシュ化
        const hashedPassword = await this.hashPassword(request.password);

        // ユーザーの作成
        const user = await this.userRepo.create({
          ...request,
          password: hashedPassword,
          status: 'PENDING',
          confirmationToken: this.generateConfirmationToken(),
        }, { transaction });

        // 確認メールの送信
        try {
          await this.emailService.sendConfirmationEmail(
            user.email,
            user.confirmationToken,
            user.profile.language
          );
        } catch (error) {
          // メール送信エラーはログに記録するが、登録自体は継続
          this.logger.error(
            `Failed to send confirmation email: ${error.message}`,
            error.stack
          );
        }

        return user;
      });
    } catch (error) {
      // エラーの種類に応じた適切な処理
      if (error instanceof UserRegistrationError) {
        throw error;
      }

      // データベースエラーの処理
      if (error.code === 'CONNECTION_ERROR') {
        this.logger.error('Database connection failed', error.stack);
        throw new UserRegistrationError(
          'Service temporarily unavailable',
          'SERVICE_UNAVAILABLE'
        );
      }

      // 予期しないエラー
      this.logger.error('Unexpected error during registration', error.stack);
      throw new UserRegistrationError(
        'Registration failed',
        'INTERNAL_ERROR'
      );
    }
  }

  private async validateRegistrationRequest(
    request: UserRegistrationRequest
  ): Promise<void> {
    const errors: ValidationError[] = [];

    // メールアドレスの検証
    if (!this.isValidEmail(request.email)) {
      errors.push({
        field: 'email',
        code: 'INVALID_FORMAT'
      });
    }

    if (request.email.length > 255) {
      errors.push({
        field: 'email',
        code: 'TOO_LONG'
      });
    }

    // パスワード強度の検証
    const passwordStrength = await this.checkPasswordStrength(request.password);
    if (!passwordStrength.isStrong) {
      errors.push({
        field: 'password',
        code: 'WEAK_PASSWORD',
        details: passwordStrength.reasons
      });
    }

    // プロフィール情報の検証
    if (request.profile.name.length > 100) {
      errors.push({
        field: 'profile.name',
        code: 'TOO_LONG'
      });
    }

    if (!this.isValidLanguage(request.profile.language)) {
      errors.push({
        field: 'profile.language',
        code: 'INVALID_LANGUAGE'
      });
    }

    if (errors.length > 0) {
      throw new UserRegistrationError(
        'Invalid registration data',
        'VALIDATION_ERROR',
        errors
      );
    }
  }

  private async checkRateLimit(clientIp: string): Promise<void> {
    const limit = this.configService.get('registration.rateLimit');
    const isLimited = await this.rateLimiter.checkLimit(clientIp, limit);

    if (isLimited) {
      throw new UserRegistrationError(
        'Too many registration attempts',
        'RATE_LIMIT_EXCEEDED'
      );
    }
  }
}

// tests/user-registration.service.spec.ts
describe('UserRegistrationService', () => {
  let service: UserRegistrationService;
  let userRepo: MockType<IUserRepository>;
  let emailService: MockType<IEmailService>;
  let rateLimiter: MockType<IRateLimiter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // モジュール設定
    }).compile();

    service = module.get<UserRegistrationService>(UserRegistrationService);
    userRepo = module.get('USER_REPOSITORY');
    emailService = module.get('EMAIL_SERVICE');
    rateLimiter = module.get('RATE_LIMITER');
  });

  describe('registerUser', () => {
    it('should handle rate limit exceeded', async () => {
      rateLimiter.checkLimit.mockResolvedValue(true);
      
      await expect(service.registerUser(validRequest, '127.0.0.1'))
        .rejects
        .toThrow('Too many registration attempts');
    });

    it('should handle duplicate email', async () => {
      userRepo.findByEmail.mockResolvedValue({ /* existing user */ });
      
      await expect(service.registerUser(validRequest, '127.0.0.1'))
        .rejects
        .toThrow('Email already registered');
    });

    it('should handle database connection error', async () => {
      userRepo.findByEmail.mockRejectedValue({
        code: 'CONNECTION_ERROR'
      });
      
      await expect(service.registerUser(validRequest, '127.0.0.1'))
        .rejects
        .toThrow('Service temporarily unavailable');
    });

    it('should continue registration if email sending fails', async () => {
      emailService.sendConfirmationEmail.mockRejectedValue(new Error());
      
      const result = await service.registerUser(validRequest, '127.0.0.1');
      expect(result).toBeDefined();
    });
  });
});