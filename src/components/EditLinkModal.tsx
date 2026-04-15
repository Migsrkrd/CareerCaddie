import { useEffect, useState, type FormEvent } from 'react'
import { scrapeLinkFavicon, urlsEffectivelyEqual } from '../linkScrape'
import type { SavedLink } from '../types'

type EditLinkModalProps = {
  link: SavedLink
  scrapeIconsOnSave: boolean
  onClose: () => void
  onSave: (
    id: string,
    updates: { name: string; url: string; notes: string; iconUrl: string | null },
  ) => void
}

function EditLinkModal({
  link,
  scrapeIconsOnSave,
  onClose,
  onSave,
}: EditLinkModalProps) {
  const [name, setName] = useState(() => link.name)
  const [url, setUrl] = useState(() => link.url)
  const [notes, setNotes] = useState(() => link.notes)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextName = name.trim()
    const nextUrl = url.trim()
    const nextNotes = notes.trim()
    if (!nextName || !nextUrl) {
      return
    }

    let iconUrl = link.iconUrl
    if (scrapeIconsOnSave && !urlsEffectivelyEqual(nextUrl, link.url)) {
      setBusy(true)
      try {
        iconUrl = await scrapeLinkFavicon(nextUrl)
      } finally {
        setBusy(false)
      }
    }

    onSave(link.id, {
      name: nextName,
      url: nextUrl,
      notes: nextNotes,
      iconUrl,
    })
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
        aria-labelledby="edit-link-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="edit-link-heading" className="item-edit-title">
          Edit link
        </h3>
        <form className="entry-form item-edit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            aria-label="Label"
            placeholder="Link label (example: Stripe Backend Role)"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            type="url"
            aria-label="URL"
            placeholder="https://…"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <textarea
            aria-label="Notes"
            placeholder="Optional notes"
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className="item-edit-actions">
            <button type="button" className="item-edit-cancel" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" disabled={busy}>
              {busy ? 'Updating icon…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditLinkModal
