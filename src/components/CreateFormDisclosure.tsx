import { useId, useState, type ReactNode } from 'react'

type CreateFormDisclosureProps = {
  title: string
  children: ReactNode
  /** Collapsed by default */
  defaultOpen?: boolean
}

/**
 * Collapsible "create" panel: shows only the title and a chevron until expanded.
 * Children stay mounted while collapsed so form drafts are preserved.
 */
function CreateFormDisclosure({
  title,
  children,
  defaultOpen = false,
}: CreateFormDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const triggerId = useId()
  const panelId = useId()

  return (
    <div className={`create-disclosure${open ? ' create-disclosure--open' : ''}`}>
      <button
        type="button"
        id={triggerId}
        className="create-disclosure-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="create-disclosure-title">{title}</span>
        <span className="create-disclosure-chevron-wrap" aria-hidden>
          <svg
            className={open ? 'create-disclosure-chevron-svg is-open' : 'create-disclosure-chevron-svg'}
            viewBox="0 0 20 20"
            width={18}
            height={18}
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className="create-disclosure-panel"
      >
        <div className="create-disclosure-panel-inner">{children}</div>
      </div>
    </div>
  )
}

export default CreateFormDisclosure
