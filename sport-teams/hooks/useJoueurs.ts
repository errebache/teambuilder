import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Joueur } from '../types'

export function useJoueurs(groupeId: string) {
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchJoueurs() {
    if (!groupeId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('joueurs')
        .select('*')
        .eq('groupe_id', groupeId)
        .order('note_moyenne', { ascending: false })
      if (error) throw error
      setJoueurs(data || [])
    } finally {
      setLoading(false)
    }
  }

  return { joueurs, loading, fetchJoueurs }
}