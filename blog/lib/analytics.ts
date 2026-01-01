// lib/analytics.ts
// Analytics イベントトラッキング

type EventParams = {
  action: string
  category: string
  label?: string
  value?: number
}

// GA4 イベント送信
export function trackEvent({ action, category, label, value }: EventParams) {
  if (typeof window === 'undefined') return
  if (!('gtag' in window)) return

  const gtag = window.gtag as (
    command: string,
    action: string,
    params: Record<string, unknown>
  ) => void

  gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  })
}

// ページビュー
export function trackPageView(url: string) {
  if (typeof window === 'undefined') return
  if (!('gtag' in window)) return

  const gtag = window.gtag as (
    command: string,
    targetId: string,
    params: Record<string, unknown>
  ) => void

  gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    page_path: url,
  })
}

// 外部リンククリック
export function trackOutboundLink(url: string) {
  trackEvent({
    action: 'click',
    category: 'outbound',
    label: url,
  })
}

// プロジェクト詳細閲覧
export function trackProjectView(projectName: string) {
  trackEvent({
    action: 'view',
    category: 'project',
    label: projectName,
  })
}

// ブログ記事閲覧
export function trackBlogPostView(postTitle: string) {
  trackEvent({
    action: 'view',
    category: 'blog',
    label: postTitle,
  })
}
