import { CONTEXTO } from '../lib/constants'

export function ContextoBadge({ contexto, size = 'sm' }) {
  const cfg = CONTEXTO[contexto]
  if (!cfg) return null
  return (
    <span className={`${cfg.className} ${size === 'xs' ? 'text-[10px] px-1.5 py-0' : ''}`}>
      {cfg.label}
    </span>
  )
}

export default function ContextoSelector({ value, onChange, compact = false }) {
  return (
    <div className="space-y-1.5">
      {!compact && <p className="vl-label">Com quem</p>}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CONTEXTO).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`vl-pill ${value === key ? 'vl-pill-active' : 'vl-pill-inactive'}`}
          >
            {cfg.label}
          </button>
        ))}
      </div>
      {value && !compact && (
        <p className="text-xs text-[var(--color-vl-muted)]">{CONTEXTO[value].desc}</p>
      )}
    </div>
  )
}
