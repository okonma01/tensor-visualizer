export default function TensorGrid({
  data,
  onHover = null,
  highlightCell = null,
  colorScale = 'blue',
  maxAbsVal: maxOverride = null,
  showIndices = false,
  dimLabels = null,
  cellSize = 'md',
}) {
  if (!data || data.length === 0) return null

  const sizeClasses = {
    sm: 'min-w-[2.1rem] min-h-[1.8rem] text-[11px] px-1',
    md: 'min-w-[2.55rem] min-h-[2.15rem] text-xs px-1.5',
    lg: 'min-w-[3rem] min-h-[2.5rem] text-sm px-2',
  }[cellSize] || 'min-w-[2.55rem] min-h-[2.15rem] text-xs px-1.5'

  const colCount = data[0]?.length || 0

  return (
    <div className="w-max min-w-full">
      <table className="border-collapse text-center font-mono">
        {showIndices && (
          <thead>
            <tr>
              {dimLabels && <th className="text-[10px] text-slate-400 font-normal pr-1 pb-1">{dimLabels.rows} ↓</th>}
              {Array.from({ length: colCount }, (_, ci) => (
                <th key={ci} className="text-[10px] text-slate-400 font-normal pb-1 min-w-[2.4rem]">
                  {dimLabels?.cols ?? ''}[{ci}]
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((row, ri) => {
            return (
              <tr key={ri}>
                {showIndices && dimLabels && (
                  <td className="text-[10px] text-slate-400 font-normal pr-1">[{ri}]</td>
                )}
                {row.map((v, ci) => {
                  const isHL = highlightCell && highlightCell[0] === ri && highlightCell[1] === ci
                  return (
                    <td
                      key={ci}
                      className={`tensor-cell cursor-default
                        ${sizeClasses}
                        ${isHL ? 'border-slate-500 bg-slate-50 font-semibold text-slate-900' : ''}
                      `}
                      onMouseEnter={() => onHover && onHover(ri, ci, v)}
                      onMouseLeave={() => onHover && onHover(null, null, null)}
                      title={`[${ri}][${ci}] = ${v}`}
                    >
                      {typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
