import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { MIMO_CONTEXTO } from '../lib/constants'
import { Badge } from './ui/primitives'

export function MimoContextoBadge({ contexto, size = 'sm' }) {
  if (!contexto || !MIMO_CONTEXTO[contexto]) return null
  const cfg = MIMO_CONTEXTO[contexto]
  return (
    <Badge className={`${cfg.className} ${size === 'xs' ? 'text-[10px] px-1.5 py-0' : ''}`}>
      {cfg.label}
    </Badge>
  )
}

export function ContextoSelector({ value, onChange, compact = false }) {
  return (
    <div className="space-y-1.5">
      {!compact && <p className="vl-label">Para quem / contexto</p>}
      <div className="flex flex-wrap gap-2">
        {Object.entries(MIMO_CONTEXTO).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-xl border px-3 py-2 text-left text-xs transition-all ${
              value === key
                ? 'border-transparent ' + cfg.className.replace('vl-badge-', 'vl-tone-')
                : 'border-[var(--color-vl-border)] bg-[var(--color-vl-elevated)] text-[var(--color-vl-muted)]'
            }`}
          >
            <span className="font-semibold">{cfg.label}</span>
            {!compact && <span className="mt-0.5 block font-normal opacity-80">{cfg.short}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MimosLegenda() {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-[var(--color-vl-border)] bg-[var(--color-vl-surface)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-vl-text)]">
          <Info size={15} className="text-[var(--color-vl-muted)]" />
          Legenda
        </span>
        <span className="flex items-center gap-2">
          <MimoContextoBadge contexto="sozinha" size="xs" />
          <MimoContextoBadge contexto="comigo" size="xs" />
          <ChevronDown size={16} className={`text-[var(--color-vl-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-[var(--color-vl-border)] px-4 pb-4 pt-3">
          {Object.entries(MIMO_CONTEXTO).map(([key, cfg]) => (
            <div key={key} className={`rounded-xl p-3 ${cfg.className.replace('vl-badge-', 'vl-tone-')}`}>
              <p className="font-semibold">
                {cfg.label}
                <span className="ml-2 font-normal opacity-70">· {cfg.short}</span>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed opacity-90">{cfg.desc}</p>
              <p className="mt-2 text-xs font-medium opacity-75">Mesada: {cfg.mesada}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
