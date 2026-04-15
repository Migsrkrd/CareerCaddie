import { useEffect, useRef, useState, type ReactNode } from 'react'

type ItemOverflowMenuProps = {
  /** Shown to screen readers on the trigger (e.g. "More actions for this snippet"). */
  ariaLabel: string
  children: (close: () => void) => ReactNode
  triggerClassName?: string
}

function ItemOverflowMenu({
  ariaLabel,
  children,
  triggerClassName,
}: ItemOverflowMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) {
      return
    }

    const onDocPointer = (event: MouseEvent | PointerEvent) => {
      const node = rootRef.current
      if (node && !node.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocPointer)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocPointer)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="item-overflow" ref={rootRef}>
      <button
        type="button"
        className={
          triggerClassName
            ? `item-overflow-trigger ${triggerClassName}`
            : 'item-overflow-trigger'
        }
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="item-overflow-icon" aria-hidden>
          ⋯
        </span>
      </button>
      {open ? (
        <div className="item-overflow-panel" role="group">
          {children(close)}
        </div>
      ) : null}
    </div>
  )
}

export default ItemOverflowMenu
