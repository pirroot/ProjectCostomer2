'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  createCategory,
  deleteCategory,
  moveCategory,
} from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export type AdminCategoryRow = {
  id: string
  slug: string
  title: string
  imageCount: number
  coverFile: string | null
}

export default function CategoriesList({ rows }: { rows: AdminCategoryRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')

  function suggestSlug(v: string) {
    setTitle(v)
    setSlug(
      v
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
    )
  }

  function create() {
    if (!title.trim()) {
      toast.error('عنوان دسته را وارد کنید.')
      return
    }
    startTransition(async () => {
      const res = await createCategory(title, slug)
      if (res.ok && res.id) {
        toast.success('دسته ساخته شد. حالا اطلاعات و عکس‌ها را اضافه کنید.')
        setOpen(false)
        setTitle('')
        setSlug('')
        router.push(`/admin/categories/${res.id}`)
      } else {
        toast.error(res.error ?? 'ساخت دسته ناموفق بود.')
      }
    })
  }

  function move(id: string, dir: 'up' | 'down') {
    startTransition(async () => {
      const res = await moveCategory(id, dir)
      if (res.ok) router.refresh()
      else toast.error(res.error ?? 'جابه‌جایی ناموفق بود.')
    })
  }

  function remove() {
    if (!deleteId) return
    startTransition(async () => {
      const res = await deleteCategory(deleteId)
      setDeleteId(null)
      if (res.ok) {
        toast.success('دسته و عکس‌های آن حذف شد.')
        router.refresh()
      } else {
        toast.error(res.error ?? 'حذف ناموفق بود.')
      }
    })
  }

  const target = rows.find((r) => r.id === deleteId)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">دسته‌های گالری</h1>
          <p className="mt-1 text-xs text-neutral-500">
            {rows.length} دسته — ترتیب نمایش در سایت از بالا به پایین است
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-1 h-4 w-4" />
              دسته جدید
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="font-admin sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ساخت دسته جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان دسته (انگلیسی)</label>
                <Input
                  value={title}
                  onChange={(e) => suggestSlug(e.target.value)}
                  placeholder="مثلاً: Portrait"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  نامک (slug) — در آدرس صفحه استفاده می‌شود
                </label>
                <Input
                  dir="ltr"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="portrait"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={create} disabled={pending}>
                ساخت دسته
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-12 text-center text-sm text-neutral-400">
          هنوز دسته‌ای وجود ندارد. اولین دسته را بسازید.
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, idx) => (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-lg border bg-white p-3 transition hover:shadow-sm"
            >
              {/* cover thumbnail */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {row.coverFile ? (
                   
                  <img src={row.coverFile} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-300">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate text-sm font-bold">{row.title}</span>
                </div>
                <div dir="ltr" className="mt-0.5 flex items-center gap-2 text-right text-[11px] text-neutral-400">
                  <code className="truncate">/project/{row.slug}</code>
                  <span>·</span>
                  <span>{row.imageCount} عکس</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="انتقال به بالا"
                  disabled={pending || idx === 0}
                  onClick={() => move(row.id, 'up')}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="انتقال به پایین"
                  disabled={pending || idx === rows.length - 1}
                  onClick={() => move(row.id, 'down')}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" aria-label="ویرایش">
                  <Link href={`/admin/categories/${row.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="حذف"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setDeleteId(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent dir="rtl" className="font-admin">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دسته «{target?.title}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              همه {target?.imageCount} عکس این دسته هم حذف می‌شود و این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              حذف قطعی
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
