import { useCallback, useEffect, useRef, useState } from 'react'

/** Keep in sync with modal exit keyframes in App.css */
export const MODAL_EXIT_ANIMATION_MS = 220

/**
 * Defers `onClose` until after exit animation; exposes `isClosing` for CSS classes.
 */
export function useAnimatedModalClose(onClose: () => void) {
  const closingRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const requestClose = useCallback(() => {
    if (closingRef.current) {
      return
    }
    closingRef.current = true
    setIsClosing(true)
    timeoutRef.current = window.setTimeout(() => {
      onClose()
      timeoutRef.current = null
    }, MODAL_EXIT_ANIMATION_MS)
  }, [onClose])

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  return { isClosing, requestClose }
}
