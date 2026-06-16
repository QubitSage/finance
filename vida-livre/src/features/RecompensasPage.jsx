import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Trophy, Zap, Gift, Plus, Trash2, Check,
  History, Sparkles, PartyPopper, Clock,
} from 'lucide-react'
import { useLocalDB } from '../hooks/useLocalDB'
import { useSession } from '../contexts/SessionContext'
import { MARCO_NIVEL, MARCO_TIPO } from '../lib/constants'
import { getSaldoPontos, conquistarMarco, resgatarPremio, registrarPontos } from '../lib/pontos'
import { Badge, EmptyState, FilterPills } from '../components/ui/primitives'

const TABS = ['Marcos', 'Prêmios', 'Histórico']
const MARCO_STATUS = {
  pendente: { label: 'A conquistar', className: 'bg-stone-500/15 text-stone-300 border-stone-500/30' },
  conquistado: { label: 'Conquistado', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  recompensado: { label: 'Recompensado', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
}

function EmptyMarcos({ isHer, onAddMarco, onAddPremio }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-16 text-center">
      <div className="text-6xl">🏆</div>
      <div>
        <p className="text-xl font-bold">Marcos & Recompensas</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-vl-muted)]">
          {isHer
            ? 'Registre o que você fez ou crie objetivos para conquistar depois.'
            : 'Vocês criam marcos aos poucos. Ela pode registrar o que fez; você ajusta e entrega prêmios.'}
        </p>
      </div>
      <button onClick={() => onAddMarco('feito')} className="vl-btn-primary w-full">
        <Plus size={16} className="inline" /> Eu fiz / realizei
      </button>
      <button onClick={() => onAddMarco('objetivo')} className="vl-btn-ghost w-full">
        Definir um objetivo
      </button>
      {!isHer && (
        <button onClick={onAddPremio} className="vl-btn-ghost w-full">
          <Gift size={16} className="inline" /> Criar prêmio
        </button>
      )}
    </div>
  )
}

export default function RecompensasPage() {
  const { user, canManageMarcos, canRegisterMarcos, isHer } = useSession()
  const { data: marcos, insert: insertMarco, update: updateMarco, remove: removeMarco } = useLocalDB('marcos', { order: 'ordem', asc: true })
  const { data: premios, insert: insertPremio, remove: removePremio } = useLocalDB('premios', { order: 'ordem', asc: true })
  const { data: historico, remove: removeHistorico } = useLocalDB('pontos_historico')
  const { data: resgates } = useLocalDB('resgates')

  const [tab, setTab] = useState(0)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [conquerModal, setConquerModal] = useState(null)
  const [conquerNote, setConquerNote] = useState('')
  const [addingMarco, setAddingMarco] = useState(false)
  const [addingPremio, setAddingPremio] = useState(false)
  const [marcoMode, setMarcoMode] = useState('objetivo')
  const [marcoForm, setMarcoForm] = useState({ titulo: '', descricao: '', emoji: '🌟', nivel: 1, pontos: 10, recompensa_sugerida: '', tipo: 'conquista' })
  const [premioForm, setPremioForm] = useState({ nome: '', descricao: '', emoji: '🎁', custo_pontos: 30 })

  const resetMarcoForm = () => {
    setMarcoForm({ titulo: '', descricao: '', emoji: '🌟', nivel: 1, pontos: 10, recompensa_sugerida: '', tipo: 'conquista' })
    setMarcoMode('objetivo')
  }

  const openMarcoForm = (mode = 'objetivo') => {
    setMarcoMode(mode)
    setAddingMarco(true)
  }

  const saveMarco = () => {
    if (!marcoForm.titulo.trim()) return
    const now = new Date().toISOString()
    const nota = marcoForm.descricao.trim() || null

    if (marcoMode === 'feito') {
      const row = insertMarco({
        ...marcoForm,
        status: 'conquistado',
        ordem: marcos.length,
        conquistado_em: now,
        conquistado_por: user,
        conquista_nota: nota,
        created_by: user,
      })
      conquistarMarco(row, user, nota)
    } else {
      insertMarco({
        ...marcoForm,
        status: 'pendente',
        ordem: marcos.length,
        created_by: user,
      })
    }
    resetMarcoForm()
    setAddingMarco(false)
  }

  const saldo = getSaldoPontos()
  const totalConquistados = marcos.filter((m) => m.status !== 'pendente').length
  const pendentes = marcos.filter((m) => m.status === 'pendente')

  const filteredMarcos = marcos.filter((m) => {
    if (filterStatus !== 'todos' && m.status !== filterStatus) return false
    if (filterTipo !== 'todos' && (m.tipo || 'conquista') !== filterTipo) return false
    return true
  })

  const historicoSorted = useMemo(
    () => [...historico].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [historico]
  )

  const handleConquer = () => {
    if (!conquerModal) return
    const now = new Date().toISOString()
    conquistarMarco(conquerModal, user, conquerNote.trim() || null)
    updateMarco(conquerModal.id, {
      status: 'conquistado',
      conquistado_em: now,
      conquistado_por: user,
      conquista_nota: conquerNote.trim() || null,
    })
    setConquerModal(null)
    setConquerNote('')
  }

  const markRecompensado = (marco) => {
    updateMarco(marco.id, {
      status: 'recompensado',
      recompensado_em: new Date().toISOString(),
      recompensado_por: user,
    })
  }

  const handleResgate = (premio) => {
    const result = resgatarPremio(premio, user)
    if (!result.ok) alert(result.error)
  }

  if (marcos.length === 0 && premios.length === 0 && !addingMarco && !addingPremio) {
    return (
      <EmptyMarcos
        isHer={isHer}
        onAddMarco={(mode) => openMarcoForm(mode)}
        onAddPremio={() => setAddingPremio(true)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Saldo */}
      <div className="vl-card-glow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-vl-muted)]">Saldo de pontos</p>
            <p className="flex items-center gap-2 text-3xl font-bold text-amber-300">
              <Zap size={24} className="text-amber-400" /> {saldo}
            </p>
          </div>
          <div className="text-right text-sm text-[var(--color-vl-muted)]">
            <p>{totalConquistados} marco(s) conquistados</p>
            <p>{resgates.length} resgate(s)</p>
          </div>
        </div>
        {pendentes.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-fuchsia-300">
            <Clock size={12} /> Próximo: {pendentes[0].emoji} {pendentes[0].titulo}
          </p>
        )}
      </div>

      <FilterPills options={TABS} value={TABS[tab]} onChange={(v) => setTab(TABS.indexOf(v))} />

      {/* ── MARCOS ── */}
      {tab === 0 && (
        <div className="space-y-4">
          {canRegisterMarcos && (
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" className="vl-btn-primary w-full text-sm" onClick={() => openMarcoForm('feito')}>
                <Sparkles size={16} className="inline" /> Eu fiz / realizei
              </button>
              <button type="button" className="vl-btn-ghost w-full border border-[var(--color-vl-border)] text-sm" onClick={() => openMarcoForm('objetivo')}>
                <Plus size={16} className="inline" /> Novo objetivo
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <FilterPills
                options={['todos', 'pendente', 'conquistado', 'recompensado']}
                value={filterStatus}
                onChange={setFilterStatus}
                labelFn={(s) => (s === 'todos' ? 'Todos' : MARCO_STATUS[s]?.label)}
              />
              <FilterPills
                options={['todos', 'conquista', 'ousadia']}
                value={filterTipo}
                onChange={setFilterTipo}
                labelFn={(s) => (s === 'todos' ? 'Todos tipos' : MARCO_TIPO[s]?.label || s)}
              />
            </div>
            <button className="vl-btn-ghost text-xs" onClick={() => openMarcoForm('objetivo')}>
              <Plus size={14} /> Marco
            </button>
          </div>

          {addingMarco && (
            <MarcoForm
              form={marcoForm}
              setForm={setMarcoForm}
              mode={marcoMode}
              setMode={setMarcoMode}
              isHer={isHer}
              onSave={saveMarco}
              onCancel={() => { setAddingMarco(false); resetMarcoForm() }}
            />
          )}

          {filteredMarcos.length === 0 && <EmptyState icon={Trophy} title="Nenhum marco" sub="Adicione ou mude o filtro" />}

          {filteredMarcos.map((marco) => (
            <MarcoCard
              key={marco.id}
              marco={marco}
              canManage={canRegisterMarcos}
              canEdit={canManageMarcos}
              onConquer={() => { setConquerModal(marco); setConquerNote('') }}
              onRecompensado={() => markRecompensado(marco)}
              onDelete={canManageMarcos ? () => removeMarco(marco.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* ── PRÊMIOS ── */}
      {tab === 1 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="vl-btn-primary text-xs" onClick={() => setAddingPremio(true)} disabled={!canManageMarcos}>
              <Plus size={14} /> Prêmio
            </button>
          </div>

          {addingPremio && canManageMarcos && (
            <PremioForm
              form={premioForm}
              setForm={setPremioForm}
              onSave={() => {
                if (!premioForm.nome.trim()) return
                insertPremio({ ...premioForm, ordem: premios.length, arquivado: false })
                setPremioForm({ nome: '', descricao: '', emoji: '🎁', custo_pontos: 30 })
                setAddingPremio(false)
              }}
              onCancel={() => setAddingPremio(false)}
            />
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {premios.filter((p) => !p.arquivado).map((premio) => {
              const pode = saldo >= premio.custo_pontos
              const pct = Math.min(100, Math.round((saldo / premio.custo_pontos) * 100))
              return (
                <div key={premio.id} className={`vl-card ${pode ? 'border-amber-500/40' : ''}`}>
                  <div className="mb-3 flex items-start gap-3">
                    <span className="text-3xl">{premio.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{premio.nome}</h3>
                      {premio.descricao && <p className="text-xs text-[var(--color-vl-muted)]">{premio.descricao}</p>}
                    </div>
                    <button onClick={() => removePremio(premio.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-[var(--color-vl-muted)]">Custo</span>
                      <span className="font-bold text-amber-300"><Zap size={10} className="inline" /> {premio.custo_pontos}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-vl-elevated)]">
                      <div
                        className={`h-full rounded-full transition-all ${pode ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-fuchsia-500 to-violet-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    disabled={!pode || !canManageMarcos}
                    onClick={() => handleResgate(premio)}
                    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      pode
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90'
                        : 'cursor-not-allowed bg-[var(--color-vl-elevated)] text-[var(--color-vl-muted)]'
                    }`}
                  >
                    <Gift size={14} /> Resgatar
                  </button>
                  {pode && (
                    <p className="mt-2 text-center text-[10px] text-[var(--color-vl-muted)]">
                      Cria mimo aprovado automaticamente
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {tab === 2 && (
        <div className="space-y-2">
          {historicoSorted.length === 0 && (
            <EmptyState icon={History} title="Sem movimentações" sub="Conquiste marcos para ganhar pontos" />
          )}
          {historicoSorted.map((h) => (
            <div key={h.id} className="vl-card flex items-center gap-3 py-3">
              <span className={`text-lg font-bold ${h.pontos >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {h.pontos >= 0 ? '+' : ''}{h.pontos}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{h.titulo}</p>
                <p className="text-xs text-[var(--color-vl-muted)]">
                  {format(parseISO(h.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  {h.por ? ` · ${h.por}` : ''}
                </p>
                {h.nota && <p className="mt-0.5 text-xs italic text-[var(--color-vl-muted)]">"{h.nota}"</p>}
              </div>
              <button onClick={() => removeHistorico(h.id)} className="vl-btn-icon hover:text-rose-400" title="Desfazer"><Trash2 size={13} /></button>
            </div>
          ))}
          <button
            className="vl-btn-ghost w-full text-xs"
            onClick={() => {
              const pts = prompt('Pontos manuais (+ ou -):', '5')
              if (pts == null || pts === '') return
              const n = parseInt(pts, 10)
              if (Number.isNaN(n) || n === 0) return
              registrarPontos({ tipo: 'manual', titulo: 'Ajuste manual', pontos: n, por: user })
            }}
          >
            + Ajuste manual de pontos
          </button>
        </div>
      )}

      {/* Modal conquista */}
      {conquerModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" onClick={() => setConquerModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-vl-border)] bg-[var(--color-vl-surface)] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 text-center">
              <span className="text-4xl">{conquerModal.emoji}</span>
              <h3 className="mt-2 text-lg font-bold">
                {(conquerModal.tipo || 'conquista') === 'ousadia' ? 'Registrar ousadia' : 'Registrar conquista'}
              </h3>
              <p className="text-sm text-[var(--color-vl-muted)]">{conquerModal.titulo}</p>
            </div>
            <div className="mb-4 rounded-xl bg-amber-500/10 p-3 text-center">
              <p className="text-2xl font-bold text-amber-300">+{conquerModal.pontos} pts</p>
              <p className="text-xs text-[var(--color-vl-muted)]">Recompensa sugerida: {conquerModal.recompensa_sugerida}</p>
            </div>
            <textarea
              className="vl-input mb-4 resize-none"
              rows={4}
              placeholder="O que aconteceu? Como foi, o que você sentiu..."
              value={conquerNote}
              onChange={(e) => setConquerNote(e.target.value)}
            />
            <p className="mb-3 text-xs text-[var(--color-vl-muted)]">
              Registrado como <strong>{user}</strong>. Também vai para Conquistas (Ela).
            </p>
            <div className="flex gap-2">
              <button onClick={handleConquer} className="vl-btn-primary flex-1">
                <PartyPopper size={16} /> Confirmar conquista
              </button>
              <button onClick={() => setConquerModal(null)} className="vl-btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MarcoCard({ marco, onConquer, onRecompensado, onDelete, canManage, canEdit }) {
  const st = MARCO_STATUS[marco.status] || MARCO_STATUS.pendente
  const nv = MARCO_NIVEL[marco.nivel] || MARCO_NIVEL[1]
  const tp = MARCO_TIPO[marco.tipo || 'conquista'] || MARCO_TIPO.conquista

  return (
    <div className={`vl-card ${marco.status === 'recompensado' ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{marco.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold ${marco.status === 'recompensado' ? 'line-through text-[var(--color-vl-muted)]' : ''}`}>{marco.titulo}</h3>
            <Badge className={st.className}>{st.label}</Badge>
            <Badge className={tp.className}>{tp.label}</Badge>
            <Badge className={nv.className}>Nv {marco.nivel}</Badge>
          </div>
          {marco.descricao && <p className="text-sm text-[var(--color-vl-muted)]">{marco.descricao}</p>}
          {marco.regra_ref && (
            <p className="mt-1 text-xs text-fuchsia-300/80">Regra: {marco.regra_ref}</p>
          )}
          {marco.conquista_nota && (
            <p className="mt-2 text-sm italic text-[var(--color-vl-muted)]">"{marco.conquista_nota}"</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-vl-muted)]">
            <span className="flex items-center gap-0.5 font-bold text-amber-300"><Zap size={10} /> +{marco.pontos} pts</span>
            {marco.recompensa_sugerida && (
              <span className="flex items-center gap-0.5"><Gift size={10} /> {marco.recompensa_sugerida}</span>
            )}
          </div>
          {marco.conquistado_em && (
            <p className="mt-2 text-xs text-emerald-400/80">
              <Check size={10} className="inline" /> Conquistado {format(parseISO(marco.conquistado_em), 'dd/MM/yyyy', { locale: ptBR })}
              {marco.conquistado_por ? ` por ${marco.conquistado_por}` : ''}
            </p>
          )}
        </div>
        {onDelete && (
          <button onClick={onDelete} className="vl-btn-icon hover:text-rose-400"><Trash2 size={14} /></button>
        )}
      </div>
      <div className="mt-3 flex gap-2 border-t border-[var(--color-vl-border)] pt-3">
        {marco.status === 'pendente' && canManage && (
          <button onClick={onConquer} className={`vl-btn-primary flex-1 text-xs ${(marco.tipo || 'conquista') === 'ousadia' ? 'from-fuchsia-500 to-rose-500' : ''}`}>
            <Sparkles size={14} /> {(marco.tipo || 'conquista') === 'ousadia' ? 'Registrar ousadia' : 'Registrar conquista'}
          </button>
        )}
        {marco.status === 'conquistado' && canEdit && (
          <button onClick={onRecompensado} className="vl-btn-primary flex-1 text-xs">
            <Gift size={14} /> Recompensa entregue
          </button>
        )}
        {marco.status === 'recompensado' && (
          <p className="flex flex-1 items-center justify-center gap-1 text-xs text-emerald-300">
            <Check size={14} /> Ciclo completo
          </p>
        )}
      </div>
    </div>
  )
}

function MarcoForm({ form, setForm, onSave, onCancel, mode, setMode, isHer }) {
  return (
    <div className="vl-card space-y-3 border-fuchsia-500/20">
      <FilterPills
        options={['feito', 'objetivo']}
        value={mode}
        onChange={setMode}
        labelFn={(m) => (m === 'feito' ? '✨ Já fiz / realizei' : '🎯 Objetivo (meta)')}
      />
      <input
        className="vl-input"
        placeholder={mode === 'feito' ? 'O que você fez? *' : 'Qual é o objetivo? *'}
        value={form.titulo}
        onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
      />
      <textarea
        className="vl-input resize-none"
        rows={4}
        placeholder={mode === 'feito'
          ? 'Conta como foi, o que sentiu, detalhes...'
          : 'O que quer conquistar, como vai ser quando realizar...'}
        value={form.descricao}
        onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        <input className="vl-input" placeholder="Emoji" value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} />
        <select className="vl-input" value={form.tipo || 'conquista'} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
          <option value="conquista">Conquista</option>
          <option value="ousadia">Ousadia</option>
        </select>
      </div>
      <input
        className="vl-input"
        placeholder="Recompensa que imagina (opcional)"
        value={form.recompensa_sugerida}
        onChange={(e) => setForm((f) => ({ ...f, recompensa_sugerida: e.target.value }))}
      />
      {!isHer && (
        <div className="grid grid-cols-2 gap-2">
          <select className="vl-input" value={form.nivel} onChange={(e) => setForm((f) => ({ ...f, nivel: +e.target.value }))}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Nível {n}</option>)}
          </select>
          <input className="vl-input" type="number" min={1} placeholder="Pontos" value={form.pontos} onChange={(e) => setForm((f) => ({ ...f, pontos: +e.target.value }))} />
        </div>
      )}
      {isHer && mode === 'feito' && (
        <p className="text-xs text-[var(--color-vl-muted)]">
          Ganha <strong className="text-amber-300">+{form.pontos} pts</strong> ao registrar. Seu parceiro pode ajustar depois.
        </p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="vl-btn-primary flex-1">
          {mode === 'feito' ? 'Registrar e ganhar pontos' : 'Salvar objetivo'}
        </button>
        <button type="button" onClick={onCancel} className="vl-btn-ghost">Cancelar</button>
      </div>
    </div>
  )
}

function PremioForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="vl-card space-y-3">
      <input className="vl-input" placeholder="Nome do prêmio *" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
      <textarea className="vl-input resize-none" rows={2} placeholder="Descrição" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <input className="vl-input" placeholder="Emoji" value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} />
        <input className="vl-input" type="number" min={1} placeholder="Custo em pontos" value={form.custo_pontos} onChange={(e) => setForm((f) => ({ ...f, custo_pontos: +e.target.value }))} />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="vl-btn-primary flex-1">Salvar</button>
        <button onClick={onCancel} className="vl-btn-ghost">Cancelar</button>
      </div>
    </div>
  )
}
