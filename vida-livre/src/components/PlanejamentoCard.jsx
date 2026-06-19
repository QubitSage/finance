import { fmtBRL } from '../lib/constants'

function metadesReferencia(categorias, totalReferencia) {
  const metade1 = (categorias.find((c) => c.key === 'estetica')?.limite || 0)
    + (categorias.find((c) => c.key === 'looks')?.limite || 0)
  return { metade1, metade2: totalReferencia - metade1 }
}

function EtapasGrid({ categorias, compact }) {
  return (
    <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {categorias.map((cat) => (
        <div
          key={cat.key}
          className={`rounded-xl border border-white/10 bg-white/5 ${compact ? 'p-3' : 'p-4'}`}
        >
          <div className="flex items-start gap-2">
            <span className="text-xl leading-none">{cat.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-fuchsia-100">{cat.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-vl-muted)]">{cat.desc}</p>
            </div>
          </div>
          <p className={`mt-3 font-bold tabular-nums text-rose-200 ${compact ? 'text-xl' : 'text-2xl'}`}>
            {fmtBRL(cat.limite)}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--color-vl-muted)]">
            teto de referência / mês
          </p>
          {cat.gasto > 0 && (
            <p className="mt-2 text-xs text-[var(--color-vl-muted)]">
              Usado: {fmtBRL(cat.gasto)} · Resta {fmtBRL(cat.restante)}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function PlanejamentoCard({ resumo, compact = false, mode = 'full' }) {
  const { mesada, categorias, totalReferencia } = resumo
  const { metade1, metade2 } = metadesReferencia(categorias, totalReferencia)
  const showSaldo = mode === 'full'

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/80 via-violet-950/60 to-[var(--color-vl-surface)] ${compact ? 'p-4' : 'p-6'}`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-violet-500/10 blur-xl" />

      <div className="relative space-y-5">
        {showSaldo && (
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
              <p className="text-sm font-semibold text-fuchsia-200">
                {fmtBRL(metade1)} · {fmtBRL(metade2)}
              </p>
              <p className="text-[10px] text-[var(--color-vl-muted)]">= {fmtBRL(totalReferencia)}</p>
            </div>
          </div>
        )}

        <section>
          <h3 className={`font-semibold text-fuchsia-200 ${compact ? 'mb-2 text-sm' : 'mb-3 text-base'}`}>
            {showSaldo ? 'Quanto pode gastar em cada etapa' : 'Referência do mês — por etapa'}
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-[var(--color-vl-muted)]">
            Os R$ {totalReferencia.toLocaleString('pt-BR')} do ciclo divididos assim — use no seu ritmo; o saldo acumula.
          </p>
          <EtapasGrid categorias={categorias} compact={compact} />
        </section>

        {showSaldo && (
          <div className={`space-y-3 ${compact ? 'mt-3' : ''}`}>
            <p className="text-xs font-medium text-[var(--color-vl-muted)]">Gasto no mês (por etapa)</p>
            {categorias.map((cat) => {
              const pct = cat.limite ? Math.min(100, (cat.gasto / cat.limite) * 100) : 0
              return (
                <div key={cat.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>{cat.emoji}</span> {cat.label}
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
        )}
      </div>
    </div>
  )
}
