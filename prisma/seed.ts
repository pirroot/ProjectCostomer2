/**
 * Seed the portfolio database with 10 sample categories,
 * 8 placeholder images each, and default site settings.
 * Run: bun prisma/seed.ts   (or: npx tsx prisma/seed.ts)
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const CATEGORIES: Array<{
  slug: string
  title: string
  titleFa: string
  client: string
  projectTitle: string
  year: string
  category: string
  location: string
  role: string
  extraFields?: Array<{ label: string; value: string }>
}> = [
  {
    slug: 'mountaineering',
    title: 'Mountaineering',
    titleFa: 'کوهنوردی',
    client: 'Alpine Journal',
    projectTitle: 'White Silence',
    year: '2025',
    category: 'Expedition',
    location: 'Alborz Range, Iran',
    role: 'Photographer',
  },
  {
    slug: 'sport-climbing',
    title: 'Sport Climbing',
    titleFa: 'دیواره‌نوردی',
    client: 'Grip Magazine',
    projectTitle: 'Chalk & Rock',
    year: '2025',
    category: 'Sports',
    location: 'Bisotun, Iran',
    role: 'Photographer',
  },
  {
    slug: 'portraits',
    title: 'Portraits',
    titleFa: 'پرتره',
    client: 'Private Commissions',
    projectTitle: 'Faces',
    year: '2024',
    category: 'Studio & Environmental',
    location: 'Tehran, Iran',
    role: 'Photographer',
  },
  {
    slug: 'automotive',
    title: 'Automotive',
    titleFa: 'خودرو',
    client: 'Range Rover',
    projectTitle: 'Highland Drive',
    year: '2025',
    category: 'Automotive',
    location: 'Scottish Highlands, UK',
    role: 'Campaign Photographer',
    extraFields: [{ label: 'Camera', value: 'Medium Format' }],
  },
  {
    slug: 'landscape',
    title: 'Landscape',
    titleFa: 'منظره',
    client: 'Personal Work',
    projectTitle: 'Empty Horizons',
    year: '2024',
    category: 'Fine Art',
    location: 'Desert & Coast',
    role: 'Photographer',
  },
  {
    slug: 'street',
    title: 'Street',
    titleFa: 'خیابان',
    client: 'Ongoing Series',
    projectTitle: 'City Rhythms',
    year: '2023 — 2025',
    category: 'Documentary',
    location: 'Tehran, Iran',
    role: 'Photographer',
  },
  {
    slug: 'wildlife',
    title: 'Wildlife',
    titleFa: 'حیات وحش',
    client: 'Nature Fund',
    projectTitle: 'Wild Golestan',
    year: '2024',
    category: 'Wildlife',
    location: 'Golestan Forest',
    role: 'Photographer',
  },
  {
    slug: 'architecture',
    title: 'Architecture',
    titleFa: 'معماری',
    client: 'Studio Naar',
    projectTitle: 'Lines of Isfahan',
    year: '2025',
    category: 'Architecture',
    location: 'Isfahan, Iran',
    role: 'Photographer',
  },
  {
    slug: 'wedding',
    title: 'Wedding',
    titleFa: 'عروسی',
    client: 'Private Commissions',
    projectTitle: 'Quiet Vows',
    year: '2024',
    category: 'Events',
    location: 'Northern Iran',
    role: 'Photographer',
  },
  {
    slug: 'fashion',
    title: 'Fashion',
    titleFa: 'مد',
    client: 'Atelier Reza',
    projectTitle: 'Atelier Nights',
    year: '2025',
    category: 'Editorial',
    location: 'Tehran, Iran',
    role: 'Fashion Photographer',
  },
]

const DEFAULT_SETTINGS: Record<string, string> = {
  siteTitle: 'YOUR NAME',
  siteTagline: '',
  logoUrl: '',
  aboutTitle: 'ABOUT ME',
  aboutBody: '',
  contactEmail: '',
  contactPhone: '',
  contactInstagram: '',
  contactNote: '',
}

async function main() {
  await db.image.deleteMany()
  await db.category.deleteMany()
  await db.setting.deleteMany()

  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i]
    const created = await db.category.create({
      data: {
        slug: c.slug,
        title: c.title,
        titleFa: c.titleFa,
        client: c.client,
        projectTitle: c.projectTitle,
        year: c.year,
        category: c.category,
        location: c.location,
        role: c.role,
        description: '',
        extraFields: JSON.stringify(c.extraFields ?? []),
        order: i + 1,
      },
    })
    const files = Array.from(
      { length: 8 },
      (_, k) => `/uploads/samples/${c.slug}/img-${String(k + 1).padStart(2, '0')}.jpg`
    )
    const sizes: Array<[number, number]> = [
      [1600, 1067],
      [1067, 1600],
      [1600, 1067],
      [1400, 1050],
      [1600, 1067],
      [1200, 1600],
      [1600, 1067],
      [1600, 1067],
    ]
    let coverId: string | null = null
    for (let k = 0; k < files.length; k++) {
      const img = await db.image.create({
        data: {
          categoryId: created.id,
          file: files[k],
          width: sizes[k][0],
          height: sizes[k][1],
          order: k + 1,
        },
      })
      if (k === 0) coverId = img.id
    }
    await db.category.update({ where: { id: created.id }, data: { coverImageId: coverId } })
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.setting.create({ data: { key, value } })
  }

  const cats = await db.category.count()
  const imgs = await db.image.count()
  console.log(`Seeded: ${cats} categories, ${imgs} images, ${Object.keys(DEFAULT_SETTINGS).length} settings`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
