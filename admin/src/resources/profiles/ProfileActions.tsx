import { useState } from 'react';
import { Button } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ThumbDownIcon from '@mui/icons-material/ThumbDownOffAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SendIcon from '@mui/icons-material/Send';
import { Confirm, EditButton, TopToolbar, useGetIdentity, useNotify, useRecordContext, useRefresh, useTranslate } from 'react-admin';
import type { ProfileRow } from '@shared/supabase/database.types';
import { admin } from '../../lib/admin';
import { fullName } from '../../lib/format';
import { NotifyDialog, ReasonDialog } from '../../components/Dialogs';

type DialogKind = 'reject' | 'block' | 'notify' | 'verify' | 'promote' | 'demote' | null;

/** Barre d'actions de la fiche utilisateur : vérification, blocage, droits admin, message. */
export function ProfileShowActions() {
  const record = useRecordContext<ProfileRow>();
  const notify = useNotify();
  const refresh = useRefresh();
  const t = useTranslate();
  const { identity } = useGetIdentity();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [busy, setBusy] = useState(false);

  if (!record) return null;
  const name = fullName(record) || record.email || 'cet utilisateur';
  const isSelf = identity?.id === record.id;

  async function run(action: () => Promise<unknown>, successKey: string) {
    setBusy(true);
    try {
      await action();
      notify(t(successKey), { type: 'success' });
      setDialog(null);
      refresh();
    } catch (e) {
      notify((e as Error).message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <TopToolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
      {record.role === 'pro' && record.verification_status !== 'verified' ? (
        <Button size="small" variant="contained" color="success" startIcon={<VerifiedIcon />} onClick={() => setDialog('verify')}>
          {t('heroes.actions.verify')}
        </Button>
      ) : null}
      {record.role === 'pro' && record.verification_status !== 'rejected' ? (
        <Button size="small" variant="outlined" color="warning" startIcon={<ThumbDownIcon />} onClick={() => setDialog('reject')}>
          {t('heroes.actions.reject')}
        </Button>
      ) : null}
      {!isSelf ? (
        record.is_blocked ? (
          <Button size="small" variant="outlined" startIcon={<LockOpenIcon />} onClick={() => void run(() => admin.setBlocked(record.id, false), 'heroes.messages.unblocked')} disabled={busy}>
            {t('heroes.actions.unblock')}
          </Button>
        ) : (
          <Button size="small" variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => setDialog('block')}>
            {t('heroes.actions.block')}
          </Button>
        )
      ) : null}
      {!isSelf ? (
        <Button size="small" variant="outlined" color="secondary" startIcon={<AdminPanelSettingsIcon />} onClick={() => setDialog(record.is_admin ? 'demote' : 'promote')}>
          {t(record.is_admin ? 'heroes.actions.demote' : 'heroes.actions.promote')}
        </Button>
      ) : null}
      <Button size="small" variant="outlined" startIcon={<SendIcon />} onClick={() => setDialog('notify')}>
        {t('heroes.actions.notify')}
      </Button>
      <EditButton />

      <Confirm
        isOpen={dialog === 'verify'}
        loading={busy}
        title={t('heroes.actions.verify')}
        content={`Valider le profil de ${name} ? Le héros recevra une notification.`}
        confirm="Valider"
        onConfirm={() => void run(() => admin.setVerification(record.id, 'verified'), 'heroes.messages.verified')}
        onClose={() => setDialog(null)}
      />
      <Confirm
        isOpen={dialog === 'promote' || dialog === 'demote'}
        loading={busy}
        title={t(dialog === 'demote' ? 'heroes.actions.demote' : 'heroes.actions.promote')}
        content={
          dialog === 'demote'
            ? `${name} n'aura plus accès au back-office.`
            : `${name} aura un accès complet au back-office : utilisateurs, missions, catalogue et paiements.`
        }
        confirm="Confirmer"
        onConfirm={() =>
          void run(() => admin.setAdmin(record.id, dialog === 'promote'), dialog === 'promote' ? 'heroes.messages.promoted' : 'heroes.messages.demoted')
        }
        onClose={() => setDialog(null)}
      />
      <ReasonDialog
        open={dialog === 'reject'}
        title={t('heroes.actions.reject')}
        description={`${name} sera informé que son profil n'est pas validé. Indiquez-lui ce qui manque.`}
        reasonLabel="Motif communiqué au héros"
        confirmLabel="Refuser"
        required
        danger
        loading={busy}
        onConfirm={(reason) => void run(() => admin.setVerification(record.id, 'rejected', reason), 'heroes.messages.rejected')}
        onClose={() => setDialog(null)}
      />
      <ReasonDialog
        open={dialog === 'block'}
        title={t('heroes.actions.block')}
        description={`${name} ne pourra plus créer de demande ni accepter de mission, et verra un écran « Compte suspendu ».`}
        reasonLabel="Motif (affiché à l'utilisateur)"
        confirmLabel="Bloquer"
        danger
        loading={busy}
        onConfirm={(reason) => void run(() => admin.setBlocked(record.id, true, reason), 'heroes.messages.blocked')}
        onClose={() => setDialog(null)}
      />
      <NotifyDialog
        open={dialog === 'notify'}
        recipient={name}
        loading={busy}
        onSend={(title, body) => void run(() => admin.notify(record.id, title, body), 'heroes.messages.notified')}
        onClose={() => setDialog(null)}
      />
    </TopToolbar>
  );
}
