import md5 from 'blueimp-md5'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '../types'

function gravatarUrl(email: string, size = 96) {
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=g`
}

export default function UserAvatar({ user, className = 'h-8 w-8', size = 96 }: { user: UserProfile; className?: string; size?: number }) {
  const { t } = useTranslation()
  return <img
    src={user.avatarUrl || gravatarUrl(user.email, size)}
    alt={t('auth.avatarAlt', { name: user.name })}
    className={`${className} shrink-0 rounded-full border border-white/15 bg-ink-800 object-cover`}
    referrerPolicy="no-referrer"
  />
}
