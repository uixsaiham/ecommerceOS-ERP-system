import { DatabaseSync, backup } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = process.env.COMMERCEOS_DB || resolve(root, 'data/commerceos.sqlite');
if (!existsSync(source)) { console.error('Start CommerceOS before creating a database backup.'); process.exit(1); }
const directory = resolve(root, 'backups'); mkdirSync(directory, { recursive: true });
const target = resolve(directory, `commerceos-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
const db = new DatabaseSync(source);
try { await backup(db, target); console.log(`Backup saved to ${target}`); }
finally { db.close(); }
