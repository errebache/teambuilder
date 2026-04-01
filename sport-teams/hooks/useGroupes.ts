import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Groupe } from '../types'

export function useGroupes() {
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGroupes()
  }, [])

  async function fetchGroupes() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('groupes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroupes(data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function createGroupe(nom: string, sport: string, emoji: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Générer un code unique lisible
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                  '-' + 
                  Math.random().toString(36).substring(2, 6).toUpperCase()

      const { data, error } = await supabase
        .from('groupes')
        .insert({ nom, sport, emoji, user_id: user?.id, code })
        .select()
        .single()

      if (error) throw error
      setGroupes(prev => [data, ...prev])
      return data
    } catch (e: any) {
      setError(e.message)
      return null
    }
  }

  return { groupes, loading, error, fetchGroupes, createGroupe }
}