# パフォーマンス改善計画

## 現状の問題

| 指標 | 現在値 | 目標値 | 状態 |
|------|--------|--------|------|
| TTFB | 3.94s | < 0.8s | Poor |
| FCP | 5.16s | < 1.8s | Poor |
| LCP | 5.43s | < 2.5s | Poor |

---

## 問題分析サマリー

| 問題 | 深刻度 | 影響 | 推定遅延 |
|------|--------|------|----------|
| `getFeaturedProjects()` の同期ファイルI/O | CRITICAL | TTFB | 500-1500ms |
| VisitorCount のクライアントサイドfetch | HIGH | FCP/LCP | 200-300ms |
| Board のクライアントサイドfetch | HIGH | FCP/LCP | 200-300ms |
| Comments API のキャッシュ無効化 | HIGH | サーバー遅延 | 100-200ms |
| Framer Motion アニメーション | MEDIUM | LCP | 100-300ms |
| Suspense境界なし | MEDIUM | 体感速度 | 連鎖的遅延 |

---

## 改善ステップ

### Step 1: ISR（増分静的再生成）の導入

ホームページを毎リクエストでサーバーレンダリングする代わりに、静的生成してキャッシュする。

- [x] 1.1 `app/[lang]/page.tsx` に `revalidate` を追加

[Question] キャッシュの有効期間をどのくらいに設定しますか？

- A) 60秒（リアルタイム性を重視）
- B) 300秒（5分、バランス型）
- C) 3600秒（1時間、パフォーマンス重視）
- D) その他（具体的に指定）

[Answer]
- B) 300秒（5分、バランス型）
---

### Step 2: Comments API のキャッシュ設定

現在 `Cache-Control: no-store` が設定されており、毎回DBクエリが実行されている。

- [x] 2.1 `app/api/comments/route.ts` の Cache-Control ヘッダーを変更

[Question] コメント一覧のキャッシュ戦略をどうしますか？

- A) `public, max-age=60`（1分キャッシュ、新着コメントが1分遅れで反映）
- B) `public, max-age=300`（5分キャッシュ、パフォーマンス重視）
- C) `no-store` を維持（リアルタイム性を優先、パフォーマンスは改善しない）
- D) `stale-while-revalidate` パターン（バックグラウンドで更新）

[Answer]
- Answer: D) stale-while-revalidate（推奨）

「新着が多少遅れてもOK」＋「DB負荷下げたい」の両立が一番しやすい。

ただし後述の通り、HTTPヘッダーだけで狙い通りに効かないケースがあるので、Nextの fetch キャッシュ設計もセットで。
---

### Step 3: VisitorCount と Board の最適化

現在、両コンポーネントがマウント時に即座にAPIを呼び出しており、FCP/LCPを遅延させている。

- [x] 3.1 VisitorCount を遅延ロード化
- [x] 3.2 Board を遅延ロード化
- [x] 3.3 Suspense 境界とスケルトンUIを追加

[Question] 遅延ロードの方法を選択してください：

- A) `dynamic()` で遅延インポート（シンプル）
- B) Suspense + React Server Components でストリーミング（高度だが効果的）
- C) 両方を組み合わせる

[Answer]
- C) 両方を組み合わせる
---

### Step 4: プロジェクトデータの取得最適化

`getFeaturedProjects()` が同期ファイルI/O（`fs.readFileSync`）を使用しており、TTFBを大幅に遅延させている。

- [x] 4.1 ファイル読み込みを非同期化（`fs.promises`）
- [x] 4.2 モジュールレベルキャッシュを追加（TTL: 1分）

[Question] プロジェクトデータの最適化方法を選択してください：

- A) 非同期ファイルI/Oに変更（最小限の変更）
- B) ビルド時に静的JSONを生成（効果的だが追加スクリプトが必要）
- C) 両方実施

[Answer]
- C) 両方実施
さらに「ビルド時JSON化」or「モジュールキャッシュ」までやるとTTFBが安定する
---

### Step 5: Framer Motion アニメーションの最適化

複数のアニメーションがLCPを遅延させている可能性がある。

- [x] 5.1 初期レンダリング時のアニメーションを簡素化（duration/delay削減）
- [x] 5.2 Hero、StaggerContainer のdelay削減

[Question] アニメーション最適化のアプローチを選択してください：

- A) 初期ロード時のアニメーションを無効化（パフォーマンス重視）
- B) アニメーション遅延（delay）を削減（バランス型）
- C) 現状維持（見た目を優先）

[Answer]
- B) アニメーション遅延（delay）を削減（バランス型）

---

### Step 6: 画像最適化

現在、画像最適化設定がコメントアウトされている。

- [x] 6.1 `next/image` の設定を確認・最適化（現状で問題なし）
- [x] 6.2 LCP要素の確認（LCPはテキスト、画像なし）

[Question] 外部画像ホスティングを使用していますか？

- A) はい（どのドメイン？）
- B) いいえ（ローカル画像のみ）

[Answer]
- B) いいえ（ローカル画像のみ）
---

### Step 7: バンドルサイズの最適化

- [x] 7.1 `@next/bundle-analyzer` でバンドル分析
- [x] 7.2 バンドル確認（合計~800KB、適切に分割済み）

[Question] バンドル分析を実行しますか？

- A) はい、詳細な分析を実施
- B) いいえ、スキップ

[Answer]
- A) はい、詳細な分析を実施
---

### Step 8: 最終確認とデプロイ

- [ ] 8.1 ローカルでLighthouseテストを実行
- [ ] 8.2 本番環境にデプロイ
- [ ] 8.3 Vercelダッシュボードでパフォーマンス指標を確認

---

## ファイル変更予定

| ファイル | 操作 | 内容 |
|----------|------|------|
| `app/[lang]/page.tsx` | 更新 | ISR設定、Suspense追加 |
| `app/api/comments/route.ts` | 更新 | キャッシュヘッダー変更 |
| `components/home/visitor-count.tsx` | 更新 | 遅延ロード対応 |
| `components/home/board/board.tsx` | 更新 | 遅延ロード対応 |
| `lib/projects.ts` | 更新 | 非同期I/O化 |
| `next.config.ts` | 更新 | 画像最適化設定 |

---

## ステータス

- [ ] 計画レビュー完了
- [ ] 実装完了
- [ ] デプロイ完了
- [ ] パフォーマンス改善確認
