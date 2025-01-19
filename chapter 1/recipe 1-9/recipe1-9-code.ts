// types/feedback.ts
export interface PromptFeedback {
  promptId: string;
  version: string;
  evaluator: string;
  timestamp: Date;
  scores: {
    requirementsCoverage: number;
    outputQuality: number;
    efficiency: number;
  };
  observations: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  metrics: {
    tokenCount: number;
    executionTime: number;
    errorRate: number;
  };
}

// services/feedback-collector.service.ts
@Injectable()
export class FeedbackCollectorService {
  constructor(
    @Inject('FEEDBACK_REPOSITORY')
    private readonly feedbackRepo: IFeedbackRepository,
    private readonly metricsService: MetricsService,
    private readonly analyzerService: AnalyzerService,
  ) {}

  /**
   * フィードバックを収集して保存します
   */
  async collectFeedback(
    promptId: string,
    result: PromptResult,
    evaluator: string
  ): Promise<PromptFeedback> {
    // メトリクスの収集
    const metrics = await this.collectMetrics(result);

    // 品質分析の実行
    const analysis = await this.analyzerService.analyze(result);

    // フィードバックの構築
    const feedback: PromptFeedback = {
      promptId,
      version: result.promptVersion,
      evaluator,
      timestamp: new Date(),
      scores: {
        requirementsCoverage: analysis.requirementsCoverage,
        outputQuality: analysis.outputQuality,
        efficiency: analysis.efficiency,
      },
      observations: {
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
      },
      metrics,
    };

    // フィードバックの保存
    await this.feedbackRepo.save(feedback);

    // フィードバック統計の更新
    await this.updateStatistics(promptId, feedback);

    return feedback;
  }

  /**
   * フィードバックの集計と分析を行います
   */
  async analyzeFeedback(
    promptId: string,
    timeRange?: DateRange
  ): Promise<FeedbackAnalysis> {
    const feedbacks = await this.feedbackRepo.findByPromptId(
      promptId,
      timeRange
    );

    return {
      summary: this.calculateSummary(feedbacks),
      trends: this.analyzeTrends(feedbacks),
      recommendations: this.generateRecommendations(feedbacks),
    };
  }

  private async collectMetrics(
    result: PromptResult
  ): Promise<PromptMetrics> {
    return {
      tokenCount: await this.metricsService.countTokens(result),
      executionTime: result.executionTime,
      errorRate: await this.calculateErrorRate(result),
    };
  }

  private async updateStatistics(
    promptId: string,
    feedback: PromptFeedback
  ): Promise<void> {
    const stats = await this.feedbackRepo.getStatistics(promptId);
    
    // 統計情報の更新
    stats.totalFeedbacks += 1;
    stats.averageScores = this.updateAverageScores(
      stats.averageScores,
      feedback.scores,
      stats.totalFeedbacks
    );
    
    await this.feedbackRepo.updateStatistics(promptId, stats);
  }

  private calculateSummary(
    feedbacks: PromptFeedback[]
  ): FeedbackSummary {
    return {
      totalFeedbacks: feedbacks.length,
      averageScores: this.calculateAverageScores(feedbacks),
      commonStrengths: this.findCommonPatterns(
        feedbacks.flatMap(f => f.observations.strengths)
      ),
      commonWeaknesses: this.findCommonPatterns(
        feedbacks.flatMap(f => f.observations.weaknesses)
      ),
      topSuggestions: this.prioritizeSuggestions(
        feedbacks.flatMap(f => f.observations.suggestions)
      ),
    };
  }

  private analyzeTrends(
    feedbacks: PromptFeedback[]
  ): FeedbackTrends {
    const sortedFeedbacks = [...feedbacks].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    return {
      scoresTrend: this.calculateScoresTrend(sortedFeedbacks),
      metricsTrend: this.calculateMetricsTrend(sortedFeedbacks),
      issuesTrend: this.analyzeIssuesTrend(sortedFeedbacks),
    };
  }

  private generateRecommendations(
    feedbacks: PromptFeedback[]
  ): Recommendation[] {
    const analysis = {
      commonIssues: this.identifyCommonIssues(feedbacks),
      performanceMetrics: this.analyzePerformance(feedbacks),
      userSatisfaction: this.analyzeUserSatisfaction(feedbacks),
    };

    return this.prioritizeRecommendations(
      this.createRecommendations(analysis)
    );
  }
}