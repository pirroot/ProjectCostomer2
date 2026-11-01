import SettingsForm from '@/components/admin/settings-form'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">تنظیمات سایت</h1>
        <p className="mt-1 text-xs text-neutral-500">
          لوگو، نام سایت، متن About و اطلاعات تماس — همه از همین‌جا قابل تغییر است.
        </p>
      </div>

      <SettingsForm
        initial={{
          siteTitle: settings.siteTitle,
          logoUrl: settings.logoUrl,
          aboutTitle: settings.aboutTitle,
          aboutBody: settings.aboutBody,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
          contactInstagram: settings.contactInstagram,
          contactNote: settings.contactNote,
        }}
      />
    </div>
  )
}
