import { useState } from 'react'
import { useDB } from '../hooks/useDB'
import { Camera, Plus, X, Edit3, Trash2, Heart, Star, MapPin, Calendar, Tag, Smile } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const fmt = (v) => v ? new Date(v+'T12:00:00').toLocaleDateString('pt-BR') : '—'
const CAT = {
  viagem:      { label: 'Viagem ✈️',      color: 'bg-blue-100 text-blue-700' },
  date:        { label: 'Date ❤️',         color: 'bg-rose-100 text-rose-700' },
  conquista:   { label: 'Conquista 🏆',    color: 'bg-amber-100 text-amber-700' },
  cotidiano:   { label: 'Cotidiano 🏠',    color: 'bg-emerald-100 text-emerald-700' },
  aniversario: { label: 'Aniversário 🎂',  color: 'bg-violet-100 text-violet-700' },
  especial:    { label: 'Especial ⭐',     color: 'bg-pink-100 text-pink-700' },
  outro:       { label: 'Outro',           color: 'bg-stone-100 text-stone-600' },
}
function Badge({ children, className='' }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}
function Card({ children, className='' }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 ${className}`}>{children}</div>
}
function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-stone-300" strokeWidth={1.5} />
      </div>
      <p className="font-medium text-stone-500 mb-1">{title}</p>
      <p className="text-sm text-stone-400">{desc}</p>
    </div>
  )
}
const iCls = { backgroundColor:'#fff', color:'#1c1917', border:'1px solid #d6d3d1', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', width:'100%', outline:'none' }

export function MemoriasPage() {
  const { data: memorias, loading, insert, update, remove } = useDB('memorias_casal', { order:'data_memoria', asc:false })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filterCat, setFilterCat] = useState('todas')
  const [expandedId, setExpandedId] = useState(null)
  const empty = { titulo:'', data_memoria:'', local:'', categoria:'especial', descricao:'', emoji:'❤️', favorita:false, url_foto:'' }
  const [form, setForm] = useState(empty)
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const handleSubmit = async () => {
    if (!form.titulo.trim()) return
    const payload = {
      titulo: form.titulo,
      data_memoria: form.data_memoria || null,
      local: form.local || null,
      categoria: form.categoria,
      descricao: form.descricao || null,
      emoji: form.emoji || '❤️',
      favorita: form.favorita,
      url_foto: form.url_foto || null,
    }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else await insert(payload)
    setForm(empty); setShowForm(false)
  }
  const startEdit = (m) => {
    setForm({ titulo:m.titulo, data_memoria:m.data_memoria||'', local:m.local||'', categoria:m.categoria||'especial', descricao:m.descricao||'', emoji:m.emoji||'❤️', favorita:!!m.favorita, url_foto:m.url_foto||'' })
    setEditItem(m); setShowForm(true)
  }
  const toggleFav = (m) => update(m.id, { favorita: !m.favorita })

  const filtered = filterCat === 'todas' ? memorias : filterCat === 'favoritas' ? memorias.filter(m=>m.favorita) : memorias.filter(m=>m.categoria===filterCat)
  const favCount = memorias.filter(m=>m.favorita).length

  const EMOJIS = ['❤️','🌟','✈️','🎉','🏖️','🌅','🥂','💃','🎂','📸','🌸','🤩','💫','🏔️','🌊']

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <PageHeader icon={Camera} title="Memórias" subtitle="O álbum da nossa história juntos 📸" />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-stone-800">{memorias.length}</p>
          <p className="text-xs text-stone-400">Memórias</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-rose-500">{favCount}</p>
          <p className="text-xs text-stone-400">Favoritas ❤️</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{new Set(memorias.map(m=>m.local).filter(Boolean)).size}</p>
          <p className="text-xs text-stone-400">Lugares</p>
        </Card>
      </div>

      {/* Filters + Add */}
      <div className="flex gap-2 flex-wrap items-center">
        {['todas','favoritas',...Object.keys(CAT)].map(k => (
          <button key={k} onClick={() => setFilterCat(k)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat===k ? 'bg-amber-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
            {k==='todas' ? 'Todas' : k==='favoritas' ? '❤️ Favoritas' : CAT[k]?.label}
          </button>
        ))}
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(empty) }}
          className="ml-auto flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
          <Plus className="w-4 h-4" /> Memória
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar' : 'Nova Memória'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => set('emoji',e)}
                    className={`text-xl p-1 rounded-lg transition-all ${form.emoji===e ? 'bg-amber-100 scale-125' : 'hover:bg-stone-100'}`}>{e}</button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Título *</label>
              <input style={iCls} value={form.titulo} onChange={e=>set('titulo',e.target.value)} placeholder="Nossa primeira viagem, Pedido de casamento..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Data</label>
              <input type="date" style={iCls} value={form.data_memoria} onChange={e=>set('data_memoria',e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoria</label>
              <select style={iCls} value={form.categoria} onChange={e=>set('categoria',e.target.value)}>
                {Object.entries(CAT).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Local</label>
              <input style={iCls} value={form.local} onChange={e=>set('local',e.target.value)} placeholder="Paris, Restaurante XYZ, Nossa casa..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Link de foto (opcional)</label>
              <input style={iCls} value={form.url_foto} onChange={e=>set('url_foto',e.target.value)} placeholder="https://link-da-foto.com..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">O que foi esse momento?</label>
              <textarea style={{...iCls,resize:'none'}} rows={3} value={form.descricao} onChange={e=>set('descricao',e.target.value)} placeholder="Descreva como foi, o que sentiram, o que foi especial..." />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="fav" checked={form.favorita} onChange={e=>set('favorita',e.target.checked)} className="w-4 h-4 accent-rose-500" />
              <label htmlFor="fav" className="text-sm text-stone-600">Marcar como favorita ❤️</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Guardar Memória'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}

      {/* Grid */}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        filtered.length === 0 ? <EmptyState icon={Camera} title="Nenhuma memória ainda" desc="Guarde os momentos especiais de vocês dois" /> :
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(m => {
            const cat = CAT[m.categoria] || CAT['outro']
            const isExpanded = expandedId === m.id
            return (
              <Card key={m.id} className="overflow-hidden">
                {m.url_foto && (
                  <div className="w-full h-40 bg-stone-100 overflow-hidden">
                    <img src={m.url_foto} alt={m.titulo} className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{m.emoji || '❤️'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-stone-800">{m.titulo}</span>
                          <Badge className={cat.color}>{cat.label}</Badge>
                          {m.favorita && <span className="text-rose-500 text-sm">❤️</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                          {m.data_memoria && <span>📅 {fmt(m.data_memoria)}</span>}
                          {m.local && <span>📍 {m.local}</span>}
                        </div>
                        {m.descricao && (
                          <p className={`text-sm text-stone-600 mt-2 italic ${isExpanded ? '' : 'line-clamp-2'}`}>
                            "{m.descricao}"
                          </p>
                        )}
                        {m.descricao && m.descricao.length > 100 && (
                          <button onClick={() => setExpandedId(isExpanded ? null : m.id)}
                            className="text-xs text-amber-500 mt-1 hover:underline">
                            {isExpanded ? 'Ver menos' : 'Ver mais'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => toggleFav(m)} className={`p-1 transition-colors ${m.favorita ? 'text-rose-500' : 'text-stone-300 hover:text-rose-400'}`}>
                        <Heart className="w-4 h-4" fill={m.favorita ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => startEdit(m)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(m.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      }
    </div>
  )
}
export default MemoriasPage
