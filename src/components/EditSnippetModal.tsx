import { useEffect, useState, type FormEvent } from 'react'
import type { CopySnippet } from '../types'

type EditSnippetModalProps = {
  snippet: CopySnippet
  onClose: () => void
  onSave: (id: string, label: string, content: string) => void
}

function EditSnippetModal({ snippet, onClose, onSave }: EditSnippetModalProps) {
  const [label, setLabel] = useState(() => snippet.label)
  const [content, setContent] = useState(() => snippet.content)

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
    onSave(snippet.id, nextLabel, nextContent)
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
        className="item-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-snippet-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="edit-snippet-heading" className="item-edit-title">
          Edit snippet
        </h3>
        <form className="entry-form item-edit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            aria-label="Title"
            placeholder="Snippet title (example: Intro Message)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <textarea
            aria-label="Content"
            placeholder="Snippet content to copy quickly"
            rows={5}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="item-edit-actions">
            <button type="button" className="item-edit-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSnippetModal
