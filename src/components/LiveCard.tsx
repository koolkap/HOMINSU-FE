import { Users } from 'lucide-react'
import type { LiveItem } from '../types'
import ImageWithSkeleton from './ImageWithSkeleton'

function formatViewers(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K명` : `${n}명`
}

export default function LiveCard({ item }: { item: LiveItem }) {
  return (
    <button className="group w-[220px] shrink-0 text-left sm:w-[260px] md:w-full md:shrink">
      <div className="relative">
        <ImageWithSkeleton
          seed={item.imageSeed}
          alt={item.title}
          width={560}
          height={360}
          className="aspect-[4/3] ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-[1.02] group-focus-visible:scale-[1.02] group-hover:ring-signal/50 md:aspect-[16/11]"
        />
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-signal px-2 py-1 text-[11px] font-bold text-white shadow-md">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-white" />
          LIVE
        </div>
        <div className="absolute left-2 bottom-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          <Users size={12} strokeWidth={2.5} />
          {formatViewers(item.viewers)}
        </div>
      </div>
      <h3 className="mt-2 line-clamp-1 text-[13.5px] font-semibold text-mist-100 md:mt-3 md:text-base">
        {item.title}
      </h3>
      <p className="mt-0.5 text-xs text-mist-500 md:text-sm">{item.channel}</p>
    </button>
  )
}
