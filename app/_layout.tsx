import './global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';
  const headerBg = isDark ? '#0f172a' : '#ffffff'; // slate-900 / white
  const headerText = isDark ? '#f8fafc' : '#0f172a'; // slate-50  / slate-900
  const screenBg = isDark ? '#000000' : '#f2f2f2';
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView
        className="flex-1 dark:bg-black"
        edges={['bottom']}
      >
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: headerBg },
            headerTitleStyle: { color: headerText },
            headerTintColor: headerText,
            contentStyle: { backgroundColor: screenBg },
          }}
        >
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
