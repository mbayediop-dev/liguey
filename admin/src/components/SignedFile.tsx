import { useEffect, useState } from 'react';
import { Alert, Button, Skeleton, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { signedUrl, type PrivateBucket } from '../supabase';

/** Fichier d'un bucket privé : aperçu image ou bouton d'ouverture, via une URL signée temporaire. */
export function SignedFile({
  bucket,
  path,
  mime,
  label,
  maxHeight = 220,
}: {
  bucket: PrivateBucket;
  path: string;
  mime?: string | null;
  label?: string;
  maxHeight?: number;
}) {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let alive = true;
    setUrl(undefined);
    setError(undefined);
    signedUrl(bucket, path)
      .then((u) => alive && setUrl(u))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [bucket, path]);

  const isImage = (mime ?? '').startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(path);

  if (error) {
    return (
      <Alert severity="warning" variant="outlined" sx={{ py: 0 }}>
        Fichier indisponible : {error}
      </Alert>
    );
  }
  if (!url) return <Skeleton variant="rounded" width={160} height={isImage ? 120 : 36} />;

  return (
    <Stack spacing={0.5} alignItems="flex-start">
      {isImage ? (
        <a href={url} target="_blank" rel="noreferrer" title={label ?? path}>
          <img
            src={url}
            alt={label ?? path}
            style={{ maxHeight, maxWidth: '100%', borderRadius: 8, border: '1px solid #E5E5EA', display: 'block', background: '#fff' }}
          />
        </a>
      ) : (
        <Button variant="outlined" size="small" startIcon={<OpenInNewIcon />} href={url} target="_blank" rel="noreferrer">
          {label ?? 'Ouvrir le document'}
        </Button>
      )}
      {label && isImage ? (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      ) : null}
    </Stack>
  );
}
