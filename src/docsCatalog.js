export const repoOwner = 'tynes0'
export const repoName = 'wio'
export const repoUrl = `https://github.com/${repoOwner}/${repoName}`
export const releaseApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
export const latestReleaseUrl = `${repoUrl}/releases/latest`
export const documentedWioVersion = '0.13.0'

export const docsCatalog = [
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
    id: 'language-spec-0-13',
    title: 'Language Specification 0.13',
    category: 'Language',
    description: 'Normative Unicode text, const-generic, attribute, extension, matching, and fixed-array rules for Wio 0.13.',
    sourcePath: 'docs/spec/WIO_LANGUAGE_SPEC_0_13.md',
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
]

export const categoryOrder = [
  'Start Here',
  'Reference',
  'Language',
  'Tooling',
  'Interop',
  'Support',
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
