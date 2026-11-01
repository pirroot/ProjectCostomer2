import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import { RichText } from '@/components/richtext'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Me',
}

export default async function AboutPage() {
  const settings = await getSettings()

  return (
    <div className="min-h-[100dvh] bg-white">
      <SiteHeader siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />

      <main className="mx-auto w-full max-w-xl px-6 pb-24 pt-16 md:pt-28">
        <h1 className="mb-8 text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
          {settings.aboutTitle || 'About Me'}
        </h1>
        {settings.aboutBody.trim() && (
          <RichText
            text={settings.aboutBody}
            className="space-y-4 text-[15px] leading-[1.9] text-neutral-700 [&_strong]:font-bold [&_strong]:text-neutral-900"
          />
        )}
      </main>
    </div>
  )
}
