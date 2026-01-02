// components/about/achievement-section.tsx
// 資格・受賞セクション

'use client'

import { useTranslations } from 'next-intl'
import type { Achievement } from '@/types/about'
import { AchievementCard } from './achievement-card'

type AchievementSectionProps = {
  achievements: Achievement[]
}

export function AchievementSection({ achievements }: AchievementSectionProps) {
  const t = useTranslations('about')

  // 日付順にソート（新しい順）
  const sortedAchievements = [...achievements].sort((a, b) => {
    const dateA = a.date.replace('.', '')
    const dateB = b.date.replace('.', '')
    return dateB.localeCompare(dateA)
  })

  if (achievements.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      {/* セクションヘッダー */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('achievements.title')}</h2>
        <p className="text-foreground-muted">{t('achievements.subtitle')}</p>
      </div>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAchievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
