import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/admin/login-form'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ورود به پنل مدیریت',
}

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin')

  return (
    <div dir="rtl" className="font-admin flex min-h-[100dvh] items-center justify-center bg-neutral-50 p-4">
      <LoginForm />
    </div>
  )
}
