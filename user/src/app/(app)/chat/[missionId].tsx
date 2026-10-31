import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChatThreadScreen } from '@heroes/shared';

export default function Chat() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <ChatThreadScreen missionId={missionId} />;
}
