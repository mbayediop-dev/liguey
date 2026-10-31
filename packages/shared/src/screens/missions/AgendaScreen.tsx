import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '../../components/PageHeader';
import { AgendaList } from '../../components/AgendaList';
import { colors } from '../../theme';
import { useMyMissions } from '../../hooks/queries';
import { useAppConfig } from '../../config/AppConfig';

export function AgendaScreen({ title = 'Agenda' }: { title?: string }) {
  const router = useRouter();
  const { role } = useAppConfig();
  const missions = useMyMissions();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader title={title} />
      <AgendaList
        missions={missions.data ?? []}
        perspective={role}
        onPress={(m) => router.push(`/missions/${m.id}`)}
        emptyText={missions.isLoading ? 'Chargement…' : 'Aucune mission agendée'}
      />
    </View>
  );
}
