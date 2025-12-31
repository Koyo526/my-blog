# ドメインモデル実装計画

## 概要
ポートフォリオWebサイトのドメインモデルコンポーネントを実装する。

---

## 質問事項

### Q1: 実装言語とランタイム
[Question] 実装言語はTypeScriptで良いでしょうか？また、Next.jsプロジェクト内の `src/` ディレクトリ配下に配置する想定でしょうか？

[Answer]
実装言語はTypeScriptです。blog/app配下に実装をしていく想定です。
---

### Q2: ドメインモデルのエンティティ
[Question] 要件から以下のエンティティを想定していますが、これで正しいでしょうか？追加・削除があればご指示ください。

1. **Article（記事）** - ブログ記事エンティティ
   - id, title, slug, date, tags, summary, lang, draft, content

2. **Project（プロジェクト）** - ポートフォリオプロジェクトエンティティ
   - id, name, slug, tech, role, highlights, links, lang, content

3. **Tag（タグ）** - タグ（値オブジェクト）
   - name

4. **Language（言語）** - 言語種別（enum または値オブジェクト）
   - ja, en

[Answer] はい正しいです。

---

### Q3: リポジトリインターフェース
[Question] インメモリリポジトリを実装しますが、将来的にMDXファイルからの読み込みに切り替えることを考慮して、リポジトリのインターフェース（抽象化）を定義すべきでしょうか？

[Answer]　将来的にMDXファイルからの読み込みに切り替えることを考慮して、リポジトリのインターフェース（抽象化）を定義して下さい。

---

### Q4: 配置ディレクトリ
[Question] フラットなディレクトリ構造とのことですが、以下のような配置で良いでしょうか？

```
blog/app/domain/
├── Article.ts
├── Project.ts
├── Tag.ts
├── Language.ts
├── ArticleRepository.ts      # インターフェース
├── ProjectRepository.ts      # インターフェース
├── InMemoryArticleRepository.ts
└── InMemoryProjectRepository.ts
```

[Answer] はい大丈夫です。一方で必要に応じてサブディレクトリは使用して問題ないです。
例えば、Article.tsが肥大化する場合、article/Article.tsのサブディレクトリを作成しても問題ありません。

---

## 実装ステップ（確定）

- [ ] **Step 1: ディレクトリ作成**
  - `blog/app/domain/` ディレクトリを作成

- [ ] **Step 2: 値オブジェクト・Enum実装**
  - `Language.ts` - 言語種別（ja, en）のEnum
  - `Tag.ts` - タグの値オブジェクト

- [ ] **Step 3: エンティティ実装**
  - `Article.ts` - 記事エンティティ（id, title, slug, date, tags, summary, lang, draft, content）
  - `Project.ts` - プロジェクトエンティティ（id, name, slug, tech, role, highlights, links, lang, content）

- [ ] **Step 4: リポジトリインターフェース実装**
  - `ArticleRepository.ts` - 記事リポジトリのインターフェース定義
  - `ProjectRepository.ts` - プロジェクトリポジトリのインターフェース定義

- [ ] **Step 5: インメモリリポジトリ実装**
  - `InMemoryArticleRepository.ts` - 記事のインメモリリポジトリ
  - `InMemoryProjectRepository.ts` - プロジェクトのインメモリリポジトリ

- [ ] **Step 6: 動作確認用サンプルデータ作成**
  - テスト用のサンプル記事・プロジェクトデータを作成

---

## 承認状況

- [x] 質問への回答完了
- [ ] 計画承認済み
