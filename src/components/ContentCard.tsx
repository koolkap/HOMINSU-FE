import { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import type { ContentItem } from '../types'
import ImageWithSkeleton from './ImageWithSkeleton'

function formatViews(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`
}

export default function ContentCard({ item }: { item: ContentItem }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="group">
      <div className="relative">
        <ImageWithSkeleton
          seed={item.imageSeed}
          alt={item.title}
          width={480}
          height={340}
          className="aspect-[4/3] ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {item.duration}
        </span>
        {item.isAdult && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md bg-signal text-[10px] font-bold text-white">
            19
          </span>
        )}
        <button
          aria-label={liked ? '좋아요 취소' : '좋아요'}
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
          className={`absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
            liked ? 'bg-signal text-white' : 'bg-black/50 text-white/90 hover:bg-black/70'
          }`}
        >
          <Heart size={14} strokeWidth={2.4} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 className="mt-2 line-clamp-1 text-[13.5px] font-semibold text-mist-100">
        {item.title}
      </h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-mist-500">{item.provider}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-mist-500">
        <span className="flex items-center gap-0.5 font-medium text-amber-400">
          <Star size={11} fill="currentColor" strokeWidth={0} />
          {item.rating.toFixed(1)}
        </span>
        <span className="text-mist-700">·</span>
        <span>조회 {formatViews(item.views)}</span>
        <span className="text-mist-700">·</span>
        <span className="font-medium text-pulse-soft">{item.points}P</span>
      </div>
    </div>
  )
}
