/**
 * Minimal, safe rich-text renderer for category descriptions.
 * Supports: **bold**, *italic*, paragraphs (blank line) and line breaks.
 * Input is HTML-escaped first, so no raw HTML can be injected.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
}

export function renderRichText(source: string): string {
  const escaped = escapeHtml(source ?? '')
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inline(p).replace(/\n/g, '<br/>')}</p>`)
  return paragraphs.join('')
}

export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderRichText(text) }}
    />
  )
}
