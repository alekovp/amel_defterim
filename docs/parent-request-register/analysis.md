# Analysis of "Parent discount requests - Cross Campus"

**Source:** Google Sheet `1wNT0YBhf…`, owned by `finance-officer@paragonisc.edu.kh`,
created 2 May 2023, 3.9 MB, read 21 September 2026.
**Method:** full text export, parsed and profiled with a script. Longest cell 3,625
characters, no truncation detected. Merged cells appear as `[merged]`; cell colour
and formatting are not visible in the export, so any decision encoded in colour is
not counted here.

---

## 1. What is actually in the file

It is not one register. It is **four registers with four incompatible schemas**,
plus roughly ten scratch areas, in a single workbook.

| Block | Rows | Columns | Key fields |
| --- | --- | --- | --- |
| Register A — live 2026-2027 | 136 | 18 | Division, Student Status, Requested Via, Requested AY, Dicision (Last Year), Decision 2026-2027 |
| Register B | 136 | 18 | Campus, Academic Year, Parent/Gurdian, HO, Decision |
| Register C | 37 | 12 | Campus, Academic Year, Parent/Gurdian, HO, Decision |
| Register D — "Secondary" | 52 | 11 | Secondary, Academic Year, Parent/Gurdian, HO, Decision |
| **Total request rows** | **361** | | |

Plus, in the same file: bus pricing models in Turkish (`ESKI BUS`, `Ay`, `Fiyat`,
`toplam 1 yil`), fee scenario modelling (`Option 1 Normal`, `Option 2`, `Option 3`,
`As parent requested`), a "Scholarship discount from Chairwoman" block, three
`Type of Discount` lists with 5–6 columns each, and about a dozen per-family
working blocks (`Mr Kiriyar / Danish 2024-2025`, `Raksmey Soriya Lao 24-25`,
`Mr. Darryl Requests`, `THONG MINGSUON`, `MIN Sokaroth`, …).

Registers B, C and D share a near-identical schema that Register A does not use.
The same concept has four different column names across the file: the decision is
`Decision 2026-2027`, `Decision`, `Decision` and `Decision`; the prior year is
`Dicision  (Last Year)` in one and `Previous years'/year's status` in all four.

---

## 2. The headline finding: most of this is not a decision

Classifying all 136 decisions in Register A by whether anyone exercised judgement:

| What the decision cell actually contains | Rows |
| --- | --- |
| Policy or rule applied — no discretion exercised | 51 |
| Refusal citing policy — "according to the policy there is no discount" | 18 |
| **Contains a genuine discretionary grant** (Board / Chairwoman / Head of School / CEO / staff contract) | **17** |
| Per-child enumerations and other prose, mostly policy with occasional discretion | 50 |

**At least 69 of 136 requests (51%) needed no decision-maker at all**, and only 17
(12%) contain a grant that someone actually had authority to make. Everyone is
reading 136 requests to make roughly 17 real decisions.

### The capital-fee ladder proves it

The published policy is a ladder by child order. Counting every capital-fee
percentage granted this year:

| On the published ladder | Count | | Off the ladder | Count |
| --- | --- | --- | --- | --- |
| 0% | 9 | | 10% | 6 |
| 20% | 42 | | 30% | 11 |
| 40% | 10 | | 50% | 5 |
| 60% | 15 | | 70% | 1 |
| | | | 85% | 5 |
| | | | 90% | 1 |
| **76 grants** | | | **29 grants** | |

**76 of 105 capital-fee grants sit exactly on the ladder.** They are entitlements
a formula could issue. The 29 that do not are the real decisions — and they are
currently invisible, mixed into the same column as the 76.

The ladder itself changed between years, which the data shows plainly:

| Academic year | Percentages granted |
| --- | --- |
| Last year | 25% (57), 50% (48), 75% (14), 100% (7), 80% (3), 70% (1), 0% (1) |
| 2026-2027 | 20% (42), 60% (15), 30% (11), 40% (10), 0% (9), 10% (6), 50% (5), 85% (5), 90% (1), 70% (1) |

Nothing in the file records that the policy changed, when, or by whose decision.

---

## 3. The join key to finance is missing

| Measure | Register A |
| --- | --- |
| Rows with any Student ID | 51 of 136 (37%) |
| Of those, cells holding **several** IDs jammed together | 31 |
| Rows with a single clean Student ID | **20 of 136 (15%)** |
| Distinct ID tokens found anywhere | 68 |

Examples of the Student ID cell as stored: `105756 107060`,
`105317 105320 105323 106641`, `107619 107621 107618`.

A discount cannot be tied to a finance entry for 85% of the register.

---

## 4. A request is a family, not a student

**82 of 135 rows (61%) name more than one child**, up to seven in one cell:

```
Chhay Phea Huy 4 · Chhayhong Huy 5 · Kong Heang Kouch 11 (nephew) ·
Chhunyi Kouch 8 (niece) · Jing Ling Kouch 1 (niece) ·
Panhaliza Lim 9 (niece) · Panhaleap Lim 10 (niece)
```

and each child gets a different answer, also in one cell:

```
Suon Thamavorn  - Cap fee 25% off
Suon Tikheayu   - Cap fee 50% off
Suon Sokvathika - Cap fee 75% off, Tui fee 20% sib dis
```

That is one row holding three students and four fee decisions. Nothing in the
file can be counted per student, per fee, or per child order. The data also
distinguishes `(nephew)` and `(niece)` from own children — which matters, because
the sibling ladder presumably applies differently, and nothing records how.

---

## 5. There is no form — it is an email inbox, retyped

| Channel | Rows |
| --- | --- |
| Email | 133 |
| Paper | 1 |
| Other | 1 |

Parent email domains: gmail.com (86), yahoo.com (19), theunitedknowledge.com (7),
paragonisc.edu.kh (6 — staff parents), icloud.com (4), hotmail.com (3), me.com (3).

Every request is an email, read and hand-transcribed into the sheet by the finance
officer. That is why Student ID is 37% filled: the parent never supplies it, and
nobody stops to look it up.

---

## 6. It is a ten-week surge, not a steady flow

All 128 dated requests in Register A fall in one window:

| Month | Requests |
| --- | --- |
| March 2026 | 63 |
| April 2026 | 57 |
| May 2026 | 1 |

About 120 family requests — covering perhaps 200 children — arrive in ten weeks
alongside re-registration. A monthly board cycle cannot absorb that, which is
probably why so much of it was answered by applying policy and calling it a
decision.

---

## 7. Nine discount authorities, none of them a column

Counting mentions across both decision columns in Register A:

| Authority named in prose | Mentions |
| --- | --- |
| Sibling discount | 143 |
| Board | 71 |
| Policy ladder (`Policy: 0 20% 40% 60%`) | 21 |
| Early or full payment | 16 |
| Alumni | 12 |
| Staff contract | 11 |
| Referral | 6 |
| Head of School | 5 |
| Chairwoman | 4 |
| Group enrolment | 4 |

And the fee types they apply to, also only in prose: capital (280 mentions),
tuition (208), registration (24), enrolment (6).

A single cell routinely stacks three authorities:
`- Cap fee 20% off  - Tui fee 15% sib dis + 5% Board`
— a policy entitlement, a sibling entitlement, and one genuine board grant, with
nothing distinguishing them.

---

## 8. Everything else

**Decisions are unique prose.** 99 distinct values across 136 rows in Register A.
71 distinct across 133 in Register B. Register C's decision column contains entire
drafted emails: *"Dear Mr. Akbar, Thank you for your email and for keeping us
informed of the parent's request…"*.

**63% of Register B decisions are a pointer, not a value.** 86 of 136 rows read
`- Capital Fee based on below table - Registration Fee remains same as previous
year…`. The table is elsewhere in the workbook. Move a row and the decision is lost.

**Revisions overwrite rather than version.** Nine rows have `FINAL DECISION`
written inside the decision text, sitting beside the superseded one:

```
Run leemacron 3A  Capital fee: no discount …
FINAL DECISION  Run leemacron 3A  Capital fee: 10% Discount …
```

**32 families occupy more than one row** (72 rows in total) because each round of
negotiation was appended as a new row. `No` is blank on **97 of 136 rows** — the
register cannot count how many requests it holds.

**"Informed the parents" is a date written as prose**, in 21 spellings:
`Informed parent Mar 27, 2026` (29), `Apr 23, 2026` (25), `May 7, 2026` (10),
`May 06, 2026`, `May 6, 2026`, `Apr 03, 2026`, `Mar 24, 2026 by Telegram Primary`.
One row has a *decision* typed into this column instead:
`Rahmat Danish Kriyar 2 - Tui fee 80% off staff contract, 10% Board - Cap fee 90% off`.

**"Registered" is spelled five ways** — `Registered` (103), `Re-registered` (12),
`registered` (6), `[merged] Registered` (5), `Registrered` (3), `Registerd` (2),
plus `N-Register`, `Registered(not record in database)`, `Re-registered all 4`, and
one row holding a date. This column is also the wrong concept: whether a family
re-enrolled is an *outcome*, not a workflow status.

**Sixteen commitments have no end date** — `until graduation` (5), `every year` (6),
`yearly` (3), `till graduation` (2), plus `till the campus change` elsewhere in the
file. Nothing triggers a review.

**Review and outcome columns are abandoned.** In Register A: `Division` 0% filled,
`Previous years' status` 7%, `Comments or suggestion` 11%, `DID THEY REGISTER?` 7%,
`No. students Registered` 3%, `Parent's Feedback` 4%. The loop is closed on fewer
than one request in ten.

---

## 9. What this changes in the design

| Finding | Design consequence |
| --- | --- |
| 61% of requests cover several children, each answered differently | The request is a **family**. Three tables: request → students → decision lines. Not one wide row. |
| 76 of 105 capital grants sit on the published ladder | Make the fee policy **machine-readable** and compute entitlements. The register holds only departures from it. |
| Nine authorities stacked inside one cell | `Authority` is a **field on every decision line**. Only Board / Chairwoman / Head of School / CEO lines are decisions; the rest are entitlements. |
| Student ID on 15% of rows | The form **requires** a Student ID per child and validates it against the SIS. |
| 133 of 136 arrive by email and are retyped | A form is the highest-leverage single change in the whole project. |
| ~120 requests in a 10-week window | Build for a **surge**: published window, weekly sittings during it, auto-answer for on-ladder cases. |
| 9 `FINAL DECISION` rows, 32 families across multiple rows | Negotiation is normal. Version it on the same Request ID rather than appending rows. |
| Informed date in 21 prose spellings | Real date fields, entered by a script when the letter is sent. |
| 16 open-ended commitments | `Effective To` mandatory on every line; "until graduation" becomes one line per year. |
