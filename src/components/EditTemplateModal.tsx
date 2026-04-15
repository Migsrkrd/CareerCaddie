import { useEffect, useState, type FormEvent } from 'react'
import type { TemplateEntry } from '../types'

type EditTemplateModalProps = {
  template: TemplateEntry
  onClose: () => void
  onSave: (id: string, label: string, content: string) => void
}

function EditTemplateModal({ template, onClose, onSave }: EditTemplateModalProps) {
  const [label, setLabel] = useState(() => template.label)
  const [content, setContent] = useState(() => template.content)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextLabel = label.trim()
    const nextContent = content.trim()
    if (!nextLabel || !nextContent) {
      return
    }
    onSave(template.id, nextLabel, nextContent)
    onClose()
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
        className="item-edit-dialog item-edit-dialog--template template-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-template-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="edit-template-heading" className="item-edit-title">
          Edit template
        </h3>
        <form className="entry-form item-edit-form template-edit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            aria-label="Title"
            placeholder="Template title (example: Follow-up email)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <p className="template-field-hint">
            Use square brackets for fill-in fields, for example{' '}
            <code>[name]</code> or <code>[company]</code>. Each unique name gets its own box
            when you use the template.
          </p>
          <textarea
            className="template-body-textarea"
            aria-label="Template body"
            placeholder={'Hello [name],\n\nThanks for speaking with me about the [role] role.'}
            rows={16}
            spellCheck={true}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="template-action-bar template-action-bar--form">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTemplateModal
