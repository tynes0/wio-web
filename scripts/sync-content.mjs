import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { docsCatalog, documentedWioVersion } from '../src/docsCatalog.js'

const root = fileURLToPath(new URL('../public/content/', import.meta.url))
const queue = [...new Set(docsCatalog.map((doc) => doc.sourcePath))]
let count = 0
async function save(url, destination) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new Error(`${response.status}: ${url}`)
      const content = await response.text()
      await mkdir(path.dirname(destination), { recursive: true })
      await writeFile(destination, content)
      return
    } catch (error) {
      if (attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
}
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const source = queue.shift()
      await save(
        `https://raw.githubusercontent.com/tynes0/wio/v${documentedWioVersion}/${source}`,
        path.join(root, source),
      )
      count++
    }
  }),
)
await save(
  'https://api.github.com/repos/tynes0/wio/releases?per_page=100',
  path.join(root, 'releases.json'),
)
const stdResponse = await fetch(
  `https://api.github.com/repos/tynes0/wio/contents/std?ref=v${documentedWioVersion}`,
)
if (!stdResponse.ok) throw new Error(`Cannot read release std inventory: ${stdResponse.status}`)
const stdFiles = (await stdResponse.json()).filter(
  (file) => file.type === 'file' && file.name.endsWith('.wio'),
)
const stdQueue = [...stdFiles]
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (stdQueue.length) {
      const file = stdQueue.shift()
      await save(file.download_url, path.join(root, 'std', file.name))
    }
  }),
)
await writeFile(
  path.join(root, 'std.json'),
  JSON.stringify(stdFiles.map((file) => file.name.replace(/\.wio$/, ''))),
)
console.log(`Bundled ${count} version-pinned documents and a release fallback snapshot.`)
console.log(`Bundled ${stdFiles.length} std source modules from v${documentedWioVersion}.`)
