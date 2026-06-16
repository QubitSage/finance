import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Edit3 } from 'lucide-react'
import { useLocalDB } from '../hooks/useLocalDB'
import { useSettings } from '../hooks/useSettings'
import { updateSettings } from '../lib/storage'
import { SIM_CORES, fmtBRL } from '../lib/constants'

export default function SimulacaoPage({
  catCollection,
  itemCollection,
  rendaKey,
  seed,
  emptyTitulo,
  emptySub,
  emptyEmoji = '💸',
  rendaLabel,
  embedded = false,
}) {
  const { settings } = useSettings()
  const { data: categorias, insert: insertCat, update: updateCat, remove: removeCat } = useLocalDB(catCollection, { order: 'ordem', asc: true })
  const { data: todosItens, insert: insertItem, update: updateItem, remove: removeItem } = useLocalDB(itemCollection, { order: 'ordem', asc: true })

  const renda = settings[rendaKey] || ''
  const setRenda = (v) => updateSettings({ [rendaKey]: v })

  const [expandedCats, setExpandedCats] = useState({})
  const [addingCat, setAddingCat] = useState(false)
  const [editCatId, setEditCatId] = useState(null)
  const [catForm, setCatForm] = useState({ nome: '', emoji: '📋', cor: 'stone' })
  const [addingItemIn, setAddingItemIn] = useState(null)
  const [itemForm, setItemForm] = useState({ nome: '', valor: '' })
  const [editItemId, setEditItemId] = useState(null)
  const [editItemForm, setEditItemForm] = useState({ nome: '', valor: '' })

  const itensPorCat = useMemo(() => {
    const map = {}
    categorias.forEach((c) => { map[c.id] = [] })
    todosItens.forEach((item) => { if (map[item.categoria_id]) map[item.categoria_id].push(item) })
    return map
  }, [categorias, todosItens])

  const totalPorCat = useMemo(() => {
    const t = {}
    Object.entries(itensPorCat).forEach(([id, items]) => {
      t[id] = items.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0)
    })
    return t
  }, [itensPorCat])

  const totalGeral = Object.values(totalPorCat).reduce((s, v) => s + v, 0)
  const rendaNum = parseFloat(String(renda).replace(',', '.')) || 0
  const sobra = rendaNum - totalGeral
  const pct = rendaNum > 0 ? Math.min(100, Math.round((totalGeral / rendaNum) * 100)) : 0

  const toggleCat = (id) => setExpandedCats((p) => ({ ...p, [id]: !(p[id] ?? true) }))

  const seedData = async () => {
    if (!seed?.length || categorias.length > 0) return
    for (const block of seed) {
      const cat = insertCat({ ...block.cat, ordem: block.cat.ordem })
      block.itens.forEach((raw, idx) => {
        const item = typeof raw === 'string' ? { nome: raw, valor: 0 } : raw
        insertItem({ categoria_id: cat.id, nome: item.nome, valor: parseFloat(item.valor) || 0, ordem: idx })
      })
    }
  }

  const handleSaveCat = () => {
    if (!catForm.nome.trim()) return
    if (editCatId) { updateCat(editCatId, catForm); setEditCatId(null) }
    else { insertCat({ ...catForm, ordem: categorias.length }); setAddingCat(false) }
    setCatForm({ nome: '', emoji: '📋', cor: 'stone' })
  }

  const handleSaveItem = (catId) => {
    if (!itemForm.nome.trim()) return
    insertItem({ categoria_id: catId, nome: itemForm.nome, valor: parseFloat(itemForm.valor) || 0, ordem: (itensPorCat[catId] || []).length })
    setItemForm({ nome: '', valor: '' })
    setAddingItemIn(null)
  }

  if (categorias.length === 0) {
    return (
      <div className={`flex flex-col items-center gap-5 py-10 text-center ${embedded ? '' : 'mx-auto max-w-md py-16'}`}>
        <div className="text-6xl">{emptyEmoji}</div>
        <div>
          <p className="text-xl font-bold">{emptyTitulo}</p>
          <p className="mt-2 text-sm text-[var(--color-vl-muted)]">{emptySub}</p>
        </div>
        <button onClick={seedData} className="vl-btn-primary w-full">Começar com categorias prontas</button>
        <button onClick={() => setAddingCat(true)} className="vl-btn-ghost w-full">Criar do zero</button>
        {addingCat && (
          <div className="vl-card w-full space-y-3 text-left">
            <input className="vl-input" placeholder="Nome da categoria" value={catForm.nome} onChange={(e) => setCatForm((f) => ({ ...f, nome: e.target.value }))} />
            <button onClick={handleSaveCat} className="vl-btn-primary w-full">Criar</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={embedded ? 'space-y-4' : 'mx-auto max-w-2xl space-y-4'}>
      <div className="vl-card-glow">
        <label className="vl-label">{rendaLabel}</label>
        <input className="vl-input text-lg font-semibold" type="number" step="0.01" placeholder="0,00" value={renda} onChange={(e) => setRenda(e.target.value)} />
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div><p className="text-xs text-[var(--color-vl-muted)]">Total</p><p className="font-bold text-rose-300">{fmtBRL(totalGeral)}</p></div>
          <div><p className="text-xs text-[var(--color-vl-muted)]">Sobra</p><p className={`font-bold ${sobra >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>{fmtBRL(sobra)}</p></div>
          <div><p className="text-xs text-[var(--color-vl-muted)]">Uso</p><p className="font-bold text-violet-300">{pct}%</p></div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-vl-elevated)]">
          <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => setAddingCat(true)} className="vl-btn-ghost text-xs"><Plus size={14} /> Categoria</button>
      </div>

      {addingCat && (
        <div className="vl-card space-y-3">
          <input className="vl-input" placeholder="Nome" value={catForm.nome} onChange={(e) => setCatForm((f) => ({ ...f, nome: e.target.value }))} />
          <div className="flex gap-2">
            {Object.keys(SIM_CORES).map((k) => (
              <button key={k} type="button" onClick={() => setCatForm((f) => ({ ...f, cor: k }))} className={`h-5 w-5 rounded-full ${SIM_CORES[k].dot} ${catForm.cor === k ? 'ring-2 ring-white' : ''}`} />
            ))}
          </div>
          <button onClick={handleSaveCat} className="vl-btn-primary w-full">Salvar categoria</button>
        </div>
      )}

      {categorias.map((cat) => {
        const cor = SIM_CORES[cat.cor] || SIM_CORES.stone
        const items = itensPorCat[cat.id] || []
        const expanded = expandedCats[cat.id] ?? true
        return (
          <div key={cat.id} className="vl-card overflow-hidden p-0">
            <button type="button" onClick={() => toggleCat(cat.id)} className="flex w-full items-center justify-between p-4 text-left">
              <div className="flex items-center gap-2">
                <span>{cat.emoji || '📋'}</span>
                <span className={`font-semibold ${cor.header}`}>{cat.nome}</span>
                <span className="text-sm text-[var(--color-vl-muted)]">({items.length})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{fmtBRL(totalPorCat[cat.id] || 0)}</span>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {expanded && (
              <div className="border-t border-[var(--color-vl-border)] px-4 pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 border-b border-[var(--color-vl-border)]/50 py-2 last:border-0">
                    {editItemId === item.id ? (
                      <div className="flex flex-1 gap-2">
                        <input className="vl-input flex-1 text-sm" value={editItemForm.nome} onChange={(e) => setEditItemForm((f) => ({ ...f, nome: e.target.value }))} />
                        <input className="vl-input w-24 text-sm" type="number" value={editItemForm.valor} onChange={(e) => setEditItemForm((f) => ({ ...f, valor: e.target.value }))} />
                        <button onClick={() => { updateItem(item.id, { nome: editItemForm.nome, valor: parseFloat(editItemForm.valor) || 0 }); setEditItemId(null) }} className="vl-btn-primary text-xs px-2">OK</button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm">{item.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{fmtBRL(parseFloat(item.valor) || 0)}</span>
                          <button onClick={() => { setEditItemId(item.id); setEditItemForm({ nome: item.nome, valor: item.valor || '' }) }} className="vl-btn-icon"><Edit3 size={12} /></button>
                          <button onClick={() => removeItem(item.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={12} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {addingItemIn === cat.id ? (
                  <div className="mt-2 flex gap-2">
                    <input className="vl-input flex-1 text-sm" placeholder="Item" value={itemForm.nome} onChange={(e) => setItemForm((f) => ({ ...f, nome: e.target.value }))} />
                    <input className="vl-input w-24 text-sm" type="number" placeholder="R$" value={itemForm.valor} onChange={(e) => setItemForm((f) => ({ ...f, valor: e.target.value }))} />
                    <button onClick={() => handleSaveItem(cat.id)} className="vl-btn-primary text-xs px-3">+</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingItemIn(cat.id)} className="mt-2 text-xs text-fuchsia-300 hover:text-fuchsia-200">+ Adicionar item</button>
                )}
                <button onClick={() => removeCat(cat.id)} className="mt-3 text-xs text-rose-400">Excluir categoria</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
