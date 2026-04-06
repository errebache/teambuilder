export interface Groupe {
  id: string
  user_id: string
  nom: string
  sport: string
  emoji: string
  code?: string
  created_at: string
}
export interface Qualites {
  vitesse: number
  precision: number
  physique: number
  vision: number
  defense: number
  technique: number
}

export interface Joueur {
  id: string
  groupe_id: string
  prenom: string
  nom: string
  note_moyenne: number
  poste?: string
  couleur_avatar: string
  qualites?: Qualites
  created_at: string
}

export interface Avis {
  id: string
  joueur_id: string
  auteur_id?: string
  note: number
  tags: string[]
  commentaire?: string
  created_at: string
}

export interface Tirage {
  id: string
  groupe_id: string
  equipes: Equipe[]
  equilibre_pct: number
  date_match: string
  created_at: string
}

export interface Equipe {
  nom: string
  joueurs: Joueur[]
  totalPoints: number
}

export interface LienNotation {
  id: string
  joueur_id: string
  token: string
  utilise: boolean
  expire_at: string
  created_at: string
}