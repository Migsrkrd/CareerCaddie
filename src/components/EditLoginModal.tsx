import { useEffect, useState, type FormEvent } from 'react'
import type { LoginEntry } from '../types'

type EditLoginModalProps = {
  login: LoginEntry
  onClose: () => void
  onSave: (
    id: string,
    site: string,
    username: string,
    password: string,
    notes: string,
  ) => void
}

function EditLoginModal({ login, onClose, onSave }: EditLoginModalProps) {
  const [site, setSite] = useState(() => login.site)
  const [username, setUsername] = useState(() => login.username)
  const [password, setPassword] = useState(() => login.password)
  const [notes, setNotes] = useState(() => login.notes)

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
    const nextSite = site.trim()
    const nextUsername = username.trim()
    const nextNotes = notes.trim()
    if (!nextSite || !nextUsername) {
      return
    }
    onSave(login.id, nextSite, nextUsername, password, nextNotes)
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
        aria-labelledby="edit-login-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="edit-login-heading" className="item-edit-title">
          Edit login
        </h3>
        <form className="entry-form item-edit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            aria-label="Website"
            placeholder="Website name"
            value={site}
            onChange={(event) => setSite(event.target.value)}
          />
          <input
            type="text"
            aria-label="Username or email"
            placeholder="Username / email"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="text"
            aria-label="Password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <textarea
            aria-label="Notes"
            placeholder="Optional notes"
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
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

export default EditLoginModal
