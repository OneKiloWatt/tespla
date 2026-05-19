/**
 * ホーム画面のページ遷移中に表示されるスケルトン UI（Next.js loading.tsx）
 */
export default function HomeLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* AppBar skeleton */}
      <div className="h-[52px] flex items-center px-4 bg-bg-base border-b border-divider shrink-0">
        <div className="w-28 h-4 rounded bg-divider-strong animate-pulse"/>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-3">
        {/* Hero card skeleton */}
        <div className="rounded-2xl bg-bg-card p-4 flex flex-col gap-3">
          <div className="w-1/2 h-4 rounded bg-divider-strong animate-pulse"/>
          <div className="w-full h-24 rounded-xl bg-divider-strong animate-pulse"/>
          <div className="w-3/4 h-3 rounded bg-divider-strong animate-pulse"/>
        </div>

        {/* Secondary card skeleton */}
        <div className="rounded-2xl bg-bg-card p-4 flex flex-col gap-2">
          <div className="w-1/3 h-4 rounded bg-divider-strong animate-pulse"/>
          <div className="w-full h-3 rounded bg-divider-strong animate-pulse"/>
          <div className="w-5/6 h-3 rounded bg-divider-strong animate-pulse"/>
        </div>
      </div>
    </div>
  );
}
