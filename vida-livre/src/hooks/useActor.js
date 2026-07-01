import { useState, useCallback } from 'react'

const KEY = 'vl-novo-actor'
export const ACTORS = [
  { id: 'bruno', nome: 'Bruno' },
  { id: 'vianka', nome: 'Vianka' },
]

export function useActor() {
  const [actor, setActorState] = useState(() => localStorage.getItem(KEY) || ACTORS[0].id)

  const setActor = useCallback((id) => {
    localStorage.setItem(KEY, id)
    setActorState(id)
  }, [])

  return { actor, setActor, actors: ACTORS }
}
