import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function demanderPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function planifierRappelMatch(
  nomGroupe: string,
  dateMatch: Date,
  title: string,
  body: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null

  const ok = await demanderPermissions()
  if (!ok) return null

  // Rappel le jour du match à 9h00
  const rappel = new Date(dateMatch)
  rappel.setHours(9, 0, 0, 0)

  // Si l'heure est déjà passée, on envoie dans 5 secondes (pour test)
  const maintenant = new Date()
  const trigger = rappel > maintenant ? rappel : new Date(maintenant.getTime() + 5000)

  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  })

  return id
}

export async function annulerToutesNotifications(): Promise<void> {
  if (Platform.OS === 'web') return
  await Notifications.cancelAllScheduledNotificationsAsync()
}
