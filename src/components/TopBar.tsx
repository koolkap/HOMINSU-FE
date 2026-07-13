import { Search } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'
import UserAvatar from './UserAvatar'

type TopBarProps = {
  onLoginClick: () => void
}

export default function TopBar({ onLoginClick }: TopBarProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-mist-100/10 bg-ink-950/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1600px] items-center gap-6">
        {/* logo + primary nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-mist-100 lg:text-xl">
            {t('topbar.brand')}
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-mist-300 md:flex">
            <NavLink to="/" className="text-mist-100 transition-colors hover:text-signal">
              {t('common.home')}
            </NavLink>
            <NavLink to="/live" className="transition-colors hover:text-mist-100">{t('common.live')}</NavLink>
            <NavLink to="/shorts" className="transition-colors hover:text-mist-100">{t('common.shorts')}</NavLink>
            <NavLink to="/points" className="transition-colors hover:text-mist-100">{t('common.points')}</NavLink>
          </nav>
        </div>

        {/* search bar, desktop only */}
        <div className="hidden flex-1 md:block">
          <label className="relative mx-auto block max-w-xl">
            <Search
              size={17}
              strokeWidth={2.2}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500"
            />
            <input
              type="text"
              placeholder={t('topbar.search')}
              className="w-full rounded-full border border-mist-100/10 bg-ink-800/80 py-2.5 pl-11 pr-4 text-sm text-mist-100 placeholder:text-mist-500 transition-colors focus:border-pulse/50 focus:outline-none"
            />
          </label>
        </div>

        {/* right side: login (desktop) */}
        <div className="ml-auto hidden md:block">
          {user ? <Link to="/profile" aria-label={t('auth.signedInAs', { name: user.name })} className="flex items-center gap-2.5 rounded-full border border-mist-100/10 bg-mist-100/5 py-1.5 pl-1.5 pr-3 transition hover:border-mist-100/20 hover:bg-mist-100/10">
            <UserAvatar user={user} className="h-8 w-8" size={64} />
            <span className="max-w-28 truncate text-xs font-bold text-mist-100">{user.name}</span>
          </Link> : <button
              type="button"
              onClick={onLoginClick}
              className="rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              {t('common.login')}
            </button>}
        </div>

        {/* mobile-only right side */}
        <div className="ml-auto flex items-center gap-3 md:hidden">
          {user ? <Link to="/profile" aria-label={t('auth.signedInAs', { name: user.name })}><UserAvatar user={user} className="h-8 w-8" size={64} /></Link> : <button
              type="button"
              onClick={onLoginClick}
              className="rounded-full bg-signal px-4 py-2 text-xs font-bold text-white shadow-glow"
            >
              {t('common.login')}
            </button>}
        </div>
      </div>
      <p className="mt-0.5 text-xs text-mist-500 md:hidden">{t('topbar.tagline')}</p>
    </header>
  )
}
