# Feature Specification: Update WFR Logo in Certifications

> **TL;DR (≤2 sentences):** Replace the existing local `/wfr.png` logo used in the Certifications section with the new image hosted at the Firebase Storage URL provided in the issue. The new asset is downloaded into `public/wfr.webp` and the `certs` array in `src/components/Certifications.astro` is updated to reference it; the obsolete `public/wfr.png` is deleted.
> **Tier:** S · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/ZBleTonxI0Qhoq2A1rGb`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git (fetch/push)`
**Git status at planning time (summary):** On branch `chore/update_certifications_wfr_logo`; tree clean except for one untracked file (`bitbucket-api.sh`) at the workspace root, unrelated to this change.
**Remote vs `issue_json.git.repository`:** `not provided` (no `git` block in `issue_json`).

**Source files consulted:**
- `package.json` (scripts + deps)
- `astro.config.mjs` (i18n, redirects, site config)
- `docs/PROJECT.md` (authoritative project conventions)
- `src/components/Certifications.astro` (target component)
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (`certs.label` exists in all three)
- `public/` directory listing (confirms current `wfr.png` placement)
- `src/layouts/BaseLayout.astro` (string-only WFR reference in JSON-LD — no asset path, not affected)

**Purpose:** Astro v5 static marketing site for Julián Kusi's guided Aconcagua expeditions, deployed to Firebase Hosting. Trilingual (es default, en, zh).
**Project Type:** Single Astro package (not a monorepo), static site (SSG).
**Primary Stack:** Astro `^5.17.3`, TypeScript `^5.9.3` (strict, `astro/tsconfigs/strict`), plain CSS with design tokens, `@astrojs/sitemap`, `sharp` for images.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (Astro build + `@astrojs/check` type-check — authoritative gate)
- Test: `N/A — no test suite exists` (per `docs/PROJECT.md`).
- Lint/Format: `N/A — none configured` (per `docs/PROJECT.md`).

**Validation Gate (authoritative "is this working?" signal):** `npm run build` (must pass with zero errors and zero `@astrojs/check` warnings).

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs
├── package.json
├── public/
│   ├── epgamt.png            # certification logo (kept as-is)
│   ├── wfr.png               # certification logo (CURRENT — to be removed)
│   └── ... (other static assets)
└── src/
    ├── components/
    │   └── Certifications.astro   # target component (`certs` array)
    └── i18n/
        ├── es.ts                  # 'certs.label' = 'CERTIFICACIONES'
        ├── en.ts                  # 'certs.label' = 'CERTIFICATIONS'
        └── zh.ts                  # 'certs.label' = '认证资质'
```

**Exposure Model:** File-based Astro routing. The `Certifications` component is composed into the three landing pages (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) and its `certs` array is shared across locales — there is no per-locale logo wiring, so the asset replacement is automatically reflected in all three locales.
**Locale / Multi-Surface Requirements:** None for this change. The logo asset is not localized; it lives in `public/` and is referenced by absolute path. The visible `certs.label` already exists in `es.ts`, `en.ts`, `zh.ts` and is unchanged.
**Conventions Observed:**
- Static assets in `public/` are referenced via absolute paths (e.g., `/wfr.png`) — see `src/components/Certifications.astro` line 17 and `docs/PROJECT.md` ("Images" convention).
- Project prefers `.webp` / `.avif` for raster assets (`docs/PROJECT.md` Conventions). The provided new asset is already `.webp`, so it lands on-convention.
- Component file naming: PascalCase `.astro` (e.g., `Certifications.astro`).
- The `cert.logoClass` (`logo-wfr`) and the `.logo-wfr` width rule in the component's `<style>` block (lines 99–101 and 121–123) control rendered size; the underlying file format does not affect them.

**Reserved Paths / Redirects / Route Collisions to avoid:** `astro.config.mjs` declares redirects for `/globalrescue`, `/pire`, `/en/pire` — none collide with `/wfr.webp`. No collision risk.

**Documentation Action Taken:** `Used existing docs at docs/PROJECT.md` (already authoritative and up to date for this project).

**Change Tier:** S — 1 component file modified (`src/components/Certifications.astro`), 1 binary asset added (`public/wfr.webp`), 1 obsolete asset deleted (`public/wfr.png`). No schema/migration, no new deps, no new routes, no i18n key changes.

## 1. Design Analysis

**Target Scope:** `src/components/Certifications.astro` and `public/` static asset directory.
**Affected Layers:** Static asset layer (`public/`) and the single Astro component that renders the certifications grid.
**Problem Statement:** The Certifications section currently displays the WFR logo from `public/wfr.png`. The issue requires replacing it with the new image hosted at `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/wfr.webp?alt=media&token=5ac2753f-ae95-4313-9965-a03faf779554`, ensuring the Certifications section displays the new WFR logo.
**Solution Strategy:** Follow the project's established asset convention (local files in `public/`, referenced by absolute path). Download the provided `.webp` file once at implementation time, save it as `public/wfr.webp`, point the `certs` array's WFR entry at `/wfr.webp`, and delete the obsolete `public/wfr.png`. Do NOT hot-link the Firebase Storage URL from the rendered HTML — this project hosts every other certification asset locally (e.g., `epgamt.png`), and external hot-linking would (a) couple the production site to a third-party storage URL with a token in the query string, (b) violate the convention documented in `docs/PROJECT.md`, and (c) prevent any future Astro image pipeline optimization. Local-asset replacement is the on-convention choice.
**Entry Point / Exposure:** No new exposure surface. The `Certifications` component is already imported and rendered in `src/pages/index.astro`, `src/pages/en/index.astro`, and `src/pages/zh/index.astro`; the asset swap propagates to all three locales automatically.
**Locale / Surface Coverage:** N/A — single shared asset, no per-locale handling.
**User Story:** As a visitor browsing Julián's site (in any locale), I want the Certifications section to display the up-to-date WFR Wilderness First Responder logo, so that the credentials shown match the current branding.

## 2. Architecture & Data

### Architecture
The Certifications grid is rendered from a local `certs` array inside `src/components/Certifications.astro`. Each entry has a `name`, `logo` (absolute path to a file in `public/`), and `logoClass` (CSS hook for sizing). The `<img>` tag uses `cert.logo` as `src` and `cert.name` as `alt`. This is a static, pure-presentational change: only the value of `logo` for the WFR entry is touched, plus the matching binary asset on disk. The CSS `.logo-wfr` width rules and the `.cert-logo` `object-fit: contain` rule continue to work without modification because the wrapper, padding, and container sizes are format-agnostic.

### Data Changes
- Translation / i18n keys added: None (the `certs.label` key is unchanged across `es.ts`, `en.ts`, `zh.ts`).
- Schema / migration changes: None.
- Config changes: None.
- Static assets added: `public/wfr.webp` (downloaded from the URL provided in `issue_json`).
- Static assets removed: `public/wfr.png` (now unused; the only consumer is the `certs` array entry being updated).
- New dependencies: None.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `public/wfr.webp` (Create — new WFR logo binary asset, downloaded from `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/wfr.webp?alt=media&token=5ac2753f-ae95-4313-9965-a03faf779554`).
- `src/components/Certifications.astro` (Modify — `certs` array, the entry where `name === 'WFR AIDER'`: change `logo: '/wfr.png'` to `logo: '/wfr.webp'`. Do NOT alter `name`, `logoClass`, the `.logo-wfr` CSS rules, or any other entry.)
- `public/wfr.png` (Delete — no longer referenced after the `certs` array update; verified via repo-wide grep that `Certifications.astro` is the only consumer of `/wfr.png`).

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Download the asset from the Firebase Storage URL and save it verbatim as `public/wfr.webp` at the workspace root. Do not transcode, recompress, or rename. Recommended commands (any one): `curl -L -o public/wfr.webp "https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/wfr.webp?alt=media&token=5ac2753f-ae95-4313-9965-a03faf779554"` or equivalent `wget`. Verify the resulting file is non-empty and is a valid `.webp` (e.g., `file public/wfr.webp` reports a RIFF/WebP container).

**Phase 2: Implementation**
- [ ] In `src/components/Certifications.astro`, locate the `certs` array (top of the frontmatter, around lines 9–20). In the entry whose `name` is `'WFR AIDER'`, change the `logo` value from `'/wfr.png'` to `'/wfr.webp'`. Leave `name`, `logoClass`, all other array entries (e.g., `EPGAMT`), and all CSS rules untouched.

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] No additional integration required. The `Certifications` component is already imported and rendered by all three locale landing pages, so updating the shared `certs` array propagates to `/`, `/en/`, and `/zh/` automatically. Confirm during manual verification.

**Phase 4: Validation & Quality**
- [ ] Delete `public/wfr.png` (it has no remaining consumers after Phase 2). Re-run a repo-wide grep for `wfr.png` and confirm zero matches in `src/`, `astro.config.mjs`, `public/`, and `src/layouts/`. Matches in `package-lock.json` for unrelated `wfr` substrings are noise (they are SHA-512 fragments) — only `*.png` references count.
- [ ] Run the validation gate: `npm run build`. Confirm zero errors and zero `@astrojs/check` warnings.
- [ ] Complete the manual verification script in Section 5.

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```

### Quality Gates
- [ ] `npm run build` exits 0 with no errors and no `@astrojs/check` warnings.
- [ ] `public/wfr.webp` exists and is a valid WebP file.
- [ ] `public/wfr.png` no longer exists.
- [ ] `src/components/Certifications.astro` references `/wfr.webp` (not `/wfr.png`) in the `certs` array.
- [ ] No new dependencies introduced (`package.json` and `package-lock.json` unchanged for `dependencies` / `devDependencies`).
- [ ] No hardcoded colors, no new translation keys, no scope creep.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` has been run at least once.
- [ ] `npm run dev` is running locally (default port 4321).

**Scenario (repeat per locale):**
1. [ ] Open `http://localhost:4321/` (es) and scroll to the Certifications section. Confirm two white-card logos render side-by-side: EPGAMT (unchanged) and the **new** WFR logo. The WFR card must show the new artwork from the Firebase URL, not the previous `wfr.png`.
2. [ ] Open `http://localhost:4321/en/` and confirm the same updated WFR logo renders there.
3. [ ] Open `http://localhost:4321/zh/` and confirm the same updated WFR logo renders there.
4. [ ] Open browser DevTools → Network tab, reload, and confirm the WFR request URL is `/wfr.webp` (200 OK) and there is **no** request to `/wfr.png` (no 404).
5. [ ] Toggle the theme (sun/moon ThemeToggle in the nav) between dark and light. The Certifications cards remain white-backgrounded by design (`.cert-logo-wrap { background: #fff; }`); confirm both logos remain visible and well-contrasted in both themes.
6. [ ] Resize the browser to ≤480 px wide (or use DevTools mobile emulation). Confirm the `.logo-wfr` mobile rule (`width: 100px`) still applies cleanly to the new asset (no overflow, no distortion — `object-fit: contain` should preserve the aspect ratio).

**Success Criteria:**
- ✅ The Certifications section in all three locales (`/`, `/en/`, `/zh/`) displays the new WFR logo from `public/wfr.webp`.
- ✅ No 404s for the old `/wfr.png` path.
- ✅ The EPGAMT logo and all other components are visually unchanged.
- ✅ `npm run build` passes with zero errors / zero warnings.

## 6. Coverage Requirements

- [ ] No automated test suite exists for this project (per `docs/PROJECT.md`). The manual verification script above IS the coverage for this change.
- [ ] Edge cases to consider:
  - The new asset uses transparency (WebP alpha): the white `.cert-logo-wrap` background already handles this — no rule change needed.
  - The new asset's intrinsic aspect ratio differs slightly from the old PNG: `.cert-logo { object-fit: contain }` plus the fixed `.logo-wfr { width: 118px }` (and 100 px on mobile) absorb the difference. Confirm visually during manual verification; if the new logo is dramatically wider/narrower than the old one and looks unbalanced next to EPGAMT, the implementer may adjust the `.logo-wfr` width within the existing rules (this is a local-craft decision per the planner/implementer split).
  - The Firebase Storage URL is signed with a token; the implementer downloads the file once at implementation time and commits it locally. The token is NOT embedded in the running site.

## 7. Acceptance Criteria (Definition of Done)

- [ ] `public/wfr.webp` exists, is a valid WebP, and was sourced from the Firebase URL in `issue_json`.
- [ ] `src/components/Certifications.astro` `certs` array's WFR entry now points `logo` to `/wfr.webp`.
- [ ] `public/wfr.png` has been deleted.
- [ ] No other files modified (no i18n changes, no CSS rule renames, no nav changes, no new components).
- [ ] `npm run build` passes with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification script in Section 5 completed across all three locales and both themes.
- [ ] No regressions in adjacent surfaces (Hero, About, Stats, Gallery, Pricing, Testimonials, CTA, Partners, Social, Footer all visually unchanged).
- [ ] No new dependencies added.
- [ ] Traceability: every requirement in `issue_json` ("change the existing WFR logo", "replace it with the image hosted at <url>", "ensure the Certifications section displays the new WFR logo") is satisfied by the implementation steps above.
