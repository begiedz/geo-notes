import type { Coordinates, Note } from '@/types';
import * as SQLite from 'expo-sqlite';

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

function fromDbRow(row: any): Note {
  const coordinates: Coordinates | null =
    row.latitude !== null && row.longitude !== null
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

export async function insertNote(note: Note): Promise<void> {
  await db.runAsync(
    `INSERT INTO notes (id, title, body, photo_uri, created_at, latitude, longitude, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.title,
      note.body,
      note.photo_uri,
      note.created_at,
      note.coordinates?.latitude ?? null,
      note.coordinates?.longitude ?? null,
      note.address,
    ],
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

export async function deleteNote(id: string): Promise<void> {
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}
