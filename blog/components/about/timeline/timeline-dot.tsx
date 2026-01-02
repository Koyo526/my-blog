// components/about/timeline/timeline-dot.tsx
// タイムラインのドットマーカー

import type { TimelineEntryType } from '@/types/about'

type TimelineDotProps = {
  type: TimelineEntryType
  isCurrent?: boolean
}

export function TimelineDot({ type, isCurrent }: TimelineDotProps) {
  const colorClass =
    type === 'work' ? 'bg-timeline-work' : 'bg-timeline-education'

  return (
    <div className="relative flex items-center justify-center">
      {/* メインドット */}
      <div
        className={`
          w-3 h-3 rounded-full z-10
          ${isCurrent ? 'bg-timeline-current timeline-pulse' : colorClass}
        `}
      />
      {/* 外側のリング（現在のエントリのみ） */}
      {isCurrent && (
        <div className="absolute w-5 h-5 rounded-full border-2 border-timeline-current opacity-50" />
      )}
    </div>
  )
}
