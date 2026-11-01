import { db } from '@/lib/db'

export type CategoryWithImages = Awaited<ReturnType<typeof getCategoryBySlug>>

export async function getCategories() {
  return db.category.findMany({
    orderBy: { order: 'asc' },
    include: { images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
  })
}

export async function getCategoryBySlug(slug: string) {
  const category = await db.category.findUnique({
    where: { slug },
    include: { images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
  })
  return category
}

export async function getCategoryById(id: string) {
  return db.category.findUnique({
    where: { id },
    include: { images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
  })
}

/** Home strip: every category with its chosen cover image (fallback: first image). */
export async function getHomeStrip() {
  const categories = await getCategories()
  return categories
    .map((c) => {
      const cover = c.images.find((i) => i.id === c.coverImageId) ?? c.images[0]
      return cover ? { slug: c.slug, title: c.title, file: cover.file } : null
    })
    .filter((x): x is { slug: string; title: string; file: string } => x !== null)
}

export type Settings = {
  siteTitle: string
  siteTagline: string
  logoUrl: string
  aboutTitle: string
  aboutBody: string
  contactEmail: string
  contactPhone: string
  contactInstagram: string
  contactNote: string
}

const FALLBACK_SETTINGS: Settings = {
  siteTitle: 'YOUR NAME',
  siteTagline: 'VISUAL STORYTELLING',
  logoUrl: '',
  aboutTitle: 'ABOUT ME',
  aboutBody: '',
  contactEmail: '',
  contactPhone: '',
  contactInstagram: '',
  contactNote: '',
}

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany()
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return { ...FALLBACK_SETTINGS, ...map } as Settings
}
