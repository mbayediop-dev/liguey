import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProfileScreen } from '@heroes/shared';

export default function PublicProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProfileScreen userId={id} />;
}
