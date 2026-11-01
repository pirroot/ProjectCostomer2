'use client'

import { useRef } from 'react'
import { Bold, Italic, Eye } from 'lucide-react'
import { renderRichText } from '@/components/richtext'

type Props = {
  value: string
  onChange: (v: string) => void
  label?: string
  hint?: string
  minHeight?: number
}

/**
 * Lightweight markdown-lite editor: **bold**, *italic*, blank line = new paragraph.
 * Buttons wrap the current selection, live preview below.
 */
export default function DescEditor({ value, onChange, label, hint, minHeight = 180 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function wrap(before: string, after: string) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || 'متن'
    const next = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = start + before.length
      el.selectionEnd = start + before.length + selected.length
    })
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}

      <div className="flex items-center gap-1 rounded-t-md border border-b-0 bg-neutral-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => wrap('**', '**')}
          title="بولد (Ctrl+B در متن را انتخاب کرده و کلیک کنید)"
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-neutral-200"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => wrap('*', '*')}
          title="ایتالیک"
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-neutral-200"
        >
          <Italic className="h-4 w-4" />
        </button>
        <span className="mr-2 flex items-center gap-1 text-[10px] text-neutral-400">
          <Eye className="h-3 w-3" />
          پیش‌نمایش پایین همین کادر
        </span>
      </div>

      <textarea
        ref={ref}
        dir="auto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight }}
        className="w-full rounded-b-md border bg-white p-3 text-sm leading-relaxed outline-none transition focus:ring-2 focus:ring-neutral-200"
        placeholder="توضیحات پروژه… برای بولد کردن بخشی از متن، آن را انتخاب و دکمه B را بزنید."
      />

      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}

      <div className="rounded-md bg-neutral-50 p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-neutral-400">پیش‌نمایش</div>
        <div
          dir="auto"
          className="space-y-2 text-[13px] leading-relaxed text-neutral-700 [&_em]:italic [&_strong]:font-bold [&_strong]:text-neutral-900"
          dangerouslySetInnerHTML={{ __html: renderRichText(value) }}
        />
      </div>
    </div>
  )
}
