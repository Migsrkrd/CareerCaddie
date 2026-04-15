import { useEffect, useMemo, useState } from 'react'
import type { TemplateEntry } from '../types'
import {
  applyTemplateValues,
  extractPlaceholderKeys,
  hasBracketPlaceholders,
} from '../templateUtils.ts'

type UseTemplateModalProps = {
  template: TemplateEntry
  onClose: () => void
  onCopyFilled: (text: string, successLabel: string) => void
  onStatusMessage?: (message: string) => void
}

function UseTemplateModal({
  template,
  onClose,
  onCopyFilled,
  onStatusMessage,
}: UseTemplateModalProps) {
  const keys = useMemo(() => extractPlaceholderKeys(template.content), [template.content])

  const [values, setValues] = useState<Record<string, string>>(() => {
    const next: Record<string, string> = {}
    for (const k of extractPlaceholderKeys(template.content)) {
      next[k] = ''
    }
    return next
  })

  const preview = useMemo(
    () => applyTemplateValues(template.content, values),
    [template.content, values],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleCopy = () => {
    onCopyFilled(preview, template.label)
  }

  const handleDownloadPdf = async () => {
    if (hasBracketPlaceholders(preview)) {
      const ok = window.confirm(
        'It looks like you still have placeholders (text in square brackets) in the message. Download the PDF anyway?',
      )
      if (!ok) {
        return
      }
    }
    try {
      const { downloadTextAsPdf } = await import('../pdfDownload.ts')
      await downloadTextAsPdf(preview, template.label)
      onStatusMessage?.('PDF downloaded.')
    } catch {
      onStatusMessage?.('Could not create PDF. Try again.')
    }
  }

  return (
    <div
      className="item-edit-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="item-edit-dialog template-use-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="use-template-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="use-template-heading" className="item-edit-title template-use-title">
          Use template: {template.label}
        </h3>

        <div className="template-use-layout">
          <div className="template-use-column template-use-column--fields">
            {keys.length > 0 ? (
              <div className="template-fill-fields">
                {keys.map((key) => (
                  <label key={key} className="template-fill-field">
                    <span className="template-fill-label">{key}</span>
                    <input
                      type="text"
                      value={values[key] ?? ''}
                      placeholder={`[${key}]`}
                      autoComplete="off"
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="template-no-placeholders">
                This template has no <code>[placeholders]</code>. You can still copy or export
                the text.
              </p>
            )}
          </div>

          <div className="template-use-column template-use-column--preview">
            <div className="template-preview-block template-preview-block--grow">
              <span className="template-preview-heading">Preview</span>
              <pre className="template-preview-body">{preview}</pre>
            </div>
          </div>
        </div>

        <div className="template-action-bar">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
          <div className="template-action-bar__cluster">
            <button type="button" className="btn btn--secondary" onClick={handleDownloadPdf}>
              Download PDF
            </button>
            <button type="button" className="btn btn--primary" onClick={handleCopy}>
              Copy text
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UseTemplateModal
