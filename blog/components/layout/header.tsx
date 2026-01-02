'use client'

// components/layout/header.tsx
// サイトヘッダー

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Container } from '@/components/common/container'
import { Navigation } from './navigation'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from './language-switcher'
import { MobileMenu } from './mobile-menu'

export function Header() {
  const params = useParams()
  const lang = params.lang as string

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${lang}/`}
            className="text-xl font-bold hover:opacity-80 transition-opacity focus-ring rounded"
          >
            Momiji.dev🍁
          </Link>

          {/* Desktop Navigation */}
          <Navigation />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  )
}
