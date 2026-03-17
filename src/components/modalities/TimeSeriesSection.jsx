import { useState, useMemo } from 'react'
import TensorGrid from '../ui/TensorGrid.jsx'
import CodePanel from '../ui/CodePanel.jsx'
import BatchDimBanner from '../ui/BatchDimBanner.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { OHLC_DATA, OHLC_LABELS, DATES } from '../../data/stockData.js'
import { timeSeriesCode } from '../../utils/tensorUtils.js'

const WINDOW_SIZE = 10 // show 10-day windows

export default function TimeSeriesSection() {
  const [windowStart, setWindowStart] = useState(0)
  const [hovered, setHovered] = useState(null)

  const windowData = useMemo(
    () => OHLC_DATA.slice(windowStart, windowStart + WINDOW_SIZE),
    [windowStart]
  )
  const windowDates = DATES.slice(windowStart, windowStart + WINDOW_SIZE)

  const code = timeSeriesCode(OHLC_DATA, DATES)

  const minVal = Math.min(...OHLC_DATA.flat())
  const maxVal = Math.max(...OHLC_DATA.flat())

  return (
    <div className="animate-slide-up">
      <SectionHeader
        emoji="📈"
        title="Time Series Data"
        subtitle="Sequences of values recorded over time — like stock prices, sensor readings, or heart rate. Each time step is a row; each measurement at that step is a column. This creates a 2D tensor of shape [T, features]."
        shape={`[${OHLC_DATA.length}, 4]`}
      />

      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <strong>NASDAQ Composite — OHLC</strong><br />
        <span className="text-xs">30 trading days · Each day = 4 values: <strong>O</strong>pen, <strong>H</strong>igh, <strong>L</strong>ow, <strong>C</strong>lose (index points)</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: line chart-style data table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {WINDOW_SIZE}-day window (T={WINDOW_SIZE})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWindowStart((s) => Math.max(0, s - WINDOW_SIZE))}
                disabled={windowStart === 0}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition-colors"
              >← prev</button>
              <span className="text-xs text-slate-400">{windowStart + 1}–{Math.min(windowStart + WINDOW_SIZE, OHLC_DATA.length)} of {OHLC_DATA.length}</span>
              <button
                onClick={() => setWindowStart((s) => Math.min(OHLC_DATA.length - WINDOW_SIZE, s + WINDOW_SIZE))}
                disabled={windowStart + WINDOW_SIZE >= OHLC_DATA.length}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition-colors"
              >next →</button>
            </div>
          </div>

          {/* Mini sparkline chart */}
          <div className="mb-4 bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <svg width="100%" height="80" viewBox={`0 0 ${WINDOW_SIZE * 28} 80`} preserveAspectRatio="none">
              {/* Close price line */}
              {windowData.map((d, i) => {
                if (i === 0) return null
                const prev = windowData[i - 1]
                const x1 = (i - 1) * 28 + 14
                const x2 = i * 28 + 14
                const range = maxVal - minVal
                const y1 = 70 - ((prev[3] - minVal) / range) * 60
                const y2 = 70 - ((d[3] - minVal) / range) * 60
                const up = d[3] >= prev[3]
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={up ? '#22c55e' : '#ef4444'} strokeWidth="2" />
              })}
              {/* Points */}
              {windowData.map((d, i) => {
                const x = i * 28 + 14
                const range = maxVal - minVal
                const y = 70 - ((d[3] - minVal) / range) * 60
                return <circle key={i} cx={x} cy={y} r={hovered && hovered[0] === i ? 5 : 3} fill={hovered && hovered[0] === i ? '#6366f1' : '#64748b'} />
              })}
            </svg>
            <p className="text-[10px] text-slate-400 text-center mt-1">Close price</p>
          </div>

          {/* Data table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-slate-500">Date</th>
                  {OHLC_LABELS.map((l) => (
                    <th key={l} className="px-3 py-2 text-slate-500">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {windowData.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`border-b border-slate-100 transition-colors cursor-pointer
                      ${hovered && hovered[0] === ri ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    onMouseEnter={() => setHovered([ri, null])}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <td className="px-3 py-1.5 text-slate-400 text-[11px]">{windowDates[ri]}</td>
                    {row.map((v, ci) => (
                      <td key={ci} className={`px-3 py-1.5 text-center transition-colors
                        ${hovered && hovered[0] === ri && hovered[1] === ci ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}
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

        {/* Right: tensor grid */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
            Tensor · shape <code className="font-mono text-indigo-600">[{WINDOW_SIZE}, 4]</code>
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex gap-1 mb-2 ml-10">
              {OHLC_LABELS.map((l) => (
                <div key={l} className="text-[10px] text-center font-mono text-slate-400" style={{ minWidth: '2.6rem' }}>{l}</div>
              ))}
            </div>
            <TensorGrid
              data={windowData}
              onHover={(ri, ci) => setHovered(ri !== null ? [ri, ci] : null)}
              highlightCell={hovered}
              colorScale="green"
              showIndices
              dimLabels={{ rows: 'day', cols: '' }}
              maxAbsVal={maxVal}
            />
          </div>

          <div className="mt-4 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 border border-slate-100">
            <strong className="text-slate-700">Why 2D?</strong> Time is a dimension. Each row is one time step (day). Each column is one measurement at that time step. This pattern — <code className="font-mono text-indigo-600">[T, features]</code> — is the same whether it's stocks, weather, sensor data, or ECG signals.
          </div>

          <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 border border-slate-100">
            <strong className="text-slate-700">Why not text?</strong> Text is also sequential, but it needs an <em>embedding</em> step first (see the Text tab). Time series values are already numbers — they go directly into the tensor.
          </div>
        </div>
      </div>

      <BatchDimBanner
        singleShape={`[${WINDOW_SIZE}, 4]`}
        batchShape={`[B, ${WINDOW_SIZE}, 4]`}
        description={`A single 10-day window is [${WINDOW_SIZE}, 4]. Stack B windows into a batch (e.g. for an RNN or Transformer) and you get [B, ${WINDOW_SIZE}, 4].`}
      />

      <CodePanel code={code} />
    </div>
  )
}
