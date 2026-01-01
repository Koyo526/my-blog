// lib/schemas/project.ts
// プロジェクトのFrontmatterスキーマ

import { z } from 'zod'

export const projectFrontmatterSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です'),
  summary: z.string().min(1, '概要は必須です'),
  tech: z.array(z.string()).min(1, '技術スタックを1つ以上入力してください'),
  publishedAt: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: '有効な日付形式で入力してください' }
  ),
  updatedAt: z.string().optional(),
  github: z.string().url().optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  pinned: z.boolean().default(false),
})

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>

export function validateProjectFrontmatter(data: unknown): ProjectFrontmatter {
  return projectFrontmatterSchema.parse(data)
}
