/* MUNERON customer-reply handover. Pure functions, no I/O, no network.
   The point of this module is what it REFUSES to write. A fact that was not
   supplied never becomes a sentence in the draft; it becomes a named decision
   for a person. Every number that does appear carries the source it came from. */

export const REPLY_VERSION = 'customer-reply-v1';

export const FREIGHT = { quoted: 'Quoted', 'not-quoted': 'Not quoted', unknown: 'Not sure' };

const n = v => (v === null || v === undefined || v === '' ? null : (Number.isFinite(+v) && +v >= 0 ? +v : null));
const money = (v, c) => `${c === 'USD' ? '$' : c === 'GBP' ? '£' : '€'}${Number(v).toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
const clean = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function normalise(raw = {}) {
  return {
    item: clean(raw.item, 40) || 'the item',
    wanted: n(raw.wanted),
    byDate: clean(raw.byDate, 30),
    listed: n(raw.listed),
    price: n(raw.price),
    leadDays: n(raw.leadDays),
    freight: Object.hasOwn(FREIGHT, raw.freight) ? raw.freight : 'unknown',
    currency: ['EUR', 'USD', 'GBP'].includes(raw.currency) ? raw.currency : 'EUR'
  };
}

export function buildHandover(raw = {}) {
  const i = normalise(raw);
  const draft = [];
  const refusals = [];
  const checks = [];
  const decisions = [];

  const refuse = (wont, why) => refusals.push({ wont, why });
  const decide = (what, why) => decisions.push({ what, why });

  /* 1. availability */
  if (i.listed === null) {
    refuse(`that we have ${i.wanted === null ? 'the' : i.wanted} ${i.item} available`,
      'No stock figure was supplied, so there is nothing to state.');
    decide('Confirm what is actually on the shelf', 'The reply cannot open without it.');
  } else {
    const q = i.wanted === null ? null : i.wanted;
    draft.push(`Our latest stock sheet lists ${i.listed} ${i.item}${i.price !== null ? ` at ${money(i.price, i.currency)} each, excluding tax` : ''}. Availability still has to be reconfirmed before we commit.`);
    checks.push({ label: 'Stock on the sheet', value: `${i.listed} listed`, source: 'STOCK' });
    if (q !== null && q > i.listed) {
      const gap = q - i.listed;
      checks.push({ label: 'Quantity gap', value: `${q} requested less ${i.listed} listed = ${gap}`, source: 'STOCK' });
      if (i.leadDays === null) {
        refuse(`a lead time for the remaining ${gap}`, 'No lead time was supplied. A gap without a date is not a delivery plan.');
        decide(`Find the lead time for the remaining ${gap}`, 'The customer cannot plan without it.');
      } else {
        draft.push(`The remaining ${gap} have an indicated lead time of ${i.leadDays} working days, subject to confirmation.`);
        checks.push({ label: 'Indicated lead time', value: `${i.leadDays} working days`, source: 'SUPPLY' });
      }
    }
  }

  /* 2. price and what a subtotal is not */
  if (i.price === null) {
    refuse('a price', 'No approved price was supplied. A price a customer reads is a price they will hold you to.');
    decide('Confirm the approved price', 'Nothing priced can leave without it.');
  } else if (i.listed !== null) {
    const units = i.wanted === null ? i.listed : Math.min(i.wanted, i.listed);
    const sub = units * i.price;
    const tail = i.freight === 'quoted' ? 'excluding tax' : 'excluding tax and freight, which is not quoted';
    checks.push({ label: 'Product subtotal', value: `${units} x ${money(i.price, i.currency)} = ${money(sub, i.currency)}, ${tail}`, source: 'STOCK + PRICE' });
    if (i.freight !== 'quoted') {
      refuse('a delivered total', 'Freight is not quoted. A product subtotal is not a delivered price.');
      decide('Quote freight, or say plainly that it is excluded', 'Otherwise the customer reads the subtotal as the total.');
    }
  }

  /* 3. the date the customer asked for */
  if (i.byDate) {
    refuse(`that ${i.byDate} is possible`, 'The customer asking for a date does not make the date possible. Nothing supplied confirms it.');
    decide(`Decide whether ${i.byDate} can be met`, 'This is a commitment, so it belongs to a person.');
    draft.push(`We are checking whether delivery by ${i.byDate} is possible and will come back to you on that specifically.`);
  }

  /* 4. never invented, in any configuration */
  refuse('payment instructions', 'Bank and payment details are never produced by an assistant, in any configuration.');
  decide('Payment instructions', 'Always a person, on a channel you trust.');

  if (draft.length) draft.unshift('Thanks for your enquiry.');
  draft.push('Once those points are confirmed we will send a firm offer.');

  return {
    version: REPLY_VERSION,
    input: i,
    draft,
    checks,
    refusals,
    decisions,
    unsent: 'This draft stays unsent until a named person approves it.'
  };
}
