import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { Stars } from '../../components/Stars';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { keys } from '../../hooks/queryClient';
import { addReview } from '../../api/chat';

/** « Notez votre hero » (client) / « Notez votre client » (pro). */
export function RateScreen({ missionId, targetId, title = 'Notez votre hero', next = '/' }: { missionId: string; targetId: string; title?: string; next?: string }) {
  const router = useRouter();
  const { session } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const finish = () => (router.canGoBack() ? router.dismissTo(next) : router.replace(next));
  const save = useAsyncAction(() => addReview({ missionId, authorId: session!.user.id, targetId, rating, comment }), {
    invalidate: [keys.reviews(targetId), keys.myReview(missionId), keys.mission(missionId)],
    onSuccess: finish,
  });
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScreenTitle>{title}</ScreenTitle>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Stars rating={rating} onChange={setRating} size={60} gap={10} />
      </View>
      <View style={{ flex: 1 }} />
      <View>
        <Txt variant="caption" style={{ marginLeft: 4, marginBottom: 2 }}>
          {comment.length}/300
        </Txt>
        <TextField placeholder="Écrivez un commentaire…" value={comment} onChangeText={setComment} multiline maxLength={300} containerStyle={{ minHeight: 190, borderRadius: 4 }} style={{ fontSize: 22, lineHeight: 28 }} />
      </View>
      <Button title="Passer" variant="blue" onPress={finish} style={{ marginTop: 18 }} />
      <Button title="Valider" onPress={() => save.run()} disabled={rating === 0} loading={save.loading} style={{ marginTop: 10 }} />
    </Screen>
  );
}
