/**
 * Minimal cleanup for jsPDF built-in fonts only (line endings, tabs, smart quotes → ASCII).
 * Does not reflow or alter paragraph structure.
 */
export function normalizePlainTextForPdf(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .trimEnd()
}

function sanitizeFileBaseName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    return 'template'
  }
  return trimmed
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

/**
 * Line height in mm for the current font size (12pt × ~1.15 leading, mm conversion).
 */
function lineHeightMm(fontSizePt: number, lineHeightFactor = 1.2): number {
  const ptToMm = 25.4 / 72
  return fontSizePt * lineHeightFactor * ptToMm
}

/**
 * Downloads plain text as a Times 12pt A4 PDF (wrapped, multi-page when needed).
 * Matches typical “letter” output: Times, 12pt, ~180mm text width, comfortable leading.
 */
export async function downloadTextAsPdf(text: string, fileBaseName: string): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })

  const marginX = 10
  const marginTop = 20
  const marginBottom = 15
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  /** Usable width similar to a 180mm line in a ~210mm page with side margins */
  const maxWidth = Math.min(180, pageWidth - marginX * 2)

  doc.setFont('times', 'normal')
  doc.setFontSize(12)

  const fontSizePt = 12
  const lineHeight = lineHeightMm(fontSizePt, 1.2)

  const body = normalizePlainTextForPdf(text.length > 0 ? text : ' ')

  const lines: string[] = []
  const paragraphs = body.split('\n')
  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('')
      continue
    }
    const wrapped = doc.splitTextToSize(paragraph, maxWidth)
    if (wrapped.length === 0) {
      lines.push('')
    } else {
      lines.push(...wrapped)
    }
  }

  let y = marginTop
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (y + lineHeight > pageHeight - marginBottom) {
      doc.addPage()
      y = marginTop
    }
    doc.text(line, marginX, y)
    y += lineHeight
  }

  doc.save(`${sanitizeFileBaseName(fileBaseName)}.pdf`)
}
