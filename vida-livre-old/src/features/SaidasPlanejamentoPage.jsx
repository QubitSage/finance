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
        <h3 className="vl-section-title mb-3 flex items-center gap-2">
          <Map size={16} /> Viés de planejamento
        </h3>
        <div className="space-y-3">
          {VIES_PLANEJAMENTO.map((v) => (
            <div key={v.id} className="vl-card">
              <p className="flex items-center gap-2 font-medium">
                {v.titulo}
                <Badge className="vl-badge-success">ativo</Badge>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-vl-muted)]">{v.regra}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="vl-section-title mb-3 flex items-center gap-2">
          <HelpCircle size={16} /> Combinado — respostas dela
        </h3>
        <div className="space-y-3">
          {VIES_ACORDOS_RESPONDIDOS.map((p) => (
            <div key={p.id} className="vl-card-highlight">
              <p className="flex items-center gap-2 text-sm font-medium">
                {p.titulo}
                <Badge className="vl-badge-success">respondido</Badge>
              </p>
              <p className="mt-1 text-xs text-[var(--color-vl-muted)]">{p.pergunta}</p>
              <p className="mt-2 text-sm leading-relaxed">{p.resposta}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="vl-section-title mb-3 flex items-center gap-2">
          <Shirt size={16} /> Protocolo de saídas
        </h3>
        <div className="space-y-4">
          {settings.saida_extra_nota && (
            <p className="rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-warning-soft)] px-3 py-2 text-sm">{settings.saida_extra_nota}</p>
          )}
          {templates.map((tpl) => (
            <div key={tpl.id} className="vl-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="flex items-center gap-2 font-semibold">
                  <Shirt size={16} /> {tpl.titulo}
                </h4>
                {canEditStructure && (
                  <button type="button" onClick={() => removeTpl(tpl.id)} className="vl-btn-icon"><Trash2 size={13} /></button>
                )}
              </div>
              <p className="text-sm"><span className="text-[var(--color-vl-muted)]">Roupa:</span> {tpl.roupa}</p>
              <p className="text-sm"><span className="text-[var(--color-vl-muted)]">Mimos:</span> {tpl.mimos}</p>
            </div>
          ))}
          {settings.saida_pos_nota && (
            <p className="rounded-xl border border-[var(--color-vl-border)] bg-[var(--color-vl-accent-soft)] px-3 py-2 text-center text-sm font-medium">
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
