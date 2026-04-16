import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Tracks ids that were newly added to the current visible list.
 * Useful for one-time "enter" animations when new rows appear.
 */
export function useRecentlyAddedIds(ids: readonly string[], durationMs = 650): Set<string> {
  const [recentIds, setRecentIds] = useState<Set<string>>(() => new Set())
  const previousIdsRef = useRef<readonly string[] | null>(null)
  const removalTimersRef = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const previousIds = previousIdsRef.current
    if (!previousIds) {
      previousIdsRef.current = ids
      return
    }

    const previousSet = new Set(previousIds)
    const currentSet = new Set(ids)
    const added = ids.filter((id) => !previousSet.has(id))

    if (added.length > 0) {
      setRecentIds((current) => {
        const next = new Set(current)
        for (const id of added) {
          next.add(id)
        }
        return next
      })

      for (const id of added) {
        const existingTimer = removalTimersRef.current.get(id)
        if (existingTimer) {
          window.clearTimeout(existingTimer)
        }
        const timerId = window.setTimeout(() => {
          setRecentIds((current) => {
            if (!current.has(id)) {
              return current
            }
            const next = new Set(current)
            next.delete(id)
            return next
          })
          removalTimersRef.current.delete(id)
        }, durationMs)
        removalTimersRef.current.set(id, timerId)
      }
    }

    setRecentIds((current) => {
      if (current.size === 0) {
        return current
      }
      let changed = false
      const next = new Set(current)
      for (const id of current) {
        if (!currentSet.has(id)) {
          next.delete(id)
          const timerId = removalTimersRef.current.get(id)
          if (timerId) {
            window.clearTimeout(timerId)
            removalTimersRef.current.delete(id)
          }
          changed = true
        }
      }
      return changed ? next : current
    })

    previousIdsRef.current = ids
  }, [ids, durationMs])

  useEffect(() => {
    const removalTimers = removalTimersRef.current
    return () => {
      for (const timerId of removalTimers.values()) {
        window.clearTimeout(timerId)
      }
      removalTimers.clear()
    }
  }, [])

  return recentIds
}
