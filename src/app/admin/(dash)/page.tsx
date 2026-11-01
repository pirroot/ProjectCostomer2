import Link from 'next/link'
import { getCategories } from '@/lib/data'
import CategoriesList from '@/components/admin/categories-list'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const categories = await getCategories()

  const rows = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    imageCount: c.images.length,
    coverFile: (c.images.find((i) => i.id === c.coverImageId) ?? c.images[0])?.file ?? null,
  }))

  return (
    <div className="space-y-6">
      <CategoriesList rows={rows} />
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        نکته: عکس‌هایی که الان در سایت می‌بینید نمونه (placeholder) هستند. وارد هر دسته شوید،
        عکس‌های واقعی را آپلود کنید و کاور هر دسته را انتخاب کنید تا در صفحه اصلی نمایش داده شود.
      </p>
    </div>
  )
}
