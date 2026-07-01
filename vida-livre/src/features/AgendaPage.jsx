import { useState } from 'react'
import { Plus, Trash2, Edit3, CalendarHeart, ChevronDown } from 'lucide-react'
import { useDB } from '../hooks/useDB'
import { useActor } from '../contexts/ActorContext'
import { ENCONTRO_TIPO, ENCONTRO_STATUS, CONTEXTO, RITUAL_ENCONTRO } from '../lib/constants'
import ContextoSelector from '../components/ContextoSelector'
import { FilterPills, EmptyState } from '../components/ui/primitives'

const EMPTY_FORM = { titulo: '', tipo: 'saida', contexto: 'sozinha', data: '', hora: '', com_quem: '', local: '', notas: '' }
const STATUS_FILTERS = ['todos', 'planejado', 'aconteceu', 'realizado', 'cancelado']

function RitualCard() {
  const [open, setOpen] = useState(false)
  return (
    <div className="vl-card">
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setOpen((o) => !o)}>
        <span className="vl-section-title mb-0">{RITUAL_ENCONTRO.titulo}</span>
        <ChevronDown size={16} className={`text-[var(--color-vl-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-[var(--color-vl-muted)]">{RITUAL_ENCONTRO.intro}</p>
          {RITUAL_ENCONTRO.fases.map((fase, i) => (
            <div key={fase.id} className="rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-elevated)] p-3">
              <p className="mb-1 flex items-center gap-2 font-medium text-[var(--color-vl-text)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-vl-warm-soft)] text-xs font-semibold text-[var(--color-vl-warm)]">{i + 1}</span>
                {fase.titulo}
              </p>
              <ul className="ml-7 space-y-1 text-xs text-[var(--color-vl-muted)]">
                {fase.itens.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AgendaPage() {
  const { actor } = useActor()
  const { data: encontros, insert, update, remove } = useDB('vl_encontros', { order: 'data', ascending: false })
  const [filter, setFilter] = useState('todos')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = filter === 'todos' ? encontros : encontros.filter((e) => e.status === filter)

  const startEdit = (e) => {
    setForm({
      titulo: e.titulo, tipo: e.tipo, contexto: e.contexto, data: e.data || '',
      hora: e.hora || '', com_quem: e.com_quem || '', local: e.local || '', notas: e.notas || '',
    })
    setEditingId(e.id)
    setAdding(true)
  }

  const submit = () => {
    if (!form.titulo.trim()) return
    const payload = { ...form, data: form.data || null, hora: form.hora || null }
    if (editingId) update(editingId, payload)
    else insert({ ...payload, status: 'planejado', criado_por: actor })
    setForm(EMPTY_FORM)
    setAdding(false)
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <RitualCard />

      <FilterPills options={STATUS_FILTERS} value={filter} onChange={setFilter} labelFn={(s) => s === 'todos' ? 'Todos' : ENCONTRO_STATUS[s]?.label || s} />

      {!adding && (
        <button className="vl-btn-primary w-full text-sm" onClick={() => { setForm(EMPTY_FORM); setAdding(true) }}>
          <Plus size={14} /> Novo encontro
        </button>
      )}

      {adding && (
        <div className="vl-card space-y-3">
          <input className="vl-input" placeholder="Título *" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          <div className="flex gap-2">
            {Object.entries(ENCONTRO_TIPO).map(([k, v]) => (
              <button key={k} type="button" className={`vl-pill flex-1 ${form.tipo === k ? 'vl-pill-active' : 'vl-pill-inactive'}`} onClick={() => setForm((f) => ({ ...f, tipo: k }))}>
                {v.label}
              </button>
            ))}
          </div>
          <ContextoSelector value={form.contexto} onChange={(contexto) => setForm((f) => ({ ...f, contexto }))} compact />
          <div className="grid grid-cols-2 gap-2">
            <input className="vl-input" type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
            <input className="vl-input" type="time" value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} />
          </div>
          <input className="vl-input" placeholder="Com quem" value={form.com_quem} onChange={(e) => setForm((f) => ({ ...f, com_quem: e.target.value }))} />
          <input className="vl-input" placeholder="Local" value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Notas" value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} />
          <div className="flex gap-2">
            <button className="vl-btn-primary flex-1 text-sm" onClick={submit}>Salvar</button>
            <button className="vl-btn-ghost text-sm" onClick={() => { setAdding(false); setEditingId(null) }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <EmptyState icon={CalendarHeart} title="Nenhum encontro aqui ainda" sub="Adicione o primeiro acima." />
        )}
        {filtered.map((e) => {
          const status = ENCONTRO_STATUS[e.status]
          return (
            <div key={e.id} className="vl-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--color-vl-text)]">{e.titulo}</span>
                    <span className={CONTEXTO[e.contexto].className}>{CONTEXTO[e.contexto].label}</span>
                    {status && <span className={status.className}>{status.label}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]">
                    {[e.data, e.hora, e.com_quem, e.local].filter(Boolean).join(' · ') || 'Sem detalhes ainda'}
                  </p>
                  {e.notas && <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{e.notas}</p>}
                </div>
                <div className="flex gap-1">
                  <button className="vl-btn-icon" onClick={() => startEdit(e)}><Edit3 size={13} /></button>
                  <button className="vl-btn-icon hover:text-[var(--color-vl-danger)]" onClick={() => remove(e.id)}><Trash2 size={13} /></button>
                </div>
              </div>
              {e.status === 'planejado' && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-vl-border)] pt-3">
                  <button className="vl-pill bg-[var(--color-vl-success-soft)] text-[var(--color-vl-success)]" onClick={() => update(e.id, { status: 'realizado' })}>Realizado</button>
                  <button className="vl-pill vl-pill-inactive" onClick={() => update(e.id, { status: 'cancelado' })}>Cancelar</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
