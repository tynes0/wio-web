export const repoOwner = 'tynes0'
export const repoName = 'wio'
export const repoUrl = `https://github.com/${repoOwner}/${repoName}`
export const releaseApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
export const releasesApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases?per_page=100`
export const latestReleaseUrl = `${repoUrl}/releases/latest`
export const documentedWioVersion = '0.17.0'

export const docsCatalog = [
  {
    id: 'documentation-map',
    title: 'Documentation Map',
    category: 'Start Here',
    description: 'The complete documentation map and recommended reading order.',
    sourcePath: 'docs/README.md',
  },
  {
    id: 'overview',
    title: 'Overview',
    category: 'Start Here',
    description: 'High-level orientation, repo workflows, and core commands.',
    sourcePath: 'README.md',
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Start Here',
    description: 'Install Wio, build it, and run your first commands.',
    sourcePath: 'docs/WIO_GETTING_STARTED.md',
  },
  {
    id: 'cli-reference',
    title: 'CLI Reference',
    category: 'Reference',
    description: 'Command-by-command reference for build, file, project, bind, env, package, and perf.',
    sourcePath: 'docs/WIO_CLI_REFERENCE.md',
  },
  {
    id: 'language',
    title: 'Language Draft',
    category: 'Language',
    description: 'The current language surface, semantics, and examples.',
    sourcePath: 'docs/WIO_LANGUAGE_DRAFT.md',
  },
  {
    id: 'language-spec-0-17',
    title: 'Language Specification 0.17',
    category: 'Language',
    description: 'Normative ordinary application/system members, lifecycle attributes, stage metadata, and ABI v11 rules.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_17.md',
  },
  {
    id: 'application-model-0-17',
    title: 'Wio 0.17 Application Model',
    category: 'Language',
    description: 'How to build and migrate applications with ordinary functions plus Start, Update, Close, Fixed, After, and Main attributes.',
    sourcePath: 'docs/WIO_0_17_APPLICATION_MODEL.md',
  },
  {
    id: 'language-spec-0-16',
    title: 'Language Specification 0.16',
    category: 'Historical Specs',
    description: 'Normative application scheduling, cancellation, native ownership, and host-boundary rules for Wio 0.16.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_16.md',
  },
  {
    id: 'language-spec-0-15',
    title: 'Language Specification 0.15',
    category: 'Historical Specs',
    description: 'Canonical bracket attributes and the compile-time attribute processing model introduced in Wio 0.15.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_15.md',
  },
  {
    id: 'language-spec-0-13',
    title: 'Language Specification 0.13',
    category: 'Language',
    description: 'Normative Unicode text, const-generic, attribute, extension, matching, and fixed-array rules for Wio 0.13.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_13.md',
  },
  {
    id: 'language-spec-v1',
    title: 'V1 Coherence Candidate',
    category: 'Language',
    description: 'Candidate normative coherence rules for the Wio v1 language model.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_V1_COHERENCE.md',
  },
  {
    id: 'language-spec-0-11',
    title: 'Language Specification 0.11',
    category: 'Historical Specs',
    description: 'Language and standard-library foundation rules introduced in Wio 0.11.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_11.md',
  },
  {
    id: 'language-spec-0-10',
    title: 'Language Specification 0.10',
    category: 'Historical Specs',
    description: 'Const generics and native component rules introduced in Wio 0.10.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_10.md',
  },
  {
    id: 'language-spec-0-9',
    title: 'Language Specification 0.9',
    category: 'Historical Specs',
    description: 'Generic types, constraints, and specialization rules from Wio 0.9.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_9.md',
  },
  {
    id: 'language-spec-0-8',
    title: 'Language Specification 0.8',
    category: 'Historical Specs',
    description: 'Nullability, references, views, and lifetime foundations from Wio 0.8.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_8.md',
  },
  {
    id: 'std-spec-0-11',
    title: 'Standard Library Contract 0.11',
    category: 'Historical Specs',
    description: 'The versioned standard-library contract established for Wio 0.11.',
    sourcePath: 'docs/spec/WIO_STD_SPEC_0_11.md',
  },
  {
    id: 'async-model',
    title: 'Async & Coroutine Model',
    category: 'Language',
    description: 'Tasks, coroutines, await, scheduling, cancellation, and structured concurrency.',
    sourcePath: 'docs/WIO_ASYNC_MODEL.md',
  },
  {
    id: 'async-evolution',
    title: 'Async Evolution Plan',
    category: 'Evolution',
    description: 'The roadmap for a powerful but simple async and multithreading model.',
    sourcePath: 'docs/WIO_ASYNC_EVOLUTION_PLAN.md',
  },
  {
    id: 'attribute-system',
    title: 'Attribute System Plan',
    category: 'Evolution',
    description: 'Typed user attributes, validation, checked derives, behavior, and reflection.',
    sourcePath: 'docs/WIO_ATTRIBUTE_SYSTEM_PLAN.md',
  },
  {
    id: 'language-evolution',
    title: 'Language Evolution Plan',
    category: 'Evolution',
    description: 'Open language design work and the path from current semantics to v1.',
    sourcePath: 'docs/WIO_LANGUAGE_EVOLUTION_PLAN.md',
  },
  {
    id: 'reference-lifetimes',
    title: 'Reference & View Lifetimes',
    category: 'Language',
    description: 'Ownership, ref/view behavior, escape rules, and lifetime diagnostics.',
    sourcePath: 'docs/REFERENCE_LIFETIMES.md',
  },
  {
    id: 'std',
    title: 'Standard Library',
    category: 'Language',
    description: 'Stable, caveated, and experimental std modules.',
    sourcePath: 'docs/WIO_STD.md',
  },
  {
    id: 'project-system',
    title: 'Project System',
    category: 'Tooling',
    description: 'How makewio, project commands, packaging, and generated artifact policy fit together.',
    sourcePath: 'docs/WIO_PROJECT_SYSTEM.md',
  },
  {
    id: 'editor-ecosystem',
    title: 'Editor Ecosystem Plan',
    category: 'Tooling',
    description: 'Shared compiler-service and release plan for VS Code, Visual Studio, Rider, and CLion.',
    sourcePath: 'docs/WIO_EDITOR_ECOSYSTEM_PLAN.md',
  },
  {
    id: 'self-hosted-cli',
    title: 'Self-hosted CLI',
    category: 'Tooling',
    description: 'Architecture and migration notes for the Wio-written command-line interface.',
    sourcePath: 'docs/WIO_SELF_HOSTED_CLI.md',
  },
  {
    id: 'filesystem-errors',
    title: 'Filesystem Error Policy',
    category: 'Reference',
    description: 'Stable filesystem failure domains, native error mapping, and Result behavior.',
    sourcePath: 'docs/FILESYSTEM_ERROR_POLICY.md',
  },
  {
    id: 'fuzzing',
    title: 'Fuzzing Guide',
    category: 'Tooling',
    description: 'How the parser and compiler fuzz corpus is built, run, and maintained.',
    sourcePath: 'docs/FUZZING.md',
  },
  {
    id: 'interop',
    title: 'Interop Guide',
    category: 'Interop',
    description: 'Native bindings, host workflows, and exported modules.',
    sourcePath: 'docs/WIO_INTEROP_GUIDE.md',
  },
  {
    id: 'sdk',
    title: 'SDK Guide',
    category: 'Interop',
    description: 'Host-side Wio SDK concepts, exported objects, components, enums, and flagsets.',
    sourcePath: 'docs/WIO_SDK.md',
  },
  {
    id: 'sdk-parity-0-14',
    title: 'SDK 0.14 Parity Matrix',
    category: 'Interop',
    description: 'Normative support inventory for nested values, typed dynamic fields, ABI v8, and const generics.',
    sourcePath: 'docs/WIO_SDK_0_14_PARITY_MATRIX.md',
  },
  {
    id: 'sdk-evolution',
    title: 'SDK Evolution Plan',
    category: 'Evolution',
    description: 'Feature parity, ABI negotiation, and the host SDK path to v1.',
    sourcePath: 'docs/WIO_SDK_EVOLUTION_PLAN.md',
  },
  {
    id: 'sdk-parity-0-13',
    title: 'SDK 0.13 Parity Matrix',
    category: 'Historical Specs',
    description: 'Historical host-value and feature-support baseline for Wio 0.13.',
    sourcePath: 'docs/WIO_SDK_0_13_PARITY_MATRIX.md',
  },
  {
    id: 'runtime',
    title: 'Runtime Type Model',
    category: 'Interop',
    description: 'Runtime categories, ABI boundaries, and value model details.',
    sourcePath: 'docs/WIO_RUNTIME_TYPE_MODEL.md',
  },
  {
    id: 'performance',
    title: 'Performance Notes',
    category: 'Tooling',
    description: 'Current performance model, tradeoffs, and perf smoke workflows.',
    sourcePath: 'docs/WIO_PERFORMANCE.md',
  },
  {
    id: 'examples',
    title: 'Examples',
    category: 'Start Here',
    description: 'Recommended example flows and sample projects.',
    sourcePath: 'docs/WIO_EXAMPLES.md',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    category: 'Support',
    description: 'Common install, PATH, package, and build issues.',
    sourcePath: 'docs/WIO_TROUBLESHOOTING.md',
  },
  {
    id: 'faq',
    title: 'FAQ',
    category: 'Support',
    description: 'Quick answers for recurring questions about Wio.',
    sourcePath: 'docs/WIO_FAQ.md',
  },
  {
    id: 'compatibility',
    title: 'Compatibility',
    category: 'Release',
    description: 'Stability promises, compatibility policy, and change expectations.',
    sourcePath: 'docs/WIO_COMPATIBILITY.md',
  },
  {
    id: 'freeze',
    title: 'V1 Freeze Snapshot',
    category: 'Pre-v1',
    description: 'What is in scope for Wio v1 and what is intentionally excluded.',
    sourcePath: 'docs/WIO_V1_FREEZE.md',
  },
  {
    id: 'v1-release-plan',
    title: 'V1 Release Plan',
    category: 'Pre-v1',
    description: 'Release-by-release delivery plan, mandatory gates, and scope rules through Wio v1.0.0.',
    sourcePath: 'docs/WIO_V1_RELEASE_PLAN.md',
  },
  {
    id: 'post-v1-roadmap',
    title: 'Post-v1 Roadmap',
    category: 'Post-v1',
    description: 'Planned v1.x themes, v2 research, ecosystem growth, and deliberately deferred work.',
    sourcePath: 'docs/WIO_POST_V1_ROADMAP.md',
  },
  {
    id: 'traceability',
    title: 'Traceability',
    category: 'Release',
    description: 'Mapping between feature work, tests, docs, and closure state.',
    sourcePath: 'docs/WIO_TRACEABILITY.md',
  },
  {
    id: 'release-acceptance-0-16',
    title: 'Wio 0.16 Acceptance Matrix',
    category: 'Release',
    description: 'The exact Windows and Ubuntu evidence required to publish Wio 0.16.',
    sourcePath: 'docs/WIO_0_16_ACCEPTANCE.md',
  },
  {
    id: 'release-notes-0-16',
    title: 'Wio 0.16 Release Notes',
    category: 'Release',
    description: 'Deterministic applications, host-driven async, cancellation, callbacks, and native resource ownership.',
    sourcePath: 'docs/WIO_0_16_RELEASE_NOTES.md',
  },
  {
    id: 'release-notes-0-15',
    title: 'Wio 0.15 Release Notes',
    category: 'Release',
    description: 'Canonical bracket attributes and the checked compile-time processor system.',
    sourcePath: 'docs/WIO_0_15_RELEASE_NOTES.md',
  },
  {
    id: 'release-notes-0-14',
    title: 'Wio 0.14 Release Notes',
    category: 'Release',
    description: 'SDK value parity, Unicode/JSON/regex correctness, and cross-platform conformance changes.',
    sourcePath: 'docs/WIO_0_14_RELEASE_NOTES.md',
  },
  {
    id: 'release-notes-0-13',
    title: 'Wio 0.13 Release Notes',
    category: 'Release',
    description: 'Language coherence, Unicode, const generics, editor, and SDK changes in Wio 0.13.',
    sourcePath: 'docs/WIO_0_13_RELEASE_NOTES.md',
  },
]

export const categoryOrder = [
  'Start Here',
  'Reference',
  'Language',
  'Evolution',
  'Tooling',
  'Interop',
  'Support',
  'Historical Specs',
  'Pre-v1',
  'Post-v1',
  'Release',
]

export const docsByCategory = categoryOrder.map((category) => ({
  category,
  items: docsCatalog.filter((doc) => doc.category === category),
}))

export function getRawDocUrl(sourcePath) {
  return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${sourcePath}`
}

export function getBlobDocUrl(sourcePath) {
  return `${repoUrl}/blob/main/${sourcePath}`
}

function normalizeRepoPath(sourcePath, targetPath) {
  const base = sourcePath.includes('/') ? sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1) : ''
  const segments = `${base}${targetPath}`.split('/')
  const normalized = []

  for (const segment of segments) {
    if (!segment || segment === '.') continue
    if (segment === '..') normalized.pop()
    else normalized.push(segment)
  }

  return normalized.join('/')
}

export function resolveDocumentationLink(sourcePath, target) {
  const trimmed = target.trim()
  if (/^(https?:|mailto:)/i.test(trimmed)) {
    return { href: trimmed, external: true }
  }
  if (trimmed.startsWith('#')) {
    return { href: trimmed, external: false }
  }

  const [pathPart, fragment = ''] = trimmed.split('#', 2)
  const normalizedPath = normalizeRepoPath(sourcePath, pathPart)
  const internalDoc = docsCatalog.find((doc) => doc.sourcePath === normalizedPath)

  if (internalDoc) {
    return { href: `#docs/${internalDoc.id}`, external: false }
  }

  const suffix = fragment ? `#${fragment}` : ''
  return { href: `${getBlobDocUrl(normalizedPath)}${suffix}`, external: true }
}
