import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/PageHeader';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Brand, Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { FAQ } from '../../content/help';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { createSupportRequest } from '../../api/profile';

/** « Comment pouvons-nous vous aider ? » : réponses proposées + formulaire. */
export function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [open, setOpen] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const send = useAsyncAction(() => createSupportRequest(session!.user.id, message.trim()), {
    onSuccess: () => {
      setMessage('');
      Alert.alert('Requête envoyée', 'Notre équipe vous répondra par e-mail dans les plus brefs délais.');
    },
  });
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader plain />
      <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 16 }]} keyboardShouldPersistTaps="handled">
        <Txt variant="h1" style={{ marginBottom: 18 }}>
          Comment{'\n'}pouvons-nous{'\n'}vous aider?
        </Txt>
        <Txt size={18} weight="semibold" style={{ marginBottom: 10 }}>
          Réponses proposées :
        </Txt>
        {FAQ.map((f, i) => (
          <View key={f.title} style={{ marginBottom: 8 }}>
            <Pressable onPress={() => setOpen(open === i ? null : i)} hitSlop={4}>
              <Txt size={19} lineHeight={26} color={colors.blue} style={styles.link}>
                {f.title.includes('HEROES') ? (
                  <>
                    {f.title.replace('HEROES', '')}
                    <Brand color={colors.blue} />
                  </>
                ) : (
                  f.title
                )}
              </Txt>
            </Pressable>
            {open === i ? (
              <Txt size={15} lineHeight={22} color={colors.greyDark} style={{ marginTop: 4, marginBottom: 6 }}>
                {f.body}
              </Txt>
            ) : null}
          </View>
        ))}
        <TextField placeholder="Aidez-moi…" value={message} onChangeText={setMessage} multiline containerStyle={{ marginTop: 24, minHeight: 64 }} />
        <View style={styles.rule} />
        <Button title="Charger la requête" onPress={() => send.run()} disabled={message.trim().length < 5} loading={send.loading} style={styles.cta} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 12, paddingTop: 4 },
  link: { textDecorationLine: 'underline' },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.grey, marginTop: 18 },
  cta: { marginTop: 12, marginHorizontal: 24 },
});
