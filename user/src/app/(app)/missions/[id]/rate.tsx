import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RateScreen, useMission, IntroSplash } from '@heroes/shared';

export default function Rate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  if (!mission.data?.pro_id) return <IntroSplash />;
  return <RateScreen missionId={id} targetId={mission.data.pro_id} title="Notez votre hero" next="/" />;
}
