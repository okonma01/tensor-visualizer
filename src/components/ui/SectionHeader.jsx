/**
 * SectionHeader — consistent heading for each modality section.
 */
export default function SectionHeader({ emoji, title, subtitle, shape, dtype = 'torch.float32' }) {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex flex-wrap items-start gap-3 mb-2">
        <span className="text-3xl" aria-hidden="true">{emoji}</span>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-500 text-sm mt-0.5 max-w-2xl">{subtitle}</p>
        </div>
      </div>
      {shape && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-slate-500 font-medium">Tensor shape:</span>
          <code className="font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-sm font-semibold">
            {shape}
          </code>
          <span className="text-xs text-slate-400">dtype:</span>
          <code className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs">{dtype}</code>
        </div>
      )}
    </div>
  )
}
