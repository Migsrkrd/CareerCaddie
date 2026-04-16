import { useEffect, useState, type FormEvent } from 'react'
import { useAnimatedModalClose } from '../hooks/useAnimatedModalClose.ts'
import {
  getFolderPathLabel,
  sortedFoldersByPath,
} from '../folderUtils.ts'
import type { Folder } from '../types'

type CreateTemplateModalProps = {
  folders: Folder[]
  /** Current browse folder when opening (saved template lands here by default). */
  initialFolderId: string | null
  onAddTemplate: (label: string, content: string, folderId: string | null) => void
  onClose: () => void
}

function CreateTemplateModal({
  folders,
  initialFolderId,
  onAddTemplate,
  onClose,
}: CreateTemplateModalProps) {
  const folderOptions = sortedFoldersByPath(folders)
  const [label, setLabel] = useState('')
  const [content, setContent] = useState('')
  const [folderId, setFolderId] = useState<string>(() =>
    initialFolderId ? initialFolderId : 'none',
  )
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
    onAddTemplate(nextLabel, nextContent, folderId === 'none' ? null : folderId)
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
        className={`item-edit-dialog item-edit-dialog--template template-edit-dialog template-create-modal${isClosing ? ' item-edit-dialog--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-template-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="create-template-heading" className="item-edit-title">
          New template
        </h3>
        <form
          className="entry-form item-edit-form template-edit-form"
          onSubmit={handleSubmit}
        >
          <div className="template-create-toolbar">
            <input
              type="text"
              className="template-create-title-input"
              placeholder="Title (e.g. Cover letter - company outreach)"
              aria-label="Template title"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
            <label className="template-create-folder-label">
              <span className="template-create-folder-caption">Save to folder</span>
              <select
                value={folderId}
                onChange={(event) => setFolderId(event.target.value)}
                aria-label="Folder for new template"
              >
                <option value="none">No folder</option>
                {folderOptions.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {getFolderPathLabel(folders, folder.id)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="template-field-hint template-field-hint--compact">
            Use <code>[field name]</code> for fill-in spots, for example <code>[name]</code> or{' '}
            <code>[company]</code>. Names like <code>[interview date]</code>, <code>[email]</code>, or{' '}
            <code>[phone]</code> get quick suggestions and pickers when you use the template.
          </p>
          <textarea
            className="template-body-textarea"
            aria-label="Template body"
            placeholder={
              'Dear [name],\n\nThank you for your time discussing the [role] position.'
            }
            rows={16}
            spellCheck={true}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="template-action-bar template-action-bar--form">
            <button type="button" className="btn btn--ghost" onClick={requestClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Add template
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTemplateModal
