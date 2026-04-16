import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type ChangeEntry = {
  id: string
  signature: string
}

/**
 * Tracks ids whose signature changed while they remained in the list.
 * Useful for short highlight flashes after rename/edit operations.
 */
export function useRecentlyChangedIds(
  entries: readonly ChangeEntry[],
  durationMs = 800,
): Set<string> {
  const [changedIds, setChangedIds] = useState<Set<string>>(() => new Set())
  const previousByIdRef = useRef<Map<string, string> | null>(null)
  const removalTimersRef = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const previousById = previousByIdRef.current
    const nextById = new Map<string, string>(
      entries.map((entry) => [entry.id, entry.signature]),
    )

    if (!previousById) {
      previousByIdRef.current = nextById
      return
    }

    const changed = entries
      .filter((entry) => previousById.has(entry.id))
      .filter((entry) => previousById.get(entry.id) !== entry.signature)
      .map((entry) => entry.id)

    if (changed.length > 0) {
      setChangedIds((current) => {
        const next = new Set(current)
        for (const id of changed) {
          next.add(id)
        }
        return next
      })

      for (const id of changed) {
        const existingTimer = removalTimersRef.current.get(id)
        if (existingTimer) {
          window.clearTimeout(existingTimer)
        }
        const timerId = window.setTimeout(() => {
          setChangedIds((current) => {
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

    previousByIdRef.current = nextById
  }, [entries, durationMs])

  useEffect(() => {
    const removalTimers = removalTimersRef.current
    return () => {
      for (const timerId of removalTimers.values()) {
        window.clearTimeout(timerId)
      }
      removalTimers.clear()
    }
  }, [])

  return changedIds
}
