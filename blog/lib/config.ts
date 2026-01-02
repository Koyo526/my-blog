// lib/config.ts
// サイト全体の設定

import { env } from './env'

export const siteConfig = {
  siteName: 'Portfolio',
  siteUrl: env.siteUrl,
  description: 'Portfolio & Blog',
  author: {
    name: 'Koyo Murakata',
    email: '',
    twitter: 'yourhandle',
    github: 'yourgithub',
  },
  ogImage: `${env.siteUrl}/og-default.png`,
  links: {
    github: 'https://github.com/Koyo526',
    twitter: 'https://x.com/Momiji_koyo_51',
    linkedin: 'https://www.linkedin.com/in/koyo-murakata-03b489241/',
  },
} as const

export type SiteConfig = typeof siteConfig
