import { useState } from 'react'

export default function CodePanel({ code, language = 'python' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-indigo-400 font-mono text-xs">PyTorch</span>
          <span className="text-slate-400 text-xs">— what this looks like in code</span>
        </span>
        <span className="text-slate-400 text-xs">{open ? '▲ hide' : '▼ show'}</span>
      </button>

      {open && (
        <div className="relative bg-slate-900">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-xs px-2.5 py-1 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors font-mono"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
          <pre className="text-sm text-slate-100 font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
