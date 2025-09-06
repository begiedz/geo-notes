import CreateButton from '@/components/createButton';
import Note from '@/components/note';
import type { Note as TNote } from '@/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { getNotes, initDb } from '../lib/db';

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

  return (
    <View className="flex-1">
      {loading && notes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-slate-600">Loading…</Text>
        </View>
      ) : !loading && notes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-2 text-xl font-semibold dark:text-white">
            Welcome to GeoNotes!
          </Text>
          <Text className="mb-4 text-center text-slate-600">
            {`Tap + to create your first note.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          contentContainerStyle={{ padding: 12 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <Note note={item} />}
        />
      )}
      <CreateButton onPress={() => router.push('/create')} />
    </View>
  );
}
