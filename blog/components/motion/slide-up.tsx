// components/motion/slide-up.tsx
// 下から上へのスライドアニメーション

'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

type SlideUpProps = {
  children: ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function SlideUp({
  children,
  delay = 0,
  duration = 0.6,
  distance = 30,
  className,
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth animation
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Viewport に入ったときにアニメーション
export function SlideUpWhenVisible({
  children,
  delay = 0,
  duration = 0.6,
  distance = 30,
  className,
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
