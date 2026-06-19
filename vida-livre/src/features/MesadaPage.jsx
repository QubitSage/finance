import { useEffect, useState } from 'react'
import { Wallet, FileImage } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'
import { useLocalDB } from '../hooks/useLocalDB'
import { getMesadaResumo, ensureMesadaCredit, registrarMovimento, getMesadaOrcamento } from '../lib/mesada'
import { fmtBRL } from '../lib/constants'
import { subscribe } from '../lib/storage'
import PlanejamentoCard from '../components/PlanejamentoCard'
import MesadaConfigPanel from '../components/MesadaConfigPanel'
import PlanejamentoExportModal from '../components/PlanejamentoExportModal'

export default function MesadaPage() {
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
    </div>
  )
}
