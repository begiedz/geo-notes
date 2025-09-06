import * as SQLite from 'expo-sqlite';
import type { Note } from '../types';
import { fromDbRow, toDbParams } from './mappers';

const db = SQLite.openDatabaseSync('geonotes_v2.db');

// init db once - at app start
export async function initDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      photo_uri TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      latitude REAL,
      longitude REAL,
      address TEXT
    );
  `);
}

export async function insertNote(note: Note): Promise<void> {
  await db.runAsync(
    `INSERT INTO notes
   (id, title, body, photo_uri, created_at, latitude, longitude, address)
   VALUES ($id, $title, $body, $photo_uri, $created_at, $latitude, $longitude, $address)`,
    toDbParams(note),
  );
}

export async function getNotes(): Promise<Note[]> {
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM notes ORDER BY created_at DESC`,
  );
  return rows.map(fromDbRow);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM notes WHERE id = ? LIMIT 1`,
    [id],
  );
  return row ? fromDbRow(row) : undefined;
}

export async function updateNote(input: {
  id: string;
  title: string;
  body: string;
  photo_uri: string;
  address: string | null;
  coordinates: { latitude: number; longitude: number } | null;
}): Promise<void> {
  await db.runAsync(
    `UPDATE notes
     SET title = $title,
         body = $body,
         photo_uri = $photo_uri,
         address = $address,
         latitude = $latitude,
         longitude = $longitude
     WHERE id = $id`,
    {
      $id: input.id,
      $title: input.title,
      $body: input.body,
      $photo_uri: input.photo_uri,
      $address: input.address ?? null,
      $latitude: input.coordinates?.latitude ?? null,
      $longitude: input.coordinates?.longitude ?? null,
    },
  );
}

export async function deleteNote(id: string): Promise<void> {
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}
