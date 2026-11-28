import { mkdir, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { examples, project } from '../src/examples.js'

const executable = process.env.WIO_EXECUTABLE || 'wio'
const root = path.resolve('.example-validation')
await mkdir(root, { recursive: true })
let failed = 0
const only = process.argv
  .find((value) => value.startsWith('--only='))
  ?.slice(7)
  .split(',')
const selected = only ? examples.filter((example) => only.includes(example.id)) : examples
if (!selected.length) throw new Error('No selected examples')
for (const example of selected) {
  const file = path.join(root, example.filename)
  await writeFile(file, example.code)
  const result = spawnSync(executable, ['file', 'check', file], {
    encoding: 'utf8',
    timeout: 120000,
  })
  if (result.status !== 0) {
    console.error(`FAIL ${example.id}\n${result.stdout}\n${result.stderr}\n${result.error ?? ''}`)
    failed++
  } else console.log(`PASS ${example.id}`)
  if (result.status === 0 && process.argv.includes('--run-examples')) {
    const run = spawnSync(executable, ['file', 'run', file], {
      encoding: 'utf8',
      timeout: 180000,
      cwd: root,
    })
    const output = run.stdout?.replaceAll('\r', '') ?? ''
    if (run.status !== 0 || (example.output && !output.includes(example.output))) {
      console.error(`FAIL RUN ${example.id}\n${run.stdout}\n${run.stderr}`)
      failed++
    } else console.log(`PASS RUN ${example.id}`)
  }
}
const projectRoot = path.join(root, 'pulse')
for (const file of project.files) {
  const destination = path.join(projectRoot, file.path)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, file.code)
}
for (const args of [
  ['project', 'check', '--project', projectRoot],
  ...(process.argv.includes('--run')
    ? [
        ['project', 'run', '--project', projectRoot, '--backend', 'native'],
        ['project', 'run', '--project', projectRoot, '--backend', 'vm'],
      ]
    : []),
]) {
  const result = spawnSync(executable, args, {
    encoding: 'utf8',
    timeout: 300000,
  })
  if (result.status !== 0) {
    console.error(`FAIL ${args.join(' ')}\n${result.stdout}\n${result.stderr}`)
    failed++
  } else console.log(`PASS ${args.slice(0, 2).join(' ')} ${args.at(-1)}\n${result.stdout}`)
}
console.log(`${selected.length} examples and Pulse project checked; ${failed} failures.`)
process.exitCode = failed ? 1 : 0
