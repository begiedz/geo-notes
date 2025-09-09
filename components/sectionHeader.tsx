import React from 'react';
import { Text, View } from 'react-native';

const sectionHeader = ({ title }: { title: string }) => {
  return (
    <View className="px-3 py-2">
      <Text className="text-xs font-semibold uppercase text-slate-500">
        {title}
      </Text>
    </View>
  );
};
export default sectionHeader;
