// search.interface.ts
export interface SearchRequest {
  query: string;
  filters?: {
    category?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  items: Product[];
  facets: {
    categories: CategoryFacet[];
    priceRanges: PriceRangeFacet[];
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// search.service.ts
@Injectable()
export class SearchService {
  constructor(
    @Inject('ELASTIC_CLIENT')
    private readonly esClient: ElasticsearchClient,
    @Inject('CACHE_MANAGER')
    private readonly cacheManager: ICacheManager,
    private readonly configService: ConfigService,
  ) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const cacheKey = this.generateCacheKey(request);
    const cachedResult = await this.cacheManager.get<SearchResponse>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const esQuery = this.buildElasticsearchQuery(request);
    const searchResult = await this.esClient.search(esQuery);
    const response = this.transformSearchResult(searchResult);

    await this.cacheManager.set(
      cacheKey,
      response,
      this.configService.get('cache.ttl')
    );

    return response;
  }

  private buildElasticsearchQuery(request: SearchRequest): SearchQueryDTO {
    // クエリ構築ロジック
  }

  private transformSearchResult(result: any): SearchResponse {
    // 結果変換ロジック
  }

  private generateCacheKey(request: SearchRequest): string {
    // キャッシュキー生成ロジック
  }
}

// search.controller.ts
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async search(@Query() request: SearchRequest): Promise<SearchResponse> {
    return this.searchService.search(request);
  }
}

// search.service.spec.ts
describe('SearchService', () => {
  let service: SearchService;
  let esClient: MockType<ElasticsearchClient>;
  let cacheManager: MockType<ICacheManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: 'ELASTIC_CLIENT',
          useFactory: jest.fn(() => ({
            search: jest.fn(),
          })),
        },
        {
          provide: 'CACHE_MANAGER',
          useFactory: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
          })),
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    esClient = module.get('ELASTIC_CLIENT');
    cacheManager = module.get('CACHE_MANAGER');
  });

  describe('search', () => {
    it('should return cached result if available', async () => {
      // テスト実装
    });

    it('should perform search and cache result if not cached', async () => {
      // テスト実装
    });

    it('should handle elasticsearch errors gracefully', async () => {
      // テスト実装
    });
  });
});