import { useEffect, useState } from 'react'
import { getState, subscribe, updateSettings } from '../lib/storage'

export function useSettings() {
  const [, tick] = useState(0)
  useEffect(() => subscribe(() => tick((n) => n + 1)), [])
  const settings = getState().settings

  return {
    settings,
    setActiveUser: (activeUser) => updateSettings({ activeUser }),
    updateSettings,
  }
}
