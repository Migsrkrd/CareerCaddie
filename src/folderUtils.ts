import type { Folder } from './types.ts'

/** Normalize legacy folders without parentId. */
export const normalizeFolder = (f: Folder): Folder => ({
  ...f,
  parentId: f.parentId ?? null,
})

export function parsePathSegments(splat: string | undefined): string[] {
  if (!splat?.trim()) {
    return []
  }
  return splat.split('/').map((segment) => decodeURIComponent(segment))
}

export function buildFolderUrl(basePath: string, segments: string[]): string {
  if (segments.length === 0) {
    return basePath
  }
  return `${basePath}/${segments.map((s) => encodeURIComponent(s)).join('/')}`
}

/**
 * Walk the folder tree by path segments; returns null if any segment does not match.
 */
export function resolveFolderFromPath(folders: Folder[], segments: string[]): Folder | null {
  if (segments.length === 0) {
    return null
  }
  let parentId: string | null = null
  let current: Folder | null = null
  for (const name of segments) {
    const found = folders.find(
      (f) => f.name === name && (f.parentId ?? null) === parentId,
    )
    if (!found) {
      return null
    }
    current = found
    parentId = found.id
  }
  return current
}

export function getChildFolders(folders: Folder[], parentId: string | null): Folder[] {
  return folders.filter((f) => (f.parentId ?? null) === parentId)
}

/** Folder id and all nested descendant folder ids (recursive). */
export function collectSubtreeFolderIds(folders: Folder[], rootId: string): string[] {
  const out: string[] = [rootId]
  for (const child of folders.filter((f) => f.parentId === rootId)) {
    out.push(...collectSubtreeFolderIds(folders, child.id))
  }
  return out
}

/** Labels like "Work / Acme" for selects. */
export function getFolderPathLabel(folders: Folder[], folderId: string): string {
  return getFolderPathSegments(folders, folderId).join(' / ')
}

export function getFolderPathSegments(folders: Folder[], folderId: string): string[] {
  const segments: string[] = []
  let id: string | null = folderId
  while (id) {
    const f = folders.find((x) => x.id === id)
    if (!f) {
      break
    }
    segments.unshift(f.name)
    id = f.parentId ?? null
  }
  return segments
}

/** Sort folders by full path for dropdowns. */
export function sortedFoldersByPath(folders: Folder[]): Folder[] {
  return [...folders].sort((a, b) =>
    getFolderPathLabel(folders, a.id).localeCompare(
      getFolderPathLabel(folders, b.id),
      undefined,
      { sensitivity: 'base' },
    ),
  )
}

export function isValidFolderName(name: string): boolean {
  return !name.includes('/')
}
