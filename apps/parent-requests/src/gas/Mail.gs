/** Emails: the family's acknowledgement, and a short notice to the finance office. */

function sendAcknowledgement_(requestId, sub, result, rules, autoResolved) {
  var msg = result && rules
    ? FeeMessages.renderAcknowledgement({ lang: sub.lang, requestId: requestId, submission: sub, result: result, rules: rules, autoResolve: autoResolved })
    : genericAcknowledgement_(requestId, sub);
  MailApp.sendEmail({
    to: sub.guardian.email,
    subject: msg.subject,
    body: msg.text,
    htmlBody: msg.html,
    replyTo: cfg_('replyToEmail'),
    name: 'Paragon ISC Finance Office'
  });
}

/** Used when no fee rules are loaded for the year the family chose. */
function genericAcknowledgement_(requestId, sub) {
  var lang = sub.lang, T = function (k, v) { return FeeMessages.tr(lang, k, v); };
  var paras = [
    T('mDear', { name: sub.guardian.name }),
    T('mThanks', { id: requestId }),
    T('mReviewOther', { n: 10 }),
    T('mContact', { phone: FeeMessages.CONTACT.phone, hours: FeeMessages.CONTACT.hours[lang] || FeeMessages.CONTACT.hours.en }),
    T('mSign')
  ];
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  return {
    subject: T('mSubject', { id: requestId }),
    text: paras.join('\n\n'),
    html: '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#16232a;max-width:600px">' +
      paras.map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('') + '</div>'
  };
}

function notifyFinance_(requestId, sub, result, ss, autoResolved) {
  var to = cfg_('financeOfficerEmail');
  if (!to) return;
  var M = FeeMessages;
  var route = result ? result.route : { tier: 'FINANCE_OFFICER', reasons: ['NO_RULES_FOR_YEAR'] };
  var ent = result ? result.entitlement : null;
  var cmp = result ? result.comparison : null;
  var lines = [
    requestId + ' — ' + sub.guardian.name + ' (' + sub.guardian.email + ', ' + sub.guardian.phone + ')',
    '',
    'Decided by: ' + M.STAFF.tiers[route.tier] + (autoResolved ? ' — auto-resolved' : ''),
    'Why: ' + route.reasons.map(function (r) { return M.STAFF.reasons[r] || r; }).join('; '),
    'Request: ' + M.label('en', 'request', sub.request.type) + (sub.request.multiYear ? ' (more than one year)' : ''),
    'Asks: ' + (askSummary_(sub) || '—'),
    ''
  ];
  sub.children.forEach(function (c, i) {
    var row = ent && ent.children[i];
    lines.push('  • ' + (c.name || 'Student ' + (i + 1)) + ' — ' + (c.isNew ? 'new student' : c.studentId) + ', ' +
      M.gradeLabel('en', c.grade) + ' ' + c.programme + (row && row.complete ? ', child order ' + (row.order || 'not counted') : ''));
  });
  if (cmp && sub.request.type === 'DISCOUNT') {
    lines.push('', 'Policy entitlement: ' + M.money(cmp.entitlementUsd) + '   Gap to decide: ' + M.money(cmp.gapUsd));
  }
  lines.push('', 'Register: ' + ss.getUrl());
  MailApp.sendEmail({
    to: to,
    subject: '[' + requestId + '] ' + M.STAFF.tiers[route.tier] + ' — ' + sub.guardian.name,
    body: lines.join('\n'),
    name: 'Parent fee request form'
  });
}
