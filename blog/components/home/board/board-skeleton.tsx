// components/home/board/board-skeleton.tsx
// Board のスケルトンUI

export function BoardSkeleton() {
  return (
    <section className="py-12">
      <div
        className="p-6 md:p-8
          bg-card/60 backdrop-blur-md border border-border/50
          rounded-xl shadow-lg"
      >
        {/* ヘッダースケルトン */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-foreground-muted/20 rounded animate-pulse" />
          <div className="w-24 h-6 bg-foreground-muted/20 rounded animate-pulse" />
        </div>

        {/* フォームスケルトン */}
        <div className="mb-6 space-y-4">
          <div className="space-y-1">
            <div className="w-16 h-4 bg-foreground-muted/20 rounded animate-pulse" />
            <div className="w-full h-10 bg-foreground-muted/10 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="w-20 h-4 bg-foreground-muted/20 rounded animate-pulse" />
            <div className="w-full h-24 bg-foreground-muted/10 rounded-lg animate-pulse" />
          </div>
          <div className="w-24 h-10 bg-foreground-muted/20 rounded-lg animate-pulse" />
        </div>

        {/* 区切り線 */}
        <div className="border-t border-border/40 mb-4" />

        {/* コメント一覧スケルトン */}
        <div className="h-[300px] space-y-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-20 h-4 bg-foreground-muted/20 rounded animate-pulse" />
                <div className="w-12 h-3 bg-foreground-muted/10 rounded animate-pulse" />
              </div>
              <div className="w-full h-4 bg-foreground-muted/10 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-foreground-muted/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
