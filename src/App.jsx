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
                Models do not see tables, sentences, charts, or pictures. They see arrays of numbers with shapes. This page makes that idea concrete.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="hero-chip">4 data types</span>
                <span className="hero-chip">1 visual pattern</span>
                <span className="hero-chip">plain tensor views</span>
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
                The pattern stays the same all the way down: example first, tensor second, short PyTorch code last.
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
          Created by <a href="https://okonma01.github.io" className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">okonma01</a>.
        </footer>
      </div>
    </div>
  )
}

export default App
