import type { Coordinates, DbRow, Note } from '../types';

export function fromDbRow(row: DbRow): Note {
  const coordinates: Coordinates | null =
    row.latitude != null && row.longitude != null
      ? { latitude: row.latitude, longitude: row.longitude }
      : null;

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    photo_uri: row.photo_uri,
    created_at: row.created_at,
    coordinates,
    address: row.address,
  };
}

export function toDbParams(note: Note) {
  return {
    $id: note.id,
    $title: note.title,
    $body: note.body,
    $photo_uri: note.photo_uri,
    $created_at: note.created_at,
    $latitude: note.coordinates?.latitude ?? null,
    $longitude: note.coordinates?.longitude ?? null,
    $address: note.address ?? null,
  };
}
