'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Lock } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await loginAction(password)
      if (res.ok) {
        router.replace('/admin')
        router.refresh()
      } else {
        setError(res.error ?? 'خطایی رخ داد.')
      }
    })
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-lg bg-white p-8 shadow-sm border">
      <div className="flex flex-col items-center gap-2 pb-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Lock className="h-5 w-5 text-neutral-600" />
        </div>
        <h1 className="text-lg font-bold text-neutral-900">پنل مدیریت گالری</h1>
        <p className="text-xs text-neutral-500">برای ورود، رمز عبور را وارد کنید</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700">
          رمز عبور
        </label>
        <Input
          id="password"
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoFocus
          required
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        ورود به پنل
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-neutral-400">
        رمز پیش‌فرض: <code dir="ltr" className="rounded bg-neutral-100 px-1 py-0.5">admin123</code>
        <br />
        (از طریق فایل .env قابل تغییر است)
      </p>
    </form>
  )
}
