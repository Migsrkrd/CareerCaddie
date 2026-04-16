import {
  buildFolderUrl,
  getFolderPathLabel,
  getFolderPathSegments,
} from './folderUtils.ts'
import type {
  CopySnippet,
  Folder,
  LoginEntry,
  SavedLink,
  TemplateEntry,
} from './types.ts'
import { workspaceItemElementId } from './workspaceItemIds.ts'

export type SearchWorkspace = 'snippets' | 'links' | 'logins' | 'templates'

export type SearchResult = {
  key: string
  workspace: SearchWorkspace
  kind: 'folder' | 'item'
  title: string
  detail: string
  /** Path for react-router `navigate()` */
  to: string
  /** Lowercase string used for matching */
  haystack: string
}

const WS: Record<
  SearchWorkspace,
  { base: string; label: string; icon: string }
> = {
  snippets: { base: '/snippets', label: 'Quick Copy', icon: '🧾' },
  links: { base: '/links', label: 'Saved Links', icon: '🔗' },
  logins: { base: '/logins', label: 'Login Vault', icon: '🔐' },
  templates: { base: '/templates', label: 'Templates', icon: '📝' },
}

function pathLabel(folders: Folder[], folderId: string | null): string {
  if (!folderId) {
    return 'Root'
  }
  return getFolderPathLabel(folders, folderId)
}

function segmentsForItem(folders: Folder[], folderId: string | null): string[] {
  if (!folderId) {
    return []
  }
  return getFolderPathSegments(folders, folderId)
}

export function buildSearchIndex(input: {
  snippets: CopySnippet[]
  snippetFolders: Folder[]
  links: SavedLink[]
  linkFolders: Folder[]
  logins: LoginEntry[]
  loginFolders: Folder[]
  templates: TemplateEntry[]
  templateFolders: Folder[]
}): SearchResult[] {
  const out: SearchResult[] = []

  const pushFolder = (
    workspace: SearchWorkspace,
    folders: Folder[],
    folder: Folder,
  ) => {
    const meta = WS[workspace]
    const segs = getFolderPathSegments(folders, folder.id)
    const url = buildFolderUrl(meta.base, segs)
    const labelPath = getFolderPathLabel(folders, folder.id)
    const haystack = [
      folder.name,
      labelPath,
      meta.label,
      'folder',
    ]
      .join(' ')
      .toLowerCase()
    out.push({
      key: `${workspace}-folder-${folder.id}`,
      workspace,
      kind: 'folder',
      title: folder.name,
      detail: `${meta.icon} ${meta.label} · ${labelPath}`,
      to: url,
      haystack,
    })
  }

  for (const f of input.snippetFolders) {
    pushFolder('snippets', input.snippetFolders, f)
  }
  for (const f of input.linkFolders) {
    pushFolder('links', input.linkFolders, f)
  }
  for (const f of input.loginFolders) {
    pushFolder('logins', input.loginFolders, f)
  }
  for (const f of input.templateFolders) {
    pushFolder('templates', input.templateFolders, f)
  }

  for (const s of input.snippets) {
    const meta = WS.snippets
    const segs = segmentsForItem(input.snippetFolders, s.folderId)
    const baseUrl = buildFolderUrl(meta.base, segs)
    const id = workspaceItemElementId(s.id)
    const haystack = [s.label, s.content, pathLabel(input.snippetFolders, s.folderId), meta.label]
      .join(' ')
      .toLowerCase()
    out.push({
      key: `snippet-${s.id}`,
      workspace: 'snippets',
      kind: 'item',
      title: s.label,
      detail: `${meta.icon} ${meta.label} · ${pathLabel(input.snippetFolders, s.folderId)}`,
      to: `${baseUrl}#${id}`,
      haystack,
    })
  }

  for (const link of input.links) {
    const meta = WS.links
    const segs = segmentsForItem(input.linkFolders, link.folderId)
    const baseUrl = buildFolderUrl(meta.base, segs)
    const id = workspaceItemElementId(link.id)
    const haystack = [
      link.name,
      link.url,
      link.notes,
      pathLabel(input.linkFolders, link.folderId),
      meta.label,
    ]
      .join(' ')
      .toLowerCase()
    out.push({
      key: `link-${link.id}`,
      workspace: 'links',
      kind: 'item',
      title: link.name,
      detail: `${meta.icon} ${meta.label} · ${pathLabel(input.linkFolders, link.folderId)}`,
      to: `${baseUrl}#${id}`,
      haystack,
    })
  }

  for (const login of input.logins) {
    const meta = WS.logins
    const segs = segmentsForItem(input.loginFolders, login.folderId)
    const baseUrl = buildFolderUrl(meta.base, segs)
    const id = workspaceItemElementId(login.id)
    const haystack = [
      login.site,
      login.username,
      login.notes,
      pathLabel(input.loginFolders, login.folderId),
      meta.label,
    ]
      .join(' ')
      .toLowerCase()
    out.push({
      key: `login-${login.id}`,
      workspace: 'logins',
      kind: 'item',
      title: login.site,
      detail: `${meta.icon} ${meta.label} · ${pathLabel(input.loginFolders, login.folderId)}`,
      to: `${baseUrl}#${id}`,
      haystack,
    })
  }

  for (const t of input.templates) {
    const meta = WS.templates
    const segs = segmentsForItem(input.templateFolders, t.folderId)
    const baseUrl = buildFolderUrl(meta.base, segs)
    const id = workspaceItemElementId(t.id)
    const haystack = [
      t.label,
      t.content.slice(0, 800),
      pathLabel(input.templateFolders, t.folderId),
      meta.label,
    ]
      .join(' ')
      .toLowerCase()
    out.push({
      key: `template-${t.id}`,
      workspace: 'templates',
      kind: 'item',
      title: t.label,
      detail: `${meta.icon} ${meta.label} · ${pathLabel(input.templateFolders, t.folderId)}`,
      to: `${baseUrl}#${id}`,
      haystack,
    })
  }

  return out
}

function scoreForQuery(haystack: string, title: string, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) {
    return 0
  }
  const t = title.toLowerCase()
  let score = 0
  if (t === q) {
    score += 400
  }
  if (t.startsWith(q)) {
    score += 200
  }
  if (t.includes(q)) {
    score += 80
  }
  if (haystack.includes(q)) {
    score += 20
  }
  const words = q.split(/\s+/).filter(Boolean)
  for (const w of words) {
    if (t.includes(w)) {
      score += 15
    } else if (haystack.includes(w)) {
      score += 5
    }
  }
  return score
}

export function filterSearchResults(
  index: SearchResult[],
  query: string,
  max = 40,
): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return []
  }
  const words = q.split(/\s+/).filter(Boolean)
  const matched = index.filter((r) => {
    const hay = r.haystack
    return words.every((w) => hay.includes(w))
  })
  matched.sort((a, b) => {
    const sb = scoreForQuery(b.haystack, b.title, q) - scoreForQuery(a.haystack, a.title, q)
    if (sb !== 0) {
      return sb
    }
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  })
  return matched.slice(0, max)
}
