/**
 * Category "extra fields" — up to a few optional custom metadata rows
 * (label + value) that the admin can add/remove per category.
 * Stored as a JSON string in Category.extraFields.
 */
export type ExtraField = { label: string; value: string }

export const MAX_EXTRA_FIELDS = 6

export function parseExtraFields(raw: string | null | undefined): ExtraField[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (f): f is { label: string; value: string } =>
          !!f &&
          typeof f === 'object' &&
          typeof (f as { label: unknown }).label === 'string' &&
          typeof (f as { value: unknown }).value === 'string',
      )
      .map((f) => ({
        label: f.label.trim().slice(0, 60),
        value: f.value.trim().slice(0, 200),
      }))
      .filter((f) => f.label.length > 0 && f.value.length > 0)
      .slice(0, MAX_EXTRA_FIELDS)
  } catch {
    return []
  }
}

export function serializeExtraFields(fields: ExtraField[]): string {
  return JSON.stringify(
    fields
      .map((f) => ({ label: f.label.trim().slice(0, 60), value: f.value.trim().slice(0, 200) }))
      .filter((f) => f.label.length > 0 && f.value.length > 0)
      .slice(0, MAX_EXTRA_FIELDS),
  )
}
