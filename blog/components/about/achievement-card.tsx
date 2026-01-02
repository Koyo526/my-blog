// components/about/achievement-card.tsx
// 資格・受賞カード

'use client'

import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { Achievement } from '@/types/about'

type AchievementCardProps = {
  achievement: Achievement
  index: number
}

function CertificationIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  )
}

export function AchievementCard({ achievement, index }: AchievementCardProps) {
  const locale = useLocale() as 'ja' | 'en'
  const t = useTranslations('about')

  const Icon = achievement.type === 'certification' ? CertificationIcon : AwardIcon
  const iconColor =
    achievement.type === 'certification'
      ? 'text-timeline-work'
      : 'text-timeline-current'

  const cardClasses =
    'p-4 rounded-lg border border-border bg-card hover:border-border-hover transition-colors'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className={cardClasses}>
        {/* アイコン */}
        <div className={`${iconColor} mb-3`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* 名称 */}
        <h3 className="font-semibold mb-1">{achievement.name[locale]}</h3>

        {/* 発行元 */}
        <p className="text-sm text-foreground-muted mb-2">
          {achievement.issuer[locale]}
        </p>

        {/* 日付 */}
        <p className="text-xs text-foreground-muted mb-3">{achievement.date}</p>

        {/* 認証情報リンク */}
        {achievement.url && (
          <a
            href={achievement.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            {t('achievements.viewCredential')}
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  )
}
