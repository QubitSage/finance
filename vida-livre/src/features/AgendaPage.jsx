import { useMemo, useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarHeart, Plus, Trash2, Edit3, CheckCircle2, Sparkles } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useSession } from '../contexts/SessionContext'
import { STATUS_SAIDA, SHARE_NIVEL, TIPO_AGENDA } from '../lib/constants'
import { logActivity } from '../lib/activity'
import { consumeNavPreset } from '../lib/nav'
import { Badge, EmptyState, FilterPills } from '../components/ui/primitives'

const EMPTY = {
  titulo: '',
  data: '',
  hora: '',
  com_quem: '',
  local: '',
  status: 'planejado',
  share: 'resumo',
  notas: '',
  tipo: 'saida',
}

export default function AgendaPage() {
  const { isHer, user } = useSession()
  const scope = isHer ? 'mine' : 'hers-shared'
  const { data: saidas, insert, update, remove } = useScopedDB('saidas', { scope })
  const canEdit = isHer
  const [filter, setFilter] = useState('todas')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    const p = consumeNavPreset()
    if (p?.agendaTipo && canEdit) {
      setForm({ ...EMPTY, tipo: p.agendaTipo, titulo: p.agendaTipo === 'date' ? 'Date' : '' })
      setAdding(true)
    }
  }, [canEdit])

  const filtered = useMemo(() => {
    let rows = [...saidas]
    if (filter !== 'todas') rows = rows.filter((s) => s.status === filter)
    if (tipoFilter !== 'todos') rows = rows.filter((s) => (s.tipo || 'saida') === tipoFilter)
    return rows
  }, [saidas, filter, tipoFilter])

  const openNew = (tipo) => {
    setForm({ ...EMPTY, tipo, titulo: tipo === 'date' ? 'Date' : '' })
    setEditId(null)
    setAdding(true)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload = {
      ...form,
      tipo: form.tipo || 'saida',
      data: form.data || null,
      hora: form.hora || null,
      com_quem: form.com_quem || null,
      local: form.local || null,
      notas: form.notas || null,
    }
    if (editId) {
      update(editId, payload)
      setEditId(null)
    } else {
      insert(payload)
      const tipo = TIPO_AGENDA[payload.tipo] || TIPO_AGENDA.saida
      logActivity({
        tipo: payload.tipo === 'date' ? 'date_novo' : 'saida_nova',
        titulo: `Nova ${tipo.label.toLowerCase()}`,
        mensagem: payload.titulo,
        por: user,
        audience: 'partner',
      })
    }
    setForm(EMPTY)
    setAdding(false)
  }

  const startEdit = (s) => {
    setForm({
      titulo: s.titulo || '',
      data: s.data || '',
      hora: s.hora || '',
      com_quem: s.com_quem || '',
      local: s.local || '',
      status: s.status || 'planejado',
      share: s.share || 'resumo',
      notas: s.notas || '',
      tipo: s.tipo || 'saida',
    })
    setEditId(s.id)
    setAdding(true)
  }

  const upStatus = (s, st) => {
    update(s.id, { status: st })
    if (st === 'aconteceu' && !isHer) {
      logActivity({ tipo: 'agenda_aprovada', titulo: 'Agenda aprovada', mensagem: s.titulo, por: user, audience: 'her' })
    }
  }

  const tipoLabel = TIPO_AGENDA[form.tipo] || TIPO_AGENDA.saida

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          options={['todos', 'saida', 'date']}
          value={tipoFilter}
          onChange={setTipoFilter}
          labelFn={(f) => (f === 'todos' ? 'Todos' : TIPO_AGENDA[f]?.label || f)}
        />
        {canEdit && (
          <div className="flex gap-2">
            <button type="button" className="vl-btn-primary text-sm" onClick={() => openNew('saida')}>
              <Plus size={14} /> Saída
            </button>
            <button type="button" className="vl-btn-ghost border border-[var(--color-vl-warm)] text-sm text-[var(--color-vl-warm)]" onClick={() => openNew('date')}>
              <Plus size={14} /> Date
            </button>
          </div>
        )}
      </div>

      <FilterPills
        options={['todas', ...Object.keys(STATUS_SAIDA)]}
        value={filter}
        onChange={setFilter}
        labelFn={(f) => (f === 'todas' ? 'Todas' : STATUS_SAIDA[f]?.label)}
      />

      {!canEdit && (
        <p className="rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-accent-soft)] px-3 py-2 text-xs text-[var(--color-vl-accent)]">
          Saídas e dates compartilhados — ela prioriza sozinha e dates; casal só quando ela quiser (aviso prévio).
        </p>
      )}

      {canEdit && (
        <p className="rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-accent-soft)] px-3 py-2 text-xs text-[var(--color-vl-accent)]">
          Prioridade: sair sozinha e dates. Com ele só se você quiser — avisa bem antes.
        </p>
      )}

      {adding && canEdit && (
        <form onSubmit={submit} className="vl-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <CalendarHeart size={18} className="text-[var(--color-vl-accent)]" />
            {editId ? 'Editar' : 'Nova'} {tipoLabel.label.toLowerCase()}
          </h3>
          <div className="flex gap-2">
            {Object.entries(TIPO_AGENDA).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setForm((f) => ({ ...f, tipo: k }))}
                className={`vl-pill ${form.tipo === k ? 'vl-pill-active' : 'vl-pill-inactive'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <input
            required
            className="vl-input"
            placeholder={form.tipo === 'date' ? 'Com quem / título do date *' : 'Para onde / o quê *'}
            value={form.titulo}
            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="vl-input" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
            <input type="time" className="vl-input" value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} />
            <input
              className="vl-input"
              placeholder={form.tipo === 'date' ? 'Com quem' : 'Com quem (opcional)'}
              value={form.com_quem}
              onChange={(e) => setForm((f) => ({ ...f, com_quem: e.target.value }))}
            />
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
        <EmptyState icon={CalendarHeart} title="Agenda vazia" sub={canEdit ? 'Adicione uma saída ou um date acima' : 'Nada compartilhado ainda'} />
      )}

      <div className="space-y-3">
        {filtered.map((s) => {
          const st = STATUS_SAIDA[s.status] || STATUS_SAIDA.planejado
          const tipo = TIPO_AGENDA[s.tipo] || TIPO_AGENDA.saida
          return (
            <div key={s.id} className="vl-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge className={tipo.className}>{tipo.emoji} {tipo.label}</Badge>
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
                        <button type="button" onClick={() => upStatus(s, 'aconteceu')} className="vl-btn-icon text-[var(--color-vl-warning)]" title="Confirmar"><CheckCircle2 size={16} /></button>
                      )}
                      {s.status === 'aconteceu' && (
                        <button type="button" onClick={() => upStatus(s, 'realizado')} className="vl-btn-icon text-[var(--color-vl-success)]" title="Realizado"><Sparkles size={16} /></button>
                      )}
                      <button type="button" onClick={() => startEdit(s)} className="vl-btn-icon"><Edit3 size={15} /></button>
                      <button type="button" onClick={() => remove(s.id)} className="vl-btn-icon hover:text-[var(--color-vl-danger)]"><Trash2 size={15} /></button>
                    </>
                  )}
                  {!canEdit && s.status === 'planejado' && (
                    <button type="button" onClick={() => upStatus(s, 'aconteceu')} className="vl-btn-primary text-xs py-1 px-2">Aprovar</button>
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
