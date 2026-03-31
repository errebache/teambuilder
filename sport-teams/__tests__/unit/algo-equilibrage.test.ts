import { genererEquipes, calculerEquilibre } from '../../lib/algo-equilibrage'
import { Joueur } from '../../types'

const createJoueur = (id: string, note: number): Joueur => ({
  id,
  groupe_id: 'groupe-1',
  prenom: 'Joueur',
  nom: id,
  note_moyenne: note,
  couleur_avatar: '#E6F1FB',
  created_at: new Date().toISOString(),
})

const joueurs10 = [
  createJoueur('j1', 5),
  createJoueur('j2', 4),
  createJoueur('j3', 4),
  createJoueur('j4', 3),
  createJoueur('j5', 3),
  createJoueur('j6', 3),
  createJoueur('j7', 2),
  createJoueur('j8', 2),
  createJoueur('j9', 1),
  createJoueur('j10', 1),
]

describe('genererEquipes', () => {
  it('crée 2 équipes avec 5 joueurs chacune', () => {
    const { equipes } = genererEquipes({ joueurs: joueurs10, nbEquipes: 2 })
    expect(equipes).toHaveLength(2)
    expect(equipes[0].joueurs).toHaveLength(5)
    expect(equipes[1].joueurs).toHaveLength(5)
  })

  it('génère un équilibre > 80% avec notes variées', () => {
    const { equilibrePct } = genererEquipes({ joueurs: joueurs10, nbEquipes: 2 })
    expect(equilibrePct).toBeGreaterThan(80)
  })

  it('retourne 100% si tous les joueurs ont la même note', () => {
    const joueursEgaux = Array.from({ length: 8 }, (_, i) =>
      createJoueur(`j${i}`, 3)
    )
    const { equilibrePct } = genererEquipes({ joueurs: joueursEgaux, nbEquipes: 2 })
    expect(equilibrePct).toBe(100)
  })

  it('crée 3 équipes avec 12 joueurs', () => {
    const joueurs12 = Array.from({ length: 12 }, (_, i) =>
      createJoueur(`j${i}`, Math.floor(Math.random() * 5) + 1)
    )
    const { equipes } = genererEquipes({ joueurs: joueurs12, nbEquipes: 3 })
    expect(equipes).toHaveLength(3)
    expect(equipes.reduce((sum, e) => sum + e.joueurs.length, 0)).toBe(12)
  })

  it('lance une erreur si moins de 4 joueurs', () => {
    const peuDeJoueurs = [
      createJoueur('j1', 3),
      createJoueur('j2', 3),
    ]
    expect(() =>
      genererEquipes({ joueurs: peuDeJoueurs, nbEquipes: 2 })
    ).toThrow('Il faut au moins 4 joueurs')
  })

  it('produit des résultats différents avec shuffle=true', () => {
    const r1 = genererEquipes({ joueurs: joueurs10, nbEquipes: 2, shuffle: true })
    const r2 = genererEquipes({ joueurs: joueurs10, nbEquipes: 2, shuffle: true })
    const ids1 = r1.equipes[0].joueurs.map(j => j.id).join(',')
    const ids2 = r2.equipes[0].joueurs.map(j => j.id).join(',')
    expect(ids1).not.toBe(ids2)
  })
})

describe('calculerEquilibre', () => {
  it('retourne 100 si toutes les équipes ont le même total', () => {
    const equipes = [
      { nom: 'A', joueurs: [], totalPoints: 10 },
      { nom: 'B', joueurs: [], totalPoints: 10 },
    ]
    expect(calculerEquilibre(equipes)).toBe(100)
  })

  it('retourne une valeur entre 0 et 100', () => {
    const equipes = [
      { nom: 'A', joueurs: [], totalPoints: 15 },
      { nom: 'B', joueurs: [], totalPoints: 5 },
    ]
    const result = calculerEquilibre(equipes)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})