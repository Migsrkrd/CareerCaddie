import { useState, type FormEvent } from 'react'

const SUPPORT_EMAIL = 'careercaddiesupport@gmail.com'

const faqs = [
  {
    q: 'Where does Career Caddie store my data?',
    a: 'Snippets, links, logins, templates, and folders are stored in your browser using IndexedDB. Settings are stored in local storage. Nothing is uploaded to a Career Caddie server.',
  },
  {
    q: 'How do I back up or move my data?',
    a: 'Open Settings and use Export to download a JSON backup. On another device or browser, use Import with that file. Keep backups in a safe place—they contain your saved content.',
  },
  {
    q: 'Why does storage say “estimated”?',
    a: 'Browsers report approximate quota and usage for the whole site origin. The per-category sizes in Settings reflect your Career Caddie data serialized as JSON and are useful for comparison, not exact byte accounting.',
  },
  {
    q: 'Why might a link icon not appear?',
    a: 'Some sites block cross-origin icon loading. Career Caddie tries the site favicon and may fall back to a public icon service. You can turn off icon fetching when saving links in Settings.',
  },
  {
    q: 'Is my clipboard data secure?',
    a: 'Copy actions use your browser’s clipboard API and follow the same rules as any site. Avoid copying passwords on untrusted or shared devices, and clear the clipboard when you are done if needed.',
  },
]

function SupportPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [mailtoWarning, setMailtoWarning] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setCopyStatus('')
    setMailtoWarning('')
  }

  /**
   * Build a mailto: URL with encodeURIComponent (not URLSearchParams).
   * Query strings that use "+" for spaces often fail to open correctly in mail clients on Windows.
   */
  const buildMailtoHref = (): string => {
    const bodyLines = [
      name && `Name: ${name}`,
      email && `Email: ${email}`,
      '',
      message,
    ].filter(Boolean)
    const body = bodyLines.join('\n')
    const subj = subject || 'Career Caddie support'
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
  }

  const openMailApp = () => {
    const href = buildMailtoHref()
    if (href.length > 2000) {
      setMailtoWarning(
        'This message is too long for a mail link on some systems. Use “Copy message” and paste into your email app instead.',
      )
      return
    }

    setMailtoWarning('')
    // Direct navigation works more reliably for mailto: on Windows than URLSearchParams (+ vs %20) or synthetic <a> clicks.
    window.location.href = href
  }

  const handleCopyMessage = async () => {
    const text = [
      `To: ${SUPPORT_EMAIL}`,
      subject && `Subject: ${subject}`,
      name && `Name: ${name}`,
      email && `Email: ${email}`,
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('Copied to clipboard.')
    } catch {
      setCopyStatus('Could not copy. Select the text manually.')
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setSubmitted(false)
    setCopyStatus('')
    setMailtoWarning('')
  }

  return (
    <div className="support-page support-page--static-enter">
      <div className="card static-page support-contact-card">
        <header className="static-hero static-hero--compact">
          <p className="static-eyebrow">Get in touch</p>
          <h2 className="static-title">Contact</h2>
          <p className="static-lead support-contact-lead">
            Career Caddie runs in your browser only—nothing is uploaded to a server. Drafts are
            addressed to support below; use your mail app or copy the message when you are
            ready.
          </p>
          <a className="support-email-pill" href={`mailto:${SUPPORT_EMAIL}`}>
            <span className="support-email-pill-label">Email</span>
            <span className="support-email-pill-value">{SUPPORT_EMAIL}</span>
          </a>
        </header>

        {submitted ? (
          <div className="contact-success" role="status">
            <p className="contact-success-title">Ready to send</p>
            <p className="contact-success-text">
              Your message was not sent automatically. Use the buttons below to open a draft
              to {SUPPORT_EMAIL} or copy the full text.
            </p>
            <div className="contact-success-actions">
              <button
                type="button"
                className="contact-action-btn contact-action-btn--primary"
                onClick={openMailApp}
              >
                Open in email app
              </button>
              <button
                type="button"
                className="contact-action-btn contact-action-btn--secondary"
                onClick={handleCopyMessage}
              >
                Copy message
              </button>
              <button
                type="button"
                className="contact-action-btn contact-action-btn--tertiary"
                onClick={resetForm}
              >
                Write another message
              </button>
            </div>
            {mailtoWarning ? (
              <p className="contact-mailto-warning" role="status">
                {mailtoWarning}
              </p>
            ) : null}
            {copyStatus ? <p className="status-message">{copyStatus}</p> : null}
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-section">
              <h3 className="contact-form-heading">Your details</h3>
              <div className="contact-form-row">
                <label className="contact-field">
                  <span className="contact-label">
                    Name <span className="optional">(optional)</span>
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </label>
                <label className="contact-field">
                  <span className="contact-label">
                    Email <span className="optional">(optional)</span>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
            </div>

            <div className="contact-form-section">
              <h3 className="contact-form-heading">Message</h3>
              <label className="contact-field">
                <span className="contact-label">Subject</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="What do you need help with?"
                />
              </label>
              <label className="contact-field">
                <span className="contact-label">Message</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="Describe your question or feedback."
                />
              </label>
            </div>

            <div className="contact-form-actions">
              <button type="submit" className="contact-submit-btn">
                Review message
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card static-page faq-card">
        <header className="static-hero static-hero--compact faq-header">
          <p className="static-eyebrow">Help</p>
          <h2 className="static-title">FAQs</h2>
          <p className="static-lead faq-intro">
            Quick answers about how Career Caddie handles data and common behaviors.
          </p>
        </header>
        <ul className="faq-list">
          {faqs.map((item) => (
            <li key={item.q}>
              <details className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SupportPage
