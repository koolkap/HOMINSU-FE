import { useMemo, useState } from 'react'
import { ChevronLeft, Clock3, CreditCard, LogOut, Settings, ShieldCheck, User, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BottomNav from '../components/BottomNav'
import { getMockProfile, getMockWallet, pointPackages } from '../data/mockData'
import { useDisplayData } from '../hooks/useDisplayData'
import { createTopup } from '../lib/api'
import { appLanguage, intlLocale } from '../i18n'

function Header({ title }: { title: string }) {
  const { t } = useTranslation()
  return <header className="border-b border-white/5 px-4 py-4"><div className="mx-auto flex max-w-5xl items-center gap-3"><Link to="/" aria-label={t('common.backHome')} className="rounded-full bg-white/5 p-2"><ChevronLeft size={20} /></Link><h1 className="text-lg font-extrabold">{title}</h1></div></header>
}

export function PointsPage() {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const locale = intlLocale(language)
  const mockWallet = useMemo(() => getMockWallet(language), [language])
  const { data: wallet, isMock } = useDisplayData('wallet', mockWallet)
  const { data: packages } = useDisplayData('wallet/packages', pointPackages)
  const [pending, setPending] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const topup = async (packageId: string) => {
    setPending(packageId); setError(''); setMessage('')
    try {
      const result = await createTopup(packageId)
       setMessage(t('wallet.success', { id: result.transaction_id }))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('wallet.failed'))
    } finally { setPending('') }
  }

  return <div className="min-h-screen bg-ink-950 pb-24 text-mist-100"><Header title={t('wallet.title')} /><main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-signal via-rose-bright to-pulse p-7 shadow-glow sm:p-10"><div className="absolute -right-8 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" /><div className="relative"><p className="flex items-center gap-2 text-xs font-bold text-white/75"><WalletCards size={16} /> {t('wallet.available').toUpperCase()}</p><p className="mt-3 text-4xl font-black text-white sm:text-6xl">{new Intl.NumberFormat(locale).format(wallet.balance)}<span className="ml-2 text-xl">{wallet.currency || 'P'}</span></p><p className="mt-3 text-xs text-white/70">{isMock ? t('wallet.offline') : t('wallet.realtime')}</p></div></section>
    <section className="mt-9"><h2 className="text-xl font-extrabold">{t('wallet.topup')}</h2><p className="mt-1 text-sm text-mist-500">{t('wallet.topupDescription')}</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{packages.map((pkg) => <button key={pkg.id} disabled={Boolean(pending)} onClick={() => topup(pkg.id)} className="rounded-2xl border border-white/10 bg-ink-900 p-5 text-left transition hover:border-signal/50 hover:bg-ink-850 disabled:opacity-50"><p className="text-2xl font-black text-white">{new Intl.NumberFormat(locale).format(pkg.points)}P</p>{pkg.bonus && <span className="mt-2 inline-block rounded-full bg-signal/15 px-2 py-1 text-[10px] font-bold text-signal">{t('wallet.bonus', { points: new Intl.NumberFormat(locale).format(pkg.bonus) })}</span>}<p className="mt-4 text-sm font-bold text-mist-300">{new Intl.NumberFormat(locale, { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(pkg.price)}</p><p className="mt-2 text-xs text-signal">{pending === pkg.id ? t('common.processing') : t('wallet.select')}</p></button>)}</div>{error && <p role="alert" className="mt-4 rounded-xl border border-signal/20 bg-signal/10 p-3 text-sm text-red-300">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-300">{message}</p>}</section>
    <section className="mt-10"><h2 className="text-lg font-extrabold">{t('wallet.recent')}</h2><div className="mt-3 divide-y divide-white/5 rounded-2xl bg-ink-900 px-5">{wallet.transactions?.map((tx) => <div key={tx.id} className="flex items-center gap-3 py-4"><Clock3 size={17} className="text-mist-500" /><div><p className="text-sm font-bold">{tx.label}</p><p className="text-xs text-mist-500">{Number.isNaN(Date.parse(tx.createdAt)) ? tx.createdAt : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(tx.createdAt))}</p></div><strong className={`ml-auto ${tx.amount > 0 ? 'text-emerald-400' : 'text-mist-100'}`}>{tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat(locale).format(tx.amount)}P</strong></div>)}</div></section>
  </main><BottomNav /></div>
}

export function ProfilePage({ onLogin }: { onLogin: () => void }) {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const mockProfile = useMemo(() => getMockProfile(language), [language])
  const { data: profile, isMock } = useDisplayData('me', mockProfile)
  return <div className="min-h-screen bg-ink-950 pb-24 text-mist-100"><Header title="MY" /><main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
    <section className="flex items-center gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-ink-850 to-ink-900 p-6"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-signal to-pulse">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User size={34} />}</div><div><span className="text-[10px] font-black tracking-[0.2em] text-signal">{profile.role || 'MEMBER'}</span><h2 className="mt-1 text-2xl font-extrabold text-white">{profile.name}</h2><p className="text-sm text-mist-500">{profile.email}</p></div></section>
    <div className="mt-6 grid grid-cols-3 gap-2 text-center"><Link to="/points" className="rounded-2xl bg-ink-900 p-4"><WalletCards className="mx-auto text-signal" /><p className="mt-2 text-xs font-bold">{t('profile.points')}</p></Link><button className="rounded-2xl bg-ink-900 p-4"><CreditCard className="mx-auto text-pulse-soft" /><p className="mt-2 text-xs font-bold">{t('profile.payments')}</p></button><button className="rounded-2xl bg-ink-900 p-4"><ShieldCheck className="mx-auto text-emerald-400" /><p className="mt-2 text-xs font-bold">{t('profile.verification')}</p></button></div>
    <div className="mt-6 divide-y divide-white/5 rounded-2xl border border-white/5 bg-ink-900"><button className="flex w-full items-center gap-3 p-5 text-sm font-bold"><Settings size={18} className="text-mist-500" /> {t('profile.settings')} <span className="ml-auto text-mist-700">›</span></button><button onClick={onLogin} className="flex w-full items-center gap-3 p-5 text-sm font-bold"><User size={18} className="text-mist-500" /> {t('profile.switchAccount')} <span className="ml-auto text-mist-700">›</span></button><button className="flex w-full items-center gap-3 p-5 text-sm font-bold text-red-300"><LogOut size={18} /> {t('profile.logout')}</button></div>
    {isMock && <p className="mt-4 text-center text-xs text-mist-700">{t('profile.mockNotice')}</p>}
  </main><BottomNav /></div>
}
