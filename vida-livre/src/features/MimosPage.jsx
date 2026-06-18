import { useMemo, useState } from 'react'
import {
  Heart, Plus, Trash2, Edit3, Check, X, Sparkles, MessageCircle,
  Shirt, Handshake, Wallet, Gift,
} from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useLocalDB } from '../hooks/useLocalDB'
import { useSession } from '../contexts/SessionContext'
import { useSettings } from '../hooks/useSettings'
import { FilterPills, Badge } from '../components/ui/primitives'
import { logActivity } from '../lib/activity'
import {
  MIMO_PERIODICIDADE, MIMO_CATEGORIA, ACORDO_TIPO, MIMO_VARIAVEL_STATUS, MIMO_CONTEXTO, fmtBRL,
} from '../lib/constants'
import MimosLegenda, { MimoContextoBadge, ContextoSelector } from '../components/MimosLegenda'

const TABS = ['Fixos', 'Variáveis', 'Pedidos', 'Protocolo', 'Acordo']
const PERIODS = ['mensal', 'semestral', 'anual']
const WISH_CATEGORIES = ['pessoal', 'beleza', 'roupa', 'viagem', 'experiência', 'tecnologia', 'casa', 'outro']
const PRIORITY_COLORS = {
  baixa: 'bg-stone-500/20 text-stone-300',
  média: 'bg-amber-500/20 text-amber-300',
  alta: 'bg-orange-500/20 text-orange-300',
  urgente: 'bg-rose-500/20 text-rose-300',
}
const STATUS_COLORS = {
  pendente: 'bg-amber-500/20 text-amber-300',
  aprovado: 'bg-cyan-500/20 text-cyan-300',
  negado: 'bg-rose-500/20 text-rose-300',
  realizado: 'bg-violet-500/20 text-violet-300',
}
const WISH_EMPTY = { title: '', description: '', como: '', category: 'pessoal', estimated_cost: '', status: 'pendente', priority: 'média', contexto: 'sozinha' }
const FIXO_EMPTY = { nome: '', valor: '', periodicidade: 'mensal', categoria: 'outro', nota: '', ativo: true, contexto: 'sozinha' }
const VARIAVEL_EMPTY = { nome: '', descricao: '', valor: '', contexto: 'sozinha' }

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export default function MimosPage() {
  const { user, isHer, canApproveMimos, canEditMimosFixos, canEditStructure } = useSession()
  const { settings } = useSettings()
  const [tab, setTab] = useState(0)
  const month = currentMonth()

  const { data: fixos, insert: insertFixo, update: updateFixo, remove: removeFixo } = useLocalDB('mimos_fixos', { order: 'ordem', asc: true })
  const { data: variaveis, insert: insertVar, update: updateVar, remove: removeVar } = useLocalDB('mimos_variaveis', { order: 'created_at', asc: false })
  const { data: templates, remove: removeTpl } = useLocalDB('saida_templates', { order: 'ordem', asc: true })
  const { data: acordo, update: updateAcordo, remove: removeAcordo } = useLocalDB('acordo_itens', { order: 'ordem', asc: true })

  const wishScope = isHer ? 'mine' : 'hers'
  const { data: wishes, insert: insertWish, update: updateWish, remove: removeWish } = useScopedDB('wishes', { scope: wishScope })

  const [addingFixo, setAddingFixo] = useState(false)
  const [fixoForm, setFixoForm] = useState(FIXO_EMPTY)
  const [editFixoId, setEditFixoId] = useState(null)

  const [addingVar, setAddingVar] = useState(false)
  const [varForm, setVarForm] = useState(VARIAVEL_EMPTY)
  const [editVarId, setEditVarId] = useState(null)

  const [addingWish, setAddingWish] = useState(false)
  const [editingWish, setEditingWish] = useState(null)
  const [wishForm, setWishForm] = useState(WISH_EMPTY)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [pendingAction, setPendingAction] = useState(null)
  const [pendingComment, setPendingComment] = useState('')

  const fixosByPeriod = useMemo(() => {
    const g = { mensal: [], semestral: [], anual: [] }
    fixos.filter((f) => f.ativo !== false).forEach((f) => {
      const p = f.periodicidade || 'mensal'
      if (g[p]) g[p].push(f)
    })
    return g
  }, [fixos])

  const totalMensal = fixosByPeriod.mensal.reduce((s, f) => s + (Number(f.valor) || 0), 0)
  const filteredWishes = filterStatus === 'todos' ? wishes : wishes.filter((w) => w.status === filterStatus)

  const obrigacoes = acordo.filter((a) => a.tipo === 'obrigacao')
  const entregas = acordo.filter((a) => a.tipo === 'entrega')

  const saveFixo = () => {
    if (!fixoForm.nome.trim() || !canEditMimosFixos) return
    const payload = {
      ...fixoForm,
      valor: Number(fixoForm.valor) || 0,
      ordem: editFixoId ? undefined : fixos.length,
    }
    if (editFixoId) { updateFixo(editFixoId, payload); setEditFixoId(null) }
    else { insertFixo(payload); setAddingFixo(false) }
    setFixoForm(FIXO_EMPTY)
  }

  const toggleUsado = (item) => {
    const used = item.usado_mes === month
    updateFixo(item.id, used ? { usado_mes: null, usado_por: null } : { usado_mes: month, usado_por: user })
  }

  const togglePago = (item) => {
    if (!canEditMimosFixos) return
    const paid = item.pago_mes === month
    updateFixo(item.id, paid ? { pago_mes: null, pago_por: null } : { pago_mes: month, pago_por: user })
  }

  const saveVar = () => {
    if (!varForm.nome.trim() || !canEditMimosFixos) return
    const payload = {
      nome: varForm.nome.trim(),
      descricao: varForm.descricao.trim() || null,
      valor: Number(varForm.valor) || null,
      status: 'disponivel',
      contexto: varForm.contexto || 'sozinha',
      criado_por: user,
      created_at: new Date().toISOString(),
    }
    if (editVarId) {
      updateVar(editVarId, { nome: payload.nome, descricao: payload.descricao, valor: payload.valor, contexto: payload.contexto })
      setEditVarId(null)
    } else {
      insertVar(payload)
      logActivity({ tipo: 'mimo_variavel', titulo: 'Novo mimo variável', mensagem: payload.nome, por: user, audience: 'her' })
      setAddingVar(false)
    }
    setVarForm(VARIAVEL_EMPTY)
  }

  const resgatarVar = (item) => {
    if (!isHer || item.status !== 'disponivel') return
    updateVar(item.id, { status: 'resgatado', resgatado_em: new Date().toISOString(), resgatado_por: user })
    logActivity({ tipo: 'mimo_resgatado', titulo: 'Mimo resgatado', mensagem: item.nome, por: user, audience: 'partner' })
  }

  const usarVar = (item) => {
    if (!isHer || item.status === 'usado') return
    updateVar(item.id, { status: 'usado', usado_em: new Date().toISOString(), usado_por: user })
    logActivity({ tipo: 'mimo_usado', titulo: 'Mimo usado', mensagem: item.nome, por: user, audience: 'partner' })
  }

  const submitWish = (e) => {
    e.preventDefault()
    const payload = {
      ...wishForm,
      estimated_cost: wishForm.estimated_cost ? parseFloat(wishForm.estimated_cost) : null,
      created_by: user,
      tipo: 'desejo',
    }
    if (editingWish) { updateWish(editingWish.id, payload); setEditingWish(null) }
    else {
      insertWish(payload)
      logActivity({ tipo: 'mimo_pedido', titulo: 'Novo pedido de mimo', mensagem: payload.title, por: user, audience: 'partner' })
      setAddingWish(false)
    }
    setWishForm(WISH_EMPTY)
  }

  const confirmAction = () => {
    if (!pendingAction) return
    updateWish(pendingAction.id, { status: pendingAction.type, resposta: pendingComment.trim() || null, responded_by: user })
    logActivity({
      tipo: pendingAction.type === 'aprovado' ? 'mimo_aprovado' : 'mimo_negado',
      titulo: pendingAction.type === 'aprovado' ? 'Mimo aprovado' : 'Mimo negado',
      mensagem: pendingAction.title,
      por: user,
      audience: 'her',
    })
    setPendingAction(null)
    setPendingComment('')
  }

  const toggleAcordoCheck = (item) => {
    const key = item.tipo === 'entrega' ? 'feito_mes' : 'feito_mes'
    const done = item[key] === month
    updateAcordo(item.id, done ? { [key]: null, feito_por: null } : { [key]: month, feito_por: user })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <MimosLegenda />
      <FilterPills options={TABS} value={TABS[tab]} onChange={(v) => setTab(TABS.indexOf(v))} />

      {/* ── FIXOS ── */}
      {tab === 0 && (
        <div className="space-y-4">
          <p className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-200">
            Manutenções fixas dela — entram na referência de Estética/Looks (ver Planejamento no menu).
          </p>
          <div className="vl-card-glow">
            <p className="text-xs text-[var(--color-vl-muted)]">Referência mensal (fixos mensais)</p>
            <p className="text-2xl font-bold text-rose-300">{fmtBRL(totalMensal)}</p>
            <p className="mt-1 text-xs text-[var(--color-vl-muted)]">
              {fixosByPeriod.mensal.filter((f) => f.usado_mes === month).length} de {fixosByPeriod.mensal.length} usados este mês
            </p>
          </div>

          {canEditMimosFixos && !addingFixo && !editFixoId && (
            <button className="vl-btn-primary w-full text-sm" onClick={() => setAddingFixo(true)}>
              <Plus size={14} /> Adicionar mimo fixo
            </button>
          )}

          {(addingFixo || editFixoId) && canEditMimosFixos && (
            <FixoForm form={fixoForm} setForm={setFixoForm} onSave={saveFixo} onCancel={() => { setAddingFixo(false); setEditFixoId(null); setFixoForm(FIXO_EMPTY) }} />
          )}

          {PERIODS.map((period) => {
            const items = fixosByPeriod[period]
            if (!items.length) return null
            const pt = MIMO_PERIODICIDADE[period]
            const subtotal = items.reduce((s, f) => s + (Number(f.valor) || 0), 0)
            return (
              <section key={period}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Badge className={pt.className}>{pt.label}</Badge>
                    <span className="text-[var(--color-vl-muted)]">{fmtBRL(subtotal)}{period === 'mensal' ? '/mês' : period === 'semestral' ? '/sem' : '/ano'}</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <FixoCard
                      key={item.id}
                      item={item}
                      month={month}
                      isHer={isHer}
                      canEdit={canEditMimosFixos}
                      onToggleUsado={() => toggleUsado(item)}
                      onTogglePago={() => togglePago(item)}
                      onEdit={() => { setFixoForm({ nome: item.nome, valor: item.valor, periodicidade: item.periodicidade, categoria: item.categoria || 'outro', nota: item.nota || '', ativo: item.ativo !== false, contexto: item.contexto || 'sozinha' }); setEditFixoId(item.id); setAddingFixo(false) }}
                      onRemove={() => removeFixo(item.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}

          {fixos.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-vl-muted)]">Nenhum mimo fixo ainda — recarregue se acabou de importar o batch.</p>
          )}
        </div>
      )}

      {/* ── VARIÁVEIS ── */}
      {tab === 1 && (
        <div className="space-y-4">
          <p className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            {canEditMimosFixos
              ? 'Mimos especiais que você cria para ela resgatar quando quiser.'
              : 'Mimos que ele preparou — resgate e marque quando usar.'}
          </p>

          {canEditMimosFixos && !addingVar && !editVarId && (
            <button className="vl-btn-primary w-full text-sm" onClick={() => setAddingVar(true)}>
              <Plus size={14} /> Adicionar mimo variável
            </button>
          )}

          {(addingVar || editVarId) && canEditMimosFixos && (
            <div className="vl-card space-y-3">
              <input className="vl-input" placeholder="Nome do mimo *" value={varForm.nome} onChange={(e) => setVarForm((f) => ({ ...f, nome: e.target.value }))} />
              <textarea className="vl-input resize-none" rows={2} placeholder="Descrição (opcional)" value={varForm.descricao} onChange={(e) => setVarForm((f) => ({ ...f, descricao: e.target.value }))} />
              <input className="vl-input" type="number" placeholder="Valor R$ (opcional)" value={varForm.valor} onChange={(e) => setVarForm((f) => ({ ...f, valor: e.target.value }))} />
              <ContextoSelector value={varForm.contexto} onChange={(contexto) => setVarForm((f) => ({ ...f, contexto }))} compact />
              <div className="flex gap-2">
                <button type="button" onClick={saveVar} className="vl-btn-primary flex-1">Salvar</button>
                <button type="button" onClick={() => { setAddingVar(false); setEditVarId(null); setVarForm(VARIAVEL_EMPTY) }} className="vl-btn-ghost">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {variaveis.length === 0 && (
              <div className="py-10 text-center">
                <Gift className="mx-auto mb-2 h-10 w-10 text-[var(--color-vl-muted)]/30" />
                <p className="text-sm text-[var(--color-vl-muted)]">Nenhum mimo variável ainda</p>
              </div>
            )}
            {variaveis.map((item) => {
              const st = MIMO_VARIAVEL_STATUS[item.status] || MIMO_VARIAVEL_STATUS.disponivel
              return (
                <div key={item.id} className="vl-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Gift size={14} className="text-cyan-300" />
                        <span className="font-medium">{item.nome}</span>
                        {item.valor != null && item.valor > 0 && (
                          <span className="text-sm font-bold text-rose-300">{fmtBRL(item.valor)}</span>
                        )}
                        <Badge className={st.className}>{st.label}</Badge>
                        <MimoContextoBadge contexto={item.contexto} size="xs" />
                      </div>
                      {item.descricao && <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{item.descricao}</p>}
                    </div>
                    {canEditMimosFixos && (
                      <div className="flex gap-1">
                        <button onClick={() => { setVarForm({ nome: item.nome, descricao: item.descricao || '', valor: item.valor || '', contexto: item.contexto || 'sozinha' }); setEditVarId(item.id); setAddingVar(false) }} className="vl-btn-icon"><Edit3 size={13} /></button>
                        <button onClick={() => removeVar(item.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                  {isHer && item.status !== 'usado' && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-vl-border)] pt-3">
                      {item.status === 'disponivel' && (
                        <button type="button" onClick={() => resgatarVar(item)} className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-200">
                          Resgatar
                        </button>
                      )}
                      {(item.status === 'disponivel' || item.status === 'resgatado') && (
                        <button type="button" onClick={() => usarVar(item)} className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-200">
                          Marcar como usado
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PEDIDOS ── */}
      {tab === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { val: wishes.filter((w) => w.status === 'pendente').length, label: 'Pendentes', color: 'text-rose-300' },
              { val: wishes.filter((w) => w.status === 'aprovado').length, label: 'Aprovados', color: 'text-cyan-300' },
              { val: wishes.length, label: 'Total', color: 'text-[var(--color-vl-text)]' },
            ].map((s) => (
              <div key={s.label} className="vl-card">
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-[var(--color-vl-muted)]">{s.label}</p>
              </div>
            ))}
          </div>

          {(addingWish || editingWish) && isHer && (
            <form onSubmit={submitWish} className="vl-card space-y-3 border-fuchsia-500/30">
              <input required className="vl-input" placeholder="Desejo / Mimo *" value={wishForm.title} onChange={(e) => setWishForm((f) => ({ ...f, title: e.target.value }))} />
              <textarea className="vl-input resize-none" rows={2} placeholder="Descrição..." value={wishForm.description} onChange={(e) => setWishForm((f) => ({ ...f, description: e.target.value }))} />
              <textarea className="vl-input resize-none" rows={2} placeholder="Como? Pra quê? O que vai rolar?" value={wishForm.como} onChange={(e) => setWishForm((f) => ({ ...f, como: e.target.value }))} />
              <ContextoSelector value={wishForm.contexto} onChange={(contexto) => setWishForm((f) => ({ ...f, contexto }))} />
              <div className="grid grid-cols-2 gap-2">
                <select className="vl-input" value={wishForm.category} onChange={(e) => setWishForm((f) => ({ ...f, category: e.target.value }))}>
                  {WISH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="vl-input" type="number" step="0.01" placeholder="Valor estimado" value={wishForm.estimated_cost} onChange={(e) => setWishForm((f) => ({ ...f, estimated_cost: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="vl-btn-primary flex-1">Salvar</button>
                <button type="button" className="vl-btn-icon" onClick={() => { setAddingWish(false); setEditingWish(null) }}><X size={16} /></button>
              </div>
            </form>
          )}

          {!addingWish && !editingWish && isHer && (
            <button className="vl-btn-primary w-full" onClick={() => setAddingWish(true)}>
              <Plus size={16} /> Novo pedido
            </button>
          )}

          {!isHer && (
            <p className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
              Pedidos dela — aprove ou negue aqui (ou use Pendências no menu).
            </p>
          )}

          <FilterPills options={['todos', 'pendente', 'aprovado', 'negado', 'realizado']} value={filterStatus} onChange={setFilterStatus} labelFn={(s) => s.charAt(0).toUpperCase() + s.slice(1)} />

          <div className="space-y-2">
            {filteredWishes.length === 0 && (
              <div className="py-10 text-center">
                <Heart className="mx-auto mb-2 h-10 w-10 text-[var(--color-vl-muted)]/30" />
                <p className="text-sm text-[var(--color-vl-muted)]">Nenhum desejo aqui ainda</p>
              </div>
            )}
            {filteredWishes.map((w) => (
              <div key={w.id} className="vl-card">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{w.title}</span>
                      <MimoContextoBadge contexto={w.contexto} size="xs" />
                      <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_COLORS[w.priority] || ''}`}>{w.priority}</span>
                    </div>
                    {w.description && <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]">{w.description}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-[var(--color-vl-muted)]">
                      <span>{w.category}</span>
                      {w.estimated_cost != null && <span>{fmtBRL(w.estimated_cost)}</span>}
                      <span className={`rounded-full px-2 py-0.5 ${STATUS_COLORS[w.status] || ''}`}>{w.status}</span>
                    </div>
                    {w.como && <p className="mt-1.5 flex items-start gap-1 text-xs italic text-[var(--color-vl-muted)]"><Sparkles size={10} className="mt-0.5 text-fuchsia-400" /> {w.como}</p>}
                    {w.resposta && <p className="mt-1.5 flex items-start gap-1 text-xs italic"><MessageCircle size={10} className="mt-0.5 text-rose-300" /> "{w.resposta}"</p>}
                  </div>
                  <div className="flex gap-1">
                    {w.status === 'pendente' && canApproveMimos && (
                      <>
                        <button onClick={() => setPendingAction({ id: w.id, title: w.title, type: 'aprovado' })} className="vl-btn-icon text-emerald-400"><Check size={14} /></button>
                        <button onClick={() => setPendingAction({ id: w.id, title: w.title, type: 'negado' })} className="vl-btn-icon text-rose-400"><X size={14} /></button>
                      </>
                    )}
                    {w.status === 'aprovado' && isHer && (
                      <button onClick={() => updateWish(w.id, { status: 'realizado' })} className="vl-btn-icon text-violet-400"><Sparkles size={14} /></button>
                    )}
                    {isHer && (
                      <>
                        <button onClick={() => { setEditingWish(w); setWishForm({ title: w.title || '', description: w.description || '', como: w.como || '', category: w.category || 'pessoal', estimated_cost: w.estimated_cost || '', status: w.status, priority: w.priority || 'média', contexto: w.contexto || 'sozinha' }) }} className="vl-btn-icon"><Edit3 size={14} /></button>
                        <button onClick={() => removeWish(w.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
                {pendingAction?.id === w.id && (
                  <div className="mt-3 border-t border-[var(--color-vl-border)] pt-3">
                    <textarea className="vl-input mb-2 resize-none text-sm" rows={2} placeholder="Comentário..." value={pendingComment} onChange={(e) => setPendingComment(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={confirmAction} className="vl-btn-primary flex-1 text-xs">Confirmar</button>
                      <button onClick={() => setPendingAction(null)} className="vl-btn-ghost text-xs">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PROTOCOLO SAÍDAS ── */}
      {tab === 3 && (
        <div className="space-y-4">
          {settings.saida_extra_nota && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">{settings.saida_extra_nota}</p>
          )}
          {templates.map((tpl) => (
            <div key={tpl.id} className="vl-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="flex items-center gap-2 font-semibold text-rose-200">
                  <Shirt size={16} /> {tpl.titulo}
                </h3>
                {canEditStructure && (
                  <button onClick={() => removeTpl(tpl.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
                )}
              </div>
              <p className="text-sm"><span className="text-[var(--color-vl-muted)]">Roupa:</span> {tpl.roupa}</p>
              <p className="text-sm"><span className="text-[var(--color-vl-muted)]">Mimos:</span> {tpl.mimos}</p>
            </div>
          ))}
          {settings.saida_pos_nota && (
            <p className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-center text-sm font-medium text-fuchsia-200">
              {settings.saida_pos_nota}
            </p>
          )}
          {templates.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-vl-muted)]">Templates de saída aparecem após import do batch.</p>
          )}
        </div>
      )}

      {/* ── ACORDO ── */}
      {tab === 4 && (
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <Handshake size={16} /> {ACORDO_TIPO.obrigacao.label}
            </h3>
            <div className="space-y-2">
              {obrigacoes.map((item) => (
                <AcordoRow key={item.id} item={item} month={month} isHer={isHer} canEdit={canEditStructure} onToggle={() => toggleAcordoCheck(item)} onRemove={() => removeAcordo(item.id)} />
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fuchsia-200">
              <Sparkles size={16} /> {ACORDO_TIPO.entrega.label}
            </h3>
            <div className="space-y-2">
              {entregas.map((item) => (
                <AcordoRow key={item.id} item={item} month={month} isHer={isHer} canEdit={canEditStructure} onToggle={() => toggleAcordoCheck(item)} onRemove={() => removeAcordo(item.id)} />
              ))}
            </div>
          </section>
          {acordo.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-vl-muted)]">Acordo do casal — recarregue se acabou de importar.</p>
          )}
        </div>
      )}
    </div>
  )
}

function FixoCard({ item, month, isHer, canEdit, onToggleUsado, onTogglePago, onEdit, onRemove }) {
  const used = item.usado_mes === month
  const paid = item.pago_mes === month
  const cat = MIMO_CATEGORIA[item.categoria] || item.categoria

  return (
    <div className="vl-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{item.nome}</span>
            <MimoContextoBadge contexto={item.contexto} size="xs" />
            <span className="text-sm font-bold text-rose-300">{fmtBRL(item.valor)}</span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-vl-muted)]">{cat}{item.nota ? ` · ${item.nota}` : ''}</p>
        </div>
        {canEdit && (
          <div className="flex gap-1">
            <button onClick={onEdit} className="vl-btn-icon"><Edit3 size={13} /></button>
            <button onClick={onRemove} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-vl-border)] pt-3">
        <button
          type="button"
          onClick={onToggleUsado}
          disabled={!isHer}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${used ? 'bg-violet-500/25 text-violet-200' : 'bg-[var(--color-vl-elevated)] text-[var(--color-vl-muted)]'} ${!isHer ? 'opacity-70' : ''}`}
        >
          <Check size={12} className="inline" /> {isHer ? 'Usei' : 'Ela usou'} {used ? '✓' : ''}
        </button>
        <button
          type="button"
          onClick={onTogglePago}
          disabled={!canEdit}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${paid ? 'bg-emerald-500/25 text-emerald-200' : 'bg-[var(--color-vl-elevated)] text-[var(--color-vl-muted)]'} ${!canEdit ? 'opacity-60' : ''}`}
        >
          <Wallet size={12} className="inline" /> Paguei {paid ? '✓' : ''}
        </button>
      </div>
    </div>
  )
}

function FixoForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="vl-card space-y-3">
      <input className="vl-input" placeholder="Nome *" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
      <ContextoSelector value={form.contexto || 'sozinha'} onChange={(contexto) => setForm((f) => ({ ...f, contexto }))} compact />
      <div className="grid grid-cols-2 gap-2">
        <input className="vl-input" type="number" placeholder="Valor R$" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} />
        <select className="vl-input" value={form.periodicidade} onChange={(e) => setForm((f) => ({ ...f, periodicidade: e.target.value }))}>
          {PERIODS.map((p) => <option key={p} value={p}>{MIMO_PERIODICIDADE[p].label}</option>)}
        </select>
        <select className="vl-input col-span-2" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
          {Object.entries(MIMO_CATEGORIA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <input className="vl-input" placeholder="Nota opcional" value={form.nota} onChange={(e) => setForm((f) => ({ ...f, nota: e.target.value }))} />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="vl-btn-primary flex-1">Salvar</button>
        <button type="button" onClick={onCancel} className="vl-btn-ghost">Cancelar</button>
      </div>
    </div>
  )
}

function AcordoRow({ item, month, isHer, canEdit, onToggle, onRemove }) {
  const done = item.feito_mes === month
  const canCheck = item.tipo === 'entrega' ? isHer : !isHer

  return (
    <div className="vl-card flex items-center gap-3 py-3">
      <button
        type="button"
        disabled={!canCheck}
        onClick={onToggle}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${done ? 'bg-emerald-500/25 text-emerald-300' : 'bg-[var(--color-vl-elevated)] text-[var(--color-vl-muted)]'}`}
      >
        <Check size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${done ? 'text-[var(--color-vl-muted)] line-through' : ''}`}>{item.texto}</p>
        {item.detalhes && <p className="text-xs text-[var(--color-vl-muted)]">{item.detalhes}</p>}
      </div>
      {canEdit && (
        <button onClick={onRemove} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
      )}
    </div>
  )
}
