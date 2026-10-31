import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { IntroSplash, useAuth, useProDocuments, useProServices } from '@heroes/shared';

/** Reprend l'inscription pro à la première étape incomplète. */
export default function Start() {
  const router = useRouter();
  const { profile } = useAuth();
  const services = useProServices(profile?.id);
  const docs = useProDocuments(profile?.id);
  useEffect(() => {
    if (!profile || !services.data || !docs.data) return;
    const hasId = docs.data.some((d) => d.kind === 'id_card' || d.kind === 'passport' || d.kind === 'residence_permit');
    if (!profile.first_name || !profile.street) router.replace('/infos');
    else if (services.data.length === 0) router.replace('/services');
    else if (!hasId) router.replace('/experience');
    else if (!profile.avatar_url) router.replace('/photo');
    else router.replace('/cgu');
  }, [profile, services.data, docs.data, router]);
  return <IntroSplash pro />;
}
