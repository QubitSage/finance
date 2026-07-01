export function Badge({ children, className = 'vl-badge-neutral' }) {
  return (
    <span className={className}>
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

export function IconTile({ icon: Icon, size = 16, className = 'vl-tone-accent', tileClassName = 'h-8 w-8' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-lg ${tileClassName} ${className}`}>
      <Icon size={size} />
    </span>
  )
}

export function ProgressRow({ label, icon, value, max, formatValue }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 text-[var(--color-vl-text)]">
          {icon && <IconTile icon={icon} size={14} className="vl-tone-neutral" tileClassName="h-6 w-6" />}
          {label}
        </span>
        <span className="text-[var(--color-vl-muted)]">
          {formatValue ? formatValue(value, max) : `${pct}%`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-vl-elevated)]">
        <div
          className="h-full rounded-full bg-[var(--color-vl-accent)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
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
