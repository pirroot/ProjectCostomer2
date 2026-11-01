'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2 } from 'lucide-react'
import { saveCategory } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DescEditor from '@/components/admin/desc-editor'
import { MAX_EXTRA_FIELDS, serializeExtraFields, type ExtraField } from '@/lib/extra'
import { toast } from 'sonner'

export type CategoryFormValues = {
  id: string
  title: string
  slug: string
  titleFa: string
  client: string
  projectTitle: string
  year: string
  category: string
  location: string
  role: string
  description: string
  extra: ExtraField[]
}

// fixed metadata block, in the exact order requested by the client
const FIELDS: Array<{ key: keyof CategoryFormValues; label: string; placeholder: string; ltr?: boolean }> = [
  { key: 'title', label: 'عنوان / اسم فولدر (انگلیسی)', placeholder: 'Automotive', ltr: true },
  { key: 'slug', label: 'نامک / آدرس صفحه', placeholder: 'automotive', ltr: true },
  { key: 'titleFa', label: 'عنوان فارسی (با دکمه i در صفحه پروژه دیده می‌شود)', placeholder: 'خودرو', ltr: false },
  { key: 'client', label: 'Client — کارفرما', placeholder: 'Range Rover', ltr: true },
  { key: 'projectTitle', label: 'Project Title — عنوان پروژه', placeholder: 'Highland Drive', ltr: true },
  { key: 'year', label: 'Year — سال', placeholder: '2025', ltr: true },
  { key: 'category', label: 'Category — دسته‌بندی', placeholder: 'Automotive', ltr: true },
  { key: 'location', label: 'Location — مکان', placeholder: 'Scottish Highlands, UK', ltr: true },
  { key: 'role', label: 'Role — نقش', placeholder: 'Photographer', ltr: true },
]

export default function CategoryForm({ initial }: { initial: CategoryFormValues }) {
  const router = useRouter()
  const [values, setValues] = useState<CategoryFormValues>(initial)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof CategoryFormValues>(key: K, v: CategoryFormValues[K]) {
    setValues((s) => ({ ...s, [key]: v }))
  }

  function setExtra(i: number, patch: Partial<ExtraField>) {
    setValues((s) => ({
      ...s,
      extra: s.extra.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }))
  }

  function addExtra() {
    setValues((s) =>
      s.extra.length >= MAX_EXTRA_FIELDS ? s : { ...s, extra: [...s.extra, { label: '', value: '' }] },
    )
  }

  function removeExtra(i: number) {
    setValues((s) => ({ ...s, extra: s.extra.filter((_, idx) => idx !== i) }))
  }

  function save() {
    startTransition(async () => {
      const res = await saveCategory({
        id: values.id,
        title: values.title,
        slug: values.slug,
        titleFa: values.titleFa,
        client: values.client,
        projectTitle: values.projectTitle,
        year: values.year,
        category: values.category,
        location: values.location,
        role: values.role,
        description: values.description,
        extraFields: serializeExtraFields(values.extra),
      })
      if (res.ok) {
        toast.success('تغییرات ذخیره شد و در سایت اعمال شد.')
        router.refresh()
      } else {
        toast.error(res.error ?? 'ذخیره ناموفق بود.')
      }
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="space-y-5 rounded-lg border bg-white p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-2">
            <label className="block text-sm font-medium">{f.label}</label>
            <Input
              dir={f.ltr ? 'ltr' : undefined}
              value={values[f.key] as string}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      {/* ---- optional custom fields (add / remove) ---- */}
      <div className="space-y-3 rounded-md border border-dashed p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="block text-sm font-medium">فیلدهای اضافه (اختیاری)</span>
            <span className="block text-[11px] text-neutral-400">
              اگر پروژه‌ای یک یا دو عنوان دیگری هم لازم داشت، همین‌جا اضافه و کم کنید — زیر بقیه موارد در سایت نمایش داده می‌شود.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={values.extra.length >= MAX_EXTRA_FIELDS}
            onClick={addExtra}
          >
            <Plus className="ml-1 h-4 w-4" />
            افزودن فیلد
          </Button>
        </div>

        {values.extra.length === 0 ? (
          <p className="text-[11px] text-neutral-300">مثلاً: Camera / Equipment / Team …</p>
        ) : (
          <div className="space-y-2">
            {values.extra.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  dir="ltr"
                  className="w-2/5"
                  placeholder="LABEL (مثل Camera)"
                  value={f.label}
                  onChange={(e) => setExtra(i, { label: e.target.value })}
                />
                <Input
                  dir="ltr"
                  className="flex-1"
                  placeholder="Value (مثل Medium Format)"
                  value={f.value}
                  onChange={(e) => setExtra(i, { value: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-red-500 hover:text-red-600"
                  aria-label="حذف فیلد"
                  onClick={() => removeExtra(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DescEditor
        label="توضیحات پروژه (سمت چپ صفحه دسته نمایش داده می‌شود)"
        hint="می‌توانید بخشی از متن را انتخاب و دکمه B را بزنید تا بولد شود. هر خط خالی = پاراگراف جدید."
        value={values.description}
        onChange={(v) => set('description', v)}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          <Save className="ml-1 h-4 w-4" />
          ذخیره تغییرات
        </Button>
        <span className="text-[11px] text-neutral-400">
          بعد از ذخیره، سایت بلافاصله به‌روز می‌شود.
        </span>
      </div>
    </form>
  )
}
