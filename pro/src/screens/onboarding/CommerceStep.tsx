import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomBar, DocumentUploader, Screen, ScreenTitle, SelectPill, Txt, colors, updateProfile, useAsyncAction, useAuth, useProDocuments, type CompanyType } from '@heroes/shared';

const TYPES: { value: CompanyType; label: string }[] = [
  { value: 'SA', label: 'SA' },
  { value: 'SARL', label: 'SARL' },
  { value: 'independant', label: 'Indépendant' },
];

/** « Ajoutez votre/vos registres du commerce ». */
export default function CommerceStep() {
  const router = useRouter();
  const { session, profile, setProfile } = useAuth();
  const docs = useProDocuments(session?.user.id);
  const count = (docs.data ?? []).filter((d) => d.kind === 'commerce').length;
  const setType = useAsyncAction(async (t: CompanyType) => setProfile(await updateProfile(session!.user.id, { company_type: t })));
  return (
    <Screen
      bg={colors.white}
      scroll
      footer={
        <>
          {count === 0 ? (
            <Pressable onPress={() => router.push('/identity')} hitSlop={8}>
              <Txt variant="small" center color={colors.greyText} style={{ marginBottom: 8 }}>
                Passer cette étape
              </Txt>
            </Pressable>
          ) : null}
          <BottomBar title="Continuer" onPress={() => router.push('/identity')} disabled={count === 0 || !profile?.company_type} />
        </>
      }
    >
      <ScreenTitle>Ajoutez{'\n'}votre/vos registres{'\n'}du commerce</ScreenTitle>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {TYPES.map((t) => (
          <SelectPill
            key={t.value}
            label={t.label}
            selected={profile?.company_type === t.value}
            onPress={() => setType.run(t.value)}
            style={{ backgroundColor: profile?.company_type === t.value ? colors.red : colors.bg, flex: t.value === 'independant' ? 2 : 1 }}
          />
        ))}
      </View>
      <DocumentUploader kind="commerce" label="Registre du commerce" allowPdf />
      <Txt size={17} lineHeight={24} style={{ marginTop: 24 }}>
        Partagez avec nous votre/vos extraits de registre du commerce…
      </Txt>
    </Screen>
  );
}
