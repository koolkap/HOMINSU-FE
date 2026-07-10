import { useState } from 'react'

interface ImageWithSkeletonProps {
  seed: string
  alt: string
  width?: number
  height?: number
  className?: string
  rounded?: string
  src?: string
}

/**
 * Displays a placeholder image (via picsum.photos, seeded so it stays
 * consistent per card) with a shimmering skeleton while it loads and a
 * soft fade-in once ready. Swap the `src` below for real CDN URLs later —
 * every other card/grid component only depends on this component's props,
 * so that's the single place to change when wiring up real assets.
 */
export default function ImageWithSkeleton({
  seed,
  alt,
  width = 480,
  height = 320,
  className = '',
  rounded = 'rounded-2xl',
  src: providedSrc,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const fallbackSrc = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
  const src = providedSrc && !failed ? providedSrc : fallbackSrc

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0 animate-shimmer" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (providedSrc && !failed) {
            setFailed(true)
            setLoaded(false)
          }
        }}
        className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
