import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookOpen, Plus, Trash2, Edit3, Heart, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { EmptyState } from '../components/ui/primitives'

const EMPTY = { titulo: '', data: '', com_quem: '', local: '', notas: '', aprendizado: '', estrelas: 3, vontade_repetir: true }

export default function RegistrosPage() {
  const { data: regs, insert, update, remove } = useScopedDB('registros', { scope: 'mine' })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [expandId, setExpandId] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const submit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload = { ...form, data: form.data || null, com_quem: form.com_quem || null, local: form.local || null, notas: form.notas || null, aprendizado: form.aprendizado || null }
    if (editId) { update(editId, payload); setEditId(null) }
    else insert(payload)
    setForm(EMPTY); setAdding(false)
  }

  const startEdit = (r) => {
    setForm({ titulo: r.titulo || '', data: r.data || '', com_quem: r.com_quem || '', local: r.local || '', notas: r.notas || '', aprendizado: r.aprendizado || '', estrelas: r.estrelas || 3, vontade_repetir: r.vontade_repetir ?? true })
    setEditId(r.id); setAdding(true)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex justify-end">
        <button className="vl-btn-primary" onClick={() => { setAdding(true); setEditId(null); setForm(EMPTY) }}>
          <Plus size={16} /> Novo registro
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="vl-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold"><BookOpen size={18} className="text-fuchsia-400" />{editId ? 'Editar' : 'Novo'} registro</h3>
          <input required className="vl-input" placeholder="Título *" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="vl-input" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
            <input className="vl-input" placeholder="Com quem" value={form.com_quem} onChange={(e) => setForm((f) => ({ ...f, com_quem: e.target.value }))} />
          </div>
          <input className="vl-input" placeholder="Local" value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={3} placeholder="O que aconteceu (privado)" value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Aprendizado / reflexão" value={form.aprendizado} onChange={(e) => setForm((f) => ({ ...f, aprendizado: e.target.value }))} />
          <div className="flex items-center justify-between">
            <div>
              <p className="vl-label">Estrelas</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, estrelas: n }))} className={`text-xl ${n <= form.estrelas ? 'text-amber-400' : 'text-stone-600'}`}>★</button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              Repetir?
              <button type="button" onClick={() => setForm((f) => ({ ...f, vontade_repetir: !f.vontade_repetir }))} className={`relative h-5 w-10 rounded-full transition-colors ${form.vontade_repetir ? 'bg-fuchsia-500' : 'bg-stone-600'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${form.vontade_repetir ? 'left-5' : 'left-0.5'}`} />
              </button>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="vl-btn-ghost" onClick={() => { setAdding(false); setEditId(null) }}>Cancelar</button>
            <button type="submit" className="vl-btn-primary">Salvar</button>
          </div>
        </form>
      )}

      {regs.length === 0 && !adding && <EmptyState icon={BookOpen} title="Nenhum registro" sub="Momentos guardados com privacidade" />}

      <div className="space-y-3">
        {regs.map((r) => {
          const expanded = expandId === r.id
          return (
            <div key={r.id} className="vl-card overflow-hidden p-0">
              <button type="button" onClick={() => setExpandId(expanded ? null : r.id)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.titulo}</span>
                      {r.vontade_repetir && <Heart size={13} className="fill-rose-400 text-rose-400" />}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-[var(--color-vl-muted)]">
                      {r.data && <span>{format(parseISO(r.data), 'dd/MM/yyyy', { locale: ptBR })}</span>}
                      {r.com_quem && <span>· {r.com_quem}</span>}
                      {r.estrelas && <span className="text-amber-400">{'★'.repeat(r.estrelas)}</span>}
                    </div>
                  </div>
                  {expanded ? <ChevronUp size={16} className="text-[var(--color-vl-muted)]" /> : <ChevronDown size={16} className="text-[var(--color-vl-muted)]" />}
                </div>
              </button>
              {expanded && (
                <div className="border-t border-[var(--color-vl-border)] px-4 pb-4">
                  {r.local && <p className="mt-3 text-sm text-[var(--color-vl-muted)]"><span className="font-medium text-[var(--color-vl-text)]">Local:</span> {r.local}</p>}
                  {r.notas && (
                    <div className="mt-3 rounded-xl bg-fuchsia-500/10 p-3">
                      <p className="mb-1 flex items-center gap-1 text-xs text-fuchsia-300"><Lock size={10} /> Privado</p>
                      <p className="text-sm italic">"{r.notas}"</p>
                    </div>
                  )}
                  {r.aprendizado && <p className="mt-3 text-sm text-[var(--color-vl-muted)]"><span className="font-medium">Reflexão:</span> {r.aprendizado}</p>}
                  <div className="mt-3 flex justify-end gap-2">
                    <button onClick={() => startEdit(r)} className="vl-btn-icon"><Edit3 size={15} /></button>
                    <button onClick={() => remove(r.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
