type ToolLink = {
  name: string
  description: string
  url: string
  host: string
}

type ToolGroup = {
  title: string
  intro: string
  links: ToolLink[]
}

const toolGroups: ToolGroup[] = [
  {
    title: 'AI assistants',
    intro:
      'Use these to draft outreach, tighten bullets, or summarize a posting. Always edit for accuracy and your own voice before you send anything.',
    links: [
      {
        name: 'ChatGPT',
        description: 'General-purpose chat from OpenAI.',
        url: 'https://chat.openai.com/',
        host: 'openai.com',
      },
      {
        name: 'Claude',
        description: 'Long-context assistant from Anthropic.',
        url: 'https://claude.ai/',
        host: 'anthropic.com',
      },
      {
        name: 'Google Gemini',
        description: 'Google’s Gemini apps and models.',
        url: 'https://gemini.google.com/',
        host: 'google.com',
      },
      {
        name: 'Perplexity',
        description: 'Search-style answers with citations.',
        url: 'https://www.perplexity.ai/',
        host: 'perplexity.ai',
      },
      {
        name: 'Microsoft Copilot',
        description: 'Copilot across Microsoft experiences.',
        url: 'https://copilot.microsoft.com/',
        host: 'microsoft.com',
      },
    ],
  },
  {
    title: 'Job boards and search',
    intro:
      'Large boards and niche sites change often. Bookmark the ones you actually use in Career Caddie Saved Links.',
    links: [
      {
        name: 'LinkedIn Jobs',
        description: 'Roles and company pages on LinkedIn.',
        url: 'https://www.linkedin.com/jobs/',
        host: 'linkedin.com',
      },
      {
        name: 'Indeed',
        description: 'Broad job search and company reviews.',
        url: 'https://www.indeed.com/',
        host: 'indeed.com',
      },
      {
        name: 'Glassdoor',
        description: 'Jobs plus employer reviews and salaries.',
        url: 'https://www.glassdoor.com/',
        host: 'glassdoor.com',
      },
      {
        name: 'Wellfound',
        description: 'Startup-focused roles (formerly AngelList Talent).',
        url: 'https://wellfound.com/',
        host: 'wellfound.com',
      },
      {
        name: 'ZipRecruiter',
        description: 'Search and alerts across many sources.',
        url: 'https://www.ziprecruiter.com/',
        host: 'ziprecruiter.com',
      },
      {
        name: 'USAJOBS',
        description: 'Federal employment (United States).',
        url: 'https://www.usajobs.gov/',
        host: 'usajobs.gov',
      },
    ],
  },
  {
    title: 'News and career reads',
    intro:
      'Staying current helps you ask better questions in interviews. These are starting points, not endorsements.',
    links: [
      {
        name: 'LinkedIn News',
        description: 'Professional news and work-related stories.',
        url: 'https://www.linkedin.com/news/',
        host: 'linkedin.com',
      },
      {
        name: 'BBC Worklife',
        description: 'Work, wellbeing, and career ideas.',
        url: 'https://www.bbc.com/worklife',
        host: 'bbc.com',
      },
      {
        name: 'The Muse',
        description: 'Job search advice and company profiles.',
        url: 'https://www.themuse.com/',
        host: 'themuse.com',
      },
      {
        name: 'Ask HN: Who is hiring',
        description: 'Monthly tech hiring thread on Hacker News (search for the latest month).',
        url: 'https://hn.algolia.com/?query=Ask+HN%3A+Who+is+hiring&sort=byDate',
        host: 'ycombinator.com',
      },
      {
        name: 'Bureau of Labor Statistics',
        description: 'US employment news releases and data (official).',
        url: 'https://www.bls.gov/news.release/empsit.toc.htm',
        host: 'bls.gov',
      },
    ],
  },
]

function ToolsPage() {
  return (
    <div className="card static-page tools-page tools-page--static-enter">
      <header className="static-hero static-hero--compact">
        <p className="static-eyebrow">Resources</p>
        <h2 className="static-title">Tools and sites</h2>
        <p className="static-lead tools-page-lead">
          Hand-picked starting points for AI help, job search, and reading. Links open in a new
          tab. Career Caddie is not affiliated with these sites; their terms and privacy policies
          apply when you leave this app.
        </p>
      </header>

      <div className="tools-body">
        {toolGroups.map((group) => (
          <section key={group.title} className="tools-section">
            <h3 className="tools-section-title">{group.title}</h3>
            <p className="tools-section-intro">{group.intro}</p>
            <ul className="tools-link-grid">
              {group.links.map((link) => (
                <li key={link.url}>
                  <a
                    className="tools-link"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="tools-link-name">{link.name}</span>
                    <span className="tools-link-desc">{link.description}</span>
                    <span className="tools-link-host">{link.host}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

export default ToolsPage
