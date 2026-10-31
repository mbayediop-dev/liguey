import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, PageHeader, PetalsHeader, Txt, addMinutes, colors, createMission, keys, useAsyncAction, useAuth, useService } from '@heroes/shared';
import { useRequestDraft } from '@/store/requestDraft';

/** « Outils nécessaire » : rappel du matériel, puis création de la demande et lancement de la recherche. */
export default function Tools() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const draft = useRequestDraft();
  const service = useService(draft.serviceId ?? undefined);
  const sub = service.data?.sub_services.find((s) => s.id === draft.subServiceId);

  const create = useAsyncAction(
    async () => {
      const description = `J’ai besoin d’un héro ${(service.data?.name ?? '').toLowerCase()} pour ${(sub?.name ?? '').toLowerCase()} à ${draft.street}, ${draft.zip} ${draft.city}.`;
      return createMission(session!.user.id, {
        serviceId: draft.serviceId!,
        subServiceId: draft.subServiceId,
        street: draft.street,
        zip: draft.zip,
        city: draft.city,
        startDate: draft.startDate!,
        timeStart: draft.timeStart,
        timeEnd: addMinutes(draft.timeStart, draft.duration),
        recurrence: draft.recurrence,
        description,
      });
    },
    {
      invalidate: [keys.missions],
      onSuccess: (m) => {
        draft.reset();
        router.dismissTo('/');
        router.push(`/missions/${m.id}/search`);
      },
    },
  );

  return (
    <View style={styles.root}>
      <PageHeader title="Recherche" />
      <View style={{ flex: 1 }}>
        <PetalsHeader variant="leaves" height={160} />
        <View style={[styles.card, { paddingBottom: insets.bottom + 12 }]}>
          <Txt size={30} lineHeight={36}>
            Outils nécessaire
          </Txt>
          <Txt size={16} lineHeight={22} style={{ marginTop: 8 }}>
            {service.data?.tools_note ?? 'Voici le matériel que votre héros apportera ou dont il aura besoin sur place.'}
          </Txt>
          <View style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
            {(service.data?.required_tools ?? []).map((t) => (
              <Txt key={t} size={18}>
                • {t}
              </Txt>
            ))}
            {(service.data?.required_tools ?? []).length === 0 ? <Txt color={colors.greyText}>Aucun outil particulier</Txt> : null}
          </View>
          <Button title="Modifier" variant="blue" onPress={() => router.back()} />
          <Button title="Confirmer" onPress={() => create.run()} loading={create.loading} style={{ marginTop: 10 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.red },
  card: { flex: 1, marginTop: -60, marginHorizontal: 12, backgroundColor: colors.white, borderRadius: 24, padding: 18 },
});
