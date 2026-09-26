'use strict';
// Run: node --test   (from apps/parent-requests)
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../src/engine.js');
const RULES = require('../src/rules/2026-2027.json');

function child(name, grade, extra) {
  return Object.assign({ name, grade, programme: 'Bilingual', relationship: 'OWN', studentId: '', isNew: false, ask: {} }, extra || {});
}
function family(children, extra) {
  return Object.assign({ guardian: {}, children, plan: 'INST2', payBy: '', request: { type: 'DISCOUNT' } }, extra || {});
}
const at = (ent, i) => ent.children[i];

// ------------------------------------------------------------------ fee tables

test('tuition follows the published PDF for every plan', () => {
  assert.equal(E.tuitionFor('Bilingual', 'G11', 'FULL', RULES).total, 10910);
  assert.equal(E.tuitionFor('Bilingual', 'G11', 'INST2', RULES).total, 11240);
  assert.equal(E.tuitionFor('Bilingual', 'G11', 'INST4', RULES).total, 11440);
  assert.equal(E.tuitionFor('International', 'G10', 'INST2', RULES).total, 15740);
  assert.equal(E.tuitionFor('International', 'G12', 'INST4', RULES).total, 16040);
  assert.equal(E.tuitionFor('Bilingual', 'KG', 'FULL', RULES).total, 7020);
  assert.equal(E.tuitionFor('International', 'PREKG', 'FULL', RULES).total, 7020);
});

test('the register priced off the two-instalment figure: $11,240 and $15,740 are Grade 10-12 INST2', () => {
  assert.equal(E.tuitionFor('Bilingual', 'G10', 'INST2', RULES).total, 11240);
  assert.equal(E.tuitionFor('International', 'G11', 'INST2', RULES).total, 15740);
});

test('capital fee: $600 Toddler-Pre-K, $1,200 KG-12, none for half-day', () => {
  assert.equal(E.capitalFor('TN_HALF', RULES), 0);
  assert.equal(E.capitalFor('TN_FULL', RULES), 600);
  assert.equal(E.capitalFor('PREKG', RULES), 600);
  assert.equal(E.capitalFor('KG', RULES), 1200);
  assert.equal(E.capitalFor('G12', RULES), 1200);
});

// ------------------------------------------------------------------ child order

test('eldest child is first — matches every family verified in the register', () => {
  // Register: "Bomolika Thav, 5 - Capital fee: no discount / Bokolin Thav, 2 - Capital fee: 20% off"
  const thav = E.computeEntitlement(family([child('Bomolika', 'G5'), child('Bokolin', 'G2')]), RULES);
  assert.equal(at(thav, 0).order, 1);
  assert.equal(at(thav, 1).order, 2);
  assert.equal(at(thav, 0).capital.policyPct, 0);
  assert.equal(at(thav, 1).capital.policyPct, 20);
  // Register: "Taithong Lim - no discount / Thaihong Lim - 20% off" (grades 4 and 1)
  const lim = E.computeEntitlement(family([child('Thaihong', 'G1'), child('Taithong', 'G4')]), RULES);
  assert.equal(at(lim, 1).order, 1, 'order is by grade, not by the order the parent typed them');
  assert.equal(at(lim, 0).order, 2);
});

test('the second child gets 10% sibling on tuition — not the 15% the register gave 17 times', () => {
  const thav = E.computeEntitlement(family([child('Bomolika', 'G5'), child('Bokolin', 'G2')]), RULES);
  assert.equal(at(thav, 0).tuition.policyPct, 0);
  assert.equal(at(thav, 1).tuition.policyPct, 10);
  assert.equal(at(thav, 1).tuition.policyComponent, 'SIBLING');
  assert.equal(at(thav, 1).tuition.policyAmount, 886); // 10% of $8,860 (G1-3, two instalments)
});

test('full ladder for five children: sibling 0/10/15/20/20, capital 0/20/40/60/60', () => {
  const ent = E.computeEntitlement(family([
    child('A', 'G12'), child('B', 'G9'), child('C', 'G6'), child('D', 'G3'), child('E', 'KG')
  ]), RULES);
  assert.deepEqual(ent.children.map(c => c.tuition.policyPct), [0, 10, 15, 20, 20]);
  assert.deepEqual(ent.children.map(c => c.capital.policyPct), [0, 20, 40, 60, 60]);
});

test('same-grade twins keep the order the family entered them in', () => {
  const ent = E.computeEntitlement(family([child('Twin A', 'G3'), child('Twin B', 'G3')]), RULES);
  assert.deepEqual(ent.children.map(c => c.order), [1, 2]);
});

test('nephews and nieces are not counted and do not shift the order of own children', () => {
  const ent = E.computeEntitlement(family([
    child('Own eldest', 'G10'), child('Nephew', 'G8', { relationship: 'NEPHEW' }), child('Own younger', 'G4')
  ]), RULES);
  assert.equal(at(ent, 1).order, null);
  assert.equal(at(ent, 1).tuition.policyPct, 0);
  assert.equal(at(ent, 1).capital.policyPct, 0);
  assert.equal(at(ent, 2).order, 2);
  assert.ok(ent.flags.some(f => f.code === 'NOT_COUNTED' && f.childIndex === 1));
});

// ------------------------------------------------------------------ alumni and full payment

test('alumni: first child gets 10% tuition, sibling rates for the rest', () => {
  const ent = E.computeEntitlement(family([child('A', 'G8'), child('B', 'G5')], { guardian: { alumni: true } }), RULES);
  assert.equal(at(ent, 0).tuition.policyPct, 10);
  assert.equal(at(ent, 0).tuition.policyComponent, 'ALUMNI');
  assert.equal(at(ent, 1).tuition.policyPct, 10);
  assert.equal(at(ent, 1).tuition.policyComponent, 'SIBLING');
});

test('full payment by 31 March: 6% on tuition and capital', () => {
  const ent = E.computeEntitlement(family([child('Only', 'G11')], { plan: 'FULL', payBy: '2026-03-31' }), RULES);
  assert.equal(at(ent, 0).tuition.base, 10910);
  assert.equal(at(ent, 0).tuition.fullPaymentAmount, 654.6);
  assert.equal(at(ent, 0).tuition.net, 10255.4);
  assert.equal(at(ent, 0).capital.net, 1128);
});

test('full payment stacks after the sibling discount, not on the gross', () => {
  const ent = E.computeEntitlement(family([child('Eldest', 'G6'), child('Second', 'G2')], { plan: 'FULL', payBy: '2026-04-30' }), RULES);
  // $8,600 less 10% sibling = $7,740; less 4% = $7,430.40
  assert.equal(at(ent, 1).tuition.net, 7430.4);
  // capital $1,200 less 20% ladder = $960; less 4% = $921.60
  assert.equal(at(ent, 1).capital.net, 921.6);
});

test('full-payment discount only applies to a full-payment plan', () => {
  const ent = E.computeEntitlement(family([child('Only', 'G11')], { plan: 'INST2', payBy: '2026-03-31' }), RULES);
  assert.equal(ent.fullPaymentPct, 0);
});

test('tip: suggests the earliest full-payment date still open', () => {
  const sub = family([child('Only', 'G11')], { plan: 'INST4' });
  const ent = E.computeEntitlement(sub, RULES, { today: '2026-04-15' });
  assert.equal(ent.tip.payBy, '2026-04-30');
  assert.equal(ent.tip.pct, 4);
  const late = E.computeEntitlement(sub, RULES, { today: '2026-09-26' });
  assert.equal(late.tip, null, 'no tip once every deadline has passed');
});

test('half-day toddlers produce no capital lines', () => {
  const ent = E.computeEntitlement(family([child('Big', 'G2'), child('Small', 'TN_HALF')]), RULES);
  assert.equal(at(ent, 1).capital.base, 0);
  assert.equal(ent.lines.filter(l => l.childIndex === 1 && l.fee === 'CAPITAL').length, 0);
});

test('capital-ladder lines are marked inferred and unpublished until the Board confirms', () => {
  const ent = E.computeEntitlement(family([child('A', 'G5'), child('B', 'G2')]), RULES);
  const cap = ent.lines.find(l => l.component === 'CAPITAL_LADDER');
  assert.equal(cap.ruleStatus, 'inferred');
  assert.equal(cap.published, false);
  assert.equal(cap.authority, 'Policy ladder');
  const sib = ent.lines.find(l => l.component === 'SIBLING');
  assert.equal(sib.published, true);
  assert.equal(sib.authority, 'Sibling policy');
});

test('half-filled children produce no lines instead of failing', () => {
  const ent = E.computeEntitlement(family([child('Done', 'G5'), { name: 'Typing…' }]), RULES);
  assert.equal(at(ent, 1).complete, false);
  assert.ok(ent.totals.gross > 0);
});

// ------------------------------------------------------------------ comparison and routing

function evalAsk(asks, extra) {
  const kids = [child('Eldest', 'G5'), child('Second', 'G2')];
  asks.forEach((a, i) => { kids[i].ask = a; });
  return E.evaluate(family(kids, extra), RULES);
}

test('asking for what policy already gives is within policy and needs no decision', () => {
  const r = evalAsk([{}, { capitalPct: 20, tuitionPct: 10 }]);
  assert.equal(r.comparison.withinPolicy, true);
  assert.equal(r.comparison.gapUsd, 0);
  assert.equal(r.route.tier, 'AUTO');
});

test('the typical 5-point tuition top-up goes to Head of School + CFO, not the committee', () => {
  // 48 of this year's committee grants were 2% or 5% top-ups like this one.
  const r = evalAsk([{}, { tuitionPct: 15 }]);
  assert.equal(r.comparison.lines[0].gapPts, 5);
  assert.equal(r.comparison.gapUsd, 443); // 5% of $8,860
  assert.equal(r.route.tier, 'HOS_CFO');
});

test('50% capital for a second child: 30-point gap goes to the Finance Committee', () => {
  const r = evalAsk([{}, { capitalPct: 50 }]);
  assert.equal(r.comparison.lines[0].entitled, 20);
  assert.equal(r.comparison.lines[0].gapUsd, 360);
  assert.equal(r.route.tier, 'COMMITTEE');
  assert.ok(r.route.reasons.includes('INFERRED_RULE'), 'staff are told the capital ladder is unconfirmed');
});

test('requested = entitlement + gap', () => {
  const r = evalAsk([{ capitalPct: 30 }, { capitalPct: 50 }]);
  const c = r.comparison;
  assert.equal(c.gapUsd, 360 + 360);
  assert.equal(c.requestedUsd, E.round2(c.entitlementUsd + c.gapUsd));
});

test('registration and enrolment asks have no entitlement, so the whole ask is the gap', () => {
  const r = evalAsk([{ otherFee: 'REGISTRATION', otherPct: 50 }]);
  assert.equal(r.comparison.lines[0].entitled, 0);
  assert.equal(r.comparison.lines[0].gapUsd, 425);
});

test('staff, multi-year and nephew cases always go to the committee', () => {
  assert.equal(evalAsk([{}, { tuitionPct: 10 }], { guardian: { staff: true } }).route.tier, 'COMMITTEE');
  assert.equal(evalAsk([{}, { tuitionPct: 10 }], { request: { type: 'DISCOUNT', multiYear: true } }).route.tier, 'COMMITTEE');
  const kids = [child('Own', 'G5'), child('Niece', 'G2', { relationship: 'NIECE', ask: { capitalPct: 20 } })];
  const r = E.evaluate(family(kids), RULES);
  assert.equal(r.route.tier, 'COMMITTEE');
  assert.equal(r.route.reasons[0], 'NEPHEW_NIECE');
});

test('non-discount requests route by type', () => {
  const base = family([child('A', 'G5')]);
  const route = req => E.evaluate(Object.assign({}, base, { request: req }), RULES).route.tier;
  assert.equal(route({ type: 'EXTENSION', extensionDays: 20 }), 'FINANCE_OFFICER');
  assert.equal(route({ type: 'EXTENSION', extensionDays: 45 }), 'CFO');
  assert.equal(route({ type: 'LATE_FEE_WAIVER', lateFeeAmount: 50, lateFeeFirstTime: true }), 'FINANCE_OFFICER');
  assert.equal(route({ type: 'LATE_FEE_WAIVER', lateFeeAmount: 100, lateFeeFirstTime: false }), 'HOS_CFO');
  assert.equal(route({ type: 'PAYMENT_PLAN' }), 'CFO');
  assert.equal(route({ type: 'KEEP_RATE' }), 'COMMITTEE');
  assert.equal(route({ type: 'SCHOLARSHIP' }), 'COMMITTEE');
  assert.equal(route({ type: 'OTHER' }), 'FINANCE_OFFICER');
});

// ------------------------------------------------------------------ years and IDs

test('request IDs', () => {
  assert.equal(E.formatRequestId('2026-2027', 42), 'PR-2627-0042');
  assert.equal(E.formatRequestId('2026-2027', 12345), 'PR-2627-12345');
  assert.deepEqual(E.parseRequestId('PR-2627-0042'), { yy: '2627', seq: 42 });
  assert.equal(E.parseRequestId('Informed parent Mar 27, 2026'), null);
});

test('academic year: March requests are for next year, September requests for this one', () => {
  assert.equal(E.academicYearOptions('2026-03-04').defaultYear, '2026-2027');
  assert.equal(E.academicYearOptions('2026-09-26').defaultYear, '2026-2027');
  assert.equal(E.academicYearOptions('2027-02-10').defaultYear, '2027-2028');
  assert.equal(E.academicYearOptions('2027-02-10').current, '2026-2027');
});

// ------------------------------------------------------------------ validation

function validSubmission() {
  return {
    academicYear: '2026-2027',
    guardian: { name: 'Chan Sreymom', relationship: 'MOTHER', phone: '012 345 678', email: 'parent@example.com' },
    children: [child('Vicheka', 'G8', { studentId: '900101' }), child('Sophea', 'G5', { studentId: '900102', ask: { capitalPct: 50 } })],
    plan: 'INST2', payBy: '',
    request: { type: 'DISCOUNT' },
    reason: { category: 'LOSS_OF_INCOME', statement: 'My business income fell sharply this year.' },
    declaration: true,
    files: []
  };
}
const codes = s => E.validate(s).map(e => e.field + ':' + e.code);

test('a complete submission passes', () => {
  assert.deepEqual(E.validate(validSubmission()), []);
});

test('Student ID is required for existing students, and must look like one', () => {
  const s = validSubmission();
  s.children[0].studentId = '';
  s.children[1].studentId = '105317 105320';
  assert.deepEqual(codes(s), ['children.0.studentId:REQUIRED', 'children.1.studentId:INVALID_STUDENT_ID']);
});

test('new students need no ID; duplicate IDs are refused', () => {
  const s = validSubmission();
  s.children[0].isNew = true; s.children[0].studentId = '';
  assert.deepEqual(E.validate(s), []);
  const d = validSubmission();
  d.children[1].studentId = '900101';
  assert.deepEqual(codes(d), ['children.1.studentId:DUPLICATE_STUDENT_ID']);
});

test('a discount request must actually ask for something', () => {
  const s = validSubmission();
  s.children[1].ask = {};
  assert.deepEqual(codes(s), ['request.asks:NO_ASK']);
});

test('statement, declaration, contact details and file limits are checked', () => {
  const s = validSubmission();
  s.reason.statement = 'please';
  s.declaration = false;
  s.guardian.email = 'not-an-email';
  s.guardian.phone = '123';
  s.files = [{ name: 'a.exe', mimeType: 'application/x-msdownload', size: 10 }, { name: 'b.pdf', mimeType: 'application/pdf', size: 9e6 }];
  assert.deepEqual(codes(s).sort(), [
    'declaration:DECLARATION', 'files.0:FILE_TYPE', 'files.1:FILE_SIZE',
    'guardian.email:INVALID_EMAIL', 'guardian.phone:INVALID_PHONE', 'reason.statement:STATEMENT_SHORT'
  ]);
});

test('percentages outside 0-100 are refused', () => {
  const s = validSubmission();
  s.children[1].ask = { capitalPct: 150 };
  assert.deepEqual(codes(s), ['children.1.ask.capitalPct:PCT_RANGE']);
});

// ------------------------------------------------------------------ what parents are shown

test('publishedOnly drops the unconfirmed capital ladder, and the totals still add up', () => {
  const sub = family([child('A', 'G5'), child('B', 'G2')]);
  const staff = E.computeEntitlement(sub, RULES);
  const parent = E.computeEntitlement(sub, RULES, { publishedOnly: true });
  assert.equal(staff.children[1].capital.policyPct, 20);
  assert.equal(parent.children[1].capital.policyPct, 0);
  assert.equal(parent.lines.some(l => l.component === 'CAPITAL_LADDER'), false);
  assert.equal(parent.children[1].tuition.policyPct, 10, 'published rules are unaffected');
  const t = parent.totals;
  assert.equal(t.net, E.round2(t.gross - t.policyDiscount - t.fullPaymentDiscount));
  assert.equal(staff.totals.policyDiscount - parent.totals.policyDiscount, 240); // 20% of $1,200
});

test('an ask satisfied only by the unpublished ladder is not "within the published policy"', () => {
  const r = evalAsk([{}, { capitalPct: 20 }]);
  assert.equal(r.comparison.withinPolicy, true, 'staff: nothing to decide');
  assert.equal(r.route.tier, 'AUTO');
  assert.equal(r.comparison.withinPublishedPolicy, false, 'but it cannot be auto-resolved or described that way to a parent');
  const t = evalAsk([{}, { tuitionPct: 10 }]);
  assert.equal(t.comparison.withinPublishedPolicy, true);
});

test('asks hidden by a non-discount request type are not validated', () => {
  const s = validSubmission();
  s.children[1].ask = { capitalPct: 150 };
  s.request = { type: 'EXTENSION', extensionDays: 20 };
  assert.deepEqual(E.validate(s), []);
});

test('academic year and full-payment date must be well formed', () => {
  const s = validSubmission();
  s.academicYear = '2026-2028';
  s.plan = 'FULL'; s.payBy = '2026-03-310';
  assert.deepEqual(codes(s), ['academicYear:REQUIRED', 'payBy:REQUIRED']);
  s.academicYear = '2026-2027'; s.payBy = 'LATER';
  assert.deepEqual(E.validate(s), []);
});
