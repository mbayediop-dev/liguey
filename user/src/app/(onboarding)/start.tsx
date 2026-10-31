import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { IntroSplash, useAuth } from '@heroes/shared';

/** Reprend l'inscription à la première étape incomplète. */
export default function Start() {
  const router = useRouter();
  const { profile } = useAuth();
  useEffect(() => {
    if (!profile) return;
    if (!profile.first_name || !profile.street) router.replace('/infos');
    else if (!profile.avatar_url) router.replace('/card');
    else router.replace('/cgu');
  }, [profile, router]);
  return <IntroSplash />;
}
