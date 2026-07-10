import { categories } from '../data/mockData'

interface CategoryTabsProps {
  active: string
  onChange: (id: string) => void
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="mt-4 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="scroll-row flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => {
            const isActive = c.id === active
            return (
              <button
                key={c.id}
                onClick={() => onChange(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-pulse text-white shadow-glow'
                    : 'bg-ink-800 text-mist-300 hover:bg-ink-700 hover:text-mist-100'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
