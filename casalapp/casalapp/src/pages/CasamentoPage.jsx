import { useState } from 'react'
import { useDB } from '../hooks/useDB'
import {
  Gem, Plus, X, CheckCircle2, Circle,
  DollarSign, Users, Calendar, Edit3, Trash2,
  Heart, Star, List, Tag, Clock, FileText,
  ChevronDown, ChevronUp, Package, Music,
  Camera, MapPin, Utensils, Flower2
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const fmtMoney = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmt = (v) => v ? new Date(v + 'T12:00:00').toLocaleDateString('pt-BR') : '—'

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
const inputCls = { backgroundColor:'#ffffff', color:'#1c1917', border:'1px solid #d6d3d1', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', width:'100%', outline:'none' }
const selCls = { ...inputCls }

// ── CHECKLIST CATEGORIES ──────────────────────────────────────────────────────
const CHECKLIST_CATS = {
  venue: { label: 'Local & Cerimônia', icon: MapPin, color: 'bg-rose-100 text-rose-700' },
  fornecedores: { label: 'Fornecedores', icon: Package, color: 'bg-purple-100 text-purple-700' },
  convidados: { label: 'Convidados', icon: Users, color: 'bg-blue-100 text-blue-700' },
  financeiro: { label: 'Financeiro', icon: DollarSign, color: 'bg-amber-100 text-amber-700' },
  vestuario: { label: 'Vestuário', icon: Flower2, color: 'bg-pink-100 text-pink-700' },
  documentos: { label: 'Documentos', icon: FileText, color: 'bg-stone-100 text-stone-600' },
  lua_de_mel: { label: 'Lua de Mel', icon: Heart, color: 'bg-red-100 text-red-700' },
  outros: { label: 'Outros', icon: List, color: 'bg-stone-100 text-stone-600' },
}

// ── TAB CHECKLIST ─────────────────────────────────────────────────────────────
function TabChecklist() {
  const { data: tarefas, loading, insert, update, remove } = useDB('casamento_checklist', { order: 'categoria', asc: true })
  const [showForm, setShowForm] = useState(false)
  const [filterCat, setFilterCat] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('todas')
  const emptyForm = { tarefa: '', categoria: 'venue', prazo: '', responsavel: '', notas: '' }
  const [form, setForm] = useState(emptyForm)
  const [editItem, setEditItem] = useState(null)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.tarefa.trim()) return
    const payload = { tarefa: form.tarefa, categoria: form.categoria, prazo: form.prazo || null, responsavel: form.responsavel || null, notas: form.notas || null, done: false }
    if (editItem) { await update(editItem.id, { ...payload, done: editItem.done }); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  const toggle = async (t) => update(t.id, { done: !t.done })
  const startEdit = (t) => {
    setForm({ tarefa: t.tarefa, categoria: t.categoria, prazo: t.prazo||'', responsavel: t.responsavel||'', notas: t.notas||'' })
    setEditItem(t); setShowForm(true)
  }

  const done = tarefas.filter(t => t.done).length
  const pct = tarefas.length > 0 ? Math.round((done / tarefas.length) * 100) : 0

  let filtered = tarefas
  if (filterCat !== 'todas') filtered = filtered.filter(t => t.categoria === filterCat)
  if (filterStatus === 'pendentes') filtered = filtered.filter(t => !t.done)
  if (filterStatus === 'concluídas') filtered = filtered.filter(t => t.done)

  const grouped = filtered.reduce((acc, t) => {
    if (!acc[t.categoria]) acc[t.categoria] = []
    acc[t.categoria].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-stone-700">Progresso do Casamento</p>
            <p className="text-sm text-stone-400">{done} de {tarefas.length} tarefas concluídas</p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-stone-100 flex items-center justify-center relative">
            <p className="text-sm font-bold text-amber-600">{pct}%</p>
          </div>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-full h-2 transition-all" style={{ width: pct + '%' }} />
        </div>
        {pct === 100 && <p className="text-center text-sm text-rose-500 mt-2 font-medium">💍 Tudo pronto para o grande dia!</p>}
      </Card>
      <div className="flex gap-2 flex-wrap">
        {['todas','pendentes','concluídas'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          className="ml-auto flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar' : 'Nova Tarefa'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Tarefa *</label>
              <input style={inputCls} value={form.tarefa} onChange={e => set('tarefa', e.target.value)} placeholder="Confirmar local da cerimônia..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoria</label>
              <select style={selCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {Object.entries(CHECKLIST_CATS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Prazo</label>
              <input type="date" style={inputCls} value={form.prazo} onChange={e => set('prazo', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Responsável</label>
              <input style={inputCls} value={form.responsavel} onChange={e => set('responsavel', e.target.value)} placeholder="Eu, Nós, Fulano..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Notas</label>
              <input style={inputCls} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observações..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Adicionar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        filtered.length === 0 ? <EmptyState icon={CheckCircle2} title="Nenhuma tarefa" desc="Adicione as tarefas do planejamento do casamento" /> :
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => {
            const catInfo = CHECKLIST_CATS[cat] || CHECKLIST_CATS['outros']
            const CatIcon = catInfo.icon
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={catInfo.color}><CatIcon className="w-3 h-3" /> {catInfo.label}</Badge>
                  <span className="text-xs text-stone-400">{items.filter(i=>i.done).length}/{items.length}</span>
                </div>
                <Card className="overflow-hidden">
                  {items.map((t, idx) => (
                    <div key={t.id} className={`flex items-start gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-stone-50' : ''}`}>
                      <button onClick={() => toggle(t)} className="mt-0.5 flex-shrink-0">
                        {t.done ? <CheckCircle2 className="w-5 h-5 text-rose-400" /> : <Circle className="w-5 h-5 text-stone-300" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-stone-700 ${t.done ? 'line-through text-stone-400' : ''}`}>{t.tarefa}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {t.prazo && <span className="text-xs text-stone-400">📅 {fmt(t.prazo)}</span>}
                          {t.responsavel && <span className="text-xs text-stone-400">👤 {t.responsavel}</span>}
                          {t.notas && <span className="text-xs text-stone-400 italic">{t.notas}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(t)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(t.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

// ── TAB ORÇAMENTO ─────────────────────────────────────────────────────────────
function TabOrcamento() {
  const { data: itens, loading, insert, update, remove } = useDB('casamento_orcamento', { order: 'created_at', asc: false })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const emptyForm = { descricao: '', categoria: 'venue', orcado: '', pago: '', status: 'pendente', fornecedor: '', notas: '' }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const ORCAMENTO_STATUS = {
    pendente: 'bg-stone-100 text-stone-600',
    contratado: 'bg-blue-100 text-blue-700',
    pago: 'bg-emerald-100 text-emerald-700',
    cancelado: 'bg-red-100 text-red-700',
  }

  const handleSubmit = async () => {
    if (!form.descricao.trim()) return
    const payload = { descricao: form.descricao, categoria: form.categoria, orcado: form.orcado ? parseFloat(form.orcado) : null, pago: form.pago ? parseFloat(form.pago) : null, status: form.status, fornecedor: form.fornecedor || null, notas: form.notas || null }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  const startEdit = (i) => {
    setForm({ descricao: i.descricao, categoria: i.categoria, orcado: i.orcado||'', pago: i.pago||'', status: i.status, fornecedor: i.fornecedor||'', notas: i.notas||'' })
    setEditItem(i); setShowForm(true)
  }

  const totalOrcado = itens.reduce((s, i) => s + Number(i.orcado || 0), 0)
  const totalPago = itens.reduce((s, i) => s + Number(i.pago || 0), 0)
  const totalRestante = totalOrcado - totalPago

  const grouped = itens.reduce((acc, i) => {
    const c = i.categoria || 'outros'
    if (!acc[c]) acc[c] = []
    acc[c].push(i)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-4 text-center">
          <p className="text-lg font-bold text-stone-800">{fmtMoney(totalOrcado)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Orçado</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-lg font-bold text-emerald-600">{fmtMoney(totalPago)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Pago</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-lg font-bold text-rose-500">{fmtMoney(totalRestante)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Restante</p>
        </Card>
      </div>
      {totalOrcado > 0 && (
        <Card className="p-4">
          <div className="flex justify-between text-xs text-stone-500 mb-1">
            <span>Pago</span>
            <span>{Math.round((totalPago/totalOrcado)*100)}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5">
            <div className="bg-emerald-500 rounded-full h-2.5 transition-all" style={{ width: Math.min(100, (totalPago/totalOrcado)*100) + '%' }} />
          </div>
        </Card>
      )}
      <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-200 hover:border-rose-300 rounded-2xl py-3 text-stone-400 hover:text-rose-500 transition-colors">
        <Plus className="w-4 h-4" /> Adicionar item ao orçamento
      </button>
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar' : 'Novo Item'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Descrição *</label>
              <input style={inputCls} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Buffet, Fotógrafo, Flores..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoria</label>
              <select style={selCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {Object.entries(CHECKLIST_CATS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Status</label>
              <select style={selCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(ORCAMENTO_STATUS).map(([k]) => <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Valor Orçado (R$)</label>
              <input type="number" style={inputCls} value={form.orcado} onChange={e => set('orcado', e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Valor Pago (R$)</label>
              <input type="number" style={inputCls} value={form.pago} onChange={e => set('pago', e.target.value)} placeholder="0,00" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Fornecedor</label>
              <input style={inputCls} value={form.fornecedor} onChange={e => set('fornecedor', e.target.value)} placeholder="Nome do fornecedor..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Notas</label>
              <textarea style={{ ...inputCls, resize: 'none' }} rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Contato, observações, link..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Adicionar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        itens.length === 0 ? <EmptyState icon={DollarSign} title="Orçamento vazio" desc="Adicione os custos planejados do casamento" /> :
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catItens]) => {
            const catInfo = CHECKLIST_CATS[cat] || CHECKLIST_CATS['outros']
            const catTotal = catItens.reduce((s,i) => s + Number(i.orcado||0), 0)
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={catInfo.color}>{catInfo.label}</Badge>
                  <span className="text-xs text-stone-500 font-medium">{fmtMoney(catTotal)}</span>
                </div>
                <Card className="overflow-hidden">
                  {catItens.map((item, idx) => (
                    <div key={item.id} className={`px-4 py-3 ${idx > 0 ? 'border-t border-stone-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-stone-700">{item.descricao}</span>
                            <Badge className={ORCAMENTO_STATUS[item.status]}>{item.status}</Badge>
                          </div>
                          {item.fornecedor && <p className="text-xs text-stone-400 mt-0.5">🏢 {item.fornecedor}</p>}
                          <div className="flex gap-3 mt-1 text-xs">
                            {item.orcado > 0 && <span className="text-stone-500">Orçado: {fmtMoney(item.orcado)}</span>}
                            {item.pago > 0 && <span className="text-emerald-600">Pago: {fmtMoney(item.pago)}</span>}
                          </div>
                          {item.notas && <p className="text-xs text-stone-400 italic mt-0.5">{item.notas}</p>}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => startEdit(item)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => remove(item.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

// ── TAB CONVIDADOS ────────────────────────────────────────────────────────────
function TabConvidados() {
  const { data: convidados, loading, insert, update, remove } = useDB('casamento_convidados', { order: 'nome', asc: true })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filterStatus, setFilterStatus] = useState('todos')
  const emptyForm = { nome: '', telefone: '', mesa: '', lado: 'ambos', confirmado: 'pendente', restricoes: '', notas: '' }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const CONFIRM_STATUS = {
    confirmado: 'bg-emerald-100 text-emerald-700',
    pendente: 'bg-amber-100 text-amber-700',
    recusado: 'bg-red-100 text-red-700',
  }
  const LADO_LABELS = { ambos: '💑 Ambos', noivo: '🤵 Noivo', noiva: '👰 Noiva', amigos: '🤝 Amigos' }

  const handleSubmit = async () => {
    if (!form.nome.trim()) return
    const payload = { nome: form.nome, telefone: form.telefone || null, mesa: form.mesa || null, lado: form.lado, confirmado: form.confirmado, restricoes: form.restricoes || null, notas: form.notas || null }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  const startEdit = (c) => {
    setForm({ nome: c.nome, telefone: c.telefone||'', mesa: c.mesa||'', lado: c.lado||'ambos', confirmado: c.confirmado||'pendente', restricoes: c.restricoes||'', notas: c.notas||'' })
    setEditItem(c); setShowForm(true)
  }

  const filtered = filterStatus === 'todos' ? convidados : convidados.filter(c => c.confirmado === filterStatus)
  const confirmados = convidados.filter(c => c.confirmado === 'confirmado').length
  const pendentes = convidados.filter(c => c.confirmado === 'pendente').length
  const recusados = convidados.filter(c => c.confirmado === 'recusado').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-stone-800">{convidados.length}</p>
          <p className="text-xs text-stone-400">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{confirmados}</p>
          <p className="text-xs text-stone-400">Confirmados</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-amber-500">{pendentes}</p>
          <p className="text-xs text-stone-400">Pendentes</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-red-500">{recusados}</p>
          <p className="text-xs text-stone-400">Recusados</p>
        </Card>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {['todos','confirmado','pendente','recusado'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          className="ml-auto flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
          <Plus className="w-4 h-4" /> Convidado
        </button>
      </div>
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar' : 'Novo Convidado'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Nome *</label>
              <input style={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do convidado" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Telefone/WhatsApp</label>
              <input style={inputCls} value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Mesa</label>
              <input style={inputCls} value={form.mesa} onChange={e => set('mesa', e.target.value)} placeholder="Mesa 1, VIP..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Lado</label>
              <select style={selCls} value={form.lado} onChange={e => set('lado', e.target.value)}>
                {Object.entries(LADO_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Confirmação</label>
              <select style={selCls} value={form.confirmado} onChange={e => set('confirmado', e.target.value)}>
                {Object.keys(CONFIRM_STATUS).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Restrições alimentares</label>
              <input style={inputCls} value={form.restricoes} onChange={e => set('restricoes', e.target.value)} placeholder="Vegetariano, sem glúten..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Adicionar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        filtered.length === 0 ? <EmptyState icon={Users} title="Nenhum convidado" desc="Adicione os convidados da festa" /> :
        <Card className="overflow-hidden">
          {filtered.map((c, idx) => (
            <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-stone-50' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-rose-500">{c.nome[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-stone-700">{c.nome}</span>
                  <Badge className={CONFIRM_STATUS[c.confirmado]}>{c.confirmado}</Badge>
                  {c.mesa && <span className="text-xs text-stone-400">🪑 {c.mesa}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.lado && <span className="text-xs text-stone-400">{LADO_LABELS[c.lado]}</span>}
                  {c.restricoes && <span className="text-xs text-stone-400">🥗 {c.restricoes}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(c)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(c.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </Card>
      }
    </div>
  )
}

// ── TAB FORNECEDORES ──────────────────────────────────────────────────────────
function TabFornecedores() {
  const { data: fornecedores, loading, insert, update, remove } = useDB('casamento_fornecedores', { order: 'categoria', asc: true })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const emptyForm = { nome: '', categoria: 'venue', contato: '', valor: '', status: 'pesquisando', site: '', notas: '', avaliacao: 0 }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const FORNECED_STATUS = {
    pesquisando: 'bg-stone-100 text-stone-600',
    em_negociacao: 'bg-amber-100 text-amber-700',
    contratado: 'bg-blue-100 text-blue-700',
    pago: 'bg-emerald-100 text-emerald-700',
    cancelado: 'bg-red-100 text-red-700',
  }
  const FORNECED_STATUS_LABELS = { pesquisando: 'Pesquisando', em_negociacao: 'Negociando', contratado: 'Contratado', pago: 'Pago', cancelado: 'Cancelado' }

  const handleSubmit = async () => {
    if (!form.nome.trim()) return
    const payload = { nome: form.nome, categoria: form.categoria, contato: form.contato||null, valor: form.valor ? parseFloat(form.valor) : null, status: form.status, site: form.site||null, notas: form.notas||null, avaliacao: parseInt(form.avaliacao)||0 }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  const startEdit = (f) => {
    setForm({ nome: f.nome, categoria: f.categoria, contato: f.contato||'', valor: f.valor||'', status: f.status, site: f.site||'', notas: f.notas||'', avaliacao: f.avaliacao||0 })
    setEditItem(f); setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-stone-700">{fornecedores.length} fornecedores cadastrados</p>
          <p className="text-xs text-stone-400">{fornecedores.filter(f=>f.status==='contratado'||f.status==='pago').length} contratados</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
          <Plus className="w-4 h-4" /> Fornecedor
        </button>
      </div>
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar' : 'Novo Fornecedor'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Nome *</label>
              <input style={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Buffet ABC, Foto Arte..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoria</label>
              <select style={selCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {Object.entries(CHECKLIST_CATS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Status</label>
              <select style={selCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(FORNECED_STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Contato</label>
              <input style={inputCls} value={form.contato} onChange={e => set('contato', e.target.value)} placeholder="Tel, email, Instagram..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Valor (R$)</label>
              <input type="number" style={inputCls} value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="0,00" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Site / Instagram</label>
              <input style={inputCls} value={form.site} onChange={e => set('site', e.target.value)} placeholder="@perfil, www.site.com..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Notas</label>
              <textarea style={{ ...inputCls, resize: 'none' }} rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observações, link do portfólio..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Avaliação</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set('avaliacao', n)} className={`text-2xl ${n <= form.avaliacao ? '' : 'opacity-30'}`}>⭐</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium">{editItem ? 'Salvar' : 'Adicionar'}</button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        fornecedores.length === 0 ? <EmptyState icon={Package} title="Sem fornecedores" desc="Cadastre os fornecedores do casamento" /> :
        <div className="space-y-3">
          {fornecedores.map(f => {
            const catInfo = CHECKLIST_CATS[f.categoria] || CHECKLIST_CATS['outros']
            return (
              <Card key={f.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-stone-800">{f.nome}</span>
                      <Badge className={catInfo.color}>{catInfo.label}</Badge>
                      <Badge className={FORNECED_STATUS[f.status]}>{FORNECED_STATUS_LABELS[f.status]}</Badge>
                    </div>
                    {f.avaliacao > 0 && <div className="flex gap-0.5 mb-1">{Array.from({length:5}).map((_,i) => <span key={i} className={`text-xs ${i<f.avaliacao?'opacity-100':'opacity-20'}`}>⭐</span>)}</div>}
                    <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                      {f.contato && <span>📞 {f.contato}</span>}
                      {f.valor > 0 && <span className="text-amber-600">💰 {fmtMoney(f.valor)}</span>}
                    </div>
                    {f.notas && <p className="text-xs text-stone-400 italic mt-1">{f.notas}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => startEdit(f)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(f.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
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

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
  { id: 'orcamento', label: 'Orçamento', icon: DollarSign },
  { id: 'convidados', label: 'Convidados', icon: Users },
  { id: 'fornecedores', label: 'Fornecedores', icon: Package },
]

export function CasamentoPage() {
  const [tab, setTab] = useState('checklist')
  const ActiveTab = tab === 'checklist' ? TabChecklist : tab === 'orcamento' ? TabOrcamento : tab === 'convidados' ? TabConvidados : TabFornecedores

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <PageHeader
        icon={Gem}
        title="Casamento"
        subtitle="Planejamento completo do grande dia 💍"
      />
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1 overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${tab === id ? 'bg-white text-rose-500 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
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

export default CasamentoPage
