// components/motion/stagger-container.tsx
// 子要素を順番にアニメーション

'use client'

import { motion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

type StaggerContainerProps = {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05, // 0.1 → 0.05 に短縮（LCP改善）
    },
  }),
}

export function StaggerContainer({
  children,
  staggerDelay = 0.05, // 0.1 → 0.05 に短縮
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={staggerDelay}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Viewport に入ったときにアニメーション
export function StaggerContainerWhenVisible({
  children,
  staggerDelay = 0.05, // 0.1 → 0.05 に短縮
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={staggerDelay}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// StaggerContainer の子要素用
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 }, // y: 20 → 15 に短縮
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35, // 0.5 → 0.35 に短縮
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
