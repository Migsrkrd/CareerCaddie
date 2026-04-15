export type CopySnippet = {
  id: string
  label: string
  content: string
  folderId: string | null
}

export type SavedLink = {
  id: string
  name: string
  url: string
  notes: string
  iconUrl: string | null
  folderId: string | null
}

export type LoginEntry = {
  id: string
  site: string
  username: string
  password: string
  notes: string
  folderId: string | null
}

export type TemplateEntry = {
  id: string
  label: string
  content: string
  folderId: string | null
}

export type Folder = {
  id: string
  name: string
  /** Parent folder id, or null for a top-level folder. */
  parentId: string | null
}

/** User preference for light/dark UI; `system` follows the device setting. */
export type ColorSchemePreference = 'light' | 'dark' | 'system'

export type AppSettings = {
  hidePasswords: boolean
  openLinksInNewTab: boolean
  scrapeIconsOnSave: boolean
  colorScheme: ColorSchemePreference
}
