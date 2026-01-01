// lib/json-ld.ts
// JSON-LD 構造化データ

import { siteConfig } from './config'
import type { Post, Project } from '@/types/content'
import type { Locale } from './i18n'

export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.siteUrl,
    sameAs: [siteConfig.links.github, siteConfig.links.twitter],
  }
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    description: siteConfig.description,
    author: generatePersonJsonLd(),
  }
}

export function generateBlogPostJsonLd(post: Post, locale: Locale) {
  const url = `${siteConfig.siteUrl}/${locale}/blog/${post.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.summary,
    datePublished: post.frontmatter.publishedAt,
    dateModified: post.frontmatter.updatedAt || post.frontmatter.publishedAt,
    author: generatePersonJsonLd(),
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.frontmatter.tags?.join(', '),
  }
}

export function generateProjectJsonLd(project: Project, locale: Locale) {
  const url = `${siteConfig.siteUrl}/${locale}/projects/${project.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.frontmatter.name,
    description: project.frontmatter.summary,
    dateCreated: project.frontmatter.publishedAt,
    author: generatePersonJsonLd(),
    url,
    ...(project.frontmatter.url && { mainEntityOfPage: project.frontmatter.url }),
  }
}
