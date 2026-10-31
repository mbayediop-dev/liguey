import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from './AppHeader';
import { SideMenu } from './SideMenu';
import { useAuth } from '../hooks/useAuth';
import { useUnreadCounts } from '../hooks/queries';
import { useIsPro } from '../config/AppConfig';

/** En-tête HEROES + menu latéral, utilisé sur le dashboard des deux apps. */
export function MainHeader() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const unread = useUnreadCounts();
  const isPro = useIsPro();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppHeader onMenu={() => setOpen(true)} badge={unread.data?.notifications ?? 0} onBadge={() => router.push('/notifications')} />
      <SideMenu
        visible={open}
        onClose={() => setOpen(false)}
        profile={profile}
        onProfile={() => router.push('/profile')}
        items={[
          { label: "Page d'accueil", onPress: () => router.navigate('/') },
          { label: isPro ? 'Mes missions' : 'Mes demandes', onPress: () => router.push('/missions') },
          { label: 'Agenda', onPress: () => router.push('/agenda') },
          { label: 'Chat', onPress: () => router.push('/chat'), badge: unread.data?.messages ?? 0 },
          {
            label: 'Déconnexion',
            onPress: () =>
              Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Se déconnecter', style: 'destructive', onPress: () => void signOut() },
              ]),
          },
        ]}
        footer={[
          { label: 'Paramètres', icon: 'settings-sharp', onPress: () => router.push('/settings') },
          { label: 'Contact', icon: 'chatbubble-ellipses', onPress: () => router.push('/contact') },
          { label: 'Informations légales', icon: 'information', onPress: () => router.push('/legal') },
          { label: 'Visitez heroes.swiss', icon: 'globe-outline', onPress: () => router.push('/website') },
          { label: 'Aide', icon: 'help', onPress: () => router.push('/help') },
        ]}
      />
    </>
  );
}
