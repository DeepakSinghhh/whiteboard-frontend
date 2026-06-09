"use client"

interface Props {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this board. Check your connection and try again.",
  onRetry,
}: Props) {
  return (
    <div className="w-screen h-screen bg-[#0f0f12] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[400px] bg-[#f87171]/4 rounded-full blur-[140px]" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="w-12 h-12 bg-[#2a1a1a] border border-[#f87171]/20 rounded-2xl flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <h2 className="text-white text-[15px] font-semibold mb-1">{title}</h2>
          <p className="text-[#555] text-[13px] leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2.5 bg-[#7c6aff] text-white text-[13px] font-medium rounded-xl hover:bg-[#6a58ee] transition-colors"
            >
              Try again
            </button>
          )}
          <a
            href="/"
            className="px-4 py-2.5 bg-[#16161a] border border-[#2a2a35] text-[#888] text-[13px] font-medium rounded-xl hover:text-white transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
