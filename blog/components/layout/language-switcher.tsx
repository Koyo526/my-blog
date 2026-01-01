'use client'

// components/layout/language-switcher.tsx
// 言語切替ボタン

import { usePathname, useRouter } from 'next/navigation'
import { locales, getLocaleName, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[1] as Locale

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return

    // Replace the locale in the pathname
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')

    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={cn(
            'px-2 py-1 text-sm rounded-md transition-colors focus-ring',
            currentLocale === locale
              ? 'bg-foreground text-background'
              : 'hover:bg-background-secondary'
          )}
          aria-label={`Switch to ${getLocaleName(locale)}`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
