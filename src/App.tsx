import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import TopBar from './components/TopBar'
import Hero from './components/Hero'
import PromoBanner from './components/PromoBanner'
import CategoryTabs from './components/CategoryTabs'
import LiveSection from './components/LiveSection'
import ContentGrid from './components/ContentGrid'
import BottomNav from './components/BottomNav'
import LoginModal from './components/LoginModal'

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginToastKey, setLoginToastKey] = useState(0)

  useEffect(() => {
    if (loginToastKey === 0) {
      return
    }

    const timeout = window.setTimeout(() => setLoginToastKey(0), 3000)

    return () => window.clearTimeout(timeout)
  }, [loginToastKey])

  const handleLoginSuccess = () => {
    setIsLoginOpen(false)
    setLoginToastKey((key) => key + 1)
  }

  return (
    <div className="min-h-screen bg-ink-950 text-mist-100">
      <TopBar onLoginClick={() => setIsLoginOpen(true)} />

      <main>
        <Hero />
        <PromoBanner />
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
        <LiveSection />
        <ContentGrid />
      </main>

      <BottomNav />

      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {loginToastKey > 0 && (
        <div
          key={loginToastKey}
          role="status"
          aria-live="polite"
          className="fixed left-4 right-4 top-24 z-[70] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink-850/95 p-4 text-sm text-mist-100 shadow-card backdrop-blur md:left-auto md:right-6 md:top-20 md:mx-0"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/15 text-signal">
            <CheckCircle2 size={18} strokeWidth={2.4} />
          </span>
          <span>
            <span className="block font-bold text-white">로그인 성공</span>
            <span className="mt-0.5 block text-mist-300">환영합니다. 홈인슈를 계속 이용해 주세요.</span>
          </span>
        </div>
      )}
    </div>
  )
}
