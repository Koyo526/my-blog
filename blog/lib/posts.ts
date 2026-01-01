// lib/posts.ts
// ブログ記事の取得API

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { validatePostFrontmatter } from './schemas/post'
import { calculateReadingTime } from './utils'
import { env } from './env'
import type { Locale } from './i18n'
import type { Post } from '@/types/content'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

/**
 * 全記事を取得（ソート済み）
 */
export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const dir = path.join(CONTENT_DIR, locale)

  if (!fs.existsSync(dir)) {
    return []
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const filePath = path.join(dir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const frontmatter = validatePostFrontmatter(data)
    const readingTime = calculateReadingTime(content, locale)

    return {
      slug,
      locale,
      frontmatter,
      content,
      readingTime,
    }
  })

  // draft を除外（開発環境以外）
  const filtered = posts.filter((post) => {
    if (env.isDevelopment) return true
    return !post.frontmatter.draft
  })

  // ソート: pinned優先 → 日付降順
  return filtered.sort((a, b) => {
    if (a.frontmatter.pinned && !b.frontmatter.pinned) return -1
    if (!a.frontmatter.pinned && b.frontmatter.pinned) return 1
    return (
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
    )
  })
}

/**
 * スラッグから記事を取得
 */
export async function getPostBySlug(
  locale: Locale,
  slug: string
): Promise<Post | null> {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  const frontmatter = validatePostFrontmatter(data)
  const readingTime = calculateReadingTime(content, locale)

  // draft は開発環境以外で非表示
  if (frontmatter.draft && !env.isDevelopment) {
    return null
  }

  return {
    slug,
    locale,
    frontmatter,
    content,
    readingTime,
  }
}

/**
 * 全スラッグを取得（generateStaticParams用）
 */
export async function getAllPostSlugs(locale: Locale): Promise<string[]> {
  const posts = await getAllPosts(locale)
  return posts.map((post) => post.slug)
}

/**
 * タグで記事をフィルタ
 */
export async function getPostsByTag(
  locale: Locale,
  tag: string
): Promise<Post[]> {
  const posts = await getAllPosts(locale)
  return posts.filter((post) =>
    post.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * 全タグを取得
 */
export async function getAllTags(locale: Locale): Promise<string[]> {
  const posts = await getAllPosts(locale)
  const tags = new Set<string>()

  posts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => tags.add(tag))
  })

  return Array.from(tags).sort()
}
