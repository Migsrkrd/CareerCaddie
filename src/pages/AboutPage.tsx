import type { ReactNode } from 'react'

const features: Array<{ icon: string; title: string; body: ReactNode }> = [
  {
    icon: '⚡',
    title: 'Quick Copy',
    body: (
      <p>
        Save reusable text as one-click copy buttons—cover letter openers, thank-you notes,
        and follow-up messages. Organize entries into folders and browse them like a simple
        file system so the right wording is always a single tap away.
      </p>
    ),
  },
  {
    icon: '🔗',
    title: 'Saved Links',
    body: (
      <p>
        Store job postings, company pages, and application portals with optional notes. Open
        links with a dedicated Go action (respecting your new-tab preference in Settings),
        and optionally fetch site icons when you save a URL so lists are easy to scan.
      </p>
    ),
  },
  {
    icon: '🔐',
    title: 'Login Vault',
    body: (
      <p>
        Keep site names, identifiers, passwords, and notes together for application portals
        and ATS logins. Copy username or password separately, mask passwords when you need
        privacy, and see &quot;Username&quot; or &quot;Email&quot; labels based on what you
        saved.
      </p>
    ),
  },
  {
    icon: '📝',
    title: 'Templates',
    body: (
      <p>
        Save message patterns with placeholders in square brackets (for example{' '}
        <code>[name]</code>). When you use a template, you fill in each field and copy the
        finished text.
      </p>
    ),
  },
  {
    icon: '⚙️',
    title: 'Settings & data',
    body: (
      <p>
        Tune password visibility, how links open, and whether icons are fetched for new
        links. Export or import JSON backups, review estimated storage usage by category, and
        clear local data when you want a fresh start. Core data is stored in IndexedDB in
        your browser; app preferences stay in local storage—nothing is sent to Career Caddie
        servers because there are none.
      </p>
    ),
  },
  {
    icon: '🛡️',
    title: 'Privacy',
    body: (
      <p>
        Your content never leaves this browser unless you export it yourself or copy it to
        the clipboard. Use backups for your own peace of mind and keep sensitive credentials
        off shared machines.
      </p>
    ),
  },
]

function AboutPage() {
  return (
    <div className="about-page about-page--static-enter card static-page">
      <header className="static-hero">
        <p className="static-eyebrow">About the app</p>
        <h2 className="static-title">Career Caddie</h2>
        <p className="static-lead">
          A frontend-only job search companion that keeps your snippets, links, logins, and
          templates on your device—so you can move faster through applications, follow-ups,
          and interviews without juggling scattered notes and browser tabs.
        </p>
      </header>

      <div className="about-features">
        {features.map((feature) => (
          <article key={feature.title} className="about-feature">
            <div className="about-feature-head">
              <span className="about-feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="about-feature-title">{feature.title}</h3>
            </div>
            <div className="about-feature-body">{feature.body}</div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default AboutPage
