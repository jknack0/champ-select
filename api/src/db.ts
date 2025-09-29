import sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'

sqlite3.verbose()

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>

let dbInstance: AppDatabase | null = null

export const getDb = async (): Promise<AppDatabase> => {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await open({
    filename: process.env.SQLITE_PATH ?? 'database.sqlite',
    driver: sqlite3.Database,
  })

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  return dbInstance
}
