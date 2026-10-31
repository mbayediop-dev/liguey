import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

/** Confirmation avec motif facultatif ou obligatoire (annulation, blocage, refus…). */
export function ReasonDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  reasonLabel = 'Motif (facultatif)',
  required = false,
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  reasonLabel?: string;
  required?: boolean;
  danger?: boolean;
  loading?: boolean;
  onConfirm: (reason: string | null) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) setReason('');
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description ? <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText> : null}
        <TextField autoFocus fullWidth multiline minRows={2} label={reasonLabel} value={reason} onChange={(e) => setReason(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button
          variant="contained"
          color={danger ? 'error' : 'primary'}
          disabled={loading || (required && !reason.trim())}
          onClick={() => onConfirm(reason.trim() || null)}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Rédaction d'une notification système (titre + message) envoyée à un utilisateur. */
export function NotifyDialog({
  open,
  recipient,
  defaultTitle = '',
  loading = false,
  onSend,
  onClose,
}: {
  open: boolean;
  recipient: string;
  defaultTitle?: string;
  loading?: boolean;
  onSend: (title: string, body: string | null) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState('');
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setBody('');
    }
  }, [open, defaultTitle]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Envoyer un message à {recipient}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>Le message apparaît dans les notifications de l’utilisateur dans l’application.</DialogContentText>
        <TextField autoFocus fullWidth label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth multiline minRows={3} label="Message" value={body} onChange={(e) => setBody(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button variant="contained" disabled={loading || !title.trim()} onClick={() => onSend(title.trim(), body.trim() || null)}>
          Envoyer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
