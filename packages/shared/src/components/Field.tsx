import React from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { Txt } from './Txt';

interface FieldProps extends TextInputProps {
  label: string;
  error?: boolean;
  flex?: number;
  containerStyle?: StyleProp<ViewStyle>;
  right?: React.ReactNode;
}

/** Champ « fiche profil » : petit libellé gris en capitales au-dessus d'une grande valeur. */
export function Field({ label, error, flex, containerStyle, right, editable = true, style, value, placeholder, ...rest }: FieldProps) {
  return (
    <View style={[styles.field, flex ? { flex } : null, containerStyle]}>
      <Txt variant="label" color={error ? colors.red : colors.greyLabel}>
        {label}
      </Txt>
      <View style={styles.valueRow}>
        <TextInput
          editable={editable}
          value={value ?? ''}
          placeholder={placeholder ?? label}
          placeholderTextColor={error ? colors.red : colors.bg}
          style={[styles.input, !editable && styles.readonly, style]}
          {...rest}
        />
        {right}
      </View>
    </View>
  );
}

export function FieldGroup({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.group, style]}>{children}</View>;
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  group: { backgroundColor: colors.white, gap: 2, paddingBottom: 2 },
  row: { flexDirection: 'row', gap: 2 },
  field: { backgroundColor: colors.white, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: colors.bg },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 24, lineHeight: 30, color: colors.black, paddingVertical: 2, paddingHorizontal: 0 },
  readonly: {},
});
