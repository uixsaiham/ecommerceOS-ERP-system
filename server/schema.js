export const plain = value => !!value && typeof value === 'object' && !Array.isArray(value);
export function check(condition, message, status = 400) { if (!condition) throw Object.assign(new Error(message), { status }); }
