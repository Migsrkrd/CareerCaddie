import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CreateFormDisclosure from '../components/CreateFormDisclosure.tsx'
import { useAnimatedRemoval } from '../hooks/useAnimatedRemoval.ts'
import { useRecentlyChangedIds } from '../hooks/useRecentlyChangedIds.ts'
import { useScrollToItemHash } from '../hooks/useScrollToItemHash.ts'
import { useRecentlyAddedIds } from '../hooks/useRecentlyAddedIds.ts'
import { workspaceItemElementId } from '../workspaceItemIds.ts'
import AddFolderModal from '../components/AddFolderModal.tsx'
import FolderActionsMenu from '../components/FolderActionsMenu.tsx'
import FolderPathBar from '../components/FolderPathBar.tsx'
import FolderTree from '../components/FolderTree.tsx'
import EditLinkModal from '../components/EditLinkModal.tsx'
import ItemOverflowMenu from '../components/ItemOverflowMenu.tsx'
import MoveToFolderControl from '../components/MoveToFolderControl.tsx'
import {
  buildFolderUrl,
  getChildFolders,
  getFolderPathLabel,
  parsePathSegments,
  resolveFolderFromPath,
  sortedFoldersByPath,
} from '../folderUtils.ts'
import { scrapeLinkFavicon } from '../linkScrape'
import type { Folder, SavedLink } from '../types'

type CreateLinkFormProps = {
  folders: Folder[]
  pathValid: boolean
  activeFolderId: string | null
  scrapeIconsOnSave: boolean
  onAddLink: (
    name: string,
    url: string,
    notes: string,
    iconUrl: string | null,
    folderId: string | null,
  ) => void
}

function CreateLinkForm({
  folders,
  pathValid,
  activeFolderId,
  scrapeIconsOnSave,
  onAddLink,
}: CreateLinkFormProps) {
  const folderOptions = sortedFoldersByPath(folders)
  const [newLink, setNewLink] = useState({ name: '', url: '', notes: '' })
  const [folderId, setFolderId] = useState<string>(() =>
    pathValid && activeFolderId ? activeFolderId : 'none',
  )
  const [isScrapingIcon, setIsScrapingIcon] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newLink.name.trim()
    const url = newLink.url.trim()
    const notes = newLink.notes.trim()

    if (!name || !url) {
      return
    }

    setIsScrapingIcon(scrapeIconsOnSave)
    const iconUrl = scrapeIconsOnSave ? await scrapeLinkFavicon(url) : null
    onAddLink(name, url, notes, iconUrl, folderId === 'none' ? null : folderId)
    setNewLink({ name: '', url: '', notes: '' })
    setIsScrapingIcon(false)
  }

  return (
    <CreateFormDisclosure title="Create link">
      <form className="entry-form entry-form--disclosure" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Link label (example: Stripe Backend Role)"
          value={newLink.name}
          onChange={(event) =>
            setNewLink((current) => ({ ...current, name: event.target.value }))
          }
        />
        <input
          type="url"
          placeholder="https://..."
          value={newLink.url}
          onChange={(event) =>
            setNewLink((current) => ({ ...current, url: event.target.value }))
          }
        />
        <textarea
          rows={2}
          placeholder="Optional notes"
          value={newLink.notes}
          onChange={(event) =>
            setNewLink((current) => ({ ...current, notes: event.target.value }))
          }
        />
        <select value={folderId} onChange={(event) => setFolderId(event.target.value)}>
          <option value="none">No folder</option>
          {folderOptions.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {getFolderPathLabel(folders, folder.id)}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isScrapingIcon}>
          {isScrapingIcon ? 'Scraping Icon...' : 'Save Link'}
        </button>
      </form>
    </CreateFormDisclosure>
  )
}

type LinksPageProps = {
  basePath: string
  links: SavedLink[]
  folders: Folder[]
  onAddFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (id: string, nextName: string) => void
  onDeleteFolder: (id: string) => void
  onAddLink: (
    name: string,
    url: string,
    notes: string,
    iconUrl: string | null,
    folderId: string | null,
  ) => void
  onDeleteLink: (id: string) => void
  onCopyLink: (link: SavedLink) => void
  onMoveLink: (id: string, folderId: string | null) => void
  onUpdateLink: (
    id: string,
    updates: { name: string; url: string; notes: string; iconUrl: string | null },
  ) => void
  openLinksInNewTab: boolean
  scrapeIconsOnSave: boolean
}

function LinksPage({
  basePath,
  links,
  folders,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onAddLink,
  onDeleteLink,
  onCopyLink,
  onMoveLink,
  onUpdateLink,
  openLinksInNewTab,
  scrapeIconsOnSave,
}: LinksPageProps) {
  const navigate = useNavigate()
  const params = useParams()
  const pathRest = params['*'] ?? ''
  const pathSegments = parsePathSegments(pathRest)

  const [brokenIcons, setBrokenIcons] = useState<Record<string, true>>({})
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null)
  const [showAddFolder, setShowAddFolder] = useState(false)

  const activeFolder = resolveFolderFromPath(folders, pathSegments)
  const pathValid = pathSegments.length === 0 || activeFolder !== null
  const activeFolderId = activeFolder?.id ?? null

  const filteredLinks = links.filter((link) => {
    if (!pathValid) {
      return false
    }
    const folderMatches =
      activeFolderId === null ? link.folderId === null : link.folderId === activeFolderId

    return folderMatches
  })

  const visibleFolders = pathValid ? getChildFolders(folders, activeFolderId) : []
  const enteringFolderIds = useRecentlyAddedIds(visibleFolders.map((folder) => folder.id))
  const enteringLinkIds = useRecentlyAddedIds(filteredLinks.map((link) => link.id))
  const { removingIds: removingLinkIds, removeWithAnimation: removeLinkWithAnimation } =
    useAnimatedRemoval()
  const { removingIds: removingFolderIds, removeWithAnimation: removeFolderWithAnimation } =
    useAnimatedRemoval()
  const changedFolderIds = useRecentlyChangedIds(
    visibleFolders.map((folder) => ({ id: folder.id, signature: folder.name })),
  )
  const changedLinkIds = useRecentlyChangedIds(
    filteredLinks.map((link) => ({
      id: link.id,
      signature: `${link.name}|${link.url}|${link.notes}|${link.iconUrl ?? ''}|${link.folderId ?? ''}`,
    })),
  )

  useScrollToItemHash(`${pathRest}|${filteredLinks.map((l) => l.id).join(',')}`)
  const handleDeleteFolder = (id: string) => {
    removeFolderWithAnimation(id, () => onDeleteFolder(id))
  }

  return (
    <>
    {editingLink ? (
      <EditLinkModal
        key={editingLink.id}
        link={editingLink}
        scrapeIconsOnSave={scrapeIconsOnSave}
        onClose={() => setEditingLink(null)}
        onSave={(id, updates) => onUpdateLink(id, updates)}
      />
    ) : null}
    {showAddFolder ? (
      <AddFolderModal
        parentLabel={activeFolder?.name}
        onClose={() => setShowAddFolder(false)}
        onSave={(name) => onAddFolder(name, activeFolder?.id ?? null)}
      />
    ) : null}
    <section className="card fs-page">
      <h2>Saved Job Links</h2>
      <p>Keep job postings, applications, and portal links in one place.</p>
      <div className="fs-layout">
        <aside className="fs-sidebar">
          <CreateLinkForm
            key={`${pathValid}-${activeFolderId ?? 'root'}`}
            folders={folders}
            pathValid={pathValid}
            activeFolderId={activeFolderId}
            scrapeIconsOnSave={scrapeIconsOnSave}
            onAddLink={onAddLink}
          />
          <FolderTree
            folders={folders}
            items={links.map((link) => ({
              id: link.id,
              label: link.name,
              folderId: link.folderId,
              icon: '🔗',
            }))}
            activeFolderId={activeFolderId}
            rootLabel="Saved Links root"
            onOpenPath={(segments) => navigate(buildFolderUrl(basePath, segments))}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            removingFolderIds={removingFolderIds}
          />
        </aside>

        <section className="fs-main">
          <div className="fs-main-path">
            {pathSegments.length > 0 ? (
              <div className="filesystem-toolbar">
                <button
                  type="button"
                  onClick={() =>
                    navigate(buildFolderUrl(basePath, pathSegments.slice(0, -1)))
                  }
                >
                  Back
                </button>
              </div>
            ) : null}
            <FolderPathBar
              basePath={basePath}
              rootLabel="Saved Links"
              pathSegments={pathSegments}
            />
            <div className="fs-main-path-actions">
              <button
                type="button"
                className="btn btn--secondary btn--compact"
                disabled={!pathValid}
                onClick={() => setShowAddFolder(true)}
              >
                + Folder
              </button>
            </div>
          </div>
          <h3 className="section-title">Saved Links</h3>
          {pathValid && (
            <ul className="folder-list">
              {visibleFolders.map((folder) => (
                <li
                  key={folder.id}
                  className={[
                    'folder-browser-item',
                    enteringFolderIds.has(folder.id) ? 'folder-browser-item--enter' : '',
                    changedFolderIds.has(folder.id) ? 'folder-browser-item--flash' : '',
                    removingFolderIds.has(folder.id) ? 'folder-browser-item--exit' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        buildFolderUrl(basePath, [...pathSegments, folder.name]),
                      )
                    }
                  >
                    📁 {folder.name}
                  </button>
                  <FolderActionsMenu
                    folderId={folder.id}
                    folderName={folder.name}
                    onRenameFolder={onRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                  />
                </li>
              ))}
            </ul>
          )}
          <ul className="item-list">
            {filteredLinks.map((link) => (
              <li
                key={link.id}
                id={workspaceItemElementId(link.id)}
                className={[
                  'item',
                  enteringLinkIds.has(link.id) ? 'item--enter' : '',
                  changedLinkIds.has(link.id) ? 'item--flash' : '',
                  removingLinkIds.has(link.id) ? 'item--exit' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div>
                  <h3 className="item-title">
                    {link.iconUrl && !brokenIcons[link.id] ? (
                      <img
                        className="link-icon"
                        src={link.iconUrl}
                        alt=""
                        onError={() =>
                          setBrokenIcons((current) => ({ ...current, [link.id]: true }))
                        }
                      />
                    ) : (
                      <span className="link-icon-fallback">
                        {link.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {link.name}
                  </h3>
                  {link.notes && <p>{link.notes}</p>}
                </div>
                <div className="actions">
                  <button type="button" onClick={() => onCopyLink(link)}>
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openLinksInNewTab
                        ? window.open(link.url, '_blank', 'noopener,noreferrer')
                        : window.open(link.url, '_self')
                    }
                  >
                    Go
                  </button>
                  <ItemOverflowMenu ariaLabel={`More actions for ${link.name}`}>
                    {(close) => (
                      <div className="overflow-menu-stack">
                        <button
                          type="button"
                          className="overflow-menu-edit-row"
                          onClick={() => {
                            setEditingLink(link)
                            close()
                          }}
                        >
                          <span className="overflow-menu-edit-icon" aria-hidden>
                            ✎
                          </span>
                          <span className="overflow-menu-edit-label">Edit</span>
                        </button>
                        <MoveToFolderControl
                          folders={folders}
                          currentFolderId={link.folderId}
                          onMove={(target) => onMoveLink(link.id, target)}
                          onAfterMove={close}
                          onCancel={close}
                          trailingActions={
                            <button
                              type="button"
                              className="overflow-menu-btn overflow-menu-btn--danger"
                              onClick={() => {
                                removeLinkWithAnimation(link.id, () => onDeleteLink(link.id))
                                close()
                              }}
                            >
                              Delete
                            </button>
                          }
                        />
                      </div>
                    )}
                  </ItemOverflowMenu>
                </div>
              </li>
            ))}
          </ul>
          {pathSegments.length > 0 && !activeFolder && (
            <p className="list-empty">This folder was not found.</p>
          )}
          {pathValid && !filteredLinks.length && !visibleFolders.length && (
            <p className="list-empty">No links in this location.</p>
          )}
        </section>
      </div>
    </section>
    </>
  )
}

export default LinksPage
