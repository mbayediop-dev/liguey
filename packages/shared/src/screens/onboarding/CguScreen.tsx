import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomBar } from '../../components/BottomBar';
import { CheckCircleBox } from '../../components/CheckBox';
import { Txt } from '../../components/Txt';
import { RichText } from '../../lib/markdown';
import { colors } from '../../theme';
import { useLegalPage } from '../../hooks/queries';
import { LEGAL_FALLBACK } from '../../content/legal';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { acceptCgu } from '../../api/profile';

/** Dernière étape : lecture et acceptation des CGU. */
export function CguScreen({ next, buttonTitle = 'Accepter et valider' }: { next: string; buttonTitle?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const page = useLegalPage('cgu');
  const { session } = useAuth();
  const [checked, setChecked] = useState(false);
  const [warn, setWarn] = useState(false);
  const content = page.data ?? LEGAL_FALLBACK.cgu;

  const accept = useAsyncAction(() => acceptCgu(session!.user.id), { onSuccess: () => router.replace(next) });

  const submit = () => {
    if (!checked) {
      setWarn(true);
      setTimeout(() => setWarn(false), 2500);
      return;
    }
    void accept.run();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Txt variant="h1" style={{ marginBottom: 16 }}>
          {content.title}
        </Txt>
        <RichText body={content.body} />
        <View style={styles.confirm}>
          <Txt size={18} style={{ flex: 1 }}>
            Je confirme avoir lu les CGU
          </Txt>
          <CheckCircleBox checked={checked} onToggle={() => setChecked((v) => !v)} size={56} />
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <BottomBar title={buttonTitle} onPress={submit} disabled={!checked && !warn} loading={accept.loading} />
      </View>
      {warn ? (
        <View style={styles.warnWrap} pointerEvents="none">
          <View style={styles.warn}>
            <Txt size={22} lineHeight={30} color={colors.white} center>
              <Txt size={22} lineHeight={30} color={colors.white} weight="bold">
                ATTENTION,
              </Txt>
              {'\n'}si vous n’acceptez pas les CGU, vous ne pourrez plus utiliser cette application.
            </Txt>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.grey, paddingBottom: 16 },
  footer: { paddingHorizontal: 12, paddingTop: 8 },
  warnWrap: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,245,245,0.6)' },
  warn: { width: 260, height: 260, borderRadius: 130, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
