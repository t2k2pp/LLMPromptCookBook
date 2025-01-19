// services/prompt-ab-test.service.ts
@Injectable()
export class PromptABTestService {
  constructor(
    private readonly llmService: LLMService,
    private readonly evaluator: PromptEvaluatorService,
    private readonly metrics: MetricsService,
  ) {}

  /**
   * A/Bテストを実行します
   */
  async runABTest(
    config: ABTestConfig
  ): Promise<ABTestResult> {
    const {
      promptA,
      promptB,
      testCases,
      iterations,
      evaluationCriteria
    } = config;

    // 各プロンプトのテスト実行
    const resultsA = await this.runTests(
      promptA,
      testCases,
      iterations
    );
    const resultsB = await this.runTests(
      promptB,
      testCases,
      iterations
    );

    // 結果の分析
    const analysis = this.analyzeResults(resultsA, resultsB);

    // 統計的有意性の検証
    const significance = this.calculateSignificance(
      resultsA,
      resultsB
    );

    // 評価基準に基づくスコアリング
    const scores = this.evaluateResults(
      resultsA,
      resultsB,
      evaluationCriteria
    );

    return {
      versionA: {
        results: resultsA,
        score: scores.versionA
      },
      versionB: {
        results: resultsB,
        score: scores.versionB
      },
      analysis,
      significance,
      recommendation: this.generateRecommendation(scores, significance)
    };
  }

  /**
   * テストケースの実行
   */
  private async runTests(
    prompt: string,
    testCases: TestCase[],
    iterations: number
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        try {
          // LLMからの応答を取得
          const response = await this.llmService.getCompletion(
            prompt,
            testCase.input
          );

          // 応答の評価
          const evaluation = await this.evaluator.evaluate(
            response,
            testCase.expectedOutput
          );

          results.push({
            testCase: testCase.id,
            iteration: i,
            response,
            evaluation,
            executionTime: Date.now() - startTime,
            error: null
          });
        } catch (error) {
          results.push({
            testCase: testCase.id,
            iteration: i,
            error,
            executionTime: Date.now() - startTime
          });
        }
      }
    }

    return results;
  }

  /**
   * 結果の分析
   */
  private analyzeResults(
    resultsA: TestResult[],
    resultsB: TestResult[]
  ): ResultAnalysis {
    return {
      accuracy: {
        versionA: this.calculateAverageAccuracy(resultsA),
        versionB: this.calculateAverageAccuracy(resultsB)
      },
      performance: {
        versionA: this.calculateAveragePerformance(resultsA),
        versionB: this.calculateAveragePerformance(resultsB)
      },
      errorRates: {
        versionA: this.calculateErrorRate(resultsA),
        versionB: this.calculateErrorRate(resultsB)
      },
      tokenUsage: {
        versionA: this.calculateAverageTokenUsage(resultsA),
        versionB: this.calculateAverageTokenUsage(resultsB)
      }
    };
  }

  /**
   * 統計的有意性の計算
   */
  private calculateSignificance(
    resultsA: TestResult[],
    resultsB: TestResult[]
  ): SignificanceTest {
    // t検定の実施
    const tTest = this.performTTest(
      this.extractMetrics(resultsA),
      this.extractMetrics(resultsB)
    );

    return {
      pValue: tTest.pValue,
      isSignificant: tTest.pValue < 0.05,
      confidenceInterval: tTest.confidenceInterval
    };
  }

  /**
   * 評価基準に基づくスコアリング
   */
  private evaluateResults(
    resultsA: TestResult[],
    resultsB: TestResult[],
    criteria: EvaluationCriteria
  ): Score {
    return {
      versionA: this.calculateScore(resultsA, criteria),
      versionB: this.calculateScore(resultsB, criteria)
    };
  }

  /**
   * 推奨事項の生成
   */
  private generateRecommendation(
    scores: Score,
    significance: SignificanceTest
  ): Recommendation {
    if (!significance.isSignificant) {
      return {
        decision: 'INCONCLUSIVE',
        reason: '統計的有意差が見られません',
        suggestions: [
          'テストケースの追加を検討',
          'イテレーション数の増加を検討'
        ]
      };
    }

    const winner = scores.versionB > scores.versionA ? 'B' : 'A';
    const improvement = Math.abs(
      ((scores.versionB - scores.versionA) / scores.versionA) * 100
    );

    return {
      decision: `VERSION_${winner}`,
      reason: `バージョン${winner}が${improvement.toFixed(2)}%の改善を示しました`,
      suggestions: this.generateImprovementSuggestions(
        winner === 'A' ? resultsB : resultsA
      )
    };
  }
}