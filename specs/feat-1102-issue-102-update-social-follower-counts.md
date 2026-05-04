# Feature Specification: Update Social Follower Counts (Instagram → 14K, YouTube → 10K)

> **TL;DR (≤2 sentences):** Update the displayed Instagram and YouTube follower counts in the `#comunidad` Social section across all three locale dictionaries (`es`, `en`, `zh`). Instagram becomes "14K" and YouTube becomes "10K", preserving each locale's existing suffix word (followers / seguidores / 粉丝 / subscribers / suscriptores / 订阅).
> **Tier:** S · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/hVPGooKCvFAlnsqHPm2k`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git (fetch/push)`
**Git status at planning time (summary):** On branch `chore/update_social_followers`; one untracked file (`bitbucket-api.sh`) unrelated to this issue; working tree otherwise clean.
**Remote vs `issue_json.git.repository`:** not provided (no `git.repository` field in `issue_json`) — no mismatch check applicable.

**Source files consulted:**
- `package.json` (scripts, deps)
- `astro.config.mjs` (i18n config, locales, redirects)
- `docs/PROJECT.md` (project conventions, i18n rules, validation gate)
- `src/components/Social.astro` (Social section, consumer of `social.*.count` keys)
- `src/i18n/es.ts` (Spanish dictionary, `social.*` block)
- `src/i18n/en.ts` (English dictionary, `social.*` block)
- `src/i18n/zh.ts` (Chinese dictionary, `social.*` block)

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions. Component-based SSG composed per-locale.

**Project Type:** Single Astro package (not a monorepo), static output.

**Primary Stack:** Astro `^5.17.3`, TypeScript `^5.9.3` (strict, `astro/tsconfigs/strict`), `@astrojs/check` `^0.9.7`, `@astrojs/sitemap` `^3.7.0`, `sharp` `^0.33.0`. Plain CSS with design tokens — no Tailwind, no CSS-in-JS, no UI framework.

**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev` (alias `astro dev`)
- Build: `npm run build` (alias `astro build` — runs `@astrojs/check` type-check)
- Test: N/A — no test suite exists. `docs/PROJECT.md` line 39 explicitly states this.
- Lint/Format: N/A — no linter/formatter configured.

**Validation Gate (authoritative "is this working?" signal):** `npm run build` (must exit 0 with zero `@astrojs/check` errors/warnings).

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs           # i18n: defaultLocale 'es', locales ['es','en','zh']
├── src/
│   ├── components/
│   │   └── Social.astro       # Reads social.yt.count / social.ig.count via t()
│   └── i18n/
│       ├── es.ts              # default locale dictionary (no URL prefix)
│       ├── en.ts
│       └── zh.ts
```

**Exposure Model:** File-based routing per locale (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`). All three landing pages compose `<Social />`, which is rendered as the `#comunidad` section. The `social.yt.count` and `social.ig.count` keys are already wired into `Social.astro` lines 12 and 20 — no exposure work is needed; the change is i18n-only.

**Locale / Multi-Surface Requirements:** Three locales — `es`, `en`, `zh`. Per `docs/PROJECT.md` ("i18n Rules"), every user-visible string MUST exist in all three dictionaries. Missing keys silently fall back to Spanish, which is a bug. All three dictionaries must be updated in lock-step.

**Conventions Observed:**
- File naming: PascalCase `.astro` for components, lowercase `.ts` for i18n dictionaries (verified: `Social.astro`, `es.ts`, `en.ts`, `zh.ts`).
- Translation keys: dot-namespaced, e.g. `social.yt.count`, `social.ig.count`, `social.tt.count`, `social.rb.count` (verified in all three dictionaries lines 146–152).
- i18n key parity across `es.ts` / `en.ts` / `zh.ts` is required (per `docs/PROJECT.md`).
- Existing follower-count format (verified at `src/i18n/es.ts:146,148`, `en.ts:146,148`, `zh.ts:146,148`) is `<number-with-comma-separator>+ <noun>` (e.g. `13,500+ seguidores`, `9,600+ subscribers`, `13,500+ 粉丝`). The `+` indicates "more than"; the noun is locale-specific.
- No hardcoded color hex values in new components (use design tokens) — N/A here, this change is text-only.
- Component contract: `(lang, t) => string` — `Social.astro` already conforms.

**Reserved Paths / Redirects / Route Collisions to avoid:** `/globalrescue`, `/pire`, `/en/pire` declared in `astro.config.mjs:6-10`. Not relevant to this change (no routing changes).

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md`. Did NOT create a new `docs/PROJECT.md` — the existing one is comprehensive and current.

**Change Tier:** S — three i18n dictionary modifications, two key updates per file (six string changes total). No schema/migration, no new dependencies, no new routes, no new public API, no UI/structural changes.

## 1. Design Analysis

**Target Scope:** `src/i18n/` only — three locale dictionary files.
**Affected Layers:** i18n / content layer. No component, layout, page, style, build, or config changes.
**Problem Statement:** The Social section currently advertises Instagram at `13,500+ followers` (and locale equivalents) and YouTube at `9,600+ subscribers`. The follower numbers have grown / been re-stated and need to be updated to the marketing-rounded values "14K" (Instagram) and "10K" (YouTube).
**Solution Strategy:** Edit the `social.ig.count` and `social.yt.count` values in `src/i18n/es.ts`, `src/i18n/en.ts`, and `src/i18n/zh.ts`. Replace the numeric prefix in each existing string with `14K` (Instagram) or `10K` (YouTube) while preserving the locale-specific suffix word. No code changes — `Social.astro` already reads these keys via `t('social.ig.count')` and `t('social.yt.count')`.
**Entry Point / Exposure:** Already wired. `src/components/Social.astro:12` reads `t('social.yt.count')`; `src/components/Social.astro:20` reads `t('social.ig.count')`. The `<Social />` component is composed by all three landing pages (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`). No new wiring needed.
**Locale / Surface Coverage:** All three locales (`es`, `en`, `zh`) — per `docs/PROJECT.md` rule that every user-visible string must exist in all three dictionaries.
**User Story:** As a visitor browsing the Aconcagua site, I want to see Julián Kusi's current Instagram (14K) and YouTube (10K) follower counts in the Social section, so that the displayed community size reflects the up-to-date numbers.

## 2. Architecture & Data

### Architecture
No architectural changes. The existing data flow stands:

```
Page (useTranslations(lang)) → <Social lang={lang} t={t} /> → t('social.ig.count') / t('social.yt.count') → rendered string
```

The pattern being followed is the same one used for every other translated string in the project: edit the dictionary, the build picks it up.

### Data Changes
- [x] Translation / i18n keys added: **None** — no new keys; only updating values for two existing keys (`social.ig.count`, `social.yt.count`) in each of three dictionaries.
- [ ] Schema / migration changes: None.
- [ ] Config changes: None.
- [ ] Static assets added: None.
- [ ] New dependencies: None.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `src/i18n/es.ts` (Modify — `social.yt.count` key (line 146), `social.ig.count` key (line 148) — set values to `'10K suscriptores'` and `'14K seguidores'` respectively)
- `src/i18n/en.ts` (Modify — `social.yt.count` key (line 146), `social.ig.count` key (line 148) — set values to `'10K subscribers'` and `'14K followers'` respectively)
- `src/i18n/zh.ts` (Modify — `social.yt.count` key (line 146), `social.ig.count` key (line 148) — set values to `'10K 订阅'` and `'14K 粉丝'` respectively)

> **Symbol anchors** are the i18n keys themselves (`'social.yt.count'`, `'social.ig.count'`). Implementer should grep these keys to locate the exact lines. Line numbers are hints only.

**Files NOT to change (explicit non-list, to prevent scope creep):**
- `src/components/Social.astro` — already reads these keys; no edit needed.
- `src/i18n/*.ts` keys other than `social.yt.count` and `social.ig.count` — TikTok (`social.tt.count`) and 小红书 (`social.rb.count`) follower counts are NOT in scope per `issue_json`.
- Any page, layout, style, or config file.

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] N/A — no schema or contract changes.

**Phase 2: Implementation**
- [ ] In `src/i18n/es.ts`, replace the value of `'social.yt.count'` from `'9,600+ suscriptores'` to `'10K suscriptores'`.
- [ ] In `src/i18n/es.ts`, replace the value of `'social.ig.count'` from `'13,500+ seguidores'` to `'14K seguidores'`.
- [ ] In `src/i18n/en.ts`, replace the value of `'social.yt.count'` from `'9,600+ subscribers'` to `'10K subscribers'`.
- [ ] In `src/i18n/en.ts`, replace the value of `'social.ig.count'` from `'13,500+ followers'` to `'14K followers'`.
- [ ] In `src/i18n/zh.ts`, replace the value of `'social.yt.count'` from `'9,600+ 订阅'` to `'10K 订阅'`.
- [ ] In `src/i18n/zh.ts`, replace the value of `'social.ig.count'` from `'13,500+ 粉丝'` to `'14K 粉丝'`.

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] No new wiring. Verify (do not modify) that `src/components/Social.astro` still references `t('social.yt.count')` (line 12) and `t('social.ig.count')` (line 20). The Social component is already imported and rendered by all three landing pages.

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` and confirm it exits 0 with zero `@astrojs/check` errors and zero warnings.
- [ ] Run the manual verification script (Section 5).

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero errors and zero `@astrojs/check` warnings.
- [ ] All three dictionaries (`es.ts`, `en.ts`, `zh.ts`) have the updated `social.yt.count` and `social.ig.count` values; no other keys touched.
- [ ] No new dependencies added.
- [ ] No hardcoded strings introduced into `Social.astro` (component still consumes via `t()`).
- [ ] No translation key exists in fewer than three locales (parity preserved — both keys already present in all three files).

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` has been run at least once (deps present).
- [ ] `npm run dev` is running on `http://localhost:4321/`.

**Scenario (run for each locale):**
1. [ ] Visit `http://localhost:4321/` (Spanish, default). Scroll to the `#comunidad` section. Confirm the YouTube card shows `10K suscriptores` and the Instagram card shows `14K seguidores`. Confirm the TikTok card is unchanged (`3,600+ seguidores`).
2. [ ] Visit `http://localhost:4321/en/`. Scroll to the Social section. Confirm YouTube shows `10K subscribers` and Instagram shows `14K followers`. Confirm TikTok unchanged.
3. [ ] Visit `http://localhost:4321/zh/`. Scroll to the Social section. Confirm YouTube shows `10K 订阅` and Instagram shows `14K 粉丝`. Confirm TikTok and 小红书 (Xiaohongshu) cards unchanged.
4. [ ] On each locale, hover the YouTube and Instagram cards to confirm the hover transform/shadow still works (sanity check that no CSS or markup was disturbed).

**Success Criteria:**
- ✅ YouTube count reads `10K …` in all three locales.
- ✅ Instagram count reads `14K …` in all three locales.
- ✅ TikTok and 小红书 counts are untouched.
- ✅ `npm run build` passes with zero errors / zero warnings.

## 6. Coverage Requirements

- [ ] The project has no test suite (per `docs/PROJECT.md`); the manual verification script in Section 5 IS the coverage for this change.
- [ ] Edge cases to consider:
  - All three locales updated in lock-step (a partial update would silently fall back to Spanish for the missing locale — this is the project's documented i18n bug surface; the manual script catches it).
  - No accidental edits to `social.tt.count` / `social.rb.count` (TikTok and Xiaohongshu) which are not in scope per `issue_json`.

## 7. Acceptance Criteria (Definition of Done)

- [ ] Both `social.yt.count` and `social.ig.count` updated in `src/i18n/es.ts`, `src/i18n/en.ts`, and `src/i18n/zh.ts`.
- [ ] `npm run build` passes with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification script (Section 5) completed across all three locales — YouTube reads `10K …` and Instagram reads `14K …`.
- [ ] No other keys, components, or files modified.
- [ ] No new dependencies introduced.
- [ ] Traceability: `issue_json` requires "Set Instagram to 14K and YouTube to 10K" → satisfied by Phase 2 edits in all three locale dictionaries.

### Assumptions (non-load-bearing)

- The user-visible format `14K` / `10K` is rendered as a literal compact-K notation (no `+` suffix), preserving each locale's existing noun (`seguidores` / `followers` / `粉丝` for Instagram; `suscriptores` / `subscribers` / `订阅` for YouTube). The existing strings used `<number>+ <noun>` (e.g. `13,500+ seguidores`); the user's verbatim "14K" / "10K" phrasing implies a switch to compact-K notation for these two platforms only. TikTok and Xiaohongshu retain their existing format. This is not load-bearing per the test in Section 3 (Affected Files list does not change under any reasonable interpretation — only the string values do); the implementer can adjust to `14,000+`/`10,000+` if the editor prefers, without restructuring the plan.
