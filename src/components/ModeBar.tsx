import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'
import LanguageSelect from './LanguageSelect'
import UserAvatar from './UserAvatar'

const modes = [
  { to: '/', label: 'WATCH', active: 'bg-signal text-white' },
  { to: '/creator', label: 'VR STUDIO', active: 'bg-signal text-white' },
  { to: '/pro/operator', label: 'OPERATOR', active: 'bg-signal text-white' },
]

export default function ModeBar() {
  const { t } = useTranslation()
  const { user } = useAuth()
  return (
    <div className="relative z-40 flex min-h-9 items-center justify-center border-b border-mist-100/10 bg-ink-950 px-2 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-mist-500">
      <nav aria-label={t('mode.aria')} className="flex shrink-0 items-center gap-1">
        {modes.map((mode) => (
          <NavLink key={mode.to} to={mode.to} end={mode.to === '/'} className={({ isActive }) => `shrink-0 rounded-full px-2.5 py-1.5 transition-colors sm:px-3 ${isActive ? mode.active : 'hover:bg-mist-100/10 hover:text-mist-100'}`}>
            {mode.label}
          </NavLink>
        ))}
      </nav>
      <LanguageSelect />
      {user && <Link to="/profile" aria-label={t('auth.signedInAs', { name: user.name })} title={t('auth.profile')} className="language-control ml-1 rounded-full transition hover:scale-105"><UserAvatar user={user} className="h-7 w-7" size={56} /></Link>}
    </div>
  )
}
