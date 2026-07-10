import { liveItems } from '../data/mockData'
import LiveCard from './LiveCard'

export default function LiveSection() {
  return (
    <section className="mt-8 px-4 sm:px-6 lg:px-10 md:mt-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 animate-pulseDot rounded-full bg-signal" aria-hidden="true" />
            <h2 className="font-display text-base font-bold tracking-tight text-mist-100 sm:text-lg md:hidden">
              라이브 중
            </h2>
            <h2 className="hidden font-display text-lg font-extrabold tracking-wide text-mist-100 md:block lg:text-xl">
              LIVE NOW
            </h2>
          </div>
          <button className="text-xs font-medium text-mist-500 transition-colors hover:text-mist-100 md:text-sm">
            전체보기
          </button>
        </div>

        <div className="scroll-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {liveItems.map((item) => (
            <LiveCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
