// lib/config.ts
// サイト全体の設定

import { env } from './env'

export const siteConfig = {
  siteName: 'Portfolio',
  siteUrl: env.siteUrl,
  description: 'Portfolio & Blog',
  author: {
    name: 'Your Name',
    email: 'your@email.com',
    twitter: 'yourhandle',
    github: 'yourgithub',
  },
  ogImage: `${env.siteUrl}/og-default.png`,
  links: {
    github: 'https://github.com/yourgithub',
    twitter: 'https://twitter.com/yourhandle',
  },
} as const

export type SiteConfig = typeof siteConfig
