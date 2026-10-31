import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  black: 'Poppins_900Black',
} as const;

export const text = StyleSheet.create({
  h1: { fontFamily: fonts.regular, fontSize: 32, lineHeight: 38, color: colors.black },
  h2: { fontFamily: fonts.regular, fontSize: 24, lineHeight: 30, color: colors.black },
  h3: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 24, color: colors.black },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.black },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.black },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.black },
  caption: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14, color: colors.greyText },
  label: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 12, color: colors.greyLabel, textTransform: 'uppercase' },
  button: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.white },
  input: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 22, color: colors.black },
  brand: { fontFamily: fonts.black, letterSpacing: -1, textTransform: 'uppercase' },
  uppercase: { textTransform: 'uppercase' },
  center: { textAlign: 'center' },
});
