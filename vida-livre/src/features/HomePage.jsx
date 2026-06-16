import { useMemo, useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarHeart, Heart, Sparkles, Clock, AlertCircle, Zap, Trophy } from 'lucide-react'
import { getCollection, subscribe } from '../lib/storage'
import { getSaldoPontos } from '../lib/pontos'
import { useSession } from '../contexts/SessionContext'
import { STATUS_SAIDA } from '../lib/constants'
import { Badge } from '../components/ui/primitives'

function belongsToHer(row, user2) {
  return row.owner === user2 || !row.owner
}

export default function HomePage() {
  const { sessionUser, isHer, isPartner, user2, user1 } = useSession()
  const [, tick] = useState(0)
  useEffect(() => subscribe(() => tick((n) => n + 1)), [])

  const saidas = getCollection('saidas')
  const wishes = getCollection('wishes')
  const fantasias = getCollection('fantasias')
  const marcos = getCollection('marcos')
  const saldo = getSaldoPontos()
  const marcosPendentes = marcos.filter((m) => m.status === 'pendente')

  const herWishes = wishes.filter((w) => belongsToHer(w, user2))
  const herSaidas = saidas.filter((s) => belongsToHer(s, user2))
  const herFantasias = fantasias.filter((f) => belongsToHer(f, user2))

  const pendingMimos = herWishes.filter((w) => w.status === 'pendente')
  const myMimos = isHer
    ? herWishes
  : herWishes

  const upcoming = useMemo(() => {
    const list = isHer
      ? herSaidas
      : herSaidas.filter((s) => s.share !== 'privado')
    return [...list]
      .filter((s) => s.data && s.status !== 'cancelado' && s.status !== 'realizado')
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 5)
  }, [herSaidas, isHer])

  const statsHer = [
    { label: 'Meus mimos', value: herWishes.filter((w) => w.status === 'pendente').length, sub: 'pendentes', icon: Heart, color: 'text-rose-300' },
    { label: 'Minhas saídas', value: herSaidas.filter((s) => !['realizado', 'cancelado'].includes(s.status)).length, icon: CalendarHeart, color: 'text-cyan-300' },
    { label: 'Fantasias', value: herFantasias.length, icon: Sparkles, color: 'text-fuchsia-300' },
    { label: 'Pontos', value: saldo, icon: Zap, color: 'text-amber-300' },
  ]

  const statsPartner = [
    { label: 'Mimos p/ aprovar', value: pendingMimos.length, icon: Heart, color: 'text-rose-300' },
    { label: 'Marcos pendentes', value: marcosPendentes.length, icon: Trophy, color: 'text-amber-300' },
    { label: 'Saídas dela', value: upcoming.length, icon: CalendarHeart, color: 'text-cyan-300' },
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
            ? 'Só você vê agenda, registros e mimos completos aqui.'
            : `Você gerencia aprovações, marcos e regras. Dados de ${user2} ficam no login dela.`}
        </p>
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

      {isPartner && pendingMimos.length > 0 && (
        <section className="vl-card border-rose-500/30">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-300" />
            <h4 className="font-semibold text-rose-200">Mimos aguardando você</h4>
          </div>
          <div className="space-y-2">
            {pendingMimos.slice(0, 3).map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl bg-[var(--color-vl-elevated)] px-3 py-2">
                <span className="text-sm truncate">{w.title}</span>
                <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">pendente</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {isHer && myMimos.filter((w) => w.status === 'aprovado').length > 0 && (
        <section className="vl-card border-cyan-500/30">
          <h4 className="mb-2 font-semibold text-cyan-200">Mimos aprovados</h4>
          <div className="space-y-2">
            {myMimos.filter((w) => w.status === 'aprovado').slice(0, 3).map((w) => (
              <div key={w.id} className="rounded-xl bg-[var(--color-vl-elevated)] px-3 py-2 text-sm">{w.title}</div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-vl-muted)]">
          <Clock size={14} /> {isHer ? 'Próximas saídas' : 'Próximas saídas dela (compartilhadas)'}
        </h4>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--color-vl-muted)]">Nenhuma saída planejada.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((s) => {
              const st = STATUS_SAIDA[s.status]
              const d = s.data ? parseISO(s.data) : null
              return (
                <div key={s.id} className="vl-card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.titulo}</p>
                    <p className="text-xs text-[var(--color-vl-muted)]">
                      {d ? format(d, 'dd MMM yyyy', { locale: ptBR }) : 'Sem data'}
                      {s.hora ? ` · ${s.hora}` : ''}
                    </p>
                  </div>
                  {st && <Badge className={st.className}>{st.label}</Badge>}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
