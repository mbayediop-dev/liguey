import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import type { MissionFull } from '../types/models';
import { MissionItem } from './MissionRow';
import { Txt } from './Txt';
import { fmtMonthYear, toISODate } from '../lib/format';
import { EmptyState } from './EmptyState';

interface Props {
  missions: MissionFull[];
  perspective: 'client' | 'pro';
  onPress: (m: MissionFull) => void;
  emptyText?: string;
  header?: React.ReactElement;
  showAvatar?: boolean;
}

/** Liste groupée par mois : missions à venir en cartes blanches, passées grisées en bas (cf. maquette Agenda). */
export function AgendaList({ missions, perspective, onPress, emptyText = 'Aucune mission', header, showAvatar = true }: Props) {
  const sections = useMemo(() => {
    const today = toISODate(new Date());
    const upcoming = missions.filter((m) => m.start_date >= today && m.status !== 'cancelled' && m.status !== 'completed');
    const past = missions.filter((m) => !upcoming.includes(m));
    const group = (list: MissionFull[], past: boolean) => {
      const map = new Map<string, MissionFull[]>();
      for (const m of list) {
        const k = m.start_date.slice(0, 7);
        map.set(k, [...(map.get(k) ?? []), m]);
      }
      return [...map.entries()]
        .sort((a, b) => (past ? b[0].localeCompare(a[0]) : b[0].localeCompare(a[0])))
        .map(([k, data]) => ({ title: fmtMonthYear(`${k}-01`), data, past }));
    };
    return [...group(upcoming, false), ...group(past, true)];
  }, [missions]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(m) => m.id}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState text={emptyText} />}
      contentContainerStyle={styles.content}
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, section.past && styles.pastHeader]}>
          <Txt size={16} color={section.past ? colors.greyText : colors.black} center>
            {section.title}
          </Txt>
        </View>
      )}
      renderItem={({ item, section }) => (
        <View style={styles.item}>
          <MissionItem mission={item} perspective={perspective} onPress={() => onPress(item)} past={section.past} showAvatar={showAvatar} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, paddingBottom: 32, paddingTop: 8 },
  sectionHeader: { paddingVertical: 10 },
  pastHeader: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.grey, marginTop: 12 },
  item: { marginBottom: 10 },
});
