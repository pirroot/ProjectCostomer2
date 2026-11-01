import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import CategoryForm from '@/components/admin/category-form'
import ImagesManager from '@/components/admin/images-manager'
import { getCategoryById } from '@/lib/data'
import { parseExtraFields } from '@/lib/extra'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function AdminCategoryPage({ params }: PageProps) {
  const { id } = await params
  const category = await getCategoryById(id)
  if (!category) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex h-9 w-9 items-center justify-center rounded-md border bg-white transition hover:bg-neutral-50"
          aria-label="بازگشت به لیست دسته‌ها"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{category.title}</h1>
          <p dir="ltr" className="mt-0.5 text-right text-[11px] text-neutral-400">
            /project/{category.slug}
          </p>
        </div>
      </div>

      <CategoryForm
        initial={{
          id: category.id,
          title: category.title,
          slug: category.slug,
          client: category.client,
          projectTitle: category.projectTitle,
          year: category.year,
          category: category.category,
          location: category.location,
          role: category.role,
          description: category.description,
          descriptionFa: category.descriptionFa,
          extra: parseExtraFields(category.extraFields),
        }}
      />

      <ImagesManager
        categoryId={category.id}
        images={category.images.map((i) => ({
          id: i.id,
          file: i.file,
          width: i.width,
          height: i.height,
          order: i.order,
        }))}
        coverImageId={category.coverImageId}
      />
    </div>
  )
}