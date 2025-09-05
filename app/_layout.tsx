import './global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['bottom']}
      >
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: 'GeoNotes' }}
          />
          <Stack.Screen
            name="create"
            options={{ title: 'New note' }}
          />
          <Stack.Screen
            name="note/[id]"
            options={{ title: 'Note' }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </>
  );
}
