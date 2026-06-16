import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCollection, insertItem, removeItem, subscribe, updateItem } from '../lib/storage'

export function useLocalDB(collection, options = {}) {
  const [, tick] = useState(0)

  useEffect(() => subscribe(() => tick((n) => n + 1)), [])

  const raw = getCollection(collection)

  const data = useMemo(() => {
    let rows = [...raw]
    if (options.filter) {
      rows = rows.filter((row) =>
        Object.entries(options.filter).every(([k, v]) => row[k] === v)
      )
    }
    const orderKey = options.order || 'created_at'
    const asc = options.asc ?? false
    rows.sort((a, b) => {
      const av = a[orderKey] ?? ''
      const bv = b[orderKey] ?? ''
      if (typeof av === 'number' && typeof bv === 'number') return asc ? av - bv : bv - av
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return rows
  }, [raw, collection, JSON.stringify(options)])

  const insert = useCallback((row) => insertItem(collection, row), [collection])
  const update = useCallback((id, updates) => updateItem(collection, id, updates), [collection])
  const remove = useCallback((id) => removeItem(collection, id), [collection])

  return { data, insert, update, remove }
}
