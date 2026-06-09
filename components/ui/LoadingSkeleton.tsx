export default function BoardSkeleton() {
  return (
    <div className="w-screen h-screen bg-[#0f0f12] flex items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-[#7c6aff]/5 rounded-full blur-[120px]" />
      </div>

      {/* Topbar skeleton */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[140, 180, 220].map((w, i) => (
          <div key={i} className="h-9 rounded-xl bg-[#16161a] border border-[#2a2a35] animate-pulse" style={{ width: w }} />
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
        <div className="w-9 bg-[#16161a] border border-[#2a2a35] rounded-2xl animate-pulse" style={{ height: 360 }} />
        <div className="w-9 h-24 bg-[#16161a] border border-[#2a2a35] rounded-2xl animate-pulse" />
        <div className="w-9 h-32 bg-[#16161a] border border-[#2a2a35] rounded-2xl animate-pulse" />
      </div>

      {/* Right panel skeleton */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="w-16 h-9 rounded-xl bg-[#16161a] border border-[#2a2a35] animate-pulse" />
        <div className="w-24 h-9 rounded-xl bg-[#16161a] border border-[#2a2a35] animate-pulse" />
        <div className="w-20 h-9 rounded-xl bg-[#16161a] border border-[#2a2a35] animate-pulse" />
      </div>

      {/* Center loading indicator */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-[#7c6aff] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7c6aff]/30 animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          </svg>
        </div>
        <div className="text-[#444] text-[12px]">Loading board...</div>
      </div>
    </div>
  )
}
