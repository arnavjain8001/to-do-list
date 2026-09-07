import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');

let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        task_date TEXT NOT NULL,
        task_time TEXT DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'Medium',
        category TEXT DEFAULT 'Personal',
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT DEFAULT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        sound_enabled INTEGER NOT NULL DEFAULT 1,
        default_priority TEXT DEFAULT 'Medium',
        default_time TEXT DEFAULT '',
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Schema migrations for existing databases
    const taskColumns = await dbInstance.all(`PRAGMA table_info(tasks)`);
    const hasUserIdInTasks = taskColumns.some(col => col.name === 'user_id');
    if (!hasUserIdInTasks) {
      await dbInstance.exec(`ALTER TABLE tasks ADD COLUMN user_id INTEGER;`);
    }

    const settingsColumns = await dbInstance.all(`PRAGMA table_info(settings)`);
    const hasUserIdInSettings = settingsColumns.some(col => col.name === 'user_id');
    if (!hasUserIdInSettings) {
      await dbInstance.exec(`ALTER TABLE settings ADD COLUMN user_id INTEGER;`);
    }
  }

  return dbInstance;
}
