import { useState } from 'react'
import FolderActionsMenu from './FolderActionsMenu.tsx'
import ItemOverflowMenu from './ItemOverflowMenu.tsx'
import type { Folder } from '../types'

export type FolderTreeItem = {
  id: string
  label: string
  folderId: string | null
  icon?: string
}

type FolderTreeProps = {
  folders: Folder[]
  items?: FolderTreeItem[]
  activeFolderId: string | null
  rootLabel: string
  onOpenPath: (pathSegments: string[]) => void
  onRenameFolder: (id: string, nextName: string) => void
  onDeleteFolder: (id: string) => void
}

function FolderTree({
  folders,
  items = [],
  activeFolderId,
  rootLabel,
  onOpenPath,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  /** Closed by default; manual expanded state for non-active branches. */
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  /**
   * For the auto-open active branch path, users can still manually collapse nodes.
   */
  const [collapsedAutoIds, setCollapsedAutoIds] = useState<Set<string>>(() => new Set())
  const parentById = new Map<string, string | null>()

  const childrenByParent = new Map<string, Folder[]>()
  for (const folder of folders) {
    parentById.set(folder.id, folder.parentId ?? null)
    const key = folder.parentId ?? '__root__'
    const current = childrenByParent.get(key) ?? []
    current.push(folder)
    childrenByParent.set(key, current)
  }
  for (const [, list] of childrenByParent) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }

  const autoExpandedIds = new Set<string>()
  let activeCursor = activeFolderId
  while (activeCursor) {
    autoExpandedIds.add(activeCursor)
    activeCursor = parentById.get(activeCursor) ?? null
  }

  const renderBranch = (parentId: string | null, trail: string[], depth: number) => {
    const key = parentId ?? '__root__'
    const children = childrenByParent.get(key) ?? []
    const dataItems = items
      .filter((item) => item.folderId === parentId)
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label))

    if (!children.length && !dataItems.length) {
      return null
    }

    return (
      <ul className="folder-tree-list" role="tree">
        {children.map((folder) => {
          const nextTrail = [...trail, folder.name]
          const isActive = activeFolderId === folder.id
          const hasChildren = (childrenByParent.get(folder.id) ?? []).length > 0
          const isExpanded = autoExpandedIds.has(folder.id)
            ? !collapsedAutoIds.has(folder.id)
            : expandedIds.has(folder.id)
          return (
            <li key={folder.id} className="folder-tree-item" role="treeitem">
              <div className="folder-tree-row" style={{ paddingLeft: `${depth * 0.7}rem` }}>
                {hasChildren ? (
                  <button
                    type="button"
                    className="folder-tree-toggle"
                    aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
                    onClick={() => {
                      if (autoExpandedIds.has(folder.id)) {
                        setCollapsedAutoIds((current) => {
                          const next = new Set(current)
                          if (next.has(folder.id)) {
                            next.delete(folder.id)
                          } else {
                            next.add(folder.id)
                          }
                          return next
                        })
                      } else {
                        setExpandedIds((current) => {
                          const next = new Set(current)
                          if (next.has(folder.id)) {
                            next.delete(folder.id)
                          } else {
                            next.add(folder.id)
                          }
                          return next
                        })
                      }
                    }}
                  >
                    <span aria-hidden>{isExpanded ? '▾' : '▸'}</span>
                  </button>
                ) : (
                  <span className="folder-tree-toggle-spacer" aria-hidden />
                )}
                <button
                  type="button"
                  className={isActive ? 'folder-tree-link active' : 'folder-tree-link'}
                  onClick={() => onOpenPath(nextTrail)}
                >
                  <span aria-hidden="true">📁</span>
                  <span>{folder.name}</span>
                </button>
                <FolderActionsMenu
                  folderId={folder.id}
                  folderName={folder.name}
                  onRenameFolder={onRenameFolder}
                  onDeleteFolder={onDeleteFolder}
                  treeStyle
                />
              </div>
              {isExpanded ? renderBranch(folder.id, nextTrail, depth + 1) : null}
            </li>
          )
        })}
        {dataItems.map((item) => (
          <li key={item.id} className="folder-tree-item" role="treeitem">
            <div className="folder-tree-row" style={{ paddingLeft: `${depth * 0.7}rem` }}>
              <span className="folder-tree-toggle-spacer" aria-hidden />
              <button
                type="button"
                className="folder-tree-file"
                onClick={() => onOpenPath(trail)}
              >
                <span className="folder-tree-file-icon" aria-hidden>
                  {item.icon ?? '📄'}
                </span>
                <span>{item.label}</span>
              </button>
              <ItemOverflowMenu
                ariaLabel={`More actions for ${item.label}`}
                triggerClassName="folder-tree-overflow-trigger"
              >
                {(close) => (
                  <div className="overflow-menu-stack">
                    <button
                      type="button"
                      className="overflow-menu-edit-row"
                      onClick={() => {
                        onOpenPath(trail)
                        close()
                      }}
                    >
                      <span className="overflow-menu-edit-icon" aria-hidden>
                        ↪
                      </span>
                      <span className="overflow-menu-edit-label">Show folder</span>
                    </button>
                  </div>
                )}
              </ItemOverflowMenu>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="folder-tree-panel">
      <div className="folder-tree-header">
        <h3>Folders</h3>
        <button
          type="button"
          className={activeFolderId === null ? 'folder-tree-root active' : 'folder-tree-root'}
          onClick={() => onOpenPath([])}
        >
          {rootLabel}
        </button>
      </div>
      {folders.length ? (
        renderBranch(null, [], 1)
      ) : (
        <p className="folder-empty">No folders yet.</p>
      )}
    </section>
  )
}

export default FolderTree
