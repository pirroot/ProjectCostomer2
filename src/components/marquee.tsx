'use client'

import Link from 'next/link'

export type StripItem = {
  slug: string
  title: string
  file: string
}

/**
 * Slow infinite horizontal gallery (home page bottom strip).
 * - Auto-scrolls very slowly to the left; pauses on hover.
 * - Each image links to its category page.
 * - Pure images, no text overlays (client request).
 * - Respects prefers-reduced-motion (falls back to horizontal scroll).
 */
export default function Marquee({ items }: { items: StripItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400">
        No categories yet — add them from the admin panel
      </div>
    )
  }

  // two copies -> translating the track by -50% loops seamlessly
  const doubled = [...items, ...items]

  return (
    <div className="marquee-mask group w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-safe:overflow-hidden">
      <div className="marquee-track flex w-max motion-safe:group-hover:[animation-play-state:paused]">
        {doubled.map((it, i) => (
          <Link
            key={`${it.slug}-${i}`}
            href={`/project/${it.slug}`}
            aria-label={`Open category: ${it.title}`}
            className="group/item relative block h-[58vh] md:h-[68vh] w-[calc(58vh*0.75)] md:w-[calc(68vh*0.75)] shrink-0 overflow-hidden bg-neutral-100 pr-[10px] md:pr-3"
          >
            {/* placeholder <img>: files live in /public and /media, next/image adds no value here */}
            <img
              src={it.file}
              alt={it.title}
              loading={i < 6 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/item:scale-[1.02]"
              draggable={false}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
