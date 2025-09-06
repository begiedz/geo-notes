import type { Coordinates } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export function formatAddress(address?: Location.LocationGeocodedAddress) {
  if (!address) return '';
  const parts = [
    address.name,
    address.street,
    address.postalCode,
    address.city || address.subregion,
    address.region,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export async function pickImageFromCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (permission.status !== 'granted') {
    alert('Camera permission denied');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    quality: 0.7,
    mediaTypes: 'images',
  });
  return !result.canceled && result.assets?.[0]?.uri
    ? result.assets[0].uri
    : null;
}

export async function pickImageFromLibrary() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== 'granted') {
    alert('Library permission denied');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 0.7,
    mediaTypes: 'images',
  });
  return !result.canceled && result.assets?.[0]?.uri
    ? result.assets[0].uri
    : null;
}

export async function getCurrentCoordinatesAndAddress(): Promise<{
  coordinates: Coordinates;
  address: string | null;
}> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('Location permission denied');
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const coordinates: Coordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  try {
    const reverse = await Location.reverseGeocodeAsync(coordinates);
    return { coordinates, address: formatAddress(reverse[0]) || null };
  } catch {
    return { coordinates, address: null };
  }
}

export function getFileExtensionFromUri(uri: string) {
  const clean = uri.split('?')[0];
  const lastDot = clean.lastIndexOf('.');
  const lastSlash = clean.lastIndexOf('/');
  if (lastDot > lastSlash && lastDot !== -1) return clean.slice(lastDot);
  return '.jpg';
}

export async function saveImageToDocumentDirectory(
  sourceImageUri: string,
  filename: string,
) {
  const directory = FileSystem.documentDirectory!;
  const destination = `${directory}${filename}`;
  await FileSystem.copyAsync({ from: sourceImageUri, to: destination });
  return destination;
}

export async function replaceImageInDocumentDirectory(params: {
  newImageSourceUri: string;
  filenamePrefix: string;
  previousImageUri?: string | null;
}) {
  const { newImageSourceUri, filenamePrefix, previousImageUri } = params;
  const directory = FileSystem.documentDirectory!;
  if (newImageSourceUri.startsWith(directory)) {
    return newImageSourceUri;
  }
  if (
    previousImageUri?.startsWith(directory) &&
    previousImageUri !== newImageSourceUri
  ) {
    try {
      await FileSystem.deleteAsync(previousImageUri, { idempotent: true });
    } catch {}
  }
  const extension = getFileExtensionFromUri(newImageSourceUri);
  const destination = `${directory}${filenamePrefix}-${Date.now()}${extension}`;
  await FileSystem.copyAsync({ from: newImageSourceUri, to: destination });
  return destination;
}
