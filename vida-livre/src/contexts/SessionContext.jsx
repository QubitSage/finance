import { createContext, useContext, useEffect, useState } from 'react'
import { resolveUserFromCode } from '../lib/constants'
import { getState, subscribe, updateSettings } from '../lib/storage'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [, tick] = useState(0)
  useEffect(() => subscribe(() => tick((n) => n + 1)), [])

  const settings = getState().settings
  const sessionUser = settings.sessionUser || null
  const user1 = settings.user1 || 'Bruno'
  const user2 = settings.user2 || 'Vianka'
  const isHer = sessionUser === user2
  const isPartner = sessionUser === user1
  const partner = isHer ? user1 : user2

  const login = (name) => {
    updateSettings({ sessionUser: name, activeUser: name })
  }

  const loginWithCode = (code) => {
    const name = resolveUserFromCode(code, user1, user2)
    if (!name) return false
    login(name)
    return true
  }

  const logout = () => {
    updateSettings({ sessionUser: null })
  }

  return (
    <SessionContext.Provider
      value={{
        sessionUser,
        user1,
        user2,
        user: sessionUser,
        partner,
        isHer,
        isPartner,
        isLoggedIn: !!sessionUser,
        canEditRules: isPartner,
        canEditVision: !!sessionUser,
        canEditStructure: isPartner,
        canManageMarcos: isPartner,
        canRegisterMarcos: !!sessionUser,
        canApproveMimos: isPartner,
        canEditMimosFixos: isPartner,
        login,
        loginWithCode,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
