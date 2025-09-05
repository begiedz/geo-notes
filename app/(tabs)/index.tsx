import Note from '@/components/note';
import type { Note as TNote } from '@/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { getNotes, initDb } from '../../lib/db';

export default function Index() {
  const [notes, setNotes] = useState<TNote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
    } catch (e: any) {
      Alert.alert('Error loading notes', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initDb();
  });

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading && notes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-slate-600">Loading…</Text>
      </View>
    );
  }

  if (!loading && notes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-2 text-xl font-semibold">Welcome to GeoNotes!</Text>
        <Text className="mb-4 text-center text-slate-600">
          {`Tap "New Note" to create your first note.`}
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-1 ">
      <FlatList
        data={notes}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => <Note note={item} />}
      />
    </View>
  );
}
