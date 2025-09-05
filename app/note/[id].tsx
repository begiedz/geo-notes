import type { Note } from '@/types';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { deleteNote, getNote } from '../../lib/db';

export default function NoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const n = await getNote(id);
        if (!n) return Alert.alert('Not found');
        setNote(n);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? String(e));
      }
    })();
  }, [id]);

  if (!note) return null;

  const headerTitle = note?.title
    ? note.title.length > 40
      ? note.title.slice(0, 40) + '…'
      : note.title
    : 'Note';

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />
      <ScrollView className="flex-1 bg-white">
        <Image
          source={{ uri: note.photo_uri }}
          className="h-64 w-full"
        />
        <View className="p-4">
          <Text className="mb-2 text-xs text-slate-500">
            {new Date(note.created_at).toLocaleString()}
            {note.address ? ` • ${note.address}` : ''}
          </Text>
          <Text className="text-base leading-6">{note.body || '—'}</Text>

          <Pressable
            onPress={async () => {
              Alert.alert('Delete note?', 'This action cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteNote(note.id);
                    router.back();
                  },
                },
              ]);
            }}
            className="mt-6 items-center rounded-xl bg-red-600 p-3"
          >
            <Text className="font-semibold text-white">Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
