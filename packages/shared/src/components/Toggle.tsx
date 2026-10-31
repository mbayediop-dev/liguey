import React from 'react';
import { Switch } from 'react-native';
import { colors } from '../theme';

export function Toggle({ value, onValueChange, disabled }: { value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ true: colors.red, false: colors.grey }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.grey}
    />
  );
}
