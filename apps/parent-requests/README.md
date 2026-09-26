# Parent fee request form and calculator

The form parents use to ask for a fee discount, extension, payment plan or late-charge
waiver — and the calculator that works out what the published fee policy already gives
them, so only the difference ever needs a decision.

Design and procedure: [`docs/parent-request-register/`](../../docs/parent-request-register/).

## What it does

**For a parent.** One form for the whole family, in English or Khmer. They list every
child at Paragon, and as they type, a panel shows each child's fees and the discounts
policy already gives — sibling, alumni, full-payment. They say what they are asking for,
per child and per fee, and see which parts are within policy. On sending they get a
reference number (`PR-2627-0042`) and an email that states the policy answer, not just
a receipt.

**For the school.** Every submission lands in the register as one request row, one row
per child, and one decision line per child per fee — each line tagged with the rule that
grants it. The request is routed by the size of the gap between what was asked and what
policy gives: nobody, Finance Officer, CFO, Head of School + CFO, or the Finance
Committee. The finance office gets an email naming who decides and the dollar gap.

**Staff view.** Signed in on `paragonisc.edu.kh`, add `?view=staff` to the form's
address. It also shows the rules not yet published to parents (the capital ladder
today), who decides and why, and the entitlement, request and gap in dollars.

## Why not Google Forms

Google Forms cannot repeat a block per child, cannot check a Student ID, and cannot show
a family their entitlement before they send. So this is an Apps Script web app: the same
Google account, the same Sheet, no new service.

## How it is built

```
src/engine.js          the calculator — pure JavaScript, no I/O
src/messages.js        English and Khmer wording, and the acknowledgement email
src/rules/2026-2027.json   the fee policy as data: tuition, capital, ladders, dates, delegation
src/form.html          the form
src/gas/*.gs           the server: serve the form, validate, assign IDs, write the register, email
build.js               builds dist/gas (Apps Script) and dist/preview (standalone page)
test/                  62 tests
```

The calculator is **one file that runs in three places**: in the tests, in the parent's
browser for the live panel, and on the server when the form is sent. The server never
trusts the browser's figures — it rebuilds the submission from known fields and
recomputes everything.

The register's column headers are generated from
[`schema.csv`](../../docs/parent-request-register/schema.csv), so the sheet and the
documentation cannot drift apart.

## Tests

```
npm test
```

Builds, then runs:

- **Calculator** — every fee in both PDFs; child order checked against real families from
  the register (Thav, Lim, Run: the elder child always carries 0% capital); the second
  child gets 10% sibling, not the 15% the register gave 17 times; full payment stacking;
  nephews and nieces; routing for every request type.
- **Wording** — every English string has a Khmer one; the email never states the
  unconfirmed capital ladder to a parent.
- **Server, end to end** — the built Apps Script files run against in-memory fakes of
  Sheets, Drive, Mail, Lock and Properties: setup, IDs (including after a lost counter),
  every row written, both emails, formula-injection neutralised, oversized files caught
  from their real size, auto-resolution on and off, a year with no fee rules.
- **Build** — the preview carries the calculator byte for byte.

## Deploying

Deploy from an account **on `paragonisc.edu.kh`** (the finance office account is the
natural owner). The staff view recognises staff by domain, and the register should belong
to the finance office, not to IT.

1. Build: `npm test` (Node 18 or later). This writes `dist/gas/`.
2. Create a new Apps Script project at [script.google.com](https://script.google.com).
3. Put the files in it — either:
   - **clasp:** `npm i -g @google/clasp`, `clasp login`, copy `.clasp.json.example` to
     `.clasp.json` with the project's Script ID, then `npm run push`; or
   - **by hand:** for each file in `dist/gas/`, create a file with the same name and
     paste the contents (`.gs` → Script, `.html` → HTML). For `appsscript.json`, turn on
     *Project Settings → Show "appsscript.json" manifest file* and paste over it.
4. In the editor, select `setupRegister` and **Run**. Approve the permissions. The log
   prints the new register's address and the documents folder.
5. **Deploy → New deployment → Web app.** Execute as: *Me*. Who has access: *Anyone*.
   Copy the web app address.
6. Put that address on the fees page, in the re-registration letter, and in the Finance
   Officer's signature and auto-reply. English by default; `?lang=km` opens in Khmer.

**Two things the Workspace admin may need to do.** If the domain does not allow web apps
to be shared with *Anyone*, the admin must allow it for this project, or families will be
asked to sign in to Google. And anonymous visitors see Google's line *"This application
was created by a Google Apps Script user"* above the form; embedding the form in a Google
Site hides it.

**Changing the rules.** Edit `src/rules/2026-2027.json` — or add `2027-2028.json` when the
new fees are published — then `npm test`, push, and **Deploy → Manage deployments → New
version**. The `08_FEE_RULES` tab is a mirror for reading, not the source.

## Before families use it

Each of these is a decision, not a code change — the code is waiting on them.

1. **Khmer wording reviewed by a native speaker.** It was drafted without one. All of it is
   in `src/messages.js`.
2. **The Board confirms the capital ladder** (0/20/40/60 by child order). Then set
   `capitalLadder.status` to `confirmed` and `publishedToParents` to `true`. Until then it
   is computed for staff and hidden from parents, and nothing relying on it closes itself.
3. **Confirm three rules the register implies but no document states:** the eldest child
   is the first child; nephews and nieces do not count toward child order; the
   full-payment discount applies after the sibling discount, not added to it. Each is one
   setting in the rules file.
4. **The Finance Committee sets the delegation thresholds** (`delegation` in the rules
   file; proposed: a gap of up to 10 points on one fee, costing up to $1,000, goes to Head
   of School + CFO).
5. **Then** set `autoResolveEnabled: true` in `src/gas/Config.gs`, so requests within the
   published policy close the same day. Until then they go to the Finance Officer to
   confirm.
6. **One real family end to end** — submit, check the register rows, check both emails.

## Not built yet

The next pieces of the procedure: the committee's agenda (requests where the ask is above
policy), the Accounts worklist (approved lines not yet applied), a precedent view,
protected ranges per role, a way for the secretary to record a decision as lines, the
monthly reconciliation against the finance app, and moving the four legacy registers in.
