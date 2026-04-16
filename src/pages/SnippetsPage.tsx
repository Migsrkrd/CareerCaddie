import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CreateFormDisclosure from '../components/CreateFormDisclosure.tsx'
import { useScrollToItemHash } from '../hooks/useScrollToItemHash.ts'
import { workspaceItemElementId } from '../workspaceItemIds.ts'
import AddFolderModal from '../components/AddFolderModal.tsx'
import FolderActionsMenu from '../components/FolderActionsMenu.tsx'
import FolderPathBar from '../components/FolderPathBar.tsx'
import FolderTree from '../components/FolderTree.tsx'
import EditSnippetModal from '../components/EditSnippetModal.tsx'
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
import type { CopySnippet, Folder } from '../types'

type CreateSnippetFormProps = {
  folders: Folder[]
  pathValid: boolean
  activeFolderId: string | null
  onAddSnippet: (label: string, content: string, folderId: string | null) => void
}

function CreateSnippetForm({
  folders,
  pathValid,
  activeFolderId,
  onAddSnippet,
}: CreateSnippetFormProps) {
  const folderOptions = sortedFoldersByPath(folders)
  const [newSnippet, setNewSnippet] = useState({ label: '', content: '' })
  const [folderId, setFolderId] = useState<string>(() =>
    pathValid && activeFolderId ? activeFolderId : 'none',
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const label = newSnippet.label.trim()
    const content = newSnippet.content.trim()

    if (!label || !content) {
      return
    }

    onAddSnippet(label, content, folderId === 'none' ? null : folderId)
    setNewSnippet({ label: '', content: '' })
  }

  return (
    <CreateFormDisclosure title="Create snippet">
      <form className="entry-form entry-form--disclosure" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Snippet title (example: Intro Message)"
          value={newSnippet.label}
          onChange={(event) =>
            setNewSnippet((current) => ({
              ...current,
              label: event.target.value,
            }))
          }
        />
        <textarea
          placeholder="Snippet content to copy quickly"
          rows={3}
          value={newSnippet.content}
          onChange={(event) =>
            setNewSnippet((current) => ({
              ...current,
              content: event.target.value,
            }))
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
        <button type="submit">Add Snippet</button>
      </form>
    </CreateFormDisclosure>
  )
}

type SnippetsPageProps = {
  basePath: string
  snippets: CopySnippet[]
  folders: Folder[]
  onAddFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (id: string, nextName: string) => void
  onDeleteFolder: (id: string) => void
  onAddSnippet: (label: string, content: string, folderId: string | null) => void
  onDeleteSnippet: (id: string) => void
  onCopySnippet: (snippet: CopySnippet) => void
  onMoveSnippet: (id: string, folderId: string | null) => void
  onUpdateSnippet: (id: string, label: string, content: string) => void
}

function SnippetsPage({
  basePath,
  snippets,
  folders,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onAddSnippet,
  onDeleteSnippet,
  onCopySnippet,
  onMoveSnippet,
  onUpdateSnippet,
}: SnippetsPageProps) {
  const navigate = useNavigate()
  const params = useParams()
  const pathRest = params['*'] ?? ''
  const pathSegments = parsePathSegments(pathRest)

  const [editingSnippet, setEditingSnippet] = useState<CopySnippet | null>(null)
  const [showAddFolder, setShowAddFolder] = useState(false)

  const activeFolder = resolveFolderFromPath(folders, pathSegments)
  const pathValid = pathSegments.length === 0 || activeFolder !== null
  const activeFolderId = activeFolder?.id ?? null

  const filteredSnippets = snippets.filter((snippet) => {
    if (!pathValid) {
      return false
    }
    const folderMatches =
      activeFolderId === null
        ? snippet.folderId === null
        : snippet.folderId === activeFolderId

    return folderMatches
  })

  const visibleFolders = pathValid ? getChildFolders(folders, activeFolderId) : []

  useScrollToItemHash(
    `${pathRest}|${filteredSnippets.map((s) => s.id).join(',')}`,
  )

  return (
    <>
    {editingSnippet ? (
      <EditSnippetModal
        key={editingSnippet.id}
        snippet={editingSnippet}
        onClose={() => setEditingSnippet(null)}
        onSave={(id, label, content) => onUpdateSnippet(id, label, content)}
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
      <h2>Quick Copy Buttons</h2>
      <p>Save reusable snippets and copy them with one click.</p>
      <div className="fs-layout">
        <aside className="fs-sidebar">
          <CreateSnippetForm
            key={`${pathValid}-${activeFolderId ?? 'root'}`}
            folders={folders}
            pathValid={pathValid}
            activeFolderId={activeFolderId}
            onAddSnippet={onAddSnippet}
          />
          <FolderTree
            folders={folders}
            items={snippets.map((snippet) => ({
              id: snippet.id,
              label: snippet.label,
              folderId: snippet.folderId,
              icon: '🧾',
            }))}
            activeFolderId={activeFolderId}
            rootLabel="Quick Copy root"
            onOpenPath={(segments) => navigate(buildFolderUrl(basePath, segments))}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
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
              rootLabel="Quick Copy"
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
          <h3 className="section-title">Saved Snippets</h3>
          {pathValid && (
            <ul className="folder-list">
              {visibleFolders.map((folder) => (
                <li key={folder.id} className="folder-browser-item">
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
                    onDeleteFolder={onDeleteFolder}
                  />
                </li>
              ))}
            </ul>
          )}
          <ul className="item-list">
            {filteredSnippets.map((snippet) => (
              <li
                key={snippet.id}
                id={workspaceItemElementId(snippet.id)}
                className="item"
              >
                <div>
                  <h3>{snippet.label}</h3>
                  <p>{snippet.content}</p>
                </div>
                <div className="actions">
                  <button type="button" onClick={() => onCopySnippet(snippet)}>
                    Copy
                  </button>
                  <ItemOverflowMenu ariaLabel={`More actions for ${snippet.label}`}>
                    {(close) => (
                      <div className="overflow-menu-stack">
                        <button
                          type="button"
                          className="overflow-menu-edit-row"
                          onClick={() => {
                            setEditingSnippet(snippet)
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
                          currentFolderId={snippet.folderId}
                          onMove={(target) => onMoveSnippet(snippet.id, target)}
                          onAfterMove={close}
                          onCancel={close}
                          trailingActions={
                            <button
                              type="button"
                              className="overflow-menu-btn overflow-menu-btn--danger"
                              onClick={() => {
                                onDeleteSnippet(snippet.id)
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
          {pathValid && !filteredSnippets.length && !visibleFolders.length && (
            <p className="list-empty">No snippets in this location.</p>
          )}
        </section>
      </div>
    </section>
    </>
  )
}

export default SnippetsPage
