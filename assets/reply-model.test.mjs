import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHandover, normalise, REPLY_VERSION } from './reply-model.mjs';

const full = { item: 'PX-40', wanted: 12, byDate: 'Friday', listed: 8, price: 120, leadDays: 10, freight: 'not-quoted', currency: 'EUR' };
const text = h => [...h.draft, ...h.checks.map(c => c.value)].join(' | ');

test('the requested date is never promised, even when everything else is known', () => {
  const h = buildHandover({ ...full, freight: 'quoted' });
  assert.ok(h.refusals.some(r => r.wont.includes('Friday')));
  assert.ok(!/by Friday\./.test(h.draft.join(' ')));
  assert.ok(h.decisions.some(d => d.what.includes('Friday')));
});

test('a missing price produces no price anywhere, and a decision instead', () => {
  const h = buildHandover({ ...full, price: null });
  assert.ok(!/[€$£]/.test(text(h)), 'no currency may appear');
  assert.ok(h.refusals.some(r => r.wont === 'a price'));
  assert.ok(h.decisions.some(d => d.what.includes('approved price')));
});

test('a missing stock figure refuses availability rather than guessing it', () => {
  const h = buildHandover({ ...full, listed: null });
  assert.ok(h.refusals.some(r => r.wont.includes('available')));
  assert.ok(!/stock sheet lists/.test(h.draft.join(' ')));
});

test('unquoted freight forbids a delivered total but still allows the subtotal', () => {
  const h = buildHandover(full);
  const sub = h.checks.find(c => c.label === 'Product subtotal');
  assert.match(sub.value, /8 x €120 = €960, excluding tax and freight, which is not quoted/);
  assert.ok(h.refusals.some(r => r.wont === 'a delivered total'));
});

test('quoted freight removes that refusal', () => {
  const h = buildHandover({ ...full, freight: 'quoted' });
  assert.ok(!h.refusals.some(r => r.wont === 'a delivered total'));
});

test('the subtotal never prices more units than are listed', () => {
  const h = buildHandover(full);
  assert.match(h.checks.find(c => c.label === 'Product subtotal').value, /^8 x /);
});

test('a gap with no lead time is refused, with a lead time it is stated as indicated', () => {
  const a = buildHandover({ ...full, leadDays: null });
  assert.ok(a.refusals.some(r => r.wont.includes('lead time')));
  const b = buildHandover(full);
  assert.match(b.draft.join(' '), /remaining 4 have an indicated lead time of 10 working days, subject to confirmation/);
});

test('payment instructions are refused in every configuration', () => {
  for (const v of [full, {}, { ...full, freight: 'quoted', byDate: '' }]) {
    assert.ok(buildHandover(v).refusals.some(r => r.wont === 'payment instructions'));
  }
});

test('hostile input is clamped, not trusted', () => {
  const i = normalise({ item: '<b>x</b>'.repeat(50), wanted: -5, price: 'abc', freight: 'nope', currency: 'XXX' });
  assert.equal(i.item.length, 40);
  assert.equal(i.wanted, null);
  assert.equal(i.price, null);
  assert.equal(i.freight, 'unknown');
  assert.equal(i.currency, 'EUR');
});

test('an empty form still returns a usable, honest handover', () => {
  const h = buildHandover({});
  assert.ok(h.refusals.length >= 3);
  assert.ok(h.decisions.length >= 3);
  assert.equal(h.version, REPLY_VERSION);
  assert.ok(h.unsent.includes('unsent'));
});
