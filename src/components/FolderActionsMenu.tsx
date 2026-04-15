import ItemOverflowMenu from './ItemOverflowMenu.tsx'

type FolderActionsMenuProps = {
  folderId: string
  folderName: string
  onRenameFolder: (id: string, nextName: string) => void
  onDeleteFolder: (id: string) => void
  treeStyle?: boolean
}

function FolderActionsMenu({
  folderId,
  folderName,
  onRenameFolder,
  onDeleteFolder,
  treeStyle,
}: FolderActionsMenuProps) {
  return (
    <ItemOverflowMenu
      ariaLabel={`More actions for folder ${folderName}`}
      triggerClassName={treeStyle ? 'folder-tree-overflow-trigger' : undefined}
    >
      {(close) => (
        <div className="overflow-menu-stack">
          <button
            type="button"
            className="overflow-menu-edit-row"
            onClick={() => {
              const nextName = window.prompt('Rename folder', folderName)
              if (nextName !== null) {
                const trimmed = nextName.trim()
                if (trimmed && trimmed !== folderName) {
                  onRenameFolder(folderId, trimmed)
                }
              }
              close()
            }}
          >
            <span className="overflow-menu-edit-icon" aria-hidden>
              ✎
            </span>
            <span className="overflow-menu-edit-label">Rename</span>
          </button>
          <div className="overflow-menu-actions-row overflow-menu-actions-row--single">
            <button
              type="button"
              className="overflow-menu-btn overflow-menu-btn--danger overflow-menu-btn--full"
              onClick={() => {
                onDeleteFolder(folderId)
                close()
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </ItemOverflowMenu>
  )
}

export default FolderActionsMenu
