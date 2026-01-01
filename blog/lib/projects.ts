// lib/projects.ts
// プロジェクトの取得API

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { validateProjectFrontmatter } from './schemas/project'
import { env } from './env'
import type { Locale } from './i18n'
import type { Project } from '@/types/content'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')

/**
 * 全プロジェクトを取得（ソート済み）
 */
export async function getAllProjects(locale: Locale): Promise<Project[]> {
  const dir = path.join(CONTENT_DIR, locale)

  if (!fs.existsSync(dir)) {
    return []
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))

  const projects = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const filePath = path.join(dir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const frontmatter = validateProjectFrontmatter(data)

    return {
      slug,
      locale,
      frontmatter,
      content,
    }
  })

  // draft を除外（開発環境以外）
  const filtered = projects.filter((project) => {
    if (env.isDevelopment) return true
    return !project.frontmatter.draft
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
 * スラッグからプロジェクトを取得
 */
export async function getProjectBySlug(
  locale: Locale,
  slug: string
): Promise<Project | null> {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
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
