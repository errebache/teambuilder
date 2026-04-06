/**
 * RTL helpers — utiliser ces fonctions partout dans l'app.
 * On n'utilise PAS `direction: 'rtl'` sur le root View — tout est explicite.
 * I18nManager.forceRTL(true) gère le niveau natif (texte arabe, etc.).
 */

export function row(isRTL: boolean): 'row' | 'row-reverse' {
  return isRTL ? 'row-reverse' : 'row'
}

export function textAlign(isRTL: boolean): 'left' | 'right' {
  return isRTL ? 'right' : 'left'
}

export function alignSelf(isRTL: boolean): 'flex-start' | 'flex-end' {
  // flex-end = visual RIGHT = bouton retour à droite en arabe
  return isRTL ? 'flex-end' : 'flex-start'
}

export function arrow(isRTL: boolean): '→' | '←' {
  return isRTL ? '→' : '←'
}

/** Retourne marginStart/marginEnd — logique, respecte I18nManager.isRTL sur native */
export function ms(value: number): { marginStart: number } {
  return { marginStart: value }
}

export function me(value: number): { marginEnd: number } {
  return { marginEnd: value }
}

export function ps(value: number): { paddingStart: number } {
  return { paddingStart: value }
}

export function pe(value: number): { paddingEnd: number } {
  return { paddingEnd: value }
}
