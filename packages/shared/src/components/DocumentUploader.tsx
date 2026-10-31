import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { DocumentKind, DocumentSide, ProDocumentRow } from '../supabase/database.types';
import { useProDocuments, useSignedUrl } from '../hooks/queries';
import { useAuth } from '../hooks/useAuth';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { addProDocument, deleteProDocument } from '../api/profile';
import { chooseFileSource } from '../hooks/usePicker';
import { keys } from '../hooks/queryClient';
import { PlusCircle, PlusRect } from './PlusCircle';
import { IconCircle } from './IconCircle';
import { Txt } from './Txt';

interface Props {
  kind: DocumentKind;
  side?: DocumentSide | null;
  label?: string | null;
  allowPdf?: boolean;
  /** 'circle' (expérience, commerce) ou 'rect' (pièce d'identité recto/verso). */
  shape?: 'circle' | 'rect';
  rectLabel?: string;
  max?: number;
  onChanged?: (docs: ProDocumentRow[]) => void;
}

/** Zone d'ajout d'un justificatif + aperçu des fichiers déjà envoyés (bucket privé « documents »). */
export function DocumentUploader({ kind, side = null, label = null, allowPdf = true, shape = 'circle', rectLabel, max = 10, onChanged }: Props) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const docs = useProDocuments(userId);
  const mine = (docs.data ?? []).filter((d) => d.kind === kind && (side ? d.side === side : true));
  const [busy, setBusy] = useState(false);

  const add = useAsyncAction(
    async () => {
      const picked = await chooseFileSource({ allowPdf });
      if (!picked || !userId) return null;
      setBusy(true);
      try {
        return await addProDocument({ proId: userId, kind, side, label, uri: picked.uri, mime: picked.mime });
      } finally {
        setBusy(false);
      }
    },
    { invalidate: [keys.proDocuments(userId ?? '')], onSuccess: () => onChanged?.(mine) },
  );
  const remove = useAsyncAction(async (d: ProDocumentRow) => deleteProDocument(d.id, d.file_path), {
    invalidate: [keys.proDocuments(userId ?? '')],
    onSuccess: () => onChanged?.(mine),
  });

  const canAdd = mine.length < max;
  return (
    <View style={{ gap: 12 }}>
      {mine.map((d) => (
        <DocumentThumb key={d.id} doc={d} onDelete={() => remove.run(d)} />
      ))}
      {canAdd ? (
        shape === 'rect' ? (
          <PlusRect label={rectLabel} onPress={() => add.run()} height={mine.length ? 120 : 200} color={mine.length ? colors.redSoft : colors.red} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <PlusCircle size={mine.length ? 150 : 250} icon={busy ? 'clip' : mine.length ? 'clip' : 'plus'} onPress={() => add.run()} />
          </View>
        )
      ) : null}
    </View>
  );
}

export function DocumentThumb({ doc, onDelete }: { doc: ProDocumentRow; onDelete?: () => void }) {
  const url = useSignedUrl('documents', doc.file_path);
  const isPdf = doc.mime_type === 'application/pdf';
  return (
    <View style={styles.thumb}>
      {isPdf || !url.data ? (
        <View style={styles.pdf}>
          <Ionicons name={isPdf ? 'document-text-outline' : 'image-outline'} size={40} color={colors.blue} />
          <Txt size={13} color={colors.greyDark} numberOfLines={1}>
            {isPdf ? 'Document PDF' : 'Image'}
          </Txt>
        </View>
      ) : (
        <Image source={{ uri: url.data }} style={styles.img} contentFit="cover" />
      )}
      <View style={styles.row}>
        <Txt size={14} style={{ flex: 1 }} numberOfLines={1}>
          {doc.label ?? (doc.side === 'recto' ? 'Recto' : doc.side === 'verso' ? 'Verso' : 'Fichier')}
        </Txt>
        {onDelete ? <IconCircle name="trash-outline" size={40} onPress={onDelete} /> : null}
      </View>
    </View>
  );
}

export function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.remove}>
      <Ionicons name="trash-outline" size={22} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thumb: { backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden' },
  img: { width: '100%', height: 190 },
  pdf: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  remove: { position: 'absolute', right: 12, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
});
