import React from 'react';
import { useRouter } from 'expo-router';
import { SettingsScreen } from '@heroes/shared';

export default function Settings() {
  const router = useRouter();
  return <SettingsScreen bottomAction={{ title: 'Changer de carte de paiement', onPress: () => router.push('/payment') }} />;
}
