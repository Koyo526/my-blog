// components/about/timeline/timeline-item.tsx
// タイムラインの個別エントリ

'use client'

import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { TimelineEntry } from '@/types/about'
import { TimelineDot } from './timeline-dot'

type TimelineItemProps = {
  entry: TimelineEntry
  index: number
}

export function TimelineItem({ entry, index }: TimelineItemProps) {
  const locale = useLocale() as 'ja' | 'en'
  const t = useTranslations('about')

  const formatPeriod = () => {
    const start = entry.period.start
    const end = entry.period.end || t('timeline.present')
    return `${start} - ${end}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* タイムライン線 */}
      <div className="absolute left-[5px] top-0 bottom-0 w-px bg-border last:hidden" />

      {/* ドット */}
      <div className="absolute left-0 top-1">
        <TimelineDot type={entry.type} isCurrent={entry.isCurrent} />
      </div>

      {/* コンテンツ */}
      <div className="bg-card border border-border rounded-lg p-4 hover:border-border-hover transition-colors">
        {/* 期間 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-foreground-muted">{formatPeriod()}</span>
          {entry.isCurrent && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-timeline-current/20 text-timeline-current font-medium">
              {t('timeline.current')}
            </span>
          )}
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-semibold mb-1">{entry.title[locale]}</h3>

        {/* 組織名 */}
        <p className="text-foreground-muted mb-2">{entry.organization[locale]}</p>

        {/* 説明 */}
        {entry.description && (
          <p className="text-sm text-foreground-muted mb-3">
            {entry.description[locale]}
          </p>
        )}

        {/* タグ */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-background-secondary text-foreground-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
