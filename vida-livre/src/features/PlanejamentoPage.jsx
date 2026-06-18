import { useEffect, useState } from 'react'
import { Map, HelpCircle, ChevronRight, Plus, Wallet, Sparkles } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'
import { useLocalDB } from '../hooks/useLocalDB'
import { useScopedDB } from '../hooks/useScopedDB'
import { getMesadaResumo, ensureMesadaCredit, registrarMovimento } from '../lib/mesada'
import {
  VIES_PLANEJAMENTO, VIES_PERGUNTAS_ABERTAS, PROXIMOS_PASSOS,
  MESADA_ORCAMENTO, fmtBRL,
} from '../lib/constants'
import { subscribe } from '../lib/storage'
import { setNavPreset } from '../lib/nav'
import PlanejamentoCard from '../components/PlanejamentoCard'
import { Badge } from '../components/ui/primitives'

export default function PlanejamentoPage({ onNavigate }) {
  const { user, isHer, isPartner } = useSession()
  const [, tick] = useState(0)
  const { data: questions } = useScopedDB('questionario', { scope: 'couple' })
  const { data: movimentos } = useLocalDB('mesada_movimentos', { order: 'created_at', asc: false })

  useEffect(() => subscribe(() => tick((n) => n + 1)), [])
  useEffect(() => { ensureMesadaCredit(); tick((n) => n + 1) }, [])

  const resumo = getMesadaResumo()
  const abertas = questions.filter((q) => q.categoria === 'planejamento' && !(q.respostas || []).some((r) => r.de && r.de !== user))
  const abertasCount = questions.filter((q) => q.categoria === 'planejamento' && (q.respostas || []).length === 0).length

  const [showMov, setShowMov] = useState(false)
  const [movForm, setMovForm] = useState({ tipo: 'debito', valor: '', bucket: 'estetica', nota: '' })

  const submitMov = (e) => {
    e.preventDefault()
    if (!movForm.valor || !isPartner) return
    registrarMovimento({ ...movForm, por: user })
    setMovForm({ tipo: 'debito', valor: '', bucket: 'estetica', nota: '' })
    setShowMov(false)
    tick((n) => n + 1)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PlanejamentoCard resumo={resumo} />

      {isPartner && (
        <div className="flex gap-2">
          <button type="button" className="vl-btn-primary flex-1 text-sm" onClick={() => setShowMov(true)}>
            <Wallet size={14} /> Registrar gasto / crédito
          </button>
        </div>
      )}

      {showMov && isPartner && (
        <form onSubmit={submitMov} className="vl-card space-y-3">
          <div className="flex gap-2">
            {['debito', 'credito'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMovForm((f) => ({ ...f, tipo: t }))}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium ${movForm.tipo === t ? 'bg-fuchsia-500/25 text-fuchsia-200' : 'bg-[var(--color-vl-elevated)] text-[var(--color-vl-muted)]'}`}
              >
                {t === 'debito' ? 'Descontar' : 'Creditar'}
              </button>
            ))}
          </div>
          <input required type="number" step="0.01" className="vl-input" placeholder="Valor R$" value={movForm.valor} onChange={(e) => setMovForm((f) => ({ ...f, valor: e.target.value }))} />
          <select className="vl-input" value={movForm.bucket} onChange={(e) => setMovForm((f) => ({ ...f, bucket: e.target.value }))}>
            {Object.entries(MESADA_ORCAMENTO).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
          <input className="vl-input" placeholder="Nota (opcional)" value={movForm.nota} onChange={(e) => setMovForm((f) => ({ ...f, nota: e.target.value }))} />
          <div className="flex gap-2">
            <button type="submit" className="vl-btn-primary flex-1">Salvar</button>
            <button type="button" className="vl-btn-ghost" onClick={() => setShowMov(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fuchsia-200">
          <Map size={16} /> Viés de planejamento
        </h3>
        <div className="space-y-2">
          {VIES_PLANEJAMENTO.map((v) => (
            <div key={v.id} className="vl-card border-emerald-500/20">
              <p className="flex items-center gap-2 font-medium">
                <span>{v.emoji}</span> {v.titulo}
                <Badge className="bg-emerald-500/15 text-emerald-300 text-[10px]">ativo</Badge>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-vl-muted)]">{v.regra}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-200">
            <HelpCircle size={16} /> Em aberto — aguardando ela
          </h3>
          {abertasCount > 0 && (
            <button type="button" onClick={() => { setNavPreset({ questionarioFilter: 'planejamento' }); onNavigate?.('em-aberto') }} className="text-xs text-amber-300 hover:underline">
              Ver todas ({abertasCount})
            </button>
          )}
        </div>
        <div className="space-y-2">
          {VIES_PERGUNTAS_ABERTAS.map((p) => (
            <div key={p.id} className="vl-card border-amber-500/30 border-dashed bg-amber-500/5">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-200">
                <span>{p.emoji}</span> {p.titulo}
                <Badge className="bg-amber-500/15 text-amber-300 text-[10px]">aberto</Badge>
              </p>
              {p.contexto && <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{p.contexto}</p>}
              <p className="mt-2 text-sm italic text-amber-100/90">{p.pergunta}</p>
            </div>
          ))}
        </div>
        {isHer && abertas.length > 0 && (
          <button type="button" onClick={() => { setNavPreset({ questionarioFilter: 'planejamento' }); onNavigate?.('em-aberto') }} className="vl-btn-primary mt-3 w-full text-sm">
            Responder perguntas <ChevronRight size={14} className="inline" />
          </button>
        )}
      </section>

      {movimentos.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-vl-muted)]">Movimentos recentes</h3>
          <div className="space-y-1">
            {movimentos.slice(0, 8).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-[var(--color-vl-elevated)] px-3 py-2 text-xs">
                <span className="truncate">{m.nota || (m.tipo === 'debito' ? 'Desconto' : 'Crédito')}</span>
                <span className={m.tipo === 'debito' ? 'text-rose-300' : 'text-emerald-300'}>
                  {m.tipo === 'debito' ? '−' : '+'}{fmtBRL(m.valor)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="vl-card border-[var(--color-vl-border)] opacity-80">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-vl-muted)]">
          <Sparkles size={14} /> Próximos passos
        </h3>
        <div className="space-y-2">
          {PROXIMOS_PASSOS.map((p) => (
            <div key={p.titulo} className="flex items-start gap-3 rounded-xl bg-[var(--color-vl-elevated)] px-3 py-2">
              <span className="text-lg">{p.emoji}</span>
              <div>
                <p className="text-sm font-medium">{p.titulo}</p>
                <p className="text-xs text-[var(--color-vl-muted)]">{p.desc}</p>
              </div>
              <Badge className="ml-auto shrink-0 bg-stone-500/15 text-stone-400 text-[10px]">em breve</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
