/**
 * TensorGrid — reusable 2D heatmap grid.
 * data: number[][] (rows × cols)
 * onHover: (row, col, value) => void | null
 * highlightCell: [row, col] | null
 * colorScale: 'blue' | 'green' | 'purple' | 'heat' | 'token' (uses tokenColor)
 * tokenColors: string[] (one per row, for text embeddings)
 * maxAbsVal: override the auto-computed max (for consistent coloring across channels)
 * showIndices: show row/col index headers
 * dimLabels: { rows: string, cols: string } — axis label names
 * ellipsis: if true and rows > 6, only show first 3 + last 2
 */
import { useMemo } from 'react'

const SCALES = {
  blue:   (t) => `rgba(${Math.round(59 + t * 130)}, ${Math.round(130 + t * 70)}, ${Math.round(246 - t * 60)}, ${0.15 + t * 0.75})`,
  green:  (t) => `rgba(${Math.round(20 + t * 40)}, ${Math.round(184 - t * 50)}, ${Math.round(166 - t * 120)}, ${0.15 + t * 0.75})`,
  purple: (t) => `rgba(${Math.round(139 + t * 80)}, ${Math.round(92  - t * 40)}, ${Math.round(246 - t * 60)}, ${0.15 + t * 0.75})`,
  heat:   (t) => `rgba(${Math.round(248 - t * 30)}, ${Math.round(113 + t * 40)}, ${Math.round(113 - t * 80)}, ${0.15 + t * 0.75})`,
}

function cellColor(value, maxAbsVal, scale, tokenColor) {
  if (scale === 'token' && tokenColor) {
    return tokenColor
  }
  if (maxAbsVal === 0) return 'rgba(148,163,184,0.15)'
  const t = Math.min(1, Math.abs(value) / maxAbsVal)
  const fn = SCALES[scale] || SCALES.blue
  return fn(t)
}

function textColor(value, maxAbsVal) {
  if (maxAbsVal === 0) return '#64748b'
  const t = Math.min(1, Math.abs(value) / maxAbsVal)
  return t > 0.55 ? '#1e293b' : '#475569'
}

export default function TensorGrid({
  data,
  onHover = null,
  highlightCell = null,
  colorScale = 'blue',
  tokenColors = null,
  maxAbsVal: maxOverride = null,
  showIndices = false,
  dimLabels = null,
  ellipsis = false,
  cellSize = 'md',
}) {
  const maxAbsVal = useMemo(() => {
    if (maxOverride !== null) return maxOverride
    let max = 0
    for (const row of data) for (const v of row) if (Math.abs(v) > max) max = Math.abs(v)
    return max
  }, [data, maxOverride])

  if (!data || data.length === 0) return null

  // Determine which rows to show
  let displayRows = data.map((row, i) => ({ row, originalIndex: i }))
  let hasEllipsis = false
  if (ellipsis && data.length > 7) {
    displayRows = [
      ...data.slice(0, 3).map((row, i) => ({ row, originalIndex: i })),
      null, // ellipsis marker
      ...data.slice(-2).map((row, i) => ({ row, originalIndex: data.length - 2 + i })),
    ]
    hasEllipsis = true
  }

  const sizeClasses = {
    sm: 'min-w-[2rem] min-h-[1.6rem] text-[10px] px-1',
    md: 'min-w-[2.6rem] min-h-[2rem] text-xs px-1.5',
    lg: 'min-w-[3.2rem] min-h-[2.4rem] text-xs px-2',
  }[cellSize] || 'min-w-[2.6rem] min-h-[2rem] text-xs px-1.5'

  const colCount = data[0]?.length || 0
  const ellipsisCol = colCount > 8

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0.5 text-center font-mono">
        {showIndices && (
          <thead>
            <tr>
              {dimLabels && <th className="text-[10px] text-slate-400 font-normal pr-1 pb-1">{dimLabels.rows} ↓</th>}
              {Array.from({ length: Math.min(colCount, 8) }, (_, ci) => (
                <th key={ci} className="text-[10px] text-slate-400 font-normal pb-1 min-w-[2.6rem]">
                  {dimLabels?.cols ?? ''}[{ci}]
                </th>
              ))}
              {ellipsisCol && <th className="text-[10px] text-slate-400 font-normal pb-1">…</th>}
            </tr>
          </thead>
        )}
        <tbody>
          {displayRows.map((item, di) => {
            if (item === null) {
              return (
                <tr key="ellipsis-row">
                  <td colSpan={Math.min(colCount, 8) + (ellipsisCol ? 1 : 0) + (showIndices && dimLabels ? 1 : 0)}
                      className="text-slate-400 text-sm text-center py-1">…</td>
                </tr>
              )
            }
            const { row, originalIndex: ri } = item
            const rowCells = ellipsisCol ? row.slice(0, 8) : row
            const tColor = tokenColors ? tokenColors[ri] : null
            return (
              <tr key={ri}>
                {showIndices && dimLabels && (
                  <td className="text-[10px] text-slate-400 font-normal pr-1">[{ri}]</td>
                )}
                {rowCells.map((v, ci) => {
                  const isHL = highlightCell && highlightCell[0] === ri && highlightCell[1] === ci
                  const bg = cellColor(v, maxAbsVal, colorScale, tColor ? `${tColor}40` : null)
                  const fg = tokenColors ? tColor : textColor(v, maxAbsVal)
                  return (
                    <td
                      key={ci}
                      className={`tensor-cell font-mono rounded transition-all duration-100 cursor-default select-none
                        ${sizeClasses}
                        ${isHL ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110 z-10 relative shadow-md' : ''}
                      `}
                      style={{ background: bg, color: fg, fontWeight: isHL ? 700 : 400 }}
                      onMouseEnter={() => onHover && onHover(ri, ci, v)}
                      onMouseLeave={() => onHover && onHover(null, null, null)}
                      title={`[${ri}][${ci}] = ${v}`}
                    >
                      {typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v}
                    </td>
                  )
                })}
                {ellipsisCol && (
                  <td className="text-slate-400 text-xs px-1">…</td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
