import React, { useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AgendaList,
  EmptyState,
  MainHeader,
  MissionItem,
  Txt,
  UPCOMING_STATUSES,
  chf,
  colors,
  fmtMonthYear,
  hoursLabel,
  toISODate,
  useLiveRequests,
  useMyMissions,
  useProStats,
} from '@heroes/shared';

/** Dashboard pro : résultats du mois, mission en cours, demandes LIVE ; 2e page « Offres acceptées ». */
export default function ProDashboardScreen() {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList<number>>(null);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View style={styles.root}>
      <MainHeader />
      <FlatList
        ref={listRef}
        data={[0, 1]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => String(i)}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => <View style={{ width }}>{item === 0 ? <OverviewPage /> : <AcceptedPage />}</View>}
      />
      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function OverviewPage() {
  const router = useRouter();
  const stats = useProStats();
  const live = useLiveRequests();
  const mine = useMyMissions({ statuses: UPCOMING_STATUSES });
  const today = toISODate(new Date());
  const current =
    (mine.data ?? []).find((m) => m.status === 'in_progress' || m.status === 'start_requested') ??
    (mine.data ?? []).find((m) => m.status === 'confirmed' && m.start_date === today) ??
    (mine.data ?? []).find((m) => m.status === 'confirmed' || m.status === 'pending_validation');
  const refreshing = stats.isRefetching || live.isRefetching;
  const refresh = () => {
    void stats.refetch();
    void live.refetch();
    void mine.refetch();
  };
  return (
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />} showsVerticalScrollIndicator={false}>
      <View style={styles.statsCard}>
        <View style={styles.resultRow}>
          <Txt size={16}>Résultat {fmtMonthYear(new Date()).split(' ')[0]}</Txt>
          <Txt size={34} lineHeight={40}>
            {chf(stats.data?.month_revenue)}
          </Txt>
        </View>
        <View style={styles.kpis}>
          <Kpi label={'CA de\nla journée\nen cours'} value={`${chf(stats.data?.today_revenue, { prefix: false }).replace('.00', '.-')}`} color={colors.blue} />
          <Kpi label={'Nombre de\nJobs effectués\npour ce mois'} value={String(stats.data?.jobs_done_month ?? 0)} color={colors.red} />
          <Kpi label={'Nombre de\nJobs à venir'} value={String(stats.data?.jobs_upcoming ?? 0)} color={colors.blue} />
          <Kpi label={'Nombre\nd’heures\npour ce mois'} value={hoursLabel(stats.data?.hours_month)} color={colors.red} />
        </View>
      </View>

      <Txt size={18} center style={styles.section}>
        Mission en cours
      </Txt>
      {current ? (
        <MissionItem mission={current} perspective="pro" onPress={() => router.push(`/missions/${current.id}`)} />
      ) : (
        <EmptyState text="Aucune mission en cours" />
      )}

      <Txt size={18} center style={styles.section}>
        Demande LIVE
      </Txt>
      <View style={{ gap: 10 }}>
        {(live.data ?? []).length === 0 ? (
          <EmptyState text={live.isLoading ? 'Chargement…' : 'Aucune demande pour vos prestations'} sub="Les nouvelles demandes apparaissent ici en temps réel." />
        ) : (
          live.data!.map((m) => <MissionItem key={m.id} mission={m} perspective="pro" showAvatar={false} onPress={() => router.push(`/offers/${m.id}`)} />)
        )}
      </View>
    </ScrollView>
  );
}

function AcceptedPage() {
  const router = useRouter();
  const mine = useMyMissions();
  return (
    <AgendaList
      missions={(mine.data ?? []).filter((m) => m.status !== 'cancelled')}
      perspective="pro"
      onPress={(m) => router.push(`/missions/${m.id}`)}
      emptyText="Aucune offre acceptée"
      showAvatar={false}
      header={
        <View style={styles.acceptedHead}>
          <Txt size={34} lineHeight={40} weight="medium" center>
            Offres acceptées
          </Txt>
        </View>
      }
    />
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.kpi}>
      <Txt size={12} lineHeight={15} center style={{ minHeight: 48 }}>
        {label}
      </Txt>
      <View style={[styles.circle, { borderColor: color }]}>
        <Txt size={18} color={color} center numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, paddingBottom: 40 },
  statsCard: { backgroundColor: colors.white, borderRadius: 20, padding: 14 },
  resultRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  kpis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  kpi: { flex: 1, alignItems: 'center', gap: 6 },
  circle: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  section: { marginTop: 18, marginBottom: 10 },
  acceptedHead: { paddingVertical: 10, backgroundColor: colors.white, borderRadius: 20, marginBottom: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.grey },
  dotActive: { backgroundColor: colors.black },
});
