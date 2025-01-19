// types/api-response.ts
export interface IAPIResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  metadata?: {
    timestamp: string;
    version: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// types/api-error.ts
export interface IAPIError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
  timestamp?: string;
}

// services/user.service.ts
/**
 * ユーザー管理サービス
 * @description ユーザーの作成、更新、削除、検索機能を提供します
 */
export interface IUserService {
  /**
   * ユーザーを作成します
   * @param data ユーザー作成データ
   * @returns 作成されたユーザー情報
   * @throws {ValidationError} バリデーションエラー時
   * @throws {DuplicateError} メールアドレス重複時
   */
  createUser(data: CreateUserDto): Promise<User>;

  /**
   * ユーザー情報を更新します
   * @param id ユーザーID
   * @param data 更新データ
   * @returns 更新されたユーザー情報
   * @throws {NotFoundError} ユーザーが存在しない場合
   */
  updateUser(id: string, data: UpdateUserDto): Promise<User>;
}

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepo: IUserRepository,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    this.logger.debug('Creating user:', { email: data.email });

    const validationResult = await this.validateUserData(data);
    if (!validationResult.isValid) {
      throw new ValidationError('Invalid user data', validationResult.errors);
    }

    const user = await this.userRepo.create(data);
    
    this.logger.info('User created successfully', { userId: user.id });
    return user;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    this.logger.debug('Updating user:', { userId: id });

    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User not found: ${id}`);
    }

    const updatedUser = await this.userRepo.update(id, data);
    
    this.logger.info('User updated successfully', { userId: id });
    return updatedUser;
  }
}

// controllers/user.controller.ts
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: IUserService) {}

  @Post()
  async createUser(
    @Body() data: CreateUserDto
  ): Promise<IAPIResponse<User>> {
    const user = await this.userService.createUser(data);
    
    return {
      statusCode: 201,
      message: 'User created successfully',
      data: user,
      metadata: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto
  ): Promise<IAPIResponse<User>> {
    const user = await this.userService.updateUser(id, data);
    
    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
      metadata: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Get()
  async getUsers(
    @Query() query: GetUsersQueryDto
  ): Promise<IAPIResponse<User[]>> {
    const { users, total } = await this.userService.getUsers(query);
    
    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: users,
      metadata: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }
}

// tests/user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'USER_REPOSITORY',
          useFactory: jest.fn(() => ({
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          })),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get('USER_REPOSITORY');
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const expectedUser = { id: '1', ...userData };
      repository.create.mockResolvedValue(expectedUser);

      // Execute
      const result = await service.createUser(userData);

      // Verify
      expect(result).toEqual(expectedUser);
      expect(repository.create).toHaveBeenCalledWith(userData);
    });

    it('should throw ValidationError for invalid data', async () => {
      // Setup
      const invalidData = {
        email: 'invalid-email',
        password: '123',
      };

      // Execute & Verify
      await expect(service.createUser(invalidData))
        .rejects
        .toThrow(ValidationError);
    });
  });
});