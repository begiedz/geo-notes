import Note from '@/components/note';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

export default function Index() {
  const [notes, setNotes] = useState([1, 2, 3]);
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
