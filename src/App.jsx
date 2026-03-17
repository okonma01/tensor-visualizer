import TabularSection from './components/modalities/TabularSection.jsx'
import TimeSeriesSection from './components/modalities/TimeSeriesSection.jsx'
import TextSection from './components/modalities/TextSection.jsx'
import ImageSection from './components/modalities/ImageSection.jsx'

const SECTIONS = [
  { id: 'tabular', label: 'Tabular', emoji: '📊' },
  { id: 'timeseries', label: 'Time Series', emoji: '📈' },
  { id: 'text', label: 'Text', emoji: '💬' },
  { id: 'image', label: 'Image', emoji: '🖼️' },
]

function App() {
  return (
    <div className="page-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        <header className="surface-lg hero-card mb-8 sm:mb-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="eyebrow mb-3">A gentle tour of deep-learning inputs</p>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.05em] text-slate-900 leading-none text-balance">
                Everything is a Tensor
              </h1>
              <p className="mt-4 max-w-2xl text-base sm:text-lg leading-8 text-slate-600">
                Models do not see words, tables, or pictures. They see arrays of numbers with shapes. This page keeps that idea stripped to the essentials.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="hero-chip">4 data types</span>
                <span className="hero-chip">1 structural pattern</span>
              </div>
            </div>

            <div className="soft-panel hero-panel">
              <p className="eyebrow mb-3">On this page</p>
              <div className="flex flex-wrap gap-2">
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="pill-link"
                  >
                    <span aria-hidden="true">{section.emoji}</span>
                    {section.label}
                  </a>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Each section shows the same pattern from a different angle: source data, tensor layout, and the underlying PyTorch implementation.
              </p>
            </div>
          </div>
        </header>

        <main className="space-y-8 sm:space-y-10">
          <TabularSection />
          <TimeSeriesSection />
          <TextSection />
          <ImageSection />
        </main>

        <footer className="py-10 text-center text-sm text-slate-500 tracking-[0.02em]">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span>
              Created by <a href="https://okonma01.github.io" className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">okonma01</a>.
            </span>
            <a
              href="https://github.com/okonma01/tensor-visualizer"
              className="inline-flex items-center gap-1.5 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="okonma01 on GitHub"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 4.84c.68 0 1.37.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
