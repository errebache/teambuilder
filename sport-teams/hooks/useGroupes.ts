import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Groupe } from '../types'
import { cacheGet, cacheSet, cacheInvalidate } from '../lib/cache'

export function useGroupes() {
  const [groupes, setGroupes] = useState<Groupe[]>(() => cacheGet<Groupe[]>('groupes') ?? [])
  const [loading, setLoading] = useState(() => !cacheGet('groupes'))
  const [error, setError] = useState<string | null>(null)

  async function fetchGroupes({ force = false } = {}) {
    // Cache frais → rien à faire, les données sont déjà dans le state
    if (!force && cacheGet('groupes')) {
      setLoading(false)
      return
    }

    // Cache expiré ou force → fetch complet
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: mesGroupes } = await supabase
        .from('groupes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      const { data: memberships } = await supabase
        .from('membres')
        .select('groupe_id, groupes(*)')
        .eq('user_id', user?.id)

      const groupesRejoints = memberships?.map((m: any) => m.groupes).filter(Boolean) ?? []
      const tousGroupes = [
        ...(mesGroupes || []),
        ...groupesRejoints.filter(g => !mesGroupes?.find((mg: any) => mg.id === g.id)),
      ]

      cacheSet('groupes', tousGroupes)
      setGroupes(tousGroupes)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function createGroupe(nom: string, sport: string, emoji: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() +
        '-' + Math.random().toString(36).substring(2, 6).toUpperCase()

      const { data, error } = await supabase
        .from('groupes')
        .insert({ nom, sport, emoji, user_id: user?.id, code })
        .select()
        .single()

      if (error) throw error
      cacheInvalidate('groupes')
      setGroupes(prev => [data, ...prev])
      return data
    } catch (e: any) {
      setError(e.message)
      return null
    }
  }

  return { groupes, loading, error, fetchGroupes, createGroupe }
}
