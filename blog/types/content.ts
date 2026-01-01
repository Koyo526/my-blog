// types/content.ts
// コンテンツの型定義

import type { Locale } from '@/lib/i18n'

// ブログ記事のFrontmatter
export interface PostFrontmatter {
  title: string
  summary: string
  publishedAt: string
  updatedAt?: string
  tags: string[]
  draft?: boolean
  pinned?: boolean
}

// プロジェクトのFrontmatter
export interface ProjectFrontmatter {
  name: string
  summary: string
  tech: string[]
  publishedAt: string
  updatedAt?: string
  github?: string
  url?: string
  featured?: boolean
  draft?: boolean
  pinned?: boolean
}

// 記事データ（Frontmatter + メタデータ）
export interface Post {
  slug: string
  locale: Locale
  frontmatter: PostFrontmatter
  content: string
  readingTime: number
}

// プロジェクトデータ
export interface Project {
  slug: string
  locale: Locale
  frontmatter: ProjectFrontmatter
  content: string
}

// MDXコンパイル結果
export interface MDXContent {
  code: string
  frontmatter: Record<string, unknown>
}
