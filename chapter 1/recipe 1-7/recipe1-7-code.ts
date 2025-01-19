// services/prompt-evaluator.service.ts
@Injectable()
export class PromptEvaluatorService {
  constructor(
    private readonly codeAnalyzer: CodeAnalyzerService,
    private readonly metricCollector: MetricCollectorService,
    private readonly testRunner: TestRunnerService,
  ) {}

  /**
   * プロンプトの総合評価を実行します
   * @param prompt 評価対象のプロンプト
   * @param expectedOutput 期待される出力
   * @param context 評価コンテキスト
   */
  async evaluatePrompt(
    prompt: string,
    expectedOutput: any,
    context: EvaluationContext
  ): Promise<PromptEvaluation> {
    const startTime = Date.now();
    const results = [];

    // 複数回の評価実行
    for (let i = 0; i < context.iterations; i++) {
      const result = await this.executeEvaluation(
        prompt,
        expectedOutput,
        context
      );
      results.push(result);
    }

    // メトリクスの集計
    const evaluation = this.aggregateResults(results);
    
    // 実行時間の記録
    evaluation.responseTime = Date.now() - startTime;

    return evaluation;
  }

  /**
   * 個別の評価実行
   */
  private async executeEvaluation(
    prompt: string,
    expectedOutput: any,
    context: EvaluationContext
  ): Promise<EvaluationResult> {
    // トークン使用量の計測開始
    const tokenCounter = this.metricCollector.startTokenCount();

    try {
      // LLMからの応答を取得
      const response = await this.getLLMResponse(prompt);

      // トークン使用量の記録
      const tokenUsage = tokenCounter.end();

      // コード品質の分析
      const codeQuality = await this.analyzeCodeQuality(response);

      // テストの実行
      const testResults = await this.runTests(response, context);

      // 結果の評価
      return {
        accuracy: this.calculateAccuracy(response, expectedOutput),
        consistency: this.evaluateConsistency(response, context),
        completeness: this.evaluateCompleteness(response, context),
        tokenUsage,
        codeQuality,
        testResults,
        error: null
      };
    } catch (error) {
      return {
        error,
        tokenUsage: tokenCounter.end()
      };
    }
  }

  /**
   * コード品質の分析
   */
  private async analyzeCodeQuality(
    code: string
  ): Promise<CodeQualityMetrics> {
    const analysis = await this.codeAnalyzer.analyze(code);

    return {
      complexity: analysis.cyclomaticComplexity,
      coverage: analysis.coverage,
      duplications: analysis.duplications,
      maintainability: analysis.maintainabilityIndex,
      documentation: analysis.documentationScore
    };
  }

  /**
   * 正確性の計算
   */
  private calculateAccuracy(
    actual: any,
    expected: any
  ): number {
    if (typeof expected === 'string') {
      return this.calculateStringSimularity(actual, expected);
    }

    if (typeof expected === 'object') {
      return this.calculateStructuralSimularity(actual, expected);
    }

    return actual === expected ? 1 : 0;
  }

  /**
   * 一貫性の評価
   */
  private evaluateConsistency(
    response: any,
    context: EvaluationContext
  ): number {
    const { namingConvention, codingStyle } = context;
    
    return this.codeAnalyzer.evaluateConsistency(
      response,
      namingConvention,
      codingStyle
    );
  }

  /**
   * 完全性の評価
   */
  private evaluateCompleteness(
    response: any,
    context: EvaluationContext
  ): number {
    const { requirements, edgeCases } = context;
    
    const requirementsCoverage = this.calculateRequirementsCoverage(
      response,
      requirements
    );
    
    const edgeCaseCoverage = this.calculateEdgeCaseCoverage(
      response,
      edgeCases
    );

    return (requirementsCoverage + edgeCaseCoverage) / 2;
  }

  /**
   * 評価結果の集計
   */
  private aggregateResults(
    results: EvaluationResult[]
  ): PromptEvaluation {
    const successfulResults = results.filter(r => !r.error);
    const totalResults = results.length;

    return {
      accuracy: this.calculateAverageMetric(
        successfulResults,
        'accuracy'
      ),
      consistency: this.calculateAverageMetric(
        successfulResults,
        'consistency'
      ),
      completeness: this.calculateAverageMetric(
        successfulResults,
        'completeness'
      ),
      tokenUsage: this.calculateAverageMetric(
        results,
        'tokenUsage'
      ),
      errorRate: (results.filter(r => r.error).length / totalResults) * 100,
      codeQuality: this.aggregateCodeQualityMetrics(
        successfulResults.map(r => r.codeQuality)
      ),
      retryRate: this.calculateRetryRate(results)
    };
  }
}