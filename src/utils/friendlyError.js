/**
 * @file friendlyError.js
 * @description Database error parser to provide clear, actionable user-facing messages.
 */

/** Turns a database error into a message a visitor can act on. */
export function friendlyError(err) {
  const msg = (err && err.message) || String(err || '');
  if ((err && err.code === '23514') || /violates check constraint/i.test(msg)) {
    return 'Some of the text is too long. Please shorten it and try again.';
  }
  return msg;
}
