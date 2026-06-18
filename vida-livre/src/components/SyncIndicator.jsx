import { useEffect, useState } from 'react'
import { Cloud, CloudOff, Loader2 } from 'lucide-react'
import { isCloudConfigured } from '../lib/supabase'
import { onCloudStatus } from '../lib/storage'

export default function SyncIndicator() {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!isCloudConfigured) return
    return onCloudStatus((ev) => {
      if (ev.status === 'syncing') setStatus('syncing')
      if (ev.status === 'synced') setStatus('synced')
      if (ev.status === 'error') setStatus('error')
    })
  }, [])

  useEffect(() => {
    if (!isCloudConfigured) return
    const onVis = () => setStatus((s) => (s === 'syncing' ? s : 'synced'))
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!isCloudConfigured) {
    return (
      <span className="flex items-center gap-1 text-xs text-[var(--color-vl-muted)]" title="Só neste navegador">
        <CloudOff size={12} /> Local
      </span>
    )
  }

  const map = {
    idle: { icon: Cloud, label: 'Nuvem', className: 'text-emerald-400/80' },
    synced: { icon: Cloud, label: 'Sincronizado', className: 'text-emerald-400' },
    syncing: { icon: Loader2, label: 'Salvando…', className: 'text-amber-400 animate-spin' },
    error: { icon: CloudOff, label: 'Erro sync', className: 'text-rose-400' },
  }
  const cfg = map[status] || map.idle
  const Icon = cfg.icon

  return (
    <span className={`flex items-center gap-1 text-xs ${cfg.className}`} title={cfg.label}>
      <Icon size={12} className={status === 'syncing' ? 'animate-spin' : ''} />
      <span className="hidden sm:inline">{cfg.label}</span>
    </span>
  )
}
