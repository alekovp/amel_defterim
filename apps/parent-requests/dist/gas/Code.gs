/**
 * Paragon ISC — parent fee request web app.
 *
 * doGet serves the form. submitRequest is the only way in: it re-validates and
 * recomputes everything from the raw submission (the browser's figures are never
 * trusted), assigns the Request ID under a lock, writes the register, files the
 * documents and emails the family.
 */

function doGet(e) {
  var p = (e && e.parameter) || {};
  var staff = p.view === 'staff' && isStaff_();
  var tpl = HtmlService.createTemplateFromFile('Form');
  tpl.boot = safeJson_({
    mode: 'live',
    view: staff ? 'staff' : 'parent',
    lang: p.lang === 'km' ? 'km' : 'en',
    today: today_(),
    rules: RULES_BY_YEAR,
    example: false
  });
  return tpl.evaluate()
    .setTitle('Paragon ISC — Fee request')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function submitRequest(raw) {
  var sub = normalise_(raw);
  var errors = FeeEngine.validate(sub);
  if (errors.length) return { ok: false, errors: errors };

  var rules = RULES_BY_YEAR[sub.academicYear] || null;
  var result = rules ? FeeEngine.evaluate(sub, rules, { today: today_() }) : null;
  var autoResolved = !!(result && cfg_('autoResolveEnabled') &&
    result.route.tier === 'AUTO' && result.comparison.withinPublishedPolicy);

  var ss = register_();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  var requestId;
  try {
    // Every sheet write happens under the lock, as batched appends, so two
    // families submitting at once can never share an ID or overwrite rows.
    requestId = nextRequestId_(ss, sub.academicYear);
    appendRequest_(ss, requestId, sub, result, autoResolved);
    appendIntake_(ss, requestId, sub, result);
    appendStudents_(ss, requestId, sub, result);
    appendLines_(ss, requestId, sub, result, rules);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  // Slow work outside the lock: the ID is reserved and the rows exist.
  try {
    var folderUrl = saveFiles_(requestId, sub);
    if (folderUrl) setCellById_(ss, '02_REQUESTS', requestId, 'Documents', folderUrl);
  } catch (err) {
    console.error('Files for ' + requestId + ' not saved: ' + err);
  }
  try {
    sendAcknowledgement_(requestId, sub, result, rules, autoResolved);
    if (autoResolved) {
      setCellById_(ss, '02_REQUESTS', requestId, 'Informed Date', new Date());
      setCellById_(ss, '02_REQUESTS', requestId, 'Informed By', 'Form (automatic)');
      setCellById_(ss, '02_REQUESTS', requestId, 'Informed Channel', 'Email');
    }
  } catch (err) {
    console.error('Acknowledgement for ' + requestId + ' not sent: ' + err);
  }
  try {
    notifyFinance_(requestId, sub, result, ss, autoResolved);
  } catch (err) {
    console.error('Finance notification for ' + requestId + ' not sent: ' + err);
  }

  return { ok: true, requestId: requestId };
}

// ------------------------------------------------------------------ helpers

function isStaff_() {
  var email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  return !!email && email.split('@')[1] === String(cfg_('staffDomain')).toLowerCase();
}

function today_() {
  return Utilities.formatDate(new Date(), cfg_('timezone'), 'yyyy-MM-dd');
}

/** JSON safe to drop inside a <script> tag. */
function safeJson_(o) {
  // U+2028/U+2029 are legal in JSON but end a line inside a <script>.
  var LS = String.fromCharCode(0x2028), PS = String.fromCharCode(0x2029);
  return JSON.stringify(o).replace(/</g, '\\u003c').split(LS).join('\\u2028').split(PS).join('\\u2029');
}

/**
 * Rebuild the submission from known fields only, trimmed and capped. Anything
 * else the browser sent is dropped. File sizes are recomputed from the data.
 *
 * Caps only bound size. They sit well above any valid length so that
 * validation decides what is acceptable: a cap of 6 on Student ID would turn
 * "105317 105320" into the valid "105317" and hide the error.
 */
function normalise_(raw) {
  raw = raw || {};
  function s(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 200); }
  function b(v) { return v === true || v === 'true'; }
  var g = raw.guardian || {}, r = raw.request || {}, rs = raw.reason || {};
  return {
    lang: raw.lang === 'km' ? 'km' : 'en',
    academicYear: s(raw.academicYear, 20),
    guardian: { name: s(g.name, 120), relationship: s(g.relationship, 20), phone: s(g.phone, 40),
      email: s(g.email, 120), alumni: b(g.alumni), staff: b(g.staff) },
    children: (Array.isArray(raw.children) ? raw.children : []).slice(0, 12).map(function (c) {
      c = c || {};
      var a = c.ask || {};
      return { name: s(c.name, 120), studentId: s(c.studentId, 40), isNew: b(c.isNew), programme: s(c.programme, 40),
        grade: s(c.grade, 20), relationship: s(c.relationship, 20),
        ask: { tuitionPct: s(a.tuitionPct, 12), capitalPct: s(a.capitalPct, 12), otherFee: s(a.otherFee, 40), otherPct: s(a.otherPct, 12) } };
    }),
    plan: s(raw.plan, 20),
    payBy: s(raw.payBy, 20),
    request: { type: s(r.type, 40), multiYear: b(r.multiYear), extensionDays: s(r.extensionDays, 12),
      extensionInstalment: s(r.extensionInstalment, 200), lateFeeAmount: s(r.lateFeeAmount, 12),
      lateFeeFirstTime: b(r.lateFeeFirstTime), details: s(r.details, 2000) },
    reason: { category: s(rs.category, 40), statement: s(rs.statement, 5000) },
    declaration: b(raw.declaration),
    files: (Array.isArray(raw.files) ? raw.files : []).slice(0, 6).map(function (f) {
      f = f || {};
      var data = typeof f.data === 'string' ? f.data : '';
      var pad = (data.match(/=+$/) || [''])[0].length;
      return { name: s(f.name, 150), mimeType: s(f.mimeType, 60), data: data,
        size: data ? Math.floor(data.length * 3 / 4) - pad : Number(f.size) || 0 };
    })
  };
}

function saveFiles_(requestId, sub) {
  var files = sub.files.filter(function (f) { return f.data; });
  if (!files.length) return '';
  var parent = DriveApp.getFolderById(cfg_('documentsFolderId'));
  var folder = parent.createFolder(requestId + ' — ' + sub.guardian.name);
  files.forEach(function (f) {
    folder.createFile(Utilities.newBlob(Utilities.base64Decode(f.data), f.mimeType, f.name));
  });
  return folder.getUrl();
}
