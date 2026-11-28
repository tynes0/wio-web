function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function headingId(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
}

function inline(value, resolveLink) {
  const pattern = /(`[^`]+`|\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g
  return value
    .split(pattern)
    .map((token) => {
      if (token.startsWith('`') && token.endsWith('`'))
        return `<code>${escapeHtml(token.slice(1, -1))}</code>`
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        const resolved = resolveLink ? resolveLink(link[2]) : { href: link[2], external: true }
        // Never allow javascript:, data:, protocol-relative links, or quoted HTML.
        if (!/^(https?:\/\/|mailto:|#)/i.test(resolved.href)) return escapeHtml(link[1])
        return `<a href="${escapeHtml(resolved.href)}"${resolved.external ? ' target="_blank" rel="noreferrer noopener"' : ''}>${inline(link[1])}</a>`
      }
      if (token.startsWith('**') && token.endsWith('**'))
        return `<strong>${escapeHtml(token.slice(2, -2))}</strong>`
      if (token.startsWith('*') && token.endsWith('*'))
        return `<em>${escapeHtml(token.slice(1, -1))}</em>`
      return escapeHtml(token)
    })
    .join('')
}

function cells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'))
}

export function renderMarkdown(markdown, { resolveLink } = {}) {
  if (!markdown) return '<p>No content was attached to this document.</p>'
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const html = []
  const headings = new Map()
  let paragraph = []
  let list = null
  const flush = () => {
    if (paragraph.length) {
      html.push(`<p>${inline(paragraph.join(' '), resolveLink)}</p>`)
      paragraph = []
    }
  }
  const closeList = () => {
    if (list) {
      html.push(`</${list}>`)
      list = null
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const fence = trimmed.match(/^(`{3,}|~{3,})([\w+-]*)/)
    if (fence) {
      flush()
      closeList()
      const code = []
      while (++i < lines.length && !lines[i].trim().startsWith(fence[1])) code.push(lines[i])
      html.push(
        `<pre tabindex="0"><code${fence[2] ? ` class="language-${escapeHtml(fence[2])}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`,
      )
      continue
    }
    if (!trimmed) {
      flush()
      closeList()
      continue
    }
    const anchor = trimmed.match(/^<a\s+(?:id|name)=["']([\w-]+)["']\s*><\/a>$/)
    if (anchor) {
      flush()
      closeList()
      html.push(`<span id="${escapeHtml(anchor[1])}"></span>`)
      continue
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flush()
      closeList()
      const slug = headingId(heading[2])
      const count = headings.get(slug) ?? 0
      headings.set(slug, count + 1)
      const id = `${slug}${count ? `-${count}` : ''}`
      html.push(
        `<h${heading[1].length} id="${escapeHtml(id)}">${inline(heading[2], resolveLink)}</h${heading[1].length}>`,
      )
      continue
    }
    if (trimmed.includes('|') && /^\|?\s*:?-{3,}/.test(lines[i + 1]?.trim() ?? '')) {
      flush()
      closeList()
      const header = cells(trimmed)
      i++
      const rows = []
      while (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].trim())
        rows.push(cells(lines[++i]))
      html.push(
        `<div class="table-scroll"><table><thead><tr>${header.map((cell) => `<th>${inline(cell, resolveLink)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell, resolveLink)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
      )
      continue
    }
    const item = trimmed.match(/^(?:([-*+])|\d+\.)\s+(.+)$/)
    if (item) {
      flush()
      const type = item[1] ? 'ul' : 'ol'
      if (list !== type) {
        closeList()
        html.push(`<${type}>`)
        list = type
      }
      html.push(`<li>${inline(item[2], resolveLink)}</li>`)
      continue
    }
    if (/^([-*_])\1{2,}$/.test(trimmed)) {
      flush()
      closeList()
      html.push('<hr />')
      continue
    }
    if (trimmed.startsWith('>')) {
      flush()
      closeList()
      html.push(
        `<blockquote><p>${inline(trimmed.replace(/^>\s?/, ''), resolveLink)}</p></blockquote>`,
      )
      continue
    }
    closeList()
    paragraph.push(trimmed)
  }
  flush()
  closeList()
  return html.join('\n')
}
