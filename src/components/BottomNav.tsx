import { Home, Search, Sparkles, User, Video } from 'lucide-react'
import { useState } from 'react'

const tabs = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'featured', label: '추천', icon: Sparkles },
  { id: 'search', label: '검색', icon: Search },
  { id: 'live', label: '라이브', icon: Video },
  { id: 'my', label: 'MY', icon: User },
] as const

export default function BottomNav() {
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('home')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex w-16 flex-col items-center gap-1 py-1"
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.4 : 2}
                className={isActive ? 'text-pulse-soft' : 'text-mist-500'}
              />
              <span
                className={`text-[10.5px] font-medium ${
                  isActive ? 'text-pulse-soft' : 'text-mist-500'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
