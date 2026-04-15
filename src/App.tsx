import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import { getStoredValue, setStoredValue } from './indexedDb.ts'
import AboutPage from './pages/AboutPage.tsx'
import LoginsPage from './pages/LoginsPage.tsx'
import LinksPage from './pages/LinksPage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import SnippetsPage from './pages/SnippetsPage.tsx'
import PrivacyPage from './pages/PrivacyPage.tsx'
import SupportPage from './pages/SupportPage.tsx'
import TemplatesPage from './pages/TemplatesPage.tsx'
import TermsPage from './pages/TermsPage.tsx'
import ToolsPage from './pages/ToolsPage.tsx'
import { collectSubtreeFolderIds, normalizeFolder } from './folderUtils.ts'
import careerCaddieLogo from './assets/career_caddie_logo.png'
import { applyThemeToDocument, resolveEffectiveTheme } from './theme.ts'
import type {
  AppSettings,
  CopySnippet,
  Folder,
  LoginEntry,
  SavedLink,
  TemplateEntry,
} from './types.ts'

/** Legacy `hirehunter.*` keys kept so existing local data still loads after the rename. */
const STORAGE_KEYS = {
  snippets: 'hirehunter.copySnippets',
  links: 'hirehunter.savedLinks',
  logins: 'hirehunter.savedLogins',
  templates: 'hirehunter.templates',
  snippetFolders: 'hirehunter.snippetFolders',
  linkFolders: 'hirehunter.linkFolders',
  loginFolders: 'hirehunter.loginFolders',
  templateFolders: 'hirehunter.templateFolders',
  settings: 'hirehunter.settings',
}

const DEFAULT_SETTINGS: AppSettings = {
  hidePasswords: true,
  openLinksInNewTab: true,
  scrapeIconsOnSave: true,
  colorScheme: 'system',
}

const getDefaultSnippets = (): CopySnippet[] => [
  {
    id: crypto.randomUUID(),
    label: 'Resume Intro',
    content:
      "Hi [Name], I am excited to apply for [Role] at [Company]. My background in [skill] can help your team deliver measurable results quickly.",
    folderId: null,
  },
  {
    id: crypto.randomUUID(),
    label: 'Follow Up Message',
    content:
      "Hi [Name], I wanted to follow up on my application for [Role]. I am still very interested in the opportunity and happy to provide anything else you need.",
    folderId: null,
  },
  {
    id: crypto.randomUUID(),
    label: 'Thank You Note',
    content:
      "Thank you for taking the time to speak with me today. I enjoyed learning more about [Company] and I would love to contribute to the team.",
    folderId: null,
  },
]

const readLocalStorage = <T,>(key: string, fallback: T): T => {
  try {
    const rawValue = localStorage.getItem(key)
    if (!rawValue) {
      return fallback
    }

    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

const readLegacyLocalStorage = <T,>(key: string): T | undefined => {
  try {
    const rawValue = localStorage.getItem(key)
    if (!rawValue) {
      return undefined
    }

    return JSON.parse(rawValue) as T
  } catch {
    return undefined
  }
}

const normalizeLink = (entry: SavedLink): SavedLink => ({
  ...entry,
  iconUrl: entry.iconUrl ?? null,
  folderId: entry.folderId ?? null,
})

const normalizeSnippet = (entry: CopySnippet): CopySnippet => ({
  ...entry,
  folderId: entry.folderId ?? null,
})

const normalizeLogin = (entry: LoginEntry): LoginEntry => ({
  ...entry,
  folderId: entry.folderId ?? null,
})

const normalizeTemplate = (entry: TemplateEntry): TemplateEntry => ({
  ...entry,
  label: typeof entry.label === 'string' ? entry.label : '',
  folderId: entry.folderId ?? null,
})

const getIdentifierType = (value: string): 'username' | 'email' =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? 'email' : 'username'

const getSizeInBytes = (value: string): number => new TextEncoder().encode(value).length

const getPayloadSizeInBytes = (payload: unknown): number =>
  getSizeInBytes(JSON.stringify(payload))

function App() {
  const [copyStatus, setCopyStatus] = useState<string>('')
  const [snippets, setSnippets] = useState<CopySnippet[]>([])
  const [snippetFolders, setSnippetFolders] = useState<Folder[]>([])
  const [links, setLinks] = useState<SavedLink[]>([])
  const [linkFolders, setLinkFolders] = useState<Folder[]>([])
  const [logins, setLogins] = useState<LoginEntry[]>([])
  const [loginFolders, setLoginFolders] = useState<Folder[]>([])
  const [templates, setTemplates] = useState<TemplateEntry[]>([])
  const [templateFolders, setTemplateFolders] = useState<Folder[]>([])
  const [isDataHydrated, setIsDataHydrated] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = readLocalStorage<Partial<AppSettings>>(
      STORAGE_KEYS.settings,
      DEFAULT_SETTINGS,
    )
    return { ...DEFAULT_SETTINGS, ...stored }
  })
  const [storageEstimate, setStorageEstimate] = useState<{
    usage: number | null
    quota: number | null
  }>({ usage: null, quota: null })

  useEffect(() => {
    let isMounted = true

    const hydrateFromIndexedDb = async () => {
      const storedSnippets = await getStoredValue<CopySnippet[]>('snippets')
      const storedSnippetFolders = await getStoredValue<Folder[]>('snippetFolders')
      const storedLinks = await getStoredValue<SavedLink[]>('links')
      const storedLinkFolders = await getStoredValue<Folder[]>('linkFolders')
      const storedLogins = await getStoredValue<LoginEntry[]>('logins')
      const storedLoginFolders = await getStoredValue<Folder[]>('loginFolders')
      const storedTemplates = await getStoredValue<TemplateEntry[]>('templates')
      const storedTemplateFolders = await getStoredValue<Folder[]>('templateFolders')

      const nextSnippets =
        storedSnippets ??
        readLegacyLocalStorage<CopySnippet[]>(STORAGE_KEYS.snippets) ??
        getDefaultSnippets()
      const nextSnippetFolders =
        storedSnippetFolders ??
        readLegacyLocalStorage<Folder[]>(STORAGE_KEYS.snippetFolders) ??
        []
      const nextLinks = (
        storedLinks ?? readLegacyLocalStorage<SavedLink[]>(STORAGE_KEYS.links) ?? []
      ).map(normalizeLink)
      const nextLinkFolders =
        storedLinkFolders ?? readLegacyLocalStorage<Folder[]>(STORAGE_KEYS.linkFolders) ?? []
      const nextLogins =
        storedLogins ?? readLegacyLocalStorage<LoginEntry[]>(STORAGE_KEYS.logins) ?? []
      const nextLoginFolders =
        storedLoginFolders ??
        readLegacyLocalStorage<Folder[]>(STORAGE_KEYS.loginFolders) ??
        []
      const nextTemplates =
        storedTemplates ??
        readLegacyLocalStorage<TemplateEntry[]>(STORAGE_KEYS.templates) ??
        []
      const nextTemplateFolders =
        storedTemplateFolders ??
        readLegacyLocalStorage<Folder[]>(STORAGE_KEYS.templateFolders) ??
        []

      const normalizedSnippets = nextSnippets.map(normalizeSnippet)
      const normalizedLogins = nextLogins.map(normalizeLogin)
      const normalizedTemplates = nextTemplates.map(normalizeTemplate)
      const normalizedSnippetFolders = nextSnippetFolders.map(normalizeFolder)
      const normalizedLinkFolders = nextLinkFolders.map(normalizeFolder)
      const normalizedLoginFolders = nextLoginFolders.map(normalizeFolder)
      const normalizedTemplateFolders = nextTemplateFolders.map(normalizeFolder)

      if (storedSnippets === undefined) {
        await setStoredValue('snippets', normalizedSnippets)
      }
      if (storedSnippetFolders === undefined) {
        await setStoredValue('snippetFolders', normalizedSnippetFolders)
      }
      if (storedLinks === undefined) {
        await setStoredValue('links', nextLinks)
      }
      if (storedLinkFolders === undefined) {
        await setStoredValue('linkFolders', normalizedLinkFolders)
      }
      if (storedLogins === undefined) {
        await setStoredValue('logins', normalizedLogins)
      }
      if (storedLoginFolders === undefined) {
        await setStoredValue('loginFolders', normalizedLoginFolders)
      }
      if (storedTemplates === undefined) {
        await setStoredValue('templates', normalizedTemplates)
      }
      if (storedTemplateFolders === undefined) {
        await setStoredValue('templateFolders', normalizedTemplateFolders)
      }

      if (!isMounted) {
        return
      }

      setSnippets(normalizedSnippets)
      setSnippetFolders(normalizedSnippetFolders)
      setLinks(nextLinks)
      setLinkFolders(normalizedLinkFolders)
      setLogins(normalizedLogins)
      setLoginFolders(normalizedLoginFolders)
      setTemplates(normalizedTemplates)
      setTemplateFolders(normalizedTemplateFolders)
      setIsDataHydrated(true)

      // Remove legacy localStorage data after successful migration to IndexedDB.
      localStorage.removeItem(STORAGE_KEYS.snippets)
      localStorage.removeItem(STORAGE_KEYS.links)
      localStorage.removeItem(STORAGE_KEYS.logins)
      localStorage.removeItem(STORAGE_KEYS.templates)
      localStorage.removeItem(STORAGE_KEYS.snippetFolders)
      localStorage.removeItem(STORAGE_KEYS.linkFolders)
      localStorage.removeItem(STORAGE_KEYS.loginFolders)
      localStorage.removeItem(STORAGE_KEYS.templateFolders)
    }

    void hydrateFromIndexedDb()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('snippets', snippets)
  }, [isDataHydrated, snippets])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('snippetFolders', snippetFolders)
  }, [isDataHydrated, snippetFolders])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('links', links)
  }, [isDataHydrated, links])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('linkFolders', linkFolders)
  }, [isDataHydrated, linkFolders])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('logins', logins)
  }, [isDataHydrated, logins])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('loginFolders', loginFolders)
  }, [isDataHydrated, loginFolders])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('templates', templates)
  }, [isDataHydrated, templates])

  useEffect(() => {
    if (!isDataHydrated) {
      return
    }

    void setStoredValue('templateFolders', templateFolders)
  }, [isDataHydrated, templateFolders])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    applyThemeToDocument(resolveEffectiveTheme(settings.colorScheme))

    if (settings.colorScheme !== 'system') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onPreferenceChange = () => {
      applyThemeToDocument(resolveEffectiveTheme('system'))
    }
    media.addEventListener('change', onPreferenceChange)
    return () => media.removeEventListener('change', onPreferenceChange)
  }, [settings.colorScheme])

  useEffect(() => {
    const loadStorageEstimate = async () => {
      if (!navigator.storage?.estimate) {
        setStorageEstimate({ usage: null, quota: null })
        return
      }

      const result = await navigator.storage.estimate()
      setStorageEstimate({
        usage: result.usage ?? null,
        quota: result.quota ?? null,
      })
    }

    void loadStorageEstimate()
  }, [
    snippetFolders,
    snippets,
    linkFolders,
    links,
    loginFolders,
    logins,
    templateFolders,
    templates,
    settings,
  ])

  const copyToClipboard = async (content: string, successLabel: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopyStatus(`${successLabel} copied!`)
      setTimeout(() => {
        setCopyStatus('')
      }, 1800)
    } catch {
      setCopyStatus('Clipboard access failed. Please try again.')
    }
  }

  const notifyClipboardStatus = (message: string) => {
    setCopyStatus(message)
    setTimeout(() => {
      setCopyStatus('')
    }, 2000)
  }

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...partial }))
  }

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      snippets,
      snippetFolders,
      links,
      linkFolders,
      logins,
      loginFolders,
      templates,
      templateFolders,
      settings,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `career-caddie-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = (jsonText: string) => {
    const parsed = JSON.parse(jsonText) as {
      snippets?: CopySnippet[]
      snippetFolders?: Folder[]
      links?: SavedLink[]
      linkFolders?: Folder[]
      logins?: LoginEntry[]
      loginFolders?: Folder[]
      templates?: TemplateEntry[]
      templateFolders?: Folder[]
      settings?: Partial<AppSettings>
    }

    if (Array.isArray(parsed.snippets)) {
      setSnippets(parsed.snippets.map(normalizeSnippet))
    }
    if (Array.isArray(parsed.snippetFolders)) {
      setSnippetFolders(parsed.snippetFolders.map(normalizeFolder))
    }
    if (Array.isArray(parsed.links)) {
      setLinks(parsed.links.map(normalizeLink))
    }
    if (Array.isArray(parsed.linkFolders)) {
      setLinkFolders(parsed.linkFolders.map(normalizeFolder))
    }
    if (Array.isArray(parsed.logins)) {
      setLogins(parsed.logins.map(normalizeLogin))
    }
    if (Array.isArray(parsed.loginFolders)) {
      setLoginFolders(parsed.loginFolders.map(normalizeFolder))
    }
    if (Array.isArray(parsed.templates)) {
      setTemplates(parsed.templates.map(normalizeTemplate))
    }
    if (Array.isArray(parsed.templateFolders)) {
      setTemplateFolders(parsed.templateFolders.map(normalizeFolder))
    }
    if (parsed.settings) {
      setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings })
    }
  }

  const clearAllData = () => {
    setSnippets([])
    setSnippetFolders([])
    setLinks([])
    setLinkFolders([])
    setLogins([])
    setLoginFolders([])
    setTemplates([])
    setTemplateFolders([])
  }

  const categoryUsage = [
    {
      id: 'links',
      label: 'Links',
      bytes: getPayloadSizeInBytes(links) + getPayloadSizeInBytes(linkFolders),
    },
    {
      id: 'copy-buttons',
      label: 'Copy Buttons',
      bytes: getPayloadSizeInBytes(snippets) + getPayloadSizeInBytes(snippetFolders),
    },
    {
      id: 'login-info',
      label: 'Login Info',
      bytes: getPayloadSizeInBytes(logins) + getPayloadSizeInBytes(loginFolders),
    },
    {
      id: 'templates',
      label: 'Templates',
      bytes:
        getPayloadSizeInBytes(templates) + getPayloadSizeInBytes(templateFolders),
    },
  ]

  const trackedDataBytes = categoryUsage.reduce((sum, entry) => sum + entry.bytes, 0)
  const totalUsedBytes = storageEstimate.usage ?? trackedDataBytes
  const remainingBytes =
    storageEstimate.quota !== null && storageEstimate.usage !== null
      ? Math.max(storageEstimate.quota - storageEstimate.usage, 0)
      : null
  const categoryUsageWithPercent = categoryUsage.map((entry) => ({
    ...entry,
    percent: trackedDataBytes > 0 ? (entry.bytes / trackedDataBytes) * 100 : 0,
  }))

  const navbarLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'navbar-link active' : 'navbar-link'

  const workspaceTabClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'app-workspace-tab active' : 'app-workspace-tab'

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="app-navbar">
          <div className="app-navbar-brand">
            <NavLink to="/snippets" className="app-brand-link" title="Home">
              <h1 className="app-brand-heading">
                <img
                  src={careerCaddieLogo}
                  alt="Career Caddie"
                  className="app-brand-logo"
                  decoding="async"
                />
              </h1>
            </NavLink>
          </div>
          <nav className="app-navbar-links" aria-label="Site">
            <NavLink to="/about" className={navbarLinkClass}>
              About
            </NavLink>
            <NavLink to="/support" className={navbarLinkClass}>
              Support
            </NavLink>
            <NavLink to="/tools" className={navbarLinkClass}>
              Tools
            </NavLink>
            <NavLink to="/settings" className={navbarLinkClass}>
              Settings
            </NavLink>
          </nav>
        </div>
        <p className="hero-tagline">
          The job search already comes with enough noise. Career Caddie is where your go-to
          copy, bookmarked links, and login details actually live. They stay on this device,
          not on someone else's servers.
        </p>
        <nav className="app-workspace-nav" aria-label="Workspace">
          <NavLink to="/snippets" className={workspaceTabClass}>
            Quick Copy
          </NavLink>
          <NavLink to="/links" className={workspaceTabClass}>
            Saved Links
          </NavLink>
          <NavLink to="/logins" className={workspaceTabClass}>
            Login Vault
          </NavLink>
          <NavLink to="/templates" className={workspaceTabClass}>
            Templates
          </NavLink>
        </nav>
        <p className="status">{copyStatus || 'Clipboard actions ready.'}</p>
      </header>

      <main className="app-main">
        <Routes>
        <Route
          path="/snippets/*"
          element={
            <SnippetsPage
              basePath="/snippets"
              snippets={snippets}
              folders={snippetFolders}
              onAddFolder={(name, parentId) =>
                setSnippetFolders((current) => [
                  ...current,
                  { id: crypto.randomUUID(), name, parentId },
                ])
              }
              onRenameFolder={(id, nextName) =>
                setSnippetFolders((current) =>
                  current.map((folder) =>
                    folder.id === id ? { ...folder, name: nextName } : folder,
                  ),
                )
              }
              onDeleteFolder={(id) => {
                setSnippetFolders((current) => {
                  const removeIds = new Set(collectSubtreeFolderIds(current, id))
                  setSnippets((prev) =>
                    prev.map((snippet) =>
                      snippet.folderId && removeIds.has(snippet.folderId)
                        ? { ...snippet, folderId: null }
                        : snippet,
                    ),
                  )
                  return current.filter((folder) => !removeIds.has(folder.id))
                })
              }}
              onAddSnippet={(label, content, folderId) =>
                setSnippets((current) => [
                  ...current,
                  { id: crypto.randomUUID(), label, content, folderId },
                ])
              }
              onDeleteSnippet={(id) =>
                setSnippets((current) => current.filter((entry) => entry.id !== id))
              }
              onCopySnippet={(snippet) =>
                copyToClipboard(snippet.content, snippet.label)
              }
              onMoveSnippet={(id, folderId) =>
                setSnippets((current) =>
                  current.map((snippet) =>
                    snippet.id === id ? { ...snippet, folderId } : snippet,
                  ),
                )
              }
              onUpdateSnippet={(id, label, content) =>
                setSnippets((current) =>
                  current.map((snippet) =>
                    snippet.id === id ? { ...snippet, label, content } : snippet,
                  ),
                )
              }
            />
          }
        />
        <Route
          path="/links/*"
          element={
            <LinksPage
              basePath="/links"
              links={links}
              folders={linkFolders}
              onAddFolder={(name, parentId) =>
                setLinkFolders((current) => [
                  ...current,
                  { id: crypto.randomUUID(), name, parentId },
                ])
              }
              onRenameFolder={(id, nextName) =>
                setLinkFolders((current) =>
                  current.map((folder) =>
                    folder.id === id ? { ...folder, name: nextName } : folder,
                  ),
                )
              }
              onDeleteFolder={(id) => {
                setLinkFolders((current) => {
                  const removeIds = new Set(collectSubtreeFolderIds(current, id))
                  setLinks((prev) =>
                    prev.map((link) =>
                      link.folderId && removeIds.has(link.folderId)
                        ? { ...link, folderId: null }
                        : link,
                    ),
                  )
                  return current.filter((folder) => !removeIds.has(folder.id))
                })
              }}
              onAddLink={(name, url, notes, iconUrl, folderId) =>
                setLinks((current) => [
                  ...current,
                  { id: crypto.randomUUID(), name, url, notes, iconUrl, folderId },
                ])
              }
              onDeleteLink={(id) =>
                setLinks((current) => current.filter((entry) => entry.id !== id))
              }
              onCopyLink={(link) => copyToClipboard(link.url, `${link.name} URL`)}
              onMoveLink={(id, folderId) =>
                setLinks((current) =>
                  current.map((link) =>
                    link.id === id ? { ...link, folderId } : link,
                  ),
                )
              }
              onUpdateLink={(id, updates) =>
                setLinks((current) =>
                  current.map((link) =>
                    link.id === id ? { ...link, ...updates } : link,
                  ),
                )
              }
              openLinksInNewTab={settings.openLinksInNewTab}
              scrapeIconsOnSave={settings.scrapeIconsOnSave}
            />
          }
        />
        <Route
          path="/logins/*"
          element={
            <LoginsPage
              basePath="/logins"
              logins={logins}
              folders={loginFolders}
              hidePasswords={settings.hidePasswords}
              onAddFolder={(name, parentId) =>
                setLoginFolders((current) => [
                  ...current,
                  { id: crypto.randomUUID(), name, parentId },
                ])
              }
              onRenameFolder={(id, nextName) =>
                setLoginFolders((current) =>
                  current.map((folder) =>
                    folder.id === id ? { ...folder, name: nextName } : folder,
                  ),
                )
              }
              onDeleteFolder={(id) => {
                setLoginFolders((current) => {
                  const removeIds = new Set(collectSubtreeFolderIds(current, id))
                  setLogins((prev) =>
                    prev.map((login) =>
                      login.folderId && removeIds.has(login.folderId)
                        ? { ...login, folderId: null }
                        : login,
                    ),
                  )
                  return current.filter((folder) => !removeIds.has(folder.id))
                })
              }}
              onAddLogin={(site, username, password, notes, folderId) =>
                setLogins((current) => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    site,
                    username,
                    password,
                    notes,
                    folderId,
                  },
                ])
              }
              onDeleteLogin={(id) =>
                setLogins((current) => current.filter((entry) => entry.id !== id))
              }
              onCopyUsername={(login) =>
                copyToClipboard(
                  login.username,
                  `${login.site} ${getIdentifierType(login.username)}`,
                )
              }
              onCopyPassword={(login) =>
                copyToClipboard(
                  login.password,
                  `${login.site} password`,
                )
              }
              onMoveLogin={(id, folderId) =>
                setLogins((current) =>
                  current.map((login) =>
                    login.id === id ? { ...login, folderId } : login,
                  ),
                )
              }
              onUpdateLogin={(id, site, username, password, notes) =>
                setLogins((current) =>
                  current.map((login) =>
                    login.id === id
                      ? { ...login, site, username, password, notes }
                      : login,
                  ),
                )
              }
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route
          path="/settings"
          element={
            <SettingsPage
              settings={settings}
              onUpdateSettings={updateSettings}
              onExportData={exportBackup}
              onImportData={importBackup}
              onClearAllData={clearAllData}
              storageInsights={{
                trackedDataBytes,
                totalUsedBytes,
                totalQuotaBytes: storageEstimate.quota,
                remainingBytes,
                categoryUsage: categoryUsageWithPercent,
              }}
            />
          }
        />
        <Route
          path="/templates/*"
          element={
            <TemplatesPage
              basePath="/templates"
              templates={templates}
              folders={templateFolders}
              onAddFolder={(name, parentId) =>
                setTemplateFolders((current) => [
                  ...current,
                  { id: crypto.randomUUID(), name, parentId },
                ])
              }
              onRenameFolder={(id, nextName) =>
                setTemplateFolders((current) =>
                  current.map((folder) =>
                    folder.id === id ? { ...folder, name: nextName } : folder,
                  ),
                )
              }
              onDeleteFolder={(id) => {
                setTemplateFolders((current) => {
                  const removeIds = new Set(collectSubtreeFolderIds(current, id))
                  setTemplates((prev) =>
                    prev.map((template) =>
                      template.folderId && removeIds.has(template.folderId)
                        ? { ...template, folderId: null }
                        : template,
                    ),
                  )
                  return current.filter((folder) => !removeIds.has(folder.id))
                })
              }}
              onAddTemplate={(label, content, folderId) =>
                setTemplates((current) => [
                  ...current,
                  { id: crypto.randomUUID(), label, content, folderId },
                ])
              }
              onDeleteTemplate={(id) =>
                setTemplates((current) => current.filter((entry) => entry.id !== id))
              }
              onMoveTemplate={(id, folderId) =>
                setTemplates((current) =>
                  current.map((template) =>
                    template.id === id ? { ...template, folderId } : template,
                  ),
                )
              }
              onUpdateTemplate={(id, label, content) =>
                setTemplates((current) =>
                  current.map((template) =>
                    template.id === id ? { ...template, label, content } : template,
                  ),
                )
              }
              onCopyFilledTemplate={(text, successLabel) =>
                copyToClipboard(text, successLabel)
              }
              onTemplateStatusMessage={notifyClipboardStatus}
            />
          }
        />
        <Route path="*" element={<Navigate to="/snippets" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="app-footer-grid">
          <div className="app-footer-col">
            <strong className="app-footer-title">Career Caddie</strong>
            <p className="app-footer-lede">
              Job hunt tools that stay in your browser. Snippets, links, logins, and templates,
              plus optional backups and settings.
            </p>
          </div>
          <div className="app-footer-col">
            <span className="app-footer-heading">Workspace</span>
            <nav className="app-footer-nav" aria-label="Footer workspace">
              <NavLink to="/snippets">Quick Copy</NavLink>
              <NavLink to="/links">Saved Links</NavLink>
              <NavLink to="/logins">Login Vault</NavLink>
              <NavLink to="/templates">Templates</NavLink>
            </nav>
          </div>
          <div className="app-footer-col">
            <span className="app-footer-heading">Help &amp; app</span>
            <nav className="app-footer-nav" aria-label="Footer help">
              <NavLink to="/about">About</NavLink>
              <NavLink to="/support">Support</NavLink>
              <NavLink to="/tools">Tools</NavLink>
              <NavLink to="/privacy">Privacy</NavLink>
              <NavLink to="/terms">Terms</NavLink>
              <NavLink to="/settings">Settings</NavLink>
            </nav>
          </div>
        </div>
        <p className="app-footer-note">
          Frontend-only app; data stays on this device unless you export or copy it.{' '}
          {new Date().getFullYear()} Career Caddie.
        </p>
      </footer>
    </div>
  )
}

export default App
