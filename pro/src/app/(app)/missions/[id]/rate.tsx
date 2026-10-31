import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RateScreen, useMission, IntroSplash } from '@heroes/shared';

export default function Rate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  if (!mission.data) return <IntroSplash pro />;
  return <RateScreen missionId={id} targetId={mission.data.client_id} title="Notez votre client" next="/" />;
}
