// lib/utils.ts
// ユーティリティ関数

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS クラスをマージするユーティリティ
 * clsx でクラスを結合し、tailwind-merge で重複を解決
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 日付をフォーマット
 */
export function formatDate(date: string | Date, locale: string = 'ja'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 読了時間を計算（日本語対応）
 */
export function calculateReadingTime(content: string, locale: string = 'ja'): number {
  // 日本語: 約400-600文字/分、英語: 約200-250語/分
  const wordsPerMinute = locale === 'ja' ? 500 : 225
  const wordCount = locale === 'ja'
    ? content.length
    : content.split(/\s+/).length

  return Math.ceil(wordCount / wordsPerMinute)
}
