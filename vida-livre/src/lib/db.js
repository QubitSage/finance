import { supabase, ensureCloudAuth, isCloudConfigured } from './supabase'

export { isCloudConfigured }

export async function fetchAll(table, { order = 'created_at', ascending = true } = {}) {
  if (!supabase) return []
  await ensureCloudAuth()
  const { data, error } = await supabase.from(table).select('*').order(order, { ascending })
  if (error) throw error
  return data || []
}

export async function insertRow(table, row) {
  if (!supabase) throw new Error('Supabase não configurado')
  await ensureCloudAuth()
  const { data, error } = await supabase.from(table).insert(row).select().single()
  if (error) throw error
  return data
}

export async function updateRow(table, id, updates) {
  if (!supabase) throw new Error('Supabase não configurado')
  await ensureCloudAuth()
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function removeRow(table, id) {
  if (!supabase) throw new Error('Supabase não configurado')
  await ensureCloudAuth()
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export function subscribeTable(table, onChange) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`vl-${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
