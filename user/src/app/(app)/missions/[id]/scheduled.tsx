import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { DoneScreen } from '@heroes/shared';

/** « Votre paiement a été effectué avec succès ! » puis « Votre mission a été agendée ! ». */
export default function Scheduled() {
  const router = useRouter();
  const [phase, setPhase] = useState<0 | 1>(0);
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 1600);
    return () => clearTimeout(t);
  }, []);
  if (phase === 0) return <DoneScreen title={'Votre paiement a\nété effectué avec\nsuccès !'} delay={100000} onDone={() => undefined} />;
  return <DoneScreen title={'Votre mission a été\nagendée !'} delay={1600} onDone={() => router.dismissTo('/')} />;
}
