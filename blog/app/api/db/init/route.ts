// app/api/db/init/route.ts
// データベース初期化 API（開発環境のみ、ADMIN_SECRET 必須）

import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'

export async function POST(request: Request) {
  // 本番環境では無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 404 }
    )
  }

  // ADMIN_SECRET チェック
  const adminSecret = request.headers.get('x-admin-secret')
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const result = await initializeDatabase()

  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}
