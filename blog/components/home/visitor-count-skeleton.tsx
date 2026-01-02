// components/home/visitor-count-skeleton.tsx
// VisitorCount のスケルトンUI

export function VisitorCountSkeleton() {
  return (
    <div className="py-8 flex justify-center">
      <div
        className="inline-flex items-center gap-4 px-8 py-6
          bg-card/60 backdrop-blur-md border border-border/50
          rounded-xl shadow-lg"
      >
        <div className="w-8 h-8 bg-foreground-muted/20 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="w-24 h-3 bg-foreground-muted/20 rounded animate-pulse" />
          <div className="w-16 h-8 bg-foreground-muted/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
