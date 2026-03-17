/**
 * tensorUtils.js — shape helpers, formatting, pseudo-embedding generation.
 */

/** Format a shape array as a PyTorch-style string: [30, 4] */
export function shapeStr(dims) {
  return `[${dims.join(', ')}]`
}

/** Deterministic pseudo-random float in [-1, 1] from integer seed */
function seededFloat(seed) {
  // Simple LCG hash
  let s = Math.abs((seed * 1664525 + 1013904223) & 0xffffffff)
  s = ((s ^ (s >>> 16)) * 0x45d9f3b) & 0xffffffff
  s = ((s ^ (s >>> 16)) * 0x45d9f3b) & 0xffffffff
  s = s ^ (s >>> 16)
  return (s / 0x7fffffff) - 1.0
}

/**
 * Generate a deterministic pseudo-embedding matrix for a sequence of token IDs.
 * Returns number[][] of shape [seqLen, embedDim].
 * Same tokenId always produces the same embedding row.
 */
export function pseudoEmbeddings(tokenIds, embedDim = 8) {
  return tokenIds.map((tid) =>
    Array.from({ length: embedDim }, (_, d) => {
      const raw = seededFloat(tid * 1000 + d * 37 + 17)
      return Math.round(raw * 1000) / 1000
    })
  )
}

/** Consistent pastel color for a token index (for visual coding) */
const TOKEN_PALETTE = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#a855f7', '#22c55e', '#f43f5e', '#0ea5e9',
  '#e879f9', '#84cc16', '#fb923c', '#38bdf8',
]
export function tokenColor(index) {
  return TOKEN_PALETTE[index % TOKEN_PALETTE.length]
}

/**
 * Generate a PyTorch code snippet for common tensor operations.
 */
export function tabularCode(data, featureNames) {
  const rows = data.map((r) => `    [${r.join(', ')}]`).join(',\n')
  return `import torch

# Feature matrix — shape: [${data.length}, ${data[0].length}]
# Features: ${featureNames.join(', ')}
X = torch.tensor([
${rows}
], dtype=torch.float32)

print(X.shape)   # torch.Size([${data.length}, ${data[0].length}])
print(X.dtype)   # torch.float32`
}

export function timeSeriesCode(data, dates) {
  const first3 = data.slice(0, 3).map((r) => `    ${JSON.stringify(r)},`).join('\n')
  return `import torch

# NASDAQ OHLC — shape: [T, 4]  where T = ${data.length} trading days
# Columns: [Open, High, Low, Close]
sequence = torch.tensor([
${first3}
    # ... ${data.length - 3} more rows
], dtype=torch.float32)

print(sequence.shape)   # torch.Size([${data.length}, 4])

# Add batch dimension for model input:
batch = sequence.unsqueeze(0)
print(batch.shape)      # torch.Size([1, ${data.length}, 4])`
}

export function textCode(tokenIds, embedDim) {
  return `import torch

# Step 1 — Token IDs (integers, from GPT-2 tokenizer)
token_ids = torch.tensor(${JSON.stringify(tokenIds)})
# shape: torch.Size([${tokenIds.length}])

# Step 2 — Embedding lookup (learned during training)
embed = torch.nn.Embedding(50257, ${embedDim})  # GPT-2 vocab size
embeddings = embed(token_ids)
# shape: torch.Size([${tokenIds.length}, ${embedDim}])
# dtype: torch.float32

# Note: actual embedding values are learned; the grid
# above shows illustrative pseudo values with same structure.`
}

export function imageCode(h, w, mode) {
  if (mode === 'gray') {
    return `import torch
from PIL import Image
import torchvision.transforms as T

img = Image.open("image.jpg").convert("L")  # grayscale

transform = T.Compose([
    T.Resize((${h}, ${w})),
    T.ToTensor(),  # scales [0,255] → [0.0, 1.0]
])

tensor = transform(img)
print(tensor.shape)  # torch.Size([1, ${h}, ${w}])
#                               ↑    ↑   ↑
#                           channel H   W

# Squeeze the channel dim for pure 2D:
tensor_2d = tensor.squeeze(0)
print(tensor_2d.shape)  # torch.Size([${h}, ${w}])`
  }
  return `import torch
from PIL import Image
import torchvision.transforms as T

img = Image.open("image.jpg").convert("RGB")

transform = T.Compose([
    T.Resize((${h}, ${w})),
    T.ToTensor(),  # scales [0,255] → [0.0, 1.0] per channel
])

tensor = transform(img)
print(tensor.shape)  # torch.Size([3, ${h}, ${w}])
#                               ↑   ↑   ↑
#                         channels H   W
# tensor[0] = Red channel
# tensor[1] = Green channel
# tensor[2] = Blue channel`
}

export function audioCode(numSamples, sampleRate, repr) {
  if (repr === 'waveform') {
    return `import torch
import torchaudio

waveform, sr = torchaudio.load("audio.wav")
# shape: torch.Size([${numSamples}])  (mono, 1D)
# or for multi-channel: [channels, ${numSamples}]

print(waveform.shape)
print(f"Sample rate: {sr} Hz")`
  }
  if (repr === 'spectrogram') {
    return `import torch
import torchaudio
import torchaudio.transforms as T

waveform, sr = torchaudio.load("audio.wav")

spec_transform = T.Spectrogram(n_fft=256, hop_length=64)
spectrogram = spec_transform(waveform)

# shape: torch.Size([freq_bins, time_frames])
#                    ↑           ↑
#                  n_fft/2+1   depends on signal length
print(spectrogram.shape)`
  }
  return `import torch
import torchaudio
import torchaudio.transforms as T

waveform, sr = torchaudio.load("audio.wav")

mel_transform = T.MelSpectrogram(
    sample_rate=sr,
    n_fft=256,
    hop_length=64,
    n_mels=64,   # mel frequency bins
)
mel_spec = mel_transform(waveform)

# shape: torch.Size([n_mels, time_frames]) = [64, T]
# This is the representation most audio AI models consume.
print(mel_spec.shape)`
}
