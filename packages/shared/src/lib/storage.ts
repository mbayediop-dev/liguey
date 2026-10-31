import { File } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { sb } from '../supabase/client';

export type Bucket = 'avatars' | 'documents' | 'receipts' | 'chat';

export function guessMime(uri: string, fallback = 'application/octet-stream'): string {
  const ext = uri.split('?')[0]?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'pdf':
      return 'application/pdf';
    default:
      return fallback;
  }
}

export function extForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}

export function newFileName(mime: string): string {
  return `${Crypto.randomUUID()}.${extForMime(mime)}`;
}

/** Lit un fichier local (file://) et l'envoie dans un bucket Supabase. Retourne le chemin stocké. */
export async function uploadLocalFile(params: {
  bucket: Bucket;
  path: string;
  uri: string;
  contentType?: string;
  upsert?: boolean;
}): Promise<string> {
  const contentType = params.contentType ?? guessMime(params.uri);
  const file = new File(params.uri);
  const body = await file.arrayBuffer();
  const { error } = await sb()
    .storage.from(params.bucket)
    .upload(params.path, body, { contentType, upsert: params.upsert ?? true });
  if (error) throw error;
  return params.path;
}

export function publicUrl(bucket: Bucket, path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return sb().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function avatarUrl(path: string | null | undefined): string | undefined {
  return publicUrl('avatars', path);
}

export async function signedUrl(bucket: Bucket, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await sb().storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeFile(bucket: Bucket, path: string): Promise<void> {
  const { error } = await sb().storage.from(bucket).remove([path]);
  if (error) throw error;
}
