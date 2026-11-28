export const githubReleases = 'https://github.com/tynes0/wio/releases'

export function normalizeReleases(payload) {
  if (!Array.isArray(payload)) throw new Error('Invalid release response')
  return payload
    .filter((release) => !release.draft && typeof release.tag_name === 'string')
    .map((release) => ({
      ...release,
      name: typeof release.name === 'string' ? release.name : release.tag_name,
      body: typeof release.body === 'string' ? release.body : '',
      html_url: `${githubReleases}/tag/${encodeURIComponent(release.tag_name)}`,
      assets: Array.isArray(release.assets)
        ? release.assets.filter((asset) => asset && typeof asset.name === 'string')
        : [],
    }))
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
}

export function latestStable(releases) {
  return releases.find((release) => !release.prerelease) ?? null
}

export function detectPlatform(agent = globalThis.navigator?.userAgent ?? '') {
  if (/windows|win32|win64/i.test(agent)) return 'windows'
  if (/macintosh|mac os|darwin/i.test(agent)) return 'macos'
  if (/linux/i.test(agent) && !/android/i.test(agent)) return 'linux'
  return 'unknown'
}

export function assetPlatform(name) {
  if (/windows|win32|win64/i.test(name)) return 'windows'
  if (/macos|darwin|osx/i.test(name)) return 'macos'
  if (/linux/i.test(name)) return 'linux'
  return 'unknown'
}

export function assetKind(name) {
  if (/\.vsix$/i.test(name)) return 'VS Code extension'
  if (/sha\d*sums|checksum|\.sig$|\.asc$/i.test(name)) return 'Checksums'
  if (/\.(exe|msi|dmg|pkg|deb|rpm|appimage)$/i.test(name)) return 'Installer'
  if (/\.(zip|tar\.gz|tgz|tar\.xz)$/i.test(name)) return 'Portable archive'
  if (/\.(ps1|sh)$/i.test(name)) return 'Install script'
  return 'Other'
}

export function safeAssetUrl(asset) {
  try {
    const url = new URL(asset.browser_download_url)
    return url.protocol === 'https:' &&
      url.hostname === 'github.com' &&
      url.pathname.startsWith('/tynes0/wio/releases/download/')
      ? url.href
      : null
  } catch {
    return null
  }
}

export function recommendedAsset(assets, platform, architecture = 'x64') {
  const kinds = ['Installer', 'Portable archive']
  return (
    assets
      .filter(
        (asset) =>
          assetPlatform(asset.name) === platform &&
          kinds.includes(assetKind(asset.name)) &&
          safeAssetUrl(asset) &&
          (architecture === 'arm64'
            ? /arm64|aarch64|universal/i.test(asset.name)
            : !/arm64|aarch64/i.test(asset.name)),
      )
      .sort((a, b) => kinds.indexOf(assetKind(a.name)) - kinds.indexOf(assetKind(b.name)))[0] ??
    null
  )
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return 'Size unavailable'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.valueOf())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
}

export async function loadReleases({ page = 1, fetcher = fetch } = {}) {
  // One shared cached request, rather than two unauthenticated calls per visitor.
  const sources =
    page === 1
      ? [
          '/api/releases',
          '/content/releases.json',
          'https://api.github.com/repos/tynes0/wio/releases?per_page=100',
        ]
      : [`/api/releases?page=${page}`]
  let lastError
  for (const [index, source] of sources.entries()) {
    try {
      const response = await fetcher(source, {
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error(`Release service returned ${response.status}`)
      return {
        releases: normalizeReleases(await response.json()),
        cached: page === 1 && index === 1,
      }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error('Release service unavailable')
}
