import { DbRow, Note } from '@/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteNote,
  getNote,
  getNotes,
  initDb,
  insertNote,
  updateNote,
} from '../db';

// sqlite mocked as Map
vi.mock('expo-sqlite', () => {
  const store = new Map<string, DbRow>();

  // ignore schema creation
  const api = {
    execAsync: async (_sql: string) => {},

    runAsync: async (sql: string, params?: any) => {
      if (sql.includes('INSERT INTO notes')) {
        const row: DbRow = {
          id: params.$id,
          title: params.$title,
          body: params.$body,
          photo_uri: params.$photo_uri,
          created_at: params.$created_at,
          latitude: params.$latitude ?? null,
          longitude: params.$longitude ?? null,
          address: params.$address ?? null,
        };
        store.set(row.id, row);
        return { changes: 1 };
      }

      if (sql.includes('UPDATE notes')) {
        const id = params.$id;
        const row = store.get(id);
        if (!row) return { changes: 0 };
        row.title = params.$title;
        row.body = params.$body;
        row.photo_uri = params.$photo_uri;
        row.address = params.$address ?? null;
        row.latitude = params.$latitude ?? null;
        row.longitude = params.$longitude ?? null;
        store.set(id, row);
        return { changes: 1 };
      }

      if (sql.includes('DELETE FROM notes')) {
        const id = Array.isArray(params) ? params[0] : params?.$id;
        store.delete(id);
        return { changes: 1 };
      }

      throw new Error('Unsupported SQL in mock: ' + sql);
    },

    getFirstAsync: async (sql: string, params?: any) => {
      if (sql.includes('FROM notes') && sql.includes('WHERE id')) {
        const id = params[0];
        return store.get(id) ?? null;
      }
      throw new Error('Unsupported SQL in mock: ' + sql);
    },

    getAllAsync: async (_sql: string) => {
      const rows = Array.from(store.values()).sort(
        (a, b) => b.created_at - a.created_at,
      );
      return rows;
    },

    _reset: () => store.clear(),
  };

  return { openDatabaseSync: () => api };
});

const NOTE_1: Note = {
  id: '1',
  title: 'A',
  body: 'B',
  photo_uri: 'file://1',
  created_at: 1,
  coordinates: { latitude: 52.1, longitude: 5.1 },
  address: 'Utrecht',
};

const NOTE_2: Note = {
  id: '2',
  title: 'C',
  body: 'D',
  photo_uri: 'file://2',
  created_at: 2,
  coordinates: null,
  address: null,
};

describe('db', () => {
  beforeEach(async () => {
    const sqlite: any = await import('expo-sqlite');
    sqlite.openDatabaseSync()._reset();
    await initDb();
  });

  it('inserts and returns notes sorted by created_at DESC', async () => {
    await insertNote(NOTE_1);
    await insertNote(NOTE_2);

    const all = await getNotes();
    expect(all.map(n => n.id)).toEqual(['2', '1']);
  });

  it('getNote returns a note by id', async () => {
    await insertNote(NOTE_1);

    const got = await getNote('1');
    expect(got?.id).toBe('1');
    expect(got?.coordinates).toEqual({ latitude: 52.1, longitude: 5.1 });
  });

  it('updateNote changes fields and can clear coordinates/address', async () => {
    await insertNote(NOTE_1);

    await updateNote({
      ...NOTE_1,
      title: 'A2',
      coordinates: null,
      address: null,
    });

    const updated = await getNote('1');
    expect(updated?.title).toBe('A2');
    expect(updated?.coordinates).toBeNull();
    expect(updated?.address).toBeNull();
  });

  it('deleteNote removes the note', async () => {
    await insertNote(NOTE_1);
    await deleteNote('1');

    const after = await getNote('1');
    expect(after).toBeNull();
  });
});
