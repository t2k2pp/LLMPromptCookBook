### Phase 2: インターフェース設計

```
アーキテクチャ設計を承認いただいたので、次のフェーズに進みます。

Phase 2の目標:
- APIインターフェースの定義
- データモデルの設計
- バリデーションルールの設定

具体的な要件:
1. REST APIエンドポイントの定義
2. リクエスト/レスポンスの型定義
3. 入力バリデーションルール
4. エラーレスポンスの形式
```

### Phase 3: 実装詳細

```
インターフェース設計が完了したので、実装フェーズに進みます。

Phase 3の目標:
- コアロジックの実装
- キャッシュ戦略の実装
- テストケースの作成

実装要件:
1. NestJSベースの実装
2. Elasticsearchクエリの最適化
3. Redisキャッシュの統合
4. ユニットテストとE2Eテスト
```

## 段階的な指示のパターン

### 1. トップダウンアプローチ
1. 全体アーキテクチャ
2. モジュール設計
3. 詳細実装

### 2. ボトムアップアプローチ
1. コア機能の実装
2. モジュール統合
3. システム統合

### 3. ハイブリッドアプローチ
1. 概要設計
2. クリティカルパスの実装
3. 残りの機能追加

## 各フェーズでの確認ポイント

### フェーズ1: アーキテクチャ設計
- スケーラビリティ要件の充足
- セキュリティ要件の考慮
- 運用性の確保

### フェーズ2: インターフェース設計
- API設計原則の遵守
- データモデルの整合性
- エラーハンドリングの網羅性

### フェーズ3: 実装
- コードの品質
- テストの網羅性
- パフォーマンス要件の充足

## 改善のフィードバックループ

1. **レビューポイント**
   - 各フェーズの成果物
   - 次フェーズへの前提条件
   - 品質基準の達成度

2. **フィードバックの反映**
   - 設計の見直し
   - 実装の改善
   - テストケースの追加

3. **ドキュメント化**
   - 設計判断の記録
   - 実装上の注意点
   - 運用時の考慮事項

## ベストプラクティス

1. **フェーズの明確な区分**
   - 成果物の定義
   - 評価基準の設定
   - マイルストーンの設定

2. **フィードバックの早期取得**
   - 各フェーズでのレビュー
   - プロトタイプの活用
   - 継続的な改善

3. **ドキュメントの維持**
   - 設計判断の記録
   - 変更履歴の管理
   - 知見の共有

## 関連レシピ
- レシピ1-3: 制約条件の明示的な指定
- レシピ2-1: ボイラープレートコードの生成
- レシピ4-1: システム要件の分析

## Tips
- 各フェーズの目標を明確に
- フィードバックを積極的に収集
- 柔軟な計画の調整

## Warning
- フェーズ間の依存関係に注意
- 過度な完璧主義を避ける
- スコープの肥大化に注意