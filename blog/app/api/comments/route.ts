// app/api/comments/route.ts
// コメント API（GET: 一覧取得、POST: 新規投稿）

import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { COMMENT_LIMITS, type Comment } from '@/lib/db/schema'
import { checkRateLimit } from '@/lib/utils/rate-limit'

/**
 * GET: コメント一覧を取得（最新10件）
 */
export async function GET() {
  try {
    const result = await sql<Comment>`
      SELECT id, name, content, created_at
      FROM comments
      ORDER BY created_at DESC
      LIMIT ${COMMENT_LIMITS.DISPLAY_LIMIT}
    `

    const response = NextResponse.json({ comments: result.rows })
    // stale-while-revalidate: 60秒キャッシュ、その後300秒間はstaleを返しつつバックグラウンド更新
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
    return response
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * POST: 新規コメントを投稿
 */
export async function POST(request: Request) {
  try {
    // IP アドレス取得
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      'unknown'

    // レート制限チェック
    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, content, honeypot } = body

    // Honeypot チェック（ボット対策）
    if (honeypot) {
      // ボットと判断、静かに成功を返す
      return NextResponse.json({ success: true, id: -1 })
    }

    // 入力の正規化
    const trimmedName = (name || '').trim()
    const trimmedContent = (content || '').trim()

    // バリデーション
    if (!trimmedContent) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > COMMENT_LIMITS.CONTENT_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Content must be ${COMMENT_LIMITS.CONTENT_MAX_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    if (trimmedName.length > COMMENT_LIMITS.NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${COMMENT_LIMITS.NAME_MAX_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    // URL スパム対策
    if (trimmedContent.includes('http://') || trimmedContent.includes('https://')) {
      return NextResponse.json(
        { error: 'URLs are not allowed in comments' },
        { status: 400 }
      )
    }

    // 名前のデフォルト値
    const finalName = trimmedName || COMMENT_LIMITS.DEFAULT_NAME

    // コメント挿入
    const result = await sql`
      INSERT INTO comments (name, content)
      VALUES (${finalName}, ${trimmedContent})
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
