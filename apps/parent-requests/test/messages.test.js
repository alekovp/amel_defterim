'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../src/engine.js');
const M = require('../src/messages.js');
const RULES = require('../src/rules/2026-2027.json');

const sub = {
  lang: 'en', academicYear: '2026-2027',
  guardian: { name: 'Chan Sreymom', relationship: 'MOTHER', phone: '012 345 678', email: 'parent@example.com' },
  children: [
    { name: 'Vicheka', studentId: '900101', programme: 'Bilingual', grade: 'G8', relationship: 'OWN', ask: {} },
    { name: 'Sophea', studentId: '900102', programme: 'Bilingual', grade: 'G5', relationship: 'OWN', ask: { capitalPct: 50 } },
    { name: 'Dara', studentId: '900103', programme: 'Bilingual', grade: 'G2', relationship: 'OWN', ask: { capitalPct: 50 } }
  ],
  plan: 'INST2', payBy: '', request: { type: 'DISCOUNT' },
  reason: { category: 'LOSS_OF_INCOME', statement: 'Our business income fell sharply this year.' }, declaration: true
};

test('money and dates format the way the fee PDFs do', () => {
  assert.equal(M.money(10910), '$10,910');
  assert.equal(M.money(654.6), '$654.60');
  assert.equal(M.money(-443), '−$443');
  assert.equal(M.date('en', '2026-03-31'), '31 March 2026');
  assert.equal(M.date('km', '2026-04-30'), '30 មេសា 2026');
  assert.deepEqual([1, 2, 3, 4, 11, 22].map(n => M.ordinal('en', n)), ['1st', '2nd', '3rd', '4th', '11th', '22nd']);
});

test('shared codes get distinct labels', () => {
  assert.equal(M.label('en', 'childRel', 'OTHER'), 'Other dependant');
  assert.equal(M.label('en', 'request', 'OTHER'), 'Something else');
  assert.equal(M.label('en', 'reason', 'OTHER'), 'Other');
  assert.equal(M.label('en', 'guardianRel', 'OTHER'), 'Other');
});

test('every English key has a Khmer translation', () => {
  const missing = Object.keys(M.STRINGS.en).filter(k => M.STRINGS.km[k] === undefined);
  assert.deepEqual(missing, []);
});

test('acknowledgement carries the reference and the published entitlement', () => {
  const result = E.evaluate(sub, RULES);
  const ack = M.renderAcknowledgement({ lang: 'en', requestId: 'PR-2627-0042', submission: sub, result, rules: RULES, autoResolve: false });
  assert.match(ack.subject, /PR-2627-0042/);
  assert.match(ack.text, /Sophea \(Grade 5, Bilingual\), 2nd child in the family: 10% sibling discount on tuition: \$922 off/);
  assert.match(ack.text, /Dara \(Grade 2, Bilingual\), 3rd child in the family: 15% sibling discount on tuition: \$1,329 off/);
  assert.match(ack.text, /Vicheka .*1st child in the family: no automatic discount applies/);
  assert.match(ack.text, /Sophea — Capital fee: 50%/);
  assert.match(ack.text, /reviewed\. We aim to reply within 10 working days/);
});

test('acknowledgement never states the unconfirmed capital ladder as fact', () => {
  const result = E.evaluate(sub, RULES);
  assert.ok(result.entitlement.lines.some(l => l.component === 'CAPITAL_LADDER'), 'computed for staff…');
  const ack = M.renderAcknowledgement({ lang: 'en', requestId: 'PR-2627-0042', submission: sub, result, rules: RULES });
  assert.doesNotMatch(ack.text, /capital discount by child order/i, '…but not told to parents');
  assert.doesNotMatch(ack.html, /capital discount by child order/i);
});

test('within-policy wording depends on whether auto-resolution is switched on', () => {
  const s = JSON.parse(JSON.stringify(sub));
  s.children[1].ask = { tuitionPct: 10 }; s.children[2].ask = {};
  const result = E.evaluate(s, RULES);
  assert.equal(result.route.tier, 'AUTO');
  const off = M.renderAcknowledgement({ lang: 'en', requestId: 'X', submission: s, result, rules: RULES, autoResolve: false });
  const on = M.renderAcknowledgement({ lang: 'en', requestId: 'X', submission: s, result, rules: RULES, autoResolve: true });
  assert.match(off.text, /will confirm it within 2 working days/);
  assert.match(on.text, /is confirmed, subject to checking/);
});

test('Khmer acknowledgement renders, and escapes HTML in names', () => {
  const s = JSON.parse(JSON.stringify(sub));
  s.lang = 'km'; s.guardian.name = '<b>ចាន់</b>';
  const ack = M.renderAcknowledgement({ lang: 'km', requestId: 'PR-2627-0042', submission: s, result: E.evaluate(s, RULES), rules: RULES });
  assert.match(ack.subject, /សំណើថ្លៃសិក្សារបស់អ្នក PR-2627-0042/);
  assert.match(ack.text, /បញ្ចុះតម្លៃបងប្អូន 10% លើថ្លៃសិក្សា/);
  assert.doesNotMatch(ack.html, /<b>ចាន់/);
  assert.match(ack.html, /&lt;b&gt;ចាន់/);
});

test('an ask covered only by the unpublished ladder is not called "within the published policy"', () => {
  const s = JSON.parse(JSON.stringify(sub));
  s.children[1].ask = { capitalPct: 20 }; s.children[2].ask = {};
  const result = E.evaluate(s, RULES);
  assert.equal(result.route.tier, 'AUTO');
  const ack = M.renderAcknowledgement({ lang: 'en', requestId: 'X', submission: s, result, rules: RULES, autoResolve: true });
  assert.doesNotMatch(ack.text, /within the published fee policy/);
  assert.match(ack.text, /will be reviewed/);
});
