# システム設計 タスク計画

## 概要
ポートフォリオを主軸とした個人Webサイトのシステム設計

---

## 確定した設計方針

### デザイン方針
| 項目 | 決定事項 |
|------|---------|
| カラースキーム | ダークモード対応（ダーク基調） |
| デザインテイスト | ミニマリスト・機能重視（参考: hiraomakoto.jp） |
| フォント | Google Fonts（ブラウザ非依存） |
| UIライブラリ | shadcn/ui（必要最小限）+ Tailwind CSS（メイン） |

### コンテンツ管理方針
| 項目 | 決定事項 |
|------|---------|
| タグ管理 | 自由追加形式（Frontmatterで定義） |
| 並び順 | 日付順（デフォルト）+ ピン留め（Frontmatter: `pinned: true`） |
| OGP画像 | 動的生成（next/og使用） |

### 分析ツール
| ツール | 用途 |
|--------|------|
| Google Analytics 4 | 意思決定・分析用（主軸） |
| Vercel Analytics | UX・速度の即時確認用（補助） |

---

## 設計ステップ

### Phase 1: 基盤設計

- [x] **Step 1: プロジェクト構造設計** *(完了)*
  - ディレクトリ構造の定義
  - ファイル・フォルダ命名規則の策定
  - App Router に適したレイアウト構成
  - **成果物**: `aidlc-docs/design/project-structure.md`

- [x] **Step 2: ルーティング詳細設計** *(完了)*
  - 動的ルート `[lang]` / `[slug]` の構造
  - middleware.ts による言語リダイレクトロジック
  - 各ページのURL設計確認
  - **成果物**: `aidlc-docs/design/routing.md`

- [x] **Step 3: 多言語対応設計** *(完了)*
  - 言語検出・切替フローの詳細化
  - Cookie管理方針
  - 翻訳リソース（UI文言）の管理方式
  - **成果物**: `aidlc-docs/design/i18n.md`

### Phase 2: コンテンツ管理設計

- [x] **Step 4: MDXコンテンツ設計** *(完了)*
  - ディレクトリ構造（言語別分離）
  - Frontmatter スキーマ定義（記事・プロジェクト）
  - draft記事の除外ロジック
  - ピン留め機能（`pinned: true`）
  - MDX処理パイプライン
  - **成果物**: `aidlc-docs/design/mdx-content.md`

- [x] **Step 5: コンテンツ取得API設計** *(完了)*
  - 記事一覧・詳細の取得関数
  - プロジェクト一覧・詳細の取得関数
  - タグフィルタリング
  - ピン留め優先ソート
  - **成果物**: `aidlc-docs/design/content-api.md`

### Phase 3: UI/UX設計

- [x] **Step 6: コンポーネント設計** *(完了)*
  - 共通コンポーネント（Header, Footer, Layout等）
  - ページ固有コンポーネント
  - カードUI設計
  - shadcn/ui 使用コンポーネント選定
  - **成果物**: `aidlc-docs/design/components.md`

- [x] **Step 7: スタイリング設計** *(完了)*
  - Tailwind CSS 設定・テーマ定義
  - ダークモード配色
  - Google Fonts 選定
  - レスポンシブ設計方針
  - **成果物**: `aidlc-docs/design/styling.md`

- [x] **Step 8: アニメーション設計** *(完了)*
  - Framer Motion 使用箇所の特定
  - アニメーション仕様（コンポーネント単位、ページ遷移は見送り）
  - Server/Client 境界の方針
  - **成果物**: `aidlc-docs/design/animation.md`

### Phase 4: 技術基盤設計

- [x] **Step 9: SEO・メタデータ設計** *(完了)*
  - 各ページのメタデータ構造
  - OGP画像動的生成設計（next/og）
  - sitemap.xml / robots.txt
  - JSON-LD 構造化データ
  - **成果物**: `aidlc-docs/design/seo.md`

- [x] **Step 10: 分析・将来拡張設計** *(完了)*
  - GA4 導入設計（多言語対応、イベント命名）
  - Vercel Analytics 導入設計
  - 本番/Preview 環境分離
  - 将来拡張（Giscus, RSS, 検索）の準備
  - **成果物**: `aidlc-docs/design/analytics-extension.md`

- [x] **Step 11: ビルド・デプロイ設計** *(完了)*
  - Vercel設定（Standard Next.js）
  - 環境変数管理（VERCEL_ENV による判定）
  - Preview/本番環境の分離
  - セキュリティヘッダー
  - trailingSlash と Middleware の組み合わせ注意点
  - **成果物**: `aidlc-docs/design/deployment.md`

---

## 質問事項（解決済み）

### デザイン関連

[Question] カラースキームについて、具体的な希望はありますか？

[Answer] ダークモード対応のデザイン。かっこいい感じ。参考サイト: https://hiraomakoto.jp/

---

[Question] フォントについて、希望するフォントファミリーはありますか？

[Answer] Google Fontsから使用。ブラウザ依存にならないように。

---

[Question] UIコンポーネントライブラリの使用希望はありますか？

[Answer] shadcn/ui を必要最小限だけ使い、基本は Tailwind CSS で組む。

---

### コンテンツ関連

[Question] タグの種類や分類は事前に定義しますか？

[Answer] 記事作成時に自由に追加する形式。

---

[Question] プロジェクト一覧での並び順はどのように決めますか？

[Answer] 基本は日付順。Frontmatterでピン留め指定可能（A. Frontmatter方式を採用）。

---

### 技術関連

[Question] OGP画像は動的生成を希望しますか？

[Answer] 動的生成（next/og）を使用。

---

[Question] 分析ツールの導入予定はありますか？

[Answer] GA4（主軸：意思決定・分析用）+ Vercel Analytics（補助：UX/速度確認用）

---

## 承認状況

- [x] 質問への回答完了
- [x] 計画承認済み（2024年）

---

## 進捗

| Phase | ステップ | 状態 |
|-------|---------|------|
| Phase 1 | Step 1-3 | ✅ 完了 |
| Phase 2 | Step 4-5 | ✅ 完了 |
| Phase 3 | Step 6-8 | ✅ 完了 |
| Phase 4 | Step 9-11 | ✅ 完了 |

---

## 全ステップ完了 🎉

全11ステップの設計ドキュメントが完成しました。次のフェーズは実装です。
