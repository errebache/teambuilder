import { Joueur, Equipe } from '../types'

export interface ConfigTirage {
  joueurs: Joueur[]
  nbEquipes: number
  shuffle?: boolean
}

export interface ResultatTirage {
  equipes: Equipe[]
  equilibrePct: number
}

export function genererEquipes(config: ConfigTirage): ResultatTirage {
  const { joueurs, nbEquipes, shuffle = false } = config

  if (joueurs.length < 4) {
    throw new Error('Il faut au moins 4 joueurs pour générer des équipes')
  }

  // Trier par note décroissante
  let joueursTriés = [...joueurs].sort(
    (a, b) => b.note_moyenne - a.note_moyenne
  )

  // Shuffle optionnel pour varier les tirages
  if (shuffle) {
    joueursTriés = shuffleAvecVariation(joueursTriés)
  }

  // Initialiser les équipes
  const equipes: Equipe[] = Array.from({ length: nbEquipes }, (_, i) => ({
    nom: `Équipe ${'ABCDEFGH'[i]}`,
    joueurs: [],
    totalPoints: 0,
  }))

  // Algorithme greedy : assigner chaque joueur à l'équipe avec le moins de points
  for (const joueur of joueursTriés) {
    const equipeMinPoints = equipes.reduce((min, eq) =>
      eq.totalPoints < min.totalPoints ? eq : min
    )
    equipeMinPoints.joueurs.push(joueur)
    equipeMinPoints.totalPoints += joueur.note_moyenne
  }

  const equilibrePct = calculerEquilibre(equipes)

  return { equipes, equilibrePct }
}

export function calculerEquilibre(equipes: Equipe[]): number {
  if (equipes.length === 0) return 100

  const points = equipes.map(e => e.totalPoints)
  const max = Math.max(...points)
  const min = Math.min(...points)
  const avg = points.reduce((a, b) => a + b, 0) / points.length

  if (avg === 0) return 100

  return Math.round(100 - ((max - min) / avg) * 100)
}

function shuffleAvecVariation(joueurs: Joueur[]): Joueur[] {
  // Mélange par groupes de niveau pour garder un semblant d'équilibre
  const result = [...joueurs]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.max(0, i - Math.floor(Math.random() * 3))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}