export type PlaceholderFieldKind =
  | 'text'
  | 'date'
  | 'time'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'

const TIME_COMPOUND_LAST = new Set([
  'part',
  'full',
  'over',
  'life',
  'some',
  'any',
  'past',
  'bed',
  'day',
  'night',
  'long',
])

function isTimePlaceholderKey(normalized: string): boolean {
  if (normalized === 'time') {
    return true
  }
  if (/\b(meeting|interview|call|start|end|arrival) time\b/.test(normalized)) {
    return true
  }
  if (normalized.endsWith(' time')) {
    const before = normalized.slice(0, -' time'.length).trim()
    const lastWord = before.split(/\s+/).pop() ?? ''
    if (TIME_COMPOUND_LAST.has(lastWord)) {
      return false
    }
    return true
  }
  return false
}

/**
 * Guess the best control for a `[placeholder]` label from its inner text (e.g. `Interview date`).
 */
export function inferPlaceholderFieldKind(placeholderKey: string): PlaceholderFieldKind {
  const k = placeholderKey.trim().toLowerCase()

  if (/\b(email|e-mail)\b/.test(k)) {
    return 'email'
  }
  if (/\b(phone|tel|mobile|cell|cellphone)\b/.test(k)) {
    return 'tel'
  }
  if (/\b(url|website|webpage|linkedin)\b/.test(k)) {
    return 'url'
  }
  if (/\b(salary|compensation|amount|price|stipend|bonus|rate)\b/.test(k)) {
    return 'number'
  }
  if (/\b(years?\s+of\s+experience|yoe)\b/.test(k)) {
    return 'number'
  }
  if (
    /\b(quantity|count)\b/.test(k) &&
    !/\b(account|order|phone|case|serial|tracking|reference)\b/.test(k)
  ) {
    return 'number'
  }
  if (isTimePlaceholderKey(k)) {
    return 'time'
  }
  if (
    /\b(date|deadline|calendar|schedule|today|birthday|birthdate)\b/.test(k) ||
    /\b(interview|start|first|join)\b.*\bday\b/.test(k) ||
    /^day$/i.test(placeholderKey.trim()) ||
    k.endsWith(' date')
  ) {
    return 'date'
  }

  return 'text'
}

export function formatSuggestedDate(): string {
  return new Date().toLocaleDateString(undefined, { dateStyle: 'long' })
}

/** Converts `YYYY-MM-DD` from `<input type="date">` to a locale-long string for the message body. */
export function formatDateFromIso(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate
  }
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }
  return date.toLocaleDateString(undefined, { dateStyle: 'long' })
}

export function formatSuggestedTime(): string {
  return new Date().toLocaleTimeString(undefined, { timeStyle: 'short' })
}

/** Converts `HH:MM` from `<input type="time">` to a locale time string. */
export function formatTimeFromTimeInput(value: string): string {
  const [hStr, mStr] = value.split(':')
  const h = Number(hStr)
  const min = Number(mStr)
  if (!Number.isFinite(h) || !Number.isFinite(min)) {
    return value
  }
  const d = new Date()
  d.setHours(h, min, 0, 0)
  return d.toLocaleTimeString(undefined, { timeStyle: 'short' })
}
