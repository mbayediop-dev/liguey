import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader, SubServicePill, colors, useService } from '@heroes/shared';
import { useRequestDraft } from '@/store/requestDraft';

export default function SubServices() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = useService(id);
  const patch = useRequestDraft((s) => s.patch);
  return (
    <View style={styles.root}>
      <PageHeader title={service.data?.name ?? ''} />
      <ScrollView contentContainerStyle={styles.content}>
        {(service.data?.sub_services ?? []).map((ss) => (
          <SubServicePill
            key={ss.id}
            label={ss.name}
            onPress={() => {
              patch({ serviceId: id, subServiceId: ss.id });
              router.push('/request/new');
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 12, paddingBottom: 32 },
});
