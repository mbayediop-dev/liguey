import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { LegalPageScreen } from '@heroes/shared';

export default function Legal() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <LegalPageScreen slug={slug} />;
}
