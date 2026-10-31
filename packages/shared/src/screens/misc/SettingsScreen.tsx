import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/PageHeader';
import { Toggle } from '../../components/Toggle';
import { Button } from '../../components/Button';
import { Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { readSettings, biometricsAvailable, authenticate } from '../../hooks/useBiometricLock';
import { updateProfile } from '../../api/profile';
import { CONTACT } from '../../content/help';
import { useAppConfig } from '../../config/AppConfig';
import type { ProfileSettings } from '../../supabase/database.types';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

export function SettingsScreen({ bottomAction }: { bottomAction?: { title: string; onPress: () => void } }) {
  const insets = useSafeAreaInsets();
  const { profile, session, setProfile } = useAuth();
  const { appName } = useAppConfig();
  const settings = readSettings(profile?.settings);
  const [busy, setBusy] = useState<string | null>(null);

  const patch = async (p: Partial<ProfileSettings>) => {
    if (!session) return;
    setBusy(Object.keys(p)[0] ?? null);
    try {
      const updated = await updateProfile(session.user.id, { settings: { ...settings, ...p } });
      setProfile(updated);
    } catch (e) {
      Alert.alert('Oups', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const toggleTouchId = async (v: boolean) => {
    if (v) {
      if (!(await biometricsAvailable())) {
        Alert.alert('Indisponible', "Aucune empreinte ou visage n'est configuré sur cet appareil.");
        return;
      }
      if (!(await authenticate())) return;
    }
    await patch({ touch_id: v });
  };

  const rate = async () => {
    if (await StoreReview.hasAction()) await StoreReview.requestReview();
    else Alert.alert('Merci !', "La notation sera disponible une fois l'app publiée sur les stores.");
  };
  const share = () => Share.share({ message: `Découvre ${appName} : ${CONTACT.website}` });
  const feedback = () => Linking.openURL(`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Avis sur ${appName}`)}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader plain />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Txt variant="h1" style={{ marginBottom: 20 }}>
          Paramètres
        </Txt>
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <View style={styles.rowIcon}>
              <Icon name="add" />
              <Txt size={18}>Pays :</Txt>
            </View>
            <Txt size={18} weight="semibold" style={styles.colValue}>
              Suisse
            </Txt>
          </View>
          <View style={styles.col}>
            <View style={styles.rowIcon}>
              <Icon name="chatbubble" />
              <Txt size={18}>Langue :</Txt>
            </View>
            <Txt size={18} weight="semibold" style={styles.colValue}>
              Français
            </Txt>
          </View>
        </View>

        <SettingRow icon="finger-print" title="Touch ID" description="Je vérifie mon identité grâce à mes empreintes digitales au lieu de mon mot de passe." value={settings.touch_id} onChange={toggleTouchId} disabled={busy === 'touch_id'} />
        <SettingRow icon="notifications" title="Notifications" description="Je veux recevoir les notifications push pour ne rien râter." value={settings.notifications} onChange={(v) => patch({ notifications: v })} disabled={busy === 'notifications'} />
        <SettingRow icon="document" title="Newsletter" description="Je veux être tenu au courant de nouveautés grâce à la newsletter. Je peux me désinscrire à tout moment." value={settings.newsletter} onChange={(v) => patch({ newsletter: v })} disabled={busy === 'newsletter'} />

        <LinkRow icon="star" title="Noter notre app" onPress={rate} />
        <LinkRow icon="share-social" title="Partager notre app" onPress={share} />
        <LinkRow icon="mail" title="Envoyer votre avis" onPress={feedback} />

        {bottomAction ? <Button title={bottomAction.title} onPress={bottomAction.onPress} style={{ marginTop: 28 }} /> : null}
      </ScrollView>
    </View>
  );
}

function Icon({ name }: { name: IonName }) {
  return (
    <View style={styles.icon}>
      <Ionicons name={name} size={26} color={colors.white} />
    </View>
  );
}

function SettingRow({ icon, title, description, value, onChange, disabled }: { icon: IonName; title: string; description: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.setting}>
      <View style={styles.settingTop}>
        <Icon name={icon} />
        <Txt size={20} style={{ flex: 1 }}>
          {title}
        </Txt>
        <Toggle value={value} onValueChange={onChange} disabled={disabled} />
      </View>
      <Txt size={14} lineHeight={20} color={colors.black} style={styles.desc}>
        {description}
      </Txt>
    </View>
  );
}

function LinkRow({ icon, title, onPress }: { icon: IonName; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.link}>
      <Icon name={icon} />
      <Txt size={20}>{title}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, paddingTop: 4 },
  twoCols: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  col: { flex: 1 },
  rowIcon: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colValue: { marginLeft: 50, marginTop: 4 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  setting: { marginBottom: 14 },
  settingTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  desc: { marginLeft: 52, marginTop: 4 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
});
