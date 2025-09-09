import React from 'react';
import { Text, View } from 'react-native';

const EmptyListScreen = () => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-xl font-semibold dark:text-white">
        Welcome to GeoNotes!
      </Text>
      <Text className="mb-4 text-center text-slate-600">
        Tap + to create your first note.
      </Text>
    </View>
  );
};

export default EmptyListScreen;
