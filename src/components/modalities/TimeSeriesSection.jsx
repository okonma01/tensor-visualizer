import { useState } from 'react'
import TensorGrid from '../ui/TensorGrid.jsx'
import CodePanel from '../ui/CodePanel.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { OHLC_DATA, OHLC_LABELS, DATES } from '../../data/stockData.js'
import { timeSeriesCode } from '../../utils/tensorUtils.js'

const WINDOW_SIZE = 8

export default function TimeSeriesSection() {
  const [hovered, setHovered] = useState(null)

  const windowData = OHLC_DATA.slice(0, WINDOW_SIZE)
  const windowDates = DATES.slice(0, WINDOW_SIZE)

  const code = timeSeriesCode(windowData)

  const closes = windowData.map((row) => row[3])
  const minVal = Math.min(...windowData.flat())
  const maxVal = Math.max(...windowData.flat())
  const closeMin = Math.min(...closes)
  const closeMax = Math.max(...closes)

  return (
    <section id="timeseries" className="surface">
      <SectionHeader
        emoji="📈"
        title="Time Series Data"
        subtitle="Time gives the rows their meaning. Each row is one moment. Each column is one measurement collected at that moment."
        shape={`[${WINDOW_SIZE}, 4]`}
      />

      <div className="note-card mb-6 text-sm leading-6">
        A stock-price window is a clean tensor example: 8 days, 4 values per day, so the shape is <code className="font-mono">[8, 4]</code>.
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-4">
          <div className="soft-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">8-day price window</h3>
                <p className="text-sm text-slate-500">Each day contributes Open, High, Low, Close.</p>
              </div>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent-3)]">[8, 4]</code>
            </div>

            <svg width="100%" height="90" viewBox={`0 0 ${WINDOW_SIZE * 36} 90`} preserveAspectRatio="none">
              {closes.map((close, index) => {
                if (index === 0) return null
                const previous = closes[index - 1]
                const x1 = (index - 1) * 36 + 18
                const x2 = index * 36 + 18
                const y1 = 74 - ((previous - closeMin) / (closeMax - closeMin || 1)) * 56
                const y2 = 74 - ((close - closeMin) / (closeMax - closeMin || 1)) * 56
                return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5f83f2" strokeWidth="3" strokeLinecap="round" />
              })}
              {closes.map((close, index) => {
                const x = index * 36 + 18
                const y = 74 - ((close - closeMin) / (closeMax - closeMin || 1)) * 56
                return <circle key={index} cx={x} cy={y} r={hovered?.[0] === index ? 5 : 4} fill={hovered?.[0] === index ? '#ef7a53' : '#5f83f2'} />
              })}
            </svg>
            <p className="mt-2 text-xs text-slate-500">The line helps you see the trend, but the model still receives rows of numbers.</p>
          </div>

          <div className="soft-panel overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[color:var(--line)] text-slate-500">
                  <th className="text-left px-3 py-2">Date</th>
                  {OHLC_LABELS.map((l) => (
                    <th key={l} className="px-3 py-2">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {windowData.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`cursor-pointer ${hovered?.[0] === ri ? 'bg-white' : ''}`}
                    onMouseEnter={() => setHovered([ri, null])}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <td className="px-3 py-1.5 text-slate-400 text-[11px]">{windowDates[ri]}</td>
                    {row.map((v, ci) => (
                      <td key={ci} className={`px-3 py-1.5 text-center transition-colors ${hovered?.[0] === ri && hovered?.[1] === ci ? 'font-bold text-[color:var(--accent-2)]' : 'text-slate-700'}`}
                        onMouseEnter={() => setHovered([ri, ci])}
                      >
                        {v.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="soft-panel overflow-x-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Sequence tensor</h3>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent-3)]">[{WINDOW_SIZE}, 4]</code>
            </div>
            <p className="mb-4 text-sm text-slate-500">Each day stays on its own row, and the four measurements for that day run left to right.</p>
            <TensorGrid
              data={windowData}
              onHover={(ri, ci) => setHovered(ri !== null ? [ri, ci] : null)}
              highlightCell={hovered}
              colorScale="green"
              showIndices
              dimLabels={{ rows: 'day', cols: 'feat' }}
              maxAbsVal={maxVal}
              cellSize="sm"
            />
          </div>

          <div className="note-card text-sm leading-6">
            Sequence models often add one more dimension for batching. One price window has shape <code className="font-mono">[8, 4]</code>. A batch of 32 windows would be <code className="font-mono">[32, 8, 4]</code>.
          </div>
        </div>
      </div>

      <CodePanel code={code} />
    </section>
  )
}
