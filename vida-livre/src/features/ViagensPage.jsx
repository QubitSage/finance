import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Globe, Plus, Trash2, Edit3, X, Plane, List, Luggage, Check, Circle,
} from 'lucide-react'
import { useLocalDB } from '../hooks/useLocalDB'
import SimulacaoPage from './SimulacaoPage'
import { BATCH_5_SIM_GASTOS } from '../data/batch-5-gastos-casal'
import {
  VIAGEM_STATUS, VIAGEM_TIPO, ROTEIRO_CATS, MALA_CATS, fmtBRL,
} from '../lib/constants'
import { Badge, EmptyState, FilterPills } from '../components/ui/primitives'

const TABS = ['Destinos', 'Roteiro', 'Mala', 'Gastos']
const TODAY = new Date().toISOString().split('T')[0]

const EMPTY_VIAGEM = {
  destino: '', pais: '', data_ida: '', data_volta: '', orcamento: '',
  status: 'sonho', tipo: 'casal', notas: '',
}

function fmtDate(d) {
  if (!d) return '—'
  try {
    return format(parseISO(d), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return d
  }
}

export default function ViagensPage() {
  const [tab, setTab] = useState(0)
  const [selectedViagemId, setSelectedViagemId] = useState('')

  const { data: viagens } = useLocalDB('viagens', { order: 'created_at', asc: false })

  const selectedViagem = viagens.find((v) => v.id === selectedViagemId) || viagens[0]

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="vl-card-glow">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Globe size={20} className="text-blue-300" /> Viagens
        </h2>
        <p className="mt-1 text-sm text-[var(--color-vl-muted)]">
          Destinos, roteiro, mala e orçamento mensal do casal.
        </p>
      </div>

      <FilterPills options={TABS} value={TABS[tab]} onChange={(v) => setTab(TABS.indexOf(v))} />

      {tab > 0 && viagens.length > 0 && (
        <select
          className="vl-input"
          value={selectedViagem?.id || ''}
          onChange={(e) => setSelectedViagemId(e.target.value)}
        >
          {viagens.map((v) => (
            <option key={v.id} value={v.id}>{v.destino}{v.pais ? ` · ${v.pais}` : ''}</option>
          ))}
        </select>
      )}

      {tab === 0 && <TabDestinos viagens={viagens} onSelectForPlan={(id) => { setSelectedViagemId(id); setTab(1) }} />}
      {tab === 1 && (
        selectedViagem
          ? <TabRoteiro viagemId={selectedViagem.id} viagemNome={selectedViagem.destino} />
          : <EmptyState icon={List} title="Crie um destino primeiro" sub="Adicione uma viagem na aba Destinos" />
      )}
      {tab === 2 && (
        selectedViagem
          ? <TabMala viagemId={selectedViagem.id} viagemNome={selectedViagem.destino} />
          : <EmptyState icon={Luggage} title="Crie um destino primeiro" sub="Adicione uma viagem na aba Destinos" />
      )}
      {tab === 3 && (
        <SimulacaoPage
          catCollection="sim_categorias"
          itemCollection="sim_itens"
          rendaKey="renda"
          seed={BATCH_5_SIM_GASTOS.categorias}
          emptyTitulo="Orçamento do casal"
          emptySub="Importe do batch ou comece com as categorias do CasalApp."
          emptyEmoji="💸"
          rendaLabel="Renda mensal do casal"
          embedded
        />
      )}
    </div>
  )
}

function TabDestinos({ viagens, onSelectForPlan }) {
  const { insert, update, remove } = useLocalDB('viagens')
  const [filter, setFilter] = useState('todas')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_VIAGEM)

  const filtered = filter === 'todas' ? viagens : viagens.filter((v) => v.status === filter)
  const totalOrc = viagens.filter((v) => v.status !== 'cancelada').reduce((s, v) => s + Number(v.orcamento || 0), 0)
  const realizadas = viagens.filter((v) => v.status === 'realizada').length
  const proxima = viagens
    .filter((v) => v.status === 'confirmada' && v.data_ida && v.data_ida >= TODAY)
    .sort((a, b) => a.data_ida.localeCompare(b.data_ida))[0]

  const save = () => {
    if (!form.destino.trim()) return
    const payload = {
      ...form,
      orcamento: form.orcamento ? parseFloat(form.orcamento) : null,
      pais: form.pais || null,
      data_ida: form.data_ida || null,
      data_volta: form.data_volta || null,
      notas: form.notas || null,
    }
    if (editId) { update(editId, payload); setEditId(null) }
    else insert(payload)
    setForm(EMPTY_VIAGEM)
    setShowForm(false)
  }

  const startEdit = (v) => {
    setForm({
      destino: v.destino || '', pais: v.pais || '', data_ida: v.data_ida || '',
      data_volta: v.data_volta || '', orcamento: v.orcamento || '', status: v.status || 'sonho',
      tipo: v.tipo || 'casal', notas: v.notas || '',
    })
    setEditId(v.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { val: viagens.length, label: 'Total', color: 'text-[var(--color-vl-text)]' },
          { val: realizadas, label: 'Realizadas', color: 'text-emerald-300' },
          { val: fmtBRL(totalOrc), label: 'Orçamento', color: 'text-amber-300', small: true },
        ].map((s) => (
          <div key={s.label} className="vl-card">
            <p className={`font-bold ${s.small ? 'text-sm' : 'text-2xl'} ${s.color}`}>{s.val}</p>
            <p className="text-xs text-[var(--color-vl-muted)]">{s.label}</p>
          </div>
        ))}
      </div>

      {proxima && (
        <div className="vl-card border-blue-500/30 bg-blue-500/10">
          <div className="flex items-center gap-3">
            <Plane className="text-blue-300" size={24} />
            <div>
              <p className="text-xs text-blue-200">Próxima confirmada</p>
              <p className="font-semibold">{proxima.destino}</p>
              <p className="text-xs text-[var(--color-vl-muted)]">
                {fmtDate(proxima.data_ida)}{proxima.data_volta ? ` → ${fmtDate(proxima.data_volta)}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterPills
          options={['todas', 'sonho', 'planejando', 'confirmada', 'realizada']}
          value={filter}
          onChange={setFilter}
          labelFn={(s) => (s === 'todas' ? 'Todas' : VIAGEM_STATUS[s]?.label || s)}
        />
        <button className="vl-btn-primary text-xs" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_VIAGEM) }}>
          <Plus size={14} /> Nova
        </button>
      </div>

      {showForm && (
        <ViagemForm form={form} setForm={setForm} onSave={save} onCancel={() => { setShowForm(false); setEditId(null) }} edit={!!editId} />
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Globe} title="Nenhuma viagem" sub="Adicione destinos dos sonhos e viagens planejadas" />
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => {
            const st = VIAGEM_STATUS[v.status] || VIAGEM_STATUS.sonho
            return (
              <div key={v.id} className="vl-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{v.destino}</h3>
                      {v.pais && <span className="text-xs text-[var(--color-vl-muted)]">📍 {v.pais}</span>}
                      <Badge className={st.className}>{st.label}</Badge>
                      <Badge className="bg-stone-500/15 text-stone-300">{VIAGEM_TIPO[v.tipo] || v.tipo}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--color-vl-muted)]">
                      {v.data_ida && <span>📅 {fmtDate(v.data_ida)}{v.data_volta ? ` → ${fmtDate(v.data_volta)}` : ''}</span>}
                      {v.orcamento > 0 && <span>💰 {fmtBRL(v.orcamento)}</span>}
                    </div>
                    {v.notas && <p className="mt-1 line-clamp-2 text-xs italic text-[var(--color-vl-muted)]">{v.notas}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => onSelectForPlan(v.id)} className="vl-btn-icon text-blue-300" title="Montar roteiro"><List size={13} /></button>
                    <button onClick={() => startEdit(v)} className="vl-btn-icon"><Edit3 size={13} /></button>
                    <button onClick={() => remove(v.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ViagemForm({ form, setForm, onSave, onCancel, edit }) {
  return (
    <div className="vl-card space-y-3">
      <input className="vl-input" placeholder="Destino *" value={form.destino} onChange={(e) => setForm((f) => ({ ...f, destino: e.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <input className="vl-input" placeholder="País / região" value={form.pais} onChange={(e) => setForm((f) => ({ ...f, pais: e.target.value }))} />
        <input className="vl-input" type="number" placeholder="Orçamento R$" value={form.orcamento} onChange={(e) => setForm((f) => ({ ...f, orcamento: e.target.value }))} />
        <input className="vl-input" type="date" value={form.data_ida} onChange={(e) => setForm((f) => ({ ...f, data_ida: e.target.value }))} />
        <input className="vl-input" type="date" value={form.data_volta} onChange={(e) => setForm((f) => ({ ...f, data_volta: e.target.value }))} />
        <select className="vl-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          {Object.entries(VIAGEM_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="vl-input" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
          {Object.entries(VIAGEM_TIPO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <textarea className="vl-input resize-none" rows={2} placeholder="Notas, links, ideias..." value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="vl-btn-primary flex-1">{edit ? 'Salvar' : 'Adicionar viagem'}</button>
        <button type="button" onClick={onCancel} className="vl-btn-ghost"><X size={16} /></button>
      </div>
    </div>
  )
}

function TabRoteiro({ viagemId, viagemNome }) {
  const { data: all, insert, update, remove } = useLocalDB('viagens_roteiro', { order: 'data_item', asc: true })
  const roteiro = all.filter((r) => r.viagem_id === viagemId)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ titulo: '', descricao: '', data_item: '', horario: '', local: '', categoria: 'atração', custo: '' })

  const grouped = useMemo(() => {
    const g = {}
    roteiro.forEach((item) => {
      const d = item.data_item || 'sem-data'
      if (!g[d]) g[d] = []
      g[d].push(item)
    })
    return g
  }, [roteiro])

  const totalCusto = roteiro.reduce((s, i) => s + Number(i.custo || 0), 0)

  const save = () => {
    if (!form.titulo.trim()) return
    const payload = {
      viagem_id: viagemId,
      titulo: form.titulo,
      descricao: form.descricao || null,
      data_item: form.data_item || null,
      horario: form.horario || null,
      local: form.local || null,
      categoria: form.categoria,
      custo: form.custo ? parseFloat(form.custo) : null,
    }
    if (editId) { update(editId, payload); setEditId(null) }
    else insert(payload)
    setForm({ titulo: '', descricao: '', data_item: '', horario: '', local: '', categoria: 'atração', custo: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-vl-muted)]">Roteiro: <strong className="text-[var(--color-vl-text)]">{viagemNome}</strong></p>
      {roteiro.length > 0 && (
        <div className="vl-card flex justify-between text-sm">
          <span>{roteiro.length} atividades</span>
          {totalCusto > 0 && <span className="font-bold text-amber-300">{fmtBRL(totalCusto)}</span>}
        </div>
      )}
      <button className="vl-btn-ghost w-full border border-dashed border-[var(--color-vl-border)]" onClick={() => setShowForm(true)}>
        <Plus size={14} /> Adicionar ao roteiro
      </button>
      {showForm && (
        <div className="vl-card space-y-3">
          <input className="vl-input" placeholder="Título *" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <select className="vl-input" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
              {Object.keys(ROTEIRO_CATS).map((k) => <option key={k} value={k}>{ROTEIRO_CATS[k].emoji} {k}</option>)}
            </select>
            <input className="vl-input" type="number" placeholder="Custo R$" value={form.custo} onChange={(e) => setForm((f) => ({ ...f, custo: e.target.value }))} />
            <input className="vl-input" type="date" value={form.data_item} onChange={(e) => setForm((f) => ({ ...f, data_item: e.target.value }))} />
            <input className="vl-input" type="time" value={form.horario} onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))} />
          </div>
          <input className="vl-input" placeholder="Local" value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} />
          <textarea className="vl-input resize-none" rows={2} placeholder="Notas..." value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
          <div className="flex gap-2">
            <button type="button" onClick={save} className="vl-btn-primary flex-1">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="vl-btn-ghost">Cancelar</button>
          </div>
        </div>
      )}
      {roteiro.length === 0 ? (
        <EmptyState icon={List} title="Roteiro vazio" sub="Monte o programa dia a dia desta viagem" />
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
          <div key={date}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-vl-muted)]">
              {date === 'sem-data' ? '📌 Sem data' : `📅 ${fmtDate(date)}`}
            </p>
            <div className="space-y-2">
              {items.map((item) => {
                const cat = ROTEIRO_CATS[item.categoria] || ROTEIRO_CATS.outros
                return (
                  <div key={item.id} className="vl-card flex items-start gap-3 py-3">
                    <span className="text-lg">{cat.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{item.titulo}</span>
                        <Badge className={cat.className}>{item.categoria}</Badge>
                      </div>
                      {item.horario && <p className="text-xs text-[var(--color-vl-muted)]">⏰ {item.horario}</p>}
                      {item.local && <p className="text-xs text-[var(--color-vl-muted)]">📍 {item.local}</p>}
                      {item.custo > 0 && <p className="text-xs text-amber-300">{fmtBRL(item.custo)}</p>}
                      {item.descricao && <p className="text-xs italic text-[var(--color-vl-muted)]">{item.descricao}</p>}
                    </div>
                    <button onClick={() => remove(item.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function TabMala({ viagemId, viagemNome }) {
  const { data: all, insert, update, remove } = useLocalDB('viagens_mala')
  const itens = all.filter((i) => i.viagem_id === viagemId)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('todas')
  const [form, setForm] = useState({ item: '', categoria: 'roupas', quantidade: 1 })

  const filtered = filter === 'todas' ? itens : itens.filter((i) => i.categoria === filter)
  const checked = itens.filter((i) => i.checked).length
  const progress = itens.length ? Math.round((checked / itens.length) * 100) : 0

  const add = () => {
    if (!form.item.trim()) return
    insert({ viagem_id: viagemId, item: form.item, categoria: form.categoria, quantidade: parseInt(form.quantidade, 10) || 1, checked: false })
    setForm({ item: '', categoria: 'roupas', quantidade: 1 })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-vl-muted)]">Mala: <strong className="text-[var(--color-vl-text)]">{viagemNome}</strong></p>
      {itens.length > 0 && (
        <div className="vl-card">
          <div className="mb-2 flex justify-between text-sm">
            <span>Progresso</span>
            <span className="font-bold text-amber-300">{checked}/{itens.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-vl-elevated)]">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          {progress === 100 && <p className="mt-2 text-center text-xs text-emerald-300">✈️ Mala completa!</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <FilterPills options={['todas', ...Object.keys(MALA_CATS)]} value={filter} onChange={setFilter} labelFn={(s) => (s === 'todas' ? 'Tudo' : `${MALA_CATS[s]} ${s}`)} />
        <button className="vl-btn-primary ml-auto text-xs" onClick={() => setShowForm(true)}><Plus size={14} /> Item</button>
      </div>
      {showForm && (
        <div className="vl-card grid grid-cols-2 gap-2">
          <input className="vl-input col-span-2" placeholder="Item *" value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} />
          <select className="vl-input" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
            {Object.entries(MALA_CATS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
          </select>
          <input className="vl-input" type="number" min={1} value={form.quantidade} onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))} />
          <button type="button" onClick={add} className="vl-btn-primary col-span-2">Adicionar</button>
        </div>
      )}
      {filtered.length === 0 ? (
        <EmptyState icon={Luggage} title="Lista vazia" sub="O que levar nesta viagem?" />
      ) : (
        <div className="vl-card divide-y divide-[var(--color-vl-border)] overflow-hidden p-0">
          {filtered.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${item.checked ? 'opacity-60' : ''}`}>
              <button type="button" onClick={() => update(item.id, { checked: !item.checked })} className="shrink-0 text-[var(--color-vl-muted)]">
                {item.checked ? <Check size={20} className="text-emerald-400" /> : <Circle size={20} />}
              </button>
              <span>{MALA_CATS[item.categoria] || '🎒'}</span>
              <span className={`flex-1 text-sm ${item.checked ? 'line-through' : ''}`}>
                {item.item}{item.quantidade > 1 ? ` ×${item.quantidade}` : ''}
              </span>
              <button onClick={() => remove(item.id)} className="vl-btn-icon hover:text-rose-400"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
