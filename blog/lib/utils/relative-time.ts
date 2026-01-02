// lib/utils/relative-time.ts
// 相対時間表示ユーティリティ（Intl.RelativeTimeFormat 使用）

type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

interface TimeInterval {
  unit: TimeUnit
  seconds: number
}

const TIME_INTERVALS: TimeInterval[] = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'week', seconds: 604800 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
]

/**
 * 相対時間を計算して表示用文字列を返す
 * @param date - 対象の日時
 * @param lang - 言語コード ('ja' | 'en')
 * @returns 相対時間の文字列（例：「5分前」「2 hours ago」）
 */
export function getRelativeTime(date: Date | string, lang: 'ja' | 'en' = 'ja'): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  // 未来の日付の場合
  if (diffInSeconds < 0) {
    return lang === 'ja' ? 'たった今' : 'just now'
  }

  // たった今（10秒以内）
  if (diffInSeconds < 10) {
    return lang === 'ja' ? 'たった今' : 'just now'
  }

  const formatter = new Intl.RelativeTimeFormat(lang, {
    numeric: 'auto',
    style: 'long',
  })

  for (const interval of TIME_INTERVALS) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count >= 1) {
      return formatter.format(-count, interval.unit)
    }
  }

  return lang === 'ja' ? 'たった今' : 'just now'
}
