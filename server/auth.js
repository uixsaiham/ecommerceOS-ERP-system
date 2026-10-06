import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { check } from './schema.js';

export const token = () => randomBytes(32).toString('hex');
export const digest = value => createHash('sha256').update(value).digest('hex');
export function hashPassword(password) {
  check(typeof password === 'string' && password.length >= 12 && password.length <= 256, 'Use a password between 12 and 256 characters.');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const [salt, expected] = encoded.split(':');
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
export function cookieSession(request) {
  return (request.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('commerceos_session='))?.slice(19) || '';
}
export function sessionCookie(value, secure = false, clear = false) {
  return `commerceos_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : 43200}${secure ? '; Secure' : ''}`;
}
