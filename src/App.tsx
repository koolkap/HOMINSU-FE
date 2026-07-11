import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LoginModal from './components/LoginModal'
import ModeBar from './components/ModeBar'
import { PointsPage, ProfilePage } from './pages/AccountPages'
import { ContentDetailPage, HomePage, LivePage, ShortsPage } from './pages/ConsumerPages'
import CreatorPage from './pages/CreatorPage'
import OperatorPage from './pages/OperatorPage'

export default function App() {
  const { t } = useTranslation()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginToastKey, setLoginToastKey] = useState(0)

  useEffect(() => {
    if (!loginToastKey) return
    const timeout = window.setTimeout(() => setLoginToastKey(0), 3000)
    return () => window.clearTimeout(timeout)
  }, [loginToastKey])

  const handleLoginSuccess = () => {
    setIsLoginOpen(false)
    setLoginToastKey((key) => key + 1)
  }

  return <>
    <ModeBar />
    <Routes>
      <Route path="/" element={<HomePage onLogin={() => setIsLoginOpen(true)} />} />
      <Route path="/creator" element={<CreatorPage />} />
      <Route path="/content/:id" element={<ContentDetailPage />} />
      <Route path="/live" element={<LivePage />} />
      <Route path="/shorts" element={<ShortsPage />} />
      <Route path="/points" element={<PointsPage />} />
      <Route path="/profile" element={<ProfilePage onLogin={() => setIsLoginOpen(true)} />} />
      <Route path="/pro/operator" element={<OperatorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
    {loginToastKey > 0 && <div key={loginToastKey} role="status" aria-live="polite" className="fixed left-4 right-4 top-24 z-[70] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink-850/95 p-4 text-sm text-mist-100 shadow-card backdrop-blur md:left-auto md:right-6 md:mx-0"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/15 text-signal"><CheckCircle2 size={18} strokeWidth={2.4} /></span><span><span className="block font-bold text-white">{t('login.success')}</span><span className="mt-0.5 block text-mist-300">{t('login.welcome')}</span></span></div>}
  </>
}
