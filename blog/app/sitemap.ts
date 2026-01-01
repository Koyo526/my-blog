// app/sitemap.ts
// サイトマップ生成

import type { MetadataRoute } from 'next'
import { locales, type Locale } from '@/lib/i18n'
import { getAllPosts } from '@/lib/posts'
import { getAllProjects } from '@/lib/projects'
import { siteConfig } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl

  // 静的ページ
  const staticPages = ['', '/about', '/contact', '/blog', '/projects']

  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  // ブログ記事
  const blogEntries = await Promise.all(
    locales.map(async (locale: Locale) => {
      const posts = await getAllPosts(locale)
      return posts.map((post) => ({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(
          post.frontmatter.updatedAt || post.frontmatter.publishedAt
        ),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    })
  )

  // プロジェクト
  const projectEntries = await Promise.all(
    locales.map(async (locale: Locale) => {
      const projects = await getAllProjects(locale)
      return projects.map((project) => ({
        url: `${baseUrl}/${locale}/projects/${project.slug}`,
        lastModified: new Date(project.frontmatter.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    })
  )

  return [
    ...staticEntries,
    ...blogEntries.flat(),
    ...projectEntries.flat(),
  ]
}
