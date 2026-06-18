import { useEffect, useState } from 'react'
import { Map, HelpCircle, Wallet, Sparkles, FileImage } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'
import { useLocalDB } from '../hooks/useLocalDB'
import { getMesadaResumo, ensureMesadaCredit, registrarMovimento, getMesadaOrcamento } from '../lib/mesada'
import {
  VIES_PLANEJAMENTO, VIES_ACORDOS_RESPONDIDOS, PROXIMOS_PASSOS, fmtBRL,
} from '../lib/constants'
import { subscribe } from '../lib/storage'
import { setNavPreset } from '../lib/nav'
import PlanejamentoCard from '../components/PlanejamentoCard'
import MesadaConfigPanel from '../components/MesadaConfigPanel'
import PlanejamentoExportModal from '../components/PlanejamentoExportModal'
import { Badge } from '../components/ui/primitives'

export default function PlanejamentoPage({ onNavigate }) {
  const { user, isPartner, user2 } = useSession()
  const [, tick] = useState(0)
  const { data: movimentos } = useLocalDB('mesada_movimentos', { order: 'created_at', asc: false })
  const orcamento = getMesadaOrcamento()

  useEffect(() => subscribe(() => tick((n) => n + 1)), [])
  useEffect(() => { ensureMesadaCredit(); tick((n) => n + 1) }, [])

  const resumo = getMesadaResumo()

  const [showMov, setShowMov] = useState(false)
  const [showExport, setShowExport] = useState(false)
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

      <button
        type="button"
        onClick={() => setShowExport(true)}
        className="vl-btn-primary w-full text-sm"
      >
        <FileImage size={16} /> Gerar card para imprimir / salvar
      </button>

      <PlanejamentoExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        resumo={resumo}
        nome={user2}
      />

      {isPartner && (
        <>
          <MesadaConfigPanel onSaved={() => tick((n) => n + 1)} />

          <div className="flex gap-2">
            <button type="button" className="vl-btn-primary flex-1 text-sm" onClick={() => setShowMov(true)}>
              <Wallet size={14} /> Registrar gasto / crédito
            </button>
          </div>
        </>
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
            {Object.entries(orcamento).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
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
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
            <HelpCircle size={16} /> Combinado — respostas dela
          </h3>
          <button type="button" onClick={() => { setNavPreset({ questionarioFilter: 'planejamento' }); onNavigate?.('em-aberto') }} className="text-xs text-emerald-300 hover:underline">
            Ver no questionário
          </button>
        </div>
        <div className="space-y-2">
          {VIES_ACORDOS_RESPONDIDOS.map((p) => (
            <div key={p.id} className="vl-card border-emerald-500/25 bg-emerald-500/5">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <span>{p.emoji}</span> {p.titulo}
                <Badge className="bg-emerald-500/15 text-emerald-300 text-[10px]">respondido</Badge>
              </p>
              <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{p.pergunta}</p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/95">{p.resposta}</p>
            </div>
          ))}
        </div>
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
