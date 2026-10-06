import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { token, digest, hashPassword, verifyPassword } from './auth.js';
import { check } from './schema.js';
export class Store {
  constructor(filename) {
    if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);`);
  }
  close() { this.db.close(); }
  raw(resource, id) {
    if (!this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='records'").get()) return null;
    const row = this.db.prepare('SELECT data FROM records WHERE resource=? AND id=? AND deleted=0').get(resource, id);
    return row ? JSON.parse(row.data) : null;
  }
  startPage() { return '/dashboard-preview/Main.dc.html'; }
  createUser({ email, name, password, role = 'admin' }) {
    email = String(email || '').trim().toLowerCase();
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email address.');
    check(typeof name === 'string' && name.trim().length > 0 && name.length <= 120, 'Enter a name.');
    check(['owner', 'admin', 'ops', 'finance', 'marketing', 'sales', 'support', 'readonly'].includes(role), 'Unsupported account role.');
    check(!this.db.prepare('SELECT id FROM users WHERE email=?').get(email), 'An account already uses this email.', 409);
    const user = { id: `ACC-${token().slice(0, 16)}`, email, name: name.trim(), role };
    this.db.prepare('INSERT INTO users(id,email,name,password_hash,role,created_at) VALUES(?,?,?,?,?,?)')
      .run(user.id, user.email, user.name, hashPassword(password), role, Date.now());
    return user;
  }
  login(email, password) {
    const account = this.db.prepare('SELECT * FROM users WHERE email=? AND active=1').get(String(email || '').trim().toLowerCase());
    // Run scrypt for unknown users too, keeping failure behavior consistent.
    const encoded = account?.password_hash || '0123456789abcdef0123456789abcdef:' + '00'.repeat(64);
    check(verifyPassword(password, encoded) && account, 'Email or password is incorrect.', 401);
    const team = this.raw('team', account.id);
    check(!team || team.status === 'active', 'This account is not active.', 403);
    const secret = token(), csrf = token();
    this.db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());
    this.db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(digest(secret), account.id, csrf, Date.now() + 43200000);
    const user = { id: account.id, email: account.email, name: team?.name || account.name, role: team?.role || account.role };

    return { secret, csrf, user };
  }
  session(secret) {
    if (!secret) return null;
    const row = this.db.prepare(`SELECT u.id,u.email,u.name,u.role,s.csrf,s.expires_at,s.token_hash AS session_hash FROM sessions s
      JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1`).get(digest(secret), Date.now());
    if (!row) return null;
    const team = this.raw('team', row.id);
    if (team && team.status !== 'active') return null;
    // The team page is authoritative for role edits.
    if (team?.role) row.role = team.role;
    if (team?.name) row.name = team.name;
    return row;
  }
  logout(secret) { this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(secret)); }
}
