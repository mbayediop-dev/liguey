import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { BottomBar } from '../../components/BottomBar';
import { StepDots } from '../../components/StepDots';
import { PlusCircle } from '../../components/PlusCircle';
import { Avatar } from '../../components/Avatar';
import { Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { chooseFileSource, type PickedFile } from '../../hooks/usePicker';
import { uploadAvatar } from '../../api/profile';

interface Props {
  next: string;
  buttonTitle?: string;
  dot?: number;
  dots?: number;
  allowSkip?: boolean;
}

/** « Ajouter une photo de profil » → « Vous avez ajouté une photo de profil ». */
export function PhotoScreen({ next, buttonTitle = 'Créer un compte', dot = 2, dots = 3, allowSkip = true }: Props) {
  const router = useRouter();
  const { session, profile, setProfile } = useAuth();
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const has = !!picked || !!profile?.avatar_url;

  const pick = async () => {
    const f = await chooseFileSource({ square: true });
    if (f) setPicked(f);
  };

  const save = useAsyncAction(
    async () => {
      if (picked) {
        const p = await uploadAvatar(session!.user.id, picked.uri, picked.mime);
        setProfile(p);
      }
    },
    { onSuccess: () => router.push(next) },
  );

  return (
    <Screen
      bg={colors.white}
      footer={
        <>
          {allowSkip && !has ? (
            <Pressable onPress={() => router.push(next)} hitSlop={8}>
              <Txt variant="small" center color={colors.greyText} style={{ marginBottom: 4 }}>
                Ajouter plus tard
              </Txt>
            </Pressable>
          ) : null}
          <StepDots count={dots} current={dot} />
          <BottomBar title={buttonTitle} onPress={() => save.run()} disabled={!has} loading={save.loading} />
        </>
      }
    >
      <ScreenTitle>{has ? 'Vous avez ajouté\nune photo de profil' : 'Ajouter une photo\nde profil'}</ScreenTitle>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {has ? (
          <Pressable onPress={pick}>
            <Avatar uri={picked?.uri} path={picked ? undefined : profile?.avatar_url} profile={profile} size={260} />
          </Pressable>
        ) : (
          <PlusCircle size={260} onPress={pick} />
        )}
      </View>
    </Screen>
  );
}
