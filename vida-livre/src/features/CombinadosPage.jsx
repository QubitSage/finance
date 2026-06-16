import { useMemo, useState } from 'react'
import { ShieldCheck, Plus, Trash2, Edit3 } from 'lucide-react'
import { useLocalDB } from '../hooks/useLocalDB'
import { CAT_COMBINADO } from '../lib/constants'
import { EmptyState } from '../components/ui/primitives'

const EMPTY = { categoria: 'permitido', texto: '', detalhes: '', revisado_em: '' }

export default function CombinadosPage() {
  const { data: items, insert, update, remove } = useLocalDB('combinados')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const grouped = useMemo(() => {
    const g = {}
    Object.keys(CAT_COMBINADO).forEach((k) => { g[k] = [] })
    items.forEach((item) => { if (g[item.categoria]) g[item.categoria].push(item) })
    return g
  }, [items])

  const submit = (e) => {
    e.preventDefault()
    if (!form.texto.trim()) return
    const data = { ...form, revisado_em: new Date().toISOString().split('T')[0] }
    if (editId) { update(editId, data); setEditId(null) }
    else insert(data)
    setForm(EMPTY); setAdding(false)
  }

  const startEdit = (item) => {
    setForm({ categoria: item.categoria || 'permitido', texto: item.texto || '', detalhes: item.detalhes || '', revisado_em: item.revisado_em || '' })
    setEditId(item.id); setAdding(true)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="vl-card flex items-start gap-3 border-amber-500/20 bg-amber-500/5">
        <ShieldCheck size={18} className="shrink-0 text-amber-400" />
        <p className="text-sm text-amber-200/80">Os combinados são os pilares da dinâmica de vocês. Mantenha sempre atualizados.</p>
      </div>

      <div className="flex justify-end">
        <button className="vl-btn-primary" onClick={() => { setAdding(true); setEditId(null); setForm(EMPTY) }}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="vl-card space-y-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CAT_COMBINADO).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, categoria: k }))}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all ${form.categoria === k ? 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200' : 'border-[var(--color-vl-border)] text-[var(--color-vl-muted)]'}`}>
                <span className={`h-2 w-2 rounded-full ${v.dot}`} />{v.label}
              </button>
            ))}
          </div>
          <input required className="vl-input" placeholder="O combinado *" value={form.texto} onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Detalhes / contexto" value={form.detalhes} onChange={(e) => setForm((f) => ({ ...f, detalhes: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <button type="button" className="vl-btn-ghost" onClick={() => { setAdding(false); setEditId(null) }}>Cancelar</button>
            <button type="submit" className="vl-btn-primary">Salvar</button>
          </div>
        </form>
      )}

      {items.length === 0 && !adding && <EmptyState icon={ShieldCheck} title="Nenhum combinado" sub="Adicione as regras e acordos da dinâmica" />}

      {Object.entries(grouped).map(([cat, catItems]) => {
        if (catItems.length === 0) return null
        const cfg = CAT_COMBINADO[cat]
        return (
          <div key={cat} className="vl-card">
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${cfg.dot}`} />
              <h3 className="font-semibold">{cfg.label} <span className="font-normal text-[var(--color-vl-muted)]">({catItems.length})</span></h3>
            </div>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className="group flex items-start gap-3">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{item.texto}</p>
                    {item.detalhes && <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]">{item.detalhes}</p>}
                    {item.revisado_em && <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]/60">Revisado em {item.revisado_em}</p>}
                  </div>
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <button onClick={() => startEdit(item)} className="vl-btn-icon"><Edit3 size={13} /></button>
                    <button onClick={() => remove(item.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
