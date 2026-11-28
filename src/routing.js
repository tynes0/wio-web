export function readRoute(hash = globalThis.location?.hash ?? '') {
  const [path, anchor = ''] = hash.replace(/^#/, '').split('~', 2)
  const [page = 'home', id = ''] = path.split('/')
  if (page === 'getting-started') return { page: 'docs', id: 'getting-started', anchor }
  if (['home', 'download', 'releases', 'examples', 'docs', 'std'].includes(page)) {
    return {
      page,
      id: id || (page === 'docs' ? 'getting-started' : ''),
      anchor,
    }
  }
  return { page: path ? 'not-found' : 'home', id: '', anchor: '' }
}
