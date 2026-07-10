import { Info, Play } from 'lucide-react'
import ImageWithSkeleton from './ImageWithSkeleton'

export default function Hero() {
  return (
    <section className="relative hidden md:block">
      <div className="relative h-[420px] w-full overflow-hidden lg:h-[500px]">
        <ImageWithSkeleton
          seed="neo-seoul-2088-night-tower"
          alt="네오 서울 2088 라이브 야간 비행 투어"
          width={1920}
          height={1000}
          className="absolute inset-0 h-full w-full"
          rounded="rounded-none"
        />
        {/* left-to-right and bottom scrims so the copy stays readable over any photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-center px-6 lg:px-10">
          <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.15] text-white lg:text-[3.25rem]">
            네오 서울 2088:
            <br />
            라이브 야간 비행 투어
          </h1>
          <p className="mt-4 max-w-lg text-base text-mist-300 lg:text-lg">
            서울의 미래를 8K VR로 직접 체험하세요. 지금 가장 핫한 라이브.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-signal px-6 py-3 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03]">
              <Play size={16} fill="currentColor" strokeWidth={0} />
              시청하기
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15">
              <Info size={16} strokeWidth={2.3} />
              상세 정보
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
