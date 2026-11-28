import { useEffect, useMemo, useRef, useState } from 'react'
import {
  docsCatalog,
  docsByCategory,
  documentedWioVersion,
  getBlobDocUrl,
  resolveDocumentationLink,
  repoUrl,
} from './docsCatalog.js'
import { declarationIndex, stdModules } from './stdCatalog.js'
import { renderMarkdown } from './markdown.js'
import { Arrow, Code, NotFound, PageIntro } from './components.jsx'

function useContent(path, remote = '') {
  const [state, setState] = useState({
    path: '',
    status: 'loading',
    content: '',
  })
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        let response = await fetch(`/content/${path}`, {
          signal: controller.signal,
        })
        if ((!response.ok || response.headers.get('content-type')?.includes('text/html')) && remote)
          response = await fetch(remote, { signal: controller.signal })
        if (!response.ok || response.headers.get('content-type')?.includes('text/html'))
          throw new Error('Document unavailable')
        const content = await response.text()
        if (!controller.signal.aborted) setState({ path, status: 'ready', content })
      } catch {
        if (!controller.signal.aborted) setState({ path, status: 'error', content: '' })
      }
    }
    load()
    return () => controller.abort()
  }, [path, remote])
  return state.path === path ? state : { status: 'loading', content: '' }
}

export function Markdown({ content, sourcePath }) {
  const html = useMemo(
    () =>
      renderMarkdown(content, {
        resolveLink: (target) => resolveDocumentationLink(sourcePath, target),
      }),
    [content, sourcePath],
  )
  return <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
}

export function Docs({ id, anchor }) {
  const [query, setQuery] = useState('')
  const selected = docsCatalog.find((doc) => doc.id === id)
  const state = useContent(
    selected?.sourcePath ?? 'missing',
    selected
      ? `https://raw.githubusercontent.com/tynes0/wio/v${documentedWioVersion}/${selected.sourcePath}`
      : '',
  )
  const article = useRef()
  const [contents, setContents] = useState([])
  useEffect(() => {
    if (state.status === 'ready') {
      setContents(
        [...article.current.querySelectorAll('h2, h3')].map((heading) => ({
          id: heading.id,
          title: heading.textContent,
          level: heading.tagName,
        })),
      )
      if (anchor) document.getElementById(anchor)?.scrollIntoView()
    }
  }, [state.status, anchor, id])
  if (!selected) return <NotFound />
  const groups = docsByCategory
    .map((group) => ({
      ...group,
      items: group.items.filter((doc) =>
        `${doc.title} ${doc.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length)
  return (
    <div className="docs-layout section">
      <aside className="docs-sidebar">
        <a href="#docs/documentation-map" className="eyebrow">
          Documentation / {documentedWioVersion}
        </a>
        <label className="search-label">
          Find a document
          <input
            type="search"
            value={query}
            placeholder="Search documentation…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <details className="docs-tree" open>
          <summary>Browse documentation</summary>
          {groups.map((group) => (
            <section key={group.category}>
              <h2>{group.category}</h2>
              {group.items.map((doc) => (
                <a
                  href={`#docs/${doc.id}`}
                  key={doc.id}
                  aria-current={id === doc.id ? 'page' : undefined}
                >
                  {doc.title}
                </a>
              ))}
            </section>
          ))}
          {!groups.length && <p>No matching documents.</p>}
        </details>
      </aside>
      <div className="doc-content" key={id} ref={article}>
        <div className="doc-meta">
          <span className="eyebrow">{selected.category}</span>
          <a
            href={`${repoUrl}/blob/v${documentedWioVersion}/${selected.sourcePath}`}
            target="_blank"
            rel="noreferrer"
          >
            Source <Arrow />
          </a>
        </div>
        <p className="doc-description">{selected.description}</p>
        {state.status === 'loading' && <p role="status">Loading document…</p>}
        {state.status === 'error' && (
          <div className="notice">
            <h1>Document temporarily unavailable.</h1>
            <p>The bundled copy and remote source could not be loaded.</p>
            <a href={getBlobDocUrl(selected.sourcePath)}>Read it on GitHub →</a>
          </div>
        )}
        {state.status === 'ready' && (
          <Markdown content={state.content} sourcePath={selected.sourcePath} />
        )}
      </div>
      <aside className="table-of-contents">
        <span className="eyebrow">On this page</span>
        {contents.map((heading, index) => (
          <a
            key={index}
            className={heading.level === 'H3' ? 'nested' : ''}
            href={`#docs/${id}~${heading.id}`}
          >
            {heading.title}
          </a>
        ))}
      </aside>
    </div>
  )
}

export function Std({ id = '', anchor = '' }) {
  const [query, setQuery] = useState('')
  const [apiSearch, setApiSearch] = useState({ id: '', query: '' })
  const apiQuery = apiSearch.id === id ? apiSearch.query : ''
  const [inventory, setInventory] = useState(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/content/std.json', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((names) => setInventory(Array.isArray(names) ? names : null))
      .catch(() => {})
    return () => controller.abort()
  }, [])
  const modules = inventory
    ? [...new Set([...stdModules.map((item) => item.name), ...inventory])]
        .filter((name) => inventory.includes(name))
        .map(
          (name) =>
            stdModules.find((item) => item.name === name) ?? {
              name,
              category: 'Other modules',
            },
        )
    : stdModules
  const module = modules.find((item) => item.name === id)
  const state = useContent(
    `std/${id || 'result'}.wio`,
    `https://raw.githubusercontent.com/tynes0/wio/v${documentedWioVersion}/std/${id || 'result'}.wio`,
  )
  const declarations = state.status === 'ready' ? declarationIndex(state.content) : []
  const filteredDeclarations = declarations.filter((item) =>
    `${item.owner} ${item.signature}`.toLowerCase().includes(apiQuery.toLowerCase()),
  )
  useEffect(() => {
    if (state.status === 'ready' && anchor) document.getElementById(anchor)?.scrollIntoView()
  }, [state.status, anchor, id])
  const shown = modules.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
  )
  if (id && !module) return <NotFound />
  return (
    <>
      {!id && (
        <PageIntro
          label={`Standard library / current release ${documentedWioVersion}`}
          title={
            <>
              A useful foundation.
              <br />
              <em>Nothing hidden away.</em>
            </>
          }
        >
          Browse the standard library as it ships today: source, imports, declarations, and the
          details that don’t fit into a one-line example.
        </PageIntro>
      )}
      <section className="section std-library">
        {id && (
          <p className="std-breadcrumb fine">
            <a href="#std">Standard library</a> / std::{id} / release {documentedWioVersion}
          </p>
        )}
        {!id && (
          <div className="notice">
            <strong>The current contract, not the future one.</strong>
            <p>
              Some APIs still return Option or expose Try-prefixed compatibility functions. The
              planned Result-first / std cleanup pass has not happened yet. This page intentionally
              preserves today’s signatures.
            </p>
            <a href="#docs/std">Read the std guide →</a>
            <a href="#docs/builtin-methods">Compiler-provided methods →</a>
          </div>
        )}
        <div className="std-layout">
          <aside className="std-sidebar">
            <label className="search-label">
              Find a module
              <input
                type="search"
                value={query}
                placeholder="json, buffer, async…"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <a href="#std" className="text-link">
              All modules →
            </a>
            {[...new Set(shown.map((item) => item.category))].map((category) => (
              <div key={category}>
                <h2>{category}</h2>
                {shown
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <a
                      aria-current={item.name === id ? 'page' : undefined}
                      key={item.name}
                      href={`#std/${item.name}`}
                    >
                      std::{item.name}
                      <Arrow />
                    </a>
                  ))}
              </div>
            ))}
            {!shown.length && <p>No matching modules.</p>}
          </aside>
          {module ? (
            <div className="std-detail" key={id}>
              <div className="doc-meta">
                <span className="eyebrow">{module.category}</span>
                <a href={`#std/${id}~std-source`}>Full source ↓</a>
                <a
                  href={`${repoUrl}/blob/v${documentedWioVersion}/std/${id}.wio`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source <Arrow />
                </a>
              </div>
              <h1>std::{id}</h1>
              <p className="fine">
                Release {documentedWioVersion} source, including current Option/Try compatibility
                APIs. Module paths and declaration realms can differ; check the qualified owner
                below.
              </p>
              <Code code={`use std::${id};`} title="Import" />
              {state.status === 'loading' && <p role="status">Loading source…</p>}
              {state.status === 'error' && (
                <p role="alert">Source unavailable. Use the GitHub source link above.</p>
              )}
              {state.status === 'ready' && (
                <>
                  <details className="declarations" open>
                    <summary>Declaration index / {declarations.length} signatures</summary>
                    <p className="fine">
                      Source-level index including private and compatibility declarations, not a
                      semantic API export list. Read surrounding source for realms, receivers, and
                      visibility.
                    </p>
                    <label className="search-label">
                      Find a declaration
                      <input
                        type="search"
                        placeholder="Method, parameter, return type…"
                        value={apiQuery}
                        onChange={(event) => setApiSearch({ id, query: event.target.value })}
                      />
                    </label>
                    {filteredDeclarations.map((item, i) => (
                      <a
                        key={i}
                        href={`${repoUrl}/blob/v${documentedWioVersion}/std/${id}.wio#L${item.line}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>L{item.line}</span>
                        <div>
                          <small className="declaration-owner">
                            {item.owner || 'Global declaration'}
                          </small>
                          <code>{item.signature}</code>
                        </div>
                      </a>
                    ))}
                    {!filteredDeclarations.length && <p>No matching declarations.</p>}
                  </details>
                  <h3 id="std-source">Full source / {id}.wio</h3>
                  <Code code={state.content} title={`${id}.wio`} download />
                </>
              )}
            </div>
          ) : (
            <div className="std-overview">
              <h2>Start with the work at hand.</h2>
              <p>
                Select any module to read its complete release-pinned source and declaration index.
              </p>
              <div className="recipe-grid">
                {[
                  ['result', 'Handle success and failure'],
                  ['json', 'Move structured data'],
                  ['buffer', 'Work with bytes'],
                  ['async', 'Coordinate concurrent work'],
                  ['fs', 'Read and write files'],
                  ['collections', 'Organize your values'],
                ].map(([name, text]) => (
                  <a className="recipe-tile" href={`#std/${name}`} key={name}>
                    <span className="eyebrow">std::{name}</span>
                    <h3>{text}</h3>
                    <Arrow />
                  </a>
                ))}
              </div>
              <p className="fine">
                String, text, array, dictionary, enum and coroutine members may be implemented by
                the compiler, rather than declared in std. See the{' '}
                <a href="#docs/builtin-methods">built-in method reference</a> for their parameters
                and return types.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
