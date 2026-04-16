import { Link } from 'react-router-dom'

function TermsPage() {
  return (
    <div className="card static-page legal-page legal-page--static-enter">
      <header className="static-hero static-hero--compact">
        <p className="static-eyebrow">Legal</p>
        <h2 className="static-title">Terms of use</h2>
        <p className="static-lead">
          These terms apply to your use of Career Caddie. By using the app, you agree to them.
          Last updated April 2026.
        </p>
      </header>

      <div className="legal-body">
        <section className="static-section">
          <h3 className="static-section-title">The service</h3>
          <p>
            Career Caddie is a browser-based tool for organizing job search content such as
            reusable text, saved links, login notes, and templates. Features may change over
            time. The app is provided for personal job search and career organization use unless
            we agree otherwise in writing.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Your responsibility for your data</h3>
          <p>
            You are responsible for the information you enter, export, or copy out of the app,
            including passwords and application materials. You are responsible for maintaining
            backups if you need them and for securing the devices and browsers you use.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Acceptable use</h3>
          <p>
            Do not use Career Caddie in violation of applicable law, to harm others, or to
            attempt to compromise the app, other users, or third-party services. Do not rely on
            the app as your only copy of important information.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Disclaimer</h3>
          <p>
            Career Caddie is provided “as is” and “as available,” without warranties of any
            kind, whether express or implied, including implied warranties of merchantability,
            fitness for a particular purpose, and non-infringement. We do not guarantee
            uninterrupted or error-free operation.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Limitation of liability</h3>
          <p>
            To the fullest extent permitted by law, Career Caddie and its contributors are not
            liable for any indirect, incidental, special, consequential, or punitive damages, or
            for loss of profits, data, or goodwill, arising from your use of the app. Our total
            liability for any claim related to the app is limited to the greater of zero or what
            you paid us to use the app (the app is offered without charge unless we state
            otherwise).
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Indemnity</h3>
          <p>
            You agree to defend and indemnify Career Caddie and its contributors against any
            claims or losses arising from your use of the app or your violation of these terms,
            except where prohibited by law.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Changes</h3>
          <p>
            We may update these terms. When we do, we will adjust the “last updated” date above.
            If you continue to use the app after changes take effect, you accept the revised
            terms. If a change is unacceptable to you, stop using the app.
          </p>
        </section>

        <section className="static-section">
          <h3 className="static-section-title">Contact</h3>
          <p>
            For questions about these terms, reach out via{' '}
            <Link to="/support">Support</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}

export default TermsPage
