export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }
  const page = Number(request.query?.page ?? 1)
  if (!Number.isInteger(page) || page < 1 || page > 50) {
    return response.status(400).json({ error: 'Page must be between 1 and 50' })
  }
  try {
    const upstream = await fetch(
      `https://api.github.com/repos/tynes0/wio/releases?per_page=100&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Wio-Website',
        },
        signal: AbortSignal.timeout(8000),
      },
    )
    if (!upstream.ok) throw new Error('GitHub unavailable')
    const releases = await upstream.json()
    if (!Array.isArray(releases)) throw new Error('Invalid response')
    response.setHeader(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
    )
    return response.status(200).json(releases.filter((release) => !release.draft))
  } catch {
    response.setHeader('Cache-Control', 'no-store')
    return response.status(503).json({
      error: 'Release service temporarily unavailable. Use GitHub releases.',
    })
  }
}
