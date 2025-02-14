# レシピ1-4: 段階的な指示の組み立て方

## 課題（Problem）
複雑な開発タスクをLLMに依頼する際、一度に全ての要件を伝えようとすると以下の問題が発生します：

- LLMが重要な要件を見落とす
- 生成される結果が部分的に不適切
- フィードバックが困難
- 修正コストの増大

## 解決方法（Solution）
タスクを段階的なステップに分解し、各段階で適切なフィードバックを得ながら進めます：

1. 要件の階層化と優先順位付け
2. 段階的な指示の提供
3. フィードバックループの確立
4. 反復的な改善

## プロンプトパターン

### 段階的な指示の基本構造

```
Phase 1: アーキテクチャ設計
要件:
1. システム構成の概要
2. 主要コンポーネントの定義
3. データフローの設計

評価基準:
- スケーラビリティ
- メンテナンス性
- 拡張性

---
Phase 2: インターフェース設計
要件:
1. APIエンドポイントの定義
2. データモデルの設計
3. バリデーションルール

評価基準:
- APIの一貫性
- 型安全性
- エラーハンドリング

---
Phase 3: 実装詳細
要件:
1. コアロジックの実装
2. エラー処理の実装
3. テストケースの作成

評価基準:
- コードの品質
- テストカバレッジ
- パフォーマンス
```

## 実践例：ECサイトの商品検索API実装

### Phase 1: 要件定義とアーキテクチャ設計

```
あなたは、大規模ECサイトのバックエンド開発を担当するシニアエンジニアです。
商品検索APIの実装について、段階的に設計と実装を進めていきたいと思います。

Phase 1の目標:
- 検索APIのアーキテクチャ設計
- 主要コンポーネントの特定
- データフローの定義

技術スタック:
- バックエンド: NestJS/TypeScript
- 検索エンジン: Elasticsearch
- キャッシュ: Redis
- データベース: PostgreSQL

要件:
1. 商品名、カテゴリ、価格による検索
2. ファセット検索のサポート
3. レスポンスタイム: 200ms以内

まずは、この要件に基づいたアーキテクチャ設計案を提示してください。
```
-[商品検索APIのアーキテクチャ設計](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-4/recipe1-4-flow.mermaid)

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
-[商品検索APIの実装例](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-4/recipe1-4-code.ts)

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
