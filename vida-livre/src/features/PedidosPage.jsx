import { useState } from 'react'
import { Plus, Trash2, Edit3, Check, X, Gift } from 'lucide-react'
import { useDB } from '../hooks/useDB'
import { useActor } from '../contexts/ActorContext'
import { registrarMovimento } from '../lib/ledger'
import { fmtBRL, PEDIDO_STATUS, PEDIDO_PRIORIDADE, PEDIDO_PERIODICIDADE, CONTEXTO } from '../lib/constants'
import ContextoSelector from '../components/ContextoSelector'
import { FilterPills, EmptyState } from '../components/ui/primitives'

const EMPTY_FORM = {
  titulo: '', descricao: '', categoria: '', valor: '', contexto: 'sozinha',
  recorrente: false, periodicidade: 'mensal', prioridade: 'media',
}

const FILTERS = ['todos', 'avulsos', 'recorrentes']

export default function PedidosPage() {
  const { actor } = useActor()
  const { data: pedidos, insert, update, remove } = useDB('vl_pedidos', { order: 'created_at', ascending: false })
  const [filter, setFilter] = useState('todos')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = pedidos.filter((p) => {
    if (filter === 'avulsos') return !p.recorrente
    if (filter === 'recorrentes') return p.recorrente
    return true
  })

  const startEdit = (p) => {
    setForm({
      titulo: p.titulo, descricao: p.descricao || '', categoria: p.categoria || '',
      valor: p.valor ?? '', contexto: p.contexto, recorrente: p.recorrente,
      periodicidade: p.periodicidade || 'mensal', prioridade: p.prioridade || 'media',
    })
    setEditingId(p.id)
    setAdding(true)
  }

  const submit = () => {
    if (!form.titulo.trim()) return
    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      categoria: form.categoria || null,
      valor: form.valor ? Number(form.valor) : null,
      contexto: form.contexto,
      recorrente: form.recorrente,
      periodicidade: form.recorrente ? form.periodicidade : null,
      prioridade: form.prioridade,
    }
    if (editingId) {
      update(editingId, payload)
    } else {
      insert({ ...payload, status: form.recorrente ? 'disponivel' : 'pendente', criado_por: actor })
    }
    setForm(EMPTY_FORM)
    setAdding(false)
    setEditingId(null)
  }

  const marcarRealizado = async (p) => {
    await update(p.id, { status: p.recorrente ? 'disponivel' : 'realizado', usado_mes: new Date().toISOString().slice(0, 7), respondido_por: actor })
    if (p.valor) {
      await registrarMovimento({
        contexto: p.contexto, tipo: 'debito', valor: p.valor, origem: 'pedido',
        origem_id: p.id, categoria: p.categoria, nota: p.titulo, registrado_por: actor,
      })
    }
  }

  const responder = (p, status) => update(p.id, { status, respondido_por: actor })

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <FilterPills options={FILTERS} value={filter} onChange={setFilter} labelFn={(f) => f.charAt(0).toUpperCase() + f.slice(1)} />

      {!adding && (
        <button className="vl-btn-primary w-full text-sm" onClick={() => { setForm(EMPTY_FORM); setAdding(true) }}>
          <Plus size={14} /> Novo pedido
        </button>
      )}

      {adding && (
        <div className="vl-card space-y-3">
          <input className="vl-input" placeholder="O que ela quer *" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Descrição (opcional)" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <input className="vl-input" placeholder="Categoria" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} />
            <input className="vl-input" type="number" step="0.01" placeholder="Valor R$" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} />
          </div>
          <ContextoSelector value={form.contexto} onChange={(contexto) => setForm((f) => ({ ...f, contexto }))} compact />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.recorrente} onChange={(e) => setForm((f) => ({ ...f, recorrente: e.target.checked }))} />
            Compromisso recorrente
          </label>
          {form.recorrente ? (
            <select className="vl-input" value={form.periodicidade} onChange={(e) => setForm((f) => ({ ...f, periodicidade: e.target.value }))}>
              {Object.entries(PEDIDO_PERIODICIDADE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          ) : (
            <select className="vl-input" value={form.prioridade} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value }))}>
              {Object.entries(PEDIDO_PRIORIDADE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          )}
          <div className="flex gap-2">
            <button className="vl-btn-primary flex-1 text-sm" onClick={submit}>Salvar</button>
            <button className="vl-btn-ghost text-sm" onClick={() => { setAdding(false); setEditingId(null) }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <EmptyState icon={Gift} title="Nenhum pedido aqui ainda" sub="Adicione o primeiro acima." />
        )}
        {filtered.map((p) => {
          const status = PEDIDO_STATUS[p.status]
          return (
            <div key={p.id} className="vl-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--color-vl-text)]">{p.titulo}</span>
                    <span className={CONTEXTO[p.contexto].className}>{CONTEXTO[p.contexto].label}</span>
                    {status && <span className={status.className}>{status.label}</span>}
                    {p.recorrente && <span className="vl-badge-neutral">{PEDIDO_PERIODICIDADE[p.periodicidade]?.label}</span>}
                  </div>
                  {p.descricao && <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]">{p.descricao}</p>}
                  {p.valor != null && <p className="mt-1 text-sm font-semibold text-[var(--color-vl-text)]">{fmtBRL(p.valor)}</p>}
                </div>
                <div className="flex gap-1">
                  <button className="vl-btn-icon" onClick={() => startEdit(p)}><Edit3 size={13} /></button>
                  <button className="vl-btn-icon hover:text-[var(--color-vl-danger)]" onClick={() => remove(p.id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-vl-border)] pt-3">
                {!p.recorrente && p.status === 'pendente' && (
                  <>
                    <button className="vl-pill bg-[var(--color-vl-success-soft)] text-[var(--color-vl-success)]" onClick={() => responder(p, 'aprovado')}>
                      <Check size={12} className="inline" /> Aprovar
                    </button>
                    <button className="vl-pill bg-[var(--color-vl-danger-soft)] text-[var(--color-vl-danger)]" onClick={() => responder(p, 'negado')}>
                      <X size={12} className="inline" /> Negar
                    </button>
                  </>
                )}
                {(p.recorrente || p.status === 'aprovado') && p.status !== 'realizado' && (
                  <button className="vl-pill bg-[var(--color-vl-accent-soft)] text-[var(--color-vl-accent)]" onClick={() => marcarRealizado(p)}>
                    {p.recorrente ? 'Marcar usado' : 'Marcar realizado'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
