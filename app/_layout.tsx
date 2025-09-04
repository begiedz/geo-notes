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
        edges={['top', 'bottom']}
      >
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </>
  );
}
