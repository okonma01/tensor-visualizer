export default function TabNav({ tabs, active, onChange }) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto tab-scrollbar -mx-1 px-1"
      aria-label="Data modality navigation"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-all duration-200 border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
              isActive
                ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100',
            ].join(' ')}
            aria-selected={isActive}
            role="tab"
          >
            <span aria-hidden="true">{tab.emoji}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
