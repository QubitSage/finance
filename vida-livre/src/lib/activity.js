import { getState, insertItem, updateSettings } from './storage'

export function logActivity({ tipo, titulo, mensagem, por, audience = 'both' }) {
  insertItem('atividades', {
    tipo,
    titulo,
    mensagem: mensagem || '',
    por,
    audience,
    created_at: new Date().toISOString(),
  })
}

export function getActivities(limit = 20) {
  const list = getState().atividades || []
  return [...list].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, limit)
}

export function getUnreadActivities(sessionUser) {
  const seen = getState().settings?.activity_seen_at?.[sessionUser] || null
  return getActivities(50).filter((a) => {
    if (!seen) return true
    return new Date(a.created_at).getTime() > new Date(seen).getTime()
  })
}

export function markActivitiesSeen(sessionUser) {
  const settings = getState().settings
  updateSettings({
    activity_seen_at: {
      ...(settings.activity_seen_at || {}),
      [sessionUser]: new Date().toISOString(),
    },
  })
}

export function activityForViewer(activity, sessionUser, user1, user2, isHer) {
  if (activity.audience === 'both') return true
  if (activity.audience === 'partner' && !isHer) return true
  if (activity.audience === 'her' && isHer) return true
  if (activity.por === sessionUser) return false
  return activity.audience === 'both'
}
