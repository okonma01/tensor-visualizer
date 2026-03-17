/**
 * audioUtils.js — browser-side audio synthesis, FFT, and mel spectrogram.
 * All computations run synchronously in JS (no Web Workers).
 */

const SAMPLE_RATE = 4096  // samples/sec (low to keep arrays small)
const DURATION    = 1.0   // seconds
const N_SAMPLES   = Math.round(SAMPLE_RATE * DURATION)

// ── Synthesis ──────────────────────────────────────────────────────────────

/** Generate a pure sine wave at frequency Hz */
function sineWave(freq = 440) {
  return Float32Array.from({ length: N_SAMPLES }, (_, i) =>
    Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE))
  )
}

/** Generate a short sharp transient (drum-like click + exponential decay) */
function drumHit() {
  return Float32Array.from({ length: N_SAMPLES }, (_, i) => {
    const t = i / SAMPLE_RATE
    const click = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 40)
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 60)
    return click * 0.7 + noise * 0.3
  })
}

/** Generate a simple major chord (3 sine waves at A4, C#5, E5) */
function chord() {
  return Float32Array.from({ length: N_SAMPLES }, (_, i) => {
    const t = i / SAMPLE_RATE
    const env = Math.min(1, t * 8) * Math.exp(-t * 1.5)
    return env * (
      Math.sin(2 * Math.PI * 440 * t) +
      Math.sin(2 * Math.PI * 554.37 * t) +
      Math.sin(2 * Math.PI * 659.25 * t)
    ) / 3
  })
}

export const AUDIO_CLIPS = [
  { id: 'sine',  label: '〜 Sine Wave',  desc: '440 Hz pure tone (A4). Simplest possible audio — a single frequency.', gen: () => sineWave(440) },
  { id: 'drum',  label: '🥁 Drum Hit',   desc: 'Sharp transient + exponential decay. Short, percussive burst.', gen: drumHit },
  { id: 'chord', label: '🎵 Major Chord', desc: 'A major chord: A4 + C#5 + E5 mixed together. Shows multiple frequency peaks.', gen: chord },
]

// ── FFT ───────────────────────────────────────────────────────────────────

function nextPow2(n) {
  let p = 1; while (p < n) p <<= 1; return p
}

/** Cooley–Tukey radix-2 FFT (real input).
 *  Returns magnitude array of length N/2 (only positive frequencies). */
export function fft(signal) {
  const N = nextPow2(signal.length)
  // Pad with zeros
  const re = new Float64Array(N)
  const im = new Float64Array(N)
  for (let i = 0; i < signal.length; i++) re[i] = signal[i]

  // Bit-reverse permutation
  for (let i = 0, j = 0; i < N; i++) {
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]]
    }
    let bit = N >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
  }

  // Butterfly
  for (let len = 2; len <= N; len <<= 1) {
    const ang = -2 * Math.PI / len
    const wRe = Math.cos(ang), wIm = Math.sin(ang)
    for (let i = 0; i < N; i += len) {
      let curRe = 1, curIm = 0
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k], uIm = im[i + k]
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe
        re[i + k] = uRe + vRe; im[i + k] = uIm + vIm
        re[i + k + len / 2] = uRe - vRe; im[i + k + len / 2] = uIm - vIm
        const newRe = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe
        curRe = newRe
      }
    }
  }

  // Magnitude (positive frequencies only)
  const half = N / 2
  const mag = new Float32Array(half)
  for (let i = 0; i < half; i++) {
    mag[i] = Math.sqrt(re[i] ** 2 + im[i] ** 2) / N
  }
  return mag
}

// ── Spectrogram ──────────────────────────────────────────────────────────

/** Hann window */
function hann(n, N) {
  return 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1)))
}

/**
 * Short-Time Fourier Transform → spectrogram.
 * Returns { magnitudes: number[][], freqBins, timeFrames, fftSize }
 * magnitudes[freqBin][timeFrame] = value
 */
export function spectrogram(signal, fftSize = 128, hopLength = 32) {
  const frames = []
  for (let start = 0; start + fftSize <= signal.length; start += hopLength) {
    const frame = new Float32Array(fftSize)
    for (let i = 0; i < fftSize; i++) {
      frame[i] = signal[start + i] * hann(i, fftSize)
    }
    const mag = fft(frame)
    frames.push(mag) // each frame is [freqBins]
  }

  const freqBins = frames[0]?.length || 0
  const timeFrames = frames.length
  // Reorganize to [freqBins][timeFrames]
  const mags = Array.from({ length: freqBins }, (_, fi) =>
    frames.map((f) => f[fi])
  )
  return { magnitudes: mags, freqBins, timeFrames, fftSize }
}

// ── Mel filterbank ────────────────────────────────────────────────────────

function hzToMel(hz) { return 2595 * Math.log10(1 + hz / 700) }
function melToHz(mel) { return 700 * (10 ** (mel / 2595) - 1) }

/**
 * Apply mel filterbank to power spectrogram.
 * Returns { melMags: number[][], nMels, timeFrames }
 */
export function melSpectrogram(signal, fftSize = 128, hopLength = 32, nMels = 32) {
  const { magnitudes, freqBins, timeFrames } = spectrogram(signal, fftSize, hopLength)

  // Build mel filterbank
  const fMin = 0, fMax = SAMPLE_RATE / 2
  const melMin = hzToMel(fMin), melMax = hzToMel(fMax)
  const melPoints = Array.from({ length: nMels + 2 }, (_, i) =>
    melToHz(melMin + (i / (nMels + 1)) * (melMax - melMin))
  )
  const binFreqs = Array.from({ length: freqBins }, (_, i) =>
    i * SAMPLE_RATE / (fftSize * 2)
  )

  // filterbank[m][k] = weight of freq bin k for mel channel m
  const filters = Array.from({ length: nMels }, (_, m) => {
    const fCenter = melPoints[m + 1]
    const fLeft   = melPoints[m]
    const fRight  = melPoints[m + 2]
    return binFreqs.map((f) => {
      if (f < fLeft || f > fRight) return 0
      if (f < fCenter) return (f - fLeft) / (fCenter - fLeft)
      return (fRight - f) / (fRight - fCenter)
    })
  })

  // Apply filters: melMags[m][t]
  const melMags = filters.map((filter) =>
    Array.from({ length: timeFrames }, (_, t) =>
      filter.reduce((acc, w, k) => acc + w * (magnitudes[k]?.[t] ?? 0), 0)
    )
  )

  return { melMags, nMels, timeFrames }
}

export { N_SAMPLES, SAMPLE_RATE }
