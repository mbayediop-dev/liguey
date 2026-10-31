import { create } from 'zustand';
import type { RecurrenceKind } from '@heroes/shared';

export interface RequestDraft {
  serviceId: string | null;
  subServiceId: string | null;
  street: string;
  zip: string;
  city: string;
  startDate: string | null;
  timeStart: string;
  duration: number;
  recurrence: RecurrenceKind;
}

interface Store extends RequestDraft {
  patch: (p: Partial<RequestDraft>) => void;
  reset: () => void;
}

const initial: RequestDraft = {
  serviceId: null,
  subServiceId: null,
  street: '',
  zip: '',
  city: '',
  startDate: null,
  timeStart: '10:00',
  duration: 30,
  recurrence: 'once',
};

/** Brouillon de la demande en cours de création (services → sous-service → confirmation → outils). */
export const useRequestDraft = create<Store>((set) => ({
  ...initial,
  patch: (p) => set(p),
  reset: () => set(initial),
}));
