import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  docsByCategory,
  getBlobDocUrl,
  getRawDocUrl,
  latestReleaseUrl,
  releaseApiUrl,
  resolveDocumentationLink,
} from './docsCatalog'
import { renderMarkdown } from './markdown'

const defaultDocId = 'getting-started'

const quickCommands = [
  'wio env setup --wio-root <package-root> --set-user --add-path',
  'wio file run .\\playground\\main.wio',
  'wio project new MyGame --output-dir C:\\Projects --template wio-app',
  'wio project build --project C:\\Projects\\MyGame',
  'wio project run --project C:\\Projects\\MyGame',
]

const featureCards = [
  {
    label: '01 · Language',
    title: 'Learn one coherent model',
    text: 'Objects, stack components, extensions, generics, async work, reflection, and native boundaries are taught as parts of the same language.',
  },
  {
    label: '02 · Tooling',
    title: 'Go from file to project',
    text: 'Start with one source file, then grow into projects, tests, packages, bindings, and environment diagnostics without changing tools.',
  },
  {
    label: '03 · Native',
    title: 'Cross the boundary deliberately',
    text: 'Follow practical C++ interop and SDK guides that explain ownership, ABI types, exported modules, and host integration together.',
  },
]

const learningTracks = [
  { number: '01', title: 'First program', text: 'Install Wio and run a single source file.', href: '#getting-started' },
  { number: '02', title: 'Language basics', text: 'Types, control flow, objects, and components.', href: navHref('docs', 'language') },
  { number: '03', title: 'Build a project', text: 'Manifests, native sources, tests, and packages.', href: navHref('docs', 'project-system') },
  { number: '04', title: 'Native interop', text: 'Bind C++ and expose Wio modules to a host.', href: navHref('docs', 'interop') },
]

const homeCode = `use std::console as console;

fn Entry() -> i32 {
    console::PrintLine("Hello from Wio");
    return 0;
}`

const howToGuides = [
  {
    step: '01',
    category: 'Start here',
    title: 'Run your first Wio file',
    text: 'A complete executable is one file and one Entry function.',
    command: 'wio file run hello.wio',
    code: homeCode,
  },
  {
    step: '02',
    category: 'Data & methods',
    title: 'Extend a stack component',
    text: 'Keep data compact, then add view and ref behavior without turning it into a heap object.',
    command: 'wio file run counter.wio',
    code: `component Counter {
    public value: i32;
}

extension CounterOps for Counter {
    public view fn Read() -> i32 {
        return self.value;
    }

    public ref fn Add(amount: i32) -> i32 {
        self.value += amount;
        return self.value;
    }
}`,
  },
  {
    step: '03',
    category: 'Async',
    title: 'Await work without blocking the model',
    text: 'Coroutines, sleeps, tasks, and object methods use the same readable async syntax.',
    command: 'wio file run async_demo.wio',
    code: `use std::async as futures;

async fn Delayed(value: i32) -> i32 {
    await futures::Sleep(250u64);
    return value;
}

async fn Entry() -> i32 {
    let answer = await Delayed(42);
    return answer == 42 ? 0 : 1;
}`,
  },
  {
    step: '04',
    category: 'Correctness',
    title: 'Return errors as values',
    text: 'Use Result when failure carries information and Option when a value may simply be absent.',
    command: 'wio file run parse_port.wio',
    code: `use std::convert as convert;

fn ReadPort(value: string) -> std::Result<i32> {
    return convert::ParseI32(value);
}

fn Entry() -> i32 {
    let port = ReadPort("8080");
    return port.IsOk() ? 0 : 1;
}`,
  },
  {
    step: '05',
    category: 'Standard library',
    title: 'Parse and query JSON',
    text: 'Parse, inspect, merge, and write deterministic JSON through a practical value API.',
    command: 'wio file run config.wio',
    code: `use std::json as json;

fn Entry() -> i32 {
    let root = json::Parse!("{\\"port\\":8080}");
    let port = json::Pointer(root, "/port");

    if (port.IsSome()) {
        return 0;
    }
    return 1;
}`,
  },
  {
    step: '06',
    category: 'Native interop',
    title: 'Make a C++ POD feel native to Wio',
    text: 'Map the C++ layout once, then expose safe view/ref methods through an extension.',
    command: 'wio project run',
    code: `using cpp::header("math_api.h");

[Native, CppName("Vec2")]
component Vector2 {
    public x: f32;
    public y: f32;
}

extension Vector2Math for Vector2 {
    [Native, CppName("math_api::Length")]
    public view fn Length() -> f32;
}`,
  },
  {
    step: '07',
    category: 'Objects',
    title: 'Create an owned object with methods',
    text: 'Use objects for identity-bearing state that lives through references and owns behavior directly.',
    command: 'wio file run worker.wio',
    code: `object Worker {
    private base: i32;

    OnConstruct(base: i32) {
        self.base = base;
    }

    public fn Add(value: i32) -> i32 {
        return self.base + value;
    }
}

fn Entry() -> i32 {
    let worker = Worker(10);
    return worker.Add(5) == 15 ? 0 : 1;
}`,
  },
  {
    step: '08',
    category: 'Generics',
    title: 'Build a reusable generic object',
    text: 'Keep one implementation while retaining concrete types through fields, constructors, and methods.',
    command: 'wio file run generic_box.wio',
    code: `object Box<T> {
    public value: T;

    OnConstruct(value: T) {
        self.value = value;
    }

    public fn Get() -> T {
        return self.value;
    }
}

fn Entry() -> i32 {
    let answer = Box<i32>(42);
    return answer.Get() == 42 ? 0 : 1;
}`,
  },
  {
    step: '09',
    category: 'Option',
    title: 'Represent an absent value',
    text: 'Option keeps normal absence separate from rich failures and removes sentinel values from APIs.',
    command: 'wio file run option.wio',
    code: `fn First(values: i32[]) -> std::Option<i32> {
    if (values.Empty()) {
        return std::None<i32>();
    }
    return std::Some<i32>(values[0usize]);
}

fn Entry() -> i32 {
    let value = First([7, 8, 9]);
    return value.ValueOr(0) == 7 ? 0 : 1;
}`,
  },
  {
    step: '10',
    category: 'Text processing',
    title: 'Match and replace with regex',
    text: 'Regex operations return checked values so invalid patterns never become hidden runtime surprises.',
    command: 'wio file run regex.wio',
    code: `use std::regex as regex;

fn Entry() -> i32 {
    let pattern = regex::Regex("([a-z]+)-(\\d+)", true);
    let found = pattern.Find("release Wio-2026 ready");
    let masked = regex::Replace("build-2026", "\\d+", "#");

    if (found.IsError() or masked.IsError()) {
        return 1;
    }
    return found.Value().found ? 0 : 1;
}`,
  },
  {
    step: '11',
    category: 'Filesystem',
    title: 'Read and write a text file safely',
    text: 'Filesystem APIs expose structured Result errors and provide explicit convenience unwraps when desired.',
    command: 'wio file run notes.wio',
    code: `use std::fs as fs;
use std::path as path;

fn Entry() -> i32 {
    let file = path::Join(fs::CurrentPath!(), "note.txt");
    let written = fs::WriteText(file, "Hello from Wio");
    if (written.IsError()) {
        return 1;
    }

    let text = fs::ReadText(file);
    return text.IsOk() and text.Value() == "Hello from Wio" ? 0 : 1;
}`,
  },
  {
    step: '12',
    category: 'Utilities',
    title: 'Hash data and generate repeatable random values',
    text: 'FNV-1a is the default hash, SHA-256 is available, and seeded generators are deterministic.',
    command: 'wio file run utilities.wio',
    code: `use std::hash as hash;
use std::random as random;

fn Entry() -> i32 {
    let stableId = hash::Hash("hello");
    let sha = hash::Sha256("hello");
    let generator = random::Mt19937(42u64);
    let roll = generator.NextI32(1, 7);

    return stableId != 0u64 and not sha.Empty()
        and roll >= 1 and roll < 7 ? 0 : 1;
}`,
  },
]

const exampleProjectFiles = [
  {
    path: 'wio.makewio',
    code: `schemaVersion = 1
name = "FocusBoard"
template = "wio-app"

[toolchain]
buildDir = "build"
config = "Debug"

[wio]
entry = "wio/main.wio"
target = "exe"
sourceRoots = ["wio"]

[build]
buildDir = ".wio-build"
config = "Debug"

[run]
args = []
workingDirectory = "."`,
  },
  {
    path: 'wio/model.wio',
    code: `realm focus {
    component Task {
        public title: string;
        public done: bool;
    }

    extension TaskView for Task {
        public view fn Status() -> string {
            return self.done ? "[x]" : "[ ]";
        }
    }

    fn Seed() -> Task[] {
        return [
            Task("Read the language guide", true),
            Task("Build a native bridge", false),
            Task("Ship the first project", false)
        ];
    }
}`,
  },
  {
    path: 'wio/main.wio',
    code: `use model;
use std::console as console;

fn Entry() -> i32 {
    let tasks = focus::Seed();
    mut completed = 0usize;

    console::PrintLine!("Focus Board");
    console::PrintLine!("-----------");
    for (task in tasks) {
        console::PrintLine!(task.Status() + " " + task.title);
        if (task.done) { completed += 1usize; }
    }

    console::PrintLine!("-----------");
    console::PrintLine!($"Completed: \${completed}");
    return 0;
}`,
  },
]

function formatDate(value) {
  if (!value) {
    return 'Unknown date'
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 'Unknown size'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let amount = value
  let unitIndex = 0
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024
    unitIndex += 1
  }

  return `${amount.toFixed(amount >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function detectPlatform() {
  if (typeof navigator === 'undefined') {
    return 'unknown'
  }

  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('win')) {
    return 'windows'
  }
  if (userAgent.includes('mac') || userAgent.includes('darwin')) {
    return 'macos'
  }
  if (userAgent.includes('linux')) {
    return 'linux'
  }
  return 'unknown'
}

function scoreAssetForPlatform(assetName, platform) {
  const lower = assetName.toLowerCase()

  switch (platform) {
    case 'windows':
      return /windows|win(32|64)?/.test(lower)
        ? 2
        : /linux|mac|darwin|osx/.test(lower)
          ? -1
          : 0

    case 'macos':
      return /mac|darwin|osx/.test(lower)
        ? 2
        : /windows|linux/.test(lower)
          ? -1
          : 0

    case 'linux':
      return /linux/.test(lower)
        ? 2
        : /windows|mac|darwin|osx/.test(lower)
          ? -1
          : 0

    default:
      return 0
  }
}

function scoreAssetKindForPlatform(assetName, platform) {
  const lower = assetName.toLowerCase()

  if (
    /release[_-]?notes/.test(lower) ||
    /sha\d*sums/.test(lower) ||
    /checksum/.test(lower) ||
    lower.endsWith('.md') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.asc') ||
    lower.endsWith('.sig')
  ) {
    return -100
  }

  switch (platform) {
    case 'windows':
      if (/setup.*\.exe$/.test(lower)) return 100
      if (/installer.*\.exe$/.test(lower)) return 95

      if (lower.endsWith('.exe')) return 80
      if (lower.endsWith('.msi')) return 75

      if (lower.endsWith('.ps1')) return 60

      if (lower.endsWith('.zip')) return 40

      return 0

    case 'macos':
      if (lower.endsWith('.dmg')) return 100
      if (lower.endsWith('.pkg')) return 95
      if (lower.endsWith('.zip')) return 60
      return 0

    case 'linux':
      if (lower.endsWith('.appimage')) return 100
      if (lower.endsWith('.deb')) return 90
      if (lower.endsWith('.rpm')) return 85
      if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) return 60
      if (lower.endsWith('.zip')) return 40
      return 0

    default:
      return 0
  }
}

function pickRecommendedAsset(assets, platform) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return null
  }

  const ranked = [...assets].sort((left, right) => {
    const leftPlatformScore = scoreAssetForPlatform(left.name, platform)
    const rightPlatformScore = scoreAssetForPlatform(right.name, platform)

    if (leftPlatformScore !== rightPlatformScore) {
      return rightPlatformScore - leftPlatformScore
    }

    const leftKindScore = scoreAssetKindForPlatform(left.name, platform)
    const rightKindScore = scoreAssetKindForPlatform(right.name, platform)

    if (leftKindScore !== rightKindScore) {
      return rightKindScore - leftKindScore
    }

    if (left.size !== right.size) {
      return right.size - left.size
    }

    return left.name.localeCompare(right.name)
  })

  return ranked[0] ?? null
}

function readRoute() {
  if (typeof window === 'undefined') {
    return { page: 'home', docId: defaultDocId, anchor: '' }
  }

  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) {
    return { page: 'home', docId: defaultDocId, anchor: '' }
  }
  if (hash.startsWith('docs/')) {
    return { page: 'docs', docId: hash.slice('docs/'.length) || defaultDocId, anchor: '' }
  }
  if (hash === 'docs') {
    return { page: 'docs', docId: defaultDocId, anchor: '' }
  }
  if (hash === 'download' || hash === 'getting-started' || hash === 'examples' || hash === 'home') {
    return { page: hash, docId: defaultDocId, anchor: '' }
  }

  return { page: 'home', docId: defaultDocId, anchor: '' }
}

function navHref(page, docId = defaultDocId) {
  return page === 'docs' ? `#docs/${docId}` : `#${page}`
}

function useRemoteMarkdown(sourcePath) {
  const [state, setState] = useState({
    sourcePath,
    status: 'loading',
    content: '',
    error: '',
  })

  useEffect(() => {
    let cancelled = false

    fetch(getRawDocUrl(sourcePath))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${sourcePath} (${response.status})`)
        }
        return response.text()
      })
      .then((content) => {
        if (!cancelled) {
          setState({ sourcePath, status: 'ready', content, error: '' })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ sourcePath, status: 'error', content: '', error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [sourcePath])

  return state.sourcePath === sourcePath
    ? state
    : { sourcePath, status: 'loading', content: '', error: '' }
}

function TopNav({ page }) {
  return (
    <header className="topbar">
      <a className="brandmark" href="#home">
        <span className="brandmark-mark">W</span>
        <span className="brandmark-copy">
          <strong>Wio</strong>
          <small>Learn · Build · Ship</small>
        </span>
      </a>

      <nav className="topnav-links" aria-label="Primary">
        <a className={page === 'home' ? 'nav-link active' : 'nav-link'} href="#home">
          Overview
        </a>
        <a className={page === 'download' ? 'nav-link active' : 'nav-link'} href="#download">
          Download
        </a>
        <a className={page === 'getting-started' ? 'nav-link active' : 'nav-link'} href="#getting-started">
          Learn
        </a>
        <a className={page === 'examples' ? 'nav-link active' : 'nav-link'} href="#examples">
          Examples
        </a>
        <a className={page === 'docs' ? 'nav-link active' : 'nav-link'} href={navHref('docs')}>
          Reference
        </a>
      </nav>
    </header>
  )
}

function HowToCard({ guide }) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(guide.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="howto-card">
      <div className="howto-copy">
        <div className="howto-meta">
          <span>{guide.step}</span>
          <p>{guide.category}</p>
        </div>
        <h3>{guide.title}</h3>
        <p>{guide.text}</p>
        <code className="howto-command">$ {guide.command}</code>
      </div>
      <div className="mini-code-window">
        <div className="mini-code-head">
          <span>{guide.filename ?? 'example.wio'}</span>
          <button type="button" onClick={copyCode}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
        <pre><code>{guide.code}</code></pre>
      </div>
    </article>
  )
}

function ProjectExample() {
  const [selectedPath, setSelectedPath] = useState(exampleProjectFiles[0].path)
  const [copied, setCopied] = useState(false)
  const selectedFile = exampleProjectFiles.find((file) => file.path === selectedPath) ?? exampleProjectFiles[0]

  const copyFile = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="project-example">
      <div className="project-intro">
        <p className="eyebrow">Complete project</p>
        <h2>Build Focus Board.</h2>
        <p>
          A small multi-file CLI application with a real manifest, a stack component,
          an extension, shared realm code, iteration, and formatted output.
        </p>
        <div className="project-runbook">
          <span>01</span><code>wio project describe</code>
          <span>02</span><code>wio project run</code>
        </div>
        <div className="project-output">
          <p>Expected output</p>
          <pre>{`Focus Board
-----------
[x] Read the language guide
[ ] Build a native bridge
[ ] Ship the first project
-----------
Completed: 1`}</pre>
        </div>
      </div>

      <div className="project-workbench">
        <aside className="project-tree" aria-label="Example project files">
          <div className="project-tree-head">focus-board/</div>
          {exampleProjectFiles.map((file) => (
            <button
              className={file.path === selectedFile.path ? 'active' : ''}
              key={file.path}
              onClick={() => setSelectedPath(file.path)}
              type="button"
            >
              {file.path}
            </button>
          ))}
        </aside>
        <div className="project-editor">
          <div className="project-editor-head">
            <span>{selectedFile.path}</span>
            <button type="button" onClick={copyFile}>{copied ? 'Copied' : 'Copy file'}</button>
          </div>
          <pre><code>{selectedFile.code}</code></pre>
        </div>
      </div>
    </section>
  )
}

function ExamplesPage() {
  return (
    <div className="page-view examples-view">
      <section className="examples-head">
        <div>
          <p className="eyebrow">Wio cookbook</p>
          <h1>Learn one useful thing at a time.</h1>
        </div>
        <p>
          Twelve focused recipes and one complete project. Every example is deliberately
          small enough to copy, run, change, and understand in a few minutes.
        </p>
      </section>

      <section className="howto-section examples-cookbook">
        <div className="howto-heading">
          <div>
            <p className="eyebrow">Quick recipes</p>
            <h2>How do I…?</h2>
          </div>
          <p>Start with a task, copy the complete snippet, and follow its command.</p>
        </div>
        <div className="howto-grid">
          {howToGuides.map((guide) => <HowToCard guide={guide} key={guide.step} />)}
        </div>
      </section>

      <ProjectExample />

      <section className="examples-next">
        <div>
          <p className="eyebrow">Go deeper</p>
          <h2>Understand the model behind the recipe.</h2>
        </div>
        <a className="primary-button" href={navHref('docs')}>Open the full reference →</a>
      </section>
    </div>
  )
}

function ReleaseCard({ releaseState, platform, recommendedAsset }) {
  return (
    <aside className="release-card surface-card">
      <p className="eyebrow">Latest release</p>
      {releaseState.status === 'loading' && <p className="muted">Checking GitHub for the latest Wio release...</p>}
      {releaseState.status === 'error' && (
        <div className="stack gap-sm">
          <p className="muted">The latest release could not be loaded automatically.</p>
          <p className="fine-print">{releaseState.error}</p>
          <a className="text-link" href={latestReleaseUrl} target="_blank" rel="noreferrer">
            Open releases manually
          </a>
        </div>
      )}
      {releaseState.status === 'empty' && (
        <div className="stack gap-sm">
          <p className="muted">There is no published release yet.</p>
          <p className="fine-print">You can still build Wio from source and follow the getting started flow.</p>
        </div>
      )}
      {releaseState.status === 'ready' && releaseState.release && (
        <>
          <h2>{releaseState.release.name || releaseState.release.tag_name}</h2>
          <p className="fine-print">Published {formatDate(releaseState.release.published_at)}</p>
          {recommendedAsset ? (
            <div className="download-callout">
              <span className="pill">Recommended for {platform}</span>
              <a
                className="primary-button block"
                href={recommendedAsset.browser_download_url}
                target="_blank"
                rel="noreferrer"
              >
                Download {recommendedAsset.name}
              </a>
              <p className="fine-print">{formatBytes(recommendedAsset.size)}</p>
            </div>
          ) : (
            <p className="muted">A release exists, but no downloadable assets were found yet.</p>
          )}
          <ul className="asset-list">
            {(releaseState.release.assets ?? []).map((asset) => (
              <li key={asset.id}>
                <a href={asset.browser_download_url} target="_blank" rel="noreferrer">
                  <span>{asset.name}</span>
                  <span>{formatBytes(asset.size)}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="install-note">
        <p className="eyebrow">After download</p>
        <pre>
          <code>wio env setup --wio-root &lt;package-root&gt; --set-user --add-path</code>
        </pre>
        <p className="fine-print">Then open a fresh terminal and run <code>wio</code>.</p>
      </div>
    </aside>
  )
}

function HomePage({ releaseState, platform, recommendedAsset }) {
  return (
    <div className="page-view home-view">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-edition"><span>Wio learning home</span><i>v0.15 path</i></div>
          <p className="eyebrow">A native-first programming language</p>
          <h1>Code that stays<br /><span>close to you.</span></h1>
          <p className="hero-text">
            Learn the language by building: begin with Hello World, grow into typed data,
            async systems, native C++ libraries, and real desktop applications.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#getting-started">
              Start learning <span aria-hidden="true">→</span>
            </a>
            <a className="secondary-button" href={navHref('docs')}>
              Explore reference
            </a>
          </div>
          <div className="hero-proof" aria-label="Wio highlights">
            <span>Compiled to C++20</span>
            <span>Windows + Linux</span>
            <span>First-class native interop</span>
          </div>
        </div>

        <div className="hero-code-stage">
          <span className="orbit orbit-one" aria-hidden="true" />
          <span className="orbit orbit-two" aria-hidden="true" />
          <span className="spark spark-one" aria-hidden="true">✦</span>
          <span className="spark spark-two" aria-hidden="true">+</span>
          <div className="code-card">
          <div className="code-window-head">
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>hello.wio</span>
            <span className="code-status">ready</span>
          </div>
          <pre>
            <code>{homeCode}</code>
          </pre>
          <div className="terminal-line"><span>$</span> wio file run hello.wio</div>
          <div className="terminal-output">Hello from Wio</div>
          </div>
          <div className="hero-code-note"><strong>01</strong><span>Your first program<br />in five lines</span></div>
        </div>
      </section>

      <section className="learning-section">
        <div className="section-kicker">Guided path</div>
        <div className="learning-heading">
          <h2>From zero to native application.</h2>
          <p>Follow the path in order, or jump directly to the topic you need.</p>
        </div>
        <div className="learning-grid">
          {learningTracks.map((track) => (
            <a className="learning-card" href={track.href} key={track.number}>
              <span>{track.number}</span>
              <h3>{track.title}</h3>
              <p>{track.text}</p>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="feature-grid">
        {featureCards.map((card) => (
          <article className="feature-card" key={card.title}>
            <p className="eyebrow">{card.label}</p>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="release-section">
        <div className="release-intro">
          <p className="eyebrow">Ready to begin?</p>
          <h2>Install the stable toolchain.</h2>
          <p>Download the recommended package for your platform, then verify the environment with one command.</p>
          <a className="text-link" href="#download">See installation details →</a>
        </div>
        <ReleaseCard releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />
      </section>
    </div>
  )
}

function DownloadPage({ releaseState, platform, recommendedAsset }) {
  return (
    <div className="page-view download-view">
      <section className="section-head">
        <p className="eyebrow">Downloads</p>
        <h1>Pick a release and wire it into your shell.</h1>
        <p className="section-text">This page keeps the path from release asset to a working <code>wio</code> command very short.</p>
      </section>

      <section className="download-grid">
        <ReleaseCard releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />

        <div className="surface-card detail-card">
          <p className="eyebrow">Package contents</p>
          <h2>What ships in a Wio package</h2>
          <ul className="plain-list">
            <li><code>bin/wio.exe</code> or the platform-equivalent CLI binary</li>
            <li><code>std/</code> for canonical source-based standard library modules</li>
            <li><code>sdk/include</code> for host-side embedding and exported module work</li>
            <li><code>cmake/WioProject.cmake</code> for project integration</li>
            <li><code>Install-Wio.ps1</code> or <code>install-wio.sh</code> as thin wrappers over the CLI env flow</li>
          </ul>

          <p className="eyebrow section-gap">Typical setup commands</p>
          <div className="command-stack">
            <code>wio env status --wio-root &lt;package-root&gt;</code>
            <code>wio env setup --wio-root &lt;package-root&gt; --set-user --add-path</code>
            <code>wio env doctor --wio-root &lt;package-root&gt;</code>
            <code>wio env remove --wio-root &lt;package-root&gt; --set-user --remove-path</code>
          </div>
        </div>
      </section>
    </div>
  )
}

function GettingStartedPage({ guideState }) {
  const renderedGuide = guideState.status === 'ready'
    ? renderMarkdown(guideState.content, {
      resolveLink: (target) => resolveDocumentationLink(guideState.sourcePath, target),
    })
    : ''

  return (
    <div className="page-view getting-started-view">
      <section className="section-head">
        <p className="eyebrow">Getting Started</p>
        <h1>Use the final CLI shape from day one.</h1>
        <p className="section-text">These are the commands and the flow we want users to grow into, not temporary scaffolding.</p>
      </section>

      <section className="start-grid">
        <div className="surface-card command-card">
          <p className="eyebrow">First commands</p>
          <h2>Minimal first-day path</h2>
          <div className="command-stack">
            {quickCommands.map((command) => (
              <code key={command}>{command}</code>
            ))}
          </div>
        </div>

        <div className="surface-card guide-card">
          <p className="eyebrow">Guide</p>
          <h2>Practical onboarding</h2>
          {guideState.status === 'loading' && <p className="muted">Loading the getting started guide...</p>}
          {guideState.status === 'error' && (
            <div className="doc-error">
              <p>That guide could not be loaded right now.</p>
              <p className="fine-print">{guideState.error}</p>
            </div>
          )}
          {guideState.status === 'ready' && (
            <article className="markdown-body compact-markdown scroll-area" dangerouslySetInnerHTML={{ __html: renderedGuide }} />
          )}
        </div>
      </section>
    </div>
  )
}

function DocsPage({
  docsByCategoryFiltered,
  selectedDoc,
  selectedDocId,
  docSearch,
  onSearchChange,
  onDocSelect,
  docState,
}) {
  const docScrollRef = useRef(null)
  const renderedDocHtml = docState.status === 'ready'
    ? renderMarkdown(docState.content, {
      resolveLink: (target) => resolveDocumentationLink(selectedDoc.sourcePath, target),
    })
    : ''

  useEffect(() => {
    docScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [selectedDocId])

  return (
    <div className="page-view docs-view">
      <section className="docs-shell">
        <aside className="docs-sidebar surface-card">
          <div className="sidebar-head">
            <div>
              <p className="eyebrow">Documentation explorer</p>
              <h2>Browse the docs</h2>
            </div>
            <input
              type="search"
              value={docSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search docs"
              aria-label="Search docs"
            />
          </div>

          <div className="doc-groups scroll-area">
            {docsByCategoryFiltered.map((group) => (
              <section key={group.category} className="doc-group">
                <p className="group-label">{group.category}</p>
                <ul>
                  {group.items.map((doc) => {
                    const selected = doc.id === selectedDoc.id
                    return (
                      <li key={doc.id}>
                        <button
                          type="button"
                          className={selected ? 'doc-link active' : 'doc-link'}
                          onClick={() => onDocSelect(doc.id)}
                        >
                          <span>{doc.title}</span>
                          <small>{doc.description}</small>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </aside>

        <main className="doc-panel surface-card">
          <div className="doc-panel-head">
            <div>
              <p className="eyebrow">{selectedDoc.category}</p>
              <h2>{selectedDoc.title}</h2>
              <p className="muted">{selectedDoc.description}</p>
            </div>
            <div className="doc-panel-actions">
              <a href={getBlobDocUrl(selectedDoc.sourcePath)} target="_blank" rel="noreferrer">
                View source on GitHub
              </a>
              <a href={getRawDocUrl(selectedDoc.sourcePath)} target="_blank" rel="noreferrer">
                Open raw markdown
              </a>
            </div>
          </div>

          <div className="doc-panel-scroll scroll-area" ref={docScrollRef}>
            {docState.status === 'loading' && <p className="muted">Loading documentation...</p>}
            {docState.status === 'error' && (
              <div className="doc-error">
                <p>That document could not be loaded right now.</p>
                <p className="fine-print">{docState.error}</p>
              </div>
            )}
            {docState.status === 'ready' && (
              <article className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedDocHtml }} />
            )}
          </div>
        </main>
      </section>
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(readRoute)
  const [docSearch, setDocSearch] = useState('')
  const deferredSearch = useDeferredValue(docSearch)
  const [releaseState, setReleaseState] = useState({
    status: 'loading',
    release: null,
    error: '',
  })

  const flatDocs = useMemo(() => docsByCategory.flatMap((group) => group.items), [])
  const gettingStartedDoc = flatDocs.find((doc) => doc.id === 'getting-started') ?? flatDocs[0]
  const selectedDoc = flatDocs.find((doc) => doc.id === route.docId) ?? gettingStartedDoc
  const docState = useRemoteMarkdown(selectedDoc.sourcePath)
  const guideState = useRemoteMarkdown(gettingStartedDoc.sourcePath)

  const filteredGroups = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    if (!query) {
      return docsByCategory
    }

    return docsByCategory
      .map((group) => ({
        ...group,
        items: group.items.filter((doc) => {
          const haystack = `${doc.title} ${doc.description} ${doc.sourcePath}`.toLowerCase()
          return haystack.includes(query)
        }),
      }))
      .filter((group) => group.items.length > 0)
  }, [deferredSearch])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const onHashChange = () => {
      setRoute(readRoute())
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (route.anchor) {
      window.requestAnimationFrame(() => {
        document.getElementById(route.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route.page, route.anchor])

  useEffect(() => {
    let cancelled = false

    fetch(releaseApiUrl)
      .then(async (response) => {
        if (response.status === 404) {
          return null
        }
        if (!response.ok) {
          throw new Error(`GitHub release lookup failed (${response.status})`)
        }
        return response.json()
      })
      .then((release) => {
        if (!cancelled) {
          if (release === null) {
            setReleaseState({ status: 'empty', release: null, error: '' })
          } else {
            setReleaseState({ status: 'ready', release, error: '' })
          }
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setReleaseState({ status: 'error', release: null, error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const platform = detectPlatform()
  const recommendedAsset = releaseState.release
    ? pickRecommendedAsset(releaseState.release.assets ?? [], platform)
    : null

  const navigateToDoc = (docId) => {
    startTransition(() => {
      window.location.hash = navHref('docs', docId)
    })
  }

  return (
    <div className={`page-shell page-${route.page}`}>
      <TopNav page={route.page} />

      {route.page === 'home' && (
        <HomePage releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />
      )}
      {route.page === 'download' && (
        <DownloadPage releaseState={releaseState} platform={platform} recommendedAsset={recommendedAsset} />
      )}
      {route.page === 'getting-started' && <GettingStartedPage guideState={guideState} />}
      {route.page === 'examples' && <ExamplesPage />}
      {route.page === 'docs' && (
        <DocsPage
          docsByCategoryFiltered={filteredGroups}
          selectedDoc={selectedDoc}
          selectedDocId={route.docId}
          docSearch={docSearch}
          onSearchChange={setDocSearch}
          onDocSelect={navigateToDoc}
          docState={docState}
        />
      )}
    </div>
  )
}

export default App
