import { useCallback, useEffect, useState } from 'react'
import { fetchAll, insertRow, updateRow, removeRow, subscribeTable } from '../lib/db'

export function useDB(table, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const order = options.order || 'created_at'
  const ascending = options.ascending ?? true

  const reload = useCallback(async () => {
    try {
      const rows = await fetchAll(table, { order, ascending })
      setData(rows)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [table, order, ascending])

  useEffect(() => {
    reload()
    const unsubscribe = subscribeTable(table, () => reload())
    return unsubscribe
  }, [table, reload])

  const insert = useCallback((row) => insertRow(table, row).then((r) => { reload(); return r }), [table, reload])
  const update = useCallback((id, updates) => updateRow(table, id, updates).then((r) => { reload(); return r }), [table, reload])
  const remove = useCallback((id) => removeRow(table, id).then(() => reload()), [table, reload])

  return { data, loading, error, insert, update, remove, reload }
}
