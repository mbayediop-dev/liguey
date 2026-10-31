import { sb } from '../supabase/client';
import type { Database, MissionRow, RecurrenceKind } from '../supabase/database.types';

type Fn = keyof Database['public']['Functions'];
type Args<K extends Fn> = Database['public']['Functions'][K]['Args'];
type Ret<K extends Fn> = Database['public']['Functions'][K]['Returns'];

export async function rpc<K extends Fn>(name: K, args: Args<K>): Promise<Ret<K>> {
  const { data, error } = await sb().rpc(name, args as never);
  if (error) throw error;
  return data as Ret<K>;
}

export interface NewMissionInput {
  serviceId: string;
  subServiceId: string | null;
  street: string;
  zip: string;
  city: string;
  startDate: string; // yyyy-mm-dd
  timeStart: string; // HH:MM
  timeEnd: string; // HH:MM
  recurrence: RecurrenceKind;
  description: string;
}

export async function createMission(clientId: string, input: NewMissionInput): Promise<MissionRow> {
  const { data, error } = await sb()
    .from('missions')
    .insert({
      client_id: clientId,
      service_id: input.serviceId,
      sub_service_id: input.subServiceId,
      street: input.street,
      zip: input.zip,
      city: input.city,
      start_date: input.startDate,
      time_start: input.timeStart,
      time_end: input.timeEnd,
      recurrence: input.recurrence,
      description: input.description,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export const acceptMission = (missionId: string, proposal?: { date: string; start: string; end: string }) =>
  rpc('accept_mission', {
    p_mission_id: missionId,
    p_new_date: proposal?.date ?? null,
    p_new_start: proposal?.start ?? null,
    p_new_end: proposal?.end ?? null,
  });
export const declineMission = (missionId: string) => rpc('decline_mission', { p_mission_id: missionId });
export const postMission = (missionId: string) => rpc('post_mission', { p_mission_id: missionId });
export const relaunchSearch = (missionId: string) => rpc('relaunch_search', { p_mission_id: missionId });
export const validateMission = (missionId: string, paymentMethodId: string | null) =>
  rpc('validate_mission', { p_mission_id: missionId, p_payment_method_id: paymentMethodId });
export const requestStart = (missionId: string) => rpc('request_start', { p_mission_id: missionId });
export const confirmStart = (missionId: string) => rpc('confirm_start', { p_mission_id: missionId });
export const completeMission = (missionId: string) => rpc('complete_mission', { p_mission_id: missionId });
export const confirmCompletion = (missionId: string) => rpc('confirm_completion', { p_mission_id: missionId });
export const cancelMission = (missionId: string, reason?: string) =>
  rpc('cancel_mission', { p_mission_id: missionId, p_reason: reason ?? null });
export const proposeReschedule = (missionId: string, date: string, start: string, end: string) =>
  rpc('propose_reschedule', { p_mission_id: missionId, p_date: date, p_start: start, p_end: end });
export const respondReschedule = (rescheduleId: string, accept: boolean) =>
  rpc('respond_reschedule', { p_reschedule_id: rescheduleId, p_accept: accept });

export async function addExpense(input: {
  missionId: string;
  createdBy: string;
  kind: 'material' | 'time' | 'other';
  label: string;
  amount: number;
  vatCode: number;
  minutes?: number | null;
  receiptPath?: string | null;
}) {
  const { data, error } = await sb()
    .from('mission_expenses')
    .insert({
      mission_id: input.missionId,
      created_by: input.createdBy,
      kind: input.kind,
      label: input.label,
      amount_chf: input.amount,
      vat_code: input.vatCode,
      minutes: input.minutes ?? null,
      receipt_path: input.receiptPath ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string) {
  const { error } = await sb().from('mission_expenses').delete().eq('id', id);
  if (error) throw error;
}
