import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Star, Plus, Trash2, Edit3 } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { EmptyState } from '../components/ui/primitives'

const CATS = {
  saida: { label: 'Saída sozinha', className: 'bg-rose-500/15 text-rose-300' },
  encontro: { label: 'Encontro', className: 'bg-pink-500/15 text-pink-300' },
  viagem: { label: 'Viagem solo', className: 'bg-indigo-500/15 text-indigo-300' },
  pessoal: { label: 'Pessoal', className: 'bg-emerald-500/15 text-emerald-300' },
  casal: { label: 'Do casal', className: 'bg-amber-500/15 text-amber-300' },
}

const EMPTY = { titulo: '', descricao: '', data_conquista: '', categoria: 'saida', nivel: 1, emoji: '🏆' }

export default function ElaPage() {
  const { data: conquistas, insert, update, remove } = useScopedDB('conquistas', { scope: 'mine', order: 'data_conquista', asc: false })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    if (editItem) { update(editItem.id, form); setEditItem(null) }
    else { insert(form); setShowForm(false) }
    setForm(EMPTY)
  }

  const totalNivel = conquistas.reduce((s, c) => s + (c.nivel || 1), 0)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="vl-card-glow text-center">
        <p className="text-4xl">👑</p>
        <p className="mt-2 text-2xl font-bold text-fuchsia-200">{totalNivel}</p>
        <p className="text-sm text-[var(--color-vl-muted)]">pontos de conquista</p>
      </div>

      <div className="flex justify-end">
        <button className="vl-btn-primary" onClick={() => { setShowForm(true); setEditItem(null); setForm(EMPTY) }}>
          <Plus size={16} /> Nova conquista
        </button>
      </div>

      {(showForm || editItem) && (
        <form onSubmit={submit} className="vl-card space-y-3">
          <div className="flex flex-wrap gap-1">
            {['🏆', '✨', '💎', '🌸', '🔥', '👑', '💫', '🦋'].map((e) => (
              <button key={e} type="button" onClick={() => set('emoji', e)} className={`rounded-lg p-1 text-lg ${form.emoji === e ? 'bg-fuchsia-500/30 ring-2 ring-fuchsia-400' : ''}`}>{e}</button>
            ))}
          </div>
          <input required className="vl-input" placeholder="Título *" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Descrição" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="vl-input" value={form.data_conquista} onChange={(e) => set('data_conquista', e.target.value)} />
            <select className="vl-input" value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
              {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <p className="vl-label">Nível (1–5)</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => set('nivel', n)} className={`text-xl ${n <= form.nivel ? 'text-amber-400' : 'text-stone-600'}`}>★</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="vl-btn-primary flex-1">Salvar</button>
            <button type="button" className="vl-btn-ghost" onClick={() => { setShowForm(false); setEditItem(null) }}>Cancelar</button>
          </div>
        </form>
      )}

      {conquistas.length === 0 && !showForm && <EmptyState icon={Star} title="Nenhuma conquista" sub="Registre os marcos e vitórias" />}

      <div className="space-y-3">
        {conquistas.map((c) => {
          const cat = CATS[c.categoria] || CATS.saida
          return (
            <div key={c.id} className="vl-card flex items-start gap-3">
              <span className="text-2xl">{c.emoji || '🏆'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{c.titulo}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${cat.className}`}>{cat.label}</span>
                  <span className="text-xs text-amber-400">{'★'.repeat(c.nivel || 1)}</span>
                </div>
                {c.descricao && <p className="mt-1 text-sm text-[var(--color-vl-muted)]">{c.descricao}</p>}
                {c.data_conquista && <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{format(parseISO(c.data_conquista), 'dd MMM yyyy', { locale: ptBR })}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setForm({ titulo: c.titulo || '', descricao: c.descricao || '', data_conquista: c.data_conquista || '', categoria: c.categoria || 'saida', nivel: c.nivel || 1, emoji: c.emoji || '🏆' }); setEditItem(c); setShowForm(true) }} className="vl-btn-icon"><Edit3 size={14} /></button>
                <button onClick={() => remove(c.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
