// types/board.ts
// 掲示板関連の型定義

export interface Comment {
  id: number
  name: string
  content: string
  created_at: string
}

export interface CommentFormData {
  name: string
  content: string
  honeypot?: string
}

export interface CommentsResponse {
  comments: Comment[]
}

export interface PostCommentResponse {
  success: boolean
  id: number
  error?: string
  retryAfter?: number
}
