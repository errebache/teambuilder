import { View, Text, ScrollView, TouchableOpacity, Share, Dimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { genererEquipes } from '../../lib/algo-equilibrage'
import { supabase } from '../../lib/supabase'
import { planifierRappelMatch } from '../../lib/notifications'
import { useEffect, useState } from 'react'
import { Equipe, Joueur } from '../../types'

const COULEURS_EQUIPES = ['#185FA5', '#0F6E56', '#854F0B', '#534AB7']
const COULEURS_TERRAIN = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A']

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TERRAIN_W = SCREEN_WIDTH - 32
const TERRAIN_H = TERRAIN_W * 1.6

// Distribue les joueurs d'une équipe en lignes de postes
function getLignes(joueurs: Joueur[]): Joueur[][] {
  const g = joueurs.filter(j => /gard|gk/i.test(j.poste || ''))
  const d = joueurs.filter(j => /déf|def/i.test(j.poste || ''))
  const m = joueurs.filter(j => /mil|mid/i.test(j.poste || ''))
  const a = joueurs.filter(j => /att|avant|fwd/i.test(j.poste || ''))
  const reste = joueurs.filter(j => !g.includes(j) && !d.includes(j) && !m.includes(j) && !a.includes(j))

  if (g.length === 0 && d.length === 0 && m.length === 0 && a.length === 0) {
    // pas de postes → répartition auto
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
  return [g, d, m, [...a, ...reste]].filter(l => l.length > 0)
}

function TerrainEquipe({
  equipe,
  couleur,
  top,
  hauteur,
  inverse,
}: {
  equipe: Equipe
  couleur: string
  top: number
  hauteur: number
  inverse: boolean
}) {
  const lignes = getLignes(equipe.joueurs)
  const lignesAffichees = inverse ? [...lignes].reverse() : lignes
  const espacement = hauteur / (lignesAffichees.length + 1)

  return (
    <View style={{ position: 'absolute', top, left: 0, right: 0, height: hauteur }}>
      {/* Label équipe */}
      <View style={{
        position: 'absolute',
        top: inverse ? undefined : 6,
        bottom: inverse ? 6 : undefined,
        left: 8,
        backgroundColor: couleur,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 10,
        zIndex: 10,
      }}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{equipe.nom}</Text>
      </View>

      {lignesAffichees.map((ligne, li) => (
        <View
          key={li}
          style={{
            position: 'absolute',
            top: espacement * (li + 1) - 22,
            left: 0, right: 0,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingHorizontal: 12,
          }}
        >
          {ligne.map(j => (
            <View key={j.id} style={{ alignItems: 'center', width: 48 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: couleur,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.9)',
                shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
                elevation: 4,
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                  {j.prenom.substring(0,2).toUpperCase()}
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

export default function Resultat() {
  const router = useRouter()
  const { equipes: equipesParam, equilibrePct, groupeId } = useLocalSearchParams()

  const [equipes, setEquipes] = useState<Equipe[]>(() => {
    try { return JSON.parse(equipesParam as string) ?? [] }
    catch { return [] }
  })
  const [equilibre, setEquilibre] = useState(Number(equilibrePct))
  const [vue, setVue] = useState<'liste' | 'terrain'>('liste')

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

  useEffect(() => {
    sauvegarderTirage()
  }, [])

  async function sauvegarderTirage() {
    try {
      const dateMatch = new Date()
      await supabase.from('tirages').insert({
        groupe_id: groupeId,
        equipes: equipes,
        equilibre_pct: equilibre,
        date_match: dateMatch.toISOString().split('T')[0],
      })
      await planifierRappelMatch(
        '',
        dateMatch,
        'Équipes générées — Équilibre ' + equilibre + '%',
        equipes.map(e => e.nom + ' (' + e.joueurs.length + ' joueurs)').join(' · ')
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
      message: `⚽ Équipes générées !\n\n${texte}\n\nÉquilibre : ${equilibre}%`,
    })
  }

  function renderTerrain() {
    const nbEquipes = equipes.length
    const moitieH = TERRAIN_H / nbEquipes
    const LINE = 'rgba(255,255,255,0.45)'
    const cx = TERRAIN_W / 2
    const cy = TERRAIN_H / 2

    return (
      <View style={{ width: TERRAIN_W, height: TERRAIN_H, alignSelf: 'center', marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
        {/* Fond pelouse avec dégradé de bandes */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#2E7D32' }} />
        {/* Bandes claires/sombres */}
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={{
            position: 'absolute',
            top: i * (TERRAIN_H / 10),
            left: 0, right: 0,
            height: TERRAIN_H / 10,
            backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent',
          }} />
        ))}

        {/* Bordure terrain */}
        <View style={{
          position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
          borderWidth: 2, borderColor: LINE, borderRadius: 2,
        }} />

        {/* Ligne médiane */}
        <View style={{
          position: 'absolute', top: cy - 1, left: 8, right: 8,
          height: 2, backgroundColor: LINE,
        }} />

        {/* Cercle central */}
        <View style={{
          position: 'absolute',
          top: cy - 44, left: cx - 44,
          width: 88, height: 88, borderRadius: 44,
          borderWidth: 2, borderColor: LINE,
        }} />
        {/* Point central */}
        <View style={{
          position: 'absolute', top: cy - 3, left: cx - 3,
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: LINE,
        }} />

        {/* Surface de réparation haut */}
        <View style={{
          position: 'absolute', top: 8, left: cx - 60,
          width: 120, height: TERRAIN_H * 0.14,
          borderWidth: 2, borderColor: LINE,
          borderTopWidth: 0,
        }} />
        {/* Petite surface haut */}
        <View style={{
          position: 'absolute', top: 8, left: cx - 30,
          width: 60, height: TERRAIN_H * 0.07,
          borderWidth: 2, borderColor: LINE,
          borderTopWidth: 0,
        }} />
        {/* Point de penalty haut */}
        <View style={{
          position: 'absolute', top: TERRAIN_H * 0.12, left: cx - 3,
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: LINE,
        }} />

        {/* Surface de réparation bas */}
        <View style={{
          position: 'absolute', bottom: 8, left: cx - 60,
          width: 120, height: TERRAIN_H * 0.14,
          borderWidth: 2, borderColor: LINE,
          borderBottomWidth: 0,
        }} />
        {/* Petite surface bas */}
        <View style={{
          position: 'absolute', bottom: 8, left: cx - 30,
          width: 60, height: TERRAIN_H * 0.07,
          borderWidth: 2, borderColor: LINE,
          borderBottomWidth: 0,
        }} />
        {/* Point de penalty bas */}
        <View style={{
          position: 'absolute', bottom: TERRAIN_H * 0.12, left: cx - 3,
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: LINE,
        }} />

        {/* Cages haut */}
        <View style={{
          position: 'absolute', top: 6, left: cx - 20,
          width: 40, height: 10,
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
          borderTopWidth: 0, borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }} />
        {/* Cages bas */}
        <View style={{
          position: 'absolute', bottom: 6, left: cx - 20,
          width: 40, height: 10,
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
          borderBottomWidth: 0, borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }} />

        {/* Joueurs par équipe */}
        {equipes.map((eq, i) => (
          <TerrainEquipe
            key={eq.nom}
            equipe={eq}
            couleur={COULEURS_TERRAIN[i % COULEURS_TERRAIN.length]}
            top={i * moitieH}
            hauteur={moitieH}
            inverse={i % 2 === 1}
          />
        ))}
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>Équipes générées</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>Équilibre {equilibre}%</Text>
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
              <Text style={{ fontSize: 12, fontWeight: '600', color: vue === 'liste' ? '#1a1a2e' : 'rgba(255,255,255,0.7)' }}>
                Liste
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVue('terrain')}
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                backgroundColor: vue === 'terrain' ? '#fff' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: vue === 'terrain' ? '#1a1a2e' : 'rgba(255,255,255,0.7)' }}>
                ⛳ Terrain
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
                backgroundColor: i === 0 ? '#378ADD' : i === 1 ? '#34d399' : i === 2 ? '#EF9F27' : '#AFA9EC',
              }} />
            ))}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {vue === 'liste' ? (
          equipes.map((eq, i) => (
            <View key={i} style={{
              backgroundColor: '#fff', borderRadius: 14, marginBottom: 10,
              overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
            }}>
              <View style={{
                backgroundColor: `${COULEURS_EQUIPES[i]}20`, padding: 10,
                flexDirection: 'row', alignItems: 'center',
              }}>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: COULEURS_EQUIPES[i] }}>{eq.nom}</Text>
                <Text style={{ fontSize: 11, color: '#999' }}>{eq.totalPoints.toFixed(1)} pts</Text>
              </View>
              <View style={{ padding: 10 }}>
                {eq.joueurs.map(j => (
                  <View key={j.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                    <View style={{
                      width: 24, height: 24, borderRadius: 12,
                      backgroundColor: j.couleur_avatar,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 9, fontWeight: '500', color: '#185FA5' }}>{j.prenom.substring(0,2).toUpperCase()}</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 12, color: '#1a1a2e' }}>{j.prenom} {j.nom}</Text>
                    <Text style={{
                      fontSize: 10, fontWeight: '500', color: '#888',
                      backgroundColor: '#F1EFE8', paddingHorizontal: 6, paddingVertical: 2,
                      borderRadius: 8, textAlign: 'center',
                    }}>
                      {j.poste || 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>{'★'.repeat(Math.round(j.note_moyenne))}</Text>
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
            style={{ flex: 1, backgroundColor: '#F1EFE8', borderRadius: 14, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#1a1a2e', fontSize: 14, fontWeight: '500' }}>Relancer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePartager}
            style={{ flex: 1, backgroundColor: '#1a1a2e', borderRadius: 14, padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Partager</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
