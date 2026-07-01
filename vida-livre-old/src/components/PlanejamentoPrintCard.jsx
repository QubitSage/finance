import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fmtBRL, VIES_PLANEJAMENTO, MIMO_CONTEXTO } from '../lib/constants'

const REGRAS_CARD = VIES_PLANEJAMENTO.filter((v) =>
  ['agenda', 'manutencao', 'looks', 'mesada'].includes(v.id)
)

export default function PlanejamentoPrintCard({ resumo, nome = 'Vianka' }) {
  const { mesada, categorias, totalReferencia } = resumo
  const metade1 = (categorias.find((c) => c.key === 'estetica')?.limite || 0)
    + (categorias.find((c) => c.key === 'looks')?.limite || 0)
  const metade2 = totalReferencia - metade1
  const hoje = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div
      className="planejamento-print-card mx-auto w-[794px] max-w-full overflow-hidden rounded-[28px] text-[#f0eaf8]"
      style={{
        background: 'linear-gradient(145deg, #1a0f2e 0%, #2d1b4e 35%, #1e1535 70%, #120a1f 100%)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}
    >
      {/* faixa decorativa */}
      <div
        className="h-2 w-full"
        style={{ background: 'linear-gradient(90deg, #e879f9, #a855f7, #22d3ee, #fb7185)' }}
      />

      <div className="px-10 pb-10 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300/90">
              Vida Livre
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-white">
              Planejamento
            </h1>
            <p className="mt-1 text-lg text-fuchsia-200/90">{nome}</p>
          </div>
          <div
            className="rounded-2xl px-4 py-3 text-right"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-[10px] uppercase tracking-wider text-[#8b7fa8]">Atualizado</p>
            <p className="text-sm font-medium text-[#f0eaf8]">{hoje}</p>
          </div>
        </div>

        {/* Mesada hero */}
        <div
          className="mt-8 rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(232,121,249,0.15) 0%, rgba(168,85,247,0.08) 100%)',
            border: '1px solid rgba(232,121,249,0.25)',
          }}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-rose-300/90">Mesada dela</p>
          <p className="mt-2 text-5xl font-bold tabular-nums text-rose-100">
            {fmtBRL(mesada.saldo)}
          </p>
          <p className="mt-3 text-base text-[#c4b5d8]">
            <strong className="text-fuchsia-200">{fmtBRL(mesada.credito_ciclo)}</strong> por mês · acumula se sobrar
          </p>
          <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-[10px] uppercase text-[#8b7fa8]">Referência</p>
              <p className="text-lg font-semibold text-fuchsia-200">
                {fmtBRL(metade1)} · {fmtBRL(metade2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#8b7fa8]">Total plano</p>
              <p className="text-lg font-semibold text-white">{fmtBRL(totalReferencia)}</p>
            </div>
          </div>
        </div>

        {/* Categorias grid */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          {categorias.map((cat) => (
            <div
              key={cat.key}
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <p className="text-base font-bold text-white">{cat.label}</p>
                  <p className="text-xs text-[#8b7fa8]">{cat.desc}</p>
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-fuchsia-200">
                {fmtBRL(cat.limite)}
              </p>
              <p className="mt-1 text-xs text-[#8b7fa8]">teto de referência / mês</p>
            </div>
          ))}
        </div>

        {/* Legenda Sozinha / Comigo */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {Object.entries(MIMO_CONTEXTO).map(([key, cfg]) => (
            <div
              key={key}
              className="rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-sm font-bold text-white">
                {cfg.emoji} {cfg.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#a89bb8]">{cfg.desc}</p>
              <p className="mt-2 text-xs font-medium text-fuchsia-300/90">{cfg.mesada}</p>
            </div>
          ))}
        </div>

        {/* Regras */}
        <div className="mt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
            Combinado · viés de planejamento
          </p>
          <div className="space-y-3">
            {REGRAS_CARD.map((r) => (
              <div key={r.id} className="flex gap-3">
                <span className="text-lg leading-none">{r.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{r.titulo}</p>
                  <p className="text-xs leading-relaxed text-[#a89bb8]">{r.regra}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-[#8b7fa8]"
        >
          <span>Vida Livre · nosso acordo</span>
          <span>💫 Sobra pro marido: axila no final do dia</span>
        </div>
      </div>
    </div>
  )
}
