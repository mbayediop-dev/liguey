import React from 'react';
import { Stack } from 'expo-router';

export const unstable_settings = { anchor: 'start' };

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
