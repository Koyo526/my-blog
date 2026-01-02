// lib/utils/rate-limit.ts
// レート制限ユーティリティ（Vercel KV 使用）

import { kv } from '@vercel/kv'

const RATE_LIMIT_WINDOW = 30 // 秒
const RATE_LIMIT_PREFIX = 'rate_limit:'

/**
 * IP アドレスに基づくレート制限チェック
 * @param ip - クライアントの IP アドレス
 * @returns { allowed: boolean, retryAfter?: number }
 */
export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `${RATE_LIMIT_PREFIX}${ip}`

  try {
    const lastRequest = await kv.get<number>(key)

    if (lastRequest) {
      const elapsed = Math.floor(Date.now() / 1000) - lastRequest
      if (elapsed < RATE_LIMIT_WINDOW) {
        return {
          allowed: false,
          retryAfter: RATE_LIMIT_WINDOW - elapsed,
        }
      }
    }

    // 新しいタイムスタンプを設定
    await kv.set(key, Math.floor(Date.now() / 1000), {
      ex: RATE_LIMIT_WINDOW,
    })

    return { allowed: true }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // KV エラー時は許可（サービス継続性を優先）
    return { allowed: true }
  }
}
