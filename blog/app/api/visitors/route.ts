// app/api/visitors/route.ts
// 訪問者カウントAPI

import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const VISITOR_COUNT_KEY = 'visitor_count'
const SESSION_COOKIE_NAME = 'visitor_session'
const SESSION_DURATION = 30 * 60 * 1000 // 30分

/**
 * GET: 現在の訪問者数を取得
 */
export async function GET() {
  try {
    const count = await kv.get<number>(VISITOR_COUNT_KEY)
    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    console.error('Failed to get visitor count:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}

/**
 * POST: 訪問者数をインクリメント（セッションベース）
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    // セッションが存在する場合はカウントしない
    if (sessionCookie) {
      const count = await kv.get<number>(VISITOR_COUNT_KEY)
      return NextResponse.json({ count: count ?? 0, incremented: false })
    }

    // カウントをインクリメント
    const newCount = await kv.incr(VISITOR_COUNT_KEY)

    // セッションCookieを設定
    const response = NextResponse.json({ count: newCount, incremented: true })
    response.cookies.set(SESSION_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // 秒単位
    })

    return response
  } catch (error) {
    console.error('Failed to increment visitor count:', error)
    return NextResponse.json({ count: 0, incremented: false }, { status: 500 })
  }
}
