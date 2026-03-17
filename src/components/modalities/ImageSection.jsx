import { useState, useEffect, useRef, useCallback } from 'react'
import CodePanel from '../ui/CodePanel.jsx'
import BatchDimBanner from '../ui/BatchDimBanner.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { loadImagePixels, grayToColor, channelToColor } from '../../utils/imageUtils.js'
import { imageCode } from '../../utils/tensorUtils.js'

const BASE = import.meta.env.BASE_URL

const IMAGES = [
  { id: 'coffee', label: '☕ Coffee', src: `${BASE}images/coffee.svg` },
  { id: 'leaf',   label: '🌿 Leaf',   src: `${BASE}images/leaf.svg` },
  { id: 'face',   label: '😊 Face',   src: `${BASE}images/face.svg` },
]

const TENSOR_SIZE = 32 // internal tensor resolution
const CHANNEL_NAMES = ['Red', 'Green', 'Blue']
const CHANNEL_COLORS = ['#ef4444', '#22c55e', '#3b82f6']

export default function ImageSection() {
  const [selectedImg, setSelectedImg] = useState(IMAGES[0])
  const [mode, setMode] = useState('gray') // 'gray' | 'rgb'
  const [activeChannel, setActiveChannel] = useState(0) // for rgb view
  const [pixelData, setPixelData] = useState(null)
  const [hoveredPixel, setHoveredPixel] = useState(null) // {x, y}
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setHoveredPixel(null)
    loadImagePixels(selectedImg.src, TENSOR_SIZE)
      .then((data) => { setPixelData(data); setLoading(false) })
      .catch((e) => { console.error(e); setLoading(false) })
  }, [selectedImg])

  const tensorData = pixelData
    ? (mode === 'gray'
        ? pixelData.grayData
        : pixelData.rgbData[activeChannel])
    : null

  const code = imageCode(TENSOR_SIZE, TENSOR_SIZE, mode)

  function pixelValue(x, y) {
    if (!pixelData) return null
    if (mode === 'gray') return pixelData.grayData[y]?.[x]
    return pixelData.rgbData[activeChannel][y]?.[x]
  }

  const CELL = 8 // px per cell in the tensor canvas
  const canvasRef = useRef(null)

  // Draw the image tensor as a colored grid
  useEffect(() => {
    if (!tensorData || !canvasRef.current) return
    const canvas = canvasRef.current
    const size = TENSOR_SIZE
    canvas.width = size * CELL
    canvas.height = size * CELL
    const ctx = canvas.getContext('2d')
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = tensorData[y][x]
        ctx.fillStyle = mode === 'gray' ? grayToColor(v) : channelToColor(v, activeChannel)
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
        if (hoveredPixel && hoveredPixel.x === x && hoveredPixel.y === y) {
          ctx.strokeStyle = 'rgba(99,102,241,0.9)'
          ctx.lineWidth = 2
          ctx.strokeRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
        }
      }
    }
  }, [tensorData, hoveredPixel, mode, activeChannel])

  const handleCanvasMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = (TENSOR_SIZE * CELL) / rect.width
    const scaleY = (TENSOR_SIZE * CELL) / rect.height
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / CELL)
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / CELL)
    if (x >= 0 && x < TENSOR_SIZE && y >= 0 && y < TENSOR_SIZE) {
      setHoveredPixel({ x, y })
    }
  }, [])

  const hov = hoveredPixel ? {
    x: hoveredPixel.x,
    y: hoveredPixel.y,
    v: pixelValue(hoveredPixel.x, hoveredPixel.y),
  } : null

  return (
    <div className="animate-slide-up">
      <SectionHeader
        emoji="🖼️"
        title="Image Data"
        subtitle="Images become tensors by treating each pixel as a number. Grayscale: one value per pixel → 2D tensor. Color (RGB): three values per pixel across three channels → 3D tensor. Hover any pixel to see its value."
        shape={mode === 'gray' ? `[${TENSOR_SIZE}, ${TENSOR_SIZE}]` : `[3, ${TENSOR_SIZE}, ${TENSOR_SIZE}]`}
      />

      {/* Controls row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Image selector */}
        <div className="flex gap-2">
          {IMAGES.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedImg(img)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                ${selectedImg.id === img.id
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {img.label}
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setMode('gray')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors
              ${mode === 'gray' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Grayscale
          </button>
          <button
            onClick={() => setMode('rgb')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors
              ${mode === 'rgb' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            RGB Color
          </button>
        </div>

        {mode === 'rgb' && (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {CHANNEL_NAMES.map((name, ci) => (
              <button
                key={ci}
                onClick={() => setActiveChannel(ci)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors
                  ${activeChannel === ci ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                style={activeChannel === ci ? { backgroundColor: CHANNEL_COLORS[ci] } : {}}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: original image + tensor canvas */}
        <div>
          {/* Original image */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Original image</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 inline-block">
              <img
                src={selectedImg.src}
                alt={selectedImg.label}
                className="w-48 h-48 object-contain rounded-lg"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>

          {/* Tensor pixel grid canvas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Pixel tensor ({TENSOR_SIZE}×{TENSOR_SIZE}) — hover to inspect
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 inline-block relative">
              {loading ? (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="rounded cursor-crosshair"
                  style={{ width: '256px', height: '256px', imageRendering: 'pixelated' }}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoveredPixel(null)}
                />
              )}
              {/* Hover tooltip */}
              {hov && (
                <div className="absolute top-2 right-2 bg-slate-900 text-white text-xs font-mono px-2.5 py-1.5 rounded-lg shadow-lg">
                  pixel [{hov.y}, {hov.x}]
                  {mode === 'rgb' && <span className="ml-1 font-semibold" style={{ color: CHANNEL_COLORS[activeChannel] }}>{CHANNEL_NAMES[activeChannel]}</span>}
                  <br/>= <strong>{hov.v}</strong>
                  <span className="text-slate-400 ml-1">(0–255)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: tensor view */}
        <div>
          {mode === 'gray' ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                Grayscale tensor · <code className="font-mono text-indigo-600">[{TENSOR_SIZE}, {TENSOR_SIZE}]</code>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Each cell is one pixel. The value (0–255) represents brightness: 0 = black, 255 = white.
              </p>
              {tensorData && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 overflow-auto" style={{ maxHeight: '320px' }}>
                  <TensorMiniGrid
                    data={tensorData}
                    hoveredPixel={hoveredPixel}
                    mode="gray"
                    channel={0}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                RGB tensor · <code className="font-mono text-indigo-600">[3, {TENSOR_SIZE}, {TENSOR_SIZE}]</code>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Three 2D grids stacked — one per color channel. Each cell is 0–255.
                The channel currently displayed: <strong style={{ color: CHANNEL_COLORS[activeChannel] }}>{CHANNEL_NAMES[activeChannel]}</strong>
              </p>
              {/* Channel stack illustration */}
              <div className="flex gap-3 mb-3">
                {CHANNEL_NAMES.map((name, ci) => (
                  <button
                    key={ci}
                    onClick={() => setActiveChannel(ci)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all
                      ${activeChannel === ci ? 'shadow-md scale-105' : 'opacity-60 hover:opacity-80'}`}
                    style={{
                      backgroundColor: `${CHANNEL_COLORS[ci]}20`,
                      borderColor: `${CHANNEL_COLORS[ci]}60`,
                      color: CHANNEL_COLORS[ci],
                    }}
                  >
                    [{ci}] {name}
                  </button>
                ))}
              </div>
              {pixelData && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 overflow-auto" style={{ maxHeight: '280px' }}>
                  <TensorMiniGrid
                    data={pixelData.rgbData[activeChannel]}
                    hoveredPixel={hoveredPixel}
                    mode="rgb"
                    channel={activeChannel}
                  />
                </div>
              )}
            </div>
          )}

          {hov && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700">
              <strong>tensor[{mode === 'rgb' ? `${activeChannel}, ` : ''}{hov.y}, {hov.x}]</strong> = <span className="text-indigo-600">{hov.v}</span>
              <span className="text-slate-400 ml-2">/ 255 = {(hov.v / 255).toFixed(3)}</span>
              <span className="text-slate-400 ml-2">(normalized)</span>
            </div>
          )}

          <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 border border-slate-100">
            <strong className="text-slate-700">Normalization:</strong> PyTorch's <code className="font-mono">ToTensor()</code> automatically divides by 255, mapping values to [0.0, 1.0]. The raw values above show what the image <em>contains</em>; the model sees the normalized version.
          </div>
        </div>
      </div>

      <BatchDimBanner
        singleShape={mode === 'gray' ? `[${TENSOR_SIZE}, ${TENSOR_SIZE}]` : `[3, ${TENSOR_SIZE}, ${TENSOR_SIZE}]`}
        batchShape={mode === 'gray' ? `[B, 1, ${TENSOR_SIZE}, ${TENSOR_SIZE}]` : `[B, 3, ${TENSOR_SIZE}, ${TENSOR_SIZE}]`}
        description={`A single image is ${mode === 'gray' ? '[H, W]' : '[3, H, W]'}. Feed a batch of B images to a CNN and the shape becomes ${mode === 'gray' ? '[B, 1, H, W]' : '[B, 3, H, W]'}. The batch dimension always comes first.`}
      />

      <CodePanel code={code} />
    </div>
  )
}

/** Compact pixel grid showing values as tiny colored cells */
function TensorMiniGrid({ data, hoveredPixel, mode, channel }) {
  if (!data) return null
  const size = data.length
  // Show a downsampled view if too large — show every other pixel label
  const step = size > 16 ? 2 : 1
  const displayRows = []
  for (let y = 0; y < size; y += step) {
    const row = []
    for (let x = 0; x < size; x += step) {
      row.push({ x, y, v: data[y][x] })
    }
    displayRows.push(row)
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: `repeat(${displayRows.length}, 1fr)`, gap: '1px' }}>
      {displayRows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: '1px' }}>
          {row.map(({ x, y, v }) => {
            const isHL = hoveredPixel && Math.abs(hoveredPixel.x - x) < step && Math.abs(hoveredPixel.y - y) < step
            const bg = mode === 'gray' ? grayToColor(v) : channelToColor(v, channel)
            const textCol = v < 128 ? '#ffffff' : '#1e293b'
            return (
              <div
                key={x}
                className={`flex items-center justify-center font-mono transition-all ${isHL ? 'ring-1 ring-indigo-500 z-10 scale-110 shadow' : ''}`}
                style={{
                  width: '14px', height: '14px', fontSize: '6px', flexShrink: 0,
                  background: bg, color: isHL ? textCol : 'transparent',
                  borderRadius: '1px',
                }}
                title={`[${y}][${x}] = ${v}`}
              >
                {isHL ? v : ''}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
