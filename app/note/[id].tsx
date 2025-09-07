import { deleteNoteAndImage } from '@/lib/utils';
import type { Note } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import {
  RelativePathString,
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { getNote } from '../../lib/db';

export default function NoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);

  const load = useCallback(async () => {
    try {
      const n = await getNote(id);
      if (!n) return Alert.alert('Not found');
      setNote(n);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e));
    }
  }, [id]);

  // refetch, when getting back from edit
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!note) return null;

  const headerTitle = note.title
    ? note.title.length > 40
      ? note.title.slice(0, 40) + '...'
      : note.title
    : 'Note';

  const openMenu = () => {
    Alert.alert('Options', undefined, [
      {
        text: 'Edit',
        onPress: () =>
          router.push(`/note/${note.id}/edit` as RelativePathString),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete note?', 'This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteNoteAndImage(note.id);
                  router.back();
                } catch (e: any) {
                  Alert.alert('Error', e?.message ?? String(e));
                }
              },
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerRight: () => (
            <Pressable
              onPress={openMenu}
              hitSlop={10}
              className="p-2"
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
              />
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1">
        <Image
          source={{ uri: note.photo_uri }}
          className="h-64 w-full"
        />
        <View className="p-4">
          <Text className="mb-2 text-xs text-slate-500">
            {new Date(note.created_at).toLocaleString()}
            {note.coordinates
              ? ` • ${note.coordinates.latitude}, ${note.coordinates.longitude}`
              : ''}
          </Text>
          {!!note.address && (
            <Text className="mb-2 text-xs text-slate-500">{note.address}</Text>
          )}
          <Text className="text-base leading-6 dark:text-white">
            {note.body || '—'}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
