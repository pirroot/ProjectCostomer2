import Link from 'next/link'
import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import { getCategories, getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects',
}

export default async function ProjectIndexPage() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()])

  return (
    <div className="min-h-[100dvh] bg-white">
      <SiteHeader siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />

      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 md:px-10 md:pt-16">
        <h1 className="mb-8 text-[11px] uppercase tracking-[0.25em] text-neutral-400 md:mb-12">
          Index — All Projects ({categories.length})
        </h1>

        {categories.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No categories yet. Add your first category from the admin panel.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14">
            {categories.map((c, i) => {
              const cover =
                c.images.find((img) => img.id === c.coverImageId) ?? c.images[0]
              return (
                <li key={c.id}>
                  <Link href={`/project/${c.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                      {cover ? (
                         
                        <img
                          src={cover.file}
                          alt={c.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-900">
                        {c.title}
                      </span>
                      <span className="text-[10px] tracking-[0.2em] text-neutral-400">
                        {String(i + 1).padStart(2, '0')} · {c.images.length} photos
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
