# Parent Request & Board Decision Register — Design

**Owner:** Polat Allekov, Head of IT / Finance, Paragon International School Cambodia
**Status:** Draft for review — 21 September 2026
**Replaces:** the current free-form parent-requests spreadsheet

---

## 0. The problem in one sentence

Requests, reviews and decisions are recorded as prose in a grid, so nothing can be
filtered, summed, matched to a finance entry, or used as precedent for the next
request — and decisions drift from what is actually applied to a family's account.

## 1. Evidence

The parent-requests sheet itself was not readable from `headofit@paragon.com.kh`
(access pending). The analysis below is taken from the two sheets **downstream of
the same decisions**, which are readable and exhibit the same failure modes:

- *Pathway Scholarship 2026-27* (`psupervisor@`, id `1lNId3fw…`)
- *StudentSCL* (`csok@`, id `16yMl0vI…`)

### 1.1 Decisions are prose, not data

Offers are recorded as:

```
50% (tuition and Cap.)
25%(50% If they will come both)
50% (capital / tution / enrollmnt )
0-10%
25%-50
```

None of these can be filtered, summed, or handed to the finance app without a
human reading and interpreting them. Two readers will interpret `25%-50`
differently.

### 1.2 Decisions drift from what is applied

| Student | Decision as recorded | What StudentSCL shows applied |
| --- | --- | --- |
| Chan Derisa (109285) | 50% tuition **and capital** | tuition 50%, capital **0%**, enrolment **100%** |
| Tith Sonita (109271) | 50% | tuition 50%, enrolment **100%** |
| Ear Sovansakhena (109322) | 75% tuition and capital | that, plus enrolment **100%** |
| Pech Chanmonypich (109298) | 50% capital / tuition, *"Extra Enrolment off"* in the comments column | tuition 50%, capital 50%, enrolment 100% |

Capital fee was decided for Derisa and not applied. Enrolment-fee waivers are
applied to students whose decision record does not mention them — in one case the
only trace is a phrase in a free-text comment column.

Either the enrolment waiver is a **standing rule** for scholarship holders — in
which case it should not be recorded per student as if it were a decision — or it
is an **undocumented decision**. From the sheets alone you cannot tell which.
That ambiguity is the core disease, and §4 addresses it directly.

### 1.3 An arithmetic error that nothing catches

*StudentSCL*, Sok Panha Meng (109160), enrolment fee:

| Fee | Discount % | After discount | Discount amount |
| --- | --- | --- | --- |
| $1,500.00 | **100%** | **$500.00** | **$1,000.00** |

Three cells that contradict each other. A single variance check would have caught
it on the day it was typed.

### 1.4 Names are the key, and names do not match

Student `109301` is **Pech Sokleappy** in one sheet and **Chanleaphy Pech** in the
other. Any process that joins on names will silently mismatch.
**Student ID must be the only join key.**

### 1.5 Conditions live in prose and are never checked off

*"25% (50% If they will come both)"* — both siblings did enrol and 50% was
applied, but nowhere is it recorded that anyone verified the condition. Next year
nobody will know the 50% was conditional at all.

### 1.6 Opinions sit in the same row as the decision

Columns `Mr Udom`, `Mr Hydyr`, `Offer` — two individual recommendations and a
final number, side by side, with no date and no record of who made the final call.

### 1.7 No dates anywhere

Not submitted, not decided, not applied. So: no ageing, no service standard, no
way to answer *"when was this agreed?"*, and no way to see a request going stale.

### 1.8 Status is a communications diary

```
we have informed them n they are appreciate it )
Seen no reply.
No answer phone call and telegram.
They wont use schoolarship
```

Real and useful information in the wrong column. It cannot be filtered, so it
cannot drive a worklist.

### 1.9 Multi-year commitments with no expiry

*StudentSCL* carries a **Total Discount for 3 YEARS** column — $223,950 committed
across the top cohort alone — with no effective-to date on any line. Nothing
triggers a review, and nothing expires.

### 1.10 Layout that breaks on sort

`PATHWAY` and `GRADE 7` are label rows inside the data. Totals rows sit inside the
data. A second table is wedged into the right-hand columns starting at row 1. Any
sort destroys the file.

### 1.11 Discount decisions are scattered across at least four sheets

*Pathway Scholarship 2026-27*, *StudentSCL*, *Siblings 2026/207*,
*Student Fee Review 2026* and the parent-requests sheet all hold discount-adjacent
decisions, owned by four different people. No one of them is authoritative.

---

## 2. The design in one sentence

**One register. One ID. One row per request. The row moves through stages and is
never retyped.**

---

## 3. The Request ID

```
PR-2627-0042
│  │    └── zero-padded sequence within the academic year
│  └─────── academic year 2026-2027
└────────── Parent Request
```

Rules:

1. Assigned **automatically by script** the moment the form is submitted.
2. Sent to the parent in the acknowledgement email immediately, so every later
   phone call, letter and email can reference it.
3. Never encodes the request type or the decision — both can change; the ID cannot.
4. A re-submission after *Needs Info* **keeps the same ID**.
5. A request in a later year gets a new ID with `Supersedes` pointing at the old one.
6. An appeal gets a new ID with `Appeal Of` pointing at the original.
7. Never reused, never renumbered, even if a request is withdrawn.

Companion references:

| Reference | Format | Example |
| --- | --- | --- |
| Board meeting | `BM-YYYY-MM-DD` | `BM-2026-11-05` |
| Decision line | `PR-2627-0042/L1` | one per fee type |
| Finance entry | the finance app's own document number | recorded back into the register |

---

## 4. Rule vs exception — the change that cuts board load

The single biggest win available. Today everything looks like a decision.

- A **rule** is in the fee policy. It applies to anyone who meets the criteria.
  Nobody decides it; finance applies it. *Sibling discount, staff-child discount,
  early-payment discount* are rules.
- An **exception** is a departure from the policy for one family. That is what the
  board exists to decide.

Only exceptions enter this register. If a family qualifies for a policy rule, the
answer is "yes, automatically" and no request is created.

### Proposed delegation table

The board sets the numbers; the shape is what matters.

| Case | Decided by |
| --- | --- |
| Discount already provided for in the fee policy | Nobody — finance applies it |
| Late fee waiver ($50 / $100), first occurrence | Finance Manager |
| Payment extension up to 30 days | Finance Manager |
| Payment plan within the same academic year | CFO |
| Discount ≤ 10% of one fee, one year, cost to school ≤ USD 1,000 | Head of School + CFO jointly |
| Anything larger, any multi-year commitment, any precedent-setting case | **Board** |

Every delegated decision is still recorded in the same register with the same ID.
The only difference is the value of `Decided By`.

---

## 5. Workbook structure

One workbook. Nine tabs. Only **one** of them is edited by hand.

| Tab | Purpose | Written by |
| --- | --- | --- |
| `00_README` | The rules, on one screen | IT, once |
| `01_INTAKE` | Raw form responses — append-only, never edited | Google Form only |
| `02_REQUESTS` | **The master register** — one row per request | Script + staff, band by band |
| `03_DECISION_LINES` | One row per approved fee line | Secretary after the decision |
| `04_BOARD_PACK` | What is on the next agenda | Formula only |
| `05_TO_FINANCE` | Approved lines not yet applied | Formula only |
| `06_PRECEDENT` | Reason × decision × typical value | Formula only |
| `07_LOOKUPS` | Every dropdown list | IT |
| `09_ARCHIVE_RAW` | Frozen copy of today's sheet | One-time, then read-only |

`02_REQUESTS` is protected band by band, so each role can edit only its own
columns. Views are formulas, so they can never fall out of step with the register.

### 5.1 Why decision lines are a separate tab

A decision like *"75% tuition and capital, 100% enrolment"* is **three** things
finance must enter. Putting them in one cell produces §1.1. Putting them in
repeating column blocks produces *StudentSCL*'s 24-column layout, which cannot be
aggregated.

One row per fee line, each carrying the Request ID, is the shape finance needs and
the shape that sums correctly:

| Line ID | Request ID | Student ID | Fee Type | Basis | Value | Effective From | Effective To | Finance Ref | Applied Value | Variance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PR-2627-0042/L1 | PR-2627-0042 | 109322 | Tuition | Percentage | 75 | 2026-06-01 | 2027-05-31 | | | |
| PR-2627-0042/L2 | PR-2627-0042 | 109322 | Capital | Percentage | 75 | 2026-06-01 | 2027-05-31 | | | |
| PR-2627-0042/L3 | PR-2627-0042 | 109322 | Enrolment | Percentage | 100 | 2026-06-01 | 2027-05-31 | | | |

`Variance = Applied Value − Value`. **It must be zero.** This is the control that
would have caught Chan Derisa's missing capital-fee discount.

`Effective To` is **mandatory**. No discount is open-ended. A multi-year award is
recorded as one line per year, each renewed deliberately, which fixes §1.9.

---

## 6. `02_REQUESTS` — columns, in six bands

Column groups are collapsible, so each role works in one visible block.

### Band A — Identity (script-written, locked to everyone)

`Request ID` · `Submitted At` · `Academic Year` · `Status` · `Decision` ·
`Days in Stage` (formula) · `Supersedes` · `Appeal Of`

### Band B — Parent & student (from the form)

`Student ID` **(mandatory — the only join key)** · `Student Name` · `Grade` ·
`Guardian Name` · `Relationship` · `Phone` · `Email` · `Language (KH/EN)` ·
`Siblings at School`

### Band C — The ask (from the form)

`Request Type` · `Fee(s) Affected` · `Basis (Percentage / Fixed / Plan / Deferral / Waiver)` ·
`Value Requested` · `Period From` · `Period To` · `Reason Category` ·
`Parent Statement` · `Documents` (Drive folder link)

### Band D — School review (Finance Officer)

`Reviewed By` · `Review Date` · `Outstanding Balance` ·
`Payment History (On time / Occasional late / In arrears)` · `Years at School` ·
`Existing Discount %` · `Full Fee (USD)` · `Policy Reference` ·
`Prior Requests` (formula, COUNTIFS on Student ID) · `Precedent IDs` ·
`School Recommendation` · `Recommended Value` ·
**`Cost to School (USD)`** (formula) · `Review Notes`

`Cost to School` is the number the board actually needs and the number that is
missing today.

### Band E — Decision (Secretary / Head of School)

`Decided By` · `Board Meeting Ref` · `Decision Date` · `Decision` ·
`Conditions` · `Condition Met? (Yes / No / N/A)` · `Minute Link`

The per-fee detail lives in `03_DECISION_LINES`, not here.
`Condition Met?` fixes §1.5.

### Band F — Fulfilment (Finance)

`Parent Notified Date` · `Letter Link` · `Finance Applied Date` ·
`Finance Applied By` · `Reconciled?` (formula: all lines variance = 0)

### Band G — Legacy

`Legacy Notes` — one column holding anything from the old sheet that maps nowhere.
Nothing is ever discarded.

---

## 7. Status model

Two columns, not one. Mixing "where it is" with "what was decided" is what makes
the current sheet unfilterable.

**`Status` — where the request is.** Numeric prefixes so it sorts correctly:

| Code | Status | Service standard |
| --- | --- | --- |
| `10` | Submitted | acknowledged same day (automatic) |
| `20` | Needs Info | parent has 10 working days, then auto-withdrawn |
| `30` | In Review | 5 working days |
| `40` | Ready for Board | — |
| `50` | On Agenda | cut-off 7 days before the meeting |
| `60` | Decided | 3 working days to notify |
| `70` | Parent Notified | 3 working days to apply |
| `80` | Applied in Finance | — |
| `90` | Closed | — |
| `95` | Withdrawn | — |

**`Decision` — what was decided.** Blank until `Status ≥ 60`:
`Approved` · `Approved with conditions` · `Declined` · `Deferred`

### The four filters that run the process

| Who | Filter |
| --- | --- |
| Front desk | `Status = 10` |
| Finance review | `Status = 30` |
| Board secretary | `Status = 40` |
| Finance entry | `Status = 70` |
| Anyone, weekly | `Days in Stage > service standard` |
| Monthly | `Variance ≠ 0` |

---

## 8. The flow

```
              Parent submits the form  (Khmer + English, one form)
                          │
         [script]  ID assigned · Drive folder created · parent emailed        same day
                          │
              Front desk: completeness check                                  2 working days
                          │
            ┌─────────────┴──────────────┐
      incomplete                     complete
            │                            │
      20 Needs Info                      │
      10 working days                    │
      no reply → 95 Withdrawn            │
                                         │
              Finance Officer: review band filled                             5 working days
                          │
            ┌─────────────┴──────────────┐
   within delegated authority      above threshold
            │                            │
   Head of School / CFO decides    40 Ready for Board
      3 working days                     │
            │                   cut-off 7 days before meeting
            │                            │
            │                     Board decides                               monthly
            └─────────────┬──────────────┘
                          │
              60 Decided → decision lines written, letter sent                3 working days
                          │
              70 Parent Notified
                          │
              Finance applies, writes PR-ID into the reference field           3 working days
                          │
              80 Applied in Finance
                          │
              Monthly reconciliation: every variance must be zero
                          │
              90 Closed
```

---

## 9. The link to the finance app

This is the whole point of the ID, and it needs **two** controls — one in each
direction. One alone is not enough.

**Control 1 — forward.** No discount is entered in the finance app without a
Request ID in its reference or memo field. No ID, no discount. This is a finance
office rule, enforced by finance.

**Control 2 — reverse.** Monthly, export every discount line from the finance app
and match on Request ID:

| Finding | Meaning | Action |
| --- | --- | --- |
| Finance line with no Request ID | Unauthorised discount | Investigate, then regularise or reverse |
| Approved line with no finance line | Granted but never applied | Apply it — the family will chase eventually |
| Values differ | `Variance ≠ 0` | Correct one side, record which |
| Effective-to date passed, discount still live | Expired award still running | Renew deliberately or stop |

On the evidence in §1.2, this will find things in the first month.

> **Open dependency.** The design assumes a discount line in the finance app has a
> free-text reference or memo field that can hold `PR-2627-0042`. If it does not,
> the join must be made through a mapping tab keyed on the finance app's own line
> ID — workable, but weaker, because nothing then stops an unreferenced discount
> being created. This needs confirming before build.

---

## 10. Precedent — making the next decision easier

`06_PRECEDENT` is a pivot over decided requests:

| Reason Category | Requests | Approved | Declined | Median approved % | Range |
| --- | --- | --- | --- | --- | --- |
| Loss of income | 14 | 9 | 5 | 25% | 10–50% |
| Medical hardship | 6 | 6 | 0 | 50% | 25–75% |
| Multiple children | 11 | 7 | 4 | 15% | 10–25% |

Plus, on every open request, `Prior Requests` and `Precedent IDs` so the board can
see at a glance what was done in comparable cases. Consistency stops being a
matter of memory.

---

## 11. Access

| Role | Access |
| --- | --- |
| Parents | The form only. No access to the workbook at all. |
| Front desk / Admissions | Edit band A status + band B |
| Finance Officer | Edit bands D and F |
| CFO / Head of School | Edit band E, plus everything above |
| Board | `04_BOARD_PACK` view only — never the register |
| IT | Owner |

Protected ranges per band. Views are formula-driven, so they cannot be edited out
of step with the register.

---

## 12. Migrating the existing data

| Phase | Work | Days |
| --- | --- | --- |
| 0 | **Freeze.** Copy the current sheet to `09_ARCHIVE_RAW`, never edit it again. | 1 |
| 1 | **Map columns.** Every existing column to a new field; anything that maps nowhere goes to `Legacy Notes`. Nothing is discarded. | 1–2 |
| 2 | **Backfill IDs.** Sort by date (or existing row order where no date exists); assign `PR-2526-nnnn` and `PR-2627-nnnn`. Write the ID back into the archive copy too, so old and new stay tied. | 2 |
| 3 | **Resolve students.** Match every row to a Student ID from the SIS. Match on ID where present; a name-only row is a manual match. Unmatched rows go to `EXCEPTIONS`. **Do not guess** — see §1.4. | 3–4 |
| 4 | **Normalise decisions.** Split each prose decision into decision lines. This needs a person who knows the cases — budget a working session with finance and whoever ran the scholarship committee, not an afternoon of typing. | 4–6 |
| 5 | **Reconcile against finance.** For every backfilled line, find the matching discount. Three buckets: matched / approved-not-applied / applied-not-approved. Take the third bucket to the board. | 6–8 |
| 6 | **Go live.** Form opens, old sheet read-only, `00_README` states the rule: no request outside the form, no discount without a Request ID. | 8 |
| 7 | **First monthly reconciliation.** Prove the loop closes. | +30 |

---

## 13. Build order

| # | Item | Effort |
| --- | --- | --- |
| 1 | Workbook skeleton, lookups, protections, conditional formatting | 0.5 day |
| 2 | Google Form (Khmer + English) + intake script: ID, Drive folder, acknowledgement email | 1 day |
| 3 | Board pack, to-finance and precedent views | 0.5 day |
| 4 | Parent letter templates driven off the row, reusing the `step1`–`step5` HTML pattern already in use for tuition follow-up | 0.5 day |
| 5 | Legacy migration | per §12 |
| 6 | Monthly reconciliation script | 0.5 day |

---

## 14. Fit with the tuition follow-up ladder

The existing *Tuition Payment Follow-Up — 5 Step Process* leaves an open question:
a family in genuine difficulty has no route except withdrawal, because Step 4
removes the payment-plan offer.

This register is that route. One line in the Step 4 letter — *hardship may be
raised with the Head of School before the Step 5 date* — points at the form, and
the request enters this flow with a Request ID like any other. The collections
ladder and the discretionary route stop being two disconnected processes.

---

## 15. Decisions needed before build

1. **Sheet access.** Share the parent-requests sheet with `headofit@paragon.com.kh`
   (view is enough) so §1 can be redone against the real data.
2. **Finance app reference field.** Confirm the app's name and whether a discount
   line carries a free-text reference. This is the one hard dependency (§9).
3. **Delegation thresholds.** Board to set the numbers in §4.
4. **Rule vs exception.** Confirm which of these are policy rules, not decisions:
   sibling discount, staff-child discount, enrolment-fee waiver for scholarship
   holders. §1.2 suggests the third is being applied as a rule but recorded as a
   decision.
5. **Consolidation.** Decide whether *Pathway Scholarship*, *StudentSCL*,
   *Siblings* and *Student Fee Review* fold into this register or stay separate
   and feed it. Four sources of truth is the reason reconciliation is impossible
   today.
