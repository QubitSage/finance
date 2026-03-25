import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useDB(table, options = {}) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let q = supabase.from(table).select('*').eq('user_id', user.id)
    if (options.filter) Object.entries(options.filter).forEach(([k, v]) => { q = q.eq(k, v) })
    if (options.order) q = q.order(options.order, { ascending: options.asc ?? false })
    else q = q.order('created_at', { ascending: false })
    const { data: rows } = await q
    setData(rows || [])
    setLoading(false)
  }, [user, table, JSON.stringify(options)])

  useEffect(() => { fetch() }, [fetch])

  const insert = async (row) => {
    const { data: d, error } = await supabase.from(table)
      .insert([{ ...row, user_id: user.id }]).select().single()
    if (!error) setData(prev => [d, ...prev])
    return { data: d, error }
  }

  const update = async (id, updates) => {
    const { data: d, error } = await supabase.from(table)
      .update(updates).eq('id', id).select().single()
    if (!error) setData(prev => prev.map(r => r.id === id ? d : r))
    return { data: d, error }
  }

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) setData(prev => prev.filter(r => r.id !== id))
    return { error }
  }

  const upsertSingle = async (row) => {
    const { data: d, error } = await supabase.from(table)
      .upsert({ ...row, user_id: user.id }, { onConflict: 'user_id' }).select().single()
    if (!error) setData([d])
    return { data: d, error }
  }

  return { data, loading, refetch: fetch, insert, update, remove, upsertSingle }
}
