// types/about.ts
// About ページの型定義

export type TimelineEntryType = 'work' | 'education'

export interface TimelineEntry {
  id: string
  type: TimelineEntryType
  title: { ja: string; en: string }
  organization: { ja: string; en: string }
  period: {
    start: string // "YYYY.MM"
    end?: string // 省略時は「現在」
  }
  description?: { ja: string; en: string }
  tags?: string[]
  isCurrent?: boolean
}

export type AchievementType = 'certification' | 'award'

export interface Achievement {
  id: string
  type: AchievementType
  name: { ja: string; en: string }
  issuer: { ja: string; en: string }
  date: string // "YYYY.MM"
  url?: string
}
