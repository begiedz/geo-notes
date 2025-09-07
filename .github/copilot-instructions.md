# GitHub Copilot – repository instructions

You are assisting in a React Native + Expo project called **GeoNotes**. Your priorities:

## Goals

- MVP first: create/edit/delete notes with photo + location + address.
- Keep code explicit and boring. No magic abstractions.
- Strong typing (TypeScript), predictable modules, small files.

## Stack

- Expo SDK (React Native), `expo-router`.
- Data layer: SQLite via `expo-sqlite` with thin query helpers.
- Image picking: `expo-image-picker`. Location: `expo-location`.
- Unit tests: **Vitest** for mappers and DB helpers.
- Styling via NativeWind.

## Conventions

- Types live in `types.ts`. DB <-> domain mapping in `lib/mappers.ts`:
  - `fromDbRow(row: DbRow): Note`
  - `toDbParams(note: Note): Record<string, unknown>`
- Never return `any`. Use narrow types and `as const` where helpful.
- DB: prefer parameterized SQL (`$id`, `$title`, ...). No raw string interpolation.
- Errors: throw `Error` with human‑readable messages; screens show `Alert`.

## Testing

- Unit test new mappers and DB helpers with Vitest.
- Keep tests simple and fast (pure functions, in‑memory or mocked DB).

## Copilot DOs

- Propose small, focused functions. Name things clearly.
