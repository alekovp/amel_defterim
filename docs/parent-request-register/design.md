# Parent Request & Board Decision Register — Design

**Owner:** Polat Allekov, Head of IT / Finance, Paragon International School Cambodia
**Status:** Draft v2 — 21 September 2026, revised against the real data
**Replaces:** *Parent discount requests - Cross Campus* (`1wNT0YBhf…`)
**Evidence:** [`analysis.md`](analysis.md) — profile of all 361 request rows

---

## 1. What the data changed

Version 1 of this design assumed a request was one student asking for one discount.
The file says otherwise, and three findings rewrote the model:

1. **A request is a family, not a student.** 61% of rows name more than one child —
   up to seven — and each child gets a different answer inside the same cell.
2. **Most of the register is not a decision.** At least 51% of requests were
   answered by applying policy; only 12% contain a grant someone had authority to
   make. 76 of 105 capital-fee grants sit exactly on the published ladder.
3. **There is no form.** 133 of 136 requests arrive as email and are hand-typed
   into the sheet, which is why Student ID — the join key to finance — is present
   and usable on only 15% of rows.

Everything below follows from those three.

---

## 2. The design in one sentence

**Compute what policy already gives. Record only the departures from it. Give every
departure an ID that reaches the finance app and comes back.**

---

## 3. The Request ID

```
PR-2627-0042
│  │    └── zero-padded sequence within the academic year
│  └─────── academic year 2026-2027
└────────── Parent Request
```

1. Assigned **automatically on form submit** — never by hand.
2. Sent to the parent in the acknowledgement immediately, so every later email,
   call and letter references it.
3. Never encodes the request type or the decision — both change; the ID cannot.
4. A resubmission after *Needs Info* keeps the same ID.
5. Negotiation increments `Revision No` on the **same** ID. It never creates a new
   row. (Today 32 families occupy 72 rows for exactly this reason.)
6. A later-year request gets a new ID with `Supersedes` pointing back; an appeal
   gets a new ID with `Appeal Of`.
7. Never reused, never renumbered.

| Companion reference | Format | Example |
| --- | --- | --- |
| Board meeting | `BM-YYYY-MM-DD` | `BM-2026-04-15` |
| Decision line | `PR-2627-0042/L3` | one per child × fee |
| Finance entry | the finance app's own document number | recorded back into the register |

---

## 4. Rule or exception — and how the rule gets computed

This is the change that makes everything else affordable.

- A **rule** is in the fee policy: the capital-fee ladder by child order, the
  sibling discount, alumni, referral, early payment, group enrolment, staff
  contract. Nobody decides these. A formula issues them.
- An **exception** is a departure from the rule for one family. That, and only
  that, is a decision.

### 4.1 `08_FEE_RULES` — the policy, made machine-readable

One row per (fee type × child order × academic year). This table is the thing that
does not exist today, and its absence is why 76 entitlements were typed out by hand
as if they were decisions.

| Fee Type | Child Order | Relationship | Percentage | Academic Year | Policy Ref |
| --- | --- | --- | --- | --- | --- |
| Capital | 1 | Own child | 0% | 2026-2027 | §4.a |
| Capital | 2 | Own child | 20% | 2026-2027 | §4.a |
| Capital | 3 | Own child | 40% | 2026-2027 | §4.a |
| Capital | 4+ | Own child | 60% | 2026-2027 | §4.a |
| Tuition | 2 | Own child | 15% | 2026-2027 | §4.b |

The ladder changed from 25/50/75 to 0/20/40/60 between years and nothing in the
file records that it changed, when, or by whose decision. Versioning it by academic
year fixes that permanently, and makes every prior year auditable.

> **To confirm before build:** the rows above are inferred from the *granted
> percentages*, not from the fee policy document. The real ladder, the sibling
> ladder, and how `(nephew)` / `(niece)` are treated must be read out of the policy
> and entered here. This table is the foundation — it has to be right.

### 4.2 What the form can answer without a human

On submit, the script looks up each child, sorts them by enrolment order, and
computes the entitlement from `08_FEE_RULES`. Then:

| Case | Route |
| --- | --- |
| Ask **≤** computed entitlement | **Auto-resolved.** Parent is told what policy gives them, same day. No review, no decision. |
| Ask **>** entitlement | Only the **gap** goes to review. |

On this year's figures that removes roughly half the caseload from human hands
before anyone reads a word.

### 4.3 Delegation on the gap

The board sets the numbers; the shape is the point.

| The gap above entitlement | Decided by |
| --- | --- |
| None — ask is within policy | Nobody. Automatic. |
| Late fee waiver, first occurrence · payment extension ≤ 30 days | Finance Manager |
| Payment plan within the academic year | CFO |
| ≤ 10 percentage points on one fee, one year, cost ≤ USD 1,000 | Head of School + CFO |
| Larger · any multi-year commitment · any precedent-setting case | **Board** |

Every delegated decision is recorded in the same register with the same ID. Only
`Decided By` differs.

---

## 5. Three tables, because a request is a family

| Tab | Grain | Rows this year (est.) |
| --- | --- | --- |
| `02_REQUESTS` | one per family request | ~120 |
| `03_REQUEST_STUDENTS` | one per child named in the request | ~200 |
| `04_DECISION_LINES` | one per child × fee type | ~350 |

### 5.1 `02_REQUESTS`

**Identity** — `Request ID` · `Submitted At` · `Channel` · `Academic Year` ·
`Revision No` · `Supersedes` · `Appeal Of` · `Status` · `Decision` ·
`Days in Stage`

**Family** — `Guardian Name` · `Relationship` · `Email` · `Phone` · `Language` ·
`Campus` · `Children in Request` (formula)

**The ask** — `Request Type` · `Reason Category` · `Parent Statement` ·
`Documents` · `Ask Summary`

**Computed** — `Policy Entitlement (USD)` · `Requested (USD)` ·
**`Gap (USD)`** · `Within Policy?`

**Review** — `Reviewed By` · `Review Date` · `Outstanding Balance` ·
`Payment History` · `Years at School` · `Prior Requests` · `Precedent IDs` ·
`Recommendation` · **`Cost to School (USD)`** · `Review Notes`

**Decision** — `Decided By` · `Board Meeting Ref` · `Decision Date` · `Decision` ·
`Conditions` · `Condition Met` · `Minute Link`

**Fulfilment** — `Informed Date` · `Informed By` · `Informed Channel` ·
`Letter Link` · `Finance Applied Date` · `Reconciled` (formula)

**Outcome** — `Re-registered` · `Students Registered` · `Parent Response`

**Legacy** — `Legacy Source` (which of the four registers it came from) ·
`Legacy Notes`

`Informed Date` is a real date set by the script that sends the letter — not
twenty-one spellings of one sentence.

### 5.2 `03_REQUEST_STUDENTS`

`Request ID` · **`Student ID`** (mandatory, validated against the SIS) ·
`Student Name` · `Grade` · `Campus` · `Relationship to Guardian`
(own child / nephew / niece / other) · `Enrolment Status` (new / existing) ·
`Child Order` (computed across the family) · `Years at School`

`Child Order` drives the ladder, so it is computed once here and never retyped.
`Relationship to Guardian` exists because the current data carries `(nephew)` and
`(niece)` and nothing records whether they count toward the sibling ladder.

### 5.3 `04_DECISION_LINES`

`Line ID` · `Request ID` · `Student ID` · `Fee Type` · `Basis` · `Value` ·
**`Authority`** · **`On Policy?`** (formula) · `Effective From` ·
**`Effective To`** · `Conditions` · `Condition Met` · `Finance Ref` ·
`Applied Value` · **`Variance`**

Worked example — today this is one cell of prose; here it is six auditable rows:

| Line | Student | Fee | Value | Authority | On policy? |
| --- | --- | --- | --- | --- | --- |
| `…/L1` | 107619 | Capital | 0% | Policy ladder | ✓ |
| `…/L2` | 107621 | Capital | 20% | Policy ladder | ✓ |
| `…/L3` | 107621 | Tuition | 15% | Sibling policy | ✓ |
| `…/L4` | 107618 | Capital | 40% | Policy ladder | ✓ |
| `…/L5` | 107618 | Tuition | 20% | Sibling policy | ✓ |
| `…/L6` | 107618 | Tuition | 5% | **Board** | ✗ — the decision |

Five entitlements and one decision. Today all six live in a single cell and the
board reads all six. Filter `On Policy? = ✗` and the board's agenda is the last row.

**`Authority`** is one of: Policy ladder · Sibling policy · Alumni · Referral ·
Early/full payment · Group enrolment · Staff contract · Head of School · CFO ·
Board · Chairwoman. All nine of these already exist in the data — as words inside
prose, counted in [`analysis.md`](analysis.md) §7.

**`Variance` = Applied − Value. It must be zero.**
**`Effective To` is mandatory.** "Until graduation" becomes one line per year,
renewed deliberately. There are 16 open-ended commitments in the file today.

---

## 6. Workbook structure

| Tab | Purpose | Written by |
| --- | --- | --- |
| `00_README` | The rules, on one screen | IT, once |
| `01_INTAKE` | Raw form responses — append-only | Form |
| `02_REQUESTS` | Master register, one row per family request | Script + staff |
| `03_REQUEST_STUDENTS` | One row per child | Script, from the form |
| `04_DECISION_LINES` | One row per child × fee | Secretary |
| `05_BOARD_PACK` | `On Policy? = ✗` and above threshold | Formula |
| `06_TO_FINANCE` | Approved lines not yet applied | Formula |
| `07_PRECEDENT` | Reason × decision × typical value | Formula |
| `08_FEE_RULES` | The fee policy, machine-readable, versioned by year | CFO |
| `09_LOOKUPS` | Every dropdown | IT |
| `10_ARCHIVE_RAW` | Frozen copy of the four legacy registers | Once, read-only |

The scratch areas in the current file — bus pricing, fee scenario modelling,
per-family working blocks — **do not come across.** They belong in a separate
modelling workbook. A register is not a scratchpad.

---

## 7. Status, and the thing that is not a status

`Status` is where the request is. Numeric prefixes keep it sorted.

| Code | Status | Standard |
| --- | --- | --- |
| `10` | Submitted | acknowledged same day, automatic |
| `15` | Auto-resolved within policy | same day, no human |
| `20` | Needs Info | parent has 10 working days |
| `30` | In Review | 3 working days in season |
| `40` | Ready for Decision | — |
| `50` | On Agenda | weekly sitting during the window |
| `60` | Decided | 2 working days to inform |
| `70` | Parent Informed | 3 working days to apply |
| `80` | Applied in Finance | — |
| `90` | Closed | — |
| `95` | Withdrawn | — |

`Decision` is separate and blank until `60`: Approved · Approved with conditions ·
Declined · Deferred.

**`Re-registered` is not a status.** Whether the family re-enrolled is an outcome,
recorded in its own field. In the current file it is mixed into `STATUS` and
spelled five different ways.

---

## 8. Built for the surge

All 128 dated requests this year fall between 3 March and 7 May — 63 in March,
57 in April. About 120 family requests in ten weeks. A monthly cycle cannot absorb
that, and pretending otherwise is why policy was applied and called a decision.

| | |
| --- | --- |
| **Window** | Published open and close dates, aligned to re-registration |
| **Auto-resolution** | Within-policy asks answered same day by script — roughly half |
| **Review** | 3 working days in season, 5 out of season |
| **Sittings** | Weekly during the window, monthly outside it |
| **Board pack** | Only `On Policy? = ✗` above threshold — on this year's data, tens of lines, not hundreds |
| **Cut-off** | 3 days before each sitting during the window |

---

## 9. The link to the finance app

Two controls, one in each direction. Either alone leaves a hole.

**Forward.** No discount is entered without a Request ID in its reference field.
No ID, no discount.

**Reverse.** Monthly, export every discount line and match on Request ID:

| Finding | Meaning | Action |
| --- | --- | --- |
| Finance line, no Request ID | Unauthorised discount | Investigate; regularise or reverse |
| Approved line, no finance line | Granted, never applied | Apply it |
| Values differ | `Variance ≠ 0` | Correct one side, record which |
| Past `Effective To`, still live | Expired award still running | Renew deliberately, or stop |

Entitlement lines carry a Request ID too, so a policy discount is as traceable as a
board grant.

---

## 10. Migration

Four registers, 361 rows, four schemas. Nothing is deleted.

| Phase | Work | Days |
| --- | --- | --- |
| 0 | **Freeze.** Copy the workbook to `10_ARCHIVE_RAW`; never edit it again. | 1 |
| 1 | **Write `08_FEE_RULES` from the fee policy.** Not from the granted percentages — from the policy document, per academic year back to 2023. Everything else depends on this. | 2 |
| 2 | **Map four schemas to one.** Each register keeps a `Legacy Source` tag. Anything unmappable goes to `Legacy Notes`; nothing is discarded. | 2 |
| 3 | **Backfill IDs.** `PR-2425-nnnn` … `PR-2627-nnnn` by date. Write the ID back into the archive copy so old and new stay tied. | 1 |
| 4 | **Split families into children.** 82 multi-child rows become student rows. Resolve every child to a Student ID; 85% of rows currently have no usable one. Name-only children are a manual match against the SIS — **do not guess**. Unmatched go to `EXCEPTIONS`. | 5–7 |
| 5 | **Split prose into decision lines**, tagging each with its `Authority` and letting `On Policy?` compute. This is where the 29 off-ladder grants surface. Needs finance plus whoever holds the policy history — a working session, not typing. | 5–7 |
| 6 | **Reconcile against the finance app.** Three buckets: matched, approved-not-applied, applied-not-approved. Take the third to the board. | 3 |
| 7 | **Go live** before the March window. Form opens, old file read-only, one rule posted: no request outside the form, no discount without a Request ID. | 1 |
| 8 | **First monthly reconciliation.** Prove the loop closes. | +30 |

Realistically three to four weeks of elapsed work, most of it in phases 4 and 5,
and most of that other people's time rather than build time.

**Timing:** requests start in early March. Everything must be live by **February**,
which means starting the policy table (phase 1) now.

---

## 11. Build order

| # | Item | Effort |
| --- | --- | --- |
| 1 | `08_FEE_RULES` + the entitlement calculator | 1 day |
| 2 | Google Form (Khmer + English), repeating child block, Student ID validated against the SIS | 1.5 days |
| 3 | Intake script: ID, folder, child rows, entitlement computed, acknowledgement stating what policy gives | 1.5 days |
| 4 | Workbook skeleton, lookups, protections, conditional formatting | 0.5 day |
| 5 | Board pack, to-finance, precedent views | 0.5 day |
| 6 | Letter templates driven off the row, reusing the `step1`–`step5` HTML pattern already in use for tuition follow-up | 0.5 day |
| 7 | Monthly reconciliation script | 0.5 day |

---

## 12. Fit with the tuition follow-up ladder

The existing *Tuition Payment Follow-Up* process leaves a gap: because Step 4
withdraws the payment-plan offer, a family in genuine difficulty has no route but
withdrawal. This register is that route. One line in the Step 4 letter — *hardship
may be raised with the Head of School before the Step 5 date* — points at the form,
and the request enters this flow with an ID like any other.

---

## 13. Decisions needed before building

1. **The fee policy tables.** The real ladders for capital, tuition and sibling
   discount, per academic year, and how `(nephew)` / `(niece)` count. Everything
   depends on `08_FEE_RULES` being right.
2. **Finance app reference field.** Confirmed as workable — the exact field name
   and whether entitlement lines can carry a Request ID as well as exceptions.
3. **Delegation thresholds.** The numbers in §4.3.
4. **Who owns the register.** It sits with `finance-officer@` today. The register
   spans campuses and divisions; one owner, with bands protected per role.
5. **The other four sheets.** *Pathway Scholarship*, *StudentSCL*, *Siblings*,
   *Student Fee Review* — fold in, or stay separate and feed it.
6. **The scratch areas.** Confirm bus pricing, fee scenario modelling and the
   per-family working blocks move to a separate modelling workbook.
