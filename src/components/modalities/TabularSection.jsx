import { useState, useMemo } from 'react'
import TensorGrid from '../ui/TensorGrid.jsx'
import CodePanel from '../ui/CodePanel.jsx'
import BatchDimBanner from '../ui/BatchDimBanner.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { DEFAULT_ROWS, FEATURE_NAMES, LABEL_NAME, SPECIES_MAP } from '../../data/tabularData.js'
import { tabularCode } from '../../utils/tensorUtils.js'

export default function TabularSection() {
  const [rows, setRows] = useState(DEFAULT_ROWS.map((r) => ({ ...r })))
  const [hovered, setHovered] = useState(null) // [ri, ci]

  // Build a 2D float tensor from the rows (features only)
  const tensorData = useMemo(
    () => rows.map((r) => FEATURE_NAMES.map((f) => parseFloat(r[f]) || 0)),
    [rows]
  )

  const labelData = useMemo(
    () => rows.map((r) => [r[LABEL_NAME]]),
    [rows]
  )

  function updateCell(ri, field, val) {
    setRows((prev) => {
      const next = [...prev]
      next[ri] = { ...next[ri], [field]: val }
      return next
    })
  }

  const code = tabularCode(tensorData, FEATURE_NAMES)

  return (
    <div className="animate-slide-up">
      <SectionHeader
        emoji="📊"
        title="Tabular Data"
        subtitle="The foundation of classical machine learning. Rows are independent samples; columns are features. Even the simplest CSV becomes a 2D float tensor — one row per sample, one column per feature."
        shape={`[${rows.length}, ${FEATURE_NAMES.length}]`}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: interactive table */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
            🐧 Palmer Penguins — edit any cell
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                  {FEATURE_NAMES.map((f) => (
                    <th key={f} className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{f}</th>
                  ))}
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-indigo-500 uppercase tracking-wide">species (label)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`border-b border-slate-100 transition-colors ${hovered && hovered[0] === ri ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2 text-slate-400 text-xs font-mono">{ri}</td>
                    {FEATURE_NAMES.map((f, ci) => (
                      <td key={f} className="px-2 py-1">
                        <input
                          type="number"
                          step="0.1"
                          value={row[f]}
                          onChange={(e) => updateCell(ri, f, e.target.value)}
                          onFocus={() => setHovered([ri, ci])}
                          onBlur={() => setHovered(null)}
                          className={`w-24 text-xs font-mono px-2 py-1 rounded-md border transition-colors outline-none focus:ring-2 focus:ring-indigo-300
                            ${hovered && hovered[0] === ri && hovered[1] === ci
                              ? 'border-indigo-400 bg-indigo-50'
                              : 'border-slate-200 bg-white'}`}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <select
                        value={row[LABEL_NAME]}
                        onChange={(e) => updateCell(ri, LABEL_NAME, parseInt(e.target.value))}
                        className="text-xs font-medium px-2 py-1 rounded-md border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        {Object.entries(SPECIES_MAP).map(([k, v]) => (
                          <option key={k} value={k}>{v} ({k})</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">✏️ Edit any cell — the tensor updates live on the right.</p>
        </div>

        {/* Right: tensor view */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
            Tensor — X (features) · shape <code className="font-mono text-indigo-600">[{rows.length}, {FEATURE_NAMES.length}]</code>
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
            <div className="flex gap-1 mb-2">
              {FEATURE_NAMES.map((f, ci) => (
                <div key={f} className={`text-[10px] text-center font-mono text-slate-400 transition-colors
                  ${hovered && hovered[1] === ci ? 'text-indigo-500 font-bold' : ''}
                  `} style={{ minWidth: '2.6rem' }}>
                  {f.replace('_', '\n')}
                </div>
              ))}
            </div>
            <TensorGrid
              data={tensorData}
              onHover={(ri, ci) => setHovered(ri !== null ? [ri, ci] : null)}
              highlightCell={hovered}
              colorScale="blue"
              showIndices
              dimLabels={{ rows: 'sample', cols: 'feat' }}
            />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Label tensor — y · shape <code className="font-mono text-indigo-600">[{rows.length}, 1]</code>
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
              <TensorGrid
                data={labelData}
                colorScale="purple"
              />
            </div>
          </div>

          <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 border border-slate-100">
            <strong className="text-slate-700">How it works:</strong> Each penguin is a row. Each measurement is a column (a feature dimension). Together they form a 2D tensor of shape{' '}
            <code className="font-mono text-indigo-600">[N_samples, N_features]</code> — the universal PyTorch input format for tabular data.
          </div>
        </div>
      </div>

      <BatchDimBanner
        singleShape={`[${FEATURE_NAMES.length}]`}
        batchShape={`[${rows.length}, ${FEATURE_NAMES.length}]`}
        description="A single penguin (one sample) is a 1D tensor of 4 features. Stack N penguins and you get a 2D tensor — that's your batch."
      />

      <CodePanel code={code} />
    </div>
  )
}
