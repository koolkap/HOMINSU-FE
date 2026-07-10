import { liveItems } from '../data/mockData'
import LiveCard from './LiveCard'

export default function LiveSection() {
  return (
    <section className="mt-6 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulseDot rounded-full bg-signal" aria-hidden="true" />
            <h2 className="font-display text-base font-bold text-mist-100 sm:text-lg">
              라이브 중
            </h2>
          </div>
          <button className="text-xs font-medium text-mist-500 transition-colors hover:text-mist-100">
            전체보기
          </button>
        </div>

        <div className="scroll-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {liveItems.map((item) => (
            <LiveCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
