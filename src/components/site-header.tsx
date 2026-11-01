'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  siteTitle: string
  logoUrl?: string
}

/**
 * Minimal photography-portfolio header, mirrors the reference layout:
 * CONTACT (left) — LOGO / NAME (center) — PROJECT / ABOUT ME (right).
 * When a logo is uploaded from the admin panel it replaces the text name.
 * On mobile it becomes a two-row header (brand on top, nav below).
 */
export default function SiteHeader({ siteTitle, logoUrl }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/project' ? pathname === '/project' || pathname.startsWith('/project/') : pathname.startsWith(href)

  const cls = (href: string, extra = '') =>
    `transition-colors hover:text-neutral-900 ${
      isActive(href) ? 'text-neutral-900' : 'text-neutral-400'
    } ${extra}`

  const brand = (
    <Link
      href="/"
      aria-label={siteTitle}
      className="flex items-center justify-center text-neutral-900"
    >
      {logoUrl ? (
        // plain <img>: the logo is a client-managed file, next/image adds no value here
        <img
          src={logoUrl}
          alt={siteTitle}
          className="h-6 w-auto max-w-[150px] object-contain md:h-8 md:max-w-[220px]"
          draggable={false}
        />
      ) : (
        <span className="text-center">{siteTitle}</span>
      )}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* ---- Mobile: brand row + nav row ---- */}
      <div className="flex flex-col items-center gap-2 px-4 pb-2.5 pt-3 text-[10px] uppercase tracking-[0.18em] md:hidden">
        {brand}
        <nav aria-label="Main mobile" className="flex w-full items-center justify-between">
          <Link href="/contact" aria-current={isActive('/contact') ? 'page' : undefined} className={cls('/contact')}>
            Contact
          </Link>
          <Link
            href="/project"
            aria-current={isActive('/project') ? 'page' : undefined}
            className={cls('/project', pathname === '/' ? 'text-neutral-900' : '')}
          >
            Project
          </Link>
          <Link href="/about" aria-current={isActive('/about') ? 'page' : undefined} className={cls('/about')}>
            About&nbsp;Me
          </Link>
        </nav>
      </div>

      {/* ---- Desktop: single row like the reference ---- */}
      <nav
        aria-label="Main"
        className="relative hidden h-16 items-center justify-between px-10 text-[11px] uppercase tracking-[0.18em] md:flex"
      >
        <Link href="/contact" aria-current={isActive('/contact') ? 'page' : undefined} className={cls('/contact')}>
          Contact
        </Link>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{brand}</div>

        <div className="flex items-center gap-7">
          <Link
            href="/project"
            aria-current={isActive('/project') ? 'page' : undefined}
            className={cls('/project', pathname === '/' ? 'text-neutral-900' : '')}
          >
            Project
          </Link>
          <Link href="/about" aria-current={isActive('/about') ? 'page' : undefined} className={cls('/about')}>
            About&nbsp;Me
          </Link>
        </div>
      </nav>
    </header>
  )
}
