import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const manifestPath = resolve(root, 'config/candidates.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

if (manifest.submissionLimit !== 1) {
  throw new Error('submissionLimit must remain 1')
}

if (!Array.isArray(manifest.candidates) || manifest.candidates.length !== 3) {
  throw new Error('exactly three candidates are required')
}

const ids = new Set()
for (const candidate of manifest.candidates) {
  if (!/^[a-z][a-z0-9-]+$/.test(candidate.id)) {
    throw new Error(`invalid candidate id: ${candidate.id}`)
  }
  if (ids.has(candidate.id)) {
    throw new Error(`duplicate candidate id: ${candidate.id}`)
  }
  ids.add(candidate.id)

  if (candidate.dimensions.join(',') !== 'webmcpLeverage,execution,impact,creativity') {
    throw new Error(`candidate ${candidate.id} must use the official four judging dimensions`)
  }

  const briefPath = resolve(root, candidate.brief)
  await access(briefPath)
  const brief = await readFile(briefPath, 'utf8')
  for (const heading of ['## Human-agent loop', '## WebMCP tools', '## Three-minute proof', '## Safety boundary']) {
    if (!brief.includes(heading)) {
      throw new Error(`${candidate.brief} is missing ${heading}`)
    }
  }
}

console.log(`ATELIER_CHECK_OK candidates=${manifest.candidates.length} submission_limit=${manifest.submissionLimit}`)
