import { Cloud, CloudOff } from 'lucide-react'
import { isCloudConfigured } from '../lib/supabase'

export default function SyncIndicator() {
  if (!isCloudConfigured) {
    return (
      <span className="flex items-center gap-1 text-xs text-[var(--color-vl-muted)]" title="Sem conexão com a nuvem">
        <CloudOff size={12} /> Offline
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 text-xs text-[var(--color-vl-success)]" title="Conectado à nuvem">
      <Cloud size={12} />
      <span className="hidden sm:inline">Nuvem</span>
    </span>
  )
}
