import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assetKind,
  detectPlatform,
  latestStable,
  loadReleases,
  normalizeReleases,
  recommendedAsset,
  safeAssetUrl,
} from '../src/releases.js'
import { readRoute } from '../src/routing.js'
import { renderMarkdown } from '../src/markdown.js'
import { resolveDocumentationLink, docsCatalog } from '../src/docsCatalog.js'
import { examples, project } from '../src/examples.js'
import { declarationIndex } from '../src/stdCatalog.js'
import handler from '../api/releases.js'

const asset = (name) => ({
  name,
  browser_download_url: `https://github.com/tynes0/wio/releases/download/v0.20.4/${name}`,
})
const assets = [
  'SHA256SUMS.txt',
  'wio-vscode-0.20.4.vsix',
  'wio-windows-x64.zip',
  'WioSetup-windows-x64.exe',
].map(asset)
test('Windows installer is preferred, never extension/checksums', () =>
  assert.equal(recommendedAsset(assets, 'windows').name, 'WioSetup-windows-x64.exe'))
test('Missing platform never gets a foreign installer', () => {
  for (const os of ['linux', 'macos', 'unknown']) assert.equal(recommendedAsset(assets, os), null)
})
test('ARM64 never silently receives x64', () =>
  assert.equal(recommendedAsset(assets, 'windows', 'arm64'), null))
test('Portable package works when no installer exists', () =>
  assert.equal(recommendedAsset(assets.slice(0, 3), 'windows').name, 'wio-windows-x64.zip'))
test('Unsafe download URLs are rejected', () => {
  for (const url of [
    'javascript:alert(1)',
    'https://evil.com/tynes0/wio/releases/download/v1/x',
    'http://github.com/tynes0/wio/releases/download/v1/x',
  ])
    assert.equal(safeAssetUrl({ browser_download_url: url }), null)
})
test('Asset kind classification', () => {
  assert.equal(assetKind('editor.vsix'), 'VS Code extension')
  assert.equal(assetKind('a.tar.gz'), 'Portable archive')
  assert.equal(assetKind('SHA256SUMS.txt'), 'Checksums')
})
test('Platform detection', () => {
  assert.equal(detectPlatform('Windows NT'), 'windows')
  assert.equal(detectPlatform('Macintosh'), 'macos')
  assert.equal(detectPlatform('Linux Android'), 'unknown')
})
test('Stable release excludes previews and drafts', () => {
  const releases = normalizeReleases([
    { tag_name: 'v2', draft: true },
    { tag_name: 'v1', prerelease: false, published_at: '2026-01-01' },
    { tag_name: 'v2-rc', prerelease: true, published_at: '2026-02-01' },
  ])
  assert.equal(latestStable(releases).tag_name, 'v1')
  assert.equal(releases.length, 2)
})
test('Release service falls back to deployment snapshot', async () => {
  const calls = []
  const result = await loadReleases({
    fetcher: async (url) => {
      calls.push(url)
      if (url === '/api/releases') return { ok: false, status: 503 }
      return { ok: true, json: async () => [{ tag_name: 'v1' }] }
    },
  })
  assert.equal(result.cached, true)
  assert.equal(calls.length, 2)
})
test('Malformed snapshot falls back to GitHub', async () => {
  let calls = 0
  const result = await loadReleases({
    fetcher: async () => ({
      ok: true,
      json: async () => (++calls < 3 ? {} : [{ tag_name: 'v1' }]),
    }),
  })
  assert.equal(calls, 3)
  assert.equal(result.releases.length, 1)
})
test('All sources failing returns a visible error path', async () => {
  await assert.rejects(
    loadReleases({
      fetcher: async () => {
        throw new Error('offline')
      },
    }),
  )
})
test('Routes keep fragments inside documentation', () => {
  assert.deepEqual(readRoute('#docs/getting-started~run'), {
    page: 'docs',
    id: 'getting-started',
    anchor: 'run',
  })
  assert.equal(readRoute('#std/json').page, 'std')
  assert.equal(readRoute('#bad').page, 'not-found')
})
test('Relative doc links retain anchors', () => {
  assert.equal(
    resolveDocumentationLink('docs/WIO_GETTING_STARTED.md', './WIO_CLI_REFERENCE.md#project-check')
      .href,
    '#docs/cli-reference~project-check',
  )
  assert.equal(
    resolveDocumentationLink('docs/WIO_GETTING_STARTED.md', '#install').href,
    '#docs/getting-started~install',
  )
})
test('Markdown tables and explicit anchors render', () => {
  const html = renderMarkdown(
    '<a id="array"></a>\n\n| Name | Type |\n| --- | --- |\n| Count | usize |',
  )
  assert.match(html, /id="array"/)
  assert.match(html, /<table>/)
  assert.match(html, /<td>usize<\/td>/)
})
test('Markdown HTML, scripts, and dangerous links cannot execute', () => {
  const html = renderMarkdown(
    '<img src=x onerror=alert(1)>\n\n[bad](javascript:evil)\n\n`<script>`',
  )
  assert.doesNotMatch(html, /<img|<script|href="javascript/)
  assert.match(html, /&lt;img/)
})
test('Duplicate heading anchors stay unique', () =>
  assert.match(renderMarkdown('## Hello\n\n## Hello'), /id="hello-1"/))
test('Link ampersands are escaped once', () =>
  assert.match(renderMarkdown('[x](https://example.com/?x=1&y=2)'), /x=1&amp;y=2/))
test('Every recipe is complete, unique, and links to a real doc', () => {
  assert.equal(new Set(examples.map((item) => item.id)).size, examples.length)
  for (const item of examples) {
    assert.match(item.code, /fn Entry\(/)
    assert.ok(docsCatalog.some((doc) => doc.id === item.doc))
    assert.ok(item.filename.endsWith('.wio'))
  }
  assert.equal(project.files.length, 3)
})
test('Std declaration index keeps multiline signatures and source lines', () => {
  const result = declarationIndex(
    '// fn Fake();\npublic fn Convert(\n    value: string\n) -> i32 {\n    return 1;\n}',
  )
  assert.equal(result.length, 1)
  assert.equal(result[0].line, 2)
  assert.match(result[0].signature, /value: string/)
})
test('Std signatures retain realm and owner context', () => {
  const source =
    'realm std {\nrealm heap {\nobject ByteBuffer\n{\npublic fn Count() -> usize { return 0usize; }\n}\n}\n}'
  const result = declarationIndex(source)
  assert.equal(result[0].owner, 'std::heap::ByteBuffer')
})
test('x64 download does not select ARM64', () => {
  assert.equal(
    recommendedAsset([asset('wio-windows-arm64.exe'), ...assets], 'windows').name,
    'WioSetup-windows-x64.exe',
  )
})
test('Markdown formats code inside document links', () => {
  assert.match(
    renderMarkdown('[`CLI.md`](https://example.com)'),
    /<a[^>]+><code>CLI.md<\/code><\/a>/,
  )
})
test('Release endpoint rejects arbitrary upstream query injection', async () => {
  let status
  const response = {
    setHeader() {},
    status(value) {
      status = value
      return this
    },
    json() {},
  }
  await handler({ method: 'GET', query: { page: '1&repo=evil' } }, response)
  assert.equal(status, 400)
  await handler({ method: 'POST' }, response)
  assert.equal(status, 405)
})
