import SiteHeader from '@/components/site-header'
import Marquee from '@/components/marquee'
import { getHomeStrip, getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

/**
 * Home = header (logo / name) + one big slow strip of cover images.
 * Client request: no other text on this page — the images fill the space
 * from the bottom up, leaving quiet white space above them.
 */
export default async function HomePage() {
  const [strip, settings] = await Promise.all([getHomeStrip(), getSettings()])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <SiteHeader siteTitle={settings.siteTitle} logoUrl={settings.logoUrl} />

      <main className="flex flex-1 flex-col justify-end" aria-label="Featured galleries">
        <h1 className="sr-only">{settings.siteTitle} — photography portfolio</h1>
        <Marquee items={strip} />
      </main>
    </div>
  )
}
