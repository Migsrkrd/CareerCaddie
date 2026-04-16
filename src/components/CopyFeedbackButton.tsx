import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type CopyFeedbackButtonProps = {
  /** Return true after a successful copy so the button can show feedback. */
  onCopy: () => boolean | Promise<boolean>
  children: ReactNode
  className?: string
  /** How long to show the checkmark before restoring the label (ms). */
  durationMs?: number
  disabled?: boolean
}

/**
 * Copy control: on success, shows a checkmark and green styling briefly, then resets.
 */
function CopyFeedbackButton({
  onCopy,
  children,
  className = '',
  durationMs = 1500,
  disabled = false,
}: CopyFeedbackButtonProps) {
  const [copied, setCopied] = useState(false)
  const busyRef = useRef(false)
  const resetTimerRef = useRef<number | null>(null)

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  useEffect(() => () => clearResetTimer(), [clearResetTimer])

  const handleClick = async () => {
    if (disabled || copied || busyRef.current) {
      return
    }
    busyRef.current = true
    try {
      const ok = await Promise.resolve(onCopy())
      if (!ok) {
        return
      }
      setCopied(true)
      clearResetTimer()
      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false)
        resetTimerRef.current = null
      }, durationMs)
    } finally {
      busyRef.current = false
    }
  }

  const rootClass = ['copy-feedback-btn', copied ? 'copy-feedback-btn--copied' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={rootClass}
      onClick={handleClick}
      disabled={disabled}
      aria-label={copied ? 'Copied' : undefined}
      aria-live="polite"
    >
      <span className="copy-feedback-btn-stack" aria-hidden={copied || undefined}>
        <span
          className={
            copied
              ? 'copy-feedback-btn-face copy-feedback-btn-face--hidden'
              : 'copy-feedback-btn-face'
          }
        >
          {children}
        </span>
        <span
          className={
            copied
              ? 'copy-feedback-btn-face copy-feedback-btn-check'
              : 'copy-feedback-btn-face copy-feedback-btn-face--hidden'
          }
          aria-hidden
        >
          ✓
        </span>
      </span>
    </button>
  )
}

export default CopyFeedbackButton
