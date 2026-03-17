/**
 * BatchDimBanner — shows how adding the batch dimension changes the tensor shape.
 * singleShape: string e.g. "[30, 4]"
 * batchShape:  string e.g. "[1, 30, 4]"
 * description: optional string
 */
import { useState } from 'react'

export default function BatchDimBanner({ singleShape, batchShape, description }) {
  const [showBatch, setShowBatch] = useState(false)

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-700 font-medium">Batch dimension:</span>
          <code className="font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">
            {showBatch ? batchShape : singleShape}
          </code>
          {showBatch && (
            <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
              +1 dim added
            </span>
          )}
        </div>
        <button
          onClick={() => setShowBatch((v) => !v)}
          className="ml-auto text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
            bg-amber-200 text-amber-900 hover:bg-amber-300"
        >
          {showBatch ? '← Remove batch dim' : '+ Add batch dim'}
        </button>
      </div>
      {description && (
        <p className="text-xs text-amber-700 mt-2 leading-relaxed">{description}</p>
      )}
      {showBatch && (
        <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
          In PyTorch models always expect a <strong>batch dimension</strong> as the first axis —
          even when you pass a single sample, you wrap it: <code className="font-mono bg-white px-1 rounded text-[11px]">tensor.unsqueeze(0)</code>
        </p>
      )}
    </div>
  )
}
