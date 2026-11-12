export default function SectionHeader({ emoji, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white text-2xl sm:h-14 sm:w-14 sm:text-3xl" aria-hidden="true">{emoji}</span>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-gray-900">{title}</h2>
          <p className="text-gray-700 text-sm sm:text-base mt-1 max-w-2xl leading-7">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
