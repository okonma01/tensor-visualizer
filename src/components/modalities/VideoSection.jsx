import { useState, useMemo } from 'react'
import CodePanel from '../ui/CodePanel.jsx'
import BatchDimBanner from '../ui/BatchDimBanner.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { grayToColor, channelToColor } from '../../utils/imageUtils.js'

const FRAME_SIZE = 16    // 16×16 pixels per frame
const NUM_FRAMES = 10    // total frames

/**
 * Generate programmatic animation frames.
 * 'ball' — a white dot moving across a dark background (grayscale)
 * 'gradient' — a color gradient sweeping across the frame (color)
 */
function generateFrames(type) {
  const frames = []
  for (let f = 0; f < NUM_FRAMES; f++) {
    const t = f / (NUM_FRAMES - 1) // 0 → 1
    const grayChan = []
    const rChan = [], gChan = [], bChan = []

    for (let y = 0; y < FRAME_SIZE; y++) {
      const gRow = [], rRow = [], gRow2 = [], bRow = []
      for (let x = 0; x < FRAME_SIZE; x++) {
        if (type === 'ball') {
          // White circle moving left to right
          const cx = Math.round(2 + t * (FRAME_SIZE - 4))
          const cy = Math.round(FRAME_SIZE / 2)
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
          const val = dist < 3 ? Math.round(255 * (1 - dist / 3)) : 0
          gRow.push(val)
          rRow.push(val); gRow2.push(val); bRow.push(val)
        } else if (type === 'sunrise') {
          // Color wave: warm orange sunrise sweeping upward
          const sunY = Math.round(FRAME_SIZE - 2 - t * (FRAME_SIZE - 2))
          const dist = y - sunY
          const rv = Math.max(0, Math.min(255, Math.round(200 + dist * 8 - (1 - t) * 60)))
          const gv = Math.max(0, Math.min(255, Math.round(120 + dist * 6 - (1 - t) * 80)))
          const bv = Math.max(0, Math.min(255, Math.round(30 + (FRAME_SIZE - y) * 4 + t * 100)))
          rRow.push(rv); gRow2.push(gv); bRow.push(bv)
          gRow.push(Math.round(0.299 * rv + 0.587 * gv + 0.114 * bv))
        } else {
          // Checkerboard dissolve
          const phase = (x + y + Math.round(t * 8)) % 2
          const val = phase === 0 ? Math.round(200 * t) : Math.round(200 * (1 - t))
          gRow.push(val)
          rRow.push(val); gRow2.push(val * (1 - t) | 0); bRow.push(val * t | 0)
        }
      }
      grayChan.push(gRow)
      rChan.push(rRow); gChan.push(gRow2); bChan.push(bRow)
    }
    frames.push({ gray: grayChan, rgb: [rChan, gChan, bChan] })
  }
  return frames
}

const CLIPS = [
  { id: 'ball',     label: '⚪ Moving Dot',  desc: 'A white circle moves left-to-right — simple motion across frames.' },
  { id: 'sunrise',  label: '🌅 Sunrise',     desc: 'A warm color gradient rises up — shows how color changes across the time dimension.' },
  { id: 'dissolve', label: '✦ Dissolve',     desc: 'A checkerboard pattern transitions — highlights discrete pixel-level frame change.' },
]

const ELLIPSIS_THRESHOLD = 6

function videoCode(numFrames, size, mode) {
  if (mode === 'gray') {
    return `import torch

# Video as a sequence of grayscale frames
# shape: [T, H, W]  (no channel dim — or [T, 1, H, W] with explicit channel)
frames = []
for frame in video_frames:
    gray = to_grayscale(frame)          # [H, W]
    frames.append(gray)

video_tensor = torch.stack(frames)      # [T, H, W]
print(video_tensor.shape)  # torch.Size([${numFrames}, ${size}, ${size}])

# Add batch:
batch = video_tensor.unsqueeze(0)       # [1, T, H, W]`
  }
  return `import torch
import torchvision.transforms as T

# Video as a sequence of RGB frames
# shape: [T, 3, H, W]  or  [3, T, H, W] depending on the model

transform = T.ToTensor()  # [H,W,3] uint8 → [3,H,W] float32
frames = []
for frame_img in video_frames:
    frames.append(transform(frame_img))  # [3, H, W]

video_tensor = torch.stack(frames)       # [T, 3, H, W]
print(video_tensor.shape)  # torch.Size([${numFrames}, 3, ${size}, ${size}])

# Add batch:
batch = video_tensor.unsqueeze(0)        # [1, T, 3, H, W]`
}

const CELL = 10 // px per pixel in the frame previews

export default function VideoSection() {
  const [clip, setClip] = useState(CLIPS[0])
  const [mode, setMode] = useState('gray')
  const [activeFrame, setActiveFrame] = useState(0)

  const frames = useMemo(() => generateFrames(clip.id), [clip.id])
  const frameData = frames[activeFrame]
  const tensorSlice = mode === 'gray' ? frameData.gray : frameData.rgb[0]

  // Tensor shape string
  const shape = mode === 'gray'
    ? `[${NUM_FRAMES}, ${FRAME_SIZE}, ${FRAME_SIZE}]`
    : `[${NUM_FRAMES}, 3, ${FRAME_SIZE}, ${FRAME_SIZE}]`

  // Which frames to show in the strip (ellipsis if many)
  const stripFrames = NUM_FRAMES > ELLIPSIS_THRESHOLD
    ? [...frames.slice(0, 3).map((f, i) => ({ f, i })), null, ...frames.slice(-2).map((f, i) => ({ f, i: NUM_FRAMES - 2 + i }))]
    : frames.map((f, i) => ({ f, i }))

  const code = videoCode(NUM_FRAMES, FRAME_SIZE, mode)

  return (
    <div className="animate-slide-up">
      <SectionHeader
        emoji="🎞️"
        title="Video Data"
        subtitle="Video is simply a sequence of images — just add a time dimension T to the image tensor. Grayscale video: [T, H, W]. Color video: [T, 3, H, W]. Each frame is a full image tensor."
        shape={shape}
      />

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {CLIPS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setClip(c); setActiveFrame(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                ${clip.id === c.id
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
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
            Color
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">{clip.desc}</p>

      {/* Frame strip */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
          Frame strip — {NUM_FRAMES} frames (click to inspect)
        </h3>
        <div className="flex gap-2 flex-wrap items-end">
          {stripFrames.map((item, di) => {
            if (item === null) return (
              <div key="ellipsis" className="text-slate-400 text-lg self-center px-1">…</div>
            )
            const { f, i } = item
            const isActive = i === activeFrame
            return (
              <button
                key={i}
                onClick={() => setActiveFrame(i)}
                className={`flex flex-col items-center gap-1 transition-all duration-150 rounded-xl border-2 p-1
                  ${isActive ? 'border-indigo-500 shadow-md scale-105' : 'border-transparent hover:border-slate-300'}`}
              >
                <FrameCanvas frame={f} mode={mode} size={FRAME_SIZE} cellSize={CELL} />
                <span className="text-[10px] font-mono text-slate-400">t={i}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active frame detail + tensor slice */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Frame t={activeFrame} — zoomed
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 inline-block">
            <FrameCanvas frame={frames[activeFrame]} mode={mode} size={FRAME_SIZE} cellSize={24} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            This is frame [{activeFrame}] out of {NUM_FRAMES} total frames. Use the strip above to scrub through the video.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            {mode === 'gray' ? 'Grayscale' : 'Red channel'} tensor slice · t={activeFrame}
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 overflow-auto" style={{ maxHeight: '280px' }}>
            <TensorSliceGrid data={tensorSlice} mode={mode} channel={0} />
          </div>

          {mode === 'rgb' && (
            <div className="mt-3 flex gap-2">
              {['Red', 'Green', 'Blue'].map((name, ci) => (
                <div key={ci} className="flex-1 text-center rounded-lg border py-1.5 text-xs font-semibold" style={{
                  background: `rgba(${ci===0?'220,38,38':ci===1?'34,197,94':'59,130,246'},0.1)`,
                  borderColor: `rgba(${ci===0?'220,38,38':ci===1?'34,197,94':'59,130,246'},0.4)`,
                  color: ci===0?'#dc2626':ci===1?'#16a34a':'#2563eb',
                }}>
                  tensor[{activeFrame}, {ci}, :, :]<br/>
                  <span className="font-normal opacity-70">{name} channel</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 border border-slate-100">
            <strong className="text-slate-700">Indexing into video tensor:</strong>
            <br/>
            <code className="font-mono text-indigo-600">video[{activeFrame}]</code> → frame {activeFrame} → shape{' '}
            <code className="font-mono text-indigo-600">
              {mode === 'gray' ? `[${FRAME_SIZE}, ${FRAME_SIZE}]` : `[3, ${FRAME_SIZE}, ${FRAME_SIZE}]`}
            </code>
          </div>
        </div>
      </div>

      <BatchDimBanner
        singleShape={shape}
        batchShape={mode === 'gray' ? `[B, ${NUM_FRAMES}, ${FRAME_SIZE}, ${FRAME_SIZE}]` : `[B, ${NUM_FRAMES}, 3, ${FRAME_SIZE}, ${FRAME_SIZE}]`}
        description="Training a video model? Wrap your video in a batch. A single grayscale video clip [T, H, W] becomes [B, T, H, W] for a batch of B clips."
      />

      <CodePanel code={code} />
    </div>
  )
}

/** Renders a single frame as a colored grid of pixel rectangles */
function FrameCanvas({ frame, mode, size, cellSize }) {
  // Use CSS grid — no canvas needed
  const data = mode === 'gray' ? frame.gray : null
  const rgb = mode === 'rgb' ? frame.rgb : null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, ${cellSize}px)`, gap: '0px' }}>
      {Array.from({ length: size }, (_, y) =>
        Array.from({ length: size }, (_, x) => {
          let bg
          if (mode === 'gray') {
            bg = grayToColor(data[y][x])
          } else {
            const r = rgb[0][y][x], g = rgb[1][y][x], b = rgb[2][y][x]
            bg = `rgb(${r},${g},${b})`
          }
          return (
            <div
              key={`${y}-${x}`}
              style={{ width: cellSize, height: cellSize, background: bg }}
            />
          )
        })
      )}
    </div>
  )
}

/** Compact mini-grid showing tensor values for one channel slice */
function TensorSliceGrid({ data, mode, channel }) {
  if (!data) return null
  const size = data.length
  return (
    <div style={{ display: 'grid', gridTemplateRows: `repeat(${size}, 1fr)`, gap: '1px' }}>
      {data.map((row, y) => (
        <div key={y} style={{ display: 'flex', gap: '1px' }}>
          {row.map((v, x) => {
            const bg = mode === 'gray' ? grayToColor(v) : channelToColor(v, channel)
            const textCol = v < 128 ? '#ffffff' : '#1e293b'
            return (
              <div
                key={x}
                className="flex items-center justify-center font-mono"
                style={{
                  width: '14px', height: '14px', fontSize: '5px', flexShrink: 0,
                  background: bg, color: 'transparent', borderRadius: '1px',
                }}
                title={`[${y}][${x}] = ${v}`}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
