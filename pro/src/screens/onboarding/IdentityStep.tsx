import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomBar, Button, DocumentUploader, OptionSheet, Screen, ScreenTitle, Txt, colors, useAuth, useProDocuments, type DocumentKind } from '@heroes/shared';

type IdKind = Extract<DocumentKind, 'id_card' | 'passport' | 'residence_permit'>;
const LABELS: Record<IdKind, string> = { id_card: "Carte d'identité", passport: 'Passeport', residence_permit: 'Permis de séjour' };

/** « Ajoutez une pièce d'identité » : carte d'identité recto/verso, passeport ou permis de séjour. */
export default function IdentityStep() {
  const router = useRouter();
  const { session } = useAuth();
  const docs = useProDocuments(session?.user.id);
  const [open, setOpen] = useState<IdKind | null>(null);
  const has = (k: IdKind) => (docs.data ?? []).some((d) => d.kind === k);
  const any = has('id_card') || has('passport') || has('residence_permit');
  return (
    <Screen bg={colors.white} footer={<BottomBar title="Continuer" onPress={() => router.push('/photo')} disabled={!any} />}>
      <ScreenTitle>Ajoutez{'\n'}une pièce{'\n'}d’identité</ScreenTitle>
      <View style={{ flex: 1, justifyContent: 'center', gap: 10, paddingHorizontal: 8 }}>
        <Button title={`Carte d’identité${has('id_card') ? ' ✓' : ''}`} onPress={() => setOpen('id_card')} />
        <Button title={`Passeport${has('passport') ? ' ✓' : ''}`} variant="blue" onPress={() => setOpen('passport')} />
        <Button title={`Permis de séjour${has('residence_permit') ? ' ✓' : ''}`} variant="outline" onPress={() => setOpen('residence_permit')} />
      </View>
      <Txt size={17} lineHeight={24} style={{ marginBottom: 10 }}>
        Partagez avec nous votre/vos titres d’identité…
      </Txt>
      <OptionSheet visible={!!open} onClose={() => setOpen(null)} title={open ? LABELS[open] : undefined} confirmLabel="Terminer" onConfirm={() => setOpen(null)}>
        {open === 'id_card' ? (
          <View style={{ gap: 10 }}>
            <DocumentUploader kind="id_card" side="recto" label="Recto" allowPdf={false} shape="rect" rectLabel="RECTO" max={1} />
            <DocumentUploader kind="id_card" side="verso" label="Verso" allowPdf={false} shape="rect" rectLabel="VERSO" max={1} />
          </View>
        ) : open ? (
          <DocumentUploader kind={open} label={LABELS[open]} allowPdf={false} shape="rect" max={2} />
        ) : null}
      </OptionSheet>
    </Screen>
  );
}
