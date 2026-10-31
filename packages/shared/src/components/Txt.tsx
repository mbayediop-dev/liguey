import React from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, fonts, text as T } from '../theme';

export type TxtVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'small' | 'caption' | 'label' | 'button' | 'input';

export interface TxtProps extends TextProps {
  variant?: TxtVariant;
  weight?: keyof typeof fonts;
  color?: string;
  center?: boolean;
  upper?: boolean;
  size?: number;
  lineHeight?: number;
}

export function Txt({ variant = 'body', weight, color, center, upper, size, lineHeight, style, ...rest }: TxtProps) {
  return (
    <Text
      {...rest}
      style={[
        T[variant],
        weight ? { fontFamily: fonts[weight] } : null,
        color ? { color } : null,
        center ? { textAlign: 'center' } : null,
        upper ? { textTransform: 'uppercase' } : null,
        size ? { fontSize: size, lineHeight: lineHeight ?? Math.round(size * 1.25) } : null,
        style,
      ]}
    />
  );
}

/** Le mot HEROES dans sa graisse de logo, utilisable à l'intérieur d'un texte. */
export function Brand({ children = 'HEROES', color = colors.black }: { children?: string; color?: string }) {
  return <Text style={{ fontFamily: fonts.black, letterSpacing: -1, color }}>{children}</Text>;
}

/** « HEROES » ou « HEROES PRO » selon l'app. */
export function BrandName({ suffix, color = colors.black }: { suffix?: string; color?: string }) {
  return (
    <>
      <Brand color={color} />
      {suffix ? <Text style={{ color }}>{` ${suffix}`}</Text> : null}
    </>
  );
}
