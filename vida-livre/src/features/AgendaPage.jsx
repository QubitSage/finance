import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarHeart, Plus, Trash2, Edit3, CheckCircle2, Sparkles } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useSession } from '../contexts/SessionContext'
import { STATUS_SAIDA, SHARE_NIVEL } from '../lib/constants'
import { Badge, EmptyState, FilterPills } from '../components/ui/primitives'

const EMPTY = { titulo: '', data: '', hora: '', com_quem: '', local: '', status: 'planejado', share: 'resumo', notas: '' }

export default function AgendaPage() {
  const { isHer } = useSession()
  const scope = isHer ? 'mine' : 'hers-shared'
  const { data: saidas, insert, update, remove } = useScopedDB('saidas', { scope })
  const canEdit = isHer
  const [filter, setFilter] = useState('todas')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const filtered = useMemo(() => {
    if (filter === 'todas') return saidas
    return saidas.filter((s) => s.status === filter)
  }, [saidas, filter])

  const submit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload = { ...form, data: form.data || null, hora: form.hora || null, com_quem: form.com_quem || null, local: form.local || null, notas: form.notas || null }
    if (editId) { update(editId, payload); setEditId(null) }
    else insert(payload)
    setForm(EMPTY); setAdding(false)
  }

  const startEdit = (s) => {
    setForm({ titulo: s.titulo || '', data: s.data || '', hora: s.hora || '', com_quem: s.com_quem || '', local: s.local || '', status: s.status || 'planejado', share: s.share || 'resumo', notas: s.notas || '' })
    setEditId(s.id); setAdding(true)
  }

  const upStatus = (s, st) => update(s.id, { status: st })

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          options={['todas', ...Object.keys(STATUS_SAIDA)]}
          value={filter}
          onChange={setFilter}
          labelFn={(f) => (f === 'todas' ? 'Todas' : STATUS_SAIDA[f]?.label)}
        />
        <button className="vl-btn-primary" onClick={() => { setAdding(true); setEditId(null); setForm(EMPTY) }} disabled={!canEdit}>
          <Plus size={16} /> Nova saída
        </button>
      </div>

      {!canEdit && (
        <p className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
          Visão compartilhada — só ela vê e edita a agenda completa. Aqui aparecem saídas não privadas.
        </p>
      )}

      {adding && canEdit && (
        <form onSubmit={submit} className="vl-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold"><CalendarHeart size={18} className="text-fuchsia-400" />{editId ? 'Editar' : 'Nova'} saída</h3>
          <input required className="vl-input" placeholder="Título *" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="vl-input" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
            <input type="time" className="vl-input" value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} />
            <input className="vl-input" placeholder="Com quem" value={form.com_quem} onChange={(e) => setForm((f) => ({ ...f, com_quem: e.target.value }))} />
            <input className="vl-input" placeholder="Local / App" value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="vl-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {Object.entries(STATUS_SAIDA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className="vl-input" value={form.share} onChange={(e) => setForm((f) => ({ ...f, share: e.target.value }))}>
              {Object.entries(SHARE_NIVEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <textarea className="vl-input resize-none" rows={2} placeholder="Notas (privado)" value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <button type="button" className="vl-btn-ghost" onClick={() => { setAdding(false); setEditId(null) }}>Cancelar</button>
            <button type="submit" className="vl-btn-primary">Salvar</button>
          </div>
        </form>
      )}

      {filtered.length === 0 && !adding && (
        <EmptyState icon={CalendarHeart} title="Nenhuma saída" sub="Adicione sua primeira saída acima" />
      )}

      <div className="space-y-3">
        {filtered.map((s) => {
          const st = STATUS_SAIDA[s.status] || STATUS_SAIDA.planejado
          return (
            <div key={s.id} className="vl-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold truncate">{s.titulo}</span>
                    <Badge className={st.className}>{st.label}</Badge>
                    <span className="text-xs text-[var(--color-vl-muted)]">{(SHARE_NIVEL[s.share] || SHARE_NIVEL.privado).label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-[var(--color-vl-muted)]">
                    {s.data && <span>{format(parseISO(s.data), 'dd/MM/yyyy', { locale: ptBR })}{s.hora ? ` às ${s.hora}` : ''}</span>}
                    {s.com_quem && <span>· {s.com_quem}</span>}
                    {s.local && <span>· {s.local}</span>}
                  </div>
                  {s.notas && <p className="mt-2 text-xs italic text-[var(--color-vl-muted)]">"{s.notas}"</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  {canEdit && (
                    <>
                  {s.status === 'planejado' && (
                    <button onClick={() => upStatus(s, 'aconteceu')} className="vl-btn-icon text-amber-400" title="Aprovar"><CheckCircle2 size={16} /></button>
                  )}
                  {s.status === 'aconteceu' && (
                    <button onClick={() => upStatus(s, 'realizado')} className="vl-btn-icon text-emerald-400" title="Realizado"><Sparkles size={16} /></button>
                  )}
                  <button onClick={() => startEdit(s)} className="vl-btn-icon"><Edit3 size={15} /></button>
                  <button onClick={() => remove(s.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={15} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
