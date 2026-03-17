import { useState, useMemo, useRef } from 'react'
import CodePanel from '../ui/CodePanel.jsx'
import BatchDimBanner from '../ui/BatchDimBanner.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { AUDIO_CLIPS, spectrogram, melSpectrogram, N_SAMPLES, SAMPLE_RATE } from '../../utils/audioUtils.js'
import { audioCode } from '../../utils/tensorUtils.js'

const REPR_TABS = [
  { id: 'waveform',     label: '〜 Waveform',       shape: '[num_samples]',          desc: '1D — raw amplitude samples over time. Each number is the air pressure at that moment.' },
  { id: 'spectrogram',  label: '🌈 Spectrogram',    shape: '[freq_bins, time_frames]', desc: '2D — frequency content over time (STFT). Each column is one time frame; rows are frequency bins.' },
  { id: 'mel',          label: '🎛️ Mel Spectrogram', shape: '[n_mels, time_frames]',    desc: '2D — spectrogram on a perceptual (mel) frequency scale. This is what audio AI models like Whisper consume.' },
]

const FFT_SIZE = 128
const HOP = 32
const N_MELS = 32
const WAVEFORM_DISPLAY = 128 // downsample for visual

export default function AudioSection() {
  const [activeClip, setActiveClip] = useState(AUDIO_CLIPS[0])
  const [activeRepr, setActiveRepr] = useState('waveform')
  const playRef = useRef(null)

  // Generate + memoize audio signal
  const signal = useMemo(() => activeClip.gen(), [activeClip])

  // Compute representations
  const waveformDisplay = useMemo(() => {
    const step = Math.floor(signal.length / WAVEFORM_DISPLAY)
    return Array.from({ length: WAVEFORM_DISPLAY }, (_, i) => signal[i * step] || 0)
  }, [signal])

  const spectroData = useMemo(() => spectrogram(signal, FFT_SIZE, HOP), [signal])
  const melData = useMemo(() => melSpectrogram(signal, FFT_SIZE, HOP, N_MELS), [signal])

  const currentRepr = REPR_TABS.find((r) => r.id === activeRepr)
  const code = audioCode(N_SAMPLES, SAMPLE_RATE, activeRepr)

  // Simple Web Audio playback
  function playClip() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE })
    const buffer = ctx.createBuffer(1, signal.length, SAMPLE_RATE)
    buffer.copyToChannel(signal, 0)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    src.start()
    playRef.current = src
  }

  return (
    <div className="animate-slide-up">
      <SectionHeader
        emoji="🎵"
        title="Audio Data"
        subtitle="Sound is captured as a sequence of air pressure samples — already numbers! But raw waveforms are huge and hard to learn from. Audio AI typically transforms the waveform into a 2D spectrogram first. Toggle between all three representations."
        shape={currentRepr.shape}
      />

      {/* Clip selector */}
      <div className="flex flex-wrap gap-3 mb-4">
        {AUDIO_CLIPS.map((clip) => (
          <button
            key={clip.id}
            onClick={() => setActiveClip(clip)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
              ${activeClip.id === clip.id
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {clip.label}
          </button>
        ))}
        <button
          onClick={playClip}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-100 border border-emerald-300 text-emerald-700 hover:bg-emerald-200 transition-colors"
        >
          ▶ Play clip
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-5 italic">{activeClip.desc}</p>

      {/* Representation selector */}
      <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-6">
        {REPR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveRepr(tab.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors text-center border-r last:border-r-0 border-slate-200
              ${activeRepr === tab.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {tab.label}
            <br/>
            <code className={`text-[10px] ${activeRepr === tab.id ? 'text-indigo-200' : 'text-slate-400'}`}>{tab.shape}</code>
          </button>
        ))}
      </div>

      <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700">
        <strong>{currentRepr.label}:</strong> {currentRepr.desc}
      </div>

      {/* Visualization */}
      {activeRepr === 'waveform' && (
        <WaveformView signal={waveformDisplay} nSamples={N_SAMPLES} />
      )}
      {activeRepr === 'spectrogram' && (
        <SpectroView data={spectroData} title="Spectrogram" colorLabel="Magnitude" />
      )}
      {activeRepr === 'mel' && (
        <SpectroView data={{ magnitudes: melData.melMags, freqBins: melData.nMels, timeFrames: melData.timeFrames }} title="Mel Spectrogram" colorLabel="Mel energy" isMel />
      )}

      <BatchDimBanner
        singleShape={currentRepr.shape}
        batchShape={`[B, ${currentRepr.shape.slice(1)}`}
        description="Just like all other modalities, training a model on audio means batching: wrap the single audio tensor in a batch dimension B."
      />

      <CodePanel code={code} />
    </div>
  )
}

// ── Sub-visualizations ──────────────────────────────────────────────────────

function WaveformView({ signal, nSamples }) {
  const W = 600, H = 120
  const mid = H / 2
  const maxVal = Math.max(...signal.map(Math.abs)) || 1

  const points = signal.map((v, i) => {
    const x = (i / (signal.length - 1)) * W
    const y = mid - (v / maxVal) * (mid - 6)
    return `${x},${y}`
  }).join(' ')

  // Show a sample of actual tensor values
  const displayVals = signal.filter((_, i) => i % 16 === 0).slice(0, 16)

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Waveform</h3>
        <div className="bg-slate-900 rounded-xl overflow-hidden p-2">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block">
            <line x1="0" y1={mid} x2={W} y2={mid} stroke="#374151" strokeWidth="0.5"/>
            <polyline points={points} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {nSamples.toLocaleString()} samples at {SAMPLE_RATE.toLocaleString()} Hz → shape: <code className="font-mono text-indigo-500">[{nSamples}]</code>
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          Tensor (sample values) · shape <code className="font-mono text-indigo-600">[{nSamples}]</code>
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
          <div className="flex flex-wrap gap-1">
            {displayVals.map((v, i) => (
              <div key={i}
                className="text-[11px] font-mono text-center rounded px-1.5 py-1 border"
                style={{
                  background: `rgba(129,140,248,${0.1 + Math.abs(v) * 0.5})`,
                  borderColor: 'rgba(129,140,248,0.3)',
                  color: '#4f46e5',
                }}>
                {v.toFixed(3)}
              </div>
            ))}
            <div className="text-slate-400 text-xs self-center px-1">…+{(nSamples - displayVals.length).toLocaleString()}</div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Values range from –1.0 to +1.0 (normalized amplitude)</p>
        </div>
      </div>
    </div>
  )
}

function SpectroView({ data, title, colorLabel, isMel = false }) {
  const { magnitudes, freqBins, timeFrames } = data
  if (!magnitudes || magnitudes.length === 0) return null

  const [hoveredCell, setHoveredCell] = useState(null)

  // Find max for color normalization
  let maxVal = 0
  for (const row of magnitudes) for (const v of row) if (v > maxVal) maxVal = v
  maxVal = maxVal || 1

  // Down-sample for display (cap at 40×40 grid cells)
  const displayRows = Math.min(freqBins, 40)
  const displayCols = Math.min(timeFrames, 64)
  const rowStep = Math.max(1, Math.floor(freqBins / displayRows))
  const colStep = Math.max(1, Math.floor(timeFrames / displayCols))

  const grid = []
  for (let fi = 0; fi < freqBins; fi += rowStep) {
    const row = []
    for (let ti = 0; ti < timeFrames; ti += colStep) {
      row.push({ v: magnitudes[fi][ti] || 0, fi, ti })
    }
    grid.push(row)
  }
  // Flip vertically (low freq at bottom visually)
  grid.reverse()

  const CELL = 8

  function heatColor(v) {
    const t = Math.min(1, v / maxVal)
    if (t < 0.25) return `rgb(${Math.round(t * 4 * 50)},${Math.round(t * 4 * 30)},${Math.round(80 + t * 4 * 100)})`
    if (t < 0.5)  { const s = (t - 0.25) * 4; return `rgb(${Math.round(s * 200)},${Math.round(s * 60)},${Math.round(180 - s * 120)})` }
    if (t < 0.75) { const s = (t - 0.5) * 4;  return `rgb(${Math.round(200 + s * 55)},${Math.round(60 + s * 140)},${Math.round(60 - s * 40)})` }
    const s = (t - 0.75) * 4
    return `rgb(255,${Math.round(200 + s * 55)},${Math.round(20 + s * 200)})`
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{title}</h3>
        <div className="bg-slate-900 rounded-xl p-3 inline-block relative">
          <div style={{ display: 'grid', gridTemplateRows: `repeat(${grid.length}, ${CELL}px)`, gap: '0' }}>
            {grid.map((row, ri) => (
              <div key={ri} style={{ display: 'flex' }}>
                {row.map(({ v, fi, ti }, ci) => {
                  const isHL = hoveredCell && hoveredCell.fi === fi && hoveredCell.ti === ti
                  return (
                    <div
                      key={ci}
                      style={{ width: CELL, height: CELL, background: heatColor(v), outline: isHL ? '2px solid #f0f' : 'none' }}
                      onMouseEnter={() => setHoveredCell({ fi, ti, v })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          {/* Axis labels */}
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>0</span><span>← time →</span><span>{timeFrames} frames</span>
          </div>
          {/* Colorbar */}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[9px] text-slate-500">0</span>
            <div className="flex-1 h-2 rounded" style={{ background: 'linear-gradient(to right, #001050, #aa003c, #ff8c00, #ffff80)' }}/>
            <span className="text-[9px] text-slate-500">max</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-1">{colorLabel}</p>
        </div>
        {hoveredCell && (
          <div className="mt-2 text-xs font-mono text-slate-600 bg-slate-50 rounded-lg px-2 py-1 inline-block border border-slate-200">
            [{isMel ? 'mel' : 'freq'} {hoveredCell.fi}, time {hoveredCell.ti}] = {hoveredCell.v.toFixed(4)}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2">
          Shape: <code className="font-mono text-indigo-500">[{freqBins}, {timeFrames}]</code>
          {isMel && ' — mel channels × time frames'}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          Tensor slice (first {Math.min(8, freqBins)} freq bins)
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 overflow-x-auto">
          <table className="text-[10px] font-mono border-separate border-spacing-0.5">
            <thead>
              <tr>
                <th className="text-slate-400 font-normal pr-2 text-left text-[9px]">{isMel ? 'mel' : 'freq'} ↓ \ time →</th>
                {Array.from({ length: Math.min(8, timeFrames) }, (_, ti) => (
                  <th key={ti} className="text-slate-400 font-normal pb-1" style={{ minWidth: 36 }}>t={ti}</th>
                ))}
                <th className="text-slate-400 font-normal">…</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(8, freqBins) }, (_, fi) => (
                <tr key={fi}>
                  <td className="text-slate-400 font-normal pr-2 text-[9px]">[{fi}]</td>
                  {Array.from({ length: Math.min(8, timeFrames) }, (_, ti) => {
                    const v = magnitudes[fi][ti] || 0
                    const t = Math.min(1, v / maxVal)
                    return (
                      <td key={ti}
                        className="text-center rounded transition-all"
                        style={{
                          background: `rgba(99,102,241,${0.08 + t * 0.65})`,
                          color: t > 0.5 ? '#1e293b' : '#64748b',
                          minWidth: 36,
                        }}>
                        {v.toFixed(3)}
                      </td>
                    )
                  })}
                  <td className="text-slate-300 text-center">…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isMel && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            <strong>Why mel?</strong> Human hearing is logarithmic — we perceive pitch differences better in low frequencies. The mel scale compresses high-frequency bins and expands low-frequency ones to match human perception. Models like Whisper and HuBERT operate on mel spectrograms.
          </div>
        )}
        {!isMel && (
          <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-600">
            <strong>How it works:</strong> A sliding window (of size {FFT_SIZE}) moves across the waveform in steps of {HOP} samples. Each window is transformed via FFT to reveal its frequency content. Stack all windows side by side → you get this 2D grid.
          </div>
        )}
      </div>
    </div>
  )
}
