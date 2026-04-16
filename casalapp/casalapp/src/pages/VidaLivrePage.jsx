import { useState, useMemo, useEffect } from 'react'
import { useDB } from '../hooks/useDB'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { instantNotify, requestPermission } from '../lib/notifications'
import PageHeader from '../components/PageHeader'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarHeart, Plus, Trash2, Edit3, Check, X,
  Heart, Flame, Lock, Eye, EyeOff, Star, Clock,
  MessageCircle, CheckCircle2, Circle, Sparkles,
  ShieldCheck, AlertCircle, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react'

// ─── Constantes ─────────────────────────────────────────────────────────────
const TABS = ['Agenda', 'Registros', 'Combinados', 'Fantasias', 'Mimos', 'Questionário', 'Ela']

const STATUS_SAIDA = {
  planejado: { label: 'Planejado', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  aconteceu: { label: 'Aprovado', color: 'bg-green-50 text-green-700 border-green-200' },
  cancelado:  { label: 'Cancelado', color: 'bg-red-50 text-red-600 border-red-200' },
}

const SHARE_NIVEL = {
  contou:   { label: 'Contou tudo', icon: Eye,    color: 'text-green-600' },
  resumo:   { label: 'Resumo',      icon: MessageCircle, color: 'text-amber-600' },
  privado:  { label: 'Privado',     icon: Lock,   color: 'text-stone-400' },
}

const CAT_FANTASIA = {
  casal:     { label: 'A dois',      color: 'bg-pink-50 text-pink-700 border-pink-200' },
  livre:     { label: 'Vida livre',  color: 'bg-purple-50 text-purple-700 border-purple-200' },
  viagem:    { label: 'Em viagem',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  novo:      { label: 'Novo',        color: 'bg-teal-50 text-teal-700 border-teal-200' },
}

const CAT_COMBINADO = {
  permitido: { label: 'Permitido',  dot: 'bg-green-500' },
  proibido:  { label: 'Proibido',   dot: 'bg-red-500' },
  liberdade: { label: 'Liberdade',  dot: 'bg-blue-500' },
  protocolo: { label: 'Protocolo',  dot: 'bg-amber-500' },
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-400">
      <Icon size={40} className="mb-3 opacity-30" />
      <p className="font-medium text-stone-500">{title}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  )
}

// ─── Hook: Notificações Realtime do Vida Livre ──────────────────────────────
function useVidaLivreNotifications(userId) {
  useEffect(() => {
    if (!userId) return

    // Pedir permissão de notificação se ainda não foi dada
    requestPermission()

    // Inscrever nas mudanças de Mimos (wishes)
    const wishesChannel = supabase
      .channel('vl-wishes-notify')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wishes' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        const { status, title, resposta } = payload.new
        const comment = resposta ? ` — "${resposta}"` : ''
        if (status === 'aprovado') instantNotify('💝 Mimo Aprovado!', `"${title}" foi aprovado${comment}`)
        else if (status === 'negado') instantNotify('💔 Mimo Negado', `"${title}" foi negado${comment}`)
        else if (status === 'realizado') instantNotify('✅ Mimo Realizado!', `"${title}" foi realizado! 🥳`)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wishes' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        instantNotify('💝 Novo Mimo', `Um novo desejo foi adicionado: "${payload.new.title}"`)
      })
      .subscribe()

    // Inscrever em novas Fantasias
    const fantasiasChannel = supabase
      .channel('vl-fantasias-notify')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vl_fantasias' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        instantNotify('✨ Nova Fantasia', `"${payload.new.titulo}" foi adicionada em Fantasias`)
      })
      .subscribe()

    // Inscrever em novos Combinados
    const combinadosChannel = supabase
      .channel('vl-combinados-notify')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vl_combinados' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        instantNotify('📋 Novo Combinado', 'Um novo combinado foi adicionado')
      })
      .subscribe()

    // Inscrever em novos Registros
    const registrosChannel = supabase
      .channel('vl-registros-notify')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vl_registros' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        instantNotify('📖 Novo Registro', `"${payload.new.titulo}" foi registrado`)
      })
      .subscribe()

    // Inscrever em novas Saídas e aprovações
    const saidasChannel = supabase
      .channel('vl-saidas-notify')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vl_saidas' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        instantNotify('📅 Nova Saída', `"${payload.new.titulo}" foi adicionada na agenda`)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vl_saidas' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        if (payload.new.status === 'aconteceu' && payload.old?.status === 'planejado') {
          instantNotify('✅ Saída Aprovada!', `"${payload.new.titulo}" foi aprovada!`)
        }
      })
      .subscribe()

    // Inscrever em novas Conquistas
    const conquistasChannel = supabase
      .channel('vl-conquistas-notify')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vl_conquistas' }, (payload) => {
        if (!payload.new || payload.new.user_id === userId) return
        instantNotify('🏆 Nova Conquista!', `"${payload.new.titulo}" foi registrado como conquista`)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(wishesChannel)
      supabase.removeChannel(fantasiasChannel)
      supabase.removeChannel(combinadosChannel)
      supabase.removeChannel(registrosChannel)
      supabase.removeChannel(saidasChannel)
      supabase.removeChannel(conquistasChannel)
    }
  }, [userId])
}

// ─── Aba: Agenda de Saídas ──────────────────────────────────────────────────
function TabAgenda({ onCreateRegistro }) {
  const { data: saidas, insert, remove, update } = useDB('vl_saidas')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('todas')
  const empty = { titulo: '', data: '', hora: '', com_quem: '', local: '', status: 'planejado', share: 'resumo', notas: '' }
  const [form, setForm] = useState(empty)

  const filtered = useMemo(() => {
    if (!saidas) return []
    if (filter === 'todas') return saidas
    return saidas.filter(s => s.status === filter)
  }, [saidas, filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload = { ...form, data: form.data || null, hora: form.hora || null, com_quem: form.com_quem || null, local: form.local || null, notas: form.notas || null }
    if (editId) { await update(editId, payload); setEditId(null) }
    else await insert(payload)
    setForm(empty); setAdding(false)
  }

  const startEdit = (s) => {
    setForm({ titulo: s.titulo||'', data: s.data||'', hora: s.hora||'', com_quem: s.com_quem||'', local: s.local||'', status: s.status||'planejado', share: s.share||'resumo', notas: s.notas||'' })
    setEditId(s.id); setAdding(true)
  }

  const upStatus = async (s, st) => {
    await update(s.id, { status: st })
    if (st === 'aconteceu') {
      instantNotify('✅ Saída Aprovada', `Você aprovou "${s.titulo}"`)
    }
  }

  const ShareIcon = ({ nivel }) => {
    const cfg = SHARE_NIVEL[nivel] || SHARE_NIVEL.privado
    const Icon = cfg.icon
    return <Icon size={14} className={cfg.color} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['todas','planejado','aconteceu','cancelado'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-rose-500 text-white' : 'bg-white text-stone-500 border border-stone-200 hover:border-rose-300'}`}>
              {f === 'todas' ? 'Todas' : STATUS_SAIDA[f]?.label}
            </button>
          ))}
        </div>
        <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Nova saída
        </button>
      </div>

      {adding && (
        <Card className="p-5">
          <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <CalendarHeart size={18} className="text-rose-400" />
            {editId ? 'Editar saída' : 'Nova saída'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required className="col-span-full input-base" placeholder="Título da saída *" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} />
            <input type="date" className="input-base" value={form.data} onChange={e => setForm(f => ({...f, data: e.target.value}))} />
            <input type="time" className="input-base" value={form.hora} onChange={e => setForm(f => ({...f, hora: e.target.value}))} />
            <input className="input-base" placeholder="Com quem" value={form.com_quem} onChange={e => setForm(f => ({...f, com_quem: e.target.value}))} />
            <input className="input-base" placeholder="Local / App" value={form.local} onChange={e => setForm(f => ({...f, local: e.target.value}))} />
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Status</label>
              <select className="input-base w-full" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                {Object.entries(STATUS_SAIDA).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Compartilhou com o marido?</label>
              <select className="input-base w-full" value={form.share} onChange={e => setForm(f => ({...f, share: e.target.value}))}>
                {Object.entries(SHARE_NIVEL).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <textarea className="col-span-full input-base resize-none" rows={2} placeholder="Notas (privado)" value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} />
            <div className="col-span-full flex gap-2 justify-end">
              <button type="button" onClick={() => { setAdding(false); setEditId(null) }} className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">Salvar</button>
            </div>
          </form>
        </Card>
      )}

      {filtered.length === 0 && !adding && (
        <EmptyState icon={CalendarHeart} title="Nenhuma saída aqui" sub="Adicione sua primeira saída acima" />
      )}

      <div className="space-y-3">
        {filtered.map(s => {
          const st = STATUS_SAIDA[s.status] || STATUS_SAIDA.planejado
          const ShareIcon2 = (SHARE_NIVEL[s.share] || SHARE_NIVEL.privado).icon
          const shareColor = (SHARE_NIVEL[s.share] || SHARE_NIVEL.privado).color
          const shareLabel = (SHARE_NIVEL[s.share] || SHARE_NIVEL.privado).label
          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-stone-800 truncate">{s.titulo}</span>
                    <Badge className={st.color}>{st.label}</Badge>
                    <span className={`flex items-center gap-1 text-xs ${shareColor}`}>
                      <ShareIcon2 size={12} /> {shareLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-stone-500 mt-1">
                    {s.data && <span>{format(parseISO(s.data), "dd/MM/yyyy", {locale: ptBR})}{s.hora ? ' às ' + s.hora : ''}</span>}
                    {s.com_quem && <span>· {s.com_quem}</span>}
                    {s.local && <span>· {s.local}</span>}
                  </div>
                  {s.notas && <p className="text-xs text-stone-400 mt-2 italic">"{s.notas}"</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {s.status === 'planejado' && (
                    <button onClick={() => upStatus(s,'aconteceu')} title="Aprovar saída" className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle2 size={16}/></button>
                  )}
                  {s.status === 'aconteceu' && onCreateRegistro && (
                    <button onClick={() => onCreateRegistro(s)} title="Criar registro desta saída" className="p-1.5 text-purple-400 hover:bg-purple-50 rounded-lg"><BookOpen size={15}/></button>
                  )}
                  <button onClick={() => startEdit(s)} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg"><Edit3 size={15}/></button>
                  <button onClick={() => remove(s.id)} className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Aba: Registros ─────────────────────────────────────────────────────────
function TabRegistros({ prefill, onClearPrefill }) {
  const { data: regs, insert, remove, update } = useDB('vl_registros')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [expandId, setExpandId] = useState(null)
  const empty = { titulo: '', data: '', com_quem: '', local: '', notas: '', aprendizado: '', estrelas: 3, vontade_repetir: true }
  const [form, setForm] = useState(empty)

  // When a saída is passed as prefill (from Agenda tab), open the form pre-filled
  useEffect(() => {
    if (prefill) {
      setForm({
        titulo: prefill.titulo || '',
        data: prefill.data || '',
        com_quem: prefill.com_quem || '',
        local: prefill.local || '',
        notas: prefill.notas || '',
        aprendizado: '',
        estrelas: 3,
        vontade_repetir: true,
      })
      setAdding(true)
      setEditId(null)
      if (onClearPrefill) onClearPrefill()
    }
  }, [prefill]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload2 = { ...form, data: form.data || null, com_quem: form.com_quem || null, local: form.local || null, notas: form.notas || null, aprendizado: form.aprendizado || null }
    if (editId) { await update(editId, payload2); setEditId(null) }
    else await insert(payload2)
    setForm(empty); setAdding(false)
  }

  const startEdit = (r) => {
    setForm({ titulo: r.titulo||'', data: r.data||'', com_quem: r.com_quem||'', local: r.local||'', notas: r.notas||'', aprendizado: r.aprendizado||'', estrelas: r.estrelas||3, vontade_repetir: r.vontade_repetir ?? true })
    setEditId(r.id); setAdding(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Novo registro
        </button>
      </div>

      {adding && (
        <Card className="p-5">
          <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-rose-400" />
            {editId ? 'Editar registro' : 'Novo registro'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required className="col-span-full input-base" placeholder="Título *" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} />
            <input type="date" className="input-base" value={form.data} onChange={e => setForm(f => ({...f, data: e.target.value}))} />
            <input className="input-base" placeholder="Com quem" value={form.com_quem} onChange={e => setForm(f => ({...f, com_quem: e.target.value}))} />
            <input className="col-span-full input-base" placeholder="Local" value={form.local} onChange={e => setForm(f => ({...f, local: e.target.value}))} />
            <textarea className="col-span-full input-base resize-none" rows={3} placeholder="O que aconteceu (privado)" value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} />
            <textarea className="col-span-full input-base resize-none" rows={2} placeholder="Aprendizado / reflexão" value={form.aprendizado} onChange={e => setForm(f => ({...f, aprendizado: e.target.value}))} />
            <div>
              <label className="text-xs text-stone-500 mb-2 block">Estrelas</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n} onClick={() => setForm(f => ({...f, estrelas: n}))}
                    className={`text-xl transition-colors ${n <= form.estrelas ? 'text-amber-400' : 'text-stone-200'}`}>★</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-stone-600">Vontade de repetir?</label>
              <button type="button" onClick={() => setForm(f => ({...f, vontade_repetir: !f.vontade_repetir}))}
                className={`w-10 h-5 rounded-full transition-colors ${form.vontade_repetir ? 'bg-rose-400' : 'bg-stone-200'} relative`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.vontade_repetir ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="col-span-full flex gap-2 justify-end">
              <button type="button" onClick={() => { setAdding(false); setEditId(null) }} className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">Salvar</button>
            </div>
          </form>
        </Card>
      )}

      {regs.length === 0 && !adding && (
        <EmptyState icon={BookOpen} title="Nenhum registro ainda" sub="Seus momentos ficam guardados aqui, com privacidade" />
      )}

      <div className="space-y-3">
        {regs.map(r => {
          const expanded = expandId === r.id
          return (
            <Card key={r.id} className="overflow-hidden">
              <button onClick={() => setExpandId(expanded ? null : r.id)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-800">{r.titulo}</span>
                      {r.vontade_repetir && <Heart size={13} className="text-rose-400 fill-rose-300" />}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-stone-400 mt-1">
                      {r.data && <span>{format(parseISO(r.data), "dd/MM/yyyy", {locale: ptBR})}</span>}
                      {r.com_quem && <span>· {r.com_quem}</span>}
                      {r.estrelas && <span className="text-amber-400">{'★'.repeat(r.estrelas)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {expanded ? <ChevronUp size={16} className="text-stone-400"/> : <ChevronDown size={16} className="text-stone-400"/>}
                  </div>
                </div>
              </button>
              {expanded && (
                <div className="px-4 pb-4 border-t border-stone-50">
                  {r.local && <p className="text-sm text-stone-500 mt-3"><span className="font-medium">Local:</span> {r.local}</p>}
                  {r.notas && (
                    <div className="mt-3 bg-rose-50 rounded-xl p-3">
                      <p className="text-xs text-rose-400 font-medium mb-1 flex items-center gap-1"><Lock size={10}/> Privado</p>
                      <p className="text-sm text-stone-600 italic">"{r.notas}"</p>
                    </div>
                  )}
                  {r.aprendizado && <p className="text-sm text-stone-500 mt-3"><span className="font-medium">Reflexão:</span> {r.aprendizado}</p>}
                  <div className="flex justify-end gap-2 mt-3">
                    <button onClick={() => startEdit(r)} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg"><Edit3 size={15}/></button>
                    <button onClick={() => remove(r.id)} className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Aba: Combinados ────────────────────────────────────────────────────────
function TabCombinados() {
  const { data: items, insert, remove, update } = useDB('vl_combinados')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const empty = { categoria: 'permitido', texto: '', detalhes: '', revisado_em: '' }
  const [form, setForm] = useState(empty)

  const grouped = useMemo(() => {
    const g = {}
    Object.keys(CAT_COMBINADO).forEach(k => { g[k] = [] })
    items.forEach(item => { if (g[item.categoria]) g[item.categoria].push(item) })
    return g
  }, [items])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.texto.trim()) return
    const data = { ...form, revisado_em: new Date().toISOString().split('T')[0] }
    if (editId) { await update(editId, data); setEditId(null) }
    else await insert(data)
    setForm(empty); setAdding(false)
  }

  const startEdit = (item) => {
    setForm({ categoria: item.categoria||'permitido', texto: item.texto||'', detalhes: item.detalhes||'', revisado_em: item.revisado_em||'' })
    setEditId(item.id); setAdding(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex-1">
          <ShieldCheck size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">Os combinados são os pilares da dinâmica de vocês. Mantenha sempre atualizados.</p>
        </div>
        <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors whitespace-nowrap flex-shrink-0">
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {adding && (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Categoria</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(CAT_COMBINADO).map(([k,v]) => (
                  <button type="button" key={k} onClick={() => setForm(f => ({...f, categoria: k}))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${form.categoria === k ? 'border-rose-400 bg-rose-50 text-rose-700 font-medium' : 'border-stone-200 text-stone-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${v.dot}`}/>{v.label}
                  </button>
                ))}
              </div>
            </div>
            <input required className="input-base w-full" placeholder="O combinado *" value={form.texto} onChange={e => setForm(f => ({...f, texto: e.target.value}))} />
            <textarea className="input-base w-full resize-none" rows={2} placeholder="Detalhes / contexto" value={form.detalhes} onChange={e => setForm(f => ({...f, detalhes: e.target.value}))} />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setAdding(false); setEditId(null) }} className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">Salvar</button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 && !adding && (
        <EmptyState icon={ShieldCheck} title="Nenhum combinado ainda" sub="Adicione as regras e acordos da dinâmica de vocês" />
      )}

      {Object.entries(grouped).map(([cat, catItems]) => {
        if (catItems.length === 0) return null
        const cfg = CAT_COMBINADO[cat]
        return (
          <Card key={cat} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
              <h3 className="font-semibold text-stone-700">{cfg.label} <span className="text-stone-400 font-normal text-sm">({catItems.length})</span></h3>
            </div>
            <div className="space-y-2">
              {catItems.map(item => (
                <div key={item.id} className="flex items-start gap-3 group">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700">{item.texto}</p>
                    {item.detalhes && <p className="text-xs text-stone-400 mt-0.5">{item.detalhes}</p>}
                    {item.revisado_em && <p className="text-xs text-stone-300 mt-0.5">Revisado em {item.revisado_em}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(item)} className="p-1 text-stone-400 hover:text-stone-600 rounded"><Edit3 size={13}/></button>
                    <button onClick={() => remove(item.id)} className="p-1 text-stone-300 hover:text-red-400 rounded"><Trash2 size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Aba: Fantasias ─────────────────────────────────────────────────────────
function TabFantasias() {
  const { data: items, insert, remove, update } = useDB('vl_fantasias')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterCat, setFilterCat] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('todas')
  const empty = { titulo: '', descricao: '', categoria: 'casal', status: 'sugerido', de_quem: 'Vianka', prioridade: 'media', realizado_em: '' }
  const [form, setForm] = useState(empty)

  const filtered = useMemo(() => {
    if (!items) return []
    return items.filter(i => {
      if (filterCat !== 'todas' && i.categoria !== filterCat) return false
      if (filterStatus !== 'todas' && i.status !== filterStatus) return false
      return true
    })
  }, [items, filterCat, filterStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    const payload3 = { ...form, descricao: form.descricao || null, realizado_em: form.realizado_em || null }
    if (editId) { await update(editId, payload3); setEditId(null) }
    else await insert(payload3)
    setForm(empty); setAdding(false)
  }

  const marcarFeito = async (item) => {
    await update(item.id, { status: 'realizado', realizado_em: new Date().toISOString().split('T')[0] })
  }

  const startEdit = (item) => {
    setForm({ titulo: item.titulo||'', descricao: item.descricao||'', categoria: item.categoria||'casal', status: item.status||'sugerido', de_quem: item.de_quem||'Vianka', prioridade: item.prioridade||'media', realizado_em: item.realizado_em||'' })
    setEditId(item.id); setAdding(true)
  }

  const stats = useMemo(() => ({
    total: items.length,
    realizado: items.filter(i => i.status === 'realizado').length,
    aprovado: items.filter(i => i.status === 'aprovado').length,
    sugerido: items.filter(i => i.status === 'sugerido').length,
  }), [items])

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', val: stats.total, color: 'text-stone-600' },
            { label: 'Realizados', val: stats.realizado, color: 'text-green-600' },
            { label: 'Aprovados', val: stats.aprovado, color: 'text-blue-600' },
            { label: 'Sugeridos', val: stats.sugerido, color: 'text-amber-600' },
          ].map(s => (
            <Card key={s.label} className="p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-stone-400">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat('todas')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterCat==='todas' ? 'bg-rose-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>Todas</button>
          {Object.entries(CAT_FANTASIA).map(([k,v]) => (
            <button key={k} onClick={() => setFilterCat(k)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterCat===k ? 'bg-rose-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>{v.label}</button>
          ))}
        </div>
        <button onClick={() => { setAdding(true); setEditId(null); setForm(empty) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Nova fantasia
        </button>
      </div>

      {adding && (
        <Card className="p-5">
          <h3 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-rose-400" />
            {editId ? 'Editar' : 'Nova fantasia'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required className="col-span-full input-base" placeholder="Título *" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} />
            <textarea className="col-span-full input-base resize-none" rows={2} placeholder="Descrição" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} />
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Categoria</label>
              <select className="input-base w-full" value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
                {Object.entries(CAT_FANTASIA).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Status</label>
              <select className="input-base w-full" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                <option value="sugerido">Sugerido</option>
                <option value="aprovado">Aprovado</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">De quem é a ideia</label>
              <select className="input-base w-full" value={form.de_quem} onChange={e => setForm(f => ({...f, de_quem: e.target.value}))}>
                <option>Vianka</option>
                <option>Bruno</option>
                <option>Ambos</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Prioridade</label>
              <select className="input-base w-full" value={form.prioridade} onChange={e => setForm(f => ({...f, prioridade: e.target.value}))}>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="col-span-full flex gap-2 justify-end">
              <button type="button" onClick={() => { setAdding(false); setEditId(null) }} className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">Salvar</button>
            </div>
          </form>
        </Card>
      )}

      {filtered.length === 0 && !adding && (
        <EmptyState icon={Sparkles} title="Nenhuma fantasia aqui" sub="Guardem tudo o que sonham juntos" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(item => {
          const catCfg = CAT_FANTASIA[item.categoria] || CAT_FANTASIA.casal
          const isFeito = item.status === 'realizado'
          const isAprovado = item.status === 'aprovado'
          return (
            <Card key={item.id} className={`p-4 ${isFeito ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={catCfg.color}>{catCfg.label}</Badge>
                  {isFeito && <Badge className="bg-green-50 text-green-700 border-green-200">✓ Realizado</Badge>}
                  {isAprovado && <Badge className="bg-blue-50 text-blue-700 border-blue-200">Aprovado</Badge>}
                </div>
                {item.prioridade === 'alta' && <Flame size={15} className="text-red-400 flex-shrink-0" />}
              </div>
              <p className={`font-semibold text-stone-800 mb-1 ${isFeito ? 'line-through text-stone-400' : ''}`}>{item.titulo}</p>
              {item.descricao && <p className="text-sm text-stone-500">{item.descricao}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-stone-400">Ideia de {item.de_quem}</span>
                <div className="flex gap-1">
                  {!isFeito && (
                    <button onClick={() => marcarFeito(item)} title="Marcar como realizado"
                      className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle2 size={15}/></button>
                  )}
                  <button onClick={() => startEdit(item)} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg"><Edit3 size={14}/></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                </div>
              </div>
              {item.realizado_em && <p className="text-xs text-stone-300 mt-1">Em {item.realizado_em}</p>}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

// ── TAB ELA — Perfil de Conquistas da Vianka ─────────────────────────────────
function TabEla() {
  const { data: conquistas, loading, insert, update, remove } = useDB('vl_conquistas', { order:'data_conquista', asc:false })
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const empty = { titulo:'', descricao:'', data_conquista:'', categoria:'saida', nivel:1, emoji:'🏆' }
  const [form, setForm] = useState(empty)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const CATS = {
    saida:     { label: 'Saída sozinha', color: 'bg-rose-100 text-rose-700' },
    encontro:  { label: 'Encontro',      color: 'bg-pink-100 text-pink-700'  },
    viagem:    { label: 'Viagem solo',   color: 'bg-indigo-100 text-indigo-700' },
    pessoal:   { label: 'Pessoal',       color: 'bg-emerald-100 text-emerald-700' },
    casal:     { label: 'Do casal',      color: 'bg-amber-100 text-amber-700' },
  }

  const EMOJIS = ['🏆','⭐','🌟','✨','💪','🦋','🌸','🔥','💃','🎯','🌈','💎','🚀','❤️','🥳']
  const NIVEIS = ['','Iniciante','Exploradora','Confiante','Ousada','Lendária']

  const handleSubmit = async () => {
    if (!form.titulo.trim()) return
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      data_conquista: form.data_conquista || null,
      categoria: form.categoria,
      nivel: parseInt(form.nivel) || 1,
      emoji: form.emoji || '🏆',
    }
    if (editItem) { await update(editItem.id, payload); setEditItem(null) }
    else await insert(payload)
    setForm(empty); setShowForm(false)
  }
  const startEdit = (c) => {
    setForm({ titulo:c.titulo, descricao:c.descricao||'', data_conquista:c.data_conquista||'', categoria:c.categoria||'saida', nivel:c.nivel||1, emoji:c.emoji||'🏆' })
    setEditItem(c); setShowForm(true)
  }

  const totalPontos = conquistas.reduce((s,c) => s + (c.nivel||1), 0)
  const nivelGeral = totalPontos < 5 ? 1 : totalPontos < 12 ? 2 : totalPontos < 22 ? 3 : totalPontos < 35 ? 4 : 5

  const iCls = { backgroundColor:'#ffffff', color:'#1c1917', border:'1px solid #d6d3d1', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', width:'100%', outline:'none' }

  return (
    <div className="space-y-4">
      {/* Perfil */}
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 rounded-2xl p-5 border border-rose-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-sm">
            💃
          </div>
          <div>
            <p className="text-lg font-bold text-stone-800">Vianka</p>
            <p className="text-sm text-rose-600 font-medium">{NIVEIS[nivelGeral]} ✨</p>
            <div className="flex gap-0.5 mt-1">
              {Array.from({length:5}).map((_,i) => (
                <div key={i} className={`h-2 w-8 rounded-full ${i < nivelGeral ? 'bg-rose-400' : 'bg-rose-100'}`} />
              ))}
            </div>
          </div>
          <div className="ml-auto text-center">
            <p className="text-2xl font-bold text-rose-500">{conquistas.length}</p>
            <p className="text-xs text-stone-400">conquistas</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {Object.entries(CATS).map(([k,v]) => {
            const count = conquistas.filter(c=>c.categoria===k).length
            return (
              <div key={k} className="bg-white/60 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-stone-700">{count}</p>
                <p className="text-xs text-stone-400 truncate">{v.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={() => { setShowForm(true); setEditItem(null); setForm(empty) }}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl py-3 text-sm font-medium transition-all">
        <Plus className="w-4 h-4" /> Registrar Conquista
      </button>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">{editItem ? 'Editar' : 'Nova Conquista'}</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null) }}><X className="w-4 h-4 text-stone-400" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Emoji</label>
              <div className="flex gap-1 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => set('emoji', e)}
                    className={`text-xl p-1 rounded-lg ${form.emoji===e ? 'bg-rose-100 scale-125' : 'hover:bg-stone-100'}`}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Conquista *</label>
              <input style={iCls} value={form.titulo} onChange={e=>set('titulo',e.target.value)} placeholder="Primeira saída sozinha, Viagem solo para SP..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Categoria</label>
                <select style={iCls} value={form.categoria} onChange={e=>set('categoria',e.target.value)}>
                  {Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Data</label>
                <input type="date" style={iCls} value={form.data_conquista} onChange={e=>set('data_conquista',e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Nível ({NIVEIS[form.nivel]})</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set('nivel',n)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.nivel===n ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Como foi? O que sentiu?</label>
              <textarea style={{...iCls, resize:'none'}} rows={2} value={form.descricao} onChange={e=>set('descricao',e.target.value)} placeholder="Descreva essa conquista, como se sentiu, o que foi especial..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium">
              {editItem ? 'Salvar' : 'Registrar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditItem(null) }} className="px-4 py-2 text-stone-500 text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-center text-stone-400 py-8">Carregando...</p> :
        conquistas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🦋</div>
            <p className="font-medium text-stone-500 mb-1">Nenhuma conquista ainda</p>
            <p className="text-sm text-stone-400">Cada passo é uma conquista. Registre o primeiro!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conquistas.map(c => {
              const cat = CATS[c.categoria] || CATS['saida']
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{c.emoji || '🏆'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-stone-800">{c.titulo}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-400">
                          {c.data_conquista && <span>📅 {new Date(c.data_conquista+'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                          <span className="font-medium text-rose-500">Nível {c.nivel} — {NIVEIS[c.nivel]}</span>
                        </div>
                        {c.descricao && <p className="text-sm text-stone-600 italic mt-1.5">"{c.descricao}"</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => startEdit(c)} className="p-1 text-stone-300 hover:text-amber-500"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(c.id)} className="p-1 text-stone-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}

// ─── Tab: Mimos da Vianka ──────────────────────────────────────────────────
function TabMimos() {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [form, setForm] = useState({
    title: '', description: '', category: 'pessoal', estimated_cost: '',
    status: 'pendente', priority: 'média'
  })
  const { data: wishes, insert, update, remove } = useDB('wishes')

  const CATEGORIES = ['pessoal', 'beleza', 'roupa', 'viagem', 'experiência', 'tecnologia', 'casa', 'outro']
  const PRIORITY_COLORS = {
    baixa: 'bg-stone-100 text-stone-500',
    média: 'bg-amber-100 text-amber-700',
    alta: 'bg-orange-100 text-orange-700',
    urgente: 'bg-rose-100 text-rose-600'
  }

  const filtered = filterStatus === 'todos'
    ? wishes
    : wishes.filter(w => w.status === filterStatus)

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null
    }
    if (editing) {
      await update(editing.id, payload)
      setEditing(null)
    } else {
      await insert(payload)
      setAdding(false)
    }
    setForm({ title: '', description: '', category: 'pessoal', estimated_cost: '', status: 'pendente', priority: 'média' })
  }

  const [pendingAction, setPendingAction] = useState(null) // { id, title, type }
  const [pendingComment, setPendingComment] = useState('')

  const startAction = (w, type) => {
    setPendingAction({ id: w.id, title: w.title, type })
    setPendingComment('')
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    const { id, title, type } = pendingAction
    await update(id, { status: type, resposta: pendingComment.trim() || null })
    const comment = pendingComment.trim() ? ` — "${pendingComment.trim()}"` : ''
    if (type === 'aprovado') instantNotify('✅ Mimo Aprovado', `Você aprovou "${title}"${comment}`)
    else instantNotify('❌ Mimo Negado', `Você negou "${title}"${comment}`)
    setPendingAction(null)
    setPendingComment('')
  }

  const pending = wishes.filter(w => w.status === 'pendente').length
  const approved = wishes.filter(w => w.status === 'aprovado').length

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-pink-500">{pending}</p>
          <p className="text-xs text-stone-400">Pendentes</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-teal-500">{approved}</p>
          <p className="text-xs text-stone-400">Aprovados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-stone-500">{wishes.length}</p>
          <p className="text-xs text-stone-400">Total</p>
        </div>
      </div>

      {(adding || editing) && (
        <form onSubmit={handleSave} className="card space-y-3 border-2 border-pink-200">
          <input className="input" placeholder="Desejo / Mimo *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <textarea className="input" placeholder="Descrição..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <div className="grid grid-cols-2 gap-2">
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <input className="input" type="number" step="0.01" placeholder="Valor estimado" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {['baixa', 'média', 'alta', 'urgente'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['pendente', 'aprovado', 'negado', 'realizado'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 rounded-lg bg-pink-500 text-white text-sm font-medium">Salvar</button>
            <button type="button" onClick={() => { setAdding(false); setEditing(null) }} className="w-10 h-10 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {!adding && !editing && (
        <button onClick={() => setAdding(true)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Desejo
        </button>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['todos', 'pendente', 'aprovado', 'negado', 'realizado'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' + (filterStatus === s ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500')}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <Heart className="w-10 h-10 text-stone-200 mx-auto mb-2" />
            <p className="text-stone-400 text-sm">Nenhum desejo aqui ainda 💝</p>
          </div>
        )}
        {filtered.map(w => (
          <div key={w.id} className="card">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-stone-700">{w.title}</span>
                  <span className={'text-xs px-2 py-0.5 rounded-full ' + (PRIORITY_COLORS[w.priority] || 'bg-stone-100 text-stone-500')}>{w.priority}</span>
                </div>
                {w.description && <p className="text-xs text-stone-400 mt-0.5">{w.description}</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-stone-400">{w.category}</span>
                  {w.estimated_cost && <span className="text-xs text-stone-500 font-medium">R$ {parseFloat(w.estimated_cost).toFixed(2)}</span>}
                  <span className={'text-xs px-2 py-0.5 rounded-full ' + (w.status === 'aprovado' ? 'bg-teal-100 text-teal-700' : w.status === 'negado' ? 'bg-rose-100 text-rose-600' : w.status === 'realizado' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700')}>{w.status}</span>
                </div>
                {w.resposta && (
                  <p className="text-xs text-stone-400 mt-1.5 italic flex items-start gap-1">
                    <MessageCircle size={10} className="mt-0.5 flex-shrink-0 text-rose-300" /> "{w.resposta}"
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                {w.status === 'pendente' && pendingAction?.id !== w.id && (
                  <>
                    <button onClick={() => startAction(w, 'aprovado')} className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 hover:bg-teal-200 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startAction(w, 'negado')} className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-200 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button onClick={() => { setEditing(w); setForm({ title: w.title || '', description: w.description || '', category: w.category || 'pessoal', estimated_cost: w.estimated_cost || '', status: w.status || 'pendente', priority: w.priority || 'média' }); setAdding(false) }} className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(w.id)} className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-rose-100 hover:text-rose-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Inline comment input when action pending */}
            {pendingAction?.id === w.id && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <p className="text-xs font-medium text-stone-500 mb-2">
                  {pendingAction.type === 'aprovado' ? '✅ Aprovar' : '❌ Negar'} "{w.title}"
                </p>
                <textarea
                  className="w-full input-base resize-none text-sm"
                  placeholder="Comentário opcional (ela verá na notificação)..."
                  rows={2}
                  value={pendingComment}
                  onChange={e => setPendingComment(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={confirmAction}
                    className={`flex-1 py-2 rounded-xl text-white text-sm font-medium transition-colors ${pendingAction.type === 'aprovado' ? 'bg-teal-500 hover:bg-teal-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                    {pendingAction.type === 'aprovado' ? 'Confirmar aprovação' : 'Confirmar negação'}
                  </button>
                  <button onClick={() => { setPendingAction(null); setPendingComment('') }}
                    className="px-4 py-2 text-stone-400 text-sm hover:text-stone-600">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Diálogos Íntimos ────────────────────────────────────────────────
function TabQuestionario() {
  const [activeQ, setActiveQ] = useState(null)
  const [myAnswer, setMyAnswer] = useState('')
  const [answerBy, setAnswerBy] = useState('Bruno')
  const [addingQ, setAddingQ] = useState(false)
  const [editingQ, setEditingQ] = useState(null)
  const [filterCat, setFilterCat] = useState('todas')
  const [newQ, setNewQ] = useState({ pergunta: '', categoria: 'desejo', anonimo: false })
  const { data: questions, insert: insertQ, update: updateQ, remove: removeQ } = useDB('vl_questionario')

  const CATS = ['desejo', 'limite', 'fantasia', 'sentimento', 'combinado', 'outro']
  const CAT_COLORS = {
    desejo:     'bg-pink-100 text-pink-700 border-pink-200',
    limite:     'bg-red-100 text-red-700 border-red-200',
    fantasia:   'bg-purple-100 text-purple-700 border-purple-200',
    sentimento: 'bg-blue-100 text-blue-700 border-blue-200',
    combinado:  'bg-teal-100 text-teal-700 border-teal-200',
    outro:      'bg-stone-100 text-stone-600 border-stone-200',
  }

  const filtered = filterCat === 'todas' ? questions : questions.filter(q => q.categoria === filterCat)

  const handleSubmitAnswer = async () => {
    if (!myAnswer.trim() || !activeQ) return
    const existing = activeQ.respostas || []
    const answers = [...existing, { texto: myAnswer.trim(), de: answerBy, data: new Date().toISOString() }]
    await updateQ(activeQ.id, { respostas: answers })
    setMyAnswer('')
    setActiveQ(null)
  }

  const handleAddQ = async (e) => {
    e.preventDefault()
    if (!newQ.pergunta.trim()) return
    if (editingQ) {
      await updateQ(editingQ.id, { pergunta: newQ.pergunta, categoria: newQ.categoria, anonimo: newQ.anonimo })
      setEditingQ(null)
    } else {
      await insertQ({ ...newQ, respostas: [] })
    }
    setNewQ({ pergunta: '', categoria: 'desejo', anonimo: false })
    setAddingQ(false)
  }

  const startEditQ = (q, e) => {
    e.stopPropagation()
    setNewQ({ pergunta: q.pergunta, categoria: q.categoria, anonimo: q.anonimo || false })
    setEditingQ(q)
    setAddingQ(true)
    setActiveQ(null)
  }

  const handleRemoveQ = async (q, e) => {
    e.stopPropagation()
    if (window.confirm('Apagar esta pergunta?')) await removeQ(q.id)
  }

  const deleteAnswer = async (q, idx) => {
    const answers = (q.respostas || []).filter((_, i) => i !== idx)
    await updateQ(q.id, { respostas: answers })
    // Refresh the activeQ with updated answers
    setActiveQ(prev => prev ? { ...prev, respostas: answers } : null)
  }

  // ── Dialog: full detail of a question ──────────────────────────────────────
  if (activeQ) {
    const fresh = questions.find(q => q.id === activeQ.id) || activeQ
    const allAnswers = fresh.respostas || []
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveQ(null)} className="flex items-center gap-2 text-stone-500 text-sm hover:text-stone-700 transition-colors">
          <ChevronDown className="w-4 h-4 rotate-90" /> Voltar
        </button>

        <Card className="p-5">
          <Badge className={CAT_COLORS[fresh.categoria] || CAT_COLORS.outro}>{fresh.categoria}</Badge>
          <h3 className="text-lg font-semibold text-stone-800 mt-3 leading-snug">{fresh.pergunta}</h3>
          {fresh.anonimo && (
            <p className="text-xs text-stone-400 mt-2 flex items-center gap-1"><Lock size={10}/> Pergunta anônima</p>
          )}
        </Card>

        {allAnswers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Respostas</p>
            {allAnswers.map((r, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${r.de === 'Vianka' ? 'text-rose-500' : 'text-blue-500'}`}>
                        {r.de || 'Anônimo'}
                      </span>
                      {r.data && (
                        <span className="text-xs text-stone-300">{new Date(r.data).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">{r.texto}</p>
                  </div>
                  <button onClick={() => deleteAnswer(fresh, i)} className="p-1 text-stone-200 hover:text-red-400 flex-shrink-0 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-5">
          <p className="text-sm font-medium text-stone-600 mb-3">Adicionar resposta</p>
          <div className="flex gap-2 mb-3">
            {['Bruno', 'Vianka'].map(name => (
              <button key={name} type="button" onClick={() => setAnswerBy(name)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${answerBy === name ? 'bg-rose-500 text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                {name}
              </button>
            ))}
          </div>
          <textarea
            className="w-full input-base resize-none"
            placeholder={`Resposta de ${answerBy}...`}
            rows={4}
            value={myAnswer}
            onChange={e => setMyAnswer(e.target.value)}
          />
          <button onClick={handleSubmitAnswer}
            className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Enviar Resposta
          </button>
        </Card>
      </div>
    )
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
        <p className="text-sm text-stone-600">
          Espaço seguro para perguntas íntimas, desejos, limites e conversas honestas entre vocês dois.
        </p>
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button onClick={() => setFilterCat('todas')}
          className={'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' + (filterCat === 'todas' ? 'bg-purple-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}>
          Todas
        </button>
        {CATS.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' + (filterCat === c ? 'bg-purple-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {addingQ && (
        <Card className="p-5">
          <form onSubmit={handleAddQ} className="space-y-3">
            <textarea
              className="input-base w-full resize-none"
              placeholder="Escreva a pergunta..."
              rows={3}
              value={newQ.pergunta}
              onChange={e => setNewQ(p => ({ ...p, pergunta: e.target.value }))}
              required
            />
            <div className="flex items-center gap-2">
              <select className="input-base flex-1" value={newQ.categoria} onChange={e => setNewQ(p => ({ ...p, categoria: e.target.value }))}>
                {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer px-2 whitespace-nowrap">
                <input type="checkbox" checked={newQ.anonimo} onChange={e => setNewQ(p => ({ ...p, anonimo: e.target.checked }))} className="w-4 h-4 rounded" />
                Anônimo
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors">
                {editingQ ? 'Salvar alteração' : 'Adicionar'}
              </button>
              <button type="button" onClick={() => { setAddingQ(false); setEditingQ(null); setNewQ({ pergunta: '', categoria: 'desejo', anonimo: false }) }}
                className="px-4 py-2 text-stone-400 text-sm hover:text-stone-600 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {!addingQ && (
        <button onClick={() => { setAddingQ(true); setEditingQ(null) }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nova Pergunta
        </button>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Nenhuma pergunta ainda" sub="Comece com uma pergunta honesta" />
      ) : (
        <div className="space-y-2">
          {filtered.map(q => {
            const allR = q.respostas || []
            const brunoR = allR.filter(r => r.de === 'Bruno')
            const viankaR = allR.filter(r => r.de === 'Vianka')
            return (
              <Card key={q.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setActiveQ(q); setMyAnswer('') }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge className={CAT_COLORS[q.categoria] || CAT_COLORS.outro}>{q.categoria}</Badge>
                      {allR.length > 0 && (
                        <span className="text-xs text-stone-400">{allR.length} resp.</span>
                      )}
                      {q.anonimo && (
                        <span className="text-xs text-stone-400 flex items-center gap-0.5"><Lock size={9}/> anônima</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-700 line-clamp-2">{q.pergunta}</p>
                    {allR.length > 0 && (
                      <div className="flex gap-3 mt-1.5 text-xs">
                        {brunoR.length > 0 && <span className="text-blue-500 font-medium">Bruno ✓</span>}
                        {viankaR.length > 0 && <span className="text-rose-500 font-medium">Vianka ✓</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={e => startEditQ(q, e)} className="p-1.5 text-stone-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><Edit3 size={13}/></button>
                    <button onClick={e => handleRemoveQ(q, e)} className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13}/></button>
                    <ChevronUp className="w-4 h-4 text-stone-300 rotate-90" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
// ─── Constantes para TabObjetivos ────────────────────────────────────────────
const OBJ_CORES = {
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400',  title: 'text-amber-800'  },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   dot: 'bg-rose-400',   title: 'text-rose-800'   },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-400', title: 'text-violet-800' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   dot: 'bg-teal-400',   title: 'text-teal-800'   },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-400',   title: 'text-blue-800'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  title: 'text-green-800'  },
  stone:  { bg: 'bg-stone-50',  border: 'border-stone-200',  dot: 'bg-stone-400',  title: 'text-stone-700'  },
}
const OBJ_EMOJIS = ['🌟','💒','🏠','✈️','🌍','💚','🐾','👶','💰','🕊️','🌿','❤️','🎯','🔑','🌙','🗺️']

function ObjetivoForm({ form, setForm, onSave, onCancel }) {
  const cor = OBJ_CORES[form.cor] || OBJ_CORES.amber
  return (
    <div className={`rounded-2xl border-2 p-5 space-y-3 ${cor.bg} ${cor.border}`}>
      {/* Emoji picker */}
      <div className="flex gap-1 flex-wrap">
        {OBJ_EMOJIS.map(e => (
          <button key={e} type="button" onClick={() => setForm(f => ({...f, emoji: e}))}
            className={`text-lg p-1 rounded-lg transition-all ${form.emoji === e ? 'bg-white shadow scale-110' : 'hover:bg-white/60'}`}>
            {e}
          </button>
        ))}
      </div>
      {/* Color picker */}
      <div className="flex gap-2.5 items-center">
        {Object.entries(OBJ_CORES).map(([k, v]) => (
          <button key={k} type="button" onClick={() => setForm(f => ({...f, cor: k}))}
            className={`w-5 h-5 rounded-full ${v.dot} transition-all ${form.cor === k ? 'ring-2 ring-offset-1 ring-stone-500 scale-125' : 'hover:scale-110'}`} />
        ))}
      </div>
      {/* Title */}
      <input
        className="w-full bg-white/60 border-0 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 placeholder-stone-400 outline-none focus:bg-white transition-colors"
        placeholder="Título (ex: Agora, Em 6 anos, Sonho grande...)"
        value={form.titulo}
        onChange={e => setForm(f => ({...f, titulo: e.target.value}))}
      />
      {/* Content */}
      <textarea
        className="w-full bg-white/60 border-0 rounded-xl px-3 py-2 text-sm text-stone-700 placeholder-stone-400 outline-none focus:bg-white transition-colors resize-none"
        placeholder="O que vocês querem construir juntos..."
        rows={9}
        value={form.conteudo}
        onChange={e => setForm(f => ({...f, conteudo: e.target.value}))}
        autoFocus
      />
      <div className="flex gap-2">
        <button onClick={onSave}
          className="flex-1 py-2.5 rounded-xl bg-white/80 text-stone-700 text-sm font-semibold hover:bg-white transition-colors shadow-sm">
          Salvar
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-stone-500 text-sm hover:text-stone-700 transition-colors">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Aba: Objetivos ─────────────────────────────────────────────────────────
const MANIFESTO_INICIAL = `noivar
Casar
Nosso apto
Apto funcional pra nós
Viver em paz no interior
Trabalhar e fazer dinheiro com propósito
Paz

Daqui uns 6 anos nos preparar pra partir e morar em um lugar de 1° mundo.
Enquanto isso, viajar, conhecer lugares — de preferência os que queremos morar no futuro.

Morar em casa sem muro, com grama verde, quintal fofo e talvez um pet prático.

Depois pensar em filhos.`

function TabObjetivos() {
  const { data: objetivos, insert, update, remove } = useDB('vl_objetivos', { order: 'ordem', asc: true })
  const [editId, setEditId] = useState(null)
  const [adding, setAdding] = useState(false)
  const emptyForm = { titulo: '', conteudo: '', cor: 'amber', emoji: '🌟' }
  const [form, setForm] = useState(emptyForm)

  const handleSave = async () => {
    if (!form.conteudo.trim()) return
    if (editId) {
      await update(editId, { titulo: form.titulo, conteudo: form.conteudo, cor: form.cor, emoji: form.emoji })
      setEditId(null)
    } else {
      await insert({ ...form, ordem: objetivos.length })
      setAdding(false)
    }
    setForm(emptyForm)
  }

  const startEdit = (obj) => {
    setForm({ titulo: obj.titulo || '', conteudo: obj.conteudo || '', cor: obj.cor || 'amber', emoji: obj.emoji || '🌟' })
    setEditId(obj.id)
    setAdding(false)
  }

  const cancel = () => { setEditId(null); setAdding(false); setForm(emptyForm) }

  const addManifesto = async () => {
    await insert({ titulo: 'Nosso Manifesto', conteudo: MANIFESTO_INICIAL, cor: 'violet', emoji: '🗺️', ordem: 0 })
  }

  // Empty state
  if (objetivos.length === 0 && !adding) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-5">
        <div className="text-6xl">🗺️</div>
        <div>
          <p className="font-bold text-stone-700 text-xl">Onde querem chegar?</p>
          <p className="text-stone-400 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
            Um espaço para os objetivos, sonhos e o manifesto de vida de vocês dois.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={addManifesto}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            🗺️ Começar com nosso manifesto
          </button>
          <button onClick={() => setAdding(true)}
            className="w-full py-3 rounded-2xl bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200 transition-colors">
            + Criar do zero
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!adding && editId === null && (
        <div className="flex justify-end">
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
            <Plus size={16} /> Novo bloco
          </button>
        </div>
      )}

      {adding && (
        <ObjetivoForm form={form} setForm={setForm} onSave={handleSave} onCancel={cancel} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {objetivos.map(obj => {
          const cor = OBJ_CORES[obj.cor] || OBJ_CORES.amber
          if (editId === obj.id) {
            return <ObjetivoForm key={obj.id} form={form} setForm={setForm} onSave={handleSave} onCancel={cancel} />
          }
          return (
            <div key={obj.id} className={`relative rounded-2xl border p-5 ${cor.bg} ${cor.border} group`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl flex-shrink-0">{obj.emoji || '🌟'}</span>
                  {obj.titulo && (
                    <h3 className={`font-bold text-sm truncate ${cor.title}`}>{obj.titulo}</h3>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEdit(obj)}
                    className="p-1.5 bg-white/70 hover:bg-white text-stone-500 rounded-lg transition-colors">
                    <Edit3 size={13}/>
                  </button>
                  <button onClick={() => remove(obj.id)}
                    className="p-1.5 bg-white/70 hover:bg-white text-stone-400 hover:text-red-400 rounded-lg transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{obj.conteudo}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Labels das tabs (mobile strip + desktop pills)
const TAB_LABELS = [
  'Agenda',
  'Registros',
  'Combinados',
  'Fantasias',
  'Mimos 💝',
  'Diálogos',
  'Ela 💃',
  'Objetivos 🗺️',
]

export function VidaLivrePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [prefilledRegistro, setPrefilledRegistro] = useState(null)

  // Ativa notificações Realtime para o parceiro
  useVidaLivreNotifications(user?.id)

  // Quando clica "Criar Registro" em uma saída aprovada, vai para tab Registros com dados pre-preenchidos
  const handleCreateRegistro = (saida) => {
    setPrefilledRegistro(saida)
    setTab(1)
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Cabeçalho mobile: título + tab strip horizontal ───────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-100 shadow-sm md:hidden">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <h1 className="text-base font-bold text-stone-800">Vida Livre 🌸</h1>
          <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-50 px-2.5 py-1 rounded-full font-medium">
            <Lock size={10} /> Privado
          </span>
        </div>
        {/* Tab strip — scroll horizontal, todas as categorias visíveis */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 no-scrollbar">
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setTab(i)}
              className={
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ' +
                (tab === i
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cabeçalho desktop: PageHeader + pills ────────────────────────── */}
      <div className="hidden md:block px-6 pt-6 pb-2">
        <PageHeader
          title="Vida Livre"
          subtitle="Espaço privado do casal"
          action={
            <span className="flex items-center gap-1.5 text-xs text-stone-400 bg-stone-100 px-3 py-1.5 rounded-full">
              <Lock size={10} /> Privado
            </span>
          }
        />
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar mt-4">
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setTab(i)}
              className={
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ' +
                (tab === i
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white text-stone-500 border border-stone-200 hover:border-rose-300')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 md:px-6 md:py-4">
        {tab === 0 && <TabAgenda onCreateRegistro={handleCreateRegistro} />}
        {tab === 1 && <TabRegistros prefill={prefilledRegistro} onClearPrefill={() => setPrefilledRegistro(null)} />}
        {tab === 2 && <TabCombinados />}
        {tab === 3 && <TabFantasias />}
        {tab === 4 && <TabMimos />}
        {tab === 5 && <TabQuestionario />}
        {tab === 6 && <TabEla />}
        {tab === 7 && <TabObjetivos />}
      </div>

    </div>
  )
}

export default VidaLivrePage
