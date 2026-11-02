const assert = require('node:assert/strict');
const test = require('node:test');
const { isAllowedOrigin } = require('../config/cors');

test('allows localhost development origins on Vite fallback ports', () => {
  assert.equal(isAllowedOrigin('http://localhost:5174'), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:5174'), true);
  assert.equal(isAllowedOrigin('http://[::1]:5174'), true);
});

test('continues to allow configured and deployed frontend origins', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173'), true);
  assert.equal(isAllowedOrigin('https://railway-demo.vercel.app'), true);
});

test('rejects unconfigured non-local origins', () => {
  assert.equal(isAllowedOrigin('http://example.com'), false);
  assert.equal(isAllowedOrigin('https://example.org'), false);
});

test('allows requests without an Origin header', () => {
  assert.equal(isAllowedOrigin(undefined), true);
});
