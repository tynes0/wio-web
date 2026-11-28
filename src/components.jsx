import { useEffect, useRef, useState } from 'react'
import { docsCatalog, repoUrl } from './docsCatalog.js'
import { examples } from './examples.js'
import { stdModules } from './stdCatalog.js'

export const Arrow = () => <span aria-hidden="true">↗</span>
export function Logo({ large = false }) {
  return (
    <span className={`logo-crop ${large ? 'large' : ''}`}>
      <img src="/wio-logo.png" alt="" />
    </span>
  )
}
export function Button({ href, children, secondary = false, ...props }) {
  return (
    <a href={href} className={`button ${secondary ? 'secondary' : ''}`} {...props}>
      {children}
      <Arrow />
    </a>
  )
}
export function Code({ code, title = 'main.wio', language = 'wio', download = false }) {
  const [copied, setCopied] = useState('')
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied('Copied')
    } catch {
      setCopied('Select the code to copy')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(''), 2500)
  }
  const tokens = code.split(
    /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:fn|async|await|use|as|let|mut|return|if|else|for|in|while|realm|component|object|extension|public|private|view|ref|enum|match|assumed|true|false|fit|const|type)\b|\b\d+(?:\.\d+)?(?:usize|u64|i32|f64)?\b)/g,
  )
  return (
    <div className="code-window">
      <div className="code-toolbar">
        <span>
          <span className="file-dot" />
          {title}
        </span>
        <div>
          {download && (
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(code)}`}
              download={title.split('/').at(-1)}
            >
              Save file ↓
            </a>
          )}
          <button onClick={copy} type="button" aria-label={`Copy ${title}`}>
            {copied || 'Copy code'}
          </button>
        </div>
      </div>
      <pre tabIndex={0} aria-label={`${title} source code`}>
        <code>
          {language === 'wio'
            ? tokens.map((token, i) => (
                <span
                  key={i}
                  className={
                    token.startsWith('//')
                      ? 'token-comment'
                      : /^['"]/.test(token)
                        ? 'token-string'
                        : /^(fn|async|await|use|as|let|mut|return|if|else|for|in|while|realm|component|object|extension|public|private|view|ref|enum|match|assumed|true|false|fit|const|type)$/.test(
                              token,
                            )
                          ? 'token-keyword'
                          : /^\d/.test(token)
                            ? 'token-number'
                            : undefined
                  }
                >
                  {token}
                </span>
              ))
            : code}
        </code>
      </pre>
      <span className="sr-only" role="status">
        {copied}
      </span>
    </div>
  )
}
export function PageIntro({ label, title, children }) {
  return (
    <div className="page-intro section">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  )
}
export function NotFound() {
  return (
    <PageIntro label="404 / not this way" title="Let’s find the right page.">
      That route is not available. <a href="#docs/getting-started">Start with the documentation</a>{' '}
      or <a href="#examples">browse examples</a>.
    </PageIntro>
  )
}

const navigation = [
  {
    title: 'Learn',
    links: [
      [
        'Start here',
        '#docs/getting-started',
        'Your first Wio program. From install to a working project.',
        'hello',
      ],
      [
        'How-to library',
        '#examples',
        'Small, complete programs. Copy, save, and make them your own.',
        'arrays',
      ],
      [
        'Build a project',
        '#examples/project',
        'A working telemetry reporter, one module at a time.',
        'json',
      ],
    ],
  },
  {
    title: 'Explore',
    links: [
      [
        'Language reference',
        '#docs/language',
        'Types, values, functions, ownership, and everyday syntax.',
        'components',
      ],
      ['Standard library', '#std', 'Explore the actual std source and its declarations.', 'parse'],
      [
        'Native & SDK',
        '#docs/interop',
        'Connect to C++ libraries and embed Wio in a host.',
        'callbacks',
      ],
      [
        'Async & tasks',
        '#docs/async-model',
        'Coroutines, executors, cancellation, and structured work.',
        'async',
      ],
    ],
  },
]
export function Header({ page, onSearch }) {
  const [menu, setMenu] = useState(null)
  const [preview, setPreview] = useState(navigation[0].links[0])
  const header = useRef()
  useEffect(() => {
    const outside = (event) => {
      if (!header.current?.contains(event.target)) setMenu(null)
    }
    const escape = (event) => {
      if (event.key === 'Escape') setMenu(null)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  return (
    <header className="header" ref={header}>
      <a href="#home" className="brand" aria-label="Wio home" onClick={() => setMenu(null)}>
        <Logo />
        <strong>
          wio<span> / </span>
        </strong>
      </a>
      <nav aria-label="Main navigation" onMouseLeave={() => setMenu(null)}>
        {navigation.map((group) => (
          <div
            className="nav-group"
            key={group.title}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'mouse') return
              setMenu(group.title)
              setPreview(group.links[0])
            }}
          >
            <button
              type="button"
              aria-expanded={menu === group.title}
              aria-controls={`menu-${group.title}`}
              onClick={(event) => {
                setMenu(
                  menu === group.title &&
                    (event.detail === 0 || !window.matchMedia('(hover: hover)').matches)
                    ? null
                    : group.title,
                )
                setPreview(group.links[0])
              }}
            >
              {group.title}
              <span aria-hidden="true">+</span>
            </button>
            {menu === group.title && (
              <div className="mega-menu" id={`menu-${group.title}`}>
                <div className="mega-links">
                  <p className="eyebrow">{group.title} / Wio</p>
                  {group.links.map((item) => (
                    <a
                      href={item[1]}
                      key={item[0]}
                      onFocus={() => setPreview(item)}
                      onMouseEnter={() => setPreview(item)}
                      onClick={() => setMenu(null)}
                    >
                      <strong>
                        {item[0]}
                        <Arrow />
                      </strong>
                      <span>{item[2]}</span>
                    </a>
                  ))}
                </div>
                <div className="mega-preview">
                  <span className="eyebrow">A look inside / {preview[0]}</span>
                  <Code
                    code={examples.find((item) => item.id === preview[3]).code}
                    title={`${preview[3]}.wio`}
                  />
                  <a className="text-link" href={preview[1]} onClick={() => setMenu(null)}>
                    Explore {preview[0].toLowerCase()} →
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
        <a
          className={page === 'releases' ? 'active' : ''}
          href="#releases"
          onClick={() => setMenu(null)}
        >
          Releases
        </a>
        <a className="github-nav" href={repoUrl} target="_blank" rel="noreferrer">
          GitHub <Arrow />
        </a>
      </nav>
      <div className="header-actions">
        <button className="search-trigger" aria-label="Search Wio" onClick={onSearch}>
          Search <kbd>⌘ K</kbd>
        </button>
        <a className="get-wio" href="#download" onClick={() => setMenu(null)}>
          Get Wio <span>↓</span>
        </a>
      </div>
    </header>
  )
}

export function Search({ close }) {
  const dialog = useRef()
  const [query, setQuery] = useState('')
  const matches = [
    ...examples.map((example) => ({
      title: example.title,
      description: example.description,
      href: `#examples/${example.id}`,
      category: 'Example',
    })),
    ...docsCatalog.map((doc) => ({ ...doc, href: `#docs/${doc.id}` })),
    ...stdModules.map((module) => ({
      title: `std::${module.name}`,
      description: module.category,
      href: `#std/${module.name}`,
      category: 'Standard library',
    })),
  ]
    .filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 12)
  useEffect(() => {
    dialog.current.showModal()
  }, [])
  return (
    <dialog
      className="search-dialog"
      ref={dialog}
      onClose={close}
      aria-label="Search Wio documentation and examples"
      onClick={(event) => {
        if (event.target === dialog.current) close()
      }}
    >
      <div className="search-field">
        <input
          type="search"
          autoFocus
          placeholder="Find a concept, recipe, or std module…"
          aria-label="Search everything"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button onClick={close} aria-label="Close search">
          Esc
        </button>
      </div>
      <div className="search-results">
        {matches.map((item) => (
          <a key={item.href} href={item.href} onClick={close}>
            <span className="eyebrow">{item.category}</span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </a>
        ))}
        {!matches.length && <p>No matches. Try “async”, “JSON”, or “array”.</p>}
      </div>
    </dialog>
  )
}

export function Motion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame
    function update() {
      const y = window.scrollY
      document.documentElement.style.setProperty(
        '--scroll-turn',
        reduced.matches ? '0deg' : `${y * 0.08}deg`,
      )
      document.documentElement.style.setProperty(
        '--scroll-drift',
        reduced.matches ? '0px' : `${Math.min(y * 0.06, 140)}px`,
      )
      document.documentElement.classList.toggle('scrolled', y > 72)
      const cards = [...document.querySelectorAll('[data-collapse-card]')]
      // Read all geometry first; only then write transforms, avoiding layout thrash.
      const progress = cards.map((card) => {
        const next = card.nextElementSibling
        return !next
          ? 0
          : Math.max(
              0,
              Math.min(
                1,
                (innerHeight * 0.7 - next.getBoundingClientRect().top) /
                  Math.max(1, innerHeight * 0.7 - 160),
              ),
            )
      })
      cards.forEach((card, index) =>
        card.style.setProperty('--collapse', reduced.matches ? '0' : String(progress[index])),
      )
      frame = undefined
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    reduced.addEventListener('change', update)
    update()
    return () => {
      window.removeEventListener('scroll', schedule)
      reduced.removeEventListener('change', update)
      cancelAnimationFrame(frame)
    }
  }, [])
  return null
}
