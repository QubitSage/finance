import { fmtBRL } from '../lib/constants'

export default function PlanejamentoCard({ resumo, compact = false }) {
  const { mesada, categorias, totalReferencia } = resumo

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/80 via-violet-950/60 to-[var(--color-vl-surface)] ${compact ? 'p-4' : 'p-6'}`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-violet-500/10 blur-xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-fuchsia-300/80">Mesada dela</p>
            <p className={`font-bold text-rose-200 ${compact ? 'text-2xl' : 'text-4xl'}`}>
              {fmtBRL(mesada.saldo)}
            </p>
            <p className="mt-1 text-xs text-[var(--color-vl-muted)]">
              {fmtBRL(mesada.credito_ciclo)}/mês · acumula se sobrar
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
            <p className="text-[10px] uppercase text-[var(--color-vl-muted)]">Referência</p>
            <p className="text-sm font-semibold text-fuchsia-200">R$1.000 · R$1.000</p>
            <p className="text-[10px] text-[var(--color-vl-muted)]">= {fmtBRL(totalReferencia)}</p>
          </div>
        </div>

        <div className={`mt-5 space-y-3 ${compact ? 'mt-3' : ''}`}>
          {categorias.map((cat) => {
            const pct = cat.limite ? Math.min(100, (cat.gasto / cat.limite) * 100) : 0
            return (
              <div key={cat.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span>{cat.emoji}</span> {cat.label}
                    {!compact && <span className="font-normal text-[var(--color-vl-muted)]">· {cat.desc}</span>}
                  </span>
                  <span className="tabular-nums text-[var(--color-vl-muted)]">
                    {fmtBRL(cat.gasto)} / {fmtBRL(cat.limite)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-vl-elevated)]">
                  <div
                    className={`h-full rounded-full transition-all ${cat.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
