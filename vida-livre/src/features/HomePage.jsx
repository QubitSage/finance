import { useMemo, useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarHeart, Heart, Sparkles, Clock, AlertCircle, Zap, Trophy,
  Plus, Bell, Gift, ChevronRight, Wallet,
} from 'lucide-react'
import { getCollection, subscribe } from '../lib/storage'
import { getSaldoPontos } from '../lib/pontos'
import { getMesadaResumo, ensureMesadaCredit } from '../lib/mesada'
import { useSession } from '../contexts/SessionContext'
import { STATUS_SAIDA, TIPO_AGENDA } from '../lib/constants'
import { getActivities, getUnreadActivities, markActivitiesSeen, activityForViewer } from '../lib/activity'
import { getPartnerPendingCount } from '../lib/pendencias'
import { setNavPreset } from '../lib/nav'
import PlanejamentoCard from '../components/PlanejamentoCard'
import { Badge } from '../components/ui/primitives'

function belongsToHer(row, user2) {
  return row.owner === user2 || !row.owner
}

export default function HomePage({ onNavigate }) {
  const { sessionUser, isHer, isPartner, user2 } = useSession()
  const [, tick] = useState(0)
  useEffect(() => subscribe(() => tick((n) => n + 1)), [])
  useEffect(() => { ensureMesadaCredit(); tick((n) => n + 1) }, [])

  const mesadaResumo = useMemo(() => getMesadaResumo(), [tick])

  const saidas = getCollection('saidas')
  const wishes = getCollection('wishes')
  const fantasias = getCollection('fantasias')
  const marcos = getCollection('marcos')
  const variaveis = getCollection('mimos_variaveis')
  const saldo = getSaldoPontos()
  const marcosPendentes = marcos.filter((m) => m.status === 'pendente')

  const herWishes = wishes.filter((w) => belongsToHer(w, user2))
  const herSaidas = saidas.filter((s) => belongsToHer(s, user2))
  const herFantasias = fantasias.filter((f) => belongsToHer(f, user2))
  const pendingMimos = herWishes.filter((w) => w.status === 'pendente')
  const pendingCount = isPartner ? getPartnerPendingCount(user2) : 0

  const mimosDisp = variaveis.filter((m) => m.status === 'disponivel' || m.status === 'resgatado')

  const upcoming = useMemo(() => {
    const list = isHer ? herSaidas : herSaidas.filter((s) => s.share !== 'privado')
    return [...list]
      .filter((s) => s.data && s.status !== 'cancelado' && s.status !== 'realizado')
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 5)
  }, [herSaidas, isHer])

  const novidades = useMemo(() => {
    return getActivities(8).filter((a) => activityForViewer(a, sessionUser, null, user2, isHer))
  }, [sessionUser, user2, isHer, tick])

  const unread = getUnreadActivities(sessionUser).length

  const go = (page) => onNavigate?.(page)

  const quickActions = isHer
    ? [
        { label: 'Nova saída', icon: CalendarHeart, action: () => { setNavPreset({ agendaTipo: 'saida' }); go('agenda') } },
        { label: 'Novo date', icon: Heart, action: () => { setNavPreset({ agendaTipo: 'date' }); go('agenda') } },
        { label: 'Planejamento', icon: Wallet, action: () => go('planejamento') },
        { label: 'Registro', icon: Sparkles, action: () => go('registros') },
      ]
    : [
        { label: 'Pendências', icon: Bell, badge: pendingCount, action: () => go('pendencias') },
        { label: 'Mimos', icon: Heart, action: () => go('mimos') },
        { label: 'Agenda dela', icon: CalendarHeart, action: () => go('agenda') },
        { label: 'Marcos', icon: Trophy, action: () => go('recompensas') },
      ]

  const statsHer = [
    { label: 'Pedidos', value: pendingMimos.length, sub: 'pendentes', icon: Heart, color: 'text-rose-300' },
    { label: 'Agenda', value: herSaidas.filter((s) => !['realizado', 'cancelado'].includes(s.status)).length, icon: CalendarHeart, color: 'text-cyan-300' },
    { label: 'Fantasias', value: herFantasias.length, icon: Sparkles, color: 'text-fuchsia-300' },
    { label: 'Pontos', value: saldo, icon: Zap, color: 'text-amber-300' },
  ]

  const statsPartner = [
    { label: 'Pendências', value: pendingCount, icon: Bell, color: 'text-rose-300' },
    { label: 'Marcos', value: marcosPendentes.length, icon: Trophy, color: 'text-amber-300' },
    { label: 'Agenda', value: upcoming.length, icon: CalendarHeart, color: 'text-cyan-300' },
    { label: 'Pontos dela', value: saldo, icon: Zap, color: 'text-violet-300' },
  ]

  const stats = isHer ? statsHer : statsPartner

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="vl-card-glow">
        <p className="text-sm text-[var(--color-vl-muted)]">
          {isHer ? 'Olá' : 'Painel'}, {sessionUser}
        </p>
        <h3 className="mt-1 text-2xl font-bold bg-gradient-to-r from-fuchsia-200 to-violet-200 bg-clip-text text-transparent">
          {isHer ? 'Seu espaço' : `Espaço de ${user2}`}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-vl-muted)]">
          {isHer
            ? 'Saídas, dates, mimos e registros — tudo privado aqui.'
            : 'Aprovações, mimos variáveis e pendências num só lugar.'}
        </p>
      </div>

      {isPartner && pendingCount > 0 && (
        <button
          type="button"
          onClick={() => go('pendencias')}
          className="vl-card flex w-full items-center gap-3 border-rose-500/40 bg-rose-500/10 text-left transition hover:border-rose-500/60"
        >
          <AlertCircle size={20} className="shrink-0 text-rose-300" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-rose-200">{pendingCount} pendência{pendingCount > 1 ? 's' : ''}</p>
            <p className="text-xs text-rose-200/70">Mimos, saídas/dates e marcos aguardando</p>
          </div>
          <ChevronRight size={18} className="text-rose-300" />
        </button>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickActions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.action}
            className="vl-card relative flex flex-col items-center gap-1.5 py-3 text-center transition hover:border-fuchsia-500/30"
          >
            {a.badge > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {a.badge}
              </span>
            )}
            <a.icon size={18} className="text-fuchsia-300" />
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="vl-card text-center">
            <s.icon size={20} className={`mx-auto mb-2 ${s.color}`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[var(--color-vl-muted)]">{s.label}</p>
          </div>
        ))}
      </div>

      {(isHer || isPartner) && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-200">
              <Wallet size={14} /> Planejamento & mesada
            </h4>
            <button type="button" onClick={() => go('planejamento')} className="text-xs text-fuchsia-300 hover:underline">
              Ver completo
            </button>
          </div>
          <PlanejamentoCard resumo={mesadaResumo} compact />
          {mimosDisp.length > 0 && (
            <p className="mt-2 text-center text-xs text-cyan-300">
              {mimosDisp.length} mimo{mimosDisp.length > 1 ? 's' : ''} variável{mimosDisp.length > 1 ? 'is' : ''} disponível{mimosDisp.length > 1 ? 'eis' : ''}
            </p>
          )}
        </section>
      )}

      {novidades.length > 0 && (
        <section className="vl-card">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles size={14} className="text-fuchsia-400" />
              Novidades
              {unread > 0 && <Badge className="bg-fuchsia-500/20 text-fuchsia-200">{unread} nova{unread > 1 ? 's' : ''}</Badge>}
            </h4>
            {unread > 0 && (
              <button type="button" onClick={() => { markActivitiesSeen(sessionUser); tick((n) => n + 1) }} className="text-xs text-[var(--color-vl-muted)] hover:text-fuchsia-300">
                Marcar lidas
              </button>
            )}
          </div>
          <div className="space-y-2">
            {novidades.slice(0, 5).map((a) => (
              <div key={a.id} className="rounded-xl bg-[var(--color-vl-elevated)] px-3 py-2">
                <p className="text-sm font-medium">{a.titulo}</p>
                {a.mensagem && <p className="text-xs text-[var(--color-vl-muted)] truncate">{a.mensagem}</p>}
                <p className="mt-0.5 text-[10px] text-[var(--color-vl-muted)]">
                  {format(parseISO(a.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {marcos.length > 0 && (
        <section className="vl-card border-amber-500/30">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-300" />
              <h4 className="font-semibold text-amber-200">{isHer ? 'Meus marcos' : 'Marcos dela'}</h4>
            </div>
            <span className="flex items-center gap-1 text-lg font-bold text-amber-300"><Zap size={16} /> {saldo}</span>
          </div>
          {marcosPendentes.length > 0 ? (
            <div className="space-y-2">
              {marcosPendentes.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl bg-[var(--color-vl-elevated)] px-3 py-2">
                  <span className="text-sm truncate">{m.emoji} {m.titulo}</span>
                  <span className="text-xs text-amber-400">+{m.pontos} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-vl-muted)]">Todos os marcos atuais foram conquistados!</p>
          )}
        </section>
      )}

      {isHer && herWishes.filter((w) => w.status === 'aprovado').length > 0 && (
        <section className="vl-card border-cyan-500/30">
          <h4 className="mb-2 font-semibold text-cyan-200">Pedidos aprovados</h4>
          <div className="space-y-2">
            {herWishes.filter((w) => w.status === 'aprovado').slice(0, 3).map((w) => (
              <div key={w.id} className="rounded-xl bg-[var(--color-vl-elevated)] px-3 py-2 text-sm">{w.title}</div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-vl-muted)]">
          <Clock size={14} /> {isHer ? 'Próximas saídas & dates' : 'Agenda dela (compartilhada)'}
        </h4>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--color-vl-muted)]">Nada planejado.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((s) => {
              const st = STATUS_SAIDA[s.status]
              const tipo = TIPO_AGENDA[s.tipo] || TIPO_AGENDA.saida
              const d = s.data ? parseISO(s.data) : null
              return (
                <div key={s.id} className="vl-card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-0.5 flex items-center gap-2">
                      <Badge className={tipo.className}>{tipo.emoji} {tipo.label}</Badge>
                    </div>
                    <p className="font-medium truncate">{s.titulo}</p>
                    <p className="text-xs text-[var(--color-vl-muted)]">
                      {d ? format(d, 'dd MMM yyyy', { locale: ptBR }) : 'Sem data'}
                      {s.hora ? ` · ${s.hora}` : ''}
                      {s.com_quem ? ` · ${s.com_quem}` : ''}
                    </p>
                  </div>
                  {st && <Badge className={st.className}>{st.label}</Badge>}
                </div>
              )
            })}
          </div>
        )}
        {isHer && (
          <button type="button" onClick={() => go('agenda')} className="mt-3 vl-btn-ghost w-full text-sm">
            <Plus size={14} /> Ver agenda completa
          </button>
        )}
      </section>
    </div>
  )
}
