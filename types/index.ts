export type NoteBase = {
  id: string;
  title: string;
  body: string;
  photo_uri: string;
  created_at: number;
  address: string | null;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Note = NoteBase & {
  coordinates: Coordinates | null;
};

export type DbRow = NoteBase & {
  latitude: number | null;
  longitude: number | null;
};

export type Section = { title: string; data: Note[] };
