import { Fragment } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { buildFolderUrl } from '../folderUtils.ts'

type FolderPathBarProps = {
  basePath: string
  /** Short label for this workspace (e.g. Quick Copy). */
  rootLabel: string
  /** Decoded path segments under the workspace root; empty at workspace root. */
  pathSegments: string[]
}

/**
 * File-explorer style location: breadcrumb plus the current URL path.
 */
function FolderPathBar({ basePath, rootLabel, pathSegments }: FolderPathBarProps) {
  const { pathname } = useLocation()
  const pathForDisplay = decodeURIComponent(pathname)

  return (
    <div className="folder-path-bar">
      <nav className="folder-breadcrumb" aria-label="Folder path">
        <ol className="folder-breadcrumb-list">
          <li className="folder-breadcrumb-item">
            {pathSegments.length > 0 ? (
              <NavLink to={basePath} className="folder-breadcrumb-link" end>
                {rootLabel}
              </NavLink>
            ) : (
              <span className="folder-breadcrumb-current">{rootLabel}</span>
            )}
          </li>
          {pathSegments.map((segment, index) => (
            <Fragment key={`${segment}-${index}`}>
              <li className="folder-breadcrumb-sep" aria-hidden="true">
                ›
              </li>
              <li className="folder-breadcrumb-item">
                {index < pathSegments.length - 1 ? (
                  <NavLink
                    to={buildFolderUrl(basePath, pathSegments.slice(0, index + 1))}
                    className="folder-breadcrumb-link"
                  >
                    {segment}
                  </NavLink>
                ) : (
                  <span className="folder-breadcrumb-current">{segment}</span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      <p className="folder-path-route">
        <code>{pathForDisplay}</code>
      </p>
    </div>
  )
}

export default FolderPathBar
