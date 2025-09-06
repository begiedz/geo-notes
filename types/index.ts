export type Coordinates = {
  latitude: number | null;
  longitude: number | null;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  photo_uri: string;
  created_at: number;
  coordinates: Coordinates | null;
  address: string | null;
};
