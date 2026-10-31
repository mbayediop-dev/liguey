import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomBar, Screen, ScreenTitle, SelectPill, Txt, keys, setProServices, useAsyncAction, useAuth, useProServices, useServices } from '@heroes/shared';

/** « Choisissez votre/vos prestation(s) ». */
export default function ServicesStep() {
  const router = useRouter();
  const { session } = useAuth();
  const services = useServices();
  const mine = useProServices(session?.user.id);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    if (mine.data) setSelected(mine.data);
  }, [mine.data]);

  const save = useAsyncAction(() => setProServices(session!.user.id, selected), {
    invalidate: [keys.proServices(session?.user.id ?? '')],
    onSuccess: () => router.push('/experience'),
  });

  return (
    <Screen scroll footer={<BottomBar title="Continuer" onPress={() => save.run()} disabled={selected.length === 0} loading={save.loading} />}>
      <ScreenTitle>Choisissez{'\n'}votre/vos{'\n'}prestation(s)</ScreenTitle>
      <View style={styles.grid}>
        {(services.data ?? []).map((s) => {
          const sel = selected.includes(s.id);
          return (
            <SelectPill
              key={s.id}
              label={s.name}
              selected={sel}
              onPress={() => setSelected((cur) => (sel ? cur.filter((x) => x !== s.id) : [...cur, s.id]))}
              style={[styles.pill, s.name.length > 12 && styles.wide]}
            />
          );
        })}
      </View>
      <Txt size={17} lineHeight={24} style={{ marginTop: 40 }}>
        {selected.length
          ? 'En continuant, vous validez donc pouvoir réaliser ces prestations avec professionnalisme, qualité et expérience.'
          : 'Choisissez ci-dessus des prestations que vous savez réaliser avec professionnalisme, qualitée et expérience.'}
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { flexGrow: 1, minWidth: '45%' },
  wide: { minWidth: '60%' },
});
