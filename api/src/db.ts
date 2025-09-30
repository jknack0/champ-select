import sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'

sqlite3.verbose()

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>

let dbInstance: AppDatabase | null = null

const DEFAULT_CHAMPIONS: Array<{ id: string; name: string; image_url: string; role?: string | null; tags?: string[] }> = [
  { id: 'ahri', name: 'Ahri', image_url: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Ahri.png' },
  { id: 'leesin', name: 'Lee Sin', image_url: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/LeeSin.png' },
  { id: 'amumu', name: 'Amumu', image_url: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Amumu.png' },
  { id: 'yasuo', name: 'Yasuo', image_url: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Yasuo.png' },
  { id: 'lillia', name: 'Lillia', image_url: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Lillia.png' },
]

const seedChampionsIfNeeded = async (db: AppDatabase) => {
  const row = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM champions')
  if (row?.count) {
    return
  }

  const insert = await db.prepare(
    `INSERT INTO champions (id, name, image_url, role, tags)
     VALUES (?, ?, ?, ?, ?)`,
  )

  try {
    for (const champion of DEFAULT_CHAMPIONS) {
      await insert.run(
        champion.id,
        champion.name,
        champion.image_url,
        champion.role ?? null,
        champion.tags && champion.tags.length > 0 ? JSON.stringify(champion.tags) : null,
      )
    }
  } finally {
    await insert.finalize()
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

  await seedChampionsIfNeeded(dbInstance)

  return dbInstance
}
