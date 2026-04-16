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
import EditLoginModal from '../components/EditLoginModal.tsx'
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
import type { Folder, LoginEntry } from '../types'

type CreateLoginFormProps = {
  folders: Folder[]
  pathValid: boolean
  activeFolderId: string | null
  onAddLogin: (
    site: string,
    username: string,
    password: string,
    notes: string,
    folderId: string | null,
  ) => void
}

function CreateLoginForm({
  folders,
  pathValid,
  activeFolderId,
  onAddLogin,
}: CreateLoginFormProps) {
  const folderOptions = sortedFoldersByPath(folders)
  const [newLogin, setNewLogin] = useState({
    site: '',
    username: '',
    password: '',
    notes: '',
  })
  const [folderId, setFolderId] = useState<string>(() =>
    pathValid && activeFolderId ? activeFolderId : 'none',
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const site = newLogin.site.trim()
    const username = newLogin.username.trim()
    const password = newLogin.password
    const notes = newLogin.notes.trim()

    if (!site || !username) {
      return
    }

    onAddLogin(site, username, password, notes, folderId === 'none' ? null : folderId)
    setNewLogin({ site: '', username: '', password: '', notes: '' })
  }

  return (
    <CreateFormDisclosure title="Create login entry">
      <form className="entry-form entry-form--disclosure" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Website name"
          value={newLogin.site}
          onChange={(event) =>
            setNewLogin((current) => ({ ...current, site: event.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Username / email"
          value={newLogin.username}
          onChange={(event) =>
            setNewLogin((current) => ({ ...current, username: event.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Password"
          value={newLogin.password}
          onChange={(event) =>
            setNewLogin((current) => ({ ...current, password: event.target.value }))
          }
        />
        <textarea
          rows={2}
          placeholder="Optional notes"
          value={newLogin.notes}
          onChange={(event) =>
            setNewLogin((current) => ({ ...current, notes: event.target.value }))
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
        <button type="submit">Save Login</button>
      </form>
    </CreateFormDisclosure>
  )
}

type LoginsPageProps = {
  basePath: string
  animateOnEntry: boolean
  logins: LoginEntry[]
  folders: Folder[]
  hidePasswords: boolean
  onAddFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (id: string, nextName: string) => void
  onDeleteFolder: (id: string) => void
  onAddLogin: (
    site: string,
    username: string,
    password: string,
    notes: string,
    folderId: string | null,
  ) => void
  onDeleteLogin: (id: string) => void
  onCopyUsername: (login: LoginEntry) => void
  onCopyPassword: (login: LoginEntry) => void
  onMoveLogin: (id: string, folderId: string | null) => void
  onUpdateLogin: (
    id: string,
    site: string,
    username: string,
    password: string,
    notes: string,
  ) => void
}

function LoginsPage({
  basePath,
  animateOnEntry,
  logins,
  folders,
  hidePasswords,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onAddLogin,
  onDeleteLogin,
  onCopyUsername,
  onCopyPassword,
  onMoveLogin,
  onUpdateLogin,
}: LoginsPageProps) {
  const navigate = useNavigate()
  const params = useParams()
  const pathRest = params['*'] ?? ''
  const pathSegments = parsePathSegments(pathRest)

  const [editingLogin, setEditingLogin] = useState<LoginEntry | null>(null)
  const [showAddFolder, setShowAddFolder] = useState(false)

  const activeFolder = resolveFolderFromPath(folders, pathSegments)
  const pathValid = pathSegments.length === 0 || activeFolder !== null
  const activeFolderId = activeFolder?.id ?? null

  const getIdentifierType = (value: string): 'username' | 'email' =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? 'email' : 'username'

  const filteredLogins = logins.filter((login) => {
    if (!pathValid) {
      return false
    }
    const folderMatches =
      activeFolderId === null
        ? login.folderId === null
        : login.folderId === activeFolderId

    return folderMatches
  })

  const visibleFolders = pathValid ? getChildFolders(folders, activeFolderId) : []
  const enteringFolderIds = useRecentlyAddedIds(visibleFolders.map((folder) => folder.id))
  const enteringLoginIds = useRecentlyAddedIds(filteredLogins.map((login) => login.id))
  const { removingIds: removingLoginIds, removeWithAnimation: removeLoginWithAnimation } =
    useAnimatedRemoval()
  const { removingIds: removingFolderIds, removeWithAnimation: removeFolderWithAnimation } =
    useAnimatedRemoval()
  const changedFolderIds = useRecentlyChangedIds(
    visibleFolders.map((folder) => ({ id: folder.id, signature: folder.name })),
  )
  const changedLoginIds = useRecentlyChangedIds(
    filteredLogins.map((login) => ({
      id: login.id,
      signature: `${login.site}|${login.username}|${login.password}|${login.notes}|${login.folderId ?? ''}`,
    })),
  )

  useScrollToItemHash(`${pathRest}|${filteredLogins.map((l) => l.id).join(',')}`)
  const handleDeleteFolder = (id: string) => {
    removeFolderWithAnimation(id, () => onDeleteFolder(id))
  }

  return (
    <>
    {editingLogin ? (
      <EditLoginModal
        key={editingLogin.id}
        login={editingLogin}
        onClose={() => setEditingLogin(null)}
        onSave={(id, site, username, password, notes) =>
          onUpdateLogin(id, site, username, password, notes)
        }
      />
    ) : null}
    {showAddFolder ? (
      <AddFolderModal
        parentLabel={activeFolder?.name}
        onClose={() => setShowAddFolder(false)}
        onSave={(name) => onAddFolder(name, activeFolder?.id ?? null)}
      />
    ) : null}
    <section
      className={`card fs-page workspace-page workspace-page--logins${animateOnEntry ? ' workspace-page--entry' : ''}`}
    >
      <h2>Saved Login Info</h2>
      <p>
        Keep website login details for your job hunt tools. Data stays only on your
        device.
      </p>
      <div className="fs-layout">
        <aside className="fs-sidebar">
          <CreateLoginForm
            key={`${pathValid}-${activeFolderId ?? 'root'}`}
            folders={folders}
            pathValid={pathValid}
            activeFolderId={activeFolderId}
            onAddLogin={onAddLogin}
          />
          <FolderTree
            folders={folders}
            items={logins.map((login) => ({
              id: login.id,
              label: login.site,
              folderId: login.folderId,
              icon: '🔐',
            }))}
            activeFolderId={activeFolderId}
            rootLabel="Login Vault root"
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
              rootLabel="Login Vault"
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
          <h3 className="section-title">Saved Login Entries</h3>
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
            {filteredLogins.map((login) => {
              const identifierType = getIdentifierType(login.username)
              const copyLabel = identifierType === 'email' ? 'Email' : 'Username'

              return (
                <li
                  key={login.id}
                  id={workspaceItemElementId(login.id)}
                  className={[
                    'item',
                    enteringLoginIds.has(login.id) ? 'item--enter' : '',
                    changedLoginIds.has(login.id) ? 'item--flash' : '',
                    removingLoginIds.has(login.id) ? 'item--exit' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div>
                    <h3>{login.site}</h3>
                    <p>
                      <strong>{identifierType}:</strong> {login.username}
                    </p>
                    <p>
                      <strong>Password:</strong>{' '}
                      {hidePasswords
                        ? login.password
                          ? '••••••••'
                          : 'Not provided'
                        : login.password || 'Not provided'}
                    </p>
                    {login.notes && <p>{login.notes}</p>}
                  </div>
                  <div className="actions">
                    <button type="button" onClick={() => onCopyUsername(login)}>
                      Copy {copyLabel}
                    </button>
                    <button type="button" onClick={() => onCopyPassword(login)}>
                      Copy Password
                    </button>
                    <ItemOverflowMenu ariaLabel={`More actions for ${login.site}`}>
                      {(close) => (
                        <div className="overflow-menu-stack">
                          <button
                            type="button"
                            className="overflow-menu-edit-row"
                            onClick={() => {
                              setEditingLogin(login)
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
                            currentFolderId={login.folderId}
                            onMove={(target) => onMoveLogin(login.id, target)}
                            onAfterMove={close}
                            onCancel={close}
                            trailingActions={
                              <button
                                type="button"
                                className="overflow-menu-btn overflow-menu-btn--danger"
                                onClick={() => {
                                  removeLoginWithAnimation(login.id, () =>
                                    onDeleteLogin(login.id),
                                  )
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
              )
            })}
          </ul>
          {pathSegments.length > 0 && !activeFolder && (
            <p className="list-empty">This folder was not found.</p>
          )}
          {pathValid && !filteredLogins.length && !visibleFolders.length && (
            <p className="list-empty">No login entries in this location.</p>
          )}
        </section>
      </div>
    </section>
    </>
  )
}

export default LoginsPage
