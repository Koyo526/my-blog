// components/about/timeline/timeline.tsx
// タイムラインメインコンポーネント

'use client'

import { useTranslations } from 'next-intl'
import type { TimelineEntry } from '@/types/about'
import { TimelineItem } from './timeline-item'

type TimelineProps = {
  entries: TimelineEntry[]
}

export function Timeline({ entries }: TimelineProps) {
  const t = useTranslations('about')

  // 新しい順にソート（start日付で比較）
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = a.period.start.replace('.', '')
    const dateB = b.period.start.replace('.', '')
    return dateB.localeCompare(dateA)
  })

  return (
    <section className="py-12">
      {/* セクションヘッダー */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('timeline.title')}</h2>
        <p className="text-foreground-muted">{t('timeline.subtitle')}</p>
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-timeline-work" />
          <span className="text-foreground-muted">{t('timeline.work')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-timeline-education" />
          <span className="text-foreground-muted">{t('timeline.education')}</span>
        </div>
      </div>

      {/* タイムライン */}
      <div className="relative">
        {sortedEntries.map((entry, index) => (
          <TimelineItem key={entry.id} entry={entry} index={index} />
        ))}
      </div>
    </section>
  )
}
