import { useEffect, useState } from 'react'
import { documentedWioVersion, repoUrl } from './docsCatalog.js'
import { latestStable, loadReleases } from './releases.js'
import { readRoute } from './routing.js'
import { Arrow, Header, Logo, Motion, NotFound, Search } from './components.jsx'
import { Home, Examples } from './Learning.jsx'
import { Docs, Std } from './Reference.jsx'
import { Download, Releases } from './Downloads.jsx'
import './App.css'

function Footer() {
  return (
    <footer className="footer section">
      <div className="footer-top">
        <a className="brand" href="#home" aria-label="Wio home">
          <Logo />
          <strong>wio</strong>
        </a>
        <p>
          For the things
          <br />
          you haven’t made yet.
        </p>
        <div>
          <a href="#docs/getting-started">Start here</a>
          <a href="#examples">Examples</a>
          <a href="#std">Standard library</a>
        </div>
        <div>
          <a href="#releases">Releases</a>
          <a href={repoUrl}>
            GitHub <Arrow />
          </a>
          <a href="#docs/known-issues">Known issues</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Wio / open-source language in development</span>
        <span>Documentation baseline {documentedWioVersion}</span>
        <a href="#home">Back to the beginning ↑</a>
      </div>
    </footer>
  )
}

function App() {
  const [route, setRoute] = useState(readRoute)
  const [search, setSearch] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({
    status: 'loading',
    releases: [],
    cached: false,
    hasMore: false,
    page: 1,
  })
  useEffect(() => {
    const change = () => setRoute(readRoute())
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  useEffect(() => {
    const key = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearch(true)
      }
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [])
  useEffect(() => {
    let cancelled = false
    loadReleases()
      .then((result) => {
        if (!cancelled)
          setState({
            ...result,
            status: 'ready',
            hasMore: result.releases.length === 100,
            page: 1,
          })
      })
      .catch(() => {
        if (!cancelled)
          setState({
            status: 'error',
            releases: [],
            cached: false,
            hasMore: false,
            page: 1,
          })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])
  useEffect(() => {
    if (!route.anchor) window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = `Wio — ${{ home: 'A language for making things.', examples: 'Code recipes & projects', std: 'Standard library', docs: 'Documentation', releases: 'Release journal', download: 'Download' }[route.page] || 'Page not found'}`
  }, [route.page, route.id, route.anchor])
  async function more() {
    setState((current) => ({
      ...current,
      loadingMore: true,
      moreError: false,
    }))
    try {
      const result = await loadReleases({ page: state.page + 1 })
      setState((current) => ({
        ...current,
        releases: [
          ...current.releases,
          ...result.releases.filter(
            (item) => !current.releases.some((existing) => existing.tag_name === item.tag_name),
          ),
        ],
        hasMore: result.releases.length === 100,
        page: current.page + 1,
        loadingMore: false,
      }))
    } catch {
      setState((current) => ({
        ...current,
        loadingMore: false,
        moreError: true,
      }))
    }
  }
  const retry = () => setAttempt((value) => value + 1)
  return (
    <>
      <Motion />
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      <Header page={route.page} onSearch={() => setSearch(true)} />
      {search && <Search close={() => setSearch(false)} />}
      <main id="main-content" tabIndex={-1}>
        {route.page === 'home' && <Home release={latestStable(state.releases)} />}
        {route.page === 'examples' && <Examples id={route.id} />}
        {route.page === 'std' && <Std id={route.id} anchor={route.anchor} />}
        {route.page === 'docs' && <Docs id={route.id} anchor={route.anchor} />}
        {route.page === 'releases' && (
          <Releases state={state} id={route.id} retry={retry} more={more} />
        )}
        {route.page === 'download' && <Download state={state} retry={retry} />}
        {route.page === 'not-found' && <NotFound />}
      </main>
      <Footer />
    </>
  )
}
export default App
