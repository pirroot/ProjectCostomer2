import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import { RichText } from '@/components/richtext'
import { getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact',
}

export default async function ContactPage() {
  const settings = await getSettings()

  const items = [
    { label: 'Email', value: settings.contactEmail, href: settings.contactEmail ? `mailto:${settings.contactEmail}` : null },
    { label: 'Phone', value: settings.contactPhone, href: settings.contactPhone ? `tel:${settings.contactPhone.replace(/\s+/g, '')}` : null },
    { label: 'Instagram', value: settings.contactInstagram, href: settings.contactInstagram ? `https://instagram.com/${settings.contactInstagram.replace(/^@/, '')}` : null },
  ].filter((i) => i.value.trim().length > 0)

  return (
    <div className="min-h-[100dvh] bg-white">
      <SiteHeader siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />

      <main className="mx-auto w-full max-w-xl px-6 pb-24 pt-16 md:pt-28">
        <h1 className="mb-8 text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
          Contact
        </h1>

        {settings.contactNote.trim() && (
          <RichText
            text={settings.contactNote}
            className="mb-10 space-y-3 text-[15px] leading-[1.9] text-neutral-700 [&_strong]:font-bold [&_strong]:text-neutral-900"
          />
        )}

        {items.length > 0 && (
          <dl className="space-y-4">
            {items.map((item) => (
              <div key={item.label} className="grid grid-cols-[110px_1fr] items-baseline text-[13px]">
                <dt className="uppercase tracking-[0.18em] text-neutral-400">{item.label}</dt>
                <dd className="font-semibold text-neutral-900">
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="underline-offset-4 transition hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </main>
    </div>
  )
}
