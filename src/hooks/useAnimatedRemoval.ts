import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Lets a row animate out before it is actually removed from state.
 */
export function useAnimatedRemoval(durationMs = 220): {
  removingIds: Set<string>
  removeWithAnimation: (id: string, onRemove: () => void) => void
} {
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set())
  const timersRef = useRef(new Map<string, number>())

  const removeWithAnimation = useCallback(
    (id: string, onRemove: () => void) => {
      if (timersRef.current.has(id)) {
        return
      }

      setRemovingIds((current) => {
        if (current.has(id)) {
          return current
        }
        const next = new Set(current)
        next.add(id)
        return next
      })

      const timerId = window.setTimeout(() => {
        timersRef.current.delete(id)
        onRemove()
        setRemovingIds((current) => {
          if (!current.has(id)) {
            return current
          }
          const next = new Set(current)
          next.delete(id)
          return next
        })
      }, durationMs)

      timersRef.current.set(id, timerId)
    },
    [durationMs],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId)
      }
      timers.clear()
    }
  }, [])

  return { removingIds, removeWithAnimation }
}
