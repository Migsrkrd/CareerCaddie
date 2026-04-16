import { Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage.tsx'

type HomeLandingRouteProps = {
  isDataHydrated: boolean
  hasWorkspaceData: boolean
}

/**
 * `/` is the app entry: full guide when no snippets/links/logins/templates yet;
 * otherwise send people straight to Quick Copy.
 */
function HomeLandingRoute({ isDataHydrated, hasWorkspaceData }: HomeLandingRouteProps) {
  if (!isDataHydrated) {
    return (
      <div className="home-loading card static-page" aria-busy="true" aria-live="polite">
        <p className="home-loading-text">Loading your workspace…</p>
      </div>
    )
  }

  if (hasWorkspaceData) {
    return <Navigate to="/snippets" replace />
  }

  return <HomePage />
}

export default HomeLandingRoute
