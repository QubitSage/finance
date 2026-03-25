import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useSettings() {
    const { user } = useAuth()
    const [settings, setSettings] = useState({
          couple_name: 'Nosso Casal',
          wife_percentage: 30,
          apartment_percentage: 40,
          wedding_percentage: 20,
          company_percentage: 20,
    })
    const [loading, setLoading] = useState(true)

  useEffect(() => {
        if (!user) return
        supabase.from('couple_settings').select('*').limit(1).single()
          .then(({ data }) => { if (data) setSettings(data); setLoading(false) })
  }, [user])

  const save = async (updates) => {
        const merged = { ...settings, ...updates, user_id: user.id }
        const { data, error } = await supabase.from('couple_settings')
          .upsert(merged, { onConflict: 'user_id' }).select().single()
        if (!error) setSettings(data)
        return { data, error }
  }

  return { settings, loading, save }
}

export function useLogs() {
    const { user } = useAuth()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
        if (!user) return
        setLoading(true)
        const { data } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
        setLogs(data || [])
        setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [user])

  const addLog = async (action, section, route, detail = '') => {
        if (!user) return
        await supabase.from('activity_logs').insert([{
                user_id: user.id,
                action,
                section,
                route,
                detail,
        }])
        fetchLogs()
  }

  return { logs, loading, addLog, refetch: fetchLogs }
}
