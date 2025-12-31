# Step 5: コンテンツ取得API設計

## 概要
MDXコンテンツを取得・処理するためのAPI設計（lib/posts.ts, lib/projects.ts）

---

## ファイル構成

```
lib/
├── posts.ts          # 記事取得API
├── projects.ts       # プロジェクト取得API
├── mdx.ts            # MDX処理共通ロジック
└── schemas/
    ├── post.ts       # 記事Frontmatterスキーマ（Step 4で定義）
    └── project.ts    # プロジェクトFrontmatterスキーマ（Step 4で定義）
```

---

## 記事取得API（lib/posts.ts）

### 関数一覧

| 関数 | 用途 | 戻り値 |
|------|------|--------|
| `getAllPosts(locale)` | 全記事取得（一覧用） | `Post[]` |
| `getPostBySlug(locale, slug)` | 記事詳細取得 | `Post \| null` |
| `getAllPostSlugs(locale)` | 全slug取得（静的生成用） | `string[]` |
| `getPostsByTag(locale, tag)` | タグで絞り込み | `Post[]` |
| `getAllTags(locale)` | 全タグ取得 | `string[]` |
| `getFeaturedPosts(locale, limit)` | ピン留め記事取得 | `Post[]` |

### 実装

```typescript
// lib/posts.ts

import { readdir, readFile, access } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { cache } from 'react'
import { postFrontmatterSchema, type PostFrontmatter } from './schemas/post'
import type { Locale } from './i18n'

export type Post = {
  slug: string
  locale: Locale
  frontmatter: PostFrontmatter
  content: string
}

const POSTS_DIR = path.join(process.cwd(), 'content/posts')
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * ディレクトリ存在チェック
 */
async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * 全記事を取得（ピン留め優先 → 日付降順）
 */
export const getAllPosts = cache(async (locale: Locale): Promise<Post[]> => {
  const postsDir = path.join(POSTS_DIR, locale)

  if (!(await exists(postsDir))) {
    return []
  }

  const files = (await readdir(postsDir)).filter(file => file.endsWith('.mdx'))

  const posts = await Promise.all(
    files.map(async file => {
      const slug = file.replace(/\.mdx$/, '')
      return getPostBySlug(locale, slug)
    })
  )

  return posts
    .filter((post): post is Post => post !== null)
    .filter(post => isDevelopment || !post.frontmatter.draft)
    .sort((a, b) => {
      // 1. ピン留め優先
      if (a.frontmatter.pinned && !b.frontmatter.pinned) return -1
      if (!a.frontmatter.pinned && b.frontmatter.pinned) return 1
      // 2. 日付降順
      return new Date(b.frontmatter.date).getTime() -
             new Date(a.frontmatter.date).getTime()
    })
})

/**
 * slugで記事を取得
 */
export const getPostBySlug = cache(
  async (locale: Locale, slug: string): Promise<Post | null> => {
    const filePath = path.join(POSTS_DIR, locale, `${slug}.mdx`)

    if (!(await exists(filePath))) {
      return null
    }

    const fileContent = await readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // Zodでバリデーション
    const result = postFrontmatterSchema.safeParse(data)

    if (!result.success) {
      console.error(`Invalid frontmatter in ${filePath}:`, result.error.format())
      throw new Error(`Invalid frontmatter in ${filePath}`)
    }

    return {
      slug,
      locale,
      frontmatter: result.data,
      content,
    }
  }
)

/**
 * 全slugを取得（generateStaticParams用）
 */
export async function getAllPostSlugs(locale: Locale): Promise<string[]> {
  const posts = await getAllPosts(locale)
  return posts.map(post => post.slug)
}

/**
 * タグで絞り込み
 */
export async function getPostsByTag(
  locale: Locale,
  tag: string
): Promise<Post[]> {
  const posts = await getAllPosts(locale)
  return posts.filter(post =>
    post.frontmatter.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * 全タグを取得（重複排除）
 */
export async function getAllTags(locale: Locale): Promise<string[]> {
  const posts = await getAllPosts(locale)
  const tags = posts.flatMap(post => post.frontmatter.tags)
  return [...new Set(tags)].sort()
}

/**
 * ピン留め記事を取得
 */
export async function getFeaturedPosts(
  locale: Locale,
  limit: number = 3
): Promise<Post[]> {
  const posts = await getAllPosts(locale)
  return posts.filter(post => post.frontmatter.pinned).slice(0, limit)
}
```

---

## プロジェクト取得API（lib/projects.ts）

### 関数一覧

| 関数 | 用途 | 戻り値 |
|------|------|--------|
| `getAllProjects(locale)` | 全プロジェクト取得 | `Project[]` |
| `getProjectBySlug(locale, slug)` | プロジェクト詳細取得 | `Project \| null` |
| `getAllProjectSlugs(locale)` | 全slug取得（静的生成用） | `string[]` |
| `getFeaturedProjects(locale, limit)` | ピン留めプロジェクト取得 | `Project[]` |

### 実装

```typescript
// lib/projects.ts

import { readdir, readFile, access } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { cache } from 'react'
import { projectFrontmatterSchema, type ProjectFrontmatter } from './schemas/project'
import type { Locale } from './i18n'

export type Project = {
  slug: string
  locale: Locale
  frontmatter: ProjectFrontmatter
  content: string
}

const PROJECTS_DIR = path.join(process.cwd(), 'content/projects')
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * ディレクトリ存在チェック
 */
async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * 全プロジェクトを取得（ピン留め優先 → 日付降順）
 */
export const getAllProjects = cache(async (locale: Locale): Promise<Project[]> => {
  const projectsDir = path.join(PROJECTS_DIR, locale)

  if (!(await exists(projectsDir))) {
    return []
  }

  const files = (await readdir(projectsDir)).filter(file => file.endsWith('.mdx'))

  const projects = await Promise.all(
    files.map(async file => {
      const slug = file.replace(/\.mdx$/, '')
      return getProjectBySlug(locale, slug)
    })
  )

  return projects
    .filter((project): project is Project => project !== null)
    .filter(project => isDevelopment || !project.frontmatter.draft)
    .sort((a, b) => {
      // 1. ピン留め優先
      if (a.frontmatter.pinned && !b.frontmatter.pinned) return -1
      if (!a.frontmatter.pinned && b.frontmatter.pinned) return 1
      // 2. 日付降順
      return new Date(b.frontmatter.date).getTime() -
             new Date(a.frontmatter.date).getTime()
    })
})

/**
 * slugでプロジェクトを取得
 */
export const getProjectBySlug = cache(
  async (locale: Locale, slug: string): Promise<Project | null> => {
    const filePath = path.join(PROJECTS_DIR, locale, `${slug}.mdx`)

    if (!(await exists(filePath))) {
      return null
    }

    const fileContent = await readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // Zodでバリデーション
    const result = projectFrontmatterSchema.safeParse(data)

    if (!result.success) {
      console.error(`Invalid frontmatter in ${filePath}:`, result.error.format())
      throw new Error(`Invalid frontmatter in ${filePath}`)
    }

    return {
      slug,
      locale,
      frontmatter: result.data,
      content,
    }
  }
)

/**
 * 全slugを取得（generateStaticParams用）
 */
export async function getAllProjectSlugs(locale: Locale): Promise<string[]> {
  const projects = await getAllProjects(locale)
  return projects.map(project => project.slug)
}

/**
 * ピン留めプロジェクトを取得（Home用）
 */
export async function getFeaturedProjects(
  locale: Locale,
  limit: number = 3
): Promise<Project[]> {
  const projects = await getAllProjects(locale)
  return projects.filter(project => project.frontmatter.pinned).slice(0, limit)
}
```

---

## MDX処理共通ロジック（lib/mdx.ts）

### 責務の分離

| 処理 | 担当 | 理由 |
|------|------|------|
| Frontmatter パース | `gray-matter` + `Zod` | バリデーション付きで型安全 |
| MDX コンパイル | `compileMDX` | 本文のみ処理 |

**重要**: `getPostBySlug()` で frontmatter を分離済みなので、`renderMdx()` には**本文のみ**渡す。
`parseFrontmatter: false` にしないと無駄なパースが発生する。

```typescript
// lib/mdx.ts

import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { mdxComponents } from '@/components/mdx'

/**
 * MDX本文をコンパイルしてReactコンポーネントに変換
 * ※ frontmatter は gray-matter で事前に分離済みのため、ここでは処理しない
 */
export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,  // frontmatter は既に分離済み
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeHighlight],
      },
    },
    components: mdxComponents,
  })

  return content
}
```

---

## ページでの使用例

### 記事一覧ページ

```typescript
// app/[lang]/blog/page.tsx

import { getAllPosts } from '@/lib/posts'
import { PostList } from '@/components/blog/post-list'
import type { Locale } from '@/lib/i18n'

type Props = {
  params: { lang: Locale }
}

export default async function BlogPage({ params }: Props) {
  const posts = await getAllPosts(params.lang)

  return (
    <main>
      <h1>Blog</h1>
      <PostList posts={posts} />
    </main>
  )
}

// 静的生成
export function generateStaticParams() {
  return [{ lang: 'ja' }, { lang: 'en' }]
}
```

### 記事詳細ページ

```typescript
// app/[lang]/blog/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts'
import { renderMdx } from '@/lib/mdx'
import type { Locale } from '@/lib/i18n'

type Props = {
  params: { lang: Locale; slug: string }
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.lang, params.slug)

  if (!post) {
    notFound()
  }

  // frontmatter は getPostBySlug で取得済み、本文のみ renderMdx に渡す
  const content = await renderMdx(post.content)

  return (
    <article>
      <h1>{post.frontmatter.title}</h1>
      <time>{post.frontmatter.date}</time>
      <div className="prose">{content}</div>
    </article>
  )
}

// 静的生成
export async function generateStaticParams() {
  const locales: Locale[] = ['ja', 'en']

  const params = await Promise.all(
    locales.map(async locale => {
      const slugs = await getAllPostSlugs(locale)
      return slugs.map(slug => ({ lang: locale, slug }))
    })
  )

  return params.flat()
}
```

### Homeページ（Featured Projects）

```typescript
// app/[lang]/page.tsx

import { getFeaturedProjects } from '@/lib/projects'
import { FeaturedProjects } from '@/components/home/featured-projects'
import type { Locale } from '@/lib/i18n'

type Props = {
  params: { lang: Locale }
}

export default async function HomePage({ params }: Props) {
  const featuredProjects = await getFeaturedProjects(params.lang, 3)

  return (
    <main>
      <section>
        <h1>Welcome</h1>
      </section>
      <FeaturedProjects projects={featuredProjects} />
    </main>
  )
}
```

---

## キャッシュ戦略

### React `cache()` の活用

```typescript
import { cache } from 'react'

export const getAllPosts = cache(async (locale: Locale) => {
  // 同一リクエスト内で複数回呼ばれても、1回のみ実行
  // ...
})
```

| 場所 | キャッシュ | 備考 |
|------|-----------|------|
| 同一リクエスト内 | ✅ `cache()` で自動 | Header, Main, Footer で同じデータを使用可能 |
| ビルド時 | ✅ SSG で静的生成 | `generateStaticParams` で全ページ事前生成 |
| ISR | 不使用 | 完全SSGのため不要 |

### なぜ `cache()` が必要か

```typescript
// app/[lang]/layout.tsx
const posts = await getAllPosts(locale)  // 1回目: 実行

// app/[lang]/page.tsx
const posts = await getAllPosts(locale)  // 2回目: キャッシュから取得

// Header component
const posts = await getAllPosts(locale)  // 3回目: キャッシュから取得
```

---

## エラーハンドリング

### ファイル不存在

```typescript
export const getPostBySlug = cache(
  async (locale: Locale, slug: string): Promise<Post | null> => {
    const filePath = path.join(POSTS_DIR, locale, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return null  // 呼び出し側で notFound() を呼ぶ
    }
    // ...
  }
)
```

### バリデーションエラー

```typescript
const result = postFrontmatterSchema.safeParse(data)

if (!result.success) {
  // 開発時: 詳細エラーをコンソール出力
  console.error(`Invalid frontmatter in ${filePath}:`, result.error.format())
  // ビルド時: エラーを投げてビルド失敗
  throw new Error(`Invalid frontmatter in ${filePath}`)
}
```

### ページでのハンドリング

```typescript
// app/[lang]/blog/[slug]/page.tsx

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.lang, params.slug)

  if (!post) {
    notFound()  // Next.js の 404 ページへ
  }

  // ...
}
```

---

## 型安全性

### Zod から型を導出

```typescript
// lib/schemas/post.ts
export const postFrontmatterSchema = z.object({ ... })
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>

// lib/posts.ts
import type { PostFrontmatter } from './schemas/post'

export type Post = {
  slug: string
  locale: Locale
  frontmatter: PostFrontmatter  // Zodスキーマから導出
  content: string
}
```

### ページでの型推論

```typescript
// 型は自動推論される
const posts = await getAllPosts('ja')
// posts: Post[]

posts[0].frontmatter.title  // string
posts[0].frontmatter.tags   // string[]
posts[0].frontmatter.draft  // boolean
```

---

## レビュー結果

| ポイント | 結果 | 対応 |
|---------|------|------|
| Frontmatter 二重パース | 🟡 修正済み | `renderMdx()` で `parseFrontmatter: false` に変更 |
| 同期I/O の使用 | 🟡 修正済み | `fs/promises` に変更、async `exists()` ヘルパー追加 |

---

**ステータス**: ✅ 承認済み
