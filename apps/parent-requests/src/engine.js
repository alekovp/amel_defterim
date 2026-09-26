/**
 * Paragon ISC — parent fee request calculator.
 *
 * One file, three runtimes: Node (tests), the parent's browser (live preview while
 * the form is filled in) and Google Apps Script (the authoritative check on submit).
 * No dependencies and no I/O. The server recomputes everything from the raw
 * submission; figures computed in the browser are never trusted.
 *
 * Rules are data (see src/rules/*.json). This file encodes how they combine:
 *   - child order is eldest-first among the children the rules count as siblings
 *   - tuition: sibling ladder by order, or the alumni rate for the first child
 *   - capital: the capital ladder by order
 *   - full payment: a date ladder on tuition and capital, applied after the above
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FeeEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ---------------------------------------------------------------- reference

  var GRADES = [
    { key: 'TN_HALF', rank: 0, band: 'TN_HALF', level: 'EARLY' },
    { key: 'TN_FULL', rank: 0, band: 'TN_FULL', level: 'EARLY' },
    { key: 'PREKG', rank: 1, band: 'PREKG_KG', level: 'EARLY' },
    { key: 'KG', rank: 2, band: 'PREKG_KG', level: 'MAIN' }
  ];
  for (var g = 1; g <= 12; g++) {
    GRADES.push({
      key: 'G' + g,
      rank: 2 + g,
      band: g <= 3 ? 'G1_3' : g <= 6 ? 'G4_6' : g <= 9 ? 'G7_9' : 'G10_12',
      level: 'MAIN'
    });
  }

  var PLANS = { FULL: { index: 0, count: 1 }, INST2: { index: 1, count: 2 }, INST4: { index: 2, count: 4 } };
  var PROGRAMMES = ['Bilingual', 'International'];
  var CHILD_RELATIONSHIPS = ['OWN', 'NEPHEW', 'NIECE', 'OTHER'];
  var GUARDIAN_RELATIONSHIPS = ['MOTHER', 'FATHER', 'GUARDIAN', 'OTHER'];
  var REQUEST_TYPES = ['DISCOUNT', 'KEEP_RATE', 'SCHOLARSHIP', 'PAYMENT_PLAN', 'EXTENSION', 'LATE_FEE_WAIVER', 'OTHER'];
  var REASONS = ['LOSS_OF_INCOME', 'BUSINESS_DOWNTURN', 'ECONOMIC', 'MEDICAL', 'BEREAVEMENT',
    'MULTIPLE_CHILDREN', 'FEE_INCREASE', 'MERIT', 'STAFF', 'OTHER'];
  var OTHER_FEES = ['REGISTRATION', 'ENROLMENT'];
  var FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];

  var LIMITS = { maxChildren: 8, minStatement: 20, maxFiles: 3, maxFileBytes: 4 * 1024 * 1024, maxExtensionDays: 180 };

  // Authority names match docs/parent-request-register/lookups.csv so decision
  // lines written by the form sort alongside lines recorded by the committee.
  var AUTHORITY = {
    SIBLING: 'Sibling policy',
    ALUMNI: 'Alumni',
    CAPITAL_LADDER: 'Policy ladder',
    FULL_PAYMENT: 'Early or full payment'
  };

  function gradeInfo(key) {
    for (var i = 0; i < GRADES.length; i++) if (GRADES[i].key === key) return GRADES[i];
    return null;
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  // ---------------------------------------------------------------- fee lookups

  function tuitionFor(programme, gradeKey, plan, rules) {
    var info = gradeInfo(gradeKey);
    var p = PLANS[plan];
    var bands = rules.tuition.bands[programme];
    if (!info || !p || !bands || !bands[info.band]) return null;
    var row = bands[info.band];
    var each = row[p.index];
    return { band: info.band, plan: plan, instalment: each, count: p.count, total: each * p.count };
  }

  function capitalFor(gradeKey, rules) {
    var info = gradeInfo(gradeKey);
    if (!info) return null;
    var cap = rules.fixedFees.capital;
    if (cap[gradeKey] !== undefined) return cap[gradeKey];
    return cap[info.level];
  }

  function otherFeeFor(fee, gradeKey, rules) {
    var info = gradeInfo(gradeKey);
    if (!info) return null;
    if (fee === 'REGISTRATION') return rules.fixedFees.registration.ALL;
    if (fee === 'ENROLMENT') return rules.fixedFees.enrolment[info.level];
    return null;
  }

  function pctByOrder(byOrder, order) {
    if (!order) return 0;
    var max = 0;
    for (var k in byOrder) if (Number(k) > max) max = Number(k);
    return byOrder[String(Math.min(order, max))] || 0;
  }

  function fullPaymentPct(rules, plan, payBy) {
    if (plan !== 'FULL' || !payBy || payBy === 'LATER') return 0;
    var ladder = rules.fullPayment.byDate;
    for (var i = 0; i < ladder.length; i++) if (payBy <= ladder[i].by) return ladder[i].pct;
    return 0;
  }

  // ---------------------------------------------------------------- child order

  /**
   * Returns an array parallel to `children`: the child's order in the family
   * (1 = eldest counted child), or null when the child does not count as a
   * sibling (e.g. a nephew) or is not complete enough to place.
   * Ties (same grade) keep the order the family entered them in.
   */
  function orderChildren(children, rules) {
    var counted = rules.sibling.countRelationships || ['OWN'];
    var eligible = [];
    children.forEach(function (c, i) {
      var info = gradeInfo(c.grade);
      if (info && counted.indexOf(c.relationship) !== -1) eligible.push({ i: i, rank: info.rank });
    });
    eligible.sort(function (a, b) { return b.rank - a.rank || a.i - b.i; });
    var order = children.map(function () { return null; });
    eligible.forEach(function (e, k) { order[e.i] = k + 1; });
    return order;
  }

  // ---------------------------------------------------------------- entitlement

  function line(childIndex, fee, component, pct, base, amount, rule) {
    return {
      childIndex: childIndex,
      fee: fee,
      component: component,
      authority: AUTHORITY[component],
      pct: pct,
      base: round2(base),
      amount: round2(amount),
      ruleStatus: rule.status,
      published: rule.publishedToParents !== false
    };
  }

  /**
   * What policy gives this family, before anyone decides anything. Tolerates
   * half-filled children so the form can call it on every keystroke: incomplete
   * children simply produce no lines.
   *
   * opts.publishedOnly — ignore rules not yet published to parents (the capital
   * ladder today). Parents see this view, so their totals add up without any
   * hidden line. Staff and the server use the full computation.
   */
  function computeEntitlement(sub, rules, opts) {
    opts = opts || {};
    function on(rule) { return !(opts.publishedOnly && rule.publishedToParents === false); }
    var children = sub.children || [];
    var guardian = sub.guardian || {};
    var plan = PLANS[sub.plan] ? sub.plan : 'INST2';
    var order = orderChildren(children, rules);
    var fpPct = on(rules.fullPayment) ? fullPaymentPct(rules, plan, sub.payBy) : 0;
    var sequential = rules.fullPayment.stacking !== 'additive';
    var out = { academicYear: rules.academicYear, plan: plan, fullPaymentPct: fpPct, children: [], lines: [], flags: [] };
    var totals = { gross: 0, policyDiscount: 0, fullPaymentDiscount: 0, net: 0 };

    children.forEach(function (c, i) {
      var info = gradeInfo(c.grade);
      var programme = PROGRAMMES.indexOf(c.programme) !== -1 ? c.programme : null;
      var row = { index: i, name: c.name || '', studentId: c.studentId || '', grade: c.grade || '',
        programme: programme, relationship: c.relationship || '', order: order[i], complete: !!(info && programme) };
      if (!row.complete) { out.children.push(row); return; }
      if (order[i] === null) out.flags.push({ code: 'NOT_COUNTED', childIndex: i });

      // Tuition
      var t = tuitionFor(programme, c.grade, plan, rules);
      var tLines = [];
      var alumniChild = guardian.alumni && order[i] === 1;
      var tRule = alumniChild ? rules.alumni : rules.sibling;
      var tPct = !on(tRule) ? 0 : alumniChild ? rules.alumni.firstChildPct : pctByOrder(rules.sibling.byOrder, order[i]);
      var tPolicy = round2(t.total * tPct / 100);
      if (tPct > 0) tLines.push(line(i, 'TUITION', alumniChild ? 'ALUMNI' : 'SIBLING', tPct, t.total, tPolicy, tRule));
      var tAfter = round2(t.total - tPolicy);
      var tFp = round2((sequential ? tAfter : t.total) * fpPct / 100);
      if (fpPct > 0) tLines.push(line(i, 'TUITION', 'FULL_PAYMENT', fpPct, sequential ? tAfter : t.total, tFp, rules.fullPayment));

      // Capital
      var capBase = capitalFor(c.grade, rules) || 0;
      var cLines = [];
      var cPct = capBase > 0 && on(rules.capitalLadder) ? pctByOrder(rules.capitalLadder.byOrder, order[i]) : 0;
      var cPolicy = round2(capBase * cPct / 100);
      if (cPct > 0) cLines.push(line(i, 'CAPITAL', 'CAPITAL_LADDER', cPct, capBase, cPolicy, rules.capitalLadder));
      var cAfter = round2(capBase - cPolicy);
      var cFp = capBase > 0 ? round2((sequential ? cAfter : capBase) * fpPct / 100) : 0;
      if (fpPct > 0 && capBase > 0) cLines.push(line(i, 'CAPITAL', 'FULL_PAYMENT', fpPct, sequential ? cAfter : capBase, cFp, rules.fullPayment));

      row.tuition = { base: t.total, instalment: t.instalment, count: t.count, policyPct: tPct,
        policyComponent: tPct > 0 ? (alumniChild ? 'ALUMNI' : 'SIBLING') : null,
        policyAmount: tPolicy, fullPaymentAmount: tFp, net: round2(tAfter - tFp), lines: tLines };
      row.capital = { base: capBase, policyPct: cPct, policyAmount: cPolicy, fullPaymentAmount: cFp,
        net: round2(cAfter - cFp), lines: cLines };

      totals.gross += t.total + capBase;
      totals.policyDiscount += tPolicy + cPolicy;
      totals.fullPaymentDiscount += tFp + cFp;
      out.lines = out.lines.concat(tLines, cLines);
      out.children.push(row);
    });

    totals.gross = round2(totals.gross);
    totals.policyDiscount = round2(totals.policyDiscount);
    totals.fullPaymentDiscount = round2(totals.fullPaymentDiscount);
    totals.net = round2(totals.gross - totals.policyDiscount - totals.fullPaymentDiscount);
    out.totals = totals;
    out.tip = bestPaymentTip(sub, rules, totals.net, opts);
    return out;
  }

  /** The cheapest still-available full-payment date, if it beats the family's current plan. */
  function bestPaymentTip(sub, rules, currentNet, opts) {
    var today = opts && opts.today;
    if (!today) return null;
    var ladder = rules.fullPayment.byDate;
    for (var i = 0; i < ladder.length; i++) {
      if (ladder[i].by < today) continue;
      if (sub.plan === 'FULL' && sub.payBy && sub.payBy !== 'LATER' && sub.payBy <= ladder[i].by) return null;
      var alt = computeEntitlement(Object.assign({}, sub, { plan: 'FULL', payBy: ladder[i].by }), rules, { publishedOnly: opts.publishedOnly });
      var saving = round2(currentNet - alt.totals.net);
      return saving > 0 ? { payBy: ladder[i].by, pct: ladder[i].pct, net: alt.totals.net, saving: saving } : null;
    }
    return null;
  }

  // ---------------------------------------------------------------- the request

  /**
   * Compares what the family asked for against what policy already gives.
   * Asks are the TOTAL discount wanted on a fee, including any entitlement.
   * The gap is the only thing anyone has to decide.
   */
  function compareRequest(sub, ent, rules) {
    var res = { lines: [], entitlementUsd: ent.totals.policyDiscount, gapUsd: 0, requestedUsd: 0, withinPolicy: false, hasAsk: false };
    if (!sub.request || (sub.request.type !== 'DISCOUNT')) {
      res.requestedUsd = res.entitlementUsd;
      return res;
    }
    (sub.children || []).forEach(function (c, i) {
      var row = ent.children[i];
      var ask = c.ask || {};
      if (!row || !row.complete) return;
      var asks = [];
      var tp = num(ask.tuitionPct), cp = num(ask.capitalPct), op = num(ask.otherPct);
      if (tp !== null && tp > 0) asks.push({ fee: 'TUITION', asked: tp, entitled: row.tuition.policyPct, base: row.tuition.base,
        published: true });
      if (cp !== null && cp > 0 && row.capital.base > 0) asks.push({ fee: 'CAPITAL', asked: cp, entitled: row.capital.policyPct,
        base: row.capital.base, published: rules.capitalLadder.publishedToParents !== false });
      if (op !== null && op > 0 && OTHER_FEES.indexOf(ask.otherFee) !== -1) {
        var ob = otherFeeFor(ask.otherFee, c.grade, rules);
        if (ob) asks.push({ fee: ask.otherFee, asked: op, entitled: 0, base: ob, published: true });
      }
      asks.forEach(function (a) {
        var gapPts = Math.max(0, a.asked - a.entitled);
        var gapUsd = round2(a.base * gapPts / 100);
        res.lines.push({ childIndex: i, fee: a.fee, asked: a.asked, entitled: a.entitled, base: a.base,
          gapPts: gapPts, gapUsd: gapUsd, withinPolicy: gapPts === 0, entitlementPublished: a.published });
        res.gapUsd += gapUsd;
      });
    });
    res.gapUsd = round2(res.gapUsd);
    res.requestedUsd = round2(res.entitlementUsd + res.gapUsd);
    res.hasAsk = res.lines.length > 0;
    res.withinPolicy = res.hasAsk && res.gapUsd === 0;
    // Within policy AND every entitlement relied on is one parents have been told
    // about. Only this may be auto-resolved or described to a parent as "within
    // the published policy".
    res.withinPublishedPolicy = res.withinPolicy && res.lines.every(function (l) { return l.entitlementPublished; });
    return res;
  }

  /**
   * Who decides. Tiers: AUTO (within policy, nobody), FINANCE_OFFICER, CFO,
   * HOS_CFO (Head of School + CFO) and COMMITTEE (Finance Committee).
   * Thresholds come from rules.delegation, which the committee sets.
   */
  function routeRequest(sub, ent, cmp, rules) {
    var req = sub.request || {};
    var reasons = [];
    var d = rules.delegation;
    if (ent.lines.some(function (l) { return l.ruleStatus === 'inferred'; })) reasons.push('INFERRED_RULE');

    function done(tier, why) { return { tier: tier, reasons: [why].concat(reasons) }; }

    if (sub.guardian && sub.guardian.staff) return done('COMMITTEE', 'STAFF_CASE');
    if (req.multiYear) return done('COMMITTEE', 'MULTI_YEAR');

    switch (req.type) {
      case 'DISCOUNT': {
        var nephewAsk = cmp.lines.some(function (l) { return ent.children[l.childIndex].order === null && l.asked > 0; });
        if (nephewAsk) return done('COMMITTEE', 'NEPHEW_NIECE');
        if (cmp.withinPolicy) return done('AUTO', 'WITHIN_POLICY');
        var gaps = cmp.lines.filter(function (l) { return l.gapPts > 0; });
        var maxPts = gaps.reduce(function (m, l) { return Math.max(m, l.gapPts); }, 0);
        if (gaps.length <= d.hosCfo.maxLines && maxPts <= d.hosCfo.maxGapPoints && cmp.gapUsd <= d.hosCfo.maxGapUsd) {
          return done('HOS_CFO', 'SMALL_GAP');
        }
        return done('COMMITTEE', 'ABOVE_THRESHOLD');
      }
      case 'KEEP_RATE': return done('COMMITTEE', 'KEEP_RATE');
      case 'SCHOLARSHIP': return done('COMMITTEE', 'SCHOLARSHIP');
      case 'PAYMENT_PLAN': return done('CFO', 'PAYMENT_PLAN');
      case 'EXTENSION':
        return (num(req.extensionDays) || 0) <= d.extensionDaysFinanceOfficer
          ? done('FINANCE_OFFICER', 'EXTENSION_SHORT') : done('CFO', 'EXTENSION_LONG');
      case 'LATE_FEE_WAIVER':
        return req.lateFeeFirstTime ? done('FINANCE_OFFICER', 'LATE_FEE_FIRST') : done('HOS_CFO', 'LATE_FEE_REPEAT');
      default: return done('FINANCE_OFFICER', 'TRIAGE');
    }
  }

  /** Everything in one call — what the form previews and what the server records. */
  function evaluate(sub, rules, opts) {
    var ent = computeEntitlement(sub, rules, opts);
    var cmp = compareRequest(sub, ent, rules);
    var route = routeRequest(sub, ent, cmp, rules);
    return { entitlement: ent, comparison: cmp, route: route };
  }

  // ---------------------------------------------------------------- years and IDs

  /** Current and upcoming academic years (July start). Jan–Jun defaults to upcoming: re-registration season. */
  function academicYearOptions(todayIso) {
    var y = Number(todayIso.slice(0, 4)), m = Number(todayIso.slice(5, 7));
    var cur = m >= 7 ? y : y - 1;
    var current = cur + '-' + (cur + 1), upcoming = (cur + 1) + '-' + (cur + 2);
    return { current: current, upcoming: upcoming, defaultYear: m <= 6 ? upcoming : current };
  }

  function formatRequestId(academicYear, seq) {
    var s = String(seq);
    while (s.length < 4) s = '0' + s;
    return 'PR-' + academicYear.slice(2, 4) + academicYear.slice(7, 9) + '-' + s;
  }

  function parseRequestId(id) {
    var m = /^PR-(\d{2})(\d{2})-(\d{4,})$/.exec(String(id || '').trim());
    return m ? { yy: m[1] + m[2], seq: Number(m[3]) } : null;
  }

  // ---------------------------------------------------------------- validation

  /** Returns [{field, code}]. Same rules in the browser and on the server. */
  function validate(sub) {
    var errs = [];
    function err(field, code) { errs.push({ field: field, code: code }); }
    function blank(v) { return v === null || v === undefined || String(v).trim() === ''; }

    var g = sub.guardian || {};
    if (blank(g.name)) err('guardian.name', 'REQUIRED');
    if (GUARDIAN_RELATIONSHIPS.indexOf(g.relationship) === -1) err('guardian.relationship', 'REQUIRED');
    if (blank(g.phone)) err('guardian.phone', 'REQUIRED');
    else if (String(g.phone).replace(/\D/g, '').length < 8) err('guardian.phone', 'INVALID_PHONE');
    if (blank(g.email)) err('guardian.email', 'REQUIRED');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(g.email).trim())) err('guardian.email', 'INVALID_EMAIL');
    var ay = /^(\d{4})-(\d{4})$/.exec(String(sub.academicYear || ''));
    if (!ay || Number(ay[2]) !== Number(ay[1]) + 1) err('academicYear', 'REQUIRED');

    var kids = sub.children || [];
    if (!kids.length) err('children', 'NO_CHILDREN');
    if (kids.length > LIMITS.maxChildren) err('children', 'TOO_MANY_CHILDREN');
    var seen = {};
    kids.forEach(function (c, i) {
      var p = 'children.' + i + '.';
      if (blank(c.name)) err(p + 'name', 'REQUIRED');
      if (PROGRAMMES.indexOf(c.programme) === -1) err(p + 'programme', 'REQUIRED');
      if (!gradeInfo(c.grade)) err(p + 'grade', 'REQUIRED');
      if (CHILD_RELATIONSHIPS.indexOf(c.relationship) === -1) err(p + 'relationship', 'REQUIRED');
      if (!c.isNew) {
        var sid = String(c.studentId || '').trim();
        if (!sid) err(p + 'studentId', 'REQUIRED');
        else if (!/^\d{5,6}$/.test(sid)) err(p + 'studentId', 'INVALID_STUDENT_ID');
        else if (seen[sid]) err(p + 'studentId', 'DUPLICATE_STUDENT_ID');
        else seen[sid] = true;
      }
      if ((sub.request || {}).type !== 'DISCOUNT') return;
      var a = c.ask || {};
      ['tuitionPct', 'capitalPct', 'otherPct'].forEach(function (k) {
        var n = num(a[k]);
        if (!blank(a[k]) && (n === null || n < 0 || n > 100)) err(p + 'ask.' + k, 'PCT_RANGE');
      });
      if (num(a.otherPct) > 0 && OTHER_FEES.indexOf(a.otherFee) === -1) err(p + 'ask.otherFee', 'REQUIRED');
    });

    if (!PLANS[sub.plan]) err('plan', 'REQUIRED');
    if (sub.plan === 'FULL' && !/^(\d{4}-\d{2}-\d{2}|LATER)$/.test(String(sub.payBy || ''))) err('payBy', 'REQUIRED');

    var r = sub.request || {};
    if (REQUEST_TYPES.indexOf(r.type) === -1) err('request.type', 'REQUIRED');
    if (r.type === 'DISCOUNT') {
      var any = kids.some(function (c) {
        var a = c.ask || {};
        return num(a.tuitionPct) > 0 || num(a.capitalPct) > 0 || num(a.otherPct) > 0;
      });
      if (!any) err('request.asks', 'NO_ASK');
    }
    if (r.type === 'EXTENSION') {
      var days = num(r.extensionDays);
      if (days === null || days < 1 || days > LIMITS.maxExtensionDays) err('request.extensionDays', 'DAYS_RANGE');
    }
    if (r.type === 'LATE_FEE_WAIVER' && [50, 100].indexOf(num(r.lateFeeAmount)) === -1) err('request.lateFeeAmount', 'REQUIRED');

    var reason = sub.reason || {};
    if (REASONS.indexOf(reason.category) === -1) err('reason.category', 'REQUIRED');
    if (String(reason.statement || '').trim().length < LIMITS.minStatement) err('reason.statement', 'STATEMENT_SHORT');
    if (!sub.declaration) err('declaration', 'DECLARATION');

    var files = sub.files || [];
    if (files.length > LIMITS.maxFiles) err('files', 'FILE_COUNT');
    files.forEach(function (f, i) {
      if (FILE_TYPES.indexOf(f.mimeType) === -1) err('files.' + i, 'FILE_TYPE');
      if ((f.size || 0) > LIMITS.maxFileBytes) err('files.' + i, 'FILE_SIZE');
    });
    return errs;
  }

  return {
    GRADES: GRADES, PLANS: PLANS, PROGRAMMES: PROGRAMMES, CHILD_RELATIONSHIPS: CHILD_RELATIONSHIPS,
    GUARDIAN_RELATIONSHIPS: GUARDIAN_RELATIONSHIPS, REQUEST_TYPES: REQUEST_TYPES, REASONS: REASONS,
    OTHER_FEES: OTHER_FEES, FILE_TYPES: FILE_TYPES, LIMITS: LIMITS, AUTHORITY: AUTHORITY,
    gradeInfo: gradeInfo, tuitionFor: tuitionFor, capitalFor: capitalFor, otherFeeFor: otherFeeFor,
    orderChildren: orderChildren, fullPaymentPct: fullPaymentPct,
    computeEntitlement: computeEntitlement, compareRequest: compareRequest, routeRequest: routeRequest,
    evaluate: evaluate, academicYearOptions: academicYearOptions,
    formatRequestId: formatRequestId, parseRequestId: parseRequestId, validate: validate, round2: round2
  };
});
