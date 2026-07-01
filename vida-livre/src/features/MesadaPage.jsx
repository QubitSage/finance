import { useEffect, useState, useCallback } from 'react'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useActor } from '../contexts/ActorContext'
import { getSaldoConfig, getMovimentos, registrarMovimento } from '../lib/ledger'
import { fmtBRL, CONTEXTO, LADO_LABEL } from '../lib/constants'
import ContextoSelector from '../components/ContextoSelector'
import { EmptyState } from '../components/ui/primitives'

function SaldoCard({ lado, cfg }) {
  return (
    <div className="vl-card-highlight">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-vl-muted)]">{LADO_LABEL[lado]}</p>
      <p className="mt-1 text-3xl font-semibold text-[var(--color-vl-text)]">{fmtBRL(cfg?.saldo)}</p>
      {lado === 'esposa' && (
        <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{fmtBRL(cfg?.credito_ciclo)}/mês · acumula se sobrar</p>
      )}
    </div>
  )
}

export default function MesadaPage() {
  const { actor } = useActor()
  const [saldos, setSaldos] = useState({ marido: null, esposa: null })
  const [movimentos, setMovimentos] = useState([])
  const [tipo, setTipo] = useState('debito')
  const [form, setForm] = useState({ valor: '', contexto: 'sozinha', lado: 'esposa', nota: '' })
  const [adding, setAdding] = useState(false)

  const reload = useCallback(() => {
    getSaldoConfig().then(setSaldos)
    getMovimentos({ limit: 30 }).then(setMovimentos)
  }, [])

  useEffect(() => { reload() }, [reload])

  const submit = async () => {
    const valor = Number(form.valor)
    if (!valor || valor <= 0) return
    if (tipo === 'debito') {
      await registrarMovimento({
        tipo: 'debito', valor, contexto: form.contexto, origem: 'manual',
        categoria: null, nota: form.nota || null, registrado_por: actor,
      })
    } else {
      await registrarMovimento({
        tipo: 'credito', valor, lado: form.lado, origem: 'manual',
        categoria: null, nota: form.nota || null, registrado_por: actor,
      })
    }
    setForm({ valor: '', contexto: 'sozinha', lado: 'esposa', nota: '' })
    setAdding(false)
    reload()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SaldoCard lado="esposa" cfg={saldos.esposa} />
        <SaldoCard lado="marido" cfg={saldos.marido} />
      </div>

      {!adding && (
        <button className="vl-btn-primary w-full text-sm" onClick={() => setAdding(true)}>
          <Plus size={14} /> Registrar movimento
        </button>
      )}

      {adding && (
        <div className="vl-card space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              className={`vl-pill flex-1 ${tipo === 'debito' ? 'vl-pill-active' : 'vl-pill-inactive'}`}
              onClick={() => setTipo('debito')}
            >
              <TrendingDown size={14} className="inline" /> Gasto
            </button>
            <button
              type="button"
              className={`vl-pill flex-1 ${tipo === 'credito' ? 'vl-pill-active' : 'vl-pill-inactive'}`}
              onClick={() => setTipo('credito')}
            >
              <TrendingUp size={14} className="inline" /> Crédito
            </button>
          </div>

          <input
            className="vl-input"
            type="number"
            step="0.01"
            placeholder="Valor R$"
            value={form.valor}
            onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
          />

          {tipo === 'debito' ? (
            <ContextoSelector value={form.contexto} onChange={(contexto) => setForm((f) => ({ ...f, contexto }))} compact />
          ) : (
            <div className="flex gap-2">
              {['esposa', 'marido'].map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`vl-pill flex-1 ${form.lado === l ? 'vl-pill-active' : 'vl-pill-inactive'}`}
                  onClick={() => setForm((f) => ({ ...f, lado: l }))}
                >
                  {LADO_LABEL[l]}
                </button>
              ))}
            </div>
          )}

          <input
            className="vl-input"
            placeholder="Nota (opcional)"
            value={form.nota}
            onChange={(e) => setForm((f) => ({ ...f, nota: e.target.value }))}
          />

          <div className="flex gap-2">
            <button className="vl-btn-primary flex-1 text-sm" onClick={submit}>Salvar</button>
            <button className="vl-btn-ghost text-sm" onClick={() => setAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="vl-section-title">Movimentos recentes</p>
        {movimentos.length === 0 && (
          <EmptyState title="Nenhum movimento ainda" sub="Registre o primeiro acima." />
        )}
        {movimentos.map((m) => (
          <div key={m.id} className="vl-card flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--color-vl-text)]">
                {LADO_LABEL[m.lado]}
                {m.contexto && <span className={CONTEXTO[m.contexto].className}>{CONTEXTO[m.contexto].label}</span>}
              </p>
              {m.nota && <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]">{m.nota}</p>}
            </div>
            <span className={`text-sm font-semibold ${m.tipo === 'credito' ? 'text-[var(--color-vl-success)]' : 'text-[var(--color-vl-danger)]'}`}>
              {m.tipo === 'credito' ? '+' : '-'}{fmtBRL(m.valor)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
