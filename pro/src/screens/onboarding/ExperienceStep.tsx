import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomBar, DocumentUploader, Screen, ScreenTitle, Txt, colors, useAuth, useProDocuments } from '@heroes/shared';

/** « Nous en dire plus sur votre expérience » : CV, certificats, attestations… */
export default function ExperienceStep() {
  const router = useRouter();
  const { session } = useAuth();
  const docs = useProDocuments(session?.user.id);
  const count = (docs.data ?? []).filter((d) => d.kind === 'experience').length;
  return (
    <Screen
      bg={colors.white}
      scroll
      footer={
        <>
          {count === 0 ? (
            <Pressable onPress={() => router.push('/commerce')} hitSlop={8}>
              <Txt variant="small" center color={colors.greyText} style={{ marginBottom: 8 }}>
                Passer cette étape
              </Txt>
            </Pressable>
          ) : null}
          <BottomBar title="Continuer" onPress={() => router.push('/commerce')} disabled={count === 0} />
        </>
      }
    >
      <ScreenTitle>Nous en dire{'\n'}plus sur votre{'\n'}expérience</ScreenTitle>
      <View style={{ marginTop: 10 }}>
        <DocumentUploader kind="experience" label="Expérience" allowPdf />
      </View>
      <Txt size={17} lineHeight={24} style={{ marginTop: 24 }}>
        {count ? 'Vous avez ajouté un fichier. Ajoutez en un autre ou continer votre inscription.' : 'Partagez avec nous votre/vos certificats, CV, attestations, recommandations, etc…'}
      </Txt>
    </Screen>
  );
}
