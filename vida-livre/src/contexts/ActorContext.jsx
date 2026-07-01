import { createContext, useContext } from 'react'
import { useActor as useActorState } from '../hooks/useActor'

const ActorContext = createContext(null)

export function ActorProvider({ children }) {
  const value = useActorState()
  return <ActorContext.Provider value={value}>{children}</ActorContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook pair, standard pattern
export function useActor() {
  const ctx = useContext(ActorContext)
  if (!ctx) throw new Error('useActor must be used within ActorProvider')
  return ctx
}
