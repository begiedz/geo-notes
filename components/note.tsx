import { Note as TNote } from '@/types';
import { Link, RelativePathString } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const Note = ({ note }: { note: TNote }) => {
  return (
    <Link
      href={`/note/${note.id}` as RelativePathString}
      asChild
    >
      <Pressable className="flex-row items-center rounded-2xl border border-slate-200 bg-white p-12px p-3">
        <Image
          source={{ uri: note.photo_uri }}
          className="h-12 w-12 rounded-lg"
        />

        <View className="mx-3 flex-1">
          <Text
            className="text-base font-semibold"
            numberOfLines={1}
          >
            {note.title}
          </Text>
          <Text
            className="text-xs text-slate-500"
            numberOfLines={1}
          >
            {new Date(note.created_at).toLocaleString()} •{' '}
            {note.address ?? 'No address'}
          </Text>
        </View>
        <Text className="text-xl text-slate-400">›</Text>
      </Pressable>
    </Link>
  );
};

export default Note;
