import { RITUAL_SAIDA } from '../lib/constants'
import { Badge } from './ui/primitives'

export default function RitualSaidaCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-br from-rose-950/50 via-fuchsia-950/40 to-[var(--color-vl-surface)] p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-rose-500/10 blur-2xl" />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-2xl">{RITUAL_SAIDA.emoji}</span>
          <h3 className="text-base font-semibold text-rose-100">{RITUAL_SAIDA.titulo}</h3>
          <Badge className="bg-rose-500/15 text-rose-200 text-[10px]">combinado</Badge>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-[var(--color-vl-muted)]">{RITUAL_SAIDA.intro}</p>

        <div className="space-y-3">
          {RITUAL_SAIDA.fases.map((fase, i) => (
            <div
              key={fase.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-200">
                  {i + 1}
                </span>
                <span className="text-lg leading-none">{fase.emoji}</span>
                <p className="font-medium text-fuchsia-100">{fase.titulo}</p>
              </div>
              <ul className="ml-8 space-y-1.5">
                {fase.itens.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-vl-muted)]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-400/80" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
