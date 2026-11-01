import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ExternalLink, LogOut, Settings } from 'lucide-react'
import { logoutAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { isAdmin } from '@/lib/auth'
import { Toaster } from '@/components/ui/sonner'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'پنل مدیریت',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect('/admin/login')

  return (
    <div dir="rtl" className="font-admin min-h-[100dvh] bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-bold">
              پنل مدیریت گالری
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-1 text-xs text-neutral-500 transition hover:text-neutral-900"
            >
              <Settings className="h-3.5 w-3.5" />
              تنظیمات سایت
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-xs text-neutral-500">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
                مشاهده سایت
              </a>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700">
                <LogOut className="ml-1 h-3.5 w-3.5" />
                خروج
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <Toaster position="top-center" richColors dir="rtl" />
    </div>
  )
}
