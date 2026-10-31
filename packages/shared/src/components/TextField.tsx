import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';

export interface TextFieldProps extends TextInputProps {
  /** Fond : 'white' (sur page grise) ou 'grey' (sur page blanche). */
  tone?: 'white' | 'grey';
  error?: boolean;
  centered?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  right?: React.ReactNode;
  height?: number;
}

/** Champ « pilule » des maquettes. En erreur, le placeholder passe en rouge. */
export const TextField = forwardRef<React.ComponentRef<typeof TextInput>, TextFieldProps>(function TextField(
  { tone = 'white', error, centered, containerStyle, right, height = 56, style, multiline, ...rest },
  ref,
) {
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: tone === 'white' ? colors.white : colors.field, minHeight: height, borderRadius: multiline ? 20 : height / 2 },
        containerStyle,
      ]}
    >
      <TextInput
        ref={ref}
        placeholderTextColor={error ? colors.red : colors.greyText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...rest}
        style={[styles.input, { height }, centered && { textAlign: 'center' }, multiline && { paddingVertical: 14, height: undefined }, style]}
      />
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 17, color: colors.black, paddingVertical: 0 },
  right: { marginLeft: 8 },
});
