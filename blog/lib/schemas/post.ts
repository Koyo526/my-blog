// lib/schemas/post.ts
// ブログ記事のFrontmatterスキーマ

import { z } from 'zod'

export const postFrontmatterSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  summary: z.string().min(1, '概要は必須です'),
  publishedAt: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: '有効な日付形式で入力してください' }
  ),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>

export function validatePostFrontmatter(data: unknown): PostFrontmatter {
  return postFrontmatterSchema.parse(data)
}
