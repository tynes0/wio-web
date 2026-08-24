import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  docsByCategory,
  getBlobDocUrl,
  getRawDocUrl,
  latestReleaseUrl,
  releaseApiUrl,
} from './docsCatalog'
import { renderMarkdown } from './markdown'

const defaultDocId = 'getting-started'

const quickCommands = [
  'wio env setup --wio-root <package-root> --set-user --add-path',
  'wio file run .\\playground\\main.wio',
  'wio project new MyGame --output-dir C:\\Projects --template wio-app',
  'wio project build --project C:\\Projects\\MyGame',
  'wio project run --project C:\\Projects\\MyGame',
]

const featureCards = [
  {
    label: '01 · Language',
    title: 'Learn one coherent model',
    text: 'Objects, stack components, extensions, generics, async work, reflection, and native boundaries are taught as parts of the same language.',
  },
  {
    label: '02 · Tooling',
    title: 'Go from file to project',
    text: 'Start with one source file, then grow into projects, tests, packages, bindings, and environment diagnostics without changing tools.',
  },
  {
    label: '03 · Native',
    title: 'Cross the boundary deliberately',
    text: 'Follow practical C++ interop and SDK guides that explain ownership, ABI types, exported modules, and host integration together.',
  },
]

const learningTracks = [
  { number: '01', title: 'First program', text: 'Install Wio and run a single source file.', href: '#getting-started' },
  { number: '02', title: 'Language basics', text: 'Types, control flow, objects, and components.', href: navHref('docs', 'language') },
  { number: '03', title: 'Build a project', text: 'Manifests, native sources, tests, and packages.', href: navHref('docs', 'project-system') },
  { number: '04', title: 'Native interop', text: 'Bind C++ and expose Wio modules to a host.', href: navHref('docs', 'interop') },
]

const homeCode = `use std::console as console;

fn Entry() -> i32 {
    console::PrintLine("Hello from Wio");
    return 0;
}`

function formatDate(value) {
  if (!value) {
    return 'Unknown date'
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 'Unknown size'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let amount = value
  let unitIndex = 0
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024
    unitIndex += 1
  }

  return `${amount.toFixed(amount >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function detectPlatform() {
  if (typeof navigator === 'undefined') {
    return 'unknown'
  }

  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('win')) {
    return 'windows'
  }
  if (userAgent.includes('mac') || userAgent.includes('darwin')) {
    return 'macos'
  }
  if (userAgent.includes('linux')) {
    return 'linux'
  }
  return 'unknown'
}

function scoreAssetForPlatform(assetName, platform) {
  const lower = assetName.toLowerCase()

  switch (platform) {
    case 'windows':
      return /windows|win(32|64)?/.test(lower)
        ? 2
        : /linux|mac|darwin|osx/.test(lower)
          ? -1
          : 0

    case 'macos':
      return /mac|darwin|osx/.test(lower)
        ? 2
        : /windows|linux/.test(lower)
          ? -1
          : 0

    case 'linux':
      return /linux/.test(lower)
        ? 2
        : /windows|mac|darwin|osx/.test(lower)
          ? -1
          : 0

    default:
      return 0
  }
}

function scoreAssetKindForPlatform(assetName, platform) {
  const lower = assetName.toLowerCase()

  if (
    /release[_-]?notes/.test(lower) ||
    /sha\d*sums/.test(lower) ||
    /checksum/.test(lower) ||
    lower.endsWith('.md') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.asc') ||
    lower.endsWith('.sig')
  ) {
    return -100
  }

  switch (platform) {
    case 'windows':
      if (/setup.*\.exe$/.test(lower)) return 100
      if (/installer.*\.exe$/.test(lower)) return 95

      if (lower.endsWith('.exe')) return 80
      if (lower.endsWith('.msi')) return 75

      if (lower.endsWith('.ps1')) return 60

      if (lower.endsWith('.zip')) return 40

      return 0

    case 'macos':
      if (lower.endsWith('.dmg')) return 100
      if (lower.endsWith('.pkg')) return 95
      if (lower.endsWith('.zip')) return 60
      return 0

    case 'linux':
      if (lower.endsWith('.appimage')) return 100
      if (lower.endsWith('.deb')) return 90
      if (lower.endsWith('.rpm')) return 85
      if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) return 60
      if (lower.endsWith('.zip')) return 40
      return 0

    default:
      return 0
  }
}

function pickRecommendedAsset(assets, platform) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return null
  }

  const ranked = [...assets].sort((left, right) => {
    const leftPlatformScore = scoreAssetForPlatform(left.name, platform)
    const rightPlatformScore = scoreAssetForPlatform(right.name, platform)

    if (leftPlatformScore !== rightPlatformScore) {
      return rightPlatformScore - leftPlatformScore
    }

    const leftKindScore = scoreAssetKindForPlatform(left.name, platform)
    const rightKindScore = scoreAssetKindForPlatform(right.name, platform)

    if (leftKindScore !== rightKindScore) {
      return rightKindScore - leftKindScore
    }

    if (left.size !== right.size) {
      return right.size - left.size
    }

    return left.name.localeCompare(right.name)
  })

  return ranked[0] ?? null
}

function readRoute() {
  if (typeof window === 'undefined') {
    return { page: 'home', docId: defaultDocId }
  }

  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) {
    return { page: 'home', docId: defaultDocId }
  }
  if (hash.startsWith('docs/')) {
    return { page: 'docs', docId: hash.slice('docs/'.length) || defaultDocId }
  }
  if (hash === 'docs') {
    return { page: 'docs', docId: defaultDocId }
  }
  if (hash === 'download' || hash === 'getting-started' || hash === 'home') {
    return { page: hash, docId: defaultDocId }
  }

  return { page: 'home', docId: defaultDocId }
}

function navHref(page, docId = defaultDocId) {
  return page === 'docs' ? `#docs/${docId}` : `#${page}`
}

function useRemoteMarkdown(sourcePath) {
  const [state, setState] = useState({
    sourcePath,
    status: 'loading',
    content: '',
    error: '',
  })

  useEffect(() => {
    let cancelled = false

    fetch(getRawDocUrl(sourcePath))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${sourcePath} (${response.status})`)
        }
        return response.text()
      })
      .then((content) => {
        if (!cancelled) {
          setState({ sourcePath, status: 'ready', content, error: '' })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ sourcePath, status: 'error', content: '', error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [sourcePath])

  return state.sourcePath === sourcePath
    ? state
    : { sourcePath, status: 'loading', content: '', error: '' }
}

function TopNav({ page }) {
  return (
    <header className="topbar">
      <a className="brandmark" href="#home">
        <span className="brandmark-mark">W</span>
        <span className="brandmark-copy">
          <strong>Wio</strong>
          <small>Learn · Build · Ship</small>
        </span>
      </a>

      <nav className="topnav-links" aria-label="Primary">
        <a className={page === 'home' ? 'nav-link active' : 'nav-link'} href="#home">
          Overview
        </a>
        <a className={page === 'download' ? 'nav-link active' : 'nav-link'} href="#download">
          Download
        </a>
        <a className={page === 'getting-started' ? 'nav-link active' : 'nav-link'} href="#getting-started">
          Learn
        </a>
        <a className={page === 'docs' ? 'nav-link active' : 'nav-link'} href={navHref('docs')}>
          Reference
        </a>
      </nav>
    </header>
  )
}

function ReleaseCard({ releaseState, platform, recommendedAsset }) {
  return (
    <aside className="release-card surface-card">
      <p className="eyebrow">Latest release</p>
      {releaseState.status === 'loading' && <p className="muted">Checking GitHub for the latest Wio release...</p>}
      {releaseState.status === 'error' && (
        <div className="stack gap-sm">
          <p className="muted">The latest release could not be loaded automatically.</p>
          <p className="fine-print">{releaseState.error}</p>
          <a className="text-link" href={latestReleaseUrl} target="_blank" rel="noreferrer">
            Open releases manually
          </a>
        </div>
      )}
      {releaseState.status === 'empty' && (
        <div className="stack gap-sm">
          <p className="muted">There is no published release yet.</p>
          <p className="fine-print">You can still build Wio from source and follow the getting started flow.</p>
        </div>
      )}
      {releaseState.status === 'ready' && releaseState.release && (
        <>
          <h2>{releaseState.release.name || releaseState.release.tag_name}</h2>
          <p className="fine-print">Published {formatDate(releaseState.release.published_at)}</p>
          {recommendedAsset ? (
            <div className="download-callout">
              <span className="pill">Recommended for {platform}</span>
              <a
                className="primary-button block"
                href={recommendedAsset.browser_download_url}
                target="_blank"
                rel="noreferrer"
              >
                Download {recommendedAsset.name}
              </a>
              <p className="fine-print">{formatBytes(recommendedAsset.size)}</p>
            </div>
          ) : (
            <p className="muted">A release exists, but no downloadable assets were found yet.</p>
          )}
          <ul className="asset-list">
            {(releaseState.release.assets ?? []).map((asset) => (
              <li key={asset.id}>
                <a href={asset.browser_download_url} target="_blank" rel="noreferrer">
                  <span>{asset.name}</span>
                  <span>{formatBytes(asset.size)}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="install-note">
        <p className="eyebrow">After download</p>
        <pre>
          <code>wio env setup --wio-root &lt;package-root&gt; --set-user --add-path</code>
        </pre>
        <p className="fine-print">Then open a fresh terminal and run <code>wio</code>.</p>
      </div>
    </aside>
  )
}

function HomePage({ releaseState, platform, recommendedAsset }) {
  return (
    <div className="page-view home-view">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">A native-first programming language</p>
          <h1>Learn Wio.<br /><span>Build without layers.</span></h1>
          <p className="hero-text">
            A practical learning home for Wio—from your first file to native libraries,
            exported modules, async systems, and production projects.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#getting-started">
              Start learning <span aria-hidden="true">→</span>
            </a>
            <a className="secondary-button" href={navHref('docs')}>
              Explore reference
            </a>
          </div>
          <div className="hero-proof" aria-label="Wio highlights">
            <span>Compiled to C++20</span>
            <span>Windows + Linux</span>
            <span>First-class native interop</span>
          </div>
        </div>

        <div className="code-card">
          <div className="code-window-head">
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>hello.wio</span>
            <span className="code-status">ready</span>
          </div>
          <pre>
            <code>{homeCode}</code>
          </pre>
          <div className="terminal-line"><span>$</span> wio file run hello.wio</div>
          <div className="terminal-output">Hello from Wio</div>
        </div>
      </section>

      <section className="learning-section">
        <div className="section-kicker">Guided path</div>
        <div className="learning-heading">
          <h2>From zero to native application.</h2>
          <p>Follow the path in order, or jump directly to the topic you need.</p>
        </div>
        <div className="learning-grid">
          {learningTracks.map((track) => (
            <a className="learning-card" href={track.href} key={track.number}>
              <span>{track.number}</span>
              <h3>{track.title}</h3>
              <p>{track.text}</p>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="feature-grid">
        {featureCards.map((card) => (
          <article className="feature-card" key={card.title}>
            <p className="eyebrow">{card.label}</p>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="release-section">
        <div className="release-intro">
          <p className="eyebrow">Ready to begin?</p>
          <h2>Install the stable toolchain.</h2>
          <p>Download the recommended package for your platform, then verify the environment with one command.</p>
          <a className="text-link" href="#download">See installation details →</a>
        </div>
        <ReleaseCard releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />
      </section>
    </div>
  )
}

function DownloadPage({ releaseState, platform, recommendedAsset }) {
  return (
    <div className="page-view download-view">
      <section className="section-head">
        <p className="eyebrow">Downloads</p>
        <h1>Pick a release and wire it into your shell.</h1>
        <p className="section-text">This page keeps the path from release asset to a working <code>wio</code> command very short.</p>
      </section>

      <section className="download-grid">
        <ReleaseCard releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />

        <div className="surface-card detail-card">
          <p className="eyebrow">Package contents</p>
          <h2>What ships in a Wio package</h2>
          <ul className="plain-list">
            <li><code>bin/wio.exe</code> or the platform-equivalent CLI binary</li>
            <li><code>std/</code> for canonical source-based standard library modules</li>
            <li><code>sdk/include</code> for host-side embedding and exported module work</li>
            <li><code>cmake/WioProject.cmake</code> for project integration</li>
            <li><code>Install-Wio.ps1</code> or <code>install-wio.sh</code> as thin wrappers over the CLI env flow</li>
          </ul>

          <p className="eyebrow section-gap">Typical setup commands</p>
          <div className="command-stack">
            <code>wio env status --wio-root &lt;package-root&gt;</code>
            <code>wio env setup --wio-root &lt;package-root&gt; --set-user --add-path</code>
            <code>wio env doctor --wio-root &lt;package-root&gt;</code>
            <code>wio env remove --wio-root &lt;package-root&gt; --set-user --remove-path</code>
          </div>
        </div>
      </section>
    </div>
  )
}

function GettingStartedPage({ guideState }) {
  const renderedGuide = guideState.status === 'ready' ? renderMarkdown(guideState.content) : ''

  return (
    <div className="page-view getting-started-view">
      <section className="section-head">
        <p className="eyebrow">Getting Started</p>
        <h1>Use the final CLI shape from day one.</h1>
        <p className="section-text">These are the commands and the flow we want users to grow into, not temporary scaffolding.</p>
      </section>

      <section className="start-grid">
        <div className="surface-card command-card">
          <p className="eyebrow">First commands</p>
          <h2>Minimal first-day path</h2>
          <div className="command-stack">
            {quickCommands.map((command) => (
              <code key={command}>{command}</code>
            ))}
          </div>
        </div>

        <div className="surface-card guide-card">
          <p className="eyebrow">Guide</p>
          <h2>Practical onboarding</h2>
          {guideState.status === 'loading' && <p className="muted">Loading the getting started guide...</p>}
          {guideState.status === 'error' && (
            <div className="doc-error">
              <p>That guide could not be loaded right now.</p>
              <p className="fine-print">{guideState.error}</p>
            </div>
          )}
          {guideState.status === 'ready' && (
            <article className="markdown-body compact-markdown scroll-area" dangerouslySetInnerHTML={{ __html: renderedGuide }} />
          )}
        </div>
      </section>
    </div>
  )
}

function DocsPage({
  docsByCategoryFiltered,
  selectedDoc,
  selectedDocId,
  docSearch,
  onSearchChange,
  onDocSelect,
  docState,
}) {
  const docScrollRef = useRef(null)
  const renderedDocHtml = docState.status === 'ready' ? renderMarkdown(docState.content) : ''

  useEffect(() => {
    docScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [selectedDocId])

  return (
    <div className="page-view docs-view">
      <section className="docs-shell">
        <aside className="docs-sidebar surface-card">
          <div className="sidebar-head">
            <div>
              <p className="eyebrow">Documentation explorer</p>
              <h2>Browse the docs</h2>
            </div>
            <input
              type="search"
              value={docSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search docs"
              aria-label="Search docs"
            />
          </div>

          <div className="doc-groups scroll-area">
            {docsByCategoryFiltered.map((group) => (
              <section key={group.category} className="doc-group">
                <p className="group-label">{group.category}</p>
                <ul>
                  {group.items.map((doc) => {
                    const selected = doc.id === selectedDoc.id
                    return (
                      <li key={doc.id}>
                        <button
                          type="button"
                          className={selected ? 'doc-link active' : 'doc-link'}
                          onClick={() => onDocSelect(doc.id)}
                        >
                          <span>{doc.title}</span>
                          <small>{doc.description}</small>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </aside>

        <main className="doc-panel surface-card">
          <div className="doc-panel-head">
            <div>
              <p className="eyebrow">{selectedDoc.category}</p>
              <h2>{selectedDoc.title}</h2>
              <p className="muted">{selectedDoc.description}</p>
            </div>
            <div className="doc-panel-actions">
              <a href={getBlobDocUrl(selectedDoc.sourcePath)} target="_blank" rel="noreferrer">
                View source on GitHub
              </a>
              <a href={getRawDocUrl(selectedDoc.sourcePath)} target="_blank" rel="noreferrer">
                Open raw markdown
              </a>
            </div>
          </div>

          <div className="doc-panel-scroll scroll-area" ref={docScrollRef}>
            {docState.status === 'loading' && <p className="muted">Loading documentation...</p>}
            {docState.status === 'error' && (
              <div className="doc-error">
                <p>That document could not be loaded right now.</p>
                <p className="fine-print">{docState.error}</p>
              </div>
            )}
            {docState.status === 'ready' && (
              <article className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedDocHtml }} />
            )}
          </div>
        </main>
      </section>
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(readRoute)
  const [docSearch, setDocSearch] = useState('')
  const deferredSearch = useDeferredValue(docSearch)
  const [releaseState, setReleaseState] = useState({
    status: 'loading',
    release: null,
    error: '',
  })

  const flatDocs = useMemo(() => docsByCategory.flatMap((group) => group.items), [])
  const gettingStartedDoc = flatDocs.find((doc) => doc.id === 'getting-started') ?? flatDocs[0]
  const selectedDoc = flatDocs.find((doc) => doc.id === route.docId) ?? gettingStartedDoc
  const docState = useRemoteMarkdown(selectedDoc.sourcePath)
  const guideState = useRemoteMarkdown(gettingStartedDoc.sourcePath)

  const filteredGroups = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    if (!query) {
      return docsByCategory
    }

    return docsByCategory
      .map((group) => ({
        ...group,
        items: group.items.filter((doc) => {
          const haystack = `${doc.title} ${doc.description} ${doc.sourcePath}`.toLowerCase()
          return haystack.includes(query)
        }),
      }))
      .filter((group) => group.items.length > 0)
  }, [deferredSearch])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const onHashChange = () => {
      setRoute(readRoute())
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route.page])

  useEffect(() => {
    let cancelled = false

    fetch(releaseApiUrl)
      .then(async (response) => {
        if (response.status === 404) {
          return null
        }
        if (!response.ok) {
          throw new Error(`GitHub release lookup failed (${response.status})`)
        }
        return response.json()
      })
      .then((release) => {
        if (!cancelled) {
          if (release === null) {
            setReleaseState({ status: 'empty', release: null, error: '' })
          } else {
            setReleaseState({ status: 'ready', release, error: '' })
          }
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setReleaseState({ status: 'error', release: null, error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const platform = detectPlatform()
  const recommendedAsset = releaseState.release
    ? pickRecommendedAsset(releaseState.release.assets ?? [], platform)
    : null

  const navigateToDoc = (docId) => {
    startTransition(() => {
      window.location.hash = navHref('docs', docId)
    })
  }

  return (
    <div className="page-shell">
      <TopNav page={route.page} />

      {route.page === 'home' && (
        <HomePage releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />
      )}
      {route.page === 'download' && (
        <DownloadPage releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />
      )}
      {route.page === 'getting-started' && <GettingStartedPage guideState={guideState} />}
      {route.page === 'docs' && (
        <DocsPage
          docsByCategoryFiltered={filteredGroups}
          selectedDoc={selectedDoc}
          selectedDocId={route.docId}
          docSearch={docSearch}
          onSearchChange={setDocSearch}
          onDocSelect={navigateToDoc}
          docState={docState}
        />
      )}
    </div>
  )
}

export default App
