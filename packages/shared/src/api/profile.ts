import { sb } from '../supabase/client';
import type { Database, ProfileRow } from '../supabase/database.types';
import { newFileName, uploadLocalFile } from '../lib/storage';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<ProfileRow> {
  const { data, error } = await sb().from('profiles').update(patch).eq('id', userId).select('*').single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, uri: string, mime = 'image/jpeg'): Promise<ProfileRow> {
  const path = `${userId}/${newFileName(mime)}`;
  await uploadLocalFile({ bucket: 'avatars', path, uri, contentType: mime });
  return updateProfile(userId, { avatar_url: path });
}

export async function acceptCgu(userId: string): Promise<ProfileRow> {
  return updateProfile(userId, { cgu_accepted_at: new Date().toISOString(), onboarding_completed: true });
}

export async function updateEmail(email: string) {
  const { error } = await sb().auth.updateUser({ email });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await sb().auth.updateUser({ password });
  if (error) throw error;
}

export async function setProServices(proId: string, serviceIds: string[]) {
  const { error: delErr } = await sb().from('pro_services').delete().eq('pro_id', proId);
  if (delErr) throw delErr;
  if (serviceIds.length) {
    const { error } = await sb().from('pro_services').insert(serviceIds.map((service_id) => ({ pro_id: proId, service_id })));
    if (error) throw error;
  }
}

export async function addProDocument(input: {
  proId: string;
  kind: Database['public']['Enums']['document_kind'];
  side?: Database['public']['Enums']['document_side'] | null;
  label?: string | null;
  uri: string;
  mime: string;
}) {
  const path = `${input.proId}/${input.kind}/${newFileName(input.mime)}`;
  await uploadLocalFile({ bucket: 'documents', path, uri: input.uri, contentType: input.mime });
  const { data, error } = await sb()
    .from('pro_documents')
    .insert({ pro_id: input.proId, kind: input.kind, side: input.side ?? null, label: input.label ?? null, file_path: path, mime_type: input.mime })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProDocument(id: string, filePath: string) {
  await sb().storage.from('documents').remove([filePath]);
  const { error } = await sb().from('pro_documents').delete().eq('id', id);
  if (error) throw error;
}

export async function addPaymentMethod(input: {
  userId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string;
  makeDefault?: boolean;
}) {
  if (input.makeDefault) {
    await sb().from('payment_methods').update({ is_default: false }).eq('user_id', input.userId);
  }
  const { data, error } = await sb()
    .from('payment_methods')
    .insert({
      user_id: input.userId,
      brand: input.brand,
      last4: input.last4,
      exp_month: input.expMonth,
      exp_year: input.expYear,
      holder_name: input.holderName,
      is_default: input.makeDefault ?? true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deletePaymentMethod(id: string) {
  const { error } = await sb().from('payment_methods').delete().eq('id', id);
  if (error) throw error;
}

export async function setDefaultPaymentMethod(userId: string, id: string) {
  await sb().from('payment_methods').update({ is_default: false }).eq('user_id', userId);
  const { error } = await sb().from('payment_methods').update({ is_default: true }).eq('id', id);
  if (error) throw error;
}

export async function createSupportRequest(userId: string, message: string) {
  const { error } = await sb().from('support_requests').insert({ user_id: userId, message });
  if (error) throw error;
}
