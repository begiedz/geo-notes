import CreateButton from '@/components/createButton';
import Note from '@/components/note';
import type { Section, Note as TNote } from '@/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  Text,
  View,
} from 'react-native';
import { getNotes, initDb } from '../lib/db';
import { clearMissingPins, getPinnedSet } from '../lib/utils/pins';

export default function Index() {
  const [notes, setNotes] = useState<TNote[]>([]);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);

      await clearMissingPins(data.map(note => note.id));
      const pins = await getPinnedSet();
      setPinnedIds(pins);
    } catch (e: any) {
      Alert.alert('Error loading notes', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // init DB exactly once
  useEffect(() => {
    initDb().catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pinned = notes.filter(note => pinnedIds.has(note.id));
  const others = notes.filter(note => !pinnedIds.has(note.id));

  const sections: Section[] =
    pinned.length > 0
      ? [
          { title: 'Pinned', data: pinned },
          { title: 'Others', data: others },
        ]
      : [{ title: 'Notes', data: others }];

  const Empty = (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-xl font-semibold dark:text-white">
        Welcome to GeoNotes!
      </Text>
      <Text className="mb-4 text-center text-slate-600">
        Tap + to create your first note.
      </Text>
    </View>
  );

  const renderItem = ({ item }: SectionListRenderItemInfo<TNote, Section>) => (
    <View className="mb-3">
      <Note note={item} />
    </View>
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<TNote, Section>;
  }) => (
    <View className="px-3 py-2">
      <Text className="text-xs font-semibold uppercase text-slate-500">
        {section.title}
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      {loading && notes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-slate-600">Loading…</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            padding: 12,
            paddingBottom: 24,
            flexGrow: sections[0].data.length ? 0 : 1,
          }}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={Empty}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
            />
          }
        />
      )}
      <CreateButton onPress={() => router.push('/create')} />
    </View>
  );
}
