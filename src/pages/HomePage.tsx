import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import homeGraphic from '../assets/home-graphic.png'

const GUIDE_NAV: Array<{ id: string; toc: string; heading: string; icon: string }> = [
  { id: 'overview', toc: 'What is Career Caddie?', heading: 'What is Career Caddie?', icon: '✨' },
  { id: 'quick-copy', toc: 'Quick Copy', heading: 'Quick Copy', icon: '📋' },
  { id: 'saved-links', toc: 'Saved Links', heading: 'Saved Links', icon: '🔗' },
  { id: 'login-vault', toc: 'Login Vault', heading: 'Login Vault', icon: '🔐' },
  { id: 'templates', toc: 'Templates', heading: 'Templates', icon: '📝' },
  { id: 'directory-tree', toc: 'Directory tree', heading: 'Directory tree', icon: '🌳' },
  { id: 'settings', toc: 'Settings', heading: 'Settings', icon: '⚙️' },
  { id: 'other-pages', toc: 'Help and other pages', heading: 'Help and other pages', icon: '📚' },
  { id: 'privacy', toc: 'Your data and privacy', heading: 'Your data and privacy', icon: '🛡️' },
]

const SCROLL_SHOW_BACK_TOP = 380

function SectionHeading({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h3 className="home-section-heading">
      <span className="home-section-icon" aria-hidden>
        {icon}
      </span>
      <span className="home-section-heading-text">{children}</span>
    </h3>
  )
}

function HomePage() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > SCROLL_SHOW_BACK_TOP)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navById = Object.fromEntries(GUIDE_NAV.map((entry) => [entry.id, entry]))

  return (
    <>
      <div className="home-page card static-page" id="home-top">
        <div className="home-hero-banner">
          <div className="home-hero-copy">
            <header className="home-hero-header">
              <p className="home-hero-eyebrow">Start here</p>
              <h2 className="home-hero-title">Welcome to Career Caddie</h2>
              <p className="home-hero-lead">
                Everything you need to get productive: what this app is, how each workspace works,
                and where your data lives. Jump through the guide with the table of contents or
                read top to bottom.
              </p>
            </header>
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <img src={homeGraphic} alt="" className="home-hero-img" width={440} height={280} />
          </div>
        </div>

        <div className="home-layout">
          <nav className="home-toc" aria-label="On this page">
            <h3 className="home-toc-title">On this page</h3>
            <ol className="home-toc-list">
              {GUIDE_NAV.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="home-toc-link">
                    <span className="home-toc-icon" aria-hidden>
                      {item.icon}
                    </span>
                    <span>{item.toc}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="home-sections">
            <section id="overview" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById.overview.icon}>{navById.overview.heading}</SectionHeading>
              <p>
                Career Caddie is a <strong>frontend-only</strong> job search companion. It runs in
                your browser and stores snippets, saved links, login records, and reusable templates
                on <strong>this device</strong> (IndexedDB and local settings). There is no sign-in
                and no Career Caddie server holding your content.
              </p>
              <p>
                Use the tabs in the header—<strong>Quick Copy</strong>, <strong>Saved Links</strong>,{' '}
                <strong>Login Vault</strong>, and <strong>Templates</strong>—to switch workspaces.
                Each area supports folders, search where noted, and a directory tree on the side for
                navigation.
              </p>
            </section>

            <section id="quick-copy" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById['quick-copy'].icon}>
                {navById['quick-copy'].heading}
              </SectionHeading>
              <p>
                Save lines of text you reuse often (cover letter openers, thank-you notes,
                follow-ups) as <strong>copy buttons</strong>. One click copies the full text to your
                clipboard.
              </p>
              <ol className="home-steps">
                <li>
                  Open <NavLink to="/snippets">Quick Copy</NavLink>. The main list shows snippets
                  for the folder you are viewing; the sidebar lists folders and snippets in the
                  tree.
                </li>
                <li>
                  Add a snippet with the form at the top: label plus body. Optionally pick a folder
                  before saving.
                </li>
                <li>
                  Use <strong>+ Folder</strong> to create folders; open a folder from the list or the{' '}
                  <strong>Directory tree</strong> to move inside it. Paths appear in the breadcrumb
                  bar.
                </li>
                <li>
                  Use each snippet&apos;s copy action to copy text. Edit or delete from the item
                  menu. Move snippets between folders from the item controls where available.
                </li>
              </ol>
            </section>

            <section id="saved-links" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById['saved-links'].icon}>
                {navById['saved-links'].heading}
              </SectionHeading>
              <p>
                Bookmark job posts, company pages, and portals with optional notes. Open a link
                with the <strong>Go</strong> action; behavior respects &quot;open in new tab&quot; in{' '}
                <NavLink to="/settings">Settings</NavLink>.
              </p>
              <ol className="home-steps">
                <li>
                  Open <NavLink to="/links">Saved Links</NavLink> and add a name, URL, and notes.
                </li>
                <li>
                  If enabled in Settings, new links can fetch a <strong>site icon</strong> when you
                  save—turn that off for faster saves or stricter privacy.
                </li>
                <li>
                  Organize with folders and the directory tree the same way as Quick Copy. Copy the
                  URL from the item menu when you need it without opening the site.
                </li>
              </ol>
            </section>

            <section id="login-vault" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById['login-vault'].icon}>
                {navById['login-vault'].heading}
              </SectionHeading>
              <p>
                Store site name, username or email, password, and notes for application accounts.
                Copy username or password separately when you need to paste into a login form.
              </p>
              <ol className="home-steps">
                <li>
                  Open <NavLink to="/logins">Login Vault</NavLink> and add an entry for each
                  account.
                </li>
                <li>
                  In <NavLink to="/settings">Settings</NavLink>, choose whether passwords show as
                  dots or plain text in the list.
                </li>
                <li>
                  Use folders to group employers or portals. Treat this device like a physical
                  notebook: anyone with access to the browser profile can see stored passwords.
                </li>
              </ol>
            </section>

            <section id="templates" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById.templates.icon}>{navById.templates.heading}</SectionHeading>
              <p>
                Templates are messages with <code>[placeholders]</code> in square brackets. When you
                use a template, you fill each placeholder once; the app substitutes them into the
                preview and you can copy or download a PDF.
              </p>
              <ol className="home-steps">
                <li>
                  Open <NavLink to="/templates">Templates</NavLink> and create a template with a
                  title and body. Use unique bracket names like <code>[name]</code> or{' '}
                  <code>[company]</code>.
                </li>
                <li>
                  Click <strong>Use template</strong> on a template. Fill the fields in the dialog;
                  watch the preview update. Names like <code>[interview date]</code> or{' '}
                  <code>[email]</code> get suggestions and native date, time, or other helpers when
                  relevant.
                </li>
                <li>
                  Copy the finished text or use <strong>Download PDF</strong>. If placeholders
                  remain, the app warns you before exporting.
                </li>
              </ol>
            </section>

            <section
              id="directory-tree"
              className="static-section home-section home-section--surface"
            >
              <SectionHeading icon={navById['directory-tree'].icon}>
                {navById['directory-tree'].heading}
              </SectionHeading>
              <p>
                The <strong>Directory tree</strong> card in each workspace sidebar shows your folder
                hierarchy and, when expanded, items inside folders. Click the root row to jump to the
                top level; click a folder row to open that folder; use the arrow to expand or
                collapse when a folder contains subfolders or items.
              </p>
              <p>
                Rename or delete folders from the folder menu. Deleting a folder may move or
                unassign items depending on how the workspace handles children—follow on-screen
                confirmations.
              </p>
            </section>

            <section id="settings" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById.settings.icon}>{navById.settings.heading}</SectionHeading>
              <p>
                Open <NavLink to="/settings">Settings</NavLink> to tune appearance and behavior, and
                to manage local data.
              </p>
              <ul className="home-bullet-list">
                <li>
                  <strong>Appearance:</strong> light, dark, or match the device.
                </li>
                <li>
                  <strong>Login Vault:</strong> hide or show passwords in the list.
                </li>
                <li>
                  <strong>Links:</strong> open Go in a new tab or the same tab; optionally fetch
                  icons for new links.
                </li>
                <li>
                  <strong>Backup:</strong> export all workspaces and settings as a JSON file; import
                  a backup to restore. Review estimated storage usage and clear all saved data if
                  you need a reset.
                </li>
              </ul>
            </section>

            <section id="other-pages" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById['other-pages'].icon}>
                {navById['other-pages'].heading}
              </SectionHeading>
              <ul className="home-bullet-list">
                <li>
                  <NavLink to="/about">About</NavLink> — short overview of features and privacy.
                </li>
                <li>
                  <NavLink to="/support">Support</NavLink> — how to get help.
                </li>
                <li>
                  <NavLink to="/tools">Tools</NavLink> — external links to AI assistants, job
                  boards, and reading (opens in new tabs; not affiliated with Career Caddie).
                </li>
                <li>
                  <NavLink to="/privacy">Privacy</NavLink> and <NavLink to="/terms">Terms</NavLink>{' '}
                  — policies for using the app.
                </li>
              </ul>
            </section>

            <section id="privacy" className="static-section home-section home-section--surface">
              <SectionHeading icon={navById.privacy.icon}>{navById.privacy.heading}</SectionHeading>
              <p>
                Your entries stay in this browser unless you copy them, export a backup, or a
                feature explicitly loads something from the network (for example fetching a link
                icon). Keep sensitive data off shared computers, use backups for your own records,
                and read <NavLink to="/privacy">Privacy</NavLink> for details.
              </p>
            </section>

            <p className="home-end-cta">
              <NavLink to="/snippets" className="btn btn--primary">
                Go to Quick Copy
              </NavLink>
            </p>
          </div>
        </div>
      </div>

      {showBackToTop ? (
        <button
          type="button"
          className="home-back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <span className="home-back-to-top-icon" aria-hidden>
            ↑
          </span>
          Top
        </button>
      ) : null}
    </>
  )
}

export default HomePage
