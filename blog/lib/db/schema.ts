// lib/db/schema.ts
// コメントテーブルのスキーマ定義

export const COMMENTS_TABLE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL DEFAULT '名無しさん',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS comments_created_at_idx
    ON comments (created_at DESC);
`

export interface Comment {
  id: number
  name: string
  content: string
  created_at: Date
}

// 定数
export const COMMENT_LIMITS = {
  NAME_MAX_LENGTH: 20,
  CONTENT_MAX_LENGTH: 200,
  DEFAULT_NAME: '名無しさん',
  DISPLAY_LIMIT: 10,
} as const
