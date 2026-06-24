# Distilled Context — facts used to seed the prototype

## People / roles
| Name | Role | Notes |
|---|---|---|
| Casey | CEO + lead estimator | Started as estimator, still "lives in estimator seat." Jumps into email threads, can bottleneck. Good at reading which GC wins / where to go heavy. Ambitions: AZ & NV expansion. |
| Angel | Masonry estimator | Long-tenured (~7 yrs), came from the field (foreman). Owns scope review. Bids in a vacuum — no visibility into ops schedule. |
| Rohilio | Concrete estimator | ~6 months in. Assists on concrete. |
| Oscar Jr. | Estimating assist | Helps Rohilio/Angel. |
| Tucker | PM | Overloaded (1 PM vs ~5 estimators). Slow to respond to ops; people physically walk to his desk. ~$600K in unapproved change orders. |
| Patrick | Ops / field linchpin | Bridges field + office. Assigns foremen, site visits, pre-con, shop coordination, growing the concrete division. Spends too much time on PM work vs mentoring foremen. |
| Jackie | Accounting / Finance lead | Billing, payroll, AP/AR, Foundation + Textura + custom Excel. Very detail-oriented; struggles to delegate. $28K wire-fraud incident → now uses test ACH. |
| Luke | Superintendent | Dispatch, field. Stubborn/loyal to field; friction with PMs. |
| Oscar | QC / Safety / dispatch | Dispatches with/for Luke. |
| Abby | Software/workflow (Monday.com) | Ex-Amazon PM; "underutilized gem" — the test case for whether a good system makes an average person succeed. |
| Frankie | Payroll | Reports to Jackie. |
| Christine | Construction coordinator | New; sets up projects/folders, uploads plans, RFIs. |
| Jose | Project engineer (PE) | Junior, being trained. |
| Eric | Shop | Tool/material coordination. |
| Lori | Fractional controller | Personality friction with Jackie. |
| Steve | G&R (Grody & Ricks) division | Separate entity/database — keep isolated. |

## Tools in use today (fragmented)
- **Monday.com** — task checklists, "overbuilt and underutilized," lives in isolation, ~95 checklists, broken up by job (want one consolidated view + dashboard).
- **Excel** — change orders (one per job), Jackie's custom billing/certified-payroll trackers.
- **J-Drive** — on-prem network file storage; requires office Wi-Fi/Ethernet (no VPN) — pain in the field.
- **Stack** — blueprints, specs, RFIs, submittals, safety docs (document repository, not in-flight work).
- **FieldFlow** — field dailies, payroll/timesheets, T&M tickets, dispatch/scheduling. No change-order module, no RFI template. Red/green daily production status (useful but "vanilla").
- **Foundation** — accounting ERP (billing, payroll, AP/AR, WIP). Change orders only entered once fully approved.
- **Textura** — GC billing/pay-app platform (well-liked). Owned by Oracle.
- **Building Connected** — bid invites for estimating.
- **Bluebeam** — takeoffs / plan markups.
- **Teams** — internal messaging + production reports.

## Bid / estimating process (Angel)
1. Invite arrives (Building Connected / email) → check prevailing-wage + union signatory (Weingartner is union-only).
2. Download **all** plans/docs comprehensively; create estimating folder (year → month → project), keep the invite email link in the folder.
3. Review overview + schedule + paperwork. **Scope review is the heaviest lift**, not the takeoff.
4. Scope sheet review against bid package (e.g. "04 mainstream") — red-tag exclusions (welding, waterproofing, etc.).
5. Takeoff in Bluebeam / estimating platform (30 min → 2 weeks). Must assume a lot (CMU connections, lintels, headers, control joints) from incomplete plans.
6. Proposal (SOV) → submit. Public works: rarely hear back; ~1 of 40 known immediately.
- Production: masons "live and die on ratios" (production vs support crew). ~23% O&P, hit market ~18%.
- Regional wage nuance: per-diem ($100/day San Diego), 90-mile DIR rule, prevailing wage — varies by region; AZ/NV expansion will add new parameters.

## The friction (why this prototype exists)
- **Estimating ↔ ops are siloed** — "two different companies." Angel bids with no ops schedule visibility. Handoff meetings are messy and feel adversarial ("you didn't tell me," "why is the report $5k under the proposal?").
- **Concerns surface after commitment** — all pressure on the estimator. Want concerns/assumptions surfaced *during* bidding so submission is a team decision.
- **No shared standards** — real production rates (140 → ~100 units/day), block lead times, capacity ("booked through August → bid high"), regional wage rules live in people's heads.
- **Tasks scattered, no accountability** — Monday.com lives in isolation; visibility drives behavior. Want pre-defined recurring tasks per stage + ad-hoc, tied to roles, with leadership visibility. Idea raised: tie task completion to payroll to force behavior.
- **No feedback loop** estimating ↔ field production — estimators don't update libraries from actual production reports.

## Real projects (for seed data)
- **Ontario Sports Empire** — masonry, ~$13.5M (largest in company history), active. Arches built from styrofoam forms. Hard to stay "green" (work spread out / out-of-sequence). ~$100K out of pocket on releases.
- **Jordan High School** — masonry, wrapping up, one phase left, performed well. ~$100K out of pocket on releases.
- **San Diego student-housing CMU** — Angel, ~$95K (originally $99K, Casey gave a discount). 8" precision gray, ~1,200 sf, wet electrical enclosures 2nd floor, ~30 ft up. Schedule Nov–Dec 2026. **Tension Center showcase bid.**
- **Purple Line Station 3** — had a ~$100K change order (labor already paid).
- **Lincoln High School** — paver job; the saw-selection saga (tile saw vs MK saw) — example of field communication friction.
- Concrete bids (Rohilio): ~$10M concrete work last year; subbing out excavation/rebar/finishing, want to bring in-house.

## Feature asks (verbatim intent from Jordan)
1. Software for **cohesion between operations and estimating**.
2. A way for **both estimating and ops to communicate a standard or changes to consider during estimating**.
3. A **pre-bid submission "tension center"** — equip the team with info and let a facilitator challenge anything about the proposal.
4. After a bid is submitted and **awarded, a facilitated handoff meeting**.
5. A **task-management solution** for pre-coordinated/pre-defined tasks during the estimating and handoff process; tasks also assignable at any time.
