import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCollection, insertItem, removeItem, subscribe, updateItem } from '../lib/storage'
import { useSession } from '../contexts/SessionContext'

function rowBelongsTo(row, user, isHerViewer) {
  if (row.owner) return row.owner === user
  return isHerViewer
}

export function useScopedDB(collection, options = {}) {
  const { scope = 'mine', order, asc, filter: extraFilter } = options
  const { user, partner, isHer, isPartner } = useSession()
  const [, tick] = useState(0)

  useEffect(() => subscribe(() => tick((n) => n + 1)), [])

  const raw = getCollection(collection)

  const data = useMemo(() => {
    let rows = [...raw]

    if (scope === 'mine') {
      rows = rows.filter((r) => rowBelongsTo(r, user, isHer))
    } else if (scope === 'hers') {
      rows = rows.filter((r) => rowBelongsTo(r, partner, !isPartner))
    } else if (scope === 'hers-shared') {
      rows = rows.filter((r) => {
        const hers = rowBelongsTo(r, partner, !isPartner)
        return hers && r.share !== 'privado'
      })
    }
    // scope === 'couple' → no owner filter

    if (extraFilter) {
      rows = rows.filter((row) =>
        Object.entries(extraFilter).every(([k, v]) => row[k] === v)
      )
    }

    const orderKey = order || 'created_at'
    const ascending = asc ?? false
    rows.sort((a, b) => {
      const av = a[orderKey] ?? ''
      const bv = b[orderKey] ?? ''
      if (typeof av === 'number' && typeof bv === 'number') return ascending ? av - bv : bv - av
      return ascending ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return rows
  }, [raw, collection, scope, user, partner, isHer, isPartner, JSON.stringify(options)])

  const insert = useCallback(
    (row) => {
      const withOwner = scope === 'couple' ? row : { ...row, owner: row.owner || user }
      return insertItem(collection, withOwner)
    },
    [collection, scope, user]
  )

  const update = useCallback((id, updates) => updateItem(collection, id, updates), [collection])
  const remove = useCallback((id) => removeItem(collection, id), [collection])

  return { data, insert, update, remove, readOnly: false }
}
