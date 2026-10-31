import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';
import { colors, layout } from '../theme';
import { Txt } from './Txt';

interface ScreenProps {
  children?: React.ReactNode;
  bg?: string;
  /** Contenu défilant (avec gestion du clavier). */
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Barre fixée en bas (boutons). */
  footer?: React.ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, bg = colors.bg, scroll, padded = true, edges, contentStyle, style, footer, footerStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padded && styles.padded, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: bg }, style]} edges={edges ?? ['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }, footerStyle]}>{footer}</View>
        ) : (
          <View style={{ height: insets.bottom }} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Grand titre d'écran (2 lignes) comme sur les maquettes. */
export function ScreenTitle({ children, style, sub }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; sub?: string }) {
  return (
    <View style={[styles.titleWrap, style]}>
      <Txt variant="h1">{children}</Txt>
      {sub ? (
        <Txt variant="small" style={{ marginTop: 6 }}>
          {sub}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: layout.pageMargin, paddingTop: 8, paddingBottom: 24 },
  footer: { paddingHorizontal: layout.pageMargin, paddingTop: 8 },
  titleWrap: { marginTop: 8, marginBottom: 24 },
});
