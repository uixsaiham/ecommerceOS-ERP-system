import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { Store } from '../server/store.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const [email, name, role = 'admin'] = process.argv.slice(2);
if (!email || !name || !process.env.COMMERCEOS_USER_PASSWORD) {
  console.error('Usage: COMMERCEOS_USER_PASSWORD=<password> npm run user:create -- <email> "<name>" [role]');
  console.error('Use a password of at least 12 characters. Passwords are never printed or stored in plain text.');
  process.exit(1);
}
const store = new Store(process.env.COMMERCEOS_DB || resolve(root, 'data/commerceos.sqlite'), root);
try {
  const user = store.createUser({ email, name, role, password: process.env.COMMERCEOS_USER_PASSWORD });
  console.log(`Created ${user.email} (${user.role}).`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { store.close(); }
