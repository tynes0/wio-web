const groups = [
  ['Core & language', 'result option traits meta attribute reflect resource'],
  [
    'Text & formats',
    'strings chars unicode convert builders encoding json csv config serialization localization mime regex',
  ],
  [
    'Collections & memory',
    'collections algorithms sort iterator range vector span tuple queue sets buffer heap binary',
  ],
  ['Math & utilities', 'math numeric bigint geometry hash random statistics semver uuid'],
  [
    'System & I/O',
    'console io fs path os environment platform process stream compression log assert benchmark',
  ],
  ['Time & concurrency', 'time async concurrency event net'],
]
export const stdModules = groups.flatMap(([category, names]) =>
  names.split(' ').map((name) => ({ name, category })),
)

export function declarationIndex(source) {
  const lines = source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .split('\n')
  const result = []
  const owners = []
  const scopes = []
  let pending = null
  for (const line of lines) {
    owners.push(scopes.filter(Boolean).join('::'))
    const lexical = line.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*$/g, '')
    const named = lexical.match(
      /\b(realm|object|component|interface|extension|application|system)\s+(\w+)/,
    )
    if (named) pending = named[2]
    for (const character of lexical) {
      if (character === '{') {
        scopes.push(pending)
        pending = null
      }
      if (character === '}') scopes.pop()
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\/\/.*$/, '').trim()
    if (!/\bfn\s+(?:\w+|operator)/.test(line)) continue
    const start = i
    let signature = line
    while (!/[;{]/.test(signature) && i + 1 < lines.length) signature += ` ${lines[++i].trim()}`
    signature = signature.split('{')[0].replace(/;.*$/, '').trim()
    result.push({ line: start + 1, signature, owner: owners[start] })
  }
  return result
}
