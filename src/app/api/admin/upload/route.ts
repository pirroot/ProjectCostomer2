import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILES = 30
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

/** Uploaded originals live OUTSIDE public/ and are served by the /media route.
 *  This keeps working identically in `next dev`, `next start` and standalone. */
function uploadsDir(): string {
  return path.join(process.cwd(), 'data', 'uploads')
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(uploadsDir(), { recursive: true })
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 })
  }

  const type = String(form.get('type') ?? 'images')

  /* ---------- site logo (admin settings) ---------- */
  if (type === 'logo') {
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: 'فایلی انتخاب نشده است.' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'حجم لوگو حداکثر ۵ مگابایت است.' }, { status: 400 })
    }
    try {
      await ensureDir()
      const buf = Buffer.from(await file.arrayBuffer())
      const out = `logo-${Date.now()}.png`
      await sharp(buf)
        .resize({ width: 900, height: 320, fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toFile(path.join(uploadsDir(), out))
      const url = `/media/${out}`
      await db.setting.upsert({
        where: { key: 'logoUrl' },
        create: { key: 'logoUrl', value: url },
        update: { value: url },
      })
      revalidatePath('/', 'layout')
      return NextResponse.json({ ok: true, url })
    } catch {
      return NextResponse.json({ ok: false, error: 'پردازش تصویر ناموفق بود.' }, { status: 500 })
    }
  }

  /* ---------- about page portrait (3:4) ---------- */
  if (type === 'about') {
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: 'فایلی انتخاب نشده است.' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, error: 'حجم عکس حداکثر ۲۵ مگابایت است.' }, { status: 400 })
    }
    try {
      await ensureDir()
      const buf = Buffer.from(await file.arrayBuffer())
      const out = `about-${Date.now()}.jpg`
      await sharp(buf)
        .rotate()
        .resize({ width: 1400, height: 1867, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 88 })
        .toFile(path.join(uploadsDir(), out))
      const url = `/media/${out}`
      await db.setting.upsert({
        where: { key: 'aboutImage' },
        create: { key: 'aboutImage', value: url },
        update: { value: url },
      })
      revalidatePath('/', 'layout')
      return NextResponse.json({ ok: true, url })
    } catch {
      return NextResponse.json({ ok: false, error: 'پردازش تصویر ناموفق بود.' }, { status: 500 })
    }
  }

  /* ---------- category photos ---------- */
  const categoryId = String(form.get('categoryId') ?? '')
  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  if (!categoryId || files.length === 0) {
    return NextResponse.json({ ok: false, error: 'درخواست نامعتبر است.' }, { status: 400 })
  }

  const category = await db.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    return NextResponse.json({ ok: false, error: 'دسته پیدا نشد.' }, { status: 404 })
  }

  await ensureDir()
  const maxOrder = await db.image.aggregate({
    where: { categoryId },
    _max: { order: true },
  })
  let nextOrder = (maxOrder._max.order ?? 0) + 1

  let saved = 0
  let firstId: string | null = null

  for (const file of files.slice(0, MAX_FILES)) {
    if (!file.type.startsWith('image/')) continue
    if (file.size > MAX_FILE_SIZE) continue
    try {
      const buf = Buffer.from(await file.arrayBuffer())
      const image = sharp(buf).rotate()
      const meta = await image.metadata()
      const width = meta.width ?? 0
      const height = meta.height ?? 0
      const out = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}.jpg`
      await image
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(path.join(uploadsDir(), out))

      const created = await db.image.create({
        data: {
          categoryId,
          file: `/media/${out}`,
          width,
          height,
          order: nextOrder++,
        },
      })
      if (!firstId) firstId = created.id
      saved++
    } catch {
      /* skip unreadable file */
    }
  }

  // first upload becomes the cover automatically
  if (saved > 0 && !category.coverImageId && firstId) {
    await db.category.update({
      where: { id: categoryId },
      data: { coverImageId: firstId },
    })
  }

  if (saved === 0) {
    return NextResponse.json(
      { ok: false, error: 'هیچ فایل تصویر معتبری ذخیره نشد (حداکثر ۲۵ مگابایت).' },
      { status: 400 },
    )
  }

  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true, count: saved })
}