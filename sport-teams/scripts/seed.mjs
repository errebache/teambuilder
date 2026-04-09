/**
 * Squadra — Script de seed réaliste (données internationales)
 * Usage: node scripts/seed.mjs
 *
 * Peuple la base Supabase avec :
 *  - 3 groupes (Football, Basketball, Rugby)
 *  - ~8 joueurs par groupe (USA, France, Europe)
 *  - Avis par joueur
 *  - Historique de matchs (tirages)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vhfgphabvbdptjbioeea.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_7FIMPvywhRjF3A0_bEqIQA_VIGpH_dh'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const AVATAR_COLORS = ['#E6F1FB', '#EAF3DE', '#FAEEDA', '#EEEDFE', '#FAECE7', '#E1F5EE']
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const color = () => pick(AVATAR_COLORS)

// ─── Connexion anonyme ────────────────────────────────────────────────────────

async function getOrCreateUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return user
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw new Error('Auth failed: ' + error.message)
  return data.user
}

// ─── Données ──────────────────────────────────────────────────────────────────

const GROUPES = [
  { nom: 'Squadra Elite',    sport: 'Football',    emoji: '⚽' },
  { nom: 'Champions Club',   sport: 'Basketball',  emoji: '🏀' },
  { nom: 'Les Guerriers',    sport: 'Rugby',       emoji: '🏉' },
]

// joueurs par groupe
const JOUEURS = {
  'Squadra Elite': [
    { prenom: 'Lucas',    nom: 'Martin',      poste: 'Milieu',     qualites: { vitesse: 4, precision: 4, physique: 3, vision: 5, defense: 3, technique: 4 } },
    { prenom: 'Hugo',     nom: 'Bernard',     poste: 'Défenseur',  qualites: { vitesse: 3, precision: 3, physique: 5, vision: 3, defense: 5, technique: 3 } },
    { prenom: 'Antoine',  nom: 'Dubois',      poste: 'Attaquant',  qualites: { vitesse: 5, precision: 5, physique: 3, vision: 4, defense: 2, technique: 5 } },
    { prenom: 'John',     nom: 'Miller',      poste: 'Gardien',    qualites: { vitesse: 2, precision: 4, physique: 4, vision: 4, defense: 5, technique: 3 } },
    { prenom: 'Alex',     nom: 'Johnson',     poste: 'Milieu',     qualites: { vitesse: 4, precision: 3, physique: 4, vision: 4, defense: 3, technique: 4 } },
    { prenom: 'Karim',    nom: 'Benzema',     poste: 'Attaquant',  qualites: { vitesse: 5, precision: 5, physique: 4, vision: 5, defense: 2, technique: 5 } },
    { prenom: 'Marco',    nom: 'Rossi',       poste: 'Défenseur',  qualites: { vitesse: 3, precision: 3, physique: 5, vision: 3, defense: 5, technique: 3 } },
    { prenom: 'Youssef',  nom: 'El Amrani',   poste: 'Milieu',     qualites: { vitesse: 4, precision: 4, physique: 4, vision: 4, defense: 3, technique: 4 } },
  ],
  'Champions Club': [
    { prenom: 'Michael',  nom: 'Brown',       poste: 'Pivot',      qualites: { vitesse: 2, precision: 4, physique: 5, vision: 3, defense: 5, technique: 3 } },
    { prenom: 'James',    nom: 'Carter',      poste: 'Meneur',     qualites: { vitesse: 5, precision: 4, physique: 3, vision: 5, defense: 3, technique: 4 } },
    { prenom: 'Tyler',    nom: 'Brooks',      poste: 'Ailier',     qualites: { vitesse: 5, precision: 5, physique: 3, vision: 4, defense: 2, technique: 4 } },
    { prenom: 'Théo',     nom: 'Lambert',     poste: 'Arrière',    qualites: { vitesse: 4, precision: 4, physique: 3, vision: 4, defense: 3, technique: 4 } },
    { prenom: 'Maxime',   nom: 'Leclerc',     poste: 'Pivot',      qualites: { vitesse: 2, precision: 3, physique: 5, vision: 3, defense: 5, technique: 3 } },
    { prenom: 'Noah',     nom: 'Williams',    poste: 'Meneur',     qualites: { vitesse: 5, precision: 4, physique: 3, vision: 5, defense: 2, technique: 4 } },
    { prenom: 'Luca',     nom: 'Ferrari',     poste: 'Ailier',     qualites: { vitesse: 4, precision: 5, physique: 3, vision: 4, defense: 2, technique: 5 } },
    { prenom: 'Carlos',   nom: 'Mendez',      poste: 'Arrière',    qualites: { vitesse: 4, precision: 3, physique: 4, vision: 4, defense: 4, technique: 3 } },
  ],
  'Les Guerriers': [
    { prenom: 'Romain',   nom: 'Dupont',      poste: 'Avant',      qualites: { vitesse: 2, precision: 3, physique: 5, vision: 2, defense: 5, technique: 3 } },
    { prenom: 'Pierre',   nom: 'Garnier',     poste: 'Demi',       qualites: { vitesse: 4, precision: 4, physique: 3, vision: 5, defense: 3, technique: 4 } },
    { prenom: 'Samuel',   nom: 'Morel',       poste: 'Trois-quarts', qualites: { vitesse: 5, precision: 4, physique: 4, vision: 4, defense: 3, technique: 4 } },
    { prenom: 'Tom',      nom: 'Harrison',    poste: 'Arrière',    qualites: { vitesse: 5, precision: 4, physique: 3, vision: 4, defense: 3, technique: 4 } },
    { prenom: 'Finn',     nom: 'Murphy',      poste: 'Avant',      qualites: { vitesse: 2, precision: 2, physique: 5, vision: 2, defense: 5, technique: 2 } },
    { prenom: 'Diego',    nom: 'Vargas',      poste: 'Trois-quarts', qualites: { vitesse: 5, precision: 4, physique: 4, vision: 3, defense: 3, technique: 4 } },
    { prenom: 'Adrien',   nom: 'Fontaine',    poste: 'Demi',       qualites: { vitesse: 4, precision: 5, physique: 3, vision: 5, defense: 2, technique: 5 } },
    { prenom: 'Stefan',   nom: 'Mueller',     poste: 'Avant',      qualites: { vitesse: 2, precision: 3, physique: 5, vision: 2, defense: 5, technique: 3 } },
  ],
}

// Avis réalistes par joueur (index dans le groupe)
const AVIS_TEMPLATES = [
  { note: 5, tags: ['Technique', 'Leader', 'Régulier'],   commentaire: 'Joueur exceptionnel, toujours décisif.' },
  { note: 4, tags: ['Rapide', 'Buteur'],                  commentaire: 'Très bon match, vitesse impressionnante.' },
  { note: 4, tags: ['Défenseur', 'Combatif'],             commentaire: 'Solide en défense, aucune faille.' },
  { note: 5, tags: ['Passeur', 'Vision'],                 commentaire: 'Passes millimétrées, vision du jeu excellente.' },
  { note: 3, tags: ['Régulier', 'Fair-play'],             commentaire: 'Bon match dans l\'ensemble, peut encore progresser.' },
  { note: 4, tags: ['Technique', 'Rapide'],               commentaire: 'Très à l\'aise avec le ballon.' },
  { note: 5, tags: ['Leader', 'Combatif'],                commentaire: 'Mène l\'équipe avec autorité.' },
  { note: 3, tags: ['Fair-play', 'Régulier'],             commentaire: 'Présent sur le terrain, bon état d\'esprit.' },
]

// Calcul note_moyenne depuis qualites
function noteMoyenne(q) {
  const vals = Object.values(q)
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Démarrage du seed...\n')

  const user = await getOrCreateUser()
  console.log(`✅ Connecté : ${user.id}\n`)

  for (const groupeData of GROUPES) {
    console.log(`\n📁 Groupe : ${groupeData.emoji} ${groupeData.nom} (${groupeData.sport})`)

    // Créer le groupe
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data: groupe, error: gErr } = await supabase
      .from('groupes')
      .insert({ ...groupeData, user_id: user.id, code })
      .select()
      .single()

    if (gErr) { console.error('  ❌ Groupe:', gErr.message); continue }
    console.log(`  ✅ Groupe créé (id: ${groupe.id}, code: ${code})`)

    const joueursData = JOUEURS[groupeData.nom]
    const joueursInserted = []

    // Créer les joueurs
    for (let i = 0; i < joueursData.length; i++) {
      const jd = joueursData[i]
      const note = noteMoyenne(jd.qualites)
      const { data: joueur, error: jErr } = await supabase
        .from('joueurs')
        .insert({
          groupe_id: groupe.id,
          prenom: jd.prenom,
          nom: jd.nom,
          poste: jd.poste,
          note_moyenne: note,
          couleur_avatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
          qualites: jd.qualites,
        })
        .select()
        .single()

      if (jErr) { console.error(`  ❌ Joueur ${jd.prenom}:`, jErr.message); continue }
      joueursInserted.push(joueur)
      console.log(`  👤 ${jd.prenom} ${jd.nom} — ${jd.poste} — ★${note}`)

      // Avis pour ce joueur
      const avisTemplate = AVIS_TEMPLATES[i % AVIS_TEMPLATES.length]
      const { error: aErr } = await supabase
        .from('avis')
        .insert({
          joueur_id: joueur.id,
          auteur_id: user.id,
          note: avisTemplate.note,
          tags: avisTemplate.tags,
          commentaire: avisTemplate.commentaire,
        })
      if (aErr) console.error(`    ❌ Avis:`, aErr.message)
      else console.log(`    💬 Avis ajouté (${avisTemplate.note}★)`)
    }

    // Créer 3 tirages (historique de matchs)
    if (joueursInserted.length >= 4) {
      const matchDates = [
        new Date(Date.now() - 7  * 24*60*60*1000), // il y a 1 semaine
        new Date(Date.now() - 14 * 24*60*60*1000), // il y a 2 semaines
        new Date(Date.now() - 21 * 24*60*60*1000), // il y a 3 semaines
      ]

      for (let t = 0; t < 3; t++) {
        // Mélanger les joueurs
        const shuffled = [...joueursInserted].sort(() => Math.random() - 0.5)
        const mid = Math.floor(shuffled.length / 2)
        const eq1 = shuffled.slice(0, mid)
        const eq2 = shuffled.slice(mid)

        const total1 = eq1.reduce((s, j) => s + j.note_moyenne, 0)
        const total2 = eq2.reduce((s, j) => s + j.note_moyenne, 0)
        const diff = Math.abs(total1 - total2)
        const maxTotal = Math.max(total1, total2)
        const equilibre = Math.round((1 - diff / maxTotal) * 100)

        const equipes = [
          { nom: 'Équipe A', joueurs: eq1, totalPoints: total1 },
          { nom: 'Équipe B', joueurs: eq2, totalPoints: total2 },
        ]

        const { error: tErr } = await supabase
          .from('tirages')
          .insert({
            groupe_id: groupe.id,
            equipes,
            equilibre_pct: Math.max(0, Math.min(100, equilibre)),
            date_match: matchDates[t].toISOString().split('T')[0],
          })

        if (tErr) console.error(`  ❌ Tirage ${t+1}:`, tErr.message)
        else console.log(`  🎯 Match ${t+1} le ${matchDates[t].toISOString().split('T')[0]} — équilibre ${equilibre}%`)
      }
    }
  }

  console.log('\n✅ Seed terminé avec succès !')
  console.log('🚀 Lance l\'app et connecte-toi pour voir les données.')
}

seed().catch(console.error)
