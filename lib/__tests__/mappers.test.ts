import { DbRow, Note } from '@/types';
import { describe, expect, it } from 'vitest';
import { fromDbRow, toDbParams } from '../mappers';

describe('mappers', () => {
  it('fromDbRow converts latitude/longitude to coordinates (and nulls correctly)', () => {
    const row: DbRow = {
      id: '1',
      title: 'T',
      body: 'B',
      photo_uri: 'file://x',
      created_at: 123,
      latitude: 52.10001,
      longitude: 5.12001,
      address: 'Utrecht',
    };
    const note = fromDbRow(row);
    expect(note).toMatchObject({
      id: '1',
      title: 'T',
      body: 'B',
      photo_uri: 'file://x',
      created_at: 123,
      address: 'Utrecht',
    });
    expect(note.coordinates).toEqual({
      latitude: 52.10001,
      longitude: 5.12001,
    });

    const rowNoCoords = { ...row, latitude: null, longitude: null };
    const noteNoCoords = fromDbRow(rowNoCoords as any);
    expect(noteNoCoords.coordinates).toBeNull();
  });

  it('toDbParams flattens Note to named SQLite params', () => {
    const note: Note = {
      id: 'n1',
      title: 'hello',
      body: 'body',
      photo_uri: 'file://y',
      created_at: 999,
      coordinates: { latitude: 1, longitude: 2 },
      address: null,
    };
    const params = toDbParams(note);
    expect(params).toEqual({
      $id: 'n1',
      $title: 'hello',
      $body: 'body',
      $photo_uri: 'file://y',
      $created_at: 999,
      $latitude: 1,
      $longitude: 2,
      $address: null,
    });
  });
});
