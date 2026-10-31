import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { BottomBar } from '../../components/BottomBar';
import { StepDots } from '../../components/StepDots';
import { PlusRect } from '../../components/PlusCircle';
import { CardPreview } from '../../components/CardPreview';
import { Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { usePaymentMethods } from '../../hooks/queries';

/** Étape « Ajouter une carte de crédit » de l'inscription client. */
export function CardStepScreen({ next, addRoute, dot = 1, dots = 3 }: { next: string; addRoute: string; dot?: number; dots?: number }) {
  const router = useRouter();
  const cards = usePaymentMethods();
  const list = cards.data ?? [];
  const has = list.length > 0;
  return (
    <Screen
      scroll
      footer={
        <>
          {!has ? (
            <Pressable onPress={() => router.push(next)} hitSlop={8}>
              <Txt variant="small" center color={colors.greyText} style={{ marginBottom: 4 }}>
                Ajouter plus tard
              </Txt>
            </Pressable>
          ) : null}
          <StepDots count={dots} current={dot} />
          <BottomBar title="Suivant" onPress={() => router.push(next)} disabled={!has} />
        </>
      }
    >
      <ScreenTitle>{has ? 'Vous avez ajouté\nune carte de crédit' : 'Ajouter\nune carte de crédit'}</ScreenTitle>
      <View style={{ gap: 10 }}>
        {list.map((c) => (
          <CardPreview key={c.id} brand={c.brand} last4={c.last4} holder={c.holder_name} />
        ))}
        <PlusRect onPress={() => router.push(addRoute)} height={has ? 200 : 300} />
        {!has ? (
          <Txt size={15} center>
            cliquez sur l’image pour ajouter une carte
          </Txt>
        ) : null}
      </View>
    </Screen>
  );
}
