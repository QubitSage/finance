import { ensureCloudAuth, isCloudConfigured, supabase } from './supabase'
import {
  getState,
  hydrateFromCloud,
  notifyCloudListeners,
  onLocalPersist,
  stateForCloud,
} from './storage'

const SYNC_META_KEY = 'vida-livre-sync-meta'
const ROW_ID = 'main'
const PUSH_DELAY_MS = 600

let remoteUpdatedAt = null
let pushTimer = null
let pushing = false
let applyingRemote = false
let realtimeChannel = null

function loadSyncMeta() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_META_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSyncMeta(patch) {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify({ ...loadSyncMeta(), ...patch }))
}

function isRemoteNewer(remoteTs) {
  if (!remoteTs) return false
  const meta = loadSyncMeta()
  if (!meta.remoteUpdatedAt) return true
  return new Date(remoteTs).getTime() > new Date(meta.remoteUpdatedAt).getTime()
}

export async function pullFromCloud() {
  const { data, error } = await supabase
    .from('vl_couple_state')
    .select('data, updated_at')
    .eq('id', ROW_ID)
    .maybeSingle()

  if (error) throw new Error(`Erro ao baixar dados: ${error.message}`)

  if (data?.data && Object.keys(data.data).length > 0 && isRemoteNewer(data.updated_at)) {
    applyingRemote = true
    hydrateFromCloud(data.data)
    applyingRemote = false
    remoteUpdatedAt = data.updated_at
    saveSyncMeta({ remoteUpdatedAt: data.updated_at })
  } else if (data?.updated_at) {
    remoteUpdatedAt = data.updated_at
    saveSyncMeta({ remoteUpdatedAt: data.updated_at })
  }

  return data
}

export async function pushToCloud() {
  if (pushing || applyingRemote) return
  pushing = true
  try {
    const payload = stateForCloud()
    const { data, error } = await supabase
      .from('vl_couple_state')
      .upsert({ id: ROW_ID, data: payload }, { onConflict: 'id' })
      .select('updated_at')
      .single()

    if (error) throw new Error(`Erro ao salvar na nuvem: ${error.message}`)

    if (data?.updated_at) {
      remoteUpdatedAt = data.updated_at
      saveSyncMeta({ remoteUpdatedAt: data.updated_at })
    }
    notifyCloudListeners({ status: 'synced' })
  } finally {
    pushing = false
  }
}

function schedulePush() {
  if (applyingRemote || !isCloudConfigured) return
  notifyCloudListeners({ status: 'syncing' })
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushToCloud().catch((err) => {
      console.error('[sync]', err)
      notifyCloudListeners({ status: 'error', message: err.message })
    })
  }, PUSH_DELAY_MS)
}

function startRealtime() {
  if (realtimeChannel) return

  realtimeChannel = supabase
    .channel('vl-couple-state')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vl_couple_state', filter: `id=eq.${ROW_ID}` },
      async (payload) => {
        const row = payload.new
        if (!row?.data || !row.updated_at) return
        if (row.updated_at === remoteUpdatedAt) return
        if (!isRemoteNewer(row.updated_at)) return

        applyingRemote = true
        hydrateFromCloud(row.data)
        applyingRemote = false
        remoteUpdatedAt = row.updated_at
        saveSyncMeta({ remoteUpdatedAt: row.updated_at })
        notifyCloudListeners({ status: 'synced' })
      }
    )
    .subscribe()
}

export async function initCloudSync() {
  if (!isCloudConfigured) {
    return { mode: 'local', ok: true }
  }

  await ensureCloudAuth()
  await pullFromCloud()

  const local = getState()
  const hasLocalData = (local.combinados?.length || 0) + (local.wishes?.length || 0) > 0
  const meta = loadSyncMeta()

  if (!meta.remoteUpdatedAt && hasLocalData) {
    await pushToCloud()
  }

  onLocalPersist(() => schedulePush())
  startRealtime()

  return { mode: 'cloud', ok: true }
}
