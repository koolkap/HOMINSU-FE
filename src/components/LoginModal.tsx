import { type FormEvent, useEffect, useState } from 'react'
import { LockKeyhole, Mail, X } from 'lucide-react'
import { login } from '../lib/api'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'

type LoginModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await login(String(form.get('email')), String(form.get('password')))
      if (!result.user) throw new Error(t('login.failed'))
      signIn(result.user)
      onSuccess()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/80 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center sm:py-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="w-full max-w-md overflow-hidden rounded-[2rem] border border-mist-100/10 bg-ink-900 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden border-b border-mist-100/10 px-6 pb-6 pt-7">
          <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-signal/25 blur-3xl" />
          <div className="absolute -bottom-20 left-8 h-36 w-36 rounded-full bg-pulse/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-signal">Homeinsu</p>
              <h2 id="login-modal-title" className="font-display text-2xl font-extrabold text-mist-100">
                {t('login.title')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-mist-300">
                {t('login.description')}
              </p>
            </div>
            <button
              type="button"
              aria-label={t('login.close')}
              onClick={onClose}
              className="rounded-full border border-mist-100/10 bg-mist-100/5 p-2 text-mist-300 transition-colors hover:bg-mist-100/10 hover:text-mist-100"
            >
              <X size={18} strokeWidth={2.3} />
            </button>
          </div>
        </div>

        <form className="space-y-5 px-6 pb-7 pt-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-semibold text-mist-100">
              {t('login.email')}
            </label>
            <div className="relative">
              <Mail
                size={18}
                strokeWidth={2.2}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500"
              />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-mist-100/10 bg-ink-800/90 py-3.5 pl-12 pr-4 text-sm text-mist-100 placeholder:text-mist-500 transition-colors focus:border-signal/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-semibold text-mist-100">
              {t('login.password')}
            </label>
            <div className="relative">
              <LockKeyhole
                size={18}
                strokeWidth={2.2}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500"
              />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full rounded-2xl border border-mist-100/10 bg-ink-800/90 py-3.5 pl-12 pr-4 text-sm text-mist-100 placeholder:text-mist-500 transition-colors focus:border-signal/60 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-signal px-5 py-3.5 text-sm font-extrabold text-white shadow-glow transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? t('login.submitting') : t('login.title')}
          </button>

          {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-center text-xs leading-5 text-red-500">{error}</p>}
        </form>
      </section>
    </div>
  )
}
