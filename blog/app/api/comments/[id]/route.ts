// app/api/comments/[id]/route.ts
// コメント削除 API（管理者のみ）

import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { timingSafeEqual } from 'crypto'

/**
 * タイミング攻撃対策の文字列比較
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) {
      return false
    }
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * DELETE: コメントを削除（管理者のみ）
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const headersList = await headers()

  // Origin チェック
  const origin = headersList.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
  ].filter(Boolean)

  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  // ADMIN_SECRET チェック（タイミング攻撃対策）
  const adminSecret = headersList.get('x-admin-secret')
  const expectedSecret = process.env.ADMIN_SECRET

  if (!adminSecret || !expectedSecret || !safeCompare(adminSecret, expectedSecret)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ID のバリデーション
  const commentId = parseInt(id, 10)
  if (isNaN(commentId) || commentId <= 0) {
    return NextResponse.json(
      { error: 'Invalid comment ID' },
      { status: 400 }
    )
  }

  try {
    const result = await sql`
      DELETE FROM comments
      WHERE id = ${commentId}
      RETURNING id
    `

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, id: commentId })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
