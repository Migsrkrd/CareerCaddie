/** Placeholders are `[key]` where `key` does not span across `]`. */
const PLACEHOLDER_PATTERN = /\[([^\]]+)\]/g

/**
 * Unique placeholder inner keys in order of first appearance (e.g. `name`, `company`).
 */
export function extractPlaceholderKeys(content: string): string[] {
  const seen = new Set<string>()
  const order: string[] = []
  const re = new RegExp(PLACEHOLDER_PATTERN.source, 'g')
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    const key = match[1]
    if (!seen.has(key)) {
      seen.add(key)
      order.push(key)
    }
  }
  return order
}

/**
 * Replaces each `[key]` with the value for `key` when non-empty after trim.
 * If empty or missing, leaves the original `[key]` in the output.
 */
export function applyTemplateValues(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(new RegExp(PLACEHOLDER_PATTERN.source, 'g'), (full, inner: string) => {
    const val = values[inner]
    if (val !== undefined && val.trim() !== '') {
      return val
    }
    return full
  })
}

/** True if text still contains a `[placeholder]`-style segment (unfilled template field). */
export function hasBracketPlaceholders(text: string): boolean {
  return new RegExp(PLACEHOLDER_PATTERN.source).test(text)
}
