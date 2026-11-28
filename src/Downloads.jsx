import { useState } from 'react'
import { documentedWioVersion } from './docsCatalog.js'
import { examples } from './examples.js'
import {
  assetKind,
  detectPlatform,
  formatBytes,
  formatDate,
  githubReleases,
  latestStable,
  recommendedAsset,
  safeAssetUrl,
} from './releases.js'
import { Arrow, Button, Code, PageIntro } from './components.jsx'
import { Markdown } from './Reference.jsx'

function AssetList({ assets }) {
  return (
    <div className="asset-list">
      {assets.map((asset) => {
        const url = safeAssetUrl(asset)
        return (
          url && (
            <a href={url} key={asset.name}>
              <span>
                <strong>{asset.name}</strong>
                <small>
                  {assetKind(asset.name)} · {formatBytes(asset.size)}
                </small>
              </span>
              <span aria-hidden="true">↓</span>
            </a>
          )
        )
      })}
    </div>
  )
}

export function Releases({ state, id, retry, more }) {
  const [query, setQuery] = useState('')
  const selected = state.releases.find((release) => release.tag_name === id)
  const stable = latestStable(state.releases)
  const filtered = state.releases.filter((release) =>
    `${release.name} ${release.tag_name} ${release.body}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  if (selected)
    return (
      <div className="section release-detail">
        <a href="#releases" className="text-link">
          ← Release journal
        </a>
        <div className="doc-meta">
          <span className="eyebrow">
            {formatDate(selected.published_at)} / {selected.prerelease ? 'Preview' : 'Stable'}
          </span>
          <a href={selected.html_url}>
            Read on GitHub <Arrow />
          </a>
        </div>
        <h1>{selected.name || selected.tag_name}</h1>
        <Markdown
          content={selected.body || 'No notes were attached to this release.'}
          sourcePath="README.md"
        />
        <h2>Files in this release</h2>
        <AssetList assets={selected.assets} />
        <a href="#download" className="text-link">
          Installation guide →
        </a>
      </div>
    )
  return (
    <>
      <PageIntro
        label="The release journal"
        title={
          <>
            A language in motion.
            <br />
            <em>Every step, in the open.</em>
          </>
        }
      >
        Published releases, their notes, and every downloadable asset — synchronized from GitHub,
        without a manually maintained changelog.
      </PageIntro>
      <section className="section">
        <ReleaseStatus state={state} retry={retry} />
        {id && !selected && state.status !== 'loading' && (
          <p className="notice">
            This release is not in the loaded archive.{' '}
            <a href={`${githubReleases}/tag/${encodeURIComponent(id)}`}>Open it on GitHub →</a>
          </p>
        )}
        <label className="search-label release-search">
          Search releases
          <input
            type="search"
            placeholder="Version or change…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="release-list">
          {filtered.map((release) => (
            <a
              className="release-row"
              key={release.id ?? release.tag_name}
              href={`#releases/${release.tag_name}`}
            >
              <div>
                <span className="eyebrow">{formatDate(release.published_at)}</span>
                <span className="release-label">
                  {release === stable ? 'Recommended' : release.prerelease ? 'Preview' : 'Release'}
                </span>
              </div>
              <div>
                <h2>{release.name || release.tag_name}</h2>
                <p>
                  {release.body
                    ?.replace(/[#*`]/g, '')
                    .split('\n')
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(' ')
                    .slice(0, 180) || 'Read the release notes and download assets.'}
                </p>
              </div>
              <Arrow />
            </a>
          ))}
        </div>
        {!filtered.length && state.status !== 'loading' && (
          <p>
            No matching releases. <a href={githubReleases}>View all on GitHub →</a>
          </p>
        )}
        {state.hasMore && (
          <button className="button secondary" disabled={state.loadingMore} onClick={more}>
            {state.loadingMore ? 'Loading…' : 'Load older releases'} ↓
          </button>
        )}
        {state.moreError && (
          <p role="alert">
            Older releases could not be loaded. Try again, or{' '}
            <a href={githubReleases}>browse the full archive on GitHub</a>.
          </p>
        )}
      </section>
    </>
  )
}

function ReleaseStatus({ state, retry }) {
  if (state.status === 'loading')
    return <p role="status">Looking up releases… GitHub links remain available below.</p>
  if (state.status === 'error')
    return (
      <div className="notice" role="alert">
        <p>
          The release service is temporarily unavailable. You can still download directly from
          GitHub.
        </p>
        <button onClick={retry}>Try again</button> <a href={githubReleases}>GitHub releases →</a>
      </div>
    )
  if (state.cached)
    return (
      <p className="notice">
        Showing the last deployment’s release snapshot.{' '}
        <a href={`${githubReleases}/latest`}>Check GitHub for newer builds →</a>
      </p>
    )
  return (
    <p className="fine">
      Synced from GitHub · latest stable release recommended · previews labeled separately.
    </p>
  )
}

export function Download({ state, retry }) {
  const [platform, setPlatform] = useState(detectPlatform)
  const [architecture, setArchitecture] = useState('x64')
  const release = latestStable(state.releases)
  const asset = release ? recommendedAsset(release.assets, platform, architecture) : null
  return (
    <>
      <PageIntro
        label="Install / then make something"
        title={
          <>
            Your next idea
            <br />
            <em>starts here.</em>
          </>
        }
      >
        Choose a platform, get a toolchain, and write your first file. Portable archives and every
        older release remain within reach.
      </PageIntro>
      <section className="section download-layout">
        <div>
          <div className="download-controls">
            <div>
              <label htmlFor="download-platform">Platform</label>
              <select
                id="download-platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                <option value="windows">Windows</option>
                <option value="linux">Linux</option>
                <option value="macos">macOS</option>
                <option value="unknown">Other / source</option>
              </select>
            </div>
            <div>
              <label htmlFor="download-architecture">Architecture</label>
              <select
                id="download-architecture"
                value={architecture}
                onChange={(event) => setArchitecture(event.target.value)}
              >
                <option value="x64">x64</option>
                <option value="arm64">ARM64</option>
              </select>
            </div>
          </div>
          <div className="download-box">
            <span className="eyebrow">
              {release?.tag_name || `v${documentedWioVersion}`} / recommended stable
            </span>
            <h2>{asset ? 'Ready when you are.' : 'Build it your way.'}</h2>
            {asset ? (
              <>
                <p>
                  {asset.name}
                  <br />
                  <span className="fine">
                    {formatBytes(asset.size)} · {assetKind(asset.name)}
                  </span>
                </p>
                <Button href={safeAssetUrl(asset)}>Download for {platform}</Button>
                <p className="fine">
                  Downloads directly from GitHub. No sign-in, download proxy, or browser-side binary
                  fetch.
                </p>
              </>
            ) : (
              <>
                <p>
                  {state.status === 'loading'
                    ? 'Looking for a compatible binary…'
                    : `No verified ${platform} ${architecture} binary is listed in the current release. We won’t give you an installer for the wrong platform.`}
                </p>
                <Button href={`${githubReleases}/latest`} secondary>
                  See files on GitHub
                </Button>
                <a className="text-link" href="#docs/getting-started">
                  Build from source →
                </a>
              </>
            )}
            <ReleaseStatus state={state} retry={retry} />
          </div>
          {release && (
            <>
              <h3>All files / {release.tag_name}</h3>
              <AssetList assets={release.assets} />
              <p className="fine">
                Verify an archive or installer against SHA256SUMS.txt before installing. Install
                scripts are supplied as separate files; inspect them before running.
              </p>
            </>
          )}
          <a className="text-link" href="#releases">
            Looking for an older version? Open the release archive →
          </a>
        </div>
        <aside className="install-guide">
          <span className="eyebrow">After installing</span>
          <h2>
            From terminal
            <br />
            to first program.
          </h2>
          <ol>
            <li>
              <strong>Open a new terminal.</strong>
              <p>The installer may update your user PATH. A new terminal picks it up.</p>
              <Code title="Terminal" language="shell" code="wio --help" />
            </li>
            <li>
              <strong>Save a little Wio.</strong>
              <Code code={examples[0].code} title="hello.wio" download />
            </li>
            <li>
              <strong>Run your file.</strong>
              <Code title="Terminal" language="shell" code="wio file run hello.wio" />
            </li>
          </ol>
          <a className="text-link" href="#docs/getting-started">
            Full installation & environment guide →
          </a>
        </aside>
      </section>
    </>
  )
}
