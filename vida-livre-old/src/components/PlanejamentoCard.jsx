import { Sparkles, Shirt, Heart, Car } from 'lucide-react'
import { fmtBRL } from '../lib/constants'
import { IconTile } from './ui/primitives'

const CAT_ICONS = { Sparkles, Shirt, Heart, Car }

function metadesReferencia(categorias, totalReferencia) {
  const metade1 = (categorias.find((c) => c.key === 'estetica')?.limite || 0)
    + (categorias.find((c) => c.key === 'looks')?.limite || 0)
  return { metade1, metade2: totalReferencia - metade1 }
}

function EtapasGrid({ categorias, compact }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {categorias.map((cat) => {
        const Icon = CAT_ICONS[cat.icon]
        return (
          <div
            key={cat.key}
            className={`rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-elevated)] ${compact ? 'p-3' : 'p-4'}`}
          >
            <div className="flex items-start gap-2">
              {Icon && <IconTile icon={Icon} className={cat.className} />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--color-vl-text)]">{cat.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-vl-muted)]">{cat.desc}</p>
              </div>
            </div>
            <p className={`mt-3 font-semibold tabular-nums text-[var(--color-vl-text)] ${compact ? 'text-xl' : 'text-2xl'}`}>
              {fmtBRL(cat.limite)}
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-[var(--color-vl-muted)]">
              teto de referência / mês
            </p>
            {cat.gasto > 0 && (
              <p className="mt-2 text-xs text-[var(--color-vl-muted)]">
                Usado: {fmtBRL(cat.gasto)} · Resta {fmtBRL(cat.restante)}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PlanejamentoCard({ resumo, compact = false, mode = 'full' }) {
  const { mesada, categorias, totalReferencia } = resumo
  const { metade1, metade2 } = metadesReferencia(categorias, totalReferencia)
  const showSaldo = mode === 'full'

  return (
    <div className={`vl-card-highlight ${compact ? 'p-4' : 'p-6'}`}>
      <div className="space-y-5">
        {showSaldo && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-vl-muted)]">Mesada dela</p>
              <p className={`font-semibold text-[var(--color-vl-text)] ${compact ? 'text-2xl' : 'text-4xl'}`}>
                {fmtBRL(mesada.saldo)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-vl-muted)]">
                {fmtBRL(mesada.credito_ciclo)}/mês · acumula se sobrar
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-elevated)] px-3 py-2 text-right">
              <p className="text-xs uppercase text-[var(--color-vl-muted)]">Referência</p>
              <p className="text-sm font-semibold text-[var(--color-vl-text)]">
                {fmtBRL(metade1)} · {fmtBRL(metade2)}
              </p>
              <p className="text-xs text-[var(--color-vl-muted)]">= {fmtBRL(totalReferencia)}</p>
            </div>
          </div>
        )}

        <section>
          <h3 className={`vl-section-title ${compact ? 'mb-2 text-sm' : 'mb-3 text-base'}`}>
            {showSaldo ? 'Quanto pode gastar em cada etapa' : 'Referência do mês — por etapa'}
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-[var(--color-vl-muted)]">
            Os R$ {totalReferencia.toLocaleString('pt-BR')} do ciclo divididos assim — use no seu ritmo; o saldo acumula.
          </p>
          <EtapasGrid categorias={categorias} compact={compact} />
        </section>

        {showSaldo && (
          <div className={`space-y-4 ${compact ? 'mt-3' : ''}`}>
            <p className="text-xs font-medium text-[var(--color-vl-muted)]">Gasto no mês (por etapa)</p>
            {categorias.map((cat) => {
              const Icon = CAT_ICONS[cat.icon]
              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--color-vl-text)]">
                      {Icon && <Icon size={14} />} {cat.label}
                    </span>
                    <span className="tabular-nums text-[var(--color-vl-muted)]">
                      {fmtBRL(cat.gasto)} / {fmtBRL(cat.limite)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-vl-elevated)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-vl-accent)] transition-all"
                      style={{ width: `${cat.limite ? Math.min(100, (cat.gasto / cat.limite) * 100) : 0}%` }}
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
