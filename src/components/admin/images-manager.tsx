'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from 'lucide-react'
import { deleteImage, moveImage, setCover } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'

export type AdminImage = {
  id: string
  file: string
  width: number
  height: number
  order: number
}

type Props = {
  categoryId: string
  images: AdminImage[]
  coverImageId: string | null
}

export default function ImagesManager({ categoryId, images, coverImageId }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return
    const fd = new FormData()
    fd.append('categoryId', categoryId)
    Array.from(files).forEach((f) => fd.append('files', f))
    setUploading(true)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(`${data.count} عکس آپلود شد.`)
        router.refresh()
      } else {
        toast.error(data.error ?? 'آپلود ناموفق بود.')
      }
    } catch {
      toast.error('خطا در آپلود — اتصال اینترنت را بررسی کنید.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function act(fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        if (success) toast.success(success)
        router.refresh()
      } else {
        toast.error(res.error ?? 'عملیات ناموفق بود.')
      }
    })
  }

  function remove() {
    if (!deleteId) return
    act(() => deleteImage(deleteId), 'عکس حذف شد.')
    setDeleteId(null)
  }

  const target = images.find((i) => i.id === deleteId)

  return (
    <div className="space-y-4 rounded-lg border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">عکس‌های این دسته ({images.length})</h2>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            ترتیب عکس‌ها همان ترتیب نمایش در سایت است — با فلش‌ها جابه‌جا کنید. عکس ستاره‌دار،
            کاور صفحه اصلی است. بهترین رزولوشن: حدود ۱۶۰۰×۱۰۶۷ پیکسل یا بزرگ‌تر.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <ImagePlus className="ml-1 h-4 w-4" />}
          {uploading ? 'در حال آپلود…' : 'آپلود عکس جدید'}
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-neutral-400">
          هنوز عکسی آپلود نشده است.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, idx) => {
            const isCover = img.id === coverImageId
            return (
              <li key={img.id} className="group relative overflow-hidden rounded-md border bg-neutral-100">
                <div className="relative aspect-[4/3]">
                  { }
                  <img src={img.file} alt="" className="h-full w-full object-cover" />
                  {isCover && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      <Star className="h-3 w-3" />
                      کاور
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white" dir="ltr">
                    {img.width}×{img.height}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 border-t bg-white px-1.5 py-1.5">
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="جابه‌جایی به قبل"
                      disabled={pending || idx === 0}
                      onClick={() => act(() => moveImage(img.id, 'prev'))}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="جابه‌جایی به بعد"
                      disabled={pending || idx === images.length - 1}
                      onClick={() => act(() => moveImage(img.id, 'next'))}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-amber-600 hover:text-amber-700"
                      aria-label="تبدیل به کاور"
                      disabled={pending || isCover}
                      onClick={() => act(() => setCover(categoryId, img.id), 'این عکس کاور دسته شد.')}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-700"
                      aria-label="حذف عکس"
                      onClick={() => setDeleteId(img.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent dir="rtl" className="font-admin">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف این عکس؟</AlertDialogTitle>
            <AlertDialogDescription>
              عکس از سایت و از سرور حذف می‌شود و قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 text-white hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
