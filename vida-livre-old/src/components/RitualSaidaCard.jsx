import { RITUAL_SAIDA } from '../lib/constants'
import { Badge } from './ui/primitives'

export default function RitualSaidaCard() {
  return (
    <section className="vl-card-highlight p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-[var(--color-vl-text)]">{RITUAL_SAIDA.titulo}</h3>
        <Badge className="vl-badge-warm">combinado</Badge>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-[var(--color-vl-muted)]">{RITUAL_SAIDA.intro}</p>

      <div className="space-y-3">
        {RITUAL_SAIDA.fases.map((fase, i) => (
          <div
            key={fase.id}
            className="rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-elevated)] p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-vl-warm-soft)] text-xs font-semibold text-[var(--color-vl-warm)]">
                {i + 1}
              </span>
              <p className="font-medium text-[var(--color-vl-text)]">{fase.titulo}</p>
            </div>
            <ul className="ml-8 space-y-1.5">
              {fase.itens.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-vl-muted)]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-vl-warm)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
