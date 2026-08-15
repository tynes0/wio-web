import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { categoryOrder, docsCatalog, documentedWioVersion } from '../src/docsCatalog.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'))

const packageJson = readJson('package.json')
const packageLock = readJson('package-lock.json')
const releaseManifest = readJson('release-manifest.json')

const versions = new Map([
  ['package', packageJson.version],
  ['package lock', packageLock.version],
  ['package lock root', packageLock.packages[''].version],
  ['release manifest', releaseManifest.version],
  ['documented Wio', releaseManifest.documentedWio],
  ['catalog', documentedWioVersion],
])

for (const [name, version] of versions) {
  if (version !== packageJson.version) {
    throw new Error(`${name} version ${version} does not match ${packageJson.version}`)
  }
}

const ids = new Set()
for (const doc of docsCatalog) {
  if (ids.has(doc.id)) throw new Error(`Duplicate documentation id: ${doc.id}`)
  if (!categoryOrder.includes(doc.category)) throw new Error(`Unknown documentation category: ${doc.category}`)
  ids.add(doc.id)
}

for (const requiredId of ['language-spec-0-13', 'editor-ecosystem', 'v1-release-plan', 'post-v1-roadmap']) {
  if (!ids.has(requiredId)) throw new Error(`Required documentation entry is missing: ${requiredId}`)
}

console.log(`Validated Wio Web ${packageJson.version} and ${docsCatalog.length} documentation entries.`)
