import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Notes',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'New Note',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
