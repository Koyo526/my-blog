'use client'

// components/home/visitor-count.tsx
// 訪問者カウント表示コンポーネント

import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function VisitorCount() {
  const t = useTranslations('home')
  const [count, setCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(0)

  // カウントを取得してインクリメント
  useEffect(() => {
    const incrementVisitor = async () => {
      try {
        const response = await fetch('/api/visitors', {
          method: 'POST',
        })
        if (!response.ok) throw new Error('Failed to increment')
        const data = await response.json()
        setCount(data.count)
      } catch {
        // POSTが失敗した場合はGETで取得を試みる
        try {
          const response = await fetch('/api/visitors')
          if (!response.ok) throw new Error('Failed to fetch')
          const data = await response.json()
          setCount(data.count)
        } catch {
          setError(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    incrementVisitor()
  }, [])

  // カウントアップアニメーション
  useEffect(() => {
    if (count !== null && isInView) {
      const controls = animate(motionValue, count, {
        duration: 1.5,
        ease: 'easeOut',
      })
      return controls.stop
    }
  }, [count, isInView, motionValue])

  // displayValue を更新
  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return unsubscribe
  }, [rounded])

  if (error) {
    return null // エラー時は非表示
  }

  return (
    <div ref={ref} className="py-8 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-sm text-foreground-muted"
      >
        {isLoading ? (
          <span className="inline-block w-20 h-4 bg-foreground-muted/20 rounded animate-pulse" />
        ) : (
          <>
            {t('visitorCount.label')}:{' '}
            <span className="font-semibold tabular-nums">
              {displayValue.toLocaleString()}
            </span>
          </>
        )}
      </motion.p>
    </div>
  )
}
