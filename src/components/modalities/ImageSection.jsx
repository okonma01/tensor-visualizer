import { useState } from 'react'
import CodePanel from '../ui/CodePanel.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { imageCode } from '../../utils/tensorUtils.js'

const DIGIT = {
  label: 'Handwritten Digit',
  description: "A 16x16 pixel image of a handwritten '0'. Each pixel's intensity is stored as an integer from 0 (white) to 255 (black).",
  data: [
    [0, 0, 0, 0, 16, 42, 68, 82, 82, 68, 42, 16, 0, 0, 0, 0],
    [0, 0, 0, 28, 86, 134, 178, 206, 206, 178, 134, 86, 28, 0, 0, 0],
    [0, 0, 18, 86, 160, 212, 238, 248, 248, 238, 212, 160, 86, 18, 0, 0],
    [0, 8, 74, 156, 224, 248, 255, 255, 255, 255, 248, 224, 156, 74, 8, 0],
    [0, 28, 114, 204, 246, 255, 232, 190, 190, 232, 255, 246, 204, 114, 28, 0],
    [0, 42, 138, 226, 255, 234, 132, 74, 74, 132, 234, 255, 226, 138, 42, 0],
    [0, 46, 148, 236, 250, 182, 86, 54, 54, 86, 182, 250, 236, 148, 46, 0],
    [0, 38, 140, 228, 250, 180, 82, 48, 48, 82, 180, 250, 228, 140, 38, 0],
    [0, 38, 140, 228, 250, 180, 82, 48, 48, 82, 180, 250, 228, 140, 38, 0],
    [0, 46, 148, 236, 250, 182, 86, 54, 54, 86, 182, 250, 236, 148, 46, 0],
    [0, 42, 138, 226, 255, 234, 132, 74, 74, 132, 234, 255, 226, 138, 42, 0],
    [0, 28, 114, 204, 246, 255, 232, 190, 190, 232, 255, 246, 204, 114, 28, 0],
    [0, 8, 74, 156, 224, 248, 255, 255, 255, 255, 248, 224, 156, 74, 8, 0],
    [0, 0, 18, 86, 160, 212, 238, 248, 248, 238, 212, 160, 86, 18, 0, 0],
    [0, 0, 0, 28, 86, 134, 178, 206, 206, 178, 134, 86, 28, 0, 0, 0],
    [0, 0, 0, 0, 16, 42, 68, 82, 82, 68, 42, 16, 0, 0, 0, 0],
  ],
}

function grayToColor(value) {
  const inverted = 255 - value
  return `rgb(${inverted}, ${inverted}, ${inverted})`
}

export default function ImageSection() {
  const [hoveredPixel, setHoveredPixel] = useState(null)

  const tensorData = DIGIT.data
  const size = tensorData.length
  const code = imageCode(size, size)
  const hov = hoveredPixel
    ? { ...hoveredPixel, v: tensorData[hoveredPixel.y]?.[hoveredPixel.x] }
    : null

  return (
    <section id="image" className="surface">
      <SectionHeader
        emoji="🖼️"
        title="Image Data"
        subtitle="An image is just a grid. For grayscale data, every location stores one intensity value, so the picture becomes a 2D tensor."
        shape={`[${size}, ${size}]`}
      />

      <div className="note-card mb-6 text-sm leading-6">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{DIGIT.label}.</strong> {DIGIT.description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start">
        <div className="space-y-4">
          <div className="soft-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">Image preview</h3>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent)]">16 × 16 pixels</code>
            </div>
            <div className="flex justify-center">
              <PixelGrid data={tensorData} hoveredPixel={hoveredPixel} onHover={setHoveredPixel} cellClassName="h-5 w-5 sm:h-6 sm:w-6 rounded-[4px]" showValue={false} gap="6px" ringClassName="ring-2 ring-[color:var(--accent)] scale-110" />
            </div>
          </div>

          <div className="soft-panel text-sm leading-6 text-slate-600">
            <strong className="text-slate-900">Why this matters:</strong> OCR datasets are built exactly this way. A model does not see a handwritten digit. It sees 256 stored intensities.
          </div>
        </div>

        <div className="space-y-4">
          <div className="soft-panel overflow-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pixel tensor</h3>
                <p className="text-sm text-slate-500">Hover a cell to inspect one matrix entry.</p>
              </div>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent)]">[{size}, {size}]</code>
            </div>
            <PixelGrid data={tensorData} hoveredPixel={hoveredPixel} onHover={setHoveredPixel} cellClassName="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] text-[8px] font-mono sm:h-[20px] sm:w-[20px]" showValue gap="3px" ringClassName="ring-2 ring-[color:var(--accent-3)] scale-110 shadow-sm" />
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="soft-panel text-sm leading-6 text-slate-600">
              <strong className="text-slate-900">Normalization:</strong> pixel values are often divided by 255 so the tensor lives in <code className="font-mono">[0, 1]</code> instead of <code className="font-mono">[0, 255]</code>.
            </div>

            <div className="note-card text-sm">
              {hov ? (
                <>
                  <strong className="font-mono">tensor[{hov.y}, {hov.x}]</strong>
                  <div className="mt-2 font-mono">{hov.v} → {(hov.v / 255).toFixed(3)}</div>
                </>
              ) : 'Hover a cell to inspect one pixel.'}
            </div>
          </div>
        </div>
      </div>

      <CodePanel code={code} />
    </section>
  )
}

function PixelGrid({ data, hoveredPixel, onHover, cellClassName, showValue, gap, ringClassName }) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${data[0].length}, minmax(0, 1fr))`, gap }}
      onMouseLeave={() => onHover(null)}
    >
      {data.flatMap((row, y) =>
        row.map((value, x) => {
          const isHL = hoveredPixel && hoveredPixel.x === x && hoveredPixel.y === y
          const textCol = value < 128 ? '#1e293b' : '#ffffff'
          return (
            <button
              key={`${y}-${x}`}
              type="button"
              className={`${cellClassName} transition-all ${isHL ? `${ringClassName} z-10` : ''}`}
              style={{ backgroundColor: grayToColor(value), color: isHL ? textCol : 'transparent' }}
              onMouseEnter={() => onHover({ x, y })}
              aria-label={`pixel ${y}, ${x} value ${value}`}
            >
              {showValue && isHL ? value : ''}
            </button>
          )
        })
      )}
    </div>
  )
}
