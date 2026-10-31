import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, type ButtonVariant } from './Button';
import { BackButton } from './CircleButton';

interface Props {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  /** Affiche le bouton retour bleu (par défaut : oui). */
  back?: boolean;
  onBack?: () => void;
  /** Deuxième bouton au-dessus (ex. « Passer »). */
  secondary?: { title: string; onPress: () => void; variant?: ButtonVariant };
}

/** Barre d'action du bas : rond bleu « retour » + bouton principal, comme sur toutes les maquettes. */
export function BottomBar({ title, onPress, disabled, loading, variant = 'primary', back = true, onBack, secondary }: Props) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      {secondary ? <Button title={secondary.title} variant={secondary.variant ?? 'blue'} onPress={secondary.onPress} style={styles.secondary} /> : null}
      <View style={styles.row}>
        {back ? <BackButton onPress={onBack ?? (() => (router.canGoBack() ? router.back() : undefined))} /> : null}
        <Button title={title} onPress={onPress} disabled={disabled} loading={loading} variant={variant} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  secondary: {},
});
