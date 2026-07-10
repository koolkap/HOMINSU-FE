import { useState } from 'react'
import TopBar from './components/TopBar'
import PromoBanner from './components/PromoBanner'
import CategoryTabs from './components/CategoryTabs'
import LiveSection from './components/LiveSection'
import ContentGrid from './components/ContentGrid'
import BottomNav from './components/BottomNav'

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <div className="min-h-screen bg-ink-950 text-mist-100">
      <TopBar />

      <main>
        <PromoBanner />
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
        <LiveSection />
        <ContentGrid />
      </main>

      <BottomNav />
    </div>
  )
}
