# Phase 08 — Verification gates, dead-code removal, docs reconcile

## Context Links
- Depends: 07
- Docs: `e2e/README.md`, `docs/system/architecture.md`, `docs/system/permissions.md`, `docs/codebase-summary.md`, `docs/development-roadmap.md`, `docs/project-changelog.md`, `docs/supabase-google-oauth-setup.md`; drafts in `spec/system/*`; spec promotion target `docs/features/F006_KudosLiveBoard/` + `docs/screens/SCR007_KudosLiveBoard/` (numbering: verify next free codes)
- Prior precedent: `plans/261020-1656-countdown-prelaunch-implementation/phase-05-e2e-verification-and-docs.md`

## Overview
Priority P1 · Status pending · Effort 1.5h. Final gate; docs via `doc-writer`.

## Key Insights
- `kudos-copy.ts` and the `SpotlightWord` type are only safe to delete after 05 and 06 both landed → done here.
- Dev flow change is the first DB-backed feature: `npx supabase db reset` (migrations + seed, wipes local auth users) must be documented for devs and e2e.
- Production: Supabase dashboard redirect URLs need the `/auth/callback**` glob; migrations applied with `npx supabase db push`; seed is local-only (never pushed).

## Requirements
- Delete `src/components/kudos/kudos-copy.ts`; remove `SpotlightWord` from `kudos-types.ts`; `grep -rn "KUDOS_COPY\|kudos-mock-data\|SpotlightWord" src` empty.
- Gates (record exit codes + counts): `npx tsc --noEmit`, `npx eslint`, `npx vitest run`, `npm run build`, `npx supabase db reset && npm run test:e2e`, `npm run test:e2e:prelaunch` (gate unaffected).
- Manual smoke (record): real Google sign-in from `/kudos` gated heart → returns to `/kudos`; no-next sign-in → `/todo`; like on special day via psql-inserted today → stats hearts +2.
- `e2e/README.md`: new "F006 Kudos Live board" section — precondition `db reset`, seed constants, persona/special-day serial rationale, TC map (41 TCs → spec/test or MANUAL/deviation), empty-state jsdom justification.
- Docs: architecture (Supabase schema + server actions + RLS model), permissions (promote draft), oauth setup (redirect glob, `next`), codebase summary, roadmap, changelog; PM-review list (EN copy, banner/button copy vs spec, gift list deviation, TC deviations, title row removal, receiver-department filter, spotlight cap/size/bounds defaults).
- Plan: statuses → completed; `## Delivered` line in plan.md.

## Architecture
N/A (verification + docs).

## Related Code Files (ownership)
- Delete: `src/components/kudos/kudos-copy.ts`. Modify: `src/components/kudos/kudos-types.ts` (remove `SpotlightWord`), `e2e/README.md`, `docs/**` listed above, this plan's `plan.md` + phase statuses.

## Implementation Steps
1. Dead-code removal + grep check + tsc.
2. Run all gates; fix-forward via owning phase if red (route to implementer, re-run).
3. Manual smoke; record in `reports/`.
4. `doc-writer`: README TC map + docs; spec promotion.
5. Reviewer inspection with **user sign-off** on: return-to (03), like action + RPC (01/02), RLS/grants/trigger (01).

## Todo List
- [ ] dead code removed
- [ ] gates green with counts recorded
- [ ] manual smoke recorded
- [ ] README + docs updated, spec promoted
- [ ] inspection + user sign-off on auth-sensitive surfaces

## Success Criteria
plan.md "Done (observable)" all true; `Docs impact: major` stated in completion message.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Build fails on cacheComponents rule in new pages | M | M | 05 follows countdown/todo pattern; fix in 05 files |
| Prelaunch suite affected by trigger/migration | L | M | run `test:e2e:prelaunch` explicitly |

## Security Considerations
Confirm no secrets in diff (`git diff --stat`, grep for `service_role`, JWTs); `.env.local` untouched.

## Next Steps
PR to `main`; follow-up tasks: Viết Kudo dialog (writes kudos/gift events), Kudo detail, Profile, Secret Box, Admin special days.
