import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RescheduleScreen } from '@heroes/shared';

export default function Reschedule() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RescheduleScreen missionId={id} />;
}
