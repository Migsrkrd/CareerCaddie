import { useState, type ReactNode } from 'react'
import { getFolderPathLabel, sortedFoldersByPath } from '../folderUtils'
import type { Folder } from '../types'

type MoveToFolderControlProps = {
  folders: Folder[]
  /** Folder the item is currently in; null means root. */
  currentFolderId: string | null
  onMove: (targetFolderId: string | null) => void
  /** Called after a successful move (e.g. close parent menu). */
  onAfterMove?: () => void
  /** Called when the user cancels (e.g. close parent menu). */
  onCancel?: () => void
  /** Extra buttons on the same row as Apply / Cancel (e.g. Delete). */
  trailingActions?: ReactNode
}

function MoveToFolderControl({
  folders,
  currentFolderId,
  onMove,
  onAfterMove,
  onCancel,
  trailingActions,
}: MoveToFolderControlProps) {
  const [selected, setSelected] = useState<string>(() =>
    currentFolderId ?? 'none',
  )

  const folderOptions = sortedFoldersByPath(folders)

  const handleApply = () => {
    const target = selected === 'none' ? null : selected
    if (target === currentFolderId) {
      onCancel?.()
      return
    }
    onMove(target)
    onAfterMove?.()
  }

  const handleCancel = () => {
    onCancel?.()
  }

  return (
    <div className="move-to-folder-panel">
      <label className="move-to-folder-label">
        Move to
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          aria-label="Destination folder"
        >
          <option value="none">Root (no folder)</option>
          {folderOptions.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {getFolderPathLabel(folders, folder.id)}
            </option>
          ))}
        </select>
      </label>
      <div className="overflow-menu-actions-row">
        <button
          type="button"
          className="overflow-menu-btn overflow-menu-btn--primary"
          onClick={handleApply}
        >
          Apply
        </button>
        <button
          type="button"
          className="overflow-menu-btn overflow-menu-btn--secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>
        {trailingActions}
      </div>
    </div>
  )
}

export default MoveToFolderControl
