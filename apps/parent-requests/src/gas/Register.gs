/**
 * The register: a Google Sheet with the tabs described in
 * docs/parent-request-register/design.md. Headers come from schema.csv (see
 * Schema.gs, generated), so the sheet and the documentation cannot drift.
 */

var INTAKE_HEADERS = ['Received At', 'Request ID', 'Submission (files removed)', 'Calculation'];
var HEADER_FILL = '#e8eef0';

/**
 * Run once from the Apps Script editor. Creates the register and the documents
 * folder (or reuses the ones in CONFIG), and the tabs with their headers.
 * Safe to run again: it never clears or reorders a tab that already has data.
 */
function setupRegister() {
  var props = PropertiesService.getScriptProperties();
  var id = cfg_('registerSpreadsheetId');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create('Parent Fee Requests — Register');
  if (!id) props.setProperty('registerSpreadsheetId', ss.getId());
  if (!cfg_('documentsFolderId')) {
    props.setProperty('documentsFolderId', DriveApp.createFolder('Parent Fee Requests — Documents').getId());
  }

  writeReadme_(ss);
  ensureTab_(ss, '01_INTAKE', INTAKE_HEADERS);
  ['02_REQUESTS', '03_REQUEST_STUDENTS', '04_DECISION_LINES'].forEach(function (t) { ensureTab_(ss, t, SCHEMA[t]); });
  writeFeeRules_(ss);
  writeLookups_(ss);

  var stray = ss.getSheetByName('Sheet1');
  if (stray && ss.getSheets().length > 1 && stray.getLastRow() === 0) ss.deleteSheet(stray);

  console.log('Register: ' + ss.getUrl());
  console.log('Documents: ' + DriveApp.getFolderById(cfg_('documentsFolderId')).getUrl());
  return ss.getUrl();
}

function register_() {
  var id = cfg_('registerSpreadsheetId');
  if (!id) throw new Error('No register configured. Run setupRegister() once from the Apps Script editor.');
  return SpreadsheetApp.openById(id);
}

function ensureTab_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  var width = sh.getLastColumn();
  var existing = width ? sh.getRange(1, 1, 1, width).getValues()[0].filter(String) : [];
  if (!existing.length) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground(HEADER_FILL);
    sh.setFrozenRows(1);
    return sh;
  }
  // A tab with data is never rewritten. New schema columns are appended at the end.
  var missing = headers.filter(function (h) { return existing.indexOf(h) === -1; });
  if (missing.length) {
    sh.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold').setBackground(HEADER_FILL);
    console.warn(name + ': added missing columns ' + missing.join(', '));
  }
  return sh;
}

// ------------------------------------------------------------------ IDs

/**
 * Next PR-YYYY-NNNN for the academic year. Takes the larger of the stored
 * counter and the highest ID already in the sheet, so a reset property or a
 * pasted-in row can never produce a duplicate. Call only while holding the lock.
 */
function nextRequestId_(ss, academicYear) {
  var yy = academicYear.slice(2, 4) + academicYear.slice(7, 9);
  var key = 'seq_' + yy;
  var props = PropertiesService.getScriptProperties();
  var fromProp = Number(props.getProperty(key) || 0);
  var fromSheet = 0;
  var sh = ss.getSheetByName('02_REQUESTS');
  if (sh.getLastRow() >= 2) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (r) {
      var p = FeeEngine.parseRequestId(r[0]);
      if (p && p.yy === yy && p.seq > fromSheet) fromSheet = p.seq;
    });
  }
  var next = Math.max(fromProp, fromSheet) + 1;
  props.setProperty(key, String(next));
  return FeeEngine.formatRequestId(academicYear, next);
}

// ------------------------------------------------------------------ writing rows

var HEADERS_ = {};
function headers_(sh) {
  var n = sh.getName();
  if (!HEADERS_[n]) HEADERS_[n] = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return HEADERS_[n];
}

/**
 * Text a parent typed must never become a formula: a statement starting with
 * "=" would run, and "+855 12 …" would be parsed as arithmetic. Prefixing an
 * apostrophe stores it as plain text.
 */
function cellSafe_(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

/** Appends rows in one write. Call only while holding the lock. */
function appendRows_(ss, tab, objs) {
  if (!objs.length) return 0;
  var sh = ss.getSheetByName(tab), h = headers_(sh);
  var rows = objs.map(function (o) { return h.map(function (k) { return cellSafe_(o[k]); }); });
  var start = sh.getLastRow() + 1;
  sh.getRange(start, 1, rows.length, h.length).setValues(rows);
  return start;
}

/** Finds the row by Request ID at the moment of writing, so a sort in between cannot misplace it. */
function setCellById_(ss, tab, requestId, column, value) {
  var sh = ss.getSheetByName(tab), h = headers_(sh);
  var col = h.indexOf(column);
  if (col === -1 || sh.getLastRow() < 2) return false;
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === requestId) { sh.getRange(i + 2, col + 1).setValue(cellSafe_(value)); return true; }
  }
  return false;
}

function yn_(b) { return b ? 'Yes' : 'No'; }

function campusOf_(grade) {
  var info = FeeEngine.gradeInfo(grade);
  if (!info) return '';
  if (info.level === 'EARLY' || grade === 'KG') return 'KG';
  return Number(grade.slice(1)) <= 6 ? 'Primary' : 'Secondary';
}

function campuses_(sub) {
  var seen = [];
  sub.children.forEach(function (c) { var x = campusOf_(c.grade); if (x && seen.indexOf(x) === -1) seen.push(x); });
  return seen.join(' / ');
}

var PLAN_LABELS_ = { FULL: 'Full payment', INST2: '2 instalments', INST4: '4 instalments' };

function askSummary_(sub) {
  if (sub.request.type !== 'DISCOUNT') return FeeMessages.label('en', 'request', sub.request.type);
  var parts = [];
  sub.children.forEach(function (c, i) {
    var a = c.ask, bits = [];
    if (Number(a.tuitionPct) > 0) bits.push('tuition ' + a.tuitionPct + '%');
    if (Number(a.capitalPct) > 0) bits.push('capital ' + a.capitalPct + '%');
    if (Number(a.otherPct) > 0 && a.otherFee) bits.push(FeeMessages.tr('en', a.otherFee).toLowerCase() + ' ' + a.otherPct + '%');
    if (bits.length) parts.push(FeeMessages.childName('en', sub, i) + ': ' + bits.join(', '));
  });
  return parts.join('; ');
}

function requestDetails_(sub) {
  var r = sub.request, out = [];
  if (r.type === 'EXTENSION') out.push(r.extensionDays + ' extra days' + (r.extensionInstalment ? ' — ' + r.extensionInstalment : ''));
  if (r.type === 'LATE_FEE_WAIVER') out.push('Late charge $' + r.lateFeeAmount + (r.lateFeeFirstTime ? ', first waiver' : ', waived before'));
  if (r.details) out.push(r.details);
  return out.join('\n');
}

function appendRequest_(ss, id, sub, result, autoResolved) {
  var M = FeeMessages;
  var cmp = result ? result.comparison : null;
  var route = result ? result.route : { tier: 'FINANCE_OFFICER', reasons: ['NO_RULES_FOR_YEAR'] };
  var discount = sub.request.type === 'DISCOUNT';
  return appendRows_(ss, '02_REQUESTS', [{
    'Request ID': id,
    'Submitted At': new Date(),
    'Channel': 'Form',
    'Academic Year': sub.academicYear,
    'Revision No': 1,
    'Status': autoResolved ? '15 Auto-resolved within policy' : '30 In Review',
    'Decision': autoResolved ? 'Approved' : '',
    'Guardian Name': sub.guardian.name,
    'Relationship': M.label('en', 'guardianRel', sub.guardian.relationship),
    'Email': sub.guardian.email,
    'Phone': sub.guardian.phone,
    'Language': sub.lang === 'km' ? 'Khmer' : 'English',
    'Campus': campuses_(sub),
    'Alumni Family': yn_(sub.guardian.alumni),
    'Staff Family': yn_(sub.guardian.staff),
    'Children in Request': sub.children.length,
    'Request Type': M.label('en', 'request', sub.request.type),
    'Reason Category': M.label('en', 'reason', sub.reason.category),
    'Parent Statement': sub.reason.statement,
    'Ask Summary': askSummary_(sub),
    'Payment Plan': PLAN_LABELS_[sub.plan] || '',
    'Pay By': sub.plan === 'FULL' ? sub.payBy : '',
    'Multi-year': yn_(sub.request.multiYear),
    'Request Details': requestDetails_(sub),
    'Policy Entitlement USD': cmp ? cmp.entitlementUsd : '',
    'Requested USD': cmp && discount ? cmp.requestedUsd : '',
    'Gap USD': cmp && discount ? cmp.gapUsd : '',
    'Within Policy': !cmp || !discount ? '' : cmp.withinPublishedPolicy ? 'Yes' : cmp.withinPolicy ? 'Only via unpublished rule' : 'No',
    'Route': M.STAFF.tiers[route.tier],
    'Route Reasons': route.reasons.map(function (r) { return M.STAFF.reasons[r] || r; }).join('; '),
    'Cost to School USD': cmp && discount ? cmp.gapUsd : '',
    'Decided By': autoResolved ? 'Automatic - within policy' : '',
    'Decision Date': autoResolved ? new Date() : ''
  }]);
}

function appendIntake_(ss, id, sub, result) {
  var clean = JSON.parse(JSON.stringify(sub));
  clean.files = clean.files.map(function (f) { return { name: f.name, mimeType: f.mimeType, size: f.size }; });
  appendRows_(ss, '01_INTAKE', [{
    'Received At': new Date(),
    'Request ID': id,
    'Submission (files removed)': JSON.stringify(clean).slice(0, 49000),
    'Calculation': result ? JSON.stringify({ totals: result.entitlement.totals, comparison: result.comparison, route: result.route }).slice(0, 49000) : ''
  }]);
}

function appendStudents_(ss, id, sub, result) {
  var ent = result ? result.entitlement : null;
  var gaps = {};
  if (result) result.comparison.lines.forEach(function (l) { gaps[l.childIndex] = (gaps[l.childIndex] || 0) + l.gapUsd; });
  var discount = sub.request.type === 'DISCOUNT';
  appendRows_(ss, '03_REQUEST_STUDENTS', sub.children.map(function (c, i) {
    var row = ent && ent.children[i] && ent.children[i].complete ? ent.children[i] : null;
    return {
      'Request ID': id,
      'Student ID': c.isNew ? 'NEW' : c.studentId,
      'Student Name': c.name,
      'Grade': FeeMessages.gradeLabel('en', c.grade),
      'Programme': c.programme,
      'Campus': campusOf_(c.grade),
      'Relationship to Guardian': FeeMessages.label('en', 'childRel', c.relationship),
      'Enrolment Status': c.isNew ? 'New' : 'Existing',
      'Child Order': row ? (row.order || 'Not counted') : '',
      'Tuition Base USD': row ? row.tuition.base : '',
      'Tuition Entitled Pct': row ? row.tuition.policyPct : '',
      'Tuition Asked Pct': discount ? c.ask.tuitionPct : '',
      'Capital Base USD': row ? row.capital.base : '',
      'Capital Entitled Pct': row ? row.capital.policyPct : '',
      'Capital Asked Pct': discount ? c.ask.capitalPct : '',
      'Other Fee': discount && c.ask.otherFee ? FeeMessages.tr('en', c.ask.otherFee) : '',
      'Other Asked Pct': discount && c.ask.otherFee ? c.ask.otherPct : '',
      'Gap USD': discount && gaps[i] ? FeeEngine.round2(gaps[i]) : ''
    };
  }));
}

/** The policy entitlement, written as decision lines. Committee lines are added later, beside them. */
function appendLines_(ss, id, sub, result, rules) {
  if (!result) return;
  appendRows_(ss, '04_DECISION_LINES', result.entitlement.lines.map(function (l, k) {
    var c = sub.children[l.childIndex];
    var cond = l.component === 'FULL_PAYMENT' ? 'Paid in full by ' + sub.payBy
      : l.ruleStatus === 'inferred' ? 'Rule not yet confirmed by the Board' : '';
    return {
      'Line ID': id + '/L' + (k + 1),
      'Request ID': id,
      'Student ID': c.isNew ? 'NEW' : c.studentId,
      'Fee Type': l.fee === 'TUITION' ? 'Tuition' : 'Capital',
      'Basis': 'Percentage',
      'Value': l.pct,
      'Base USD': l.base,
      'Amount USD': l.amount,
      'Authority': l.authority,
      'On Policy': 'Yes',
      'Source': 'Form calculator',
      'Rule Status': l.ruleStatus,
      'Effective From': rules.effectiveFrom,
      'Effective To': rules.effectiveTo,
      'Conditions': cond
    };
  }));
}

// ------------------------------------------------------------------ reference tabs

function writeReadme_(ss) {
  var sh = ss.getSheetByName('00_README') || ss.insertSheet('00_README', 0);
  if (sh.getLastRow() > 0) return;
  var lines = [
    ['Parent Fee Requests — Register'],
    [''],
    ['Two rules'],
    ['1. No request outside the form. An emailed request gets a one-line reply with the form link — it is not retyped here.'],
    ['2. No discount in the finance app without a Request ID in its reference field.'],
    [''],
    ['Tabs'],
    ['01_INTAKE — raw submissions as received. Never edit.'],
    ['02_REQUESTS — one row per family request. Finance Officer fills Review; secretary fills Decision.'],
    ['03_REQUEST_STUDENTS — one row per child named in a request.'],
    ['04_DECISION_LINES — one row per child per fee. Form lines are the policy entitlement; add committee lines beside them.'],
    ['08_FEE_RULES — mirror of the fee rules the form uses. Changing a rule means changing src/rules/*.json and redeploying.'],
    ['09_LOOKUPS — the lists behind every dropdown.'],
    [''],
    ['Design and procedure: docs/parent-request-register/ in the amel_defterim repository.']
  ];
  sh.getRange(1, 1, lines.length, 1).setValues(lines);
  sh.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  sh.setColumnWidth(1, 900);
}

function writeFeeRules_(ss) {
  var sh = ss.getSheetByName('08_FEE_RULES') || ss.insertSheet('08_FEE_RULES');
  sh.clear();  // a mirror, regenerated every time — the source of truth is src/rules/*.json
  var rows = [['Academic Year', 'Rule', 'Applies To', 'Child Order / Band', 'Value', 'Status', 'Published to Parents', 'Note']];
  Object.keys(RULES_BY_YEAR).forEach(function (ay) {
    var R = RULES_BY_YEAR[ay];
    Object.keys(R.tuition.bands).forEach(function (prog) {
      Object.keys(R.tuition.bands[prog]).forEach(function (band) {
        var b = R.tuition.bands[prog][band];
        rows.push([ay, 'Tuition — ' + prog, 'tuition', band, b[0] + ' full / ' + b[1] + ' ×2 / ' + b[2] + ' ×4', R.tuition.status, 'Yes', '']);
      });
    });
    [['Sibling discount', R.sibling], ['Capital ladder', R.capitalLadder]].forEach(function (x) {
      Object.keys(x[1].byOrder).forEach(function (o) {
        rows.push([ay, x[0], x[1].appliesTo, o === '4' ? '4+' : o, x[1].byOrder[o] + '%', x[1].status, yn_(x[1].publishedToParents !== false), x[1].note || x[1].orderRuleNote || '']);
      });
    });
    rows.push([ay, 'Alumni', 'tuition', '1', R.alumni.firstChildPct + '%', R.alumni.status, 'Yes', R.alumni.note]);
    R.fullPayment.byDate.forEach(function (d) {
      rows.push([ay, 'Full payment by ' + d.by, 'tuition + capital', 'all', d.pct + '%', R.fullPayment.status, 'Yes', R.fullPayment.stackingNote]);
    });
    rows.push([ay, 'Delegation — Head of School + CFO', 'gap', '', '≤' + R.delegation.hosCfo.maxGapPoints + ' pts, ≤$' + R.delegation.hosCfo.maxGapUsd + ', ' + R.delegation.hosCfo.maxLines + ' fee', R.delegation.status, 'No', R.delegation.note]);
  });
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold').setBackground(HEADER_FILL);
  sh.setFrozenRows(1);
}

function writeLookups_(ss) {
  var sh = ss.getSheetByName('09_LOOKUPS') || ss.insertSheet('09_LOOKUPS');
  sh.clear();
  var rows = [['List', 'Value', 'Note']].concat(LOOKUPS);
  sh.getRange(1, 1, rows.length, 3).setValues(rows);
  sh.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground(HEADER_FILL);
  sh.setFrozenRows(1);
}
