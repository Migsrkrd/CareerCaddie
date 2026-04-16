import { useEffect, useState, type FormEvent } from 'react'
import { useAnimatedModalClose } from '../hooks/useAnimatedModalClose.ts'
import { isValidFolderName } from '../folderUtils.ts'

type AddFolderModalProps = {
  parentLabel?: string
  onClose: () => void
  onSave: (name: string) => void
}

function AddFolderModal({ parentLabel, onClose, onSave }: AddFolderModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
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
    const nextName = name.trim()
    if (!nextName) {
      return
    }
    if (!isValidFolderName(nextName)) {
      setError('Folder names cannot contain "/".')
      return
    }
    onSave(nextName)
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
        className={`item-edit-dialog folder-add-dialog${isClosing ? ' item-edit-dialog--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-folder-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="add-folder-heading" className="item-edit-title">
          Add folder
        </h3>
        <p className="folder-add-hint">
          {parentLabel ? (
            <>The new folder will be created inside "{parentLabel}".</>
          ) : (
            <>The new folder will be created at the root level.</>
          )}
        </p>
        <form className="entry-form item-edit-form folder-add-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Folder name"
            value={name}
            autoFocus
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
          />
          {error ? (
            <p className="folder-empty" role="status">
              {error}
            </p>
          ) : null}
          <div className="item-edit-actions">
            <button type="button" className="item-edit-cancel" onClick={requestClose}>
              Cancel
            </button>
            <button type="submit">Create folder</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFolderModal
