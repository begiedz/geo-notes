import type { Note } from '@/types';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('geonotes.db');

// init db once - at app start
export async function initDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      photo_uri TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      lat REAL,
      lon REAL,
      address TEXT
    );
  `);
}

export async function insertNote(note: Note): Promise<void> {
  await db.runAsync(
    `INSERT INTO notes (id, title, body, photo_uri, created_at, lat, lon, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.title,
      note.body,
      note.photo_uri,
      note.created_at,
      note.lat,
      note.lon,
      note.address,
    ],
  );
}

export async function getNotes(): Promise<Note[]> {
  return db.getAllAsync<Note>(`SELECT * FROM notes ORDER BY created_at DESC`);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const result = await db.getFirstAsync<Note>(
    `SELECT * FROM notes WHERE id = ? LIMIT 1`,
    [id],
  );
  return result === null ? undefined : result;
}

export async function deleteNote(id: string): Promise<void> {
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}
