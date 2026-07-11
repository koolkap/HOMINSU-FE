import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const slides = ['one', 'two', 'three'] as const

export default function PromoBanner() {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500)
    return () => clearInterval(t)
  }, [])

  const slide = slides[index]

  return (
    <div className="px-4 pt-4 sm:px-6 md:hidden">
      <div className="mx-auto max-w-[1600px]">
        <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-rose-deep via-rose-bright to-pulse sm:h-40">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative flex h-full flex-col justify-center gap-2 px-5 sm:px-8"
            >
              <span className="w-fit rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white/90">
                {t(`promo.slides.${slide}.tag`)}
              </span>
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                {t(`promo.slides.${slide}.title`)}
              </h2>
              <p className="text-sm text-white/85 sm:text-base">{t(`promo.slides.${slide}.body`)}</p>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s}
                aria-label={t('promo.goTo', { number: i + 1 })}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
