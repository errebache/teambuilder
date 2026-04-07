import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Joueur } from '../types'
import { cacheGet, cacheSet, cacheInvalidate } from '../lib/cache'

export function useJoueurs(groupeId: string) {
  const cacheKey = `joueurs:${groupeId}`
  const [joueurs, setJoueurs] = useState<Joueur[]>(() => cacheGet<Joueur[]>(cacheKey) ?? [])
  const [loading, setLoading] = useState(() => !cacheGet(cacheKey))
  const [hasFetched, setHasFetched] = useState(() => !!cacheGet(cacheKey))

  async function fetchJoueurs({ force = false } = {}) {
    if (!groupeId) return

    // Cache frais → rien à faire, les données sont déjà dans le state
    if (!force && cacheGet(cacheKey)) {
      setLoading(false)
      setHasFetched(true)
      return
    }

    // Cache expiré ou force → fetch complet
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('joueurs')
        .select('*')
        .eq('groupe_id', groupeId)
        .order('note_moyenne', { ascending: false })
      if (error) throw error
      const result = data || []
      cacheSet(cacheKey, result)
      setJoueurs(result)
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }

  function invalidate() {
    cacheInvalidate(cacheKey)
  }

  return { joueurs, loading, hasFetched, fetchJoueurs, invalidate }
}
