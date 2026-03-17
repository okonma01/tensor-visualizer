import { useState, useEffect, useRef } from 'react'
import TensorGrid from '../ui/TensorGrid.jsx'
import CodePanel from '../ui/CodePanel.jsx'
import BatchDimBanner from '../ui/BatchDimBanner.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { pseudoEmbeddings, tokenColor, textCode } from '../../utils/tensorUtils.js'

const MAX_CHARS = 120
const EMBED_DIM = 8
const PLACEHOLDER = 'The quick brown fox jumps over the lazy dog'

export default function TextSection() {
  const [text, setText] = useState(PLACEHOLDER)
  const [tokenIds, setTokenIds] = useState([])
  const [tokenStrings, setTokenStrings] = useState([])
  const [loading, setLoading] = useState(false)
  const [hoveredToken, setHoveredToken] = useState(null)
  const debounceRef = useRef(null)

  // Tokenize whenever text changes (gpt-tokenizer loaded lazily to keep initial bundle small)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { encode, decode } = await import('gpt-tokenizer')
        const ids = encode(text)
        const strs = ids.map((id) => {
          try { return decode([id]) } catch { return `[${id}]` }
        })
        setTokenIds(ids)
        setTokenStrings(strs)
      } catch (err) {
        console.error('Tokenizer error', err)
        const words = text.trim().split(/\s+/).filter(Boolean)
        setTokenIds(words.map((_, i) => i * 100 + 42))
        setTokenStrings(words)
      } finally {
        setLoading(false)
      }
    }, 150)
  }, [text])

  const embeddings = pseudoEmbeddings(tokenIds, EMBED_DIM)
  const colors = tokenIds.map((_, i) => tokenColor(i))

  const charCount = text.length
  const nearLimit = charCount > 100
  const atLimit = charCount >= MAX_CHARS

  const code = textCode(tokenIds.slice(0, 8), EMBED_DIM)

  return (
    <div className="animate-slide-up">
      <SectionHeader
        emoji="💬"
        title="Text Data"
        subtitle="Text cannot be fed directly into a neural network. It must first be split into tokens, then each token is mapped to a dense vector of numbers (an embedding). That grid of vectors is the tensor that the model actually sees."
        shape={tokenIds.length > 0 ? `[${tokenIds.length}, ${EMBED_DIM}]` : '[seq_len, embed_dim]'}
      />

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-600 mb-2">
          Type any text (max {MAX_CHARS} characters):
        </label>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={2}
            placeholder={PLACEHOLDER}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-mono resize-none outline-none focus:ring-2 transition-all
              ${atLimit
                ? 'border-rose-400 focus:ring-rose-300 bg-rose-50'
                : nearLimit
                ? 'border-amber-300 focus:ring-amber-200 bg-amber-50'
                : 'border-slate-200 focus:ring-indigo-300 bg-white'}`}
          />
          <span className={`absolute bottom-2 right-3 text-[11px] font-mono transition-colors
            ${atLimit ? 'text-rose-500' : nearLimit ? 'text-amber-500' : 'text-slate-400'}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
        {atLimit && (
          <p className="text-xs text-rose-500 mt-1">Character limit reached. Shorten your text to add more.</p>
        )}
      </div>

      {/* Token pills */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          Step 1 — Tokens · shape{' '}
          <code className="font-mono text-indigo-600 text-xs">[{tokenIds.length}]</code>
          <span className="text-slate-400 font-normal text-xs ml-2">(1D tensor of integers)</span>
        </h3>
        {loading ? (
          <div className="text-xs text-slate-400 animate-pulse">Tokenizing…</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tokenStrings.map((tok, i) => (
              <button
                key={i}
                onMouseEnter={() => setHoveredToken(i)}
                onMouseLeave={() => setHoveredToken(null)}
                className={`inline-flex flex-col items-center rounded-lg px-2.5 py-1.5 text-xs font-mono border transition-all duration-150
                  ${hoveredToken === i ? 'scale-105 shadow-md z-10' : ''}`}
                style={{
                  backgroundColor: `${colors[i]}20`,
                  borderColor: `${colors[i]}60`,
                  color: colors[i],
                  fontWeight: hoveredToken === i ? 700 : 500,
                }}
                title={`Token ID: ${tokenIds[i]}`}
              >
                <span className="leading-tight">{JSON.stringify(tok)}</span>
                <span className="text-[10px] opacity-60">{tokenIds[i]}</span>
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2">
          Each colored chip is one token. The number below is its <strong>ID</strong> — an integer that indexes into the model vocabulary ({(50257).toLocaleString()} tokens for GPT-2).
        </p>
      </div>

      {/* Embeddings */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          Step 2 — Embedding Matrix · shape{' '}
          <code className="font-mono text-indigo-600 text-xs">[{tokenIds.length}, {EMBED_DIM}]</code>
          <span className="text-slate-400 font-normal text-xs ml-2">(2D float tensor)</span>
        </h3>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
          {/* Column headers */}
          <div className="flex items-center gap-0.5 mb-1 ml-20">
            {Array.from({ length: EMBED_DIM }, (_, d) => (
              <div key={d} className="text-[10px] font-mono text-slate-400 text-center" style={{ minWidth: '2.6rem' }}>
                dim {d}
              </div>
            ))}
            <div className="text-[10px] font-mono text-slate-400 ml-1">…</div>
          </div>

          {/* Row per token */}
          {loading ? (
            <div className="text-xs text-slate-400 animate-pulse py-4">Loading embeddings…</div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {tokenStrings.map((tok, i) => {
                const isHL = hoveredToken === i
                const embRow = embeddings[i] || []
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-0.5 rounded-lg transition-all duration-150 ${isHL ? 'bg-slate-50 scale-[1.01]' : ''}`}
                    onMouseEnter={() => setHoveredToken(i)}
                    onMouseLeave={() => setHoveredToken(null)}
                  >
                    {/* Token label */}
                    <div
                      className="text-[11px] font-mono text-center rounded-md px-1.5 py-1 mr-1 border flex-shrink-0 truncate"
                      style={{
                        backgroundColor: `${colors[i]}20`,
                        borderColor: `${colors[i]}50`,
                        color: colors[i],
                        minWidth: '4.5rem',
                        maxWidth: '4.5rem',
                      }}
                      title={tok}
                    >
                      {JSON.stringify(tok).slice(0, 7)}
                    </div>

                    {/* Embedding cells */}
                    {embRow.map((v, d) => (
                      <div
                        key={d}
                        className={`tensor-cell rounded text-[11px] flex items-center justify-center font-mono transition-all duration-100
                          ${isHL ? 'shadow-sm' : ''}`}
                        style={{
                          minWidth: '2.6rem',
                          minHeight: '2rem',
                          backgroundColor: `${colors[i]}${Math.round(15 + Math.abs(v) * 50).toString(16).padStart(2, '0')}`,
                          color: isHL ? colors[i] : '#475569',
                          fontWeight: isHL ? 600 : 400,
                        }}
                        title={`token: ${tok} | dim ${d} = ${v}`}
                      >
                        {v.toFixed(2)}
                      </div>
                    ))}
                    <div className="text-slate-300 text-xs px-1">…</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700">
          <strong>What are these numbers?</strong> Real embedding values are <em>learned during training</em> — they encode semantic meaning. The values shown here are deterministic pseudo-floats with the same structure. Hover a token chip above to highlight its row.
        </div>
      </div>

      <BatchDimBanner
        singleShape={`[${tokenIds.length || 'seq'}, ${EMBED_DIM}]`}
        batchShape={`[B, ${tokenIds.length || 'seq'}, ${EMBED_DIM}]`}
        description="A single sentence is [seq_len, embed_dim]. Feed a batch of B sentences simultaneously and the shape becomes [B, seq_len, embed_dim] — exactly what a Transformer encoder expects."
      />

      <CodePanel code={code} />
    </div>
  )
}
