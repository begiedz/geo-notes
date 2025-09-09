import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pinnedNotes';

async function readIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function writeIds(ids: string[]) {
  const unique = Array.from(new Set(ids));
  await AsyncStorage.setItem(KEY, JSON.stringify(unique));
}

export async function getPinnedSet(): Promise<Set<string>> {
  return new Set(await readIds());
}

export async function setPinned(
  noteId: string,
  pinned: boolean,
): Promise<Set<string>> {
  const ids = await readIds();
  const set = new Set(ids);
  if (pinned) set.add(noteId);
  else set.delete(noteId);
  await writeIds(Array.from(set));
  return set;
}

export async function isPinned(noteId: string): Promise<boolean> {
  const set = await getPinnedSet();
  return set.has(noteId);
}

export async function clearMissingPins(existingIds: string[]): Promise<void> {
  const ok = new Set(existingIds);
  const ids = await readIds();
  const filtered = ids.filter(id => ok.has(id));
  if (filtered.length !== ids.length) await writeIds(filtered);
}
