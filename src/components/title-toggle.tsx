'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

/**
 * Category title with an optional Persian translation.
 * The small (i) button toggles between the English folder name and the
 * Persian title entered from the admin panel. Works on touch devices too.
 */
export default function TitleToggle({ title, titleFa }: { title: string; titleFa?: string }) {
  const [fa, setFa] = useState(false)
  const hasFa = !!titleFa?.trim()
  const showFa = fa && hasFa

  return (
    <h1 className="mb-4 flex items-start gap-2">
      <span
        lang={showFa ? 'fa' : 'en'}
        dir={showFa ? 'rtl' : 'ltr'}
        className={`text-[11px] font-bold text-neutral-900 ${
          showFa ? 'font-admin text-[13px] font-semibold normal-case tracking-normal' : 'uppercase tracking-[0.25em]'
        }`}
      >
        {showFa ? titleFa : title}
      </span>
      {hasFa && (
        <button
          type="button"
          onClick={() => setFa((v) => !v)}
          aria-label={showFa ? 'Show English title' : 'نمایش عنوان فارسی'}
          title={showFa ? 'English' : 'فارسی'}
          className={`mt-[-3px] shrink-0 rounded-full border p-[3px] transition-colors ${
            showFa
              ? 'border-neutral-900 text-neutral-900'
              : 'border-neutral-300 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'
          }`}
        >
          <Info className="h-3 w-3" />
        </button>
      )}
    </h1>
  )
}
