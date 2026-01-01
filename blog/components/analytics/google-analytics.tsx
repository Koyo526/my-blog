// components/analytics/google-analytics.tsx
// Google Analytics 4 コンポーネント

import { GoogleAnalytics as GA } from '@next/third-parties/google'
import { env } from '@/lib/env'

export function GoogleAnalytics() {
  const gaId = env.gaMeasurementId

  if (!gaId || env.isDevelopment) {
    return null
  }

  return <GA gaId={gaId} />
}
