import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CreateFormDisclosure from '../components/CreateFormDisclosure.tsx'
import { useScrollToItemHash } from '../hooks/useScrollToItemHash.ts'
import { workspaceItemElementId } from '../workspaceItemIds.ts'
import AddFolderModal from '../components/AddFolderModal.tsx'
import CreateTemplateModal from '../components/CreateTemplateModal.tsx'
import EditTemplateModal from '../components/EditTemplateModal.tsx'
import FolderActionsMenu from '../components/FolderActionsMenu.tsx'
import FolderPathBar from '../components/FolderPathBar.tsx'
import FolderTree from '../components/FolderTree.tsx'
import ItemOverflowMenu from '../components/ItemOverflowMenu.tsx'
import MoveToFolderControl from '../components/MoveToFolderControl.tsx'
import UseTemplateModal from '../components/UseTemplateModal.tsx'
import {
  buildFolderUrl,
  getChildFolders,
  parsePathSegments,
  resolveFolderFromPath,
} from '../folderUtils.ts'
import type { Folder, TemplateEntry } from '../types'

type TemplatesPageProps = {
  basePath: string
  templates: TemplateEntry[]
  folders: Folder[]
  onAddFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (id: string, nextName: string) => void
  onDeleteFolder: (id: string) => void
  onAddTemplate: (label: string, content: string, folderId: string | null) => void
  onDeleteTemplate: (id: string) => void
  onMoveTemplate: (id: string, folderId: string | null) => void
  onUpdateTemplate: (id: string, label: string, content: string) => void
  onCopyFilledTemplate: (text: string, successLabel: string) => void
  onTemplateStatusMessage?: (message: string) => void
}

function TemplatesPage({
  basePath,
  templates,
  folders,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onAddTemplate,
  onDeleteTemplate,
  onMoveTemplate,
  onUpdateTemplate,
  onCopyFilledTemplate,
  onTemplateStatusMessage,
}: TemplatesPageProps) {
  const navigate = useNavigate()
  const params = useParams()
  const pathRest = params['*'] ?? ''
  const pathSegments = parsePathSegments(pathRest)

  const [editingTemplate, setEditingTemplate] = useState<TemplateEntry | null>(null)
  const [usingTemplate, setUsingTemplate] = useState<TemplateEntry | null>(null)
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [createModalKey, setCreateModalKey] = useState(0)

  const activeFolder = resolveFolderFromPath(folders, pathSegments)
  const pathValid = pathSegments.length === 0 || activeFolder !== null
  const activeFolderId = activeFolder?.id ?? null

  const openCreateTemplate = () => {
    setCreateModalKey((k) => k + 1)
    setShowCreateTemplate(true)
  }

  const filteredTemplates = templates.filter((template) => {
    if (!pathValid) {
      return false
    }
    const folderMatches =
      activeFolderId === null
        ? template.folderId === null
        : template.folderId === activeFolderId

    return folderMatches
  })

  const visibleFolders = pathValid ? getChildFolders(folders, activeFolderId) : []

  useScrollToItemHash(
    `${pathRest}|${filteredTemplates.map((t) => t.id).join(',')}`,
  )

  return (
    <>
      {editingTemplate ? (
        <EditTemplateModal
          key={editingTemplate.id}
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={(id, label, content) => onUpdateTemplate(id, label, content)}
        />
      ) : null}
      {usingTemplate ? (
        <UseTemplateModal
          key={`${usingTemplate.id}-${usingTemplate.content}`}
          template={usingTemplate}
          onClose={() => setUsingTemplate(null)}
          onCopyFilled={onCopyFilledTemplate}
          onStatusMessage={onTemplateStatusMessage}
        />
      ) : null}
      {showAddFolder ? (
        <AddFolderModal
          parentLabel={activeFolder?.name}
          onClose={() => setShowAddFolder(false)}
          onSave={(name) => onAddFolder(name, activeFolder?.id ?? null)}
        />
      ) : null}
      {showCreateTemplate ? (
        <CreateTemplateModal
          key={createModalKey}
          folders={folders}
          initialFolderId={pathValid && activeFolderId ? activeFolderId : null}
          onAddTemplate={onAddTemplate}
          onClose={() => setShowCreateTemplate(false)}
        />
      ) : null}

      <section className="card fs-page">
        <h2>Templates</h2>
        <p className="fs-page-subtitle">Create and manage reusable messages for applications. Use <code>[placeholders]</code>, fill the fields, then copy or download as PDF.</p>

        <div className="fs-layout">
          <aside className="fs-sidebar">
            <CreateFormDisclosure title="Create template">
              <div className="create-disclosure-template-body">
                <p className="folder-context-hint">
                  Open a focused popup editor while keeping this file-system view in place.
                </p>
                <button
                  type="button"
                  className="create-disclosure-submit-btn"
                  onClick={openCreateTemplate}
                >
                  + New template
                </button>
              </div>
            </CreateFormDisclosure>
            <FolderTree
              folders={folders}
              items={templates.map((template) => ({
                id: template.id,
                label: template.label,
                folderId: template.folderId,
                icon: '📝',
              }))}
              activeFolderId={activeFolderId}
              rootLabel="Templates root"
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
                rootLabel="Templates"
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
            <h3 className="section-title">Saved templates</h3>
            <ul className="item-list">
              {filteredTemplates.map((template) => (
                <li
                  key={template.id}
                  id={workspaceItemElementId(template.id)}
                  className="item"
                >
                  <div>
                    <h3>{template.label}</h3>
                    <p className="template-list-preview">{template.content}</p>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--compact"
                      onClick={() => setUsingTemplate(template)}
                    >
                      Fill &amp; copy
                    </button>
                    <ItemOverflowMenu ariaLabel={`More actions for ${template.label}`}>
                      {(close) => (
                        <div className="overflow-menu-stack">
                          <button
                            type="button"
                            className="overflow-menu-edit-row"
                            onClick={() => {
                              setEditingTemplate(template)
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
                            currentFolderId={template.folderId}
                            onMove={(target) => onMoveTemplate(template.id, target)}
                            onAfterMove={close}
                            onCancel={close}
                            trailingActions={
                              <button
                                type="button"
                                className="overflow-menu-btn overflow-menu-btn--danger"
                                onClick={() => {
                                  onDeleteTemplate(template.id)
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
            {pathValid && !filteredTemplates.length && !visibleFolders.length && (
              <p className="list-empty">No templates in this location.</p>
            )}
          </section>
        </div>
      </section>
    </>
  )
}

export default TemplatesPage
