import { Clapperboard, Home, User, Video, WalletCards } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '홈', icon: Home },
  { to: '/shorts', label: '쇼츠', icon: Clapperboard },
  { to: '/live', label: '라이브', icon: Video },
  { to: '/points', label: '포인트', icon: WalletCards },
  { to: '/profile', label: 'MY', icon: User },
] as const

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="flex w-16 flex-col items-center gap-1 py-1"
            >
              {({ isActive }) => <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} className={isActive ? 'text-signal' : 'text-mist-500'} />
                <span className={`text-[10.5px] font-medium ${isActive ? 'text-signal' : 'text-mist-500'}`}>{label}</span>
              </>}
            </NavLink>
        ))}
      </div>
    </nav>
  )
}
