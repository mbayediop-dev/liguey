import React from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Txt } from '../../components/Txt';
import { RichText } from '../../lib/markdown';
import { colors } from '../../theme';
import { images } from '../../assets';
import { useLegalPage } from '../../hooks/queries';
import { LEGAL_FALLBACK } from '../../content/legal';
import { CONTACT } from '../../content/help';

/** « Informations légales » : trois entrées en bas de page. */
export function LegalIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader plain />
      <View style={[styles.page, { paddingBottom: insets.bottom + 24 }]}>
        <Txt variant="h1">Informations{'\n'}légales</Txt>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.item} onPress={() => router.push('/legal/about')}>
          <View style={styles.icon}>
            <Image source={images.flagRed} style={{ width: 26, height: 18, tintColor: colors.white }} resizeMode="contain" />
          </View>
          <Txt size={20}>Qui sommes-nous ?</Txt>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/legal/cgu')}>
          <View style={styles.icon}>
            <Ionicons name="logo-usd" size={26} color={colors.white} />
          </View>
          <Txt size={20}>Conditions générales d’utilisation</Txt>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/legal/privacy')}>
          <View style={styles.icon}>
            <Ionicons name="ban" size={26} color={colors.white} />
          </View>
          <Txt size={20}>Suivi des données</Txt>
        </Pressable>
      </View>
    </View>
  );
}

export function LegalPageScreen({ slug }: { slug: string }) {
  const insets = useSafeAreaInsets();
  const page = useLegalPage(slug);
  const content = page.data ?? LEGAL_FALLBACK[slug] ?? { title: slug, body: '' };
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader plain />
      <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 24 }]}>
        <Txt variant="h1" style={{ marginBottom: 16 }}>
          {content.title}
        </Txt>
        <RichText body={content.body} />
      </ScrollView>
    </View>
  );
}

/** « heroes.swiss » : texte + accès au site. */
export function WebsiteScreen() {
  const insets = useSafeAreaInsets();
  const page = useLegalPage('website');
  const content = page.data ?? LEGAL_FALLBACK.website;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader plain />
      <View style={[styles.page, { paddingBottom: insets.bottom + 16 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Txt variant="h1" style={{ marginBottom: 16 }}>
            heroes.swiss
          </Txt>
          <RichText body={content.body} />
        </ScrollView>
        <View style={styles.rule} />
        <Button title="Accéder au site" onPress={() => Linking.openURL(CONTACT.website)} style={styles.cta} />
      </View>
    </View>
  );
}

export function ContactScreen() {
  const insets = useSafeAreaInsets();
  const mail = () => Linking.openURL(`mailto:${CONTACT.email}`);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader plain />
      <View style={[styles.page, { paddingBottom: insets.bottom + 16 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Txt variant="h1" style={{ marginBottom: 12 }}>
            contact
          </Txt>
          <Txt size={19} lineHeight={26} weight="semibold">
            Hotline : {CONTACT.hotline} {CONTACT.hotlineNote}
          </Txt>
          <Txt size={19} lineHeight={26}>
            {CONTACT.hours}
          </Txt>
          <Txt size={19} lineHeight={26} weight="semibold" style={{ marginTop: 28 }}>
            heroes.swiss est édité et exploité par :
          </Txt>
          <Txt size={19} lineHeight={26} weight="black">
            {CONTACT.company}
          </Txt>
          {CONTACT.address.map((l) => (
            <Txt key={l} size={19} lineHeight={26}>
              {l}
            </Txt>
          ))}
          <Txt size={19} lineHeight={26}>
            Téléphone : {CONTACT.phone}
          </Txt>
          <Txt size={19} lineHeight={26}>
            Téléfaxe : {CONTACT.fax}
          </Txt>
          <Txt size={19} lineHeight={26}>
            E-Mail : {CONTACT.email}
          </Txt>
          <Txt size={19} lineHeight={26} style={{ marginTop: 28 }}>
            <Txt size={19} weight="semibold">
              Représentants légaux :{' '}
            </Txt>
            {CONTACT.legalRep}
          </Txt>
          <Txt size={19} lineHeight={26} style={{ marginTop: 28 }}>
            {CONTACT.register}
          </Txt>
          <Txt size={19} lineHeight={26}>
            UID : {CONTACT.uid}
          </Txt>
          <Txt size={19} lineHeight={26}>
            N° d’identification fiscal: {CONTACT.taxId}
          </Txt>
        </ScrollView>
        <Button title="Nous contacter" onPress={mail} style={styles.cta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 12, paddingTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.grey, marginTop: 12 },
  cta: { marginTop: 12, marginHorizontal: 24 },
});
