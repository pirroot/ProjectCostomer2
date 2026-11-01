import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import Slideshow from '@/components/slideshow'
import DescToggle from '@/components/desc-toggle'
import { getCategoryBySlug, getSettings } from '@/lib/data'
import { parseExtraFields } from '@/lib/extra'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  return { title: category?.title ?? 'Project' }
}

// fixed metadata block, in the exact order the client asked for
const META_ROWS: Array<{
  key: 'client' | 'projectTitle' | 'year' | 'category' | 'location' | 'role'
  label: string
}> = [
  { key: 'client', label: 'Client' },
  { key: 'projectTitle', label: 'Project Title' },
  { key: 'year', label: 'Year' },
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  { key: 'role', label: 'Role' },
]

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getSettings()])
  if (!category) notFound()

  const extraFields = parseExtraFields(category.extraFields)
  const metaFilled = META_ROWS.some((r) => (category[r.key] ?? '').trim().length > 0) || extraFields.length > 0

  return (
    <div className="min-h-[100dvh] bg-white">
      <SiteHeader siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />

      <main className="md:pt-16">
        <div className="md:flex">
          {/* ---- Left column: fixed info (desktop) / top block (mobile) ---- */}
          <aside className="px-6 pb-8 pt-6 md:fixed md:left-0 md:top-16 md:z-10 md:flex md:h-[calc(100vh-4rem)] md:w-[300px] md:flex-col md:justify-center md:gap-12 md:px-10 lg:w-[360px]">
            <div>
              <h1 className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-900">
                {category.title}
              </h1>
              {(category.description.trim() || category.descriptionFa?.trim()) && (
                <DescToggle
                  description={category.description}
                  descriptionFa={category.descriptionFa}
                />
              )}
            </div>

            {metaFilled && (
              <dl className="mt-8 space-y-2.5 md:mt-0">
                {META_ROWS.map((row) =>
                  (category[row.key] ?? '').trim() ? (
                    <div
                      key={row.key}
                      className="grid grid-cols-[110px_1fr] items-baseline gap-2 text-[11px]"
                    >
                      <dt className="uppercase tracking-[0.18em] text-neutral-400">{row.label}</dt>
                      <dd className="font-semibold tracking-wide text-neutral-800">
                        {category[row.key]}
                      </dd>
                    </div>
                  ) : null,
                )}
                {extraFields.map((f) => (
                  <div
                    key={f.label}
                    className="grid grid-cols-[110px_1fr] items-baseline gap-2 text-[11px]"
                  >
                    <dt className="uppercase tracking-[0.18em] text-neutral-400">{f.label}</dt>
                    <dd className="font-semibold tracking-wide text-neutral-800">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>

          {/* ---- Right: images sliding two-by-two ---- */}
          <section
            aria-label="Photo gallery"
            className="h-[70vh] w-full md:h-[calc(100vh-4rem)] md:w-[calc(100%-300px)] md:ml-[300px] lg:w-[calc(100%-360px)] lg:ml-[360px]"
          >
            <Slideshow images={category.images} title={category.title} />
          </section>
        </div>
      </main>
    </div>
  )
}