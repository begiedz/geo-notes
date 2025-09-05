export type Note = {
  id: string;
  title: string;
  body: string;
  photo_uri: string;
  created_at: number;
  lat: number | null;
  lon: number | null;
  address: string | null;
};
