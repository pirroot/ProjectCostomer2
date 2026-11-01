'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { RichText } from '@/components/richtext'

/**
 * Album description with an optional Persian translation.
 * The small (i) button swaps the English text with the Persian text
 * entered from the admin panel. Works on touch devices too.
 * (The title itself stays English — no more title translation.)
 */
export default function DescToggle({
  description,
  descriptionFa,
}: {
  description: string
  descriptionFa?: string
}) {
  const [fa, setFa] = useState(false)
  const hasFa = !!descriptionFa?.trim()
  const showFa = fa && hasFa

  return (
    <div className="flex items-start gap-2">
      <div
        lang={showFa ? 'fa' : 'en'}
        dir={showFa ? 'rtl' : 'ltr'}
        className={`min-w-0 flex-1 ${showFa ? 'font-admin text-right' : ''}`}
      >
        <RichText
          text={showFa ? (descriptionFa ?? '') : description}
          className="space-y-3 text-[13px] leading-[1.75] text-neutral-600 [&_strong]:font-bold [&_strong]:text-neutral-900"
        />
      </div>
      {hasFa && (
        <button
          type="button"
          onClick={() => setFa((v) => !v)}
          aria-label={showFa ? 'Show English text' : 'نمایش متن فارسی'}
          title={showFa ? 'English' : 'فارسی'}
          className={`mt-[3px] shrink-0 rounded-full border p-[3px] transition-colors ${
            showFa
              ? 'border-neutral-900 text-neutral-900'
              : 'border-neutral-300 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'
          }`}
        >
          <Info className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}