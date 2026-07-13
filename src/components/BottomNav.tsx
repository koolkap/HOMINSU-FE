import { Clapperboard, Home, User, Video, WalletCards } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const tabs = [
  { to: '/', labelKey: 'common.home', icon: Home },
  { to: '/shorts', labelKey: 'common.shorts', icon: Clapperboard },
  { to: '/live', labelKey: 'common.live', icon: Video },
  { to: '/points', labelKey: 'common.points', icon: WalletCards },
  { to: '/profile', labelKey: 'common.my', icon: User },
] as const

export default function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-mist-100/10 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
        {tabs.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="flex w-16 flex-col items-center gap-1 py-1"
            >
              {({ isActive }) => <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} className={isActive ? 'text-signal' : 'text-mist-500'} />
                <span className={`text-[10.5px] font-medium ${isActive ? 'text-signal' : 'text-mist-500'}`}>{t(labelKey)}</span>
              </>}
            </NavLink>
        ))}
      </div>
    </nav>
  )
}
