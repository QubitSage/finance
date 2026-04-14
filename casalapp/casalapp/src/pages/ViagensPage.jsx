import { useState } from 'react'
import { useDB } from '../hooks/useDB'
import {
  Globe, Plus, X, MapPin, Calendar, DollarSign,
  Heart, CheckCircle2, Circle, Star, Plane,
  Edit3, Trash2, Package, List,
  Sparkles, Clock, Users, FileText, Tag,
  Luggage, Camera, ChevronDown, ChevronUp
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const fmt = (v) => v ? new Date(v + 'T12:00:00').toLocaleDateString('pt-BR') : '—'
const fmtMoney = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_COLORS = {
  sonho: 'bg-purple-100 text-purple-700',
  planejando: 'bg-amber-100 text-amber-700',
  confirmada: 'bg-blue-100 text-blue-700',
  realizada: 'bg-emerald-100 text-emerald-700',
  cancelada: 'bg-red-100 text-red-700',
}
const STATUS_LABELS = {
  sonho: 'Sonho',
  planejando: 'Planejando',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}
const TIPO_LABELS = {
  casal: 'A dois',
  grupo: 'Em grupo',
  solo: 'Solo',
  familia: 'Família',
}

function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}
function Card({ children, className = '' }) {
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

const inputCls = {
  backgroundColor: '#ffffff', color: '#1c1917',
  border: '1px solid #d6d3d1', borderRadius: '8px',
  padding: '8px 12px', fontSize: '14px', width: '100%', outline: 'none'
}
const selCls = { ...inputCls }

// ── TAB VIAGENS ─────────────────────────────────────────────────────────────
function TabViagens() {
  const { data: viagens, loading, insert, update, remove } = useDB('viagens_lista', { order: 'created_at', asc: false })
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('todas')
  const [editItem, setEditItem] = useState(null)
  const emptyForm = { destino: '', pais: '', data_ida: '', data_volta: '', orcamento: '', status: 'sonho', tipo: 'casal', notas: '' }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.destino.trim()) return
    const payload = {
      destino: form.destino,
      pais: form.pais || null,
      data_ida: form.data_ida || null,
      data_volta: form.data_volta || null,
      orcamento: form.orcamento ? parseFloat(form.orcamento) : null,
      status: form.status,
      tipo: form.tipo,
      notas: form.notas || null,
    }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  const startEdit = (v) => {
    setForm({ destino: v.destino||'', pais: v.pais||'', data_ida: v.data_ida||'', data_volta: v.data_volta||'', orcamento: v.orcamento||'', status: v.status||'sonho', tipo: v.tipo||'casal', notas: v.notas||'' })
    setEditItem(v); setShowForm(true)
  }

  const filtered = filterStatus === 'todas' ? viagens : viagens.filter(v => v.status === filterStatus)
  const totalOrcamento = viagens.filter(v => v.status !== 'cancelada').reduce((s, v) => s + Number(v.orcamento || 0), 0)
  const realizadas = viagens.filter(v => v.status === 'realizada').length
  const proxima = viagens.filter(v => v.status === 'confirmada' && v.data_ida).sort((a,b) => a.data_ida.localeCompare(b.data_ida))[0]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xl font-bold text-stone-800">{viagens.length}</p>
          <p className="text-xs text-stone-400 mt-0.5">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{realizadas}</p>
          <p className="text-xs text-stone-400 mt-0.5">Realizadas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-base font-bold text-amber-600">{fmtMoney(totalOrcamento)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Orçamento total</p>
        </Card>
      </div>
      {proxima && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">✈️ Próxima viagem confirmada</p>
              <p className="font-semibold text-stone-800">{proxima.destino}</p>
              <p className="text-xs text-stone-500">{fmt(proxima.data_ida)}{proxima.data_volta ? ` → ${fmt(proxima.data_volta)}` : ''}</p>
            </div>
          </div>
        </Card>
      )}
      <div className="flex gap-2 flex-wrap items-center">
        {['todas','sonho','planejando','confirmada','realizada'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white text-stone-500 border border-stone-200 hover:border-amber-300'}`}>
            {s === 'todas' ? 'Todas' : STATUS_LABELS[s]}
          </button>
        ))}
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          className="ml-auto flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nova
        </button>
      </div>
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar Viagem' : 'Nova Viagem'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Destino *</label>
              <input style={inputCls} value={form.destino} onChange={e => set('destino', e.target.value)} placeholder="Paris, Bali, Porto Alegre..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">País / Região</label>
              <input style={inputCls} value={form.pais} onChange={e => set('pais', e.target.value)} placeholder="França, Brasil..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Orçamento (R$)</label>
              <input type="number" style={inputCls} value={form.orcamento} onChange={e => set('orcamento', e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Data de Ida</label>
              <input type="date" style={inputCls} value={form.data_ida} onChange={e => set('data_ida', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Data de Volta</label>
              <input type="date" style={inputCls} value={form.data_volta} onChange={e => set('data_volta', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Status</label>
              <select style={selCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Tipo</label>
              <select style={selCls} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {Object.entries(TIPO_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Notas</label>
              <textarea style={{ ...inputCls, resize: 'none' }} rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Links de pesquisa, ideias, dicas..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Adicionar Viagem'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        filtered.length === 0 ? <EmptyState icon={Globe} title="Nenhuma viagem" desc="Adicione destinos dos sonhos e viagens planejadas" /> :
        <div className="space-y-3">
          {filtered.map(v => (
            <Card key={v.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-stone-800">{v.destino}</h3>
                    {v.pais && <span className="text-xs text-stone-400">📍 {v.pais}</span>}
                    <Badge className={STATUS_COLORS[v.status]}>{STATUS_LABELS[v.status]}</Badge>
                    <Badge className="bg-stone-100 text-stone-600">{TIPO_LABELS[v.tipo]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                    {v.data_ida && <span>📅 {fmt(v.data_ida)}{v.data_volta ? ` → ${fmt(v.data_volta)}` : ''}</span>}
                    {v.orcamento > 0 && <span>💰 {fmtMoney(v.orcamento)}</span>}
                  </div>
                  {v.notas && <p className="text-xs text-stone-500 mt-1.5 italic line-clamp-1">{v.notas}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => startEdit(v)} className="p-1.5 text-stone-400 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(v.id)} className="p-1.5 text-stone-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

// ── TAB ROTEIRO ──────────────────────────────────────────────────────────────
function TabRoteiro() {
  const { data: roteiro, loading, insert, update, remove } = useDB('viagens_roteiro', { order: 'data_item', asc: true })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const emptyForm = { titulo: '', descricao: '', data_item: '', horario: '', local: '', categoria: 'atração', custo: '' }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const CATS = {
    'atração': { color: 'bg-blue-100 text-blue-700', emoji: '🏛️' },
    'restaurante': { color: 'bg-orange-100 text-orange-700', emoji: '🍽️' },
    'hotel': { color: 'bg-purple-100 text-purple-700', emoji: '🏨' },
    'transporte': { color: 'bg-sky-100 text-sky-700', emoji: '🚗' },
    'passeio': { color: 'bg-green-100 text-green-700', emoji: '🌿' },
    'compras': { color: 'bg-pink-100 text-pink-700', emoji: '🛍️' },
    'outros': { color: 'bg-stone-100 text-stone-600', emoji: '📌' },
  }

  const handleSubmit = async () => {
    if (!form.titulo.trim()) return
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      data_item: form.data_item || null,
      horario: form.horario || null,
      local: form.local || null,
      categoria: form.categoria,
      custo: form.custo ? parseFloat(form.custo) : null,
    }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  const startEdit = (item) => {
    setForm({ titulo: item.titulo||'', descricao: item.descricao||'', data_item: item.data_item||'', horario: item.horario||'', local: item.local||'', categoria: item.categoria||'atração', custo: item.custo||'' })
    setEditItem(item); setShowForm(true)
  }

  // Group by date
  const grouped = roteiro.reduce((acc, item) => {
    const d = item.data_item || 'sem-data'
    if (!acc[d]) acc[d] = []
    acc[d].push(item)
    return acc
  }, {})
  const totalCusto = roteiro.reduce((s, i) => s + Number(i.custo || 0), 0)

  return (
    <div className="space-y-4">
      {roteiro.length > 0 && (
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400">Total de atividades</p>
            <p className="font-bold text-stone-800">{roteiro.length} itens</p>
          </div>
          {totalCusto > 0 && (
            <div className="text-right">
              <p className="text-xs text-stone-400">Custo estimado</p>
              <p className="font-bold text-amber-600">{fmtMoney(totalCusto)}</p>
            </div>
          )}
        </Card>
      )}
      <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-200 hover:border-amber-300 rounded-2xl py-4 text-stone-400 hover:text-amber-500 transition-colors">
        <Plus className="w-4 h-4" /> Adicionar ao roteiro
      </button>
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar Item' : 'Novo Item do Roteiro'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Título *</label>
              <input style={inputCls} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Torre Eiffel, Jantar romântico..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoria</label>
              <select style={selCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {Object.keys(CATS).map(k => <option key={k} value={k}>{CATS[k].emoji} {k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Custo estimado (R$)</label>
              <input type="number" style={inputCls} value={form.custo} onChange={e => set('custo', e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Data</label>
              <input type="date" style={inputCls} value={form.data_item} onChange={e => set('data_item', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Horário</label>
              <input type="time" style={inputCls} value={form.horario} onChange={e => set('horario', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Local / Endereço</label>
              <input style={inputCls} value={form.local} onChange={e => set('local', e.target.value)} placeholder="Champ de Mars, Paris..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Descrição / Notas</label>
              <textarea style={{ ...inputCls, resize: 'none' }} rows={2} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Reserva necessária, trazer documento, dica..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Adicionar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        roteiro.length === 0 ? <EmptyState icon={List} title="Roteiro vazio" desc="Monte o roteiro dia a dia da sua viagem" /> :
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                {date === 'sem-data' ? '📌 Sem data definida' : `📅 ${fmt(date)}`}
              </p>
              <div className="space-y-2">
                {items.map(item => {
                  const cat = CATS[item.categoria] || CATS['outros']
                  return (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-lg mt-0.5">{cat.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-stone-800 text-sm">{item.titulo}</span>
                              <Badge className={cat.color}>{item.categoria}</Badge>
                            </div>
                            {item.horario && <p className="text-xs text-stone-400 mt-0.5">⏰ {item.horario}</p>}
                            {item.local && <p className="text-xs text-stone-500 mt-0.5">📍 {item.local}</p>}
                            {item.custo > 0 && <p className="text-xs text-amber-600 mt-0.5">💰 {fmtMoney(item.custo)}</p>}
                            {item.descricao && <p className="text-xs text-stone-400 mt-1 italic">{item.descricao}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => startEdit(item)} className="p-1 text-stone-400 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => remove(item.id)} className="p-1 text-stone-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

// ── TAB MALA ──────────────────────────────────────────────────────────────────
function TabMala() {
  const { data: itens, loading, insert, update, remove } = useDB('viagens_mala', { order: 'categoria', asc: true })
  const [showForm, setShowForm] = useState(false)
  const [filterCat, setFilterCat] = useState('todas')
  const emptyForm = { item: '', categoria: 'roupas', quantidade: 1 }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const CATS_MALA = {
    roupas: '👕',
    calcados: '👟',
    higiene: '🧴',
    documentos: '📄',
    eletronicos: '💻',
    medicamentos: '💊',
    outros: '🎒',
  }

  const handleSubmit = async () => {
    if (!form.item.trim()) return
    await insert({ item: form.item, categoria: form.categoria, quantidade: parseInt(form.quantidade) || 1, checked: false })
    setForm(emptyForm); setShowForm(false)
  }

  const toggleCheck = async (item) => {
    await update(item.id, { checked: !item.checked })
  }

  const filtered = filterCat === 'todas' ? itens : itens.filter(i => i.categoria === filterCat)
  const checkedCount = itens.filter(i => i.checked).length
  const progress = itens.length > 0 ? Math.round((checkedCount / itens.length) * 100) : 0

  return (
    <div className="space-y-4">
      {itens.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-stone-700">Progresso da mala</p>
            <p className="text-sm font-bold text-amber-600">{checkedCount}/{itens.length} itens</p>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div className="bg-amber-500 rounded-full h-2 transition-all" style={{ width: progress + '%' }} />
          </div>
          {progress === 100 && <p className="text-xs text-emerald-600 text-center mt-2 font-medium">✈️ Mala completa!</p>}
        </Card>
      )}
      <div className="flex gap-2 flex-wrap items-center">
        <button onClick={() => setFilterCat('todas')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${filterCat === 'todas' ? 'bg-amber-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
          Tudo
        </button>
        {Object.entries(CATS_MALA).map(([k,v]) => (
          <button key={k} onClick={() => setFilterCat(k)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${filterCat === k ? 'bg-amber-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
            {v} {k}
          </button>
        ))}
        <button onClick={() => setShowForm(!showForm)}
          className="ml-auto flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
      {showForm && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Item *</label>
              <input style={inputCls} value={form.item} onChange={e => set('item', e.target.value)} placeholder="Passaporte, camisetas, carregador..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoria</label>
              <select style={selCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {Object.entries(CATS_MALA).map(([k,v]) => <option key={k} value={k}>{v} {k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Quantidade</label>
              <input type="number" min={1} style={inputCls} value={form.quantidade} onChange={e => set('quantidade', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSubmit} className="flex-1 bg-amber-500 text-white py-2 rounded-xl text-sm font-medium">Adicionar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        filtered.length === 0 ? <EmptyState icon={Package} title="Lista vazia" desc="Adicione itens para a mala da viagem" /> :
        <Card className="overflow-hidden">
          {filtered.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-stone-50' : ''} ${item.checked ? 'opacity-50' : ''}`}>
              <button onClick={() => toggleCheck(item)} className="flex-shrink-0">
                {item.checked
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                  : <Circle className="w-5 h-5 text-stone-300" strokeWidth={1.8} />
                }
              </button>
              <span className="text-lg">{CATS_MALA[item.categoria] || '🎒'}</span>
              <div className="flex-1">
                <span className={`text-sm text-stone-700 ${item.checked ? 'line-through' : ''}`}>{item.item}</span>
                {item.quantidade > 1 && <span className="text-xs text-stone-400 ml-2">×{item.quantidade}</span>}
              </div>
              <button onClick={() => remove(item.id)} className="p-1 text-stone-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </Card>
      }
    </div>
  )
}

// ── TAB SONHOS ────────────────────────────────────────────────────────────────
function TabSonhos() {
  const { data: sonhos, loading, insert, update, remove } = useDB('viagens_sonhos', { order: 'prioridade', asc: false })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const emptyForm = { destino: '', motivo: '', prioridade: 3, tipo: 'casal' }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.destino.trim()) return
    const payload = { destino: form.destino, motivo: form.motivo || null, prioridade: parseInt(form.prioridade), tipo: form.tipo }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-700">Destinos dos Sonhos</h3>
          <p className="text-xs text-stone-400">{sonhos.length} destinos na wishlist</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Destino dos Sonhos</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Destino *</label>
              <input style={inputCls} value={form.destino} onChange={e => set('destino', e.target.value)} placeholder="Japão, Patagônia, Ilhas Maldivas..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Por que você quer ir?</label>
              <textarea style={{ ...inputCls, resize: 'none' }} rows={2} value={form.motivo} onChange={e => set('motivo', e.target.value)} placeholder="Cultura incrível, paisagem, gastronomia..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Prioridade (1-5 estrelas)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set('prioridade', n)}
                    className={`text-2xl transition-transform ${n <= form.prioridade ? 'scale-110' : 'opacity-30'}`}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Quem vai?</label>
              <select style={selCls} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {Object.entries(TIPO_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-amber-500 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Adicionar Sonho'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        sonhos.length === 0 ? <EmptyState icon={Sparkles} title="Sem destinos na wishlist" desc="Adicione os lugares que vocês sonham em conhecer" /> :
        <div className="grid grid-cols-1 gap-3">
          {sonhos.sort((a,b) => b.prioridade - a.prioridade).map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-stone-800">✈️ {s.destino}</h3>
                    <Badge className="bg-stone-100 text-stone-600">{TIPO_LABELS[s.tipo]}</Badge>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < s.prioridade ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
                    ))}
                  </div>
                  {s.motivo && <p className="text-sm text-stone-500 italic">"{s.motivo}"</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => { setForm({ destino: s.destino, motivo: s.motivo||'', prioridade: s.prioridade, tipo: s.tipo }); setEditItem(s); setShowForm(true) }}
                    className="p-1.5 text-stone-400 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(s.id)} className="p-1.5 text-stone-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'viagens', label: 'Viagens', icon: Globe },
  { id: 'roteiro', label: 'Roteiro', icon: List },
  { id: 'mala', label: 'Mala', icon: Luggage },
  { id: 'sonhos', label: 'Sonhos', icon: Sparkles },
]

export function ViagensPage() {
  const [tab, setTab] = useState('viagens')
  const ActiveTab = tab === 'viagens' ? TabViagens : tab === 'roteiro' ? TabRoteiro : tab === 'mala' ? TabMala : TabSonhos

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <PageHeader
        icon={Globe}
        title="Viagens"
        subtitle="Planejamento, roteiros e destinos dos sonhos"
      />
      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${tab === id ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>
      <ActiveTab />
    </div>
  )
}

export default ViagensPage
