// lib/projects.ts
// プロジェクトの取得API

import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { validateProjectFrontmatter } from './schemas/project'
import { env } from './env'
import type { Locale } from './i18n'
import type { Project } from '@/types/content'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')

// モジュールレベルキャッシュ: サーバーインスタンス内で再利用
const projectsCache = new Map<Locale, { data: Project[]; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1分（ISRと組み合わせて使用）

/**
 * 全プロジェクトを取得（ソート済み、キャッシュ付き）
 */
export async function getAllProjects(locale: Locale): Promise<Project[]> {
  // キャッシュチェック（本番環境のみ）
  if (!env.isDevelopment) {
    const cached = projectsCache.get(locale)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
  }

  const dir = path.join(CONTENT_DIR, locale)

  // ディレクトリ存在チェック（非同期）
  try {
    await fs.access(dir)
  } catch {
    return []
  }

  // ファイル一覧取得（非同期）
  const allFiles = await fs.readdir(dir)
  const files = allFiles.filter((f) => f.endsWith('.mdx'))

  // ファイル読み込み（並列非同期）
  const projectPromises = files.map(async (file) => {
    const slug = file.replace(/\.mdx$/, '')
    const filePath = path.join(dir, file)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const frontmatter = validateProjectFrontmatter(data)

    return {
      slug,
      locale,
      frontmatter,
      content,
    }
  })

  const projects = await Promise.all(projectPromises)

  // draft を除外（開発環境以外）
  const filtered = projects.filter((project) => {
    if (env.isDevelopment) return true
    return !project.frontmatter.draft
  })

  // ソート: pinned優先 → 日付降順
  const sorted = filtered.sort((a, b) => {
    if (a.frontmatter.pinned && !b.frontmatter.pinned) return -1
    if (!a.frontmatter.pinned && b.frontmatter.pinned) return 1
    return (
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
    )
  })

  // キャッシュに保存（本番環境のみ）
  if (!env.isDevelopment) {
    projectsCache.set(locale, { data: sorted, timestamp: Date.now() })
  }

  return sorted
}

/**
 * スラッグからプロジェクトを取得
 */
export async function getProjectBySlug(
  locale: Locale,
  slug: string
): Promise<Project | null> {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)

  // ファイル存在チェック（非同期）
  try {
    await fs.access(filePath)
  } catch {
    return null
  }

  const fileContent = await fs.readFile(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  const frontmatter = validateProjectFrontmatter(data)

  // draft は開発環境以外で非表示
  if (frontmatter.draft && !env.isDevelopment) {
    return null
  }

  return {
    slug,
    locale,
    frontmatter,
    content,
  }
}

/**
 * 全スラッグを取得（generateStaticParams用）
 */
export async function getAllProjectSlugs(locale: Locale): Promise<string[]> {
  const projects = await getAllProjects(locale)
  return projects.map((project) => project.slug)
}

/**
 * Featured プロジェクトを取得
 */
export async function getFeaturedProjects(
  locale: Locale,
  limit?: number
): Promise<Project[]> {
  const projects = await getAllProjects(locale)
  const featured = projects.filter((project) => project.frontmatter.featured)
  return limit ? featured.slice(0, limit) : featured
}
