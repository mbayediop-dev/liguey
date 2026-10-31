import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ACTIVE_STATUSES, DashboardHero, EmptyState, MainHeader, MissionItem, Txt, colors, useMyMissions } from '@heroes/shared';
import { useRequestDraft } from '@/store/requestDraft';

/** Page d'accueil client : visuel « J'ai besoin d'un service ! » + « Mes demandes à venir ». */
export default function DashboardScreen() {
  const router = useRouter();
  const missions = useMyMissions({ statuses: ACTIVE_STATUSES });
  const reset = useRequestDraft((s) => s.reset);

  const start = () => {
    reset();
    router.push('/services');
  };

  return (
    <View style={styles.root}>
      <MainHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={missions.isRefetching} onRefresh={() => { void missions.refetch(); }} />}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHero onPress={start} />
        <View style={styles.titleWrap}>
          <Txt size={22} weight="semibold" center>
            Mes demandes à venir
          </Txt>
        </View>
        <View style={styles.list}>
          {(missions.data ?? []).length === 0 ? (
            <EmptyState text={missions.isLoading ? 'Chargement…' : 'Aucune demande en cours'} sub="Appuyez sur le rond bleu pour trouver votre héros." />
          ) : (
            missions.data!.map((m) => (
              <MissionItem
                key={m.id}
                mission={m}
                perspective="client"
                onPress={() => router.push(m.status === 'searching' || m.status === 'posted' ? `/missions/${m.id}/search` : `/missions/${m.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  titleWrap: { marginTop: -28, paddingVertical: 6, alignItems: 'center' },
  list: { paddingHorizontal: 12, gap: 10, paddingTop: 6 },
});
