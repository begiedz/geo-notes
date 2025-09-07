import { getNote, updateNote } from '@/lib/db';
import {
  getCurrentCoordinatesAndAddress,
  pickImageFromCamera,
  pickImageFromLibrary,
  replaceImageInDocumentDirectory,
} from '@/lib/utils';
import { isPinned, setPinned } from '@/lib/utils/pins';
import type { Coordinates, Note } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

export default function EditNote() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photoUri, setPhotoUri] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [pinned, setPinnedState] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      try {
        const existing = await getNote(id);
        if (!existing) {
          Alert.alert('Not found');
          return;
        }
        setNote(existing);
        setTitle(existing.title);
        setBody(existing.body);
        setPhotoUri(existing.photo_uri);
        setCoordinates(existing.coordinates);
        setAddress(existing.address);
        setPinnedState(await isPinned(existing.id));
      } catch (error: any) {
        Alert.alert('Error', error?.message ?? String(error));
      }
    })();
  }, [id]);

  const onPickFromCamera = async () => {
    const imageUri = await pickImageFromCamera();
    if (imageUri) setPhotoUri(imageUri);
  };

  const onPickFromLibrary = async () => {
    const imageUri = await pickImageFromLibrary();
    if (imageUri) setPhotoUri(imageUri);
  };

  const onUseCurrentLocation = async () => {
    try {
      const result = await getCurrentCoordinatesAndAddress();
      setCoordinates(result.coordinates);
      setAddress(result.address);
    } catch (error: any) {
      Alert.alert('Permission denied', error?.message ?? String(error));
    }
  };

  const onClearLocation = () => {
    setCoordinates(null);
    setAddress(null);
  };

  const onTogglePin = async () => {
    if (!note) return;
    const next = !pinned;
    await setPinned(note.id, next);
    setPinnedState(next);
  };

  const onSave = async () => {
    if (!note) return;
    if (!title.trim()) {
      Alert.alert('Validation', 'Title cannot be empty.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Validation', 'Photo is required.');
      return;
    }

    const finalPhotoUri = await replaceImageInDocumentDirectory({
      newImageSourceUri: photoUri,
      filenamePrefix: note.id,
      previousImageUri: note.photo_uri,
    });

    try {
      await updateNote({
        id: note.id,
        title: title.trim(),
        body,
        photo_uri: finalPhotoUri,
        address: (address || '').trim() ? (address as string).trim() : null,
        coordinates,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? String(error));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit note',
          headerRight: () => (
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={onTogglePin}
                className={`rounded-xl px-3 py-1.5 border ${
                  pinned
                    ? 'border-amber-500 dark:border-amber-400'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name={pinned ? 'star' : 'star-outline'}
                    size={16}
                    color={
                      pinned
                        ? isDark
                          ? '#fbbf24'
                          : '#f59e0b' // amber-400/500
                        : isDark
                          ? '#e5e7eb'
                          : '#0f172a' // slate-200 / slate-900
                    }
                  />
                  <Text className="dark:text-white">
                    {pinned ? 'Pinned' : 'Pin'}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={onSave}
                className="rounded-xl bg-blue-600 px-3 py-1.5"
              >
                <Text className="font-semibold text-white">Save</Text>
              </Pressable>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4">
            <Text className="mb-2 text-xs text-slate-500">Photo</Text>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                className="h-48 w-full rounded-xl"
              />
            ) : (
              <View className="h-48 w-full items-center justify-center rounded-xl border border-dashed border-slate-400">
                <Text className="text-slate-500">No photo</Text>
              </View>
            )}
            <View className="mt-2 flex-row gap-2">
              <Pressable
                onPress={onPickFromCamera}
                className="flex-1 items-center rounded-xl bg-blue-600 p-3"
              >
                <Text className="font-semibold text-white">Take photo</Text>
              </Pressable>
              <Pressable
                onPress={onPickFromLibrary}
                className="flex-1 items-center rounded-xl bg-blue-100 p-3"
              >
                <Text className="font-semibold text-blue-700">Choose</Text>
              </Pressable>
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-xs text-slate-500">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              className="rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:text-white"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-xs text-slate-500">Body</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Write your note..."
              multiline
              scrollEnabled={true}
              textAlignVertical="top"
              className="min-h-40 rounded-xl border border-slate-300 p-3 dark:border-slate-700 dark:text-white"
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
          </View>

          <View className="mb-10">
            <Text className="mb-2 text-xs text-slate-500">Location</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-300">
              {coordinates
                ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                : 'No location'}
              {address ? `  •  ${address}` : ''}
            </Text>
            <View className="mt-3 flex-row gap-8">
              <Pressable
                onPress={onUseCurrentLocation}
                className="rounded-xl bg-slate-800 px-3 py-2"
              >
                <Text className="text-white">Use current location</Text>
              </Pressable>
              <Pressable
                onPress={onClearLocation}
                className="rounded-xl bg-slate-600 px-3 py-2"
              >
                <Text className="text-white">Clear</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
