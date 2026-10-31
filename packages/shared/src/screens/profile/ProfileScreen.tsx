import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/PageHeader';
import { Avatar } from '../../components/Avatar';
import { Stars } from '../../components/Stars';
import { Txt } from '../../components/Txt';
import { IconCircle } from '../../components/IconCircle';
import { Field, FieldGroup, FieldRow } from '../../components/Field';
import { ReviewCard } from '../../components/ReviewCard';
import { OptionSheet } from '../../components/OptionSheet';
import { SelectPill } from '../../components/Pill';
import { DocumentUploader } from '../../components/DocumentUploader';
import { colors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useProDocuments, useProServices, useProfile, useReviews, useServices } from '../../hooks/queries';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { keys } from '../../hooks/queryClient';
import { setProServices, updateEmail, updatePassword, updateProfile, uploadAvatar } from '../../api/profile';
import { chooseFileSource } from '../../hooks/usePicker';
import { fullName } from '../../lib/format';
import { isEmail, nonEmpty } from '../../lib/validation';
import type { DocumentKind } from '../../supabase/database.types';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const DOC_CHIPS: { kind: DocumentKind; label: string; allowPdf: boolean }[] = [
  { kind: 'id_card', label: "Pièce d'identité", allowPdf: false },
  { kind: 'commerce', label: 'Registre du commerce', allowPdf: true },
  { kind: 'experience', label: 'CV', allowPdf: true },
];

/** Fiche profil : la mienne (éditable, documents pour un pro) ou celle d'un autre utilisateur (lecture). */
export function ProfileScreen({ userId }: { userId?: string }) {
  const insets = useSafeAreaInsets();
  const { session, profile: me, setProfile } = useAuth();
  const myId = session!.user.id;
  const target = userId ?? myId;
  const own = target === myId;
  const remote = useProfile(target);
  const profile = own ? (me ?? remote.data ?? null) : (remote.data ?? null);
  const reviews = useReviews(target);
  const services = useServices();
  const proServices = useProServices(profile?.role === 'pro' ? target : undefined);
  const docs = useProDocuments(own && profile?.role === 'pro' ? myId : undefined);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', day: '', month: '', year: '', street: '', zip: '', city: '', country: '', email: '', password: '' });
  const [touched, setTouched] = useState(false);
  const [servicesSheet, setServicesSheet] = useState(false);
  const [docSheet, setDocSheet] = useState<DocumentKind | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) return;
    const [y, m, d] = (profile.birth_date ?? '').split('-');
    setForm({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      day: d ?? '',
      month: m ? String(Number(m)) : '',
      year: y ?? '',
      street: profile.street ?? '',
      zip: profile.zip ?? '',
      city: profile.city ?? '',
      country: profile.country ?? 'Suisse',
      email: profile.email ?? session?.user.email ?? '',
      password: '',
    });
  }, [profile, session?.user.email, editing]);

  useEffect(() => {
    if (proServices.data) setSelectedServices(proServices.data);
  }, [proServices.data]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const requiredOk = [form.first_name, form.last_name, form.street, form.zip, form.city].every(nonEmpty) && isEmail(form.email);

  const save = useAsyncAction(
    async () => {
      const birth =
        form.day && form.month && form.year
          ? `${form.year.padStart(4, '0')}-${form.month.padStart(2, '0')}-${form.day.padStart(2, '0')}`
          : null;
      const p = await updateProfile(myId, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        birth_date: birth,
        street: form.street.trim(),
        zip: form.zip.trim(),
        city: form.city.trim(),
        country: form.country.trim() || 'Suisse',
        email: form.email.trim().toLowerCase(),
      });
      if (form.email.trim().toLowerCase() !== (session?.user.email ?? '').toLowerCase()) await updateEmail(form.email);
      if (form.password) await updatePassword(form.password);
      setProfile(p);
    },
    { invalidate: [keys.profile(myId)], onSuccess: () => setEditing(false) },
  );

  const changePhoto = useAsyncAction(
    async () => {
      const f = await chooseFileSource({ square: true });
      if (!f) return;
      const p = await uploadAvatar(myId, f.uri, f.mime);
      setProfile(p);
    },
    { invalidate: [keys.profile(myId)] },
  );

  const saveServices = useAsyncAction(() => setProServices(myId, selectedServices), {
    invalidate: [keys.proServices(myId)],
    onSuccess: () => setServicesSheet(false),
  });

  const myServiceNames = useMemo(
    () => (services.data ?? []).filter((s) => (proServices.data ?? []).includes(s.id)).map((s) => s.name),
    [services.data, proServices.data],
  );

  const submit = () => {
    setTouched(true);
    if (!requiredOk) return;
    void save.run();
  };

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <PageHeader title="Profile" />
        <Txt center color={colors.greyText} style={{ marginTop: 40 }}>
          {remote.isLoading ? 'Chargement…' : 'Profil introuvable'}
        </Txt>
      </View>
    );
  }

  const isPro = profile.role === 'pro';
  const birthLabel = profile.birth_date ? profile.birth_date.split('-') : null;
  const docsFor = (k: DocumentKind) => (docs.data ?? []).filter((d) => d.kind === k).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader title="Profile" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={styles.headerWhite}>
          <View style={styles.headRow}>
            <Pressable disabled={!own} onPress={() => changePhoto.run()}>
              <Avatar path={profile.avatar_url} profile={profile} size={110} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Txt size={26} lineHeight={30} weight="medium">
                {profile.first_name}
                {'\n'}
                {profile.last_name}
              </Txt>
            </View>
            {isPro ? (
              <View style={{ alignItems: 'flex-end', maxWidth: 140 }}>
                {myServiceNames.slice(0, 3).map((n) => (
                  <Txt key={n} size={20} lineHeight={24} color={colors.red} numberOfLines={1}>
                    {n}
                  </Txt>
                ))}
              </View>
            ) : null}
            {own && isPro ? <IconCircle name="add" size={48} onPress={() => setServicesSheet(true)} /> : null}
          </View>
        </View>
        <View style={styles.headerGrey}>
          <View style={styles.ratingRow}>
            <Stars rating={Number(profile.rating_avg)} size={22} />
            <View style={{ flex: 1 }} />
            <Txt size={15} color={colors.red}>
              {Number(profile.rating_avg).toFixed(2)}/5
            </Txt>
          </View>
          {own ? (
            <View style={styles.editRow}>
              {editing ? (
                <>
                  <IconCircle name="close" tone="blue" size={56} onPress={() => setEditing(false)} />
                  <IconCircle name="checkmark" size={56} onPress={submit} disabled={save.loading} />
                </>
              ) : (
                <IconCircle name="pencil" size={56} onPress={() => setEditing(true)} />
              )}
            </View>
          ) : null}
          {editing && touched && !requiredOk ? (
            <Txt size={15} center color={colors.red} style={{ marginTop: 6 }}>
              Veuillez remplir tous les champs
            </Txt>
          ) : (
            <Txt size={15} center style={{ marginTop: 6 }}>
              Profile
            </Txt>
          )}
        </View>

        <FieldGroup>
          <Field label="Prénom" value={form.first_name} onChangeText={set('first_name')} editable={editing} error={touched && !nonEmpty(form.first_name)} />
          <Field label="Nom" value={form.last_name} onChangeText={set('last_name')} editable={editing} error={touched && !nonEmpty(form.last_name)} />
          <FieldRow>
            <Field label="Jour" value={editing ? form.day : birthLabel ? String(Number(birthLabel[2])) : ''} onChangeText={set('day')} editable={editing} keyboardType="number-pad" placeholder="JJ" containerStyle={{ width: 80 }} />
            <Field
              label="Mois"
              value={editing ? form.month : birthLabel ? MONTHS[Number(birthLabel[1]) - 1] ?? '' : ''}
              onChangeText={set('month')}
              editable={editing}
              keyboardType="number-pad"
              placeholder={editing ? 'MM' : 'MMM'}
              flex={1}
            />
            <Field label="Année" value={form.year} onChangeText={set('year')} editable={editing} keyboardType="number-pad" placeholder="YYYY" containerStyle={{ width: 110 }} />
          </FieldRow>
          {editing ? (
            <>
              <Field label="Adresse" value={form.street} onChangeText={set('street')} editable placeholder="Rue" error={touched && !nonEmpty(form.street)} />
              <FieldRow>
                <Field label="NPA" value={form.zip} onChangeText={set('zip')} editable keyboardType="number-pad" containerStyle={{ width: 110 }} error={touched && !nonEmpty(form.zip)} />
                <Field label="Ville" value={form.city} onChangeText={set('city')} editable flex={1} error={touched && !nonEmpty(form.city)} />
              </FieldRow>
              <Field label="Pays" value={form.country} onChangeText={set('country')} editable />
            </>
          ) : (
            <Field label="Adresse" value={[profile.street, `${profile.zip ?? ''} ${profile.city ?? ''}`.trim(), profile.country].filter(Boolean).join('\n')} editable={false} multiline />
          )}
          {own ? (
            <>
              <Field label="E-mail" value={form.email} onChangeText={set('email')} editable={editing} keyboardType="email-address" autoCapitalize="none" error={touched && !isEmail(form.email)} />
              <Field label="Mot de passe" value={editing ? form.password : '••••••••••••'} onChangeText={set('password')} editable={editing} secureTextEntry placeholder={editing ? 'Nouveau mot de passe' : ''} />
            </>
          ) : null}
        </FieldGroup>

        {own && isPro ? (
          <View style={styles.docRow}>
            {DOC_CHIPS.map((c) => (
              <SelectPill key={c.kind} label={c.label} small selected={docsFor(c.kind) > 0} onPress={() => setDocSheet(c.kind)} style={{ backgroundColor: docsFor(c.kind) > 0 ? colors.red : colors.redPale, flexGrow: 1 }} />
            ))}
          </View>
        ) : null}

        <View style={styles.reviewsHead}>
          <Txt size={16}>Review</Txt>
          <Txt size={16}>{reviews.data?.length ?? 0} avis</Txt>
        </View>
        <View style={{ paddingHorizontal: 12 }}>
          {(reviews.data ?? []).length === 0 ? (
            <View style={styles.noReview}>
              <Txt size={18} color={colors.greyText}>
                Pas encore d’avis reçu
              </Txt>
            </View>
          ) : (
            reviews.data!.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </View>
      </ScrollView>

      <OptionSheet visible={servicesSheet} onClose={() => setServicesSheet(false)} title="Mes prestations" onConfirm={() => saveServices.run()} confirmDisabled={selectedServices.length === 0 || saveServices.loading}>
        <View style={styles.wrapPills}>
          {(services.data ?? []).map((s) => {
            const sel = selectedServices.includes(s.id);
            return (
              <SelectPill
                key={s.id}
                label={s.name}
                selected={sel}
                small
                onPress={() => setSelectedServices((cur) => (sel ? cur.filter((x) => x !== s.id) : [...cur, s.id]))}
                style={{ backgroundColor: sel ? colors.red : colors.bg, minWidth: '45%' }}
              />
            );
          })}
        </View>
      </OptionSheet>

      <OptionSheet visible={!!docSheet} onClose={() => setDocSheet(null)} title={DOC_CHIPS.find((c) => c.kind === docSheet)?.label}>
        {docSheet ? <DocumentUploader kind={docSheet} allowPdf={DOC_CHIPS.find((c) => c.kind === docSheet)?.allowPdf} shape="circle" /> : null}
      </OptionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWhite: { backgroundColor: colors.white, paddingHorizontal: 12, paddingTop: 8 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerGrey: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 122, marginTop: -44, minHeight: 44 },
  editRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  docRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingTop: 12 },
  reviewsHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 18, paddingBottom: 10 },
  noReview: { backgroundColor: colors.white, borderRadius: 12, padding: 20 },
  wrapPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
