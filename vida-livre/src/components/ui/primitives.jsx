export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="mb-3 text-[var(--color-vl-muted)] opacity-40" />}
      <p className="font-medium text-[var(--color-vl-text)]">{title}</p>
      {sub && <p className="mt-1 max-w-xs text-sm text-[var(--color-vl-muted)]">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function FilterPills({ options, value, onChange, labelFn = (v) => v }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const key = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? labelFn(opt) : opt.label
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`vl-pill ${value === key ? 'vl-pill-active' : 'vl-pill-inactive'}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
