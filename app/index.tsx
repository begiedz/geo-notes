import CreateButton from '@/components/createButton';
import EmptyListScreen from '@/components/emptyListScreen';
import Note from '@/components/note';
import SectionHeader from '@/components/sectionHeader';
import { clearMissingPins, getPinnedSet } from '@/lib/pins';
import type { Note as TNote } from '@/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { getNotes, initDb } from '../lib/db';

export default function Index() {
  const [notes, setNotes] = useState<TNote[]>([]);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const booted = useRef(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);

      await clearMissingPins(data.map(n => n.id));
      const pins = await getPinnedSet();
      setPinnedIds(pins);
    } catch (e: any) {
      Alert.alert('Error loading notes', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // bootstrap: DB -> load
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      try {
        setLoading(true);
        await initDb();
        await load();
      } catch {}
    })();
  }, [load]);

  // refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pinned = notes.filter(n => pinnedIds.has(n.id));
  const general = notes.filter(n => !pinnedIds.has(n.id));

  if (!loading && pinned.length === 0 && general.length === 0) {
    return (
      <View className="flex-1">
        <FlatList
          data={[]}
          ListEmptyComponent={EmptyListScreen}
          contentContainerStyle={{ padding: 12, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
            />
          }
          keyExtractor={() => 'empty'}
          renderItem={null}
        />
        <CreateButton onPress={() => router.push('/create')} />
      </View>
    );
  }

  if (pinned.length === 0) {
    return (
      <View className="flex-1">
        <FlatList
          data={general}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Note note={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={<SectionHeader title="Notes" />}
          contentContainerStyle={{ padding: 12, paddingTop: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
            />
          }
        />
        <CreateButton onPress={() => router.push('/create')} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={pinned}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Note note={item} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={<SectionHeader title="Pinned" />}
        ListFooterComponent={
          <>
            {general.length > 0 && (
              <>
                <SectionHeader title="General" />
                <FlatList
                  scrollEnabled={false}
                  data={general}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => <Note note={item} />}
                  ItemSeparatorComponent={() => <View className="h-3" />}
                  contentContainerStyle={{ paddingTop: 0 }}
                />
              </>
            )}
          </>
        }
        contentContainerStyle={{
          padding: 12,
          paddingTop: 0,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={load}
          />
        }
      />
      <CreateButton onPress={() => router.push('/create')} />
    </View>
  );
}
