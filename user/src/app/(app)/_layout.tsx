import React from 'react';
import { Stack } from 'expo-router';

export const unstable_settings = { anchor: 'index' };

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="missions/[id]/index" options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <Stack.Screen name="missions/[id]/scheduled" options={{ animation: 'fade' }} />
    </Stack>
  );
}
