import { useMemo, useState } from 'react'
import { Sparkles, Plus, Trash2, Edit3, CheckCircle2, Flame } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useSession } from '../contexts/SessionContext'
import { CAT_FANTASIA } from '../lib/constants'
import { Badge, EmptyState, FilterPills } from '../components/ui/primitives'

const EMPTY = { titulo: '', descricao: '', categoria: 'casal', status: 'sugerido', de_quem: 'Vianka', prioridade: 'media', realizado_em: '' }

export default function FantasiasPage() {
  const { user1, user2 } = useSession()
  const { data: items, insert, update, remove } = useScopedDB('fantasias', { scope: 'mine' })
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterCat, setFilterCat] = useState('todas')
  const [form, setForm] = useState({ ...EMPTY, de_quem: user2 })

  const filtered = useMemo(() => items.filter((i) => filterCat === 'todas' || i.categoria === filterCat), [items, filterCat])

  const submit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload = { ...form, descricao: form.descricao || null, realizado_em: form.realizado_em || null }
    if (editId) { update(editId, payload); setEditId(null) }
    else insert(payload)
    setForm({ ...EMPTY, de_quem: user2 }); setAdding(false)
  }

  const stats = useMemo(() => ({
    total: items.length,
    realizado: items.filter((i) => i.status === 'realizado').length,
    aprovado: items.filter((i) => i.status === 'aprovado').length,
    sugerido: items.filter((i) => i.status === 'sugerido').length,
  }), [items])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', val: stats.total, color: 'text-[var(--color-vl-text)]' },
            { label: 'Realizados', val: stats.realizado, color: 'text-emerald-300' },
            { label: 'Aprovados', val: stats.aprovado, color: 'text-cyan-300' },
            { label: 'Sugeridos', val: stats.sugerido, color: 'text-amber-300' },
          ].map((s) => (
            <div key={s.label} className="vl-card text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-[var(--color-vl-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills options={['todas', ...Object.keys(CAT_FANTASIA)]} value={filterCat} onChange={setFilterCat} labelFn={(f) => (f === 'todas' ? 'Todas' : CAT_FANTASIA[f]?.label)} />
        <button className="vl-btn-primary" onClick={() => { setAdding(true); setEditId(null); setForm({ ...EMPTY, de_quem: user2 }) }}>
          <Plus size={16} /> Nova fantasia
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="vl-card space-y-3">
          <h3 className="flex items-center gap-2 font-semibold"><Sparkles size={18} className="text-fuchsia-400" />{editId ? 'Editar' : 'Nova'} fantasia</h3>
          <input required className="vl-input" placeholder="Título *" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Descrição" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="vl-input" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
              {Object.entries(CAT_FANTASIA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className="vl-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="sugerido">Sugerido</option>
              <option value="aprovado">Aprovado</option>
              <option value="realizado">Realizado</option>
            </select>
            <select className="vl-input" value={form.de_quem} onChange={(e) => setForm((f) => ({ ...f, de_quem: e.target.value }))}>
              <option>{user2}</option>
              <option>{user1}</option>
              <option>Ambos</option>
            </select>
            <select className="vl-input" value={form.prioridade} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value }))}>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="vl-btn-ghost" onClick={() => { setAdding(false); setEditId(null) }}>Cancelar</button>
            <button type="submit" className="vl-btn-primary">Salvar</button>
          </div>
        </form>
      )}

      {filtered.length === 0 && !adding && <EmptyState icon={Sparkles} title="Nenhuma fantasia" sub="Guardem tudo o que sonham juntos" />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((item) => {
          const catCfg = CAT_FANTASIA[item.categoria] || CAT_FANTASIA.casal
          const isFeito = item.status === 'realizado'
          return (
            <div key={item.id} className={`vl-card ${isFeito ? 'opacity-70' : ''}`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={catCfg.className}>{catCfg.label}</Badge>
                  {isFeito && <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">✓ Realizado</Badge>}
                  {item.status === 'aprovado' && <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30">Aprovado</Badge>}
                </div>
                {item.prioridade === 'alta' && <Flame size={15} className="text-rose-400" />}
              </div>
              <p className={`font-semibold ${isFeito ? 'line-through text-[var(--color-vl-muted)]' : ''}`}>{item.titulo}</p>
              {item.descricao && <p className="mt-1 text-sm text-[var(--color-vl-muted)]">{item.descricao}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--color-vl-muted)]">Ideia de {item.de_quem}</span>
                <div className="flex gap-1">
                  {!isFeito && (
                    <button onClick={() => update(item.id, { status: 'realizado', realizado_em: new Date().toISOString().split('T')[0] })} className="vl-btn-icon text-emerald-400"><CheckCircle2 size={15} /></button>
                  )}
                  <button onClick={() => { setForm({ titulo: item.titulo || '', descricao: item.descricao || '', categoria: item.categoria || 'casal', status: item.status || 'sugerido', de_quem: item.de_quem || user2, prioridade: item.prioridade || 'media', realizado_em: item.realizado_em || '' }); setEditId(item.id); setAdding(true) }} className="vl-btn-icon"><Edit3 size={14} /></button>
                  <button onClick={() => remove(item.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
