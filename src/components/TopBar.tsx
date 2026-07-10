import { Bell, Wifi } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/85 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="font-display text-lg font-extrabold tracking-tight text-mist-100">
            홈인슈
          </h1>
          <span className="hidden text-xs font-medium text-mist-500 sm:inline">
            VR 콘텐츠 플랫폼
          </span>
        </div>

        {/* desktop nav, hidden on mobile to match the reference app shell */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-mist-300 md:flex">
          <a href="#" className="text-mist-100 transition-colors hover:text-white">
            홈
          </a>
          <a href="#" className="transition-colors hover:text-mist-100">
            검색
          </a>
          <a href="#" className="transition-colors hover:text-mist-100">
            라이브
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 text-mist-500 sm:flex">
            <Wifi size={16} strokeWidth={2.25} />
          </div>
          <button
            aria-label="알림"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-mist-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Bell size={19} strokeWidth={2.1} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-signal" />
          </button>
        </div>
      </div>
      <p className="mt-0.5 text-xs text-mist-500 md:hidden">VR 콘텐츠 플랫폼</p>
    </header>
  )
}
