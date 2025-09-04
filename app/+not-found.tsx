import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-white">
        <Text>This screen does not exist.</Text>
        <Link
          href="/"
          className="underline text-blue-500 mt-4"
        >
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
