import { ActionSheetIOS, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { guessMime } from '../lib/storage';

export interface PickedFile {
  uri: string;
  mime: string;
  name?: string;
}

export async function pickImage(opts: { camera?: boolean; allowsEditing?: boolean; square?: boolean } = {}): Promise<PickedFile | null> {
  if (opts.camera) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Appareil photo', "Autorisez l'accès à l'appareil photo dans les réglages.");
      return null;
    }
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', "Autorisez l'accès à vos photos dans les réglages.");
      return null;
    }
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: opts.allowsEditing ?? true,
    aspect: opts.square ? [1, 1] : undefined,
    quality: 0.8,
  };
  const result = opts.camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;
  const a = result.assets[0];
  return { uri: a.uri, mime: a.mimeType ?? guessMime(a.uri, 'image/jpeg'), name: a.fileName ?? undefined };
}

export async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets[0]) return null;
  const a = result.assets[0];
  return { uri: a.uri, mime: a.mimeType ?? guessMime(a.uri), name: a.name };
}

/** Feuille d'options « Ajouter un document PDF / Prendre une photo / Choisir une photo » (cf. maquette). */
export function chooseFileSource(opts: { allowPdf?: boolean; square?: boolean } = {}): Promise<PickedFile | null> {
  const labels = [...(opts.allowPdf ? ['Ajouter un document PDF'] : []), 'Prendre une photo', 'Choisir une photo', 'Annuler'];
  const handlers: (() => Promise<PickedFile | null>)[] = [
    ...(opts.allowPdf ? [() => pickDocument()] : []),
    () => pickImage({ camera: true, square: opts.square }),
    () => pickImage({ camera: false, square: opts.square }),
  ];
  return new Promise((resolve) => {
    const onIndex = (i: number) => {
      const h = handlers[i];
      if (!h) return resolve(null);
      h().then(resolve, () => resolve(null));
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ options: labels, cancelButtonIndex: labels.length - 1 }, onIndex);
    } else {
      Alert.alert(
        'Ajouter',
        undefined,
        [
          ...labels.slice(0, -1).map((text, i) => ({ text, onPress: () => onIndex(i) })),
          { text: 'Annuler', style: 'cancel' as const, onPress: () => resolve(null) },
        ],
        { cancelable: true, onDismiss: () => resolve(null) },
      );
    }
  });
}
