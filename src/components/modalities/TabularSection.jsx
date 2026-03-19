import { useState } from 'react'
import TensorGrid from '../ui/TensorGrid.jsx'
import CodePanel from '../ui/CodePanel.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { DEFAULT_ROWS, FEATURE_NAMES, LABEL_NAME, SPECIES_MAP } from '../../data/tabularData.js'
import { tabularCode } from '../../utils/tensorUtils.js'

const FEATURE_LABELS = ['bill length', 'bill depth', 'flipper length', 'body mass']

export default function TabularSection() {
  const [rows, setRows] = useState(DEFAULT_ROWS.slice(0, 4).map((row) => ({ ...row })))
  const [hovered, setHovered] = useState(null)

  const tensorData = rows.map((row) => FEATURE_NAMES.map((name) => parseFloat(row[name]) || 0))
  const labelData = rows.map((row) => row[LABEL_NAME])

  function updateCell(ri, field, val) {
    setRows((prev) => {
      const next = [...prev]
      next[ri] = { ...next[ri], [field]: val }
      return next
    })
  }

  const code = tabularCode(tensorData, labelData, FEATURE_NAMES)

  return (
    <section id="tabular" className="surface">
      <SectionHeader
        emoji="📊"
        title="Tabular Data"
        subtitle="Tabular data has a matrix structure. Each row is one sample, and each column is one numeric feature."
        shape={`[${rows.length}, ${FEATURE_NAMES.length}]`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="soft-panel min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] uppercase tracking-[0.16em] text-slate-500 font-bold">
            <span className="rounded-full bg-white px-3 py-1">Palmer penguins</span>
            <span className="rounded-full bg-white px-3 py-1">4 samples</span>
            <span className="rounded-full bg-white px-3 py-1">4 features</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)] text-slate-500">
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wide">row</th>
                  {FEATURE_NAMES.map((name) => (
                    <th key={name} className="text-left px-3 py-2 text-[11px] uppercase tracking-wide">{name}</th>
                  ))}
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wide">species</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={hovered?.[0] === rowIndex ? 'bg-white' : ''}>
                    <td className="px-3 py-2 text-xs font-mono text-slate-400">{rowIndex}</td>
                    {FEATURE_NAMES.map((name, columnIndex) => (
                      <td key={name} className="px-2 py-2">
                        <input
                          type="number"
                          step="0.1"
                          value={row[name]}
                          onChange={(event) => updateCell(rowIndex, name, event.target.value)}
                          onFocus={() => setHovered([rowIndex, columnIndex])}
                          onBlur={() => setHovered(null)}
                          className="w-20 rounded-xl border border-[color:var(--line)] bg-white px-2 py-1.5 text-center text-xs font-mono outline-none focus:border-[color:var(--accent-2)]"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-xs font-semibold text-slate-600">{SPECIES_MAP[row[LABEL_NAME]]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Change a number and the corresponding matrix entry changes with it.
          </p>
        </div>

        <div className="space-y-4 min-w-0">
          <div className="soft-panel min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Feature tensor X</h3>
                <p className="text-sm text-slate-500">Each sample stays on its own row, with feature values lined up across the page.</p>
              </div>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent-2)]">[{rows.length}, {FEATURE_NAMES.length}]</code>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {FEATURE_LABELS.map((label, ci) => (
                <div key={label} className={`rounded-full px-3 py-1 text-[11px] font-bold ${hovered?.[1] === ci ? 'bg-[#e8eeff] text-[color:var(--accent-2)]' : 'bg-white text-slate-500'}`}>
                  {label}
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <TensorGrid
                data={tensorData}
                onHover={(ri, ci) => setHovered(ri !== null ? [ri, ci] : null)}
                highlightCell={hovered}
                colorScale="blue"
                showIndices
                dimLabels={{ rows: 'sample', cols: 'feat' }}
                cellSize="sm"
              />
            </div>
          </div>

          <div className="soft-panel">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-lg font-bold text-slate-900">Label tensor y</h3>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent)]">[{rows.length}]</code>
            </div>
            <div className="flex flex-wrap gap-2">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="rounded-full bg-white px-3 py-2 text-sm text-slate-600">
                  <span className="font-mono text-[color:var(--accent)]">{row[LABEL_NAME]}</span>
                  <span className="ml-2" style={{ opacity: 0.6 }}>{SPECIES_MAP[row[LABEL_NAME]]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="note-card text-sm leading-6">
            The usual tabular shape is <code className="font-mono">[samples, features]</code>.
            <br />
            One penguin is a <code className="font-mono">1D</code> tensor of length 4, and four penguins form a <code className="font-mono">2D</code> tensor of shape <code className="font-mono">[4, 4]</code>.
          </div>
        </div>
      </div>

      <CodePanel code={code} />
    </section>
  )
}
