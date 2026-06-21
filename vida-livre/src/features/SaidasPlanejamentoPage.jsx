import { useEffect, useState } from 'react'
import { Map, HelpCircle, Shirt, Trash2 } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'
import { useLocalDB } from '../hooks/useLocalDB'
import { useSettings } from '../hooks/useSettings'
import { getMesadaResumo, ensureMesadaCredit } from '../lib/mesada'
import { subscribe } from '../lib/storage'
import { VIES_PLANEJAMENTO, VIES_ACORDOS_RESPONDIDOS } from '../lib/constants'
import { Badge } from '../components/ui/primitives'
import MimosLegenda from '../components/MimosLegenda'
import PlanejamentoCard from '../components/PlanejamentoCard'
import RitualSaidaCard from '../components/RitualSaidaCard'

export default function SaidasPlanejamentoPage() {
  const { canEditStructure } = useSession()
  const { settings } = useSettings()
  const { data: templates, remove: removeTpl } = useLocalDB('saida_templates', { order: 'ordem', asc: true })
  const [, tick] = useState(0)

  useEffect(() => subscribe(() => tick((n) => n + 1)), [])
  useEffect(() => { ensureMesadaCredit(); tick((n) => n + 1) }, [])

  const resumo = getMesadaResumo()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PlanejamentoCard resumo={resumo} mode="referencia" />

      <RitualSaidaCard />

      <MimosLegenda />

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fuchsia-200">
          <Map size={16} /> Viés de planejamento
        </h3>
        <div className="space-y-2">
          {VIES_PLANEJAMENTO.map((v) => (
            <div key={v.id} className="vl-card border-emerald-500/20">
              <p className="flex items-center gap-2 font-medium">
                <span>{v.emoji}</span> {v.titulo}
                <Badge className="bg-emerald-500/15 text-emerald-300 text-[10px]">ativo</Badge>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-vl-muted)]">{v.regra}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <HelpCircle size={16} /> Combinado — respostas dela
        </h3>
        <div className="space-y-2">
          {VIES_ACORDOS_RESPONDIDOS.map((p) => (
            <div key={p.id} className="vl-card border-emerald-500/25 bg-emerald-500/5">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <span>{p.emoji}</span> {p.titulo}
                <Badge className="bg-emerald-500/15 text-emerald-300 text-[10px]">respondido</Badge>
              </p>
              <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{p.pergunta}</p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/95">{p.resposta}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-200">
          <Shirt size={16} /> Protocolo de saídas
        </h3>
        <div className="space-y-4">
          {settings.saida_extra_nota && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">{settings.saida_extra_nota}</p>
          )}
          {templates.map((tpl) => (
            <div key={tpl.id} className="vl-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="flex items-center gap-2 font-semibold text-rose-200">
                  <Shirt size={16} /> {tpl.titulo}
                </h4>
                {canEditStructure && (
                  <button type="button" onClick={() => removeTpl(tpl.id)} className="vl-btn-icon hover:text-rose-400"><Trash2 size={13} /></button>
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
            <p className="py-4 text-center text-sm text-[var(--color-vl-muted)]">Templates de saída aparecem após import do batch.</p>
          )}
        </div>
      </section>
    </div>
  )
}
