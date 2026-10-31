import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '../../components/PageHeader';
import { AgendaList } from '../../components/AgendaList';
import { colors } from '../../theme';
import { useMyMissions } from '../../hooks/queries';
import { useAppConfig } from '../../config/AppConfig';

/** « Mes demandes » (client) / « Mes missions » (pro) : toutes les missions, à venir puis passées. */
export function MissionsListScreen() {
  const router = useRouter();
  const { role } = useAppConfig();
  const missions = useMyMissions();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader title={role === 'pro' ? 'Mes missions' : 'Mes demandes'} />
      <AgendaList
        missions={missions.data ?? []}
        perspective={role}
        onPress={(m) => router.push(`/missions/${m.id}`)}
        emptyText={missions.isLoading ? 'Chargement…' : role === 'pro' ? 'Aucune mission pour le moment' : 'Aucune demande pour le moment'}
      />
    </View>
  );
}
