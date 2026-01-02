'use client'

// components/home/visitor-count.tsx
// 訪問者カウント表示コンポーネント（グラスモーフィズムカードデザイン）

import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Users } from 'lucide-react'

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
    <div ref={ref} className="py-8 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-4 px-8 py-6
          bg-card/60 backdrop-blur-md border border-border/50
          rounded-xl shadow-lg
          hover:shadow-xl
          transition-shadow duration-300"
      >
        {isLoading ? (
          <>
            <div className="w-8 h-8 bg-foreground-muted/20 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-24 h-3 bg-foreground-muted/20 rounded animate-pulse" />
              <div className="w-16 h-8 bg-foreground-muted/20 rounded animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <Users className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm text-foreground-muted">
                {t('visitorCount.label')}
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {displayValue.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
