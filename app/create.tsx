import {
  getCurrentCoordinatesAndAddress,
  getFileExtensionFromUri,
  pickImageFromCamera,
  pickImageFromLibrary,
  saveImageToDocumentDirectory,
} from '@/lib/utils';
import type { Coordinates } from '@/types';
import { RelativePathString, router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import { insertNote } from '../lib/db';

export default function Create() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const firstFocusRef = useRef(true);
  const scrollRef = useRef<ScrollView>(null);

  const resetForm = useCallback(() => {
    setTitle('');
    setBody('');
    setImageUri(null);
    setCoordinates(null);
    setAddress(null);
    setSaving(false);
  }, []);

  // clear the form only when the screen is entered again,
  // not when temporary modals (camera/library) return
  useFocusEffect(
    useCallback(() => {
      if (firstFocusRef.current) resetForm();
      firstFocusRef.current = false;
      // when leaving the screen, arm the next entry to reset
      return () => {
        firstFocusRef.current = true;
      };
    }, [resetForm]),
  );

  async function onPickFromCamera() {
    const uri = await pickImageFromCamera();
    if (uri) setImageUri(uri);
  }

  async function onPickFromLibrary() {
    const uri = await pickImageFromLibrary();
    if (uri) setImageUri(uri);
  }

  async function onGetCurrentLocation() {
    try {
      const result = await getCurrentCoordinatesAndAddress();
      setCoordinates(result.coordinates);
      setAddress(result.address);
    } catch {
      Alert.alert('Location permission denied');
    }
  }

  async function onSave() {
    if (!title.trim()) {
      Alert.alert('Title required');
      return;
    }
    if (!imageUri) {
      Alert.alert('Add a photo');
      return;
    }
    if (!coordinates) {
      Alert.alert('Add your current location');
      return;
    }

    setSaving(true);
    try {
      const id = String(uuid.v4());
      const extension = getFileExtensionFromUri(imageUri);
      const destination = await saveImageToDocumentDirectory(
        imageUri,
        `${id}${extension}`,
      );

      await insertNote({
        id,
        title: title.trim(),
        body: body.trim(),
        photo_uri: destination,
        created_at: Date.now(),
        coordinates,
        address: address ?? null,
      });

      router.push(`/note/${id}` as RelativePathString);
    } catch (error: any) {
      Alert.alert('Failed to save note', error?.message ?? String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New note',
          headerRight: () => (
            <Pressable
              onPress={onSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-3 py-1.5"
            >
              <Text className="font-semibold text-white">
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
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
          className="flex-1 p-4"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            placeholder="Note title"
            value={title}
            onChangeText={setTitle}
            className="mb-3 rounded-xl border border-slate-500 dark:text-white px-3 py-2 text-base placeholder:text-slate-500"
          />

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="mb-3 h-48 w-full rounded-xl"
            />
          ) : (
            <View className="mb-3 h-48 w-full items-center justify-center rounded-xl border border-dashed border-slate-500">
              <Text className="text-slate-500">No image selected</Text>
            </View>
          )}

          <View className="mb-3 flex-row gap-2">
            <Pressable
              onPress={onPickFromCamera}
              className="flex-1 items-center rounded-xl bg-blue-600 dark:bg-blue-700 p-3"
            >
              <Text className="font-semibold text-white">Take photo</Text>
            </Pressable>
            <Pressable
              onPress={onPickFromLibrary}
              className="flex-1 items-center rounded-xl bg-blue-100 dark:bg-blue-300 p-3"
            >
              <Text className="font-semibold text-blue-700">Choose</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onGetCurrentLocation}
            className="mb-3 items-center rounded-xl bg-emerald-600 dark:bg-emerald-700 p-3"
          >
            <Text className="font-semibold text-white">
              Use current location
            </Text>
          </Pressable>

          <Text className="mb-2 text-sm text-slate-600">
            {coordinates
              ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
              : 'Location not set'}
            {address ? `  •  ${address}` : ''}
          </Text>

          <TextInput
            placeholder="Write your note…"
            multiline
            scrollEnabled={true}
            textAlignVertical="top"
            value={body}
            onChangeText={setBody}
            className="min-h-40 rounded-xl border border-slate-500 dark:text-white px-3 py-2 text-base placeholder:text-slate-500"
            onFocus={() => {
              setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
