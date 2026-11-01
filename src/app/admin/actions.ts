'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { parseExtraFields, serializeExtraFields } from '@/lib/extra'
import {
  assertAdmin,
  checkPassword,
  clearAdminSession,
  setAdminSession,
} from '@/lib/auth'

export type ActionResult = { ok: boolean; error?: string }
export type CreateCategoryResult = { ok: boolean; id?: string; error?: string }

/** Absolute path of an uploaded file on disk (null when it is not a managed upload). */
function diskPath(fileUrl: string): string | null {
  if (fileUrl.startsWith('/media/')) {
    const name = fileUrl
      .slice('/media/'.length)
      .replace(/\\/g, '/')
      .split('/')
      .filter((p) => p && p !== '.' && p !== '..')
      .join('/')
    if (!name) return null
    return path.join(process.cwd(), 'data', 'uploads', name)
  }
  if (fileUrl.startsWith('/uploads/')) {
    return path.join(process.cwd(), 'public', fileUrl)
  }
  return null
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Refresh every public page that reads the DB. */
function revalidateSite() {
  revalidatePath('/', 'layout')
}

/* ---------------- auth ---------------- */

export async function loginAction(password: string): Promise<ActionResult> {
  if (!checkPassword(password)) {
    return { ok: false, error: 'رمز عبور اشتباه است.' }
  }
  await setAdminSession()
  return { ok: true }
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession()
  redirect('/admin/login')
}

/* ---------------- categories ---------------- */

export async function createCategory(title: string, slugInput: string): Promise<CreateCategoryResult> {
  await assertAdmin()
  const cleanTitle = title.trim()
  if (!cleanTitle) return { ok: false, error: 'عنوان دسته الزامی است.' }

  let slug = slugify(slugInput.trim() || cleanTitle)
  if (!slug) slug = `category-${Date.now()}`

  const exists = await db.category.findUnique({ where: { slug } })
  if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  // newest album goes to the TOP of the site and the admin list
  const first = await db.category.aggregate({ _min: { order: true } })
  const created = await db.category.create({
    data: {
      title: cleanTitle,
      slug,
      order: (first._min.order ?? 1) - 1,
      category: cleanTitle,
    },
  })
  revalidateSite()
  return { ok: true, id: created.id }
}

export async function saveCategory(data: {
  id: string
  title: string
  slug: string
  client: string
  projectTitle: string
  year: string
  category: string
  location: string
  role: string
  description: string
  descriptionFa: string
  extraFields: string
}): Promise<ActionResult> {
  await assertAdmin()
  const cleanTitle = data.title.trim()
  if (!cleanTitle) return { ok: false, error: 'عنوان دسته الزامی است.' }

  let slug = slugify(data.slug.trim() || cleanTitle)
  if (!slug) return { ok: false, error: 'نامک (slug) معتبر نیست.' }

  const current = await db.category.findUnique({ where: { id: data.id } })
  if (!current) return { ok: false, error: 'دسته پیدا نشد.' }

  if (slug !== current.slug) {
    const clash = await db.category.findUnique({ where: { slug } })
    if (clash) return { ok: false, error: 'این نامک قبلاً استفاده شده است.' }
  }

  await db.category.update({
    where: { id: data.id },
    data: {
      title: cleanTitle,
      slug,
      client: data.client.trim(),
      projectTitle: data.projectTitle.trim(),
      year: data.year.trim(),
      category: data.category.trim(),
      location: data.location.trim(),
      role: data.role.trim(),
      description: data.description ?? '',
      descriptionFa: data.descriptionFa ?? '',
      extraFields: serializeExtraFields(parseExtraFields(data.extraFields)),
    },
  })
  revalidateSite()
  return { ok: true }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await assertAdmin()
  const cat = await db.category.findUnique({ where: { id }, include: { images: true } })
  if (!cat) return { ok: false, error: 'دسته پیدا نشد.' }

  // best-effort cleanup of local files
  for (const img of cat.images) {
    const p = diskPath(img.file)
    if (p) {
      try {
        await fs.unlink(p)
      } catch {
        /* file may already be gone */
      }
    }
  }
  await db.category.delete({ where: { id } })
  revalidateSite()
  return { ok: true }
}

export async function moveCategory(id: string, dir: 'up' | 'down'): Promise<ActionResult> {
  await assertAdmin()
  const all = await db.category.findMany({ orderBy: { order: 'asc' } })
  const idx = all.findIndex((c) => c.id === id)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (idx === -1 || swapIdx < 0 || swapIdx >= all.length) return { ok: true }

  const a = all[idx]
  const b = all[swapIdx]
  await db.category.update({ where: { id: a.id }, data: { order: b.order } })
  await db.category.update({ where: { id: b.id }, data: { order: a.order } })
  revalidateSite()
  return { ok: true }
}

/* ---------------- images ---------------- */

export async function deleteImage(id: string): Promise<ActionResult> {
  await assertAdmin()
  const img = await db.image.findUnique({ where: { id } })
  if (!img) return { ok: false, error: 'عکس پیدا نشد.' }

  if (img.file.startsWith('/uploads/') || img.file.startsWith('/media/')) {
    const p = diskPath(img.file)
    if (p) {
      try {
        await fs.unlink(p)
      } catch {
        /* ignore */
      }
    }
  }
  await db.image.delete({ where: { id } })

  // if the cover was deleted, point the cover to the first remaining image
  const cat = await db.category.findUnique({
    where: { id: img.categoryId },
    include: { images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
  })
  if (cat && cat.coverImageId === id) {
    await db.category.update({
      where: { id: cat.id },
      data: { coverImageId: cat.images[0]?.id ?? null },
    })
  }
  revalidateSite()
  return { ok: true }
}

export async function moveImage(id: string, dir: 'prev' | 'next'): Promise<ActionResult> {
  await assertAdmin()
  const img = await db.image.findUnique({ where: { id } })
  if (!img) return { ok: false, error: 'عکس پیدا نشد.' }

  const siblings = await db.image.findMany({
    where: { categoryId: img.categoryId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  const idx = siblings.findIndex((i) => i.id === id)
  const swapIdx = dir === 'prev' ? idx - 1 : idx + 1
  if (idx === -1 || swapIdx < 0 || swapIdx >= siblings.length) return { ok: true }

  const a = siblings[idx]
  const b = siblings[swapIdx]
  await db.image.update({ where: { id: a.id }, data: { order: b.order } })
  await db.image.update({ where: { id: b.id }, data: { order: a.order } })
  revalidateSite()
  return { ok: true }
}

export async function setCover(categoryId: string, imageId: string): Promise<ActionResult> {
  await assertAdmin()
  const img = await db.image.findUnique({ where: { id: imageId } })
  if (!img || img.categoryId !== categoryId) {
    return { ok: false, error: 'عکس معتبر نیست.' }
  }
  await db.category.update({ where: { id: categoryId }, data: { coverImageId: imageId } })
  revalidateSite()
  return { ok: true }
}

/* ---------------- settings ---------------- */

export async function clearLogo(): Promise<ActionResult> {
  await assertAdmin()
  await db.setting.upsert({
    where: { key: 'logoUrl' },
    create: { key: 'logoUrl', value: '' },
    update: { value: '' },
  })
  revalidateSite()
  return { ok: true }
}

export async function clearAboutImage(): Promise<ActionResult> {
  await assertAdmin()
  await db.setting.upsert({
    where: { key: 'aboutImage' },
    create: { key: 'aboutImage', value: '' },
    update: { value: '' },
  })
  revalidateSite()
  return { ok: true }
}

export async function saveSettings(values: Record<string, string>): Promise<ActionResult> {
  await assertAdmin()
  const allowed = [
    'siteTitle',
    'siteTagline',
    'aboutTitle',
    'aboutBody',
    'contactEmail',
    'contactPhone',
    'contactInstagram',
    'contactNote',
  ]
  for (const key of allowed) {
    const value = values[key]
    if (typeof value !== 'string') continue
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  }
  revalidateSite()
  return { ok: true }
}