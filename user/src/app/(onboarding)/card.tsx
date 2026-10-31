import React from 'react';
import { CardStepScreen } from '@heroes/shared';

export default function Card() {
  return <CardStepScreen next="/photo" addRoute="/card-form" dot={1} />;
}
