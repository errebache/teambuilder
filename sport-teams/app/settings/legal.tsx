import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { alignSelf, arrow, textAlign } from '../../lib/rtl'

const CONTENU = {
  privacy: {
    titre: 'Politique de confidentialité',
    icone: '🔒',
    sections: [
      {
        titre: 'Données collectées',
        texte: 'Squadra collecte uniquement les données nécessaires au fonctionnement de l\'application : les groupes, joueurs, notes et historiques de matchs que tu crées toi-même. Aucune donnée personnelle sensible (email, numéro de téléphone, etc.) n\'est requise.',
      },
      {
        titre: 'Authentification anonyme',
        texte: 'L\'application utilise un identifiant anonyme généré automatiquement pour associer tes données. Aucun compte nominatif n\'est créé sans ton accord.',
      },
      {
        titre: 'Stockage des données',
        texte: 'Tes données sont stockées de manière sécurisée via Supabase, hébergé sur des serveurs conformes aux normes RGPD. Les données sont chiffrées en transit et au repos.',
      },
      {
        titre: 'Partage des données',
        texte: 'Tes données ne sont jamais vendues ni partagées avec des tiers à des fins commerciales. Elles peuvent être partagées avec d\'autres membres de ton groupe uniquement dans le cadre du fonctionnement de l\'application.',
      },
      {
        titre: 'Suppression des données',
        texte: 'Tu peux supprimer toutes tes données à tout moment via Paramètres → Réinitialiser l\'application. Les données sont supprimées de manière permanente.',
      },
      {
        titre: 'Contact',
        texte: 'Pour toute question relative à tes données personnelles, contacte-nous via les paramètres de l\'application.',
      },
    ],
  },
  terms: {
    titre: 'Conditions d\'utilisation',
    icone: '📄',
    sections: [
      {
        titre: 'Acceptation des conditions',
        texte: 'En utilisant Squadra, tu acceptes les présentes conditions d\'utilisation. Si tu n\'acceptes pas ces conditions, tu ne dois pas utiliser l\'application.',
      },
      {
        titre: 'Utilisation autorisée',
        texte: 'Squadra est destinée à une utilisation personnelle et non commerciale pour organiser des activités sportives entre amis, collègues ou membres d\'une association.',
      },
      {
        titre: 'Contenu utilisateur',
        texte: 'Tu es responsable du contenu que tu ajoutes dans l\'application (noms, commentaires, notes). Tu t\'engages à ne pas soumettre de contenu offensant, diffamatoire ou illégal.',
      },
      {
        titre: 'Propriété intellectuelle',
        texte: 'L\'application, son design et son code source sont la propriété de leurs développeurs. Toute reproduction ou distribution non autorisée est interdite.',
      },
      {
        titre: 'Limitation de responsabilité',
        texte: 'Squadra est fournie "telle quelle". Nous ne garantissons pas la disponibilité permanente du service et déclinons toute responsabilité en cas de perte de données.',
      },
      {
        titre: 'Modifications',
        texte: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les changements significatifs te seront notifiés dans l\'application.',
      },
    ],
  },
}

export default function Legal() {
  const router = useRouter()
  const { page } = useLocalSearchParams<{ page: 'privacy' | 'terms' }>()
  const { t, isRTL } = useLanguage()
  const { colors } = useTheme()

  const contenu = CONTENU[page as keyof typeof CONTENU] || CONTENU.privacy

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 44, paddingHorizontal: 20,
        paddingBottom: 28, borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22, alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: alignSelf(isRTL), marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 36, marginBottom: 10 }}>{contenu.icone}</Text>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500', textAlign: 'center' }}>
          {contenu.titre}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
          {t('lastUpdated')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {contenu.sections.map((section, i) => (
          <View
            key={i}
            style={{
              backgroundColor: colors.card, borderRadius: 14,
              padding: 16, marginBottom: 10,
              borderWidth: 0.5, borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textAlign: textAlign(isRTL) }}>
              {section.titre}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, textAlign: textAlign(isRTL) }}>
              {section.texte}
            </Text>
          </View>
        ))}

        <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
          {t('allRightsReserved')}
        </Text>
      </ScrollView>
    </View>
  )
}
