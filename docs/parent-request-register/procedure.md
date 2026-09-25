# Parent Fee Request — Operating Procedure

**For:** Finance Officer, Finance Committee, Head of School, CFO, Accounts
**Status:** Draft for Finance Committee approval — 25 September 2026

---

## What happens today

```
Parent  ──email──▶  Finance Officer  ──retypes──▶  Sheet  ──▶  Finance Committee  ──▶  decision
```

Three steps. It breaks in four places:

1. The **request arrives as prose**, so the Student ID, the children and the exact
   ask all have to be reconstructed by hand — which is why a usable Student ID
   exists on 15% of rows.
2. **Nothing separates entitlement from exception.** Roughly half of what reaches
   the committee is the fee policy being applied, not a decision.
3. **The committee has to ask for the facts** every time — current fee, prior
   discount, payment history. That is what the `HO` column in the old sheets is.
4. **The decision goes back out as prose**, so nothing can be matched to the
   finance app or to next year's request.

The procedure below keeps the same three actors. It changes what each of them
receives.

---

## Stage 0 — Before the season opens

**Owner: Board, then IT. Once, then every January.**

| # | Action |
| --- | --- |
| 0.1 | Board approves the fee rules for the year and they are entered in `08_FEE_RULES` — every fee, every discount, every ladder, with the percentages and who approved them. |
| 0.2 | **Publish the complete ladder on the fees page.** See §Root cause below — this is the single highest-value action in the whole procedure. |
| 0.3 | The re-registration letter carries the form link, and states what that family is already entitled to before they ask. |
| 0.4 | Finance Officer's email signature and auto-reply carry the form link. |

---

## Stage 1 — The parent submits

**Owner: Parent. Channel: one form, Khmer and English.**

The form collects, in this order:

1. Guardian name, relationship, phone, email, preferred language
2. **One repeating block per child** — Student ID (validated against the SIS),
   name, grade, campus, whether own child / nephew / niece
3. Which fee or fees the request concerns — capital, tuition, registration,
   enrolment, application, exam, bus
4. What is being asked for — a percentage, an amount, a payment plan, an extension
5. Reason, from a list, plus the family's own statement
6. Supporting documents

**If an email still arrives** — and they will for the first year — the Finance
Officer replies with one line and the form link. **They do not transcribe it.**
Transcription is what produces every problem in the current file.

---

## Stage 2 — Automatic, the same day

**Owner: script. No human touches this.**

| # | Action |
| --- | --- |
| 2.1 | Assign the Request ID — `PR-2627-0042` |
| 2.2 | Create the Drive folder and file the documents |
| 2.3 | Resolve every child against the SIS and compute **child order** across the family |
| 2.4 | Read `08_FEE_RULES` and compute **what policy already gives this family** |
| 2.5 | Look up **prior requests and prior decisions** by Student ID |
| 2.6 | Email the parent their acknowledgement |

The acknowledgement is not a receipt. It states the answer policy already gives:

> Your reference is **PR-2627-0042**.
>
> Based on your children's enrolment, the fee policy already applies:
> • Sophea (2nd child) — 10% sibling discount on tuition, 20% off the capital fee
> • Dara (3rd child) — 15% sibling discount on tuition, 40% off the capital fee
>
> You have asked for 50% off the capital fee for both children.
> The difference will be considered by the Finance Committee on 15 April 2026.

---

## Stage 3 — Route, the same day

**Owner: script.**

| Case | Route | Status |
| --- | --- | --- |
| Ask **≤** entitlement | **Closed.** The acknowledgement already gave the answer. No review, no agenda slot. | `15` |
| Ask **>** entitlement | Only the **gap** goes forward. The entitlement is already granted. | `30` |

On this year's figures roughly half of all requests stop here, on the day they
arrive, with a better answer than they get today.

---

## Stage 4 — The Finance Officer prepares

**Owner: Finance Officer. 2 working days.**

The job changes from *transcribing the request* to *preparing the decision*. Fill
in the facts the committee asks for every time:

| Field | Why |
| --- | --- |
| Full tuition this year, and last year | Asked for in the old `HO` column |
| Discounts already in force | So top-ups are not stacked blind |
| Outstanding balance | Whether the family is current |
| Payment history — on time / occasional late / in arrears | |
| Years at school, siblings enrolled | |
| **Prior requests and prior decisions** | A lookup on Student ID. Never retyped. |
| **Cost to school of the gap, in dollars** | The number the committee actually needs and does not have today |
| Recommendation — approve / approve in part / decline / defer | |

---

## Stage 5 — Route by size

**Owner: script, on the prepared figures.**

| The gap above entitlement | Decided by | Standard |
| --- | --- | --- |
| Late fee waiver, first occurrence · extension ≤ 30 days | Finance Officer | 1 day |
| Payment plan inside the academic year | CFO | 2 days |
| ≤ 10 percentage points on one fee, one year, cost ≤ USD 1,000 | Head of School + CFO | 2 days |
| Anything larger · multi-year · precedent-setting · any staff or Chairwoman case | **Finance Committee** | next sitting |

This matters more than it looks. The most common committee decision in the current
data is a **2% or 5% top-up on tuition** — 48 of them this year. Those do not need
a committee.

---

## Stage 6 — The Finance Committee sits

**Owner: Finance Committee. Weekly March–May, monthly otherwise. Cut-off 3 days before.**

The agenda generates itself: every request where `On Policy? = no` and the gap is
above the delegation threshold. One page per request, from the row:

- The family, and each child with grade and child order
- **What policy already gives** — already granted, not under discussion
- **What is being asked for**, and the gap
- **Cost to the school**, in dollars
- Payment history and years at school
- **Prior decisions for this family**, and comparable cases
- The Finance Officer's recommendation

The committee records four things and nothing else:

| Field | Values |
| --- | --- |
| Decision | Approved · Approved in part · Declined · Deferred |
| Value | the percentage or amount, per fee, per child |
| Conditions | e.g. *"50% only if both children enrol"* — and it gets ticked off later |
| Minute reference | `BM-2026-04-15` |

The secretary enters the decision as **lines** — one per child per fee, each tagged
with its authority. Not a paragraph.

---

## Stage 7 — The parent is informed

**Owner: Finance Officer. 2 working days.**

Letter generated from the row in the family's language, stating the reference, what
was granted per child per fee, any conditions, and the effective dates. The script
stamps `Informed Date`. Nobody types *"Informed parent Mar 27, 2026"* into a cell
again.

**If the parent pushes back** — 32 families did last year — the reply is logged as
a **Revision on the same Request ID**. It never becomes a new row. If the revised
ask is still above entitlement, it returns to Stage 5.

---

## Stage 8 — Accounts applies it

**Owner: Accounts. 3 working days.**

Every line entered against its Student ID, with the **Request ID in the finance
app's reference field**. Entitlements too, not just exceptions — so a sibling
discount is as traceable as a Board grant.

**The rule: no Request ID, no discount.**

---

## Stage 9 — Monthly reconciliation

**Owner: Finance Officer. Monthly.**

Export every discount line from the finance app and match on Request ID:

| Finding | Action |
| --- | --- |
| Finance line with no Request ID | Investigate — regularise or reverse |
| Approved line with no finance line | Apply it |
| Values differ | Correct one side, record which |
| Past `Effective To`, still running | Renew deliberately, or stop |

---

## Root cause: the published policy and the practised policy disagree

This is why 120 families email every March.

| Rule | Published on the fees page | Actually granted | |
| --- | --- | --- | --- |
| Sibling, 2nd child, tuition | **10%** | **15%** (27×), 20% (16×), 10% (only 6×) | ✗ conflict |
| Sibling, 3rd child | 15% | — | confirm |
| Sibling, 4th+ child | 20% | — | confirm |
| Alumni, 1st child | 10% | 10% (12×) | ✓ agrees |
| Referral | $500 referrer / $250 student | $500 / $250 | ✓ agrees |
| **Capital fee ladder** | **nothing at all** | 0 / 20 / 40 / 60% by child order | ✗ unpublished |
| Full payment discount | nothing | 6% | ✗ unpublished |
| Early payment discount | nothing | 4% | ✗ unpublished |
| Staff contract | nothing | 80–85% tuition and capital, 50% registration | ✗ unpublished |
| Late payment charge | nothing | $50, then $100 | ✗ unpublished |
| Refund / withdrawal | nothing | — | missing |

Two consequences follow, and both are serious.

**The capital-fee ladder is the single biggest driver of request volume.** Every
family is entitled to it and no family is told. So they write in to ask. Publishing
it on the fees page, and stating it in the re-registration letter, removes the
reason for most of the 120 emails — before any system is built.

**The published sibling rate is not the rate being given.** A family that accepts
the published 10% pays more than a family that emails and is given 15%. That is an
equity problem and a revenue exposure, and it rewards the families who push hardest.
Either the page is out of date and should say 15%, or the practice is 5 points
above policy and should stop. It cannot stay as it is.

---

## What the committee is actually deciding

Once entitlements are computed, what is left for the Finance Committee is small:

| Discretionary grant | Times this year |
| --- | --- |
| Board top-up on tuition, 5% | 28 |
| Board top-up on tuition, 2% | 20 |
| Board top-up on tuition, 10% | 7 |
| Board top-up, 15% | 2 |
| Head of School top-up, 5% | 2 |
| Chairwoman scholarship, 10–50% | 4 |

Roughly 60 discretionary grants, most of them 2% or 5%, buried inside 136 prose
decisions and 120 email threads. That is the work this procedure surfaces.

---

## Who owns what

| | |
| --- | --- |
| **Board** | Owns `08_FEE_RULES` — the policy and the ladders. Approves changes, which are dated and recorded. Does not decide individual families. |
| **Finance Committee** | Decides exceptions above the delegation threshold. Does not set policy. |
| **Head of School / CFO** | Decides within the delegation threshold. |
| **Finance Officer** | Prepares every request, informs parents, runs the monthly reconciliation. Owns the register. |
| **Accounts** | Applies decisions with the Request ID. |
| **Parents** | Use the form. No access to the register. |

The separation that is missing today: **the Board owns the policy, the Committee
owns the exceptions.** The capital ladder moved from 25/50/75 to 0/20/40/60
between years and nothing in the file records who decided that, or when.

---

## Decisions needed to start

1. **Confirm the sibling ladder.** Is the published 10% correct, or is the
   practised 15% correct? Everything auto-computes off this.
2. **Approve publishing the capital-fee ladder** on the fees page.
3. **Confirm the unpublished rules** — full payment 6%, early payment 4%, the staff
   contract rates, the late payment charges — then publish them or stop them.
4. **Set the delegation thresholds** in Stage 5.
5. **Provide the tuition fee schedules** — the Bilingual and International PDFs
   linked from the fees page — so the calculator can price a request in dollars.
6. **Confirm the Finance Committee's sitting rhythm** in season: weekly, or
   fortnightly with a larger agenda.
