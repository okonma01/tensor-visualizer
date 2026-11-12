import { useState } from 'react'

export default function CodePanel({ code }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-5 surface overflow-hidden p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-white/60 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-gray-200/80 px-2.5 py-1 font-mono text-[14px] text-[color:var(--accent-2)]">PyTorch</span>
          <span className="text-gray-700 text-s">how this looks in code</span>
        </span>
        <span className="rounded-full border border-[color:var(--line)] bg-white px-2.5 py-1 text-gray-600 text-xs">{open ? 'hide' : 'show'}</span>
      </button>

      {open && (
        <div className="relative border-t border-[color:var(--line)] bg-gray-800">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-200 hover:bg-white/20 transition-colors font-mono"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
          <pre className="text-sm text-gray-100 p-4 overflow-x-auto leading-7 whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
