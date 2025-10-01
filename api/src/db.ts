import sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'
import path from 'path'
import fs from 'fs/promises'

sqlite3.verbose()

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>

let dbInstance: AppDatabase | null = null


const loadChampionSeedData = async (): Promise<Array<{ id: string; name: string; imageUrl: string; role?: string | null; tags?: string[] }>> => {
  try {
    const compiledPath = path.resolve(__dirname, 'data', 'champions.json')
    const sourcePath = path.resolve(process.cwd(), 'api', 'src', 'data', 'champions.json')

    for (const candidate of [compiledPath, sourcePath]) {
      try {
        const file = await fs.readFile(candidate, 'utf-8')
        return JSON.parse(file)
      } catch (error) {
        // ignore and try the next candidate
      }
    }
  } catch (error) {
    console.warn('Unable to load champion seed data', error)
  }

  return []
}

const syncChampionsCatalog = async (db: AppDatabase) => {
  const champions = await loadChampionSeedData()
  if (champions.length === 0) {
    return
  }

  for (const champion of champions) {
    const normalizedId = champion.id.trim().toLowerCase()
    const tagsValue = champion.tags && champion.tags.length > 0 ? JSON.stringify(champion.tags) : null

    const existing = await db.get('SELECT id FROM champions WHERE id = ?', normalizedId)

    if (!existing) {
      await db.run(
        `INSERT INTO champions (id, name, image_url, role, tags) VALUES (?, ?, ?, ?, ?)`,
        normalizedId,
        champion.name,
        champion.imageUrl,
        champion.role ?? null,
        tagsValue,
      )
    } else {
      await db.run(
        `UPDATE champions
           SET name = ?,
               image_url = ?,
               role = ?,
               tags = ?,
               updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        champion.name,
        champion.imageUrl,
        champion.role ?? null,
        tagsValue,
        normalizedId,
      )
    }
  }
}

const ensureColumn = async (db: AppDatabase, table: string, column: string, definition: string) => {
  const columns: Array<{ name: string }> = await db.all(`PRAGMA table_info(${table})`)
  if (!columns.some((col) => col.name === column)) {
    await db.run(`ALTER TABLE ${table} ADD COLUMN ${definition}`)
  }
}

export const getDb = async (): Promise<AppDatabase> => {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await open({
    filename: process.env.SQLITE_PATH ?? 'database.sqlite',
    driver: sqlite3.Database,
  })

  await dbInstance.exec('PRAGMA foreign_keys = ON;')

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await ensureColumn(dbInstance, 'users', 'display_name', 'display_name TEXT')
  await ensureColumn(dbInstance, 'users', 'role', "role TEXT NOT NULL DEFAULT 'admin'")
  await ensureColumn(dbInstance, 'users', 'updated_at', "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP")
  await ensureColumn(dbInstance, 'users', 'last_login_at', 'last_login_at TEXT')

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS champions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      role TEXT,
      tags TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rosters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roster_champions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roster_id INTEGER NOT NULL,
      champion_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roster_id) REFERENCES rosters(id) ON DELETE CASCADE,
      FOREIGN KEY (champion_id) REFERENCES champions(id) ON DELETE CASCADE,
      UNIQUE (roster_id, champion_id),
      UNIQUE (roster_id, position)
    );

    CREATE TABLE IF NOT EXISTS donation_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id INTEGER NOT NULL UNIQUE,
      streamlabs_url TEXT,
      default_amount REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS streamlabs_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id INTEGER NOT NULL UNIQUE,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_rosters_owner ON rosters(owner_user_id);
    CREATE INDEX IF NOT EXISTS idx_roster_champions_roster ON roster_champions(roster_id);
    CREATE INDEX IF NOT EXISTS idx_roster_champions_champion ON roster_champions(champion_id);
  `)

  await syncChampionsCatalog(dbInstance)

  return dbInstance
}
