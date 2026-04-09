import { View, Text, ScrollView, TouchableOpacity, Share, Dimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { genererEquipes } from '../../lib/algo-equilibrage'
import { supabase } from '../../lib/supabase'
import { planifierRappelMatch } from '../../lib/notifications'
import { cacheInvalidate } from '../../lib/cache'
import { useEffect, useRef, useState } from 'react'
import { Equipe, Joueur } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'

const COULEURS_EQUIPES = ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6']
const COULEURS_TERRAIN = ['#1d4ed8', '#16a34a', '#d97706', '#7c3aed']

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TERRAIN_W = SCREEN_WIDTH - 32
const TERRAIN_H = TERRAIN_W * 1.6

// ─── Regroupement joueurs par sport ───────────────────────────────────────────

function getLignesFootball(joueurs: Joueur[]): Joueur[][] {
  const g = joueurs.filter(j => /gard|gk/i.test(j.poste || ''))
  const d = joueurs.filter(j => /déf|def/i.test(j.poste || ''))
  const m = joueurs.filter(j => /mil|mid/i.test(j.poste || ''))
  const a = joueurs.filter(j => /att|avant|fwd/i.test(j.poste || ''))
  const reste = joueurs.filter(j => !g.includes(j) && !d.includes(j) && !m.includes(j) && !a.includes(j))
  if (g.length === 0 && d.length === 0 && m.length === 0 && a.length === 0) {
    return repartirAuto(joueurs)
  }
  return [g, d, m, [...a, ...reste]].filter(l => l.length > 0)
}

function getLignesBasketball(joueurs: Joueur[]): Joueur[][] {
  const meneur = joueurs.filter(j => /meneur|pg|point/i.test(j.poste || ''))
  const arriere = joueurs.filter(j => /arrière|sg|shoot/i.test(j.poste || ''))
  const ailier = joueurs.filter(j => /ailier|sf|small/i.test(j.poste || ''))
  const pivot = joueurs.filter(j => /pivot|center|centre/i.test(j.poste || ''))
  const reste = joueurs.filter(j =>
    !meneur.includes(j) && !arriere.includes(j) && !ailier.includes(j) && !pivot.includes(j)
  )
  if (meneur.length + arriere.length + ailier.length + pivot.length === 0) {
    return repartirAuto(joueurs)
  }
  return [meneur, arriere, [...ailier, ...reste], pivot].filter(l => l.length > 0)
}

function getLignesVolleyball(joueurs: Joueur[]): Joueur[][] {
  const passeur = joueurs.filter(j => /passeur|setter/i.test(j.poste || ''))
  const libero = joueurs.filter(j => /libéro|libero/i.test(j.poste || ''))
  const attaquant = joueurs.filter(j => /attaquant|hitter/i.test(j.poste || ''))
  const defenseur = joueurs.filter(j => /défenseur|def/i.test(j.poste || ''))
  const reste = joueurs.filter(j =>
    !passeur.includes(j) && !libero.includes(j) && !attaquant.includes(j) && !defenseur.includes(j)
  )
  if (passeur.length + libero.length + attaquant.length + defenseur.length === 0) {
    return repartirAuto(joueurs)
  }
  return [attaquant, [...passeur, ...reste], [...libero, ...defenseur]].filter(l => l.length > 0)
}

function getLignesRugby(joueurs: Joueur[]): Joueur[][] {
  const avant = joueurs.filter(j => /avant/i.test(j.poste || ''))
  const demi = joueurs.filter(j => /demi/i.test(j.poste || ''))
  const tq = joueurs.filter(j => /trois|quarts/i.test(j.poste || ''))
  const arriere = joueurs.filter(j => /arrière/i.test(j.poste || ''))
  const reste = joueurs.filter(j =>
    !avant.includes(j) && !demi.includes(j) && !tq.includes(j) && !arriere.includes(j)
  )
  if (avant.length + demi.length + tq.length + arriere.length === 0) {
    return repartirAuto(joueurs)
  }
  return [avant, demi, tq, [...arriere, ...reste]].filter(l => l.length > 0)
}

function repartirAuto(joueurs: Joueur[]): Joueur[][] {
  const n = joueurs.length
  if (n <= 4) return [joueurs.slice(0, 1), joueurs.slice(1)]
  const parLigne = Math.ceil((n - 1) / 3)
  return [
    joueurs.slice(0, 1),
    joueurs.slice(1, 1 + parLigne),
    joueurs.slice(1 + parLigne, 1 + parLigne * 2),
    joueurs.slice(1 + parLigne * 2),
  ].filter(l => l.length > 0)
}

function getLignes(joueurs: Joueur[], sport: string): Joueur[][] {
  switch (sport) {
    case 'Basketball': return getLignesBasketball(joueurs)
    case 'Volleyball':  return getLignesVolleyball(joueurs)
    case 'Rugby':       return getLignesRugby(joueurs)
    case 'Tennis':      return [joueurs]
    default:            return getLignesFootball(joueurs)
  }
}

// ─── Composant joueur sur terrain ────────────────────────────────────────────

function TerrainEquipe({
  equipe, couleur, top, hauteur, inverse, sport,
}: {
  equipe: Equipe; couleur: string; top: number; hauteur: number; inverse: boolean; sport: string
}) {
  const lignes = getLignes(equipe.joueurs, sport)
  const lignesAffichees = inverse ? [...lignes].reverse() : lignes
  const espacement = hauteur / (lignesAffichees.length + 1)

  return (
    <View style={{ position: 'absolute', top, left: 0, right: 0, height: hauteur }}>
      <View style={{
        position: 'absolute',
        top: inverse ? undefined : 6,
        bottom: inverse ? 6 : undefined,
        left: 8,
        backgroundColor: couleur,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 10, zIndex: 10,
      }}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{equipe.nom}</Text>
      </View>

      {lignesAffichees.map((ligne, li) => (
        <View key={li} style={{
          position: 'absolute',
          top: espacement * (li + 1) - 22,
          left: 0, right: 0,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}>
          {ligne.map(j => (
            <View key={j.id} style={{ alignItems: 'center', width: 48 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: couleur,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)',
                shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 }, elevation: 4,
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                  {j.prenom.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={{
                color: '#fff', fontSize: 9, marginTop: 3,
                textAlign: 'center', fontWeight: '500',
                textShadowColor: 'rgba(0,0,0,0.9)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }} numberOfLines={1}>
                {j.prenom}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

// ─── Terrains ─────────────────────────────────────────────────────────────────

function TerrainFootball({ equipes }: { equipes: Equipe[] }) {
  const LINE = 'rgba(255,255,255,0.45)'
  const cx = TERRAIN_W / 2
  const cy = TERRAIN_H / 2
  const moitieH = TERRAIN_H / equipes.length

  return (
    <View style={{ width: TERRAIN_W, height: TERRAIN_H, alignSelf: 'center', marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#2E7D32' }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute', top: i * (TERRAIN_H / 10),
          left: 0, right: 0, height: TERRAIN_H / 10,
          backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent',
        }} />
      ))}
      {/* Bordure */}
      <View style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 2, borderColor: LINE, borderRadius: 2 }} />
      {/* Ligne médiane */}
      <View style={{ position: 'absolute', top: cy - 1, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      {/* Cercle central */}
      <View style={{ position: 'absolute', top: cy - 44, left: cx - 44, width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: LINE }} />
      <View style={{ position: 'absolute', top: cy - 3, left: cx - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: LINE }} />
      {/* Surfaces haut */}
      <View style={{ position: 'absolute', top: 8, left: cx - 60, width: 120, height: TERRAIN_H * 0.14, borderWidth: 2, borderColor: LINE, borderTopWidth: 0 }} />
      <View style={{ position: 'absolute', top: 8, left: cx - 30, width: 60, height: TERRAIN_H * 0.07, borderWidth: 2, borderColor: LINE, borderTopWidth: 0 }} />
      <View style={{ position: 'absolute', top: TERRAIN_H * 0.12, left: cx - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: LINE }} />
      {/* Surfaces bas */}
      <View style={{ position: 'absolute', bottom: 8, left: cx - 60, width: 120, height: TERRAIN_H * 0.14, borderWidth: 2, borderColor: LINE, borderBottomWidth: 0 }} />
      <View style={{ position: 'absolute', bottom: 8, left: cx - 30, width: 60, height: TERRAIN_H * 0.07, borderWidth: 2, borderColor: LINE, borderBottomWidth: 0 }} />
      <View style={{ position: 'absolute', bottom: TERRAIN_H * 0.12, left: cx - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: LINE }} />
      {/* Cages */}
      <View style={{ position: 'absolute', top: 6, left: cx - 20, width: 40, height: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderTopWidth: 0, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ position: 'absolute', bottom: 6, left: cx - 20, width: 40, height: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 0, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      {equipes.map((eq, i) => (
        <TerrainEquipe key={eq.nom} equipe={eq} couleur={COULEURS_TERRAIN[i % COULEURS_TERRAIN.length]}
          top={i * moitieH} hauteur={moitieH} inverse={i % 2 === 1} sport="Football" />
      ))}
    </View>
  )
}

function TerrainBasketball({ equipes }: { equipes: Equipe[] }) {
  const LINE = 'rgba(255,255,255,0.5)'
  const cx = TERRAIN_W / 2
  const cy = TERRAIN_H / 2
  const moitieH = TERRAIN_H / equipes.length

  return (
    <View style={{ width: TERRAIN_W, height: TERRAIN_H, alignSelf: 'center', marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
      {/* Parquet */}
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#C9A96E' }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute', top: i * (TERRAIN_H / 12),
          left: 0, right: 0, height: TERRAIN_H / 12,
          backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'transparent',
        }} />
      ))}
      {/* Bordure */}
      <View style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 2, borderColor: LINE, borderRadius: 2 }} />
      {/* Ligne médiane */}
      <View style={{ position: 'absolute', top: cy - 1, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      {/* Cercle central */}
      <View style={{ position: 'absolute', top: cy - 36, left: cx - 36, width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: LINE }} />
      {/* Raquette haut */}
      <View style={{ position: 'absolute', top: 8, left: cx - 55, width: 110, height: TERRAIN_H * 0.22, borderWidth: 2, borderColor: LINE, borderTopWidth: 0 }} />
      {/* Arc 3pts haut (demi-cercle) */}
      <View style={{
        position: 'absolute', top: TERRAIN_H * 0.02, left: cx - 85, width: 170, height: 130,
        borderBottomLeftRadius: 85, borderBottomRightRadius: 85,
        borderWidth: 2, borderColor: LINE, borderTopWidth: 0,
      }} />
      {/* Panier haut */}
      <View style={{ position: 'absolute', top: 8, left: cx - 10, width: 20, height: 8, borderRadius: 4, borderWidth: 2, borderColor: 'rgba(255,120,0,0.9)', backgroundColor: 'rgba(255,120,0,0.2)' }} />
      {/* Ligne lancers francs haut */}
      <View style={{ position: 'absolute', top: TERRAIN_H * 0.22 + 6, left: cx - 55, right: cx - 55, height: 2, backgroundColor: LINE, width: 110 }} />

      {/* Raquette bas */}
      <View style={{ position: 'absolute', bottom: 8, left: cx - 55, width: 110, height: TERRAIN_H * 0.22, borderWidth: 2, borderColor: LINE, borderBottomWidth: 0 }} />
      {/* Arc 3pts bas */}
      <View style={{
        position: 'absolute', bottom: TERRAIN_H * 0.02, left: cx - 85, width: 170, height: 130,
        borderTopLeftRadius: 85, borderTopRightRadius: 85,
        borderWidth: 2, borderColor: LINE, borderBottomWidth: 0,
      }} />
      {/* Panier bas */}
      <View style={{ position: 'absolute', bottom: 8, left: cx - 10, width: 20, height: 8, borderRadius: 4, borderWidth: 2, borderColor: 'rgba(255,120,0,0.9)', backgroundColor: 'rgba(255,120,0,0.2)' }} />
      {/* Ligne lancers francs bas */}
      <View style={{ position: 'absolute', bottom: TERRAIN_H * 0.22 + 6, left: cx - 55, height: 2, backgroundColor: LINE, width: 110 }} />

      {equipes.map((eq, i) => (
        <TerrainEquipe key={eq.nom} equipe={eq} couleur={COULEURS_TERRAIN[i % COULEURS_TERRAIN.length]}
          top={i * moitieH} hauteur={moitieH} inverse={i % 2 === 1} sport="Basketball" />
      ))}
    </View>
  )
}

function TerrainVolleyball({ equipes }: { equipes: Equipe[] }) {
  const LINE = 'rgba(255,255,255,0.55)'
  const cx = TERRAIN_W / 2
  const cy = TERRAIN_H / 2
  const moitieH = TERRAIN_H / equipes.length

  return (
    <View style={{ width: TERRAIN_W, height: TERRAIN_H, alignSelf: 'center', marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
      {/* Fond */}
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#1565C0' }} />
      {/* Texture */}
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute', top: i * (TERRAIN_H / 8),
          left: 0, right: 0, height: TERRAIN_H / 8,
          backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
        }} />
      ))}
      {/* Bordure */}
      <View style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 2, borderColor: LINE, borderRadius: 2 }} />
      {/* Filet (double ligne épaisse) */}
      <View style={{ position: 'absolute', top: cy - 3, left: 8, right: 8, height: 6, backgroundColor: 'rgba(255,255,255,0.8)' }} />
      {/* Poteau filet gauche */}
      <View style={{ position: 'absolute', top: cy - 16, left: 4, width: 4, height: 32, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 }} />
      {/* Poteau filet droite */}
      <View style={{ position: 'absolute', top: cy - 16, right: 4, width: 4, height: 32, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 }} />
      {/* Ligne d'attaque haut (3m) */}
      <View style={{ position: 'absolute', top: cy - TERRAIN_H * 0.17, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      {/* Ligne d'attaque bas (3m) */}
      <View style={{ position: 'absolute', bottom: cy - TERRAIN_H * 0.17 - 2, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      {/* Zone de service haut */}
      <View style={{ position: 'absolute', top: 8, left: cx - 20, width: 2, height: 18, backgroundColor: LINE }} />
      <View style={{ position: 'absolute', top: 8, right: cx - 20, width: 2, height: 18, backgroundColor: LINE }} />
      {/* Zone de service bas */}
      <View style={{ position: 'absolute', bottom: 8, left: cx - 20, width: 2, height: 18, backgroundColor: LINE }} />
      <View style={{ position: 'absolute', bottom: 8, right: cx - 20, width: 2, height: 18, backgroundColor: LINE }} />

      {equipes.map((eq, i) => (
        <TerrainEquipe key={eq.nom} equipe={eq} couleur={COULEURS_TERRAIN[i % COULEURS_TERRAIN.length]}
          top={i * moitieH} hauteur={moitieH} inverse={i % 2 === 1} sport="Volleyball" />
      ))}
    </View>
  )
}

function TerrainTennis({ equipes }: { equipes: Equipe[] }) {
  const LINE = 'rgba(255,255,255,0.6)'
  const cx = TERRAIN_W / 2
  const cy = TERRAIN_H / 2
  const moitieH = TERRAIN_H / equipes.length

  return (
    <View style={{ width: TERRAIN_W, height: TERRAIN_H, alignSelf: 'center', marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
      {/* Fond terre battue */}
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#B5651D' }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute', top: i * (TERRAIN_H / 10),
          left: 0, right: 0, height: TERRAIN_H / 10,
          backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent',
        }} />
      ))}
      {/* Ligne de fond (doubles) */}
      <View style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 2, borderColor: LINE, borderRadius: 1 }} />
      {/* Ligne de simples (intérieur) */}
      <View style={{ position: 'absolute', top: 8, left: TERRAIN_W * 0.12, right: TERRAIN_W * 0.12, bottom: 8, borderWidth: 2, borderColor: LINE, borderRadius: 1 }} />
      {/* Filet */}
      <View style={{ position: 'absolute', top: cy - 2, left: 8, right: 8, height: 4, backgroundColor: 'rgba(255,255,255,0.85)' }} />
      {/* Poteaux filet */}
      <View style={{ position: 'absolute', top: cy - 12, left: 6, width: 3, height: 24, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
      <View style={{ position: 'absolute', top: cy - 12, right: 6, width: 3, height: 24, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
      {/* Ligne de service haut */}
      <View style={{ position: 'absolute', top: cy - TERRAIN_H * 0.22, left: TERRAIN_W * 0.12, right: TERRAIN_W * 0.12, height: 2, backgroundColor: LINE }} />
      {/* Ligne de service bas */}
      <View style={{ position: 'absolute', bottom: cy - TERRAIN_H * 0.22 - 2, left: TERRAIN_W * 0.12, right: TERRAIN_W * 0.12, height: 2, backgroundColor: LINE }} />
      {/* Ligne centrale haut */}
      <View style={{ position: 'absolute', top: cy - TERRAIN_H * 0.22, bottom: cy + 2, left: cx - 1, width: 2, backgroundColor: LINE }} />
      {/* Ligne centrale bas */}
      <View style={{ position: 'absolute', top: cy + 2, bottom: cy - TERRAIN_H * 0.22 - 2, left: cx - 1, width: 2, backgroundColor: LINE }} />

      {equipes.map((eq, i) => (
        <TerrainEquipe key={eq.nom} equipe={eq} couleur={COULEURS_TERRAIN[i % COULEURS_TERRAIN.length]}
          top={i * moitieH} hauteur={moitieH} inverse={i % 2 === 1} sport="Tennis" />
      ))}
    </View>
  )
}

function TerrainRugby({ equipes }: { equipes: Equipe[] }) {
  const LINE = 'rgba(255,255,255,0.45)'
  const cx = TERRAIN_W / 2
  const cy = TERRAIN_H / 2
  const moitieH = TERRAIN_H / equipes.length

  return (
    <View style={{ width: TERRAIN_W, height: TERRAIN_H, alignSelf: 'center', marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
      {/* Fond pelouse */}
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#1B5E20' }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute', top: i * (TERRAIN_H / 12),
          left: 0, right: 0, height: TERRAIN_H / 12,
          backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'transparent',
        }} />
      ))}
      {/* Bordure */}
      <View style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 2, borderColor: LINE, borderRadius: 2 }} />
      {/* In-goal haut (zone d'essai) */}
      <View style={{ position: 'absolute', top: 8, left: 8, right: 8, height: TERRAIN_H * 0.1, borderBottomWidth: 2, borderColor: LINE, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      {/* In-goal bas */}
      <View style={{ position: 'absolute', bottom: 8, left: 8, right: 8, height: TERRAIN_H * 0.1, borderTopWidth: 2, borderColor: LINE, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      {/* Ligne médiane */}
      <View style={{ position: 'absolute', top: cy - 1, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      {/* Lignes 22m */}
      <View style={{ position: 'absolute', top: TERRAIN_H * 0.3, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      <View style={{ position: 'absolute', bottom: TERRAIN_H * 0.3, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      {/* Lignes 10m */}
      <View style={{ position: 'absolute', top: cy - TERRAIN_H * 0.1, left: 8, right: 8, height: 2, backgroundColor: 'rgba(255,255,255,0.25)' }} />
      <View style={{ position: 'absolute', bottom: cy - TERRAIN_H * 0.1 - 2, left: 8, right: 8, height: 2, backgroundColor: 'rgba(255,255,255,0.25)' }} />
      {/* Poteaux H haut */}
      <View style={{ position: 'absolute', top: 2, left: cx - 18, width: 36, height: 12, borderBottomWidth: 0 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        <View style={{ position: 'absolute', top: 0, right: 0, width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        <View style={{ position: 'absolute', top: 6, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.7)' }} />
      </View>
      {/* Poteaux H bas */}
      <View style={{ position: 'absolute', bottom: 2, left: cx - 18, width: 36 }}>
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        <View style={{ position: 'absolute', bottom: 6, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.7)' }} />
      </View>

      {equipes.map((eq, i) => (
        <TerrainEquipe key={eq.nom} equipe={eq} couleur={COULEURS_TERRAIN[i % COULEURS_TERRAIN.length]}
          top={i * moitieH} hauteur={moitieH} inverse={i % 2 === 1} sport="Rugby" />
      ))}
    </View>
  )
}

function TerrainAutre({ equipes }: { equipes: Equipe[] }) {
  const LINE = 'rgba(255,255,255,0.4)'
  const cx = TERRAIN_W / 2
  const cy = TERRAIN_H / 2
  const moitieH = TERRAIN_H / equipes.length

  return (
    <View style={{ width: TERRAIN_W, height: TERRAIN_H, alignSelf: 'center', marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', inset: 0, backgroundColor: '#374151' }} />
      <View style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 2, borderColor: LINE, borderRadius: 2 }} />
      <View style={{ position: 'absolute', top: cy - 1, left: 8, right: 8, height: 2, backgroundColor: LINE }} />
      <View style={{ position: 'absolute', top: cy - 44, left: cx - 44, width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: LINE }} />
      {equipes.map((eq, i) => (
        <TerrainEquipe key={eq.nom} equipe={eq} couleur={COULEURS_TERRAIN[i % COULEURS_TERRAIN.length]}
          top={i * moitieH} hauteur={moitieH} inverse={i % 2 === 1} sport="Autre" />
      ))}
    </View>
  )
}

const TERRAIN_EMOJI: Record<string, string> = {
  Football:   '⚽',
  Basketball: '🏀',
  Volleyball: '🏐',
  Tennis:     '🎾',
  Rugby:      '🏉',
  Autre:      '🏟️',
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function Resultat() {
  const router = useRouter()
  const { equipes: equipesParam, equilibrePct, groupeId } = useLocalSearchParams()
  const { t } = useLanguage()

  const [equipes, setEquipes] = useState<Equipe[]>(() => {
    try { return JSON.parse(equipesParam as string) ?? [] }
    catch { return [] }
  })
  const [equilibre, setEquilibre] = useState(Number(equilibrePct))
  const [vue, setVue] = useState<'liste' | 'terrain'>('liste')
  const [sport, setSport] = useState('Football')
  const savedRef = useRef(false)

  useEffect(() => {
    if (!savedRef.current) {
      savedRef.current = true
      sauvegarderTirage()
    }
    if (groupeId) fetchSport()
  }, [])

  async function fetchSport() {
    const { data } = await supabase
      .from('groupes')
      .select('sport')
      .eq('id', groupeId)
      .single()
    if (data?.sport) setSport(data.sport)
  }

  function handleRelancer() {
    const tousJoueurs = equipes.flatMap(e => e.joueurs)
    const { equipes: newEquipes, equilibrePct: newEquilibre } = genererEquipes({
      joueurs: tousJoueurs,
      nbEquipes: equipes.length,
      shuffle: true,
    })
    setEquipes(newEquipes)
    setEquilibre(newEquilibre)
  }

  async function sauvegarderTirage() {
    try {
      const dateMatch = new Date()
      await supabase.from('tirages').insert({
        groupe_id: groupeId,
        equipes: equipes,
        equilibre_pct: equilibre,
        date_match: dateMatch.toISOString().split('T')[0],
      })
      cacheInvalidate('tirages')
      await planifierRappelMatch(
        '',
        dateMatch,
        t('generatedTeams') + ' — ' + t('shareBalanceLabel') + ' ' + equilibre + '%',
        equipes.map(e => e.nom + ' (' + e.joueurs.length + ' ' + t('playersCount') + ')').join(' · ')
      )
    } catch (e) {
      // silently ignore
    }
  }

  async function handlePartager() {
    const texte = equipes.map(eq => {
      const joueurs = eq.joueurs.map(j =>
        `${j.prenom} ${j.nom} (${j.poste || 'N/A'} · ${'★'.repeat(Math.round(j.note_moyenne))})`
      ).join(', ')
      return `${eq.nom} : ${joueurs}`
    }).join('\n\n')
    await Share.share({
      message: `${TERRAIN_EMOJI[sport] ?? '🏆'} ${t('shareTeamsTitle')}\n\n${texte}\n\n${t('shareBalanceLabel')} : ${equilibre}%`,
    })
  }

  function renderTerrain() {
    switch (sport) {
      case 'Basketball': return <TerrainBasketball equipes={equipes} />
      case 'Volleyball':  return <TerrainVolleyball equipes={equipes} />
      case 'Tennis':      return <TerrainTennis equipes={equipes} />
      case 'Rugby':       return <TerrainRugby equipes={equipes} />
      case 'Autre':       return <TerrainAutre equipes={equipes} />
      default:            return <TerrainFootball equipes={equipes} />
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{
        backgroundColor: '#1e3a5f',
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('back')}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>{t('generatedTeams')}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>{t('balance')} {equilibre}%</Text>
          </View>

          {/* Toggle Liste / Terrain */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 10, padding: 3,
          }}>
            <TouchableOpacity
              onPress={() => setVue('liste')}
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                backgroundColor: vue === 'liste' ? '#fff' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: vue === 'liste' ? '#0f172a' : 'rgba(255,255,255,0.7)' }}>
                {t('listView')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVue('terrain')}
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                backgroundColor: vue === 'terrain' ? '#fff' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: vue === 'terrain' ? '#0f172a' : 'rgba(255,255,255,0.7)' }}>
                {TERRAIN_EMOJI[sport] ?? '🏟️'} {t('pitchView')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre équilibre */}
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            {equipes.map((eq, i) => (
              <Text key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                {eq.nom} · {eq.totalPoints.toFixed(1)}pts
              </Text>
            ))}
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', overflow: 'hidden' }}>
            {equipes.map((eq, i) => (
              <View key={i} style={{
                flex: eq.totalPoints,
                backgroundColor: ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6'][i] || '#2563eb',
              }} />
            ))}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {vue === 'liste' ? (
          equipes.map((eq, i) => (
            <View key={i} style={{
              backgroundColor: '#ffffff', borderRadius: 16, marginBottom: 10,
              overflow: 'hidden',
              shadowColor: '#0f172a', shadowOpacity: 0.06, shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}>
              <View style={{
                backgroundColor: `${COULEURS_EQUIPES[i]}15`, padding: 10,
                flexDirection: 'row', alignItems: 'center',
              }}>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: COULEURS_EQUIPES[i] }}>{eq.nom}</Text>
                <Text style={{ fontSize: 11, color: '#64748b' }}>{eq.totalPoints.toFixed(1)} pts</Text>
              </View>
              <View style={{ padding: 10 }}>
                {eq.joueurs.map(j => (
                  <View key={j.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                    <View style={{
                      width: 24, height: 24, borderRadius: 12,
                      backgroundColor: j.couleur_avatar,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 9, fontWeight: '500', color: '#2563eb' }}>{j.prenom.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 12, color: '#0f172a' }}>{j.prenom} {j.nom}</Text>
                    <Text style={{
                      fontSize: 10, fontWeight: '500', color: '#64748b',
                      backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2,
                      borderRadius: 8, textAlign: 'center',
                    }}>
                      {j.poste || 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#f59e0b' }}>{'★'.repeat(Math.round(j.note_moyenne))}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          renderTerrain()
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleRelancer}
            style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#0f172a', fontSize: 14, fontWeight: '500' }}>{t('reroll')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePartager}
            style={{ flex: 1, backgroundColor: '#2563eb', borderRadius: 14, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{t('share')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
