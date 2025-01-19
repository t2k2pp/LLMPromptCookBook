# 実践LLMプロンプトCookBook
## ～ソフトウェア開発者のためのプロンプトエンジニアリング実践ガイド～

# [はじめに](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%200/introduction.md)
- 本書の目的と構成
- 対象読者
- 前提知識
- 使用する開発環境とツール

# [第1章 基本的なプロンプトパターン](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-1/recipe1-1.md#%E7%AC%AC1%E7%AB%A0-%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AA%E3%83%97%E3%83%AD%E3%83%B3%E3%83%97%E3%83%88%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3)
## 1.1 プロンプトエンジニアリングの基礎
- [レシピ1-1: プロンプトの基本構造と設計原則](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-1/recipe1-1.md#%E3%83%AC%E3%82%B7%E3%83%941-1-%E3%83%97%E3%83%AD%E3%83%B3%E3%83%97%E3%83%88%E3%81%AE%E5%9F%BA%E6%9C%AC%E6%A7%8B%E9%80%A0%E3%81%A8%E8%A8%AD%E8%A8%88%E5%8E%9F%E5%89%87)
- [レシピ1-2: コンテキストの効果的な提供方法](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-2/recipe1-2.md#%E3%83%AC%E3%82%B7%E3%83%941-2-%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E3%81%AE%E5%8A%B9%E6%9E%9C%E7%9A%84%E3%81%AA%E6%8F%90%E4%BE%9B%E6%96%B9%E6%B3%95)
- [レシピ1-3: 制約条件の明示的な指定](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-3/recipe1-3.md#%E3%83%AC%E3%82%B7%E3%83%941-3-%E5%88%B6%E7%B4%84%E6%9D%A1%E4%BB%B6%E3%81%AE%E6%98%8E%E7%A4%BA%E7%9A%84%E3%81%AA%E6%8C%87%E5%AE%9A)
- [Column: トークン数の最適化テクニック](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/column%201-1/column1-1.md#column-%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E6%95%B0%E3%81%AE%E6%9C%80%E9%81%A9%E5%8C%96%E3%83%86%E3%82%AF%E3%83%8B%E3%83%83%E3%82%AF)

## 1.2 タスク指向のプロンプト設計
- [レシピ1-4: 段階的な指示の組み立て方](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-4/recipe1-4.md)
- [レシピ1-5: エッジケースの考慮と対処](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-5/recipe1-5.md)
- [レシピ1-6: 出力フォーマットの制御](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-6/recipe1-6.md)
- [Column: プロンプトのバージョン管理手法](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/column%201-1/column1-1.md)

## 1.3 プロンプトの評価と改善
- [レシピ1-7: プロンプトの評価指標](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-7/recipe1-7.md)
- [レシピ1-8: A/Bテストの実施方法](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-8/recipe1-8.md)
- [レシピ1-9: フィードバックの収集と反映](https://github.com/t2k2pp/LLMPromptCookBook/blob/main/chapter%201/recipe%201-9/recipe1-9.md)
- Column: プロンプトの自動評価システム

### Chapter 1 まとめ
- チェックリスト
- よくある間違い
- ベストプラクティス
- 次章への展開

# 第2章 コード生成のプロンプトパターン
## 2.1 基本的なコード生成
- レシピ2-1: ボイラープレートコードの生成
- レシピ2-2: APIエンドポイントの実装
- レシピ2-3: データモデルとバリデーション
- Column: 生成コードの品質保証

## 2.2 テストコードの生成
- レシピ2-4: ユニットテストの自動生成
- レシピ2-5: テストケースの網羅性向上
- レシピ2-6: モックとスタブの生成
- Column: Property-Based Testingの活用

## 2.3 特殊なコード生成
- レシピ2-7: マイグレーションスクリプトの生成
- レシピ2-8: CI/CD設定ファイルの生成
- レシピ2-9: ドキュメント生成の自動化
- Column: Infrastructure as Codeの活用

### Chapter 2 まとめ
- チェックリスト
- よくある間違い
- ベストプラクティス
- 次章への展開

# 第3章 コードレビューと改善のプロンプトパターン
## 3.1 静的解析と改善提案
- レシピ3-1: コード品質の評価
- レシピ3-2: セキュリティ脆弱性の検出
- レシピ3-3: パフォーマンス最適化の提案
- Column: AIによるコードレビューの限界

## 3.2 リファクタリング支援
- レシピ3-4: デザインパターンの適用
- レシピ3-5: 技術的負債の検出と改善
- レシピ3-6: コードの可読性向上
- Column: レガシーコード改善の戦略

## 3.3 コードベース分析
- レシピ3-7: 依存関係の分析
- レシピ3-8: コードメトリクスの収集
- レシピ3-9: ドキュメント生成と更新
- Column: モノリスからマイクロサービスへの移行

### Chapter 3 まとめ
- チェックリスト
- よくある間違い
- ベストプラクティス
- 次章への展開

# 第4章 設計支援のプロンプトパターン
## 4.1 アーキテクチャ設計
- レシピ4-1: システム要件の分析
- レシピ4-2: マイクロサービスの境界定義
- レシピ4-3: インフラストラクチャの設計
- Column: クラウドネイティブアーキテクチャの考慮点

## 4.2 API設計
- レシピ4-4: RESTful API設計
- レシピ4-5: GraphQL スキーマ設計
- レシピ4-6: APIドキュメント生成
- Column: API-Firstな開発アプローチ

## 4.3 データモデリング
- レシピ4-7: データベーススキーマ設計
- レシピ4-8: NoSQLデータモデリング
- レシピ4-9: キャッシュ戦略の設計
- Column: ポリグロット永続化の実践

### Chapter 4 まとめ
- チェックリスト
- よくある間違い
- ベストプラクティス
- 今後の展望

# 付録
- A. プロンプトテンプレート集
- B. LLMツールの比較表
- C. トラブルシューティングガイド
- D. 参考文献とリソース
