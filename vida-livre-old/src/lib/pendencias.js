import { getCollection } from './storage'

function belongsToHer(row, user2) {
  return row.owner === user2 || !row.owner
}

export function getPartnerPendingCount(user2) {
  const wishes = getCollection('wishes').filter((w) => belongsToHer(w, user2) && w.status === 'pendente')
  const saidas = getCollection('saidas')
    .filter((s) => belongsToHer(s, user2) && s.status === 'planejado' && s.share !== 'privado')
  return wishes.length + saidas.length
}
