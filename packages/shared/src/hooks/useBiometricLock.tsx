import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from './useAuth';
import { colors, fonts } from '../theme';
import type { ProfileSettings } from '../supabase/database.types';

export function readSettings(settings: unknown): ProfileSettings {
  const s = (settings ?? {}) as Partial<ProfileSettings>;
  return {
    notifications: s.notifications ?? true,
    newsletter: s.newsletter ?? false,
    touch_id: s.touch_id ?? false,
    language: s.language ?? 'fr',
    country: s.country ?? 'CH',
  };
}

export async function biometricsAvailable(): Promise<boolean> {
  const [hw, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
  return hw && enrolled;
}

export async function authenticate(): Promise<boolean> {
  const res = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Déverrouiller HEROES',
    cancelLabel: 'Annuler',
    fallbackLabel: 'Utiliser le code',
  });
  return res.success;
}

/** Verrou Touch ID / Face ID : actif si le réglage du profil l'exige, redemandé au retour au premier plan. */
export function BiometricGate({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const enabled = !!profile && readSettings(profile.settings).touch_id;
  const [locked, setLocked] = useState(false);
  const asked = useRef(false);

  const unlock = useCallback(async () => {
    if (asked.current) return;
    asked.current = true;
    try {
      const ok = await authenticate();
      if (ok) setLocked(false);
    } finally {
      asked.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLocked(false);
      return;
    }
    setLocked(true);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') setLocked(true);
    });
    return () => sub.remove();
  }, [enabled]);

  useEffect(() => {
    if (locked) void unlock();
  }, [locked, unlock]);

  return (
    <>
      {children}
      {locked && (
        <View style={styles.overlay}>
          <Text style={styles.title}>HEROES</Text>
          <Text style={styles.text}>Identifiez-vous pour continuer</Text>
          <Pressable style={styles.btn} onPress={unlock}>
            <Text style={styles.btnText}>Déverrouiller</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontFamily: fonts.black, fontSize: 34, letterSpacing: -1 },
  text: { fontFamily: fonts.regular, fontSize: 15, color: colors.greyDark },
  btn: { backgroundColor: colors.red, borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14 },
  btnText: { fontFamily: fonts.semibold, color: colors.white, fontSize: 16 },
});
