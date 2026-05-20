/**
 * /history/[id] 画面のページ遷移中に表示されるスケルトン UI（Next.js loading.tsx）
 */
export default function HistoryDetailLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* AppBar skeleton */}
      <div className="h-[52px] flex items-center px-4 bg-bg-base border-b border-divider shrink-0">
        <div className="w-28 h-4 rounded bg-divider-strong animate-pulse"/>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Date + title skeleton */}
        <div className="flex flex-col gap-1.5 mb-1">
          <div className="w-1/3 h-3 rounded bg-divider-strong animate-pulse"/>
          <div className="w-2/3 h-5 rounded bg-divider-strong animate-pulse"/>
        </div>

        {/* Stats + subject bars card skeleton */}
        <div className="rounded-2xl bg-bg-card p-4 flex flex-col gap-3">
          <div className="flex gap-4">
            <div className="flex-1 h-12 rounded bg-divider-strong animate-pulse"/>
            <div className="flex-1 h-12 rounded bg-divider-strong animate-pulse"/>
          </div>
          <div className="border-t border-divider"/>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-16 h-5 rounded bg-divider-strong animate-pulse"/>
              <div className="flex-1 h-1.5 rounded bg-divider-strong animate-pulse"/>
              <div className="w-10 h-4 rounded bg-divider-strong animate-pulse"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
