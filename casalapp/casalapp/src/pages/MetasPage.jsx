import { useState } from 'react'
import { useDB } from '../hooks/useDB'
import {
  Target, Plus, X, CheckCircle2, Circle,
  Edit3, Trash2, Calendar, DollarSign,
  TrendingUp, Heart, Plane, Home, Star,
  ChevronDown, ChevronUp, Flag, Sparkles
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const fmt = (v) => v ? new Date(v + 'T12:00:00').toLocaleDateString('pt-BR') : '—'
const fmtMoney = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

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

const CAT_CONFIG = {
  financeiro: { label: 'Financeiro', icon: DollarSign, color: 'bg-amber-100 text-amber-700', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-100' },
  viagem: { label: 'Viagem', icon: Plane, color: 'bg-blue-100 text-blue-700', bg: 'from-blue-50 to-sky-50', border: 'border-blue-100' },
  relacionamento: { label: 'Relacionamento', icon: Heart, color: 'bg-rose-100 text-rose-700', bg: 'from-rose-50 to-pink-50', border: 'border-rose-100' },
  casa: { label: 'Casa', icon: Home, color: 'bg-green-100 text-green-700', bg: 'from-green-50 to-emerald-50', border: 'border-green-100' },
  pessoal: { label: 'Pessoal', icon: Star, color: 'bg-purple-100 text-purple-700', bg: 'from-purple-50 to-violet-50', border: 'border-purple-100' },
  carreira: { label: 'Carreira', icon: TrendingUp, color: 'bg-sky-100 text-sky-700', bg: 'from-sky-50 to-cyan-50', border: 'border-sky-100' },
  outros: { label: 'Outros', icon: Flag, color: 'bg-stone-100 text-stone-600', bg: 'from-stone-50 to-stone-50', border: 'border-stone-100' },
}

const PRAZO_CONFIG = {
  '1m': 'Esse mês',
  '3m': '3 meses',
  '6m': '6 meses',
  '1a': '1 ano',
  '2a': '2 anos',
  '5a': '5 anos',
  longo: 'Longo prazo',
}

export function MetasPage() {
  const { data: metas, loading, insert, update, remove } = useDB('metas_casal', { order: 'prioridade', asc: false })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filterCat, setFilterCat] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('ativas')
  const [expandedId, setExpandedId] = useState(null)

  const emptyForm = {
    titulo: '', descricao: '', categoria: 'financeiro', prazo_tipo: '1a',
    prazo_data: '', valor_meta: '', valor_atual: '', prioridade: 3,
    concluida: false, dono: 'casal'
  }
  const [form, setForm] = useState(emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.titulo.trim()) return
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      categoria: form.categoria,
      prazo_tipo: form.prazo_tipo,
      prazo_data: form.prazo_data || null,
      valor_meta: form.valor_meta ? parseFloat(form.valor_meta) : null,
      valor_atual: form.valor_atual ? parseFloat(form.valor_atual) : null,
      prioridade: parseInt(form.prioridade) || 3,
      concluida: editItem ? editItem.concluida : false,
      dono: form.dono,
    }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else { await insert(payload) }
    setForm(emptyForm); setShowForm(false)
  }

  const toggleConcluida = async (m) => update(m.id, { concluida: !m.concluida })
  const startEdit = (m) => {
    setForm({ titulo: m.titulo, descricao: m.descricao||'', categoria: m.categoria, prazo_tipo: m.prazo_tipo||'1a', prazo_data: m.prazo_data||'', valor_meta: m.valor_meta||'', valor_atual: m.valor_atual||'', prioridade: m.prioridade||3, concluida: m.concluida, dono: m.dono||'casal' })
    setEditItem(m); setShowForm(true)
  }
  const updateProgresso = async (id, valor) => {
    const v = parseFloat(valor)
    if (!isNaN(v)) await update(id, { valor_atual: v })
  }

  let filtered = metas
  if (filterCat !== 'todas') filtered = filtered.filter(m => m.categoria === filterCat)
  if (filterStatus === 'ativas') filtered = filtered.filter(m => !m.concluida)
  if (filterStatus === 'concluídas') filtered = filtered.filter(m => m.concluida)

  const ativas = metas.filter(m => !m.concluida).length
  const concluidas = metas.filter(m => m.concluida).length

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <PageHeader icon={Target} title="Metas" subtitle="Objetivos e conquistas do casal" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xl font-bold text-stone-800">{metas.length}</p>
          <p className="text-xs text-stone-400 mt-0.5">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{ativas}</p>
          <p className="text-xs text-stone-400 mt-0.5">Em progresso</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{concluidas}</p>
          <p className="text-xs text-stone-400 mt-0.5">Conquistadas 🏆</p>
        </Card>
      </div>

      {/* Filters + Add */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {['ativas','concluídas','todas'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
          <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
            className="ml-auto flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova Meta
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat('todas')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${filterCat === 'todas' ? 'bg-stone-700 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
            Todas
          </button>
          {Object.entries(CAT_CONFIG).map(([k, v]) => (
            <button key={k} onClick={() => setFilterCat(k)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${filterCat === k ? 'bg-stone-700 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar Meta' : 'Nova Meta'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Título *</label>
              <input style={inputCls} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Viajar para o Japão, Comprar apartamento..." />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Categoria</label>
              <select style={selCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {Object.entries(CAT_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Prazo</label>
              <select style={selCls} value={form.prazo_tipo} onChange={e => set('prazo_tipo', e.target.value)}>
                {Object.entries(PRAZO_CONFIG).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Data alvo</label>
              <input type="date" style={inputCls} value={form.prazo_data} onChange={e => set('prazo_data', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Dono</label>
              <select style={selCls} value={form.dono} onChange={e => set('dono', e.target.value)}>
                <option value="casal">💑 Casal</option>
                <option value="eu">👤 Eu</option>
                <option value="parceiro">👤 Parceiro(a)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Valor Meta (R$)</label>
              <input type="number" style={inputCls} value={form.valor_meta} onChange={e => set('valor_meta', e.target.value)} placeholder="Se houver valor" />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Valor Atual (R$)</label>
              <input type="number" style={inputCls} value={form.valor_atual} onChange={e => set('valor_atual', e.target.value)} placeholder="Progresso atual" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Prioridade</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set('prioridade', n)} className={`text-2xl transition-transform ${n <= form.prioridade ? 'scale-110' : 'opacity-30'}`}>⭐</button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 block mb-1">Descrição</label>
              <textarea style={{ ...inputCls, resize: 'none' }} rows={2} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Detalhes da meta, estratégia, motivação..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Criar Meta'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </Card>
      )}

      {/* List */}
      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        filtered.length === 0 ? <EmptyState icon={Target} title="Nenhuma meta" desc="Defina os objetivos do casal" /> :
        <div className="space-y-3">
          {filtered.sort((a,b) => (b.prioridade||0)-(a.prioridade||0)).map(m => {
            const cat = CAT_CONFIG[m.categoria] || CAT_CONFIG['outros']
            const CatIcon = cat.icon
            const pct = m.valor_meta > 0 ? Math.min(100, Math.round((Number(m.valor_atual||0) / m.valor_meta) * 100)) : 0
            const isExpanded = expandedId === m.id
            return (
              <Card key={m.id} className={`overflow-hidden border ${cat.border} ${m.concluida ? 'opacity-60' : ''}`}>
                <div className={`bg-gradient-to-r ${cat.bg} px-4 py-3`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button onClick={() => toggleConcluida(m)} className="mt-0.5 flex-shrink-0">
                        {m.concluida
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <Circle className="w-5 h-5 text-stone-300" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`font-semibold text-stone-800 ${m.concluida ? 'line-through' : ''}`}>{m.titulo}</span>
                          <Badge className={cat.color}><CatIcon className="w-3 h-3" /> {cat.label}</Badge>
                          {m.dono !== 'casal' && <Badge className="bg-stone-100 text-stone-500">{m.dono === 'eu' ? '👤 Eu' : '👤 Parceiro(a)'}</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                          {m.prazo_data && <span>📅 {fmt(m.prazo_data)}</span>}
                          <span>⏰ {PRAZO_CONFIG[m.prazo_tipo] || m.prazo_tipo}</span>
                          {m.prioridade > 0 && <span>{'⭐'.repeat(m.prioridade)}</span>}
                        </div>
                        {m.valor_meta > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-stone-500 mb-1">
                              <span>{fmtMoney(m.valor_atual||0)} de {fmtMoney(m.valor_meta)}</span>
                              <span className="font-medium text-amber-600">{pct}%</span>
                            </div>
                            <div className="w-full bg-white/60 rounded-full h-2">
                              <div className="bg-amber-500 rounded-full h-2 transition-all" style={{ width: pct + '%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => setExpandedId(isExpanded ? null : m.id)} className="p-1 text-stone-400 hover:text-stone-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button onClick={() => startEdit(m)} className="p-1 text-stone-400 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(m.id)} className="p-1 text-stone-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 py-3 bg-white border-t border-stone-50 space-y-3">
                    {m.descricao && <p className="text-sm text-stone-600 italic">"{m.descricao}"</p>}
                    {m.valor_meta > 0 && !m.concluida && (
                      <div>
                        <label className="text-xs text-stone-500 block mb-1">Atualizar progresso (R$)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            style={{ ...inputCls, flex: 1 }}
                            defaultValue={m.valor_atual || ''}
                            placeholder="Valor atual"
                            id={`prog-${m.id}`}
                          />
                          <button
                            onClick={() => { const el = document.getElementById(`prog-${m.id}`); if (el) updateProgresso(m.id, el.value) }}
                            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      }
    </div>
  )
}

export default MetasPage
