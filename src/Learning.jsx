import { useState } from 'react'
import { documentedWioVersion, repoUrl } from './docsCatalog.js'
import { examples, categories, project, fieldProjects } from './examples.js'
import { Arrow, Button, Code, Logo, NotFound, PageIntro } from './components.jsx'

export function Home({ release }) {
  const showcase = ['hello', 'components', 'async', 'json'].map((id) =>
    examples.find((example) => example.id === id),
  )
  const [index, setIndex] = useState(0)
  const current = showcase[index]
  return (
    <>
      <section className="hero section">
        <div className="hero-top">
          <span className="eyebrow">The Wio programming language</span>
          <a className="release-ticker" href="#releases">
            <span className="status-dot" />
            {release?.tag_name ?? `v${documentedWioVersion}`} / open development <span>→</span>
          </a>
        </div>
        <div className="hero-heading">
          <h1>
            Close to the machine.
            <br />
            <em>Open to possibility.</em>
          </h1>
          <div className="hero-side">
            <span className="orbit-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <p>
              A language for making things.
              <br />
              Native when you need it.
              <br />
              Wio all the way through.
            </p>
          </div>
        </div>
        <div className="hero-bottom">
          <p>
            Expressive code. C++ interoperability. A native backend and a bytecode VM — with one
            language at the center.
          </p>
          <div className="actions">
            <Button href="#docs/getting-started">Write your first program</Button>
            <a className="text-link" href="#examples">
              Explore the code ↓
            </a>
          </div>
        </div>
      </section>
      <section className="studio section" aria-label="Interactive code showcase">
        <div className="studio-rail">
          <span className="eyebrow">01 / In a few lines</span>
          <h2>
            Small syntax.
            <br />
            Real possibilities.
          </h2>
          <div className="studio-tabs" role="tablist" aria-label="Code examples">
            {showcase.map((example, i) => (
              <button
                role="tab"
                type="button"
                id={`showcase-tab-${i}`}
                aria-selected={i === index}
                aria-controls="showcase-code"
                tabIndex={i === index ? 0 : -1}
                key={example.id}
                onClick={() => setIndex(i)}
                onKeyDown={(event) => {
                  if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
                    event.preventDefault()
                    const next =
                      (index +
                        (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) +
                        showcase.length) %
                      showcase.length
                    setIndex(next)
                    document.getElementById(`showcase-tab-${next}`)?.focus()
                  }
                }}
              >
                <span>0{i + 1}</span>
                {['Hello, Wio.', 'Data + behavior', 'Async, naturally', 'Everyday JSON'][i]}
                <span>↗</span>
              </button>
            ))}
          </div>
          <a href={`#examples/${current.id}`} className="text-link">
            Open full recipe →
          </a>
        </div>
        <div
          className="studio-editor"
          role="tabpanel"
          id="showcase-code"
          aria-labelledby={`showcase-tab-${index}`}
        >
          <Code code={current.code} title={current.filename} />
          <div className="output">
            <span className="eyebrow">{current.output ? 'Expected output' : 'What it does'}</span>
            <pre>{current.output || current.description}</pre>
            <span className="fine">Illustrative output, not a live browser execution.</span>
          </div>
        </div>
      </section>
      <ScrollStory />
      <section className="backends section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / One language, two paths</span>
            <h2>
              Choose how it runs.
              <br />
              <em>Not how you write it.</em>
            </h2>
          </div>
          <a className="text-link" href="#docs/vm-runtime">
            Understand the backends <Arrow />
          </a>
        </div>
        <div className="backend-grid">
          <article>
            <span className="eyebrow">01 / Native · default</span>
            <h3>Go native.</h3>
            <p>
              Typed and Lowered WIR become C++. A native toolchain builds the executable or library,
              with access to Wio’s runtime and your native dependencies.
            </p>
            <code>wio project run --backend native</code>
            <a href="#docs/interop">Explore C++ integration →</a>
          </article>
          <article>
            <span className="eyebrow">02 / Bytecode · non-JIT</span>
            <h3>Keep it in the VM.</h3>
            <p>
              Wio bodies become bytecode. Standard native support can be reused; project-specific
              native bindings may still need a C++ adapter build.
            </p>
            <code>wio project run --backend vm</code>
            <a href="#docs/vm-artifacts">Explore VM artifacts →</a>
          </article>
        </div>
        <p className="fine">
          Wio is pre-1.0. Backend parity and performance work are ongoing. Read{' '}
          <a href="#docs/known-issues">known issues</a> before choosing a deployment path.
        </p>
      </section>
      <section className="learning section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">04 / Make something</span>
            <h2>
              Less theory.
              <br />
              <em>More “oh, I get it.”</em>
            </h2>
          </div>
          <a href="#examples" className="text-link">
            All {examples.length} recipes <Arrow />
          </a>
        </div>
        <div className="recipe-grid">
          {['arrays', 'parse', 'json', 'async'].map((id, index) => {
            const item = examples.find((example) => example.id === id)
            return (
              <a key={id} href={`#examples/${id}`} className="recipe-tile">
                <span className="eyebrow">
                  0{index + 1} / {item.category}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="tile-arrow">
                  <Arrow />
                </span>
              </a>
            )
          })}
        </div>
        <a href="#std" className="library-banner">
          <span className="eyebrow">Batteries, included</span>
          <h3>Meet the standard library.</h3>
          <span>
            Real source. Actual signatures. <Arrow />
          </span>
        </a>
      </section>
      <section className="release-strip section">
        <span className="eyebrow">Always moving / release journal</span>
        <h2>{release?.name || release?.tag_name || `Wio ${documentedWioVersion}`}</h2>
        <p>
          See what changed, what is supported, and what comes next. Release notes are read directly
          from the Wio repository.
        </p>
        <Button href="#releases" secondary>
          Read the latest
        </Button>
        <span className="release-glyph" aria-hidden="true">
          <Logo large />
        </span>
      </section>
    </>
  )
}

function ScrollStory() {
  const stages = [
    {
      number: '01',
      title: 'Give data a shape.',
      label: 'Components / extensions',
      text: 'Components keep value data together. Extensions add member-style behavior without turning every value into an object. Choose objects when managed identity is what you need.',
      example: 'components',
      glyph: '{ }',
    },
    {
      number: '02',
      title: 'Make failure visible.',
      label: 'Result / deliberate control',
      text: 'Success and failure belong in the same signature. Inspect a recoverable failure or unwrap deliberately. Everyday code should make that choice clear.',
      example: 'parse',
      glyph: '! ?',
    },
    {
      number: '03',
      title: 'Keep what you built.',
      label: 'Native / interoperable',
      text: 'Your C++ libraries do not have to start over. Bind functions, describe native POD components, or embed Wio in an existing application through the SDK.',
      example: 'callbacks',
      code: 'using cpp::header("math_bridge.h");\n\n[Native, CppName("Triple")]\nfn Triple(value: i32) -> i32;\n\n// Header required: int Triple(int value);\n// See the native integration guide.',
      glyph: '↔',
    },
  ]
  return (
    <section className="scroll-story section">
      <div className="story-intro">
        <span className="eyebrow">02 / The way Wio works</span>
        <h2>
          High-level
          <br />
          where it helps.
          <br />
          <em>
            Low-level
            <br />
            where it matters.
          </em>
        </h2>
        <span className="story-orbit" aria-hidden="true">
          <i />
          <i />
          <Logo large />
        </span>
        <p className="fine">Scroll to explore / three ideas behind Wio</p>
      </div>
      <div className="story-stack">
        {stages.map((stage) => (
          <article className="story-card" key={stage.number} data-collapse-card>
            <div className="story-card-top">
              <span className="eyebrow">{stage.label}</span>
              <span className="eyebrow">{stage.number} / 03</span>
            </div>
            <h3>{stage.title}</h3>
            <p>{stage.text}</p>
            <Code
              code={stage.code || examples.find((item) => item.id === stage.example).code}
              title={stage.code ? 'native binding / declaration fragment' : `${stage.example}.wio`}
            />
            {stage.code && (
              <a href="#docs/interop" className="text-link">
                Native integration guide →
              </a>
            )}
            <span className="story-card-glyph" aria-hidden="true">
              {stage.glyph}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Examples({ id }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const selected = examples.find((example) => example.id === id)
  const filtered = examples.filter(
    (example) =>
      (category === 'All' || example.category === category) &&
      `${example.title} ${example.description} ${example.code}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  if (id === 'project') return <ProjectPage />
  if (id && !selected) return <NotFound />
  if (selected)
    return (
      <div className="section recipe-page">
        <a href="#examples" className="text-link">
          ← All recipes
        </a>
        <div className="recipe-heading">
          <span className="eyebrow">
            {selected.category} / {selected.kind}
          </span>
          <h1>{selected.title}</h1>
          <p>{selected.description}</p>
        </div>
        <div className="recipe-detail">
          <div>
            <Code code={selected.code} title={selected.filename} download />
            <div className="run-instructions">
              <span className="eyebrow">Save, check, run</span>
              <Code
                language="shell"
                title="Terminal"
                code={`wio file check ${selected.filename}\nwio file run ${selected.filename}`}
              />
            </div>
          </div>
          <aside className="recipe-notes">
            <h2>Read the code.</h2>
            <p>
              {selected.note ||
                'This is a complete program, including its imports and Entry function. Save the file and run it with an installed Wio toolchain.'}
            </p>
            {selected.output && (
              <>
                <span className="eyebrow">Expected output</span>
                <pre>{selected.output}</pre>
              </>
            )}
            <a className="text-link" href={`#docs/${selected.doc}`}>
              Related reference →
            </a>
            <p className="fine">
              Written for Wio {documentedWioVersion}. The website does not execute code in your
              browser.
            </p>
          </aside>
        </div>
      </div>
    )
  return (
    <>
      <PageIntro
        label="The how-to library"
        title={
          <>
            Start with a little code.
            <br />
            <em>Build something of your own.</em>
          </>
        }
      >
        Complete programs, focused explanations, and real projects. Find a starting point and take
        it apart.
      </PageIntro>
      <section className="section example-library">
        <div className="filter-bar">
          <label className="search-label">
            Search recipes
            <input
              type="search"
              placeholder="JSON, arrays, async…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="eyebrow">
            {filtered.length} / {examples.length} recipes
          </span>
        </div>
        <div className="category-tabs" aria-label="Filter examples">
          {categories.map((item) => (
            <button
              type="button"
              aria-pressed={category === item}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="recipe-grid">
          {filtered.map((example, index) => (
            <a key={example.id} className="recipe-tile" href={`#examples/${example.id}`}>
              <span className="eyebrow">
                {String(index + 1).padStart(2, '0')} / {example.category}
              </span>
              <h2>{example.title}</h2>
              <p>{example.description}</p>
              <span className="fine">{example.kind} · .wio</span>
              <span className="tile-arrow">
                <Arrow />
              </span>
            </a>
          ))}
        </div>
        {!filtered.length && (
          <p className="empty-state">
            No recipes match. Try another category or clear your search.
          </p>
        )}
        <a href="#examples/project" className="project-callout">
          <span className="eyebrow">Go a little further</span>
          <h2>
            A real project.
            <br />
            <em>Not just a snippet.</em>
          </h2>
          <p>
            Build Pulse, a small telemetry report with a manifest, multiple modules, and JSON
            output.
          </p>
          <span className="text-link">Open the project →</span>
        </a>
        <div className="section-heading">
          <h2>Out in the repository.</h2>
          <a href="#docs/examples" className="text-link">
            Project guide <Arrow />
          </a>
        </div>
        <div className="field-projects">
          {fieldProjects.map((item) => (
            <a
              key={item.path}
              href={`${repoUrl}/tree/v${documentedWioVersion}/examples/${item.path}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="eyebrow">{item.type}</span>
              <h3>
                {item.title}
                <Arrow />
              </h3>
              <p>{item.text}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

function ProjectPage() {
  const [path, setPath] = useState(project.files[0].path)
  const file = project.files.find((item) => item.path === path)
  return (
    <>
      <PageIntro
        label="Build along / complete project"
        title={
          <>
            A little signal.
            <br />
            <em>A complete picture.</em>
          </>
        }
      >
        {project.description}
      </PageIntro>
      <section className="section">
        <a href="#examples" className="text-link">
          ← All examples
        </a>
        <div className="project-workspace">
          <aside>
            <h2>{project.name}</h2>
            <p>
              Create a folder named <code>pulse</code>, then save these files with the paths shown.
            </p>
            {project.files.map((item) => (
              <button
                className={path === item.path ? 'active' : ''}
                onClick={() => setPath(item.path)}
                key={item.path}
              >
                {item.path}
                <Arrow />
              </button>
            ))}
          </aside>
          <Code code={file.code} title={file.path} language={file.language} download />
        </div>
        <div className="backend-grid project-steps">
          <article>
            <span className="eyebrow">01 / Run from the pulse folder</span>
            <Code
              language="shell"
              title="Terminal"
              code={'wio project check\nwio project run\nwio project run --backend vm'}
            />
          </article>
          <article>
            <span className="eyebrow">02 / Understand the result</span>
            <p>
              Three readings produce a count of 3, an average of 24, and a peak of 30. The metrics
              module owns the calculation; Entry owns presentation and error handling.
            </p>
            <pre>{'{ "count": 3, "average": 24, "peak": 30 }'}</pre>
            <p className="fine">JSON whitespace, key order, and numeric formatting may vary.</p>
          </article>
        </div>
      </section>
    </>
  )
}
