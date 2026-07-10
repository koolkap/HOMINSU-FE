import { useState } from 'react'
import { contentItems } from '../data/mockData'
import ContentCard from './ContentCard'

const sorts = [
  { id: 'latest', label: '최신' },
  { id: 'popular', label: '인기' },
  { id: 'rating', label: '별점' },
] as const

export default function ContentGrid() {
  const [sort, setSort] = useState<(typeof sorts)[number]['id']>('latest')

  return (
    <section className="mt-7 px-4 pb-24 sm:px-6 md:pb-16 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-mist-100 sm:text-lg">
            전체 콘텐츠{' '}
            <span className="ml-1 text-sm font-medium text-mist-500">
              {contentItems.length}개
            </span>
          </h2>
          <div className="flex gap-1 rounded-full bg-ink-800 p-1">
            {sorts.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  sort === s.id
                    ? 'bg-pulse text-white'
                    : 'text-mist-500 hover:text-mist-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {contentItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
