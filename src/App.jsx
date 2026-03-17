import { useState } from 'react'
import TabNav from './components/ui/TabNav.jsx'
import TabularSection from './components/modalities/TabularSection.jsx'
import TimeSeriesSection from './components/modalities/TimeSeriesSection.jsx'
import TextSection from './components/modalities/TextSection.jsx'
import ImageSection from './components/modalities/ImageSection.jsx'
import VideoSection from './components/modalities/VideoSection.jsx'
import AudioSection from './components/modalities/AudioSection.jsx'

const TABS = [
  { id: 'tabular',     label: 'Tabular',     emoji: '📊' },
  { id: 'timeseries',  label: 'Time Series',  emoji: '📈' },
  { id: 'text',        label: 'Text',         emoji: '💬' },
  { id: 'image',       label: 'Image',        emoji: '🖼️' },
  { id: 'video',       label: 'Video',        emoji: '🎞️' },
  { id: 'audio',       label: 'Audio',        emoji: '🎵' },
]

function App() {
  const [activeTab, setActiveTab] = useState('tabular')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none">
              Everything is a Tensor
            </h1>
            <span className="text-sm font-medium text-indigo-500 pb-0.5">
              a PyTorch data representation visualizer
            </span>
          </div>
          <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'tabular'    && <TabularSection />}
        {activeTab === 'timeseries' && <TimeSeriesSection />}
        {activeTab === 'text'       && <TextSection />}
        {activeTab === 'image'      && <ImageSection />}
        {activeTab === 'video'      && <VideoSection />}
        {activeTab === 'audio'      && <AudioSection />}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200">
        Built to show that <span className="font-semibold text-indigo-400">everything is a tensor</span> — inspired by StatQuest's spirit of making hard things simple.
      </footer>
    </div>
  )
}

export default App
