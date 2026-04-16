import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { WORKSPACE_ITEM_ID_PREFIX } from '../workspaceItemIds.ts'

/**
 * When the URL hash is `#cc-item-…`, scroll that element into view after the list renders.
 */
export function useScrollToItemHash(listVersion: unknown) {
  const location = useLocation()

  useEffect(() => {
    const raw = location.hash.replace(/^#/, '')
    if (!raw.startsWith(WORKSPACE_ITEM_ID_PREFIX)) {
      return
    }

    const run = () => {
      const el = document.getElementById(raw)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run)
    })
    return () => window.cancelAnimationFrame(id)
  }, [location.pathname, location.hash, listVersion])
}
