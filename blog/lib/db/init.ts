// lib/db/init.ts
// データベース初期化処理

import { sql } from '@vercel/postgres'
import { COMMENTS_TABLE_SCHEMA } from './schema'

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    await sql.query(COMMENTS_TABLE_SCHEMA)
    return { success: true, message: 'Database initialized successfully' }
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
