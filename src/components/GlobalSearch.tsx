import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  buildSearchIndex,
  filterSearchResults,
  type SearchResult,
} from '../globalSearch.ts'
import type {
  CopySnippet,
  Folder,
  LoginEntry,
  SavedLink,
  TemplateEntry,
} from '../types.ts'

const PANEL_EXIT_MS = 320

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20 16.65 16.65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 7 17 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m17 7-10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

type GlobalSearchProps = {
  isDataHydrated: boolean
  snippets: CopySnippet[]
  snippetFolders: Folder[]
  links: SavedLink[]
  linkFolders: Folder[]
  logins: LoginEntry[]
  loginFolders: Folder[]
  templates: TemplateEntry[]
  templateFolders: Folder[]
}

function GlobalSearch({
  isDataHydrated,
  snippets,
  snippetFolders,
  links,
  linkFolders,
  logins,
  loginFolders,
  templates,
  templateFolders,
}: GlobalSearchProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [panelExiting, setPanelExiting] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const index = useMemo(
    () =>
      buildSearchIndex({
        snippets,
        snippetFolders,
        links,
        linkFolders,
        logins,
        loginFolders,
        templates,
        templateFolders,
      }),
    [
      snippets,
      snippetFolders,
      links,
      linkFolders,
      logins,
      loginFolders,
      templates,
      templateFolders,
    ],
  )

  const results = useMemo(() => filterSearchResults(index, query), [index, query])

  const showPanel = expanded
  const shellExpanded = expanded || panelExiting

  const beginClose = useCallback(() => {
    if (!expanded || panelExiting) {
      return
    }
    setPanelExiting(true)
  }, [expanded, panelExiting])

  useEffect(() => {
    if (!panelExiting) {
      return
    }
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null
      setExpanded(false)
      setPanelExiting(false)
      setQuery('')
    }, PANEL_EXIT_MS)
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current)
        exitTimerRef.current = null
      }
    }
  }, [panelExiting])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (isDataHydrated) {
          setPanelExiting(false)
          setExpanded(true)
          setQuery('')
        }
      }
      if (event.key === 'Escape' && expanded && !panelExiting) {
        beginClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, panelExiting, isDataHydrated, beginClose])

  useEffect(() => {
    if (expanded && !panelExiting) {
      inputRef.current?.focus()
    }
  }, [expanded, panelExiting])

  useEffect(() => {
    if (!expanded || panelExiting) {
      return
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) {
        return
      }
      beginClose()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [expanded, panelExiting, beginClose])

  const handlePick = (result: SearchResult) => {
    navigate(result.to)
    setPanelExiting(false)
    setExpanded(false)
    setQuery('')
  }

  const openSearch = () => {
    if (!isDataHydrated) {
      return
    }
    setPanelExiting(false)
    setExpanded(true)
    setQuery('')
  }

  const handleTriggerClick = () => {
    if (!isDataHydrated && !expanded) {
      return
    }
    if (expanded && !panelExiting) {
      beginClose()
      return
    }
    openSearch()
  }

  return (
    <div
      ref={rootRef}
      className={`global-search${shellExpanded ? ' global-search--expanded' : ''}`}
    >
      <div className="global-search-bar">
        <button
          type="button"
          className={`global-search-trigger${expanded ? ' global-search-trigger--active' : ''}`}
          onClick={handleTriggerClick}
          disabled={!isDataHydrated && !expanded}
          aria-label={expanded ? 'Close search' : 'Search workspace'}
          title={expanded ? 'Close search' : 'Search workspace (Ctrl+K)'}
        >
          {expanded ? (
            <CloseGlyph className="global-search-trigger-glyph" />
          ) : (
            <SearchGlyph className="global-search-trigger-glyph" />
          )}
        </button>
        {showPanel ? (
          <input
            ref={inputRef}
            id="global-search-input"
            type="search"
            className={`global-search-input${panelExiting ? ' global-search-input--exit' : ''}`}
            placeholder="Search folders & items..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-controls={
              query.trim() ? 'global-search-results-list' : undefined
            }
          />
        ) : null}
      </div>
      {query.trim() && expanded ? (
        <ul
          id="global-search-results-list"
          className={`global-search-results${panelExiting ? ' global-search-results--exit' : ''}`}
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 ? (
            <li className="global-search-empty">No matches.</li>
          ) : null}
          {results.map((result) => (
            <li key={result.key} role="presentation">
              <button
                type="button"
                className="global-search-hit"
                role="option"
                onClick={() => handlePick(result)}
              >
                <span className="global-search-hit-title">{result.title}</span>
                <span className="global-search-hit-detail">{result.detail}</span>
                <span className="global-search-hit-kind">
                  {result.kind === 'folder' ? 'Folder' : 'Item'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default GlobalSearch
