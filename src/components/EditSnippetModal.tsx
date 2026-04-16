import { useEffect, useState, type FormEvent } from 'react'
import { useAnimatedModalClose } from '../hooks/useAnimatedModalClose.ts'
import type { CopySnippet } from '../types'

type EditSnippetModalProps = {
  snippet: CopySnippet
  onClose: () => void
  onSave: (id: string, label: string, content: string) => void
}

function EditSnippetModal({ snippet, onClose, onSave }: EditSnippetModalProps) {
  const [label, setLabel] = useState(() => snippet.label)
  const [content, setContent] = useState(() => snippet.content)
  const { isClosing, requestClose } = useAnimatedModalClose(onClose)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [requestClose])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextLabel = label.trim()
    const nextContent = content.trim()
    if (!nextLabel || !nextContent) {
      return
    }
    onSave(snippet.id, nextLabel, nextContent)
    requestClose()
  }

  return (
    <div
      className={`item-edit-backdrop${isClosing ? ' item-edit-backdrop--closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose()
        }
      }}
    >
      <div
        className={`item-edit-dialog${isClosing ? ' item-edit-dialog--closing' : ''}`}
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
            <button type="button" className="item-edit-cancel" onClick={requestClose}>
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
