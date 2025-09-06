import { Coordinates } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { RelativePathString, router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { v7 as uuidv7 } from 'uuid';
import { insertNote } from '../lib/db';

export default function Create() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const firstFocus = useRef(true);

  const resetForm = useCallback(() => {
    setTitle('');
    setBody('');
    setImgUri(null);
    setCoords(null);
    setAddress(null);
    setSaving(false);
  }, []);

  // clear the form only when the screen is entered again,
  // not when temporary modals (camera/library) return
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) resetForm();
      firstFocus.current = false;

      // when leaving the screen, arm the next entry to reset
      return () => {
        firstFocus.current = true;
      };
    }, [resetForm]),
  );

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Camera permission denied');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setImgUri(res.assets[0].uri);
  }

  async function pickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Library permission denied');
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled) setImgUri(res.assets[0].uri);
  }

  async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Location permission denied');

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    setCoords({ latitude: lat, longitude: lon });

    try {
      const rev = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });

      const human = rev[0]
        ? [rev[0].name, rev[0].city || rev[0].subregion, rev[0].country]
            .filter(Boolean)
            .join(', ')
        : null;
      setAddress(human);
    } catch {
      setAddress(null);
    }
  }

  async function save() {
    if (!title.trim()) return Alert.alert('Title required');
    if (!imgUri) return Alert.alert('Add a photo');
    if (!coords) return Alert.alert('Add your current location');

    setSaving(true);
    try {
      const id = uuidv7();
      const dest = `${FileSystem.documentDirectory}${id}.jpg`;
      await FileSystem.copyAsync({ from: imgUri, to: dest });

      await insertNote({
        id,
        title: title.trim(),
        body: body.trim(),
        photo_uri: dest,
        created_at: Date.now(),
        coordinates: coords,
        address: address ?? null,
      });

      console.log(
        id,
        title,
        body,
        dest,
        Date.now(),
        coords?.latitude,
        coords?.longitude,
        address,
      );

      router.push(`/note/${id}` as RelativePathString);
    } catch (e: any) {
      Alert.alert('Failed to save note', e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 p-4">
      <TextInput
        placeholder="Note title"
        value={title}
        onChangeText={setTitle}
        className="mb-3 rounded-xl border border-slate-500 dark:text-white px-3 py-2 text-base placeholder:text-slate-500"
      />

      {imgUri ? (
        <Image
          source={{ uri: imgUri }}
          className="mb-3 h-48 w-full rounded-xl"
        />
      ) : (
        <View className="mb-3 h-48 w-full items-center justify-center rounded-xl border border-dashed border-slate-500">
          <Text className="text-slate-500">No image selected</Text>
        </View>
      )}

      <View className="mb-3 flex-row gap-2">
        <Pressable
          onPress={pickFromCamera}
          className="flex-1 items-center rounded-xl bg-blue-600 dark:bg-blue-700 p-3"
        >
          <Text className="font-semibold text-white">Take photo</Text>
        </Pressable>
        <Pressable
          onPress={pickFromLibrary}
          className="flex-1 items-center rounded-xl bg-blue-100 dark:bg-blue-300 p-3"
        >
          <Text className="font-semibold text-blue-700">Choose</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={getCurrentLocation}
        className="mb-3 items-center rounded-xl bg-emerald-600 dark:bg-emerald-700 p-3"
      >
        <Text className="font-semibold text-white">Use current location</Text>
      </Pressable>

      <Text className="mb-2 text-sm text-slate-00">
        {coords
          ? `${coords.latitude!.toFixed(5)}, ${coords.longitude!.toFixed(5)}`
          : 'Location not set'}
        {address ? `  •  ${address}` : ''}
      </Text>

      <TextInput
        placeholder="Write your note…"
        multiline
        textAlignVertical="top"
        value={body}
        onChangeText={setBody}
        className="min-h-40 rounded-xl border border-slate-500 dark:text-white px-3 py-2 text-base placeholder:text-slate-500"
      />

      <Pressable
        disabled={saving}
        onPress={save}
        className="mt-4 items-center rounded-xl bg-black dark:bg-slate-300 p-3 disabled:opacity-60"
      >
        <Text className="font-semibold text-white dark:text-black">
          {saving ? 'Saving…' : 'Save note'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
