import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart, Trophy, CalendarHeart, Check, X } from 'lucide-react'
import { useScopedDB } from '../hooks/useScopedDB'
import { useLocalDB } from '../hooks/useLocalDB'
import { useSession } from '../contexts/SessionContext'
import { logActivity } from '../lib/activity'
import { conquistarMarco } from '../lib/pontos'
import { TIPO_AGENDA, fmtBRL } from '../lib/constants'
import { EmptyState } from '../components/ui/primitives'

export default function PendenciasPage() {
  const { user, isPartner } = useSession()
  const { data: wishes, update: updateWish } = useScopedDB('wishes', { scope: 'hers' })
  const { data: marcos, update: updateMarco } = useLocalDB('marcos', { order: 'ordem', asc: true })
  const { data: saidas, update: updateSaida } = useScopedDB('saidas', { scope: 'hers-shared' })

  const pendingMimos = wishes.filter((w) => w.status === 'pendente')
  const marcosAbertos = marcos.filter((m) => m.status === 'pendente')
  const saidasParaAprovar = saidas.filter((s) => s.status === 'planejado')

  const total = pendingMimos.length + marcosAbertos.length + saidasParaAprovar.length

  const items = useMemo(() => {
    const list = []
    pendingMimos.forEach((w) => list.push({ kind: 'mimo', data: w }))
    saidasParaAprovar.forEach((s) => list.push({ kind: 'agenda', data: s }))
    marcosAbertos.forEach((m) => list.push({ kind: 'marco', data: m }))
    return list
  }, [pendingMimos, saidasParaAprovar, marcosAbertos])

  if (!isPartner) {
    return (
      <EmptyState
        icon={Heart}
        title="Só para o parceiro"
        sub="Seus pedidos aparecem aqui para aprovação dele."
      />
    )
  }

  const approveMimo = (w) => {
    updateWish(w.id, { status: 'aprovado', resposta: 'Aprovado!', responded_by: user })
    logActivity({ tipo: 'mimo_aprovado', titulo: 'Mimo aprovado', mensagem: w.title, por: user, audience: 'her' })
  }

  const denyMimo = (w) => {
    updateWish(w.id, { status: 'negado', resposta: 'Negado por enquanto', responded_by: user })
    logActivity({ tipo: 'mimo_negado', titulo: 'Mimo negado', mensagem: w.title, por: user, audience: 'her' })
  }

  const approveSaida = (s) => {
    updateSaida(s.id, { status: 'aconteceu' })
    const tipo = TIPO_AGENDA[s.tipo] || TIPO_AGENDA.saida
    logActivity({ tipo: 'agenda_aprovada', titulo: `${tipo.label} aprovado`, mensagem: s.titulo, por: user, audience: 'her' })
  }

  const confirmMarco = (m) => {
    const now = new Date().toISOString()
    conquistarMarco(m, user, 'Validado no painel de pendências')
    updateMarco(m.id, { status: 'conquistado', conquistado_em: now, conquistado_por: user })
    logActivity({ tipo: 'marco_validado', titulo: 'Marco conquistado', mensagem: m.titulo, por: user, audience: 'her' })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="text-sm text-[var(--color-vl-muted)]">
        {total === 0 ? 'Tudo em dia.' : `${total} item(ns) aguardando você.`}
      </p>

      {items.length === 0 ? (
        <EmptyState icon={Check} title="Nada pendente" sub="Você está em dia!" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            if (item.kind === 'mimo') {
              const w = item.data
              return (
                <div key={`m-${w.id}`} className="vl-card border-rose-500/30">
                  <div className="flex items-start gap-3">
                    <Heart size={18} className="mt-0.5 shrink-0 text-rose-300" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-rose-200/80">Mimo · pedido dela</p>
                      <p className="font-semibold">{w.title}</p>
                      {w.estimated_cost != null && <p className="text-xs text-[var(--color-vl-muted)]">{fmtBRL(w.estimated_cost)}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => approveMimo(w)} className="vl-btn-icon text-emerald-400"><Check size={16} /></button>
                      <button type="button" onClick={() => denyMimo(w)} className="vl-btn-icon text-rose-400"><X size={16} /></button>
                    </div>
                  </div>
                </div>
              )
            }
            if (item.kind === 'agenda') {
              const s = item.data
              const tipo = TIPO_AGENDA[s.tipo] || TIPO_AGENDA.saida
              return (
                <div key={`a-${s.id}`} className="vl-card border-cyan-500/30">
                  <div className="flex items-start gap-3">
                    <CalendarHeart size={18} className="mt-0.5 shrink-0 text-cyan-300" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-cyan-200/80">{tipo.emoji} {tipo.label} · aguardando ok</p>
                      <p className="font-semibold">{s.titulo}</p>
                      {s.data && (
                        <p className="text-xs text-[var(--color-vl-muted)]">
                          {format(parseISO(s.data), 'dd/MM/yyyy', { locale: ptBR })}
                          {s.com_quem ? ` · ${s.com_quem}` : ''}
                        </p>
                      )}
                    </div>
                    <button type="button" onClick={() => approveSaida(s)} className="vl-btn-primary shrink-0 text-xs py-1.5 px-3">Aprovar</button>
                  </div>
                </div>
              )
            }
            const m = item.data
            return (
              <div key={`r-${m.id}`} className="vl-card border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Trophy size={18} className="mt-0.5 shrink-0 text-amber-300" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-amber-200/80">Marco · objetivo dela</p>
                    <p className="font-semibold">{m.emoji} {m.titulo}</p>
                    <p className="text-xs text-amber-400">+{m.pontos} pts</p>
                  </div>
                  <button type="button" onClick={() => confirmMarco(m)} className="vl-btn-primary shrink-0 text-xs py-1.5 px-3">Validar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
