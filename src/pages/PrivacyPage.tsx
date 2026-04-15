import { Link } from 'react-router-dom'

function PrivacyPage() {
  return (
    <div className="card static-page legal-page">
      <header className="static-hero static-hero--compact">
        <p className="static-eyebrow">Legal</p>
        <h2 className="static-title">Privacy</h2>
        <p className="static-lead">
          Career Caddie is built to keep your job search material on your device. This page
          describes what that means in practice. Last updated April 2026.
        </p>
      </header>

      <div className="legal-body">
        <section className="static-section">
          <h3 className="static-section-title">No accounts, no Career Caddie servers</h3>
          <p>
            The app does not require sign-up. We do not operate a backend that stores your
            snippets, links, logins, or templates. There is nothing to log into on our side.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Data stored on your device</h3>
          <p>
            Your workspace content is stored in your browser using IndexedDB. App preferences
            (such as theme and how links open) are stored in local storage. This data stays in
            your browser profile on this device unless you export it or copy it out yourself.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Clipboard</h3>
          <p>
            When you use copy actions, text is placed on your system clipboard through your
            browser. That follows the same rules as any website. Avoid copying sensitive
            values on shared or untrusted devices, and clear the clipboard when you are done if
            you need to.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Network requests you may trigger</h3>
          <p>
            Career Caddie may request icons or related assets when you save certain links, if
            you have that behavior enabled in Settings. Those requests go from your browser to
            the sites or services involved, not through a Career Caddie server.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Backups and exports</h3>
          <p>
            If you use Export in Settings, you download a file that contains your saved data.
            You control where that file goes. Treat backups like any sensitive document: store
            them safely and do not share them casually.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Children</h3>
          <p>
            Career Caddie is not directed at children under 13, and we do not knowingly collect
            personal information from children. The product does not use accounts or profiles.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Changes</h3>
          <p>
            We may update this page when the app or practices change. The “last updated” note at
            the top will change when we do. Continued use of the app after an update means you
            accept the revised description.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Contact</h3>
          <p>
            Questions about this policy are welcome through{' '}
            <Link to="/support">Support</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPage
