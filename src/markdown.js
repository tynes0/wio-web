function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function formatInline(value) {
  let result = escapeHtml(value)

  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')

  return result
}

export function renderMarkdown(markdown) {
  if (!markdown) {
    return '<p>No documentation content was loaded.</p>'
  }

  const normalized = markdown.replace(/\r\n/g, '\n')
  const codeBlocks = []
  const placeholderPrefix = '@@WIO_CODEBLOCK_'

  const withoutCodeBlocks = normalized.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_, language = '', code = '') => {
    const index = codeBlocks.length
    codeBlocks.push({ language, code })
    return `${placeholderPrefix}${index}@@`
  })

  const lines = withoutCodeBlocks.split('\n')
  const html = []
  let paragraph = []
  let listType = null
  let listItems = []

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return
    }

    const text = paragraph.join(' ').trim()
    if (text.length > 0) {
      html.push(`<p>${formatInline(text)}</p>`)
    }
    paragraph = []
  }

  const flushList = () => {
    if (listItems.length === 0 || !listType) {
      return
    }

    const tag = listType === 'ordered' ? 'ol' : 'ul'
    html.push(`<${tag}>${listItems.map((item) => `<li>${formatInline(item)}</li>`).join('')}</${tag}>`)
    listType = null
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    const codeBlockMatch = trimmed.match(/^@@WIO_CODEBLOCK_(\d+)@@$/)
    if (codeBlockMatch) {
      flushParagraph()
      flushList()
      const { language, code } = codeBlocks[Number(codeBlockMatch[1])]
      const className = language ? ` class="language-${language}"` : ''
      html.push(`<pre><code${className}>${escapeHtml(code.trimEnd())}</code></pre>`)
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      const level = headingMatch[1].length
      html.push(`<h${level}>${formatInline(headingMatch[2].trim())}</h${level}>`)
      continue
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph()
      flushList()
      html.push('<hr />')
      continue
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/)
    if (orderedMatch) {
      flushParagraph()
      if (listType && listType !== 'ordered') {
        flushList()
      }
      listType = 'ordered'
      listItems.push(orderedMatch[1])
      continue
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/)
    if (unorderedMatch) {
      flushParagraph()
      if (listType && listType !== 'unordered') {
        flushList()
      }
      listType = 'unordered'
      listItems.push(unorderedMatch[1])
      continue
    }

    const quoteMatch = trimmed.match(/^>\s+(.+)$/)
    if (quoteMatch) {
      flushParagraph()
      flushList()
      html.push(`<blockquote><p>${formatInline(quoteMatch[1])}</p></blockquote>`)
      continue
    }

    paragraph.push(trimmed)
  }

  flushParagraph()
  flushList()

  return html.join('\n')
}
