import Dexie, { type Table } from 'dexie';

export interface SaveSlotRow {
  id: string;
  updatedAt: number;
  payload: string;
}

class LuminaGuardianDB extends Dexie {
  saves!: Table<SaveSlotRow, string>;

  constructor() {
    super('LuminaGuardian108DB');
    this.version(1).stores({
      saves: 'id, updatedAt',
    });
  }
}

export const gameDb = new LuminaGuardianDB();

const SAVE_KEY = 'primary_profile_v1';

export async function saveGameSnapshot(data: unknown): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    await gameDb.saves.put({
      id: SAVE_KEY,
      updatedAt: Date.now(),
      payload: serialized,
    });
    try {
      localStorage.setItem('lumina_guardian_backup_v1', serialized);
    } catch {
      // ignore quota errors
    }
  } catch {
    try {
      localStorage.setItem('lumina_guardian_backup_v1', JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

export async function loadGameSnapshot<T>(): Promise<T | null> {
  try {
    const row = await gameDb.saves.get(SAVE_KEY);
    if (row?.payload) {
      return JSON.parse(row.payload) as T;
    }
  } catch {
    // fallback to localStorage
  }
  try {
    const raw = localStorage.getItem('lumina_guardian_backup_v1');
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function clearGameSnapshot(): Promise<void> {
  try {
    await gameDb.saves.delete(SAVE_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem('lumina_guardian_backup_v1');
  } catch {
    // ignore
  }
}
