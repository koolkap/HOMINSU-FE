import { Users } from 'lucide-react'
import type { LiveItem } from '../types'
import ImageWithSkeleton from './ImageWithSkeleton'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { intlLocale } from '../i18n'

export default function LiveCard({ item }: { item: LiveItem }) {
  const { i18n } = useTranslation()
  const viewers = new Intl.NumberFormat(intlLocale(i18n.resolvedLanguage), { notation: 'compact', maximumFractionDigits: 1 }).format(item.viewers)
  return (
    <Link to={`/content/${item.id}`} className="group block w-[220px] shrink-0 text-left sm:w-[260px] md:w-full md:shrink">
      <div className="relative">
        <ImageWithSkeleton
          seed={item.imageSeed}
          alt={item.title}
          width={560}
          height={360}
          className="aspect-[4/3] ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-[1.02] group-focus-visible:scale-[1.02] group-hover:ring-signal/50 md:aspect-[16/11]"
          src={item.imageUrl}
        />
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-signal px-2 py-1 text-[11px] font-bold text-white shadow-md">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-white" />
          LIVE
        </div>
        <div className="absolute left-2 bottom-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          <Users size={12} strokeWidth={2.5} />
          {viewers}
        </div>
      </div>
      <h3 className="mt-2 line-clamp-1 text-[13.5px] font-semibold text-mist-100 md:mt-3 md:text-base">
        {item.title}
      </h3>
      <p className="mt-0.5 text-xs text-mist-500 md:text-sm">{item.channel}</p>
    </Link>
  )
}
