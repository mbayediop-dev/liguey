import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Screen, ScreenTitle } from '../../components/Screen';
import { BigCircle, CheckMark } from '../../components/PlusCircle';
import { colors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

/** Écran de confirmation (« Mission validée ! », « Votre mission a été agendée ! »…). */
export function DoneScreen({ title = 'Mission validée !', delay = 1600, onDone }: { title?: string; delay?: number; onDone?: () => void }) {
  const { refreshProfile } = useAuth();
  useEffect(() => {
    const t = setTimeout(() => {
      if (onDone) onDone();
      else void refreshProfile();
    }, delay);
    return () => clearTimeout(t);
  }, [delay, onDone, refreshProfile]);
  return (
    <Screen bg={colors.bg} edges={['top', 'bottom', 'left', 'right']}>
      <ScreenTitle>{title}</ScreenTitle>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
        <BigCircle size={260}>
          <CheckMark size={150} />
        </BigCircle>
      </View>
    </Screen>
  );
}
