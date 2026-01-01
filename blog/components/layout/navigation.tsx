'use client'

// components/layout/navigation.tsx
// デスクトップナビゲーション

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  labelKey: 'home' | 'projects' | 'blog' | 'about'
}

const navItems: NavItem[] = [
  { href: '', labelKey: 'home' },
  { href: '/projects', labelKey: 'projects' },
  { href: '/blog', labelKey: 'blog' },
  { href: '/about', labelKey: 'about' },
]

export function Navigation() {
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations('nav')
  const lang = params.lang as string

  const isActive = (href: string) => {
    const fullPath = `/${lang}${href}`
    if (href === '') {
      return pathname === `/${lang}` || pathname === `/${lang}/`
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const fullHref = `/${lang}${item.href}/`
        const active = isActive(item.href)

        return (
          <Link
            key={item.labelKey}
            href={fullHref}
            className={cn(
              'px-3 py-2 text-sm rounded-lg transition-colors focus-ring',
              active
                ? 'text-foreground font-medium'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            {t(item.labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
