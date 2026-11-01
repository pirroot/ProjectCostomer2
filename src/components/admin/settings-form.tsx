'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react'
import { clearAboutImage, clearLogo, saveSettings } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DescEditor from '@/components/admin/desc-editor'
import { toast } from 'sonner'

export type SettingsValues = {
  siteTitle: string
  logoUrl: string
  aboutTitle: string
  aboutBody: string
  aboutImage: string
  contactEmail: string
  contactPhone: string
  contactInstagram: string
  contactNote: string
}

export default function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter()
  const [values, setValues] = useState<SettingsValues>(initial)
  const [pending, startTransition] = useTransition()
  const [logoBusy, setLogoBusy] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [aboutBusy, setAboutBusy] = useState(false)
  const aboutInputRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof SettingsValues>(key: K, v: string) {
    setValues((s) => ({ ...s, [key]: v }))
  }

  async function uploadLogo(file: File | undefined | null) {
    if (!file) return
    setLogoBusy(true)
    try {
      const fd = new FormData()
      fd.append('type', 'logo')
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.ok) {
        setValues((s) => ({ ...s, logoUrl: data.url }))
        toast.success('لوگو آپلود شد و در سایت اعمال شد.')
        router.refresh()
      } else {
        toast.error(data.error ?? 'آپلود لوگو ناموفق بود.')
      }
    } catch {
      toast.error('خطا در آپلود — اتصال اینترنت را بررسی کنید.')
    } finally {
      setLogoBusy(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  function removeLogo() {
    startTransition(async () => {
      const res = await clearLogo()
      if (res.ok) {
        setValues((s) => ({ ...s, logoUrl: '' }))
        toast.success('لوگو حذف شد؛ نام سایت جای آن نمایش داده می‌شود.')
        router.refresh()
      } else {
        toast.error(res.error ?? 'حذف ناموفق بود.')
      }
    })
  }

  function removeAboutImage() {
    startTransition(async () => {
      const res = await clearAboutImage()
      if (res.ok) {
        setValues((s) => ({ ...s, aboutImage: '' }))
        toast.success('عکس صفحه درباره حذف شد.')
        router.refresh()
      } else {
        toast.error(res.error ?? 'حذف ناموفق بود.')
      }
    })
  }

  async function uploadAboutImage(file: File | undefined | null) {
    if (!file) return
    setAboutBusy(true)
    try {
      const fd = new FormData()
      fd.append('type', 'about')
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.ok) {
        setValues((s) => ({ ...s, aboutImage: data.url }))
        toast.success('عکس صفحه درباره آپلود شد.')
        router.refresh()
      } else {
        toast.error(data.error ?? 'آپلود عکس ناموفق بود.')
      }
    } catch {
      toast.error('خطا در آپلود — اتصال اینترنت را بررسی کنید.')
    } finally {
      setAboutBusy(false)
      if (aboutInputRef.current) aboutInputRef.current.value = ''
    }
  }

  function save() {
    startTransition(async () => {
      const res = await saveSettings({ ...values })
      if (res.ok) {
        toast.success('تنظیمات ذخیره شد.')
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
      className="space-y-8"
    >
      {/* ---- brand: name or logo ---- */}
      <section className="space-y-4 rounded-lg border bg-white p-5">
        <h2 className="text-sm font-bold">هدر سایت — نام یا لوگو</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium">نام سایت / عکاس</label>
          <Input
            dir="ltr"
            value={values.siteTitle}
            onChange={(e) => set('siteTitle', e.target.value)}
            placeholder="SEBASTIAN WOLF"
          />
          <p className="text-[11px] text-neutral-400">
            اگر لوگو آپلود کنید، به‌جای این نام در بالای همه صفحه‌ها نمایش داده می‌شود.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {values.logoUrl ? (
            <div className="flex items-center gap-3 rounded-md border bg-neutral-50 p-3">
              <img src={values.logoUrl} alt="لوگوی سایت" className="h-10 w-auto object-contain" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeLogo}
                disabled={logoBusy || pending}
              >
                <Trash2 className="ml-1 h-3.5 w-3.5" />
                حذف لوگو
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-3 text-[11px] text-neutral-400">
              لوگویی آپلود نشده — فعلاً نام سایت نمایش داده می‌شود.
            </div>
          )}

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadLogo(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => logoInputRef.current?.click()}
            disabled={logoBusy}
          >
            {logoBusy ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <ImagePlus className="ml-1 h-4 w-4" />}
            {logoBusy ? 'در حال آپلود…' : 'آپلود لوگو'}
          </Button>
        </div>
        <p className="text-[11px] text-neutral-400">
          بهترین حالت: PNG با پس‌زمینه شفاف — به‌طور خودکار تا عرض ۹۰۰ پیکسل بهینه می‌شود.
        </p>
      </section>

      <section className="space-y-4 rounded-lg border bg-white p-5">
        <h2 className="text-sm font-bold">صفحه About Me</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium">عنوان صفحه</label>
          <Input
            value={values.aboutTitle}
            onChange={(e) => set('aboutTitle', e.target.value)}
            placeholder="درباره من"
          />
        </div>
        <DescEditor
          label="متن درباره من"
          hint="می‌توانید فارسی یا انگلیسی بنویسید؛ انتخاب متن + دکمه B = بولد."
          value={values.aboutBody}
          onChange={(v) => set('aboutBody', v)}
          minHeight={140}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium">عکس صفحه درباره (نسبت ۳ در ۴)</label>
          <div className="flex flex-wrap items-center gap-4">
            {values.aboutImage ? (
              <div className="flex items-center gap-3 rounded-md border bg-neutral-50 p-3">
                <img
                  src={values.aboutImage}
                  alt="عکس صفحه درباره"
                  className="h-28 w-21 rounded object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeAboutImage}
                  disabled={aboutBusy || pending}
                >
                  <Trash2 className="ml-1 h-3.5 w-3.5" />
                  حذف عکس
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-[11px] text-neutral-400">
                هنوز عکسی برای صفحه درباره گذاشته نشده است.
              </div>
            )}

            <input
              ref={aboutInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadAboutImage(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => aboutInputRef.current?.click()}
              disabled={aboutBusy}
            >
              {aboutBusy ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <ImagePlus className="ml-1 h-4 w-4" />}
              {aboutBusy ? 'در حال آپلود…' : 'آپلود عکس'}
            </Button>
          </div>
          <p className="text-[11px] text-neutral-400">
            بهترین حالت: عکس عمودی با نسبت ۳ به ۴ (مثل ۱۲۰۰×۱۶۰۰ پیکسل) — بالای متن صفحه «About Me» و به بزرگی ستون متن نمایش داده می‌شود.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-white p-5">
        <h2 className="text-sm font-bold">صفحه Contact</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium">ایمیل</label>
            <Input
              dir="ltr"
              type="email"
              value={values.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              placeholder="hello@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">تلفن</label>
            <Input
              dir="ltr"
              value={values.contactPhone}
              onChange={(e) => set('contactPhone', e.target.value)}
              placeholder="+98 912 ..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">اینستاگرام</label>
            <Input
              dir="ltr"
              value={values.contactInstagram}
              onChange={(e) => set('contactInstagram', e.target.value)}
              placeholder="@username"
            />
          </div>
        </div>
        <DescEditor
          label="یادداشت بالای صفحه تماس (اختیاری)"
          value={values.contactNote}
          onChange={(v) => set('contactNote', v)}
          minHeight={100}
        />
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          <Save className="ml-1 h-4 w-4" />
          ذخیره تنظیمات
        </Button>
        <span className="text-[11px] text-neutral-400">
          تغییرات بلافاصله در هدر، صفحه About و صفحه Contact سایت اعمال می‌شود.
        </span>
      </div>
    </form>
  )
}