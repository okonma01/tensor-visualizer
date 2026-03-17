export default function SectionHeader({ emoji, title, subtitle, shape }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/80 text-2xl shadow-sm sm:h-14 sm:w-14 sm:text-3xl" aria-hidden="true">{emoji}</span>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-slate-900">{title}</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl leading-7">{subtitle}</p>
        </div>
      </div>
      {shape && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Tensor shape</span>
          <code className="font-mono text-[color:var(--accent-2)] bg-[#eef2ff] px-2.5 py-1 rounded-xl font-semibold">
            {shape}
          </code>
          <span className="text-slate-400">dtype</span>
          <code className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-xl text-xs">torch.float32</code>
        </div>
      )}
    </div>
  )
}
