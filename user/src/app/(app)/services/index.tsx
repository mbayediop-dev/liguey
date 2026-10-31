import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader, ServiceBanner, colors, useServices } from '@heroes/shared';
import { useRequestDraft } from '@/store/requestDraft';

export default function Services() {
  const router = useRouter();
  const services = useServices();
  const patch = useRequestDraft((s) => s.patch);
  return (
    <View style={styles.root}>
      <PageHeader title="Liste des services" />
      <ScrollView contentContainerStyle={styles.content}>
        {(services.data ?? []).map((s) => (
          <ServiceBanner
            key={s.id}
            slug={s.slug}
            name={s.name}
            onPress={() => {
              patch({ serviceId: s.id, subServiceId: null });
              router.push(`/services/${s.id}`);
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
