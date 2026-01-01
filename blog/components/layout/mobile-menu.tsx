'use client'

// components/layout/mobile-menu.tsx
// モバイルメニュー

import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  labelKey: 'home' | 'projects' | 'blog' | 'about' | 'contact'
}

const navItems: NavItem[] = [
  { href: '', labelKey: 'home' },
  { href: '/projects', labelKey: 'projects' },
  { href: '/blog', labelKey: 'blog' },
  { href: '/about', labelKey: 'about' },
  { href: '/contact', labelKey: 'contact' },
]

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="md:hidden">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-border-hover transition-colors focus-ring"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          // X icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          // Menu icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => {
              const fullHref = `/${lang}${item.href}/`
              const active = isActive(item.href)

              return (
                <Link
                  key={item.labelKey}
                  href={fullHref}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-4 py-3 text-base rounded-lg transition-colors',
                    active
                      ? 'bg-background-secondary text-foreground font-medium'
                      : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
