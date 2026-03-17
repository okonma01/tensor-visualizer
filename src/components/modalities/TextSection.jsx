import { useState } from 'react'
import TensorGrid from '../ui/TensorGrid.jsx'
import CodePanel from '../ui/CodePanel.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { EMBED_DIM, TEXT_EXAMPLES, getEmbeddingMatrix } from '../../data/textData.js'
import { textCode } from '../../utils/tensorUtils.js'

export default function TextSection() {
  const [selectedId, setSelectedId] = useState(TEXT_EXAMPLES[0].id)

  const example = TEXT_EXAMPLES.find((item) => item.id === selectedId) ?? TEXT_EXAMPLES[0]
  const embedding = getEmbeddingMatrix(example.tokens)
  const code = textCode(example.tokens, EMBED_DIM)

  return (
    <section id="text" className="surface">
      <SectionHeader
        emoji="💬"
        title="Text Data"
        subtitle="Text is converted into token IDs first, then expanded into embedding vectors that a model can process."
        shape={`[${example.tokens.length}, ${EMBED_DIM}]`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="soft-panel">
            <p className="eyebrow mb-3">Choose a sentence</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {TEXT_EXAMPLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${item.id === example.id ? 'bg-[color:var(--accent-2)] text-white' : 'bg-white text-slate-600'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-lg font-bold text-slate-900">{example.text}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              The sentence is broken into token pieces, and each piece maps to an integer ID.
            </p>
          </div>

          <div className="soft-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">Token IDs</h3>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent-2)]">[{example.tokens.length}]</code>
            </div>
            <div className="flex flex-wrap gap-2">
              {example.pieces.map((piece, index) => (
                <div key={`${piece}-${index}`} className="rounded-2xl bg-white px-3 py-2 text-sm">
                  <span className="font-bold text-slate-700">{piece}</span>
                  <span className="ml-2 font-mono text-xs text-[color:var(--accent-2)]">{example.tokens[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="soft-panel overflow-x-auto">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Embedding tensor</h3>
                <p className="text-sm text-slate-500">Each token ID expands into a short learned vector.</p>
              </div>
              <code className="rounded-xl bg-white px-3 py-1 text-xs font-mono text-[color:var(--accent-2)]">[{example.tokens.length}, {EMBED_DIM}]</code>
            </div>
            <p className="mb-4 text-sm text-slate-500">Each token stays on its own row, and the embedding dimensions line up across that row.</p>
            <TensorGrid
              data={embedding}
              colorScale="purple"
              showIndices
              dimLabels={{ rows: 'tok', cols: 'dim' }}
              cellSize="sm"
            />
          </div>

          <div className="note-card text-sm leading-6">
            Text pipelines usually move from token IDs to embeddings, resulting in a tensor with shape <code className="font-mono">[sequence length, embedding dim]</code>.
          </div>
        </div>
      </div>

      <CodePanel code={code} />
    </section>
  )
}