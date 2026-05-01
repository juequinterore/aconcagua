# Feature Specification: Add Blog Link to Site

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/mjCdvP6GFG1X0AVboIfc`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git (fetch & push)`
**Git status at planning time (summary):** On branch `chore/add_blog_discovery_link`; working tree clean except for one untracked helper script (`bitbucket-api.sh`) unrelated to this feature.
**Remote vs `issue_json.git.repository`:** `not provided` (no `git.repository` key in `issue_json` — proceed)

**Source files consulted:**
- `docs/PROJECT.md` — authoritative project description
- `package.json` — scripts and deps
- `astro.config.mjs` — site, redirects, i18n, sitemap config
- `tsconfig.json` — TS config (extends `astro/tsconfigs/strict`)
- `src/components/Nav.astro` — primary navigation (hardcoded `navLinks` array, ~line 13)
- `src/components/Footer.astro` — footer (its own duplicated `navLinks` array, ~line 9)
- `src/styles/nav.css` — nav styling (desktop + mobile overlay)
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` — translation dictionaries (all three locales)
- `src/i18n/utils.ts` — `useTranslations`, `getLangFromUrl`
- `src/pages/index.astro` — example landing composition (ES)
- `.gitignore` — confirms `dist/` is out, `specs/` and `agents/` are tracked

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions. Single-package SSG, deployed to Firebase Hosting.

**Project Type:** Single-package static site (not a monorepo).

**Primary Stack:**
- Astro v5.17.3 (static output, SSG)
- TypeScript 5.9.3 (strict, `astro/tsconfigs/strict`)
- Plain CSS with design tokens (no Tailwind, no CSS-in-JS)
- `@astrojs/check` for build-time type-checking
- `@astrojs/sitemap` for sitemap generation
- `sharp` for image optimization

**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (this also runs `@astrojs/check` — primary automated gate)
- Test: `N/A — no test suite exists`
- Lint/Format: `N/A — no linter or formatter configured`

**Validation Gate (authoritative "is this working?" signal):** `npm run build` must complete with zero errors and zero `@astrojs/check` warnings. Manual browser verification at `/`, `/en/`, `/zh/` across desktop + mobile and light + dark themes is the secondary gate (no automated test suite exists).

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs
├── package.json
├── src/
│   ├── components/
│   │   ├── Nav.astro          ← primary nav, hardcoded navLinks array
│   │   ├── Footer.astro       ← footer, hardcoded navLinks array (mirrors Nav)
│   │   ├── LangSwitcher.astro
│   │   └── ThemeToggle.astro
│   ├── i18n/
│   │   ├── es.ts              ← default locale dictionary
│   │   ├── en.ts
│   │   ├── zh.ts
│   │   └── utils.ts
│   ├── layouts/BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro        (es, default — no /es prefix)
│   │   ├── en/index.astro
│   │   └── zh/index.astro
│   └── styles/
│       ├── global.css
│       ├── nav.css
│       └── animations.css
```

**Exposure Model:** File-based routing. User-discoverable surfaces are:
1. **Primary nav** — `src/components/Nav.astro` `navLinks` array (~line 13). Renders both the desktop bar and the mobile overlay from one source.
2. **Footer "Navegación" column** — `src/components/Footer.astro` `navLinks` array (~line 9), structurally separate from Nav.
3. **Page composition** — each locale's `index.astro` already imports `<Nav>` and `<Footer>`, so updating those two components propagates to all three locales automatically; no per-page changes are required.

**Locale / Multi-Surface Requirements:** Three locales must stay in parity: `es` (default, no URL prefix), `en` (`/en/`), `zh` (`/zh/`). Every translation key must live in all three dictionaries (`es.ts`, `en.ts`, `zh.ts`) — `docs/PROJECT.md` flags missing-key fallback to ES as a bug, not a feature.

**Conventions Observed:**
- File naming: PascalCase `.astro` for components (`Nav.astro`, `Footer.astro`), lowercase for pages (`index.astro`, `privacidad.astro`).
- Module/component pattern: every translated component takes `lang: 'es' | 'en' | 'zh'` and `t: (key: string) => string` props.
- Styling approach: component-scoped `<style>` blocks, with shared rules imported from `src/styles/*.css`. Design tokens via CSS custom properties on `:root` and `[data-theme="light"]`. No hardcoded hex colors in new components (per `docs/PROJECT.md` Prohibitions).
- i18n approach: dot-namespaced keys (`nav.about`, `calendly.url`, `cta.whatsapp_url`). External URLs are stored as i18n keys when they may be locale-aware (e.g., `cta.whatsapp_url`, `calendly.url`).
- External links: `target="_blank"` with `rel="noopener noreferrer"` (verified in `Footer.astro` social links and `cta` flow per `docs/PROJECT.md`).

**Reserved Paths / Redirects / Route Collisions to avoid:** From `astro.config.mjs`: `/globalrescue`, `/pire`, `/en/pire`. Blog is hosted on a separate subdomain (`https://blog.aconcagua.co`), so no path collision risk.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` (already comprehensive — no new docs file created).

## 1. Design Analysis

**Target Scope:** UI components (`Nav.astro`, `Footer.astro`) + i18n dictionaries (`es.ts`, `en.ts`, `zh.ts`). No new routes, no new pages, no schema, no config.

**Affected Layers:**
- Primary navigation (desktop bar + mobile overlay)
- Footer "Navegación" column
- Translation dictionaries (3 locales)

**Problem Statement (from issue):** A blog has been published at `https://blog.aconcagua.co`. The marketing site does not currently link to it, leaving the blog undiscoverable to site visitors.

**Solution Strategy:** Add a single new entry — `Blog` — to the existing hardcoded `navLinks` arrays in both `Nav.astro` and `Footer.astro`. Because the blog lives on an external subdomain, the entry is rendered as an outbound link (`target="_blank"`, `rel="noopener noreferrer"`) with an aria-labelled hint that it opens in a new tab and a small inline external-link SVG icon to communicate the off-site jump tastefully (no extra colour, no badge — matches the existing minimalist nav).

This piggybacks on the existing nav rendering loop instead of carving out a special branch — we extend the `navLinks` item shape with an optional `external` flag and the renderer branches on it. This keeps a single source of truth for nav order and labelling, and matches the project's "navLinks array drives both desktop and mobile overlay" pattern from `docs/PROJECT.md`.

**Entry Point / Exposure:**
- `src/components/Nav.astro` ~line 13 (`navLinks` array) — desktop nav (`.nav-links`) and mobile overlay (`.nav-overlay ul`) both render from this array. Adding the entry here exposes the blog on every page that mounts `<Nav>`, which is every locale's `index.astro` (3 pages) plus the privacy pages (which also mount `<Nav>`).
- `src/components/Footer.astro` ~line 9 (`navLinks` array) — footer "Navegación" column. Same: every page that mounts `<Footer>` shows the link.

**Locale / Surface Coverage:**
- `/` (es) ✅ via shared Nav + Footer
- `/en/` (en) ✅ via shared Nav + Footer
- `/zh/` (zh) ✅ via shared Nav + Footer
- Privacy pages (`/privacidad`, `/en/privacy`, `/zh/privacy`) ✅ — they also use `<Nav>` and `<Footer>`, so they get the link for free.
- Desktop + tablet + mobile (overlay) breakpoints — all driven by the same `navLinks` array, so all breakpoints stay in parity.

**User Story:** As a visitor to aconcagua.co, I want to see a clearly labelled link to the Aconcagua blog so I can read in-depth articles and updates, without having to know the blog's URL or guess a subdomain.

## 2. Architecture & Data

### Architecture

The change reuses the project's existing single-source navigation pattern. Today, `Nav.astro` defines:

```ts
const navLinks = [
  { key: 'nav.about', href: '#sobre' },
  { key: 'nav.expeditions', href: '#expediciones' },
  { key: 'nav.testimonials', href: '#testimonios' },
  { key: 'nav.community', href: '#comunidad' },
];
```

…and renders the same array twice (desktop `.nav-links` and mobile `.nav-overlay ul`). `Footer.astro` defines an identical-shape array of its own and renders it in the footer "Navegación" column.

We extend the item shape with an optional discriminator:

```ts
type NavItem = {
  key: string;
  href: string;
  external?: boolean;          // new — true for off-site links
  ariaKey?: string;            // new — translation key for the accessible label, used when external
};
```

Then we append:

```ts
{ key: 'nav.blog', href: 'https://blog.aconcagua.co', external: true, ariaKey: 'nav.blog_aria' }
```

The render loop in both `Nav.astro` (desktop + overlay) and `Footer.astro` is updated to spread `target="_blank"` + `rel="noopener noreferrer"` + `aria-label={t(item.ariaKey)}` when `item.external` is true, and to render a small inline SVG (the standard "external link" arrow-out-of-box, 12×12px, `currentColor`) immediately after the label, marked `aria-hidden="true"` so it does not duplicate the accessible name.

The blog URL is hardcoded in the array (it is identical across locales — same subdomain regardless of audience). The accessible "opens in a new tab" hint is per-locale.

### Data Changes

- [x] Translation / i18n keys added (3 keys × 3 locales = 9 entries total):
  - `nav.blog` — visible link label
  - `nav.blog_aria` — accessible name for the external link, includes "(opens in a new tab)" phrasing localized per locale
  - Files: `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`
- [ ] Schema / migration changes: None
- [ ] Config changes: None (`astro.config.mjs` untouched — blog is on a separate subdomain, not a project route, so no redirect entry needed)
- [ ] Static assets added: None (external-link icon is inline SVG)
- [ ] New dependencies: None

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `src/i18n/es.ts` (Modify — add `nav.blog: 'Blog'` and `nav.blog_aria: 'Blog (se abre en una pestaña nueva)'` in the Navigation block, near line 7 just after `nav.cta`. Purpose: visible label + accessible name in Spanish.)
- `src/i18n/en.ts` (Modify — add `nav.blog: 'Blog'` and `nav.blog_aria: 'Blog (opens in a new tab)'` in the Navigation block, near line 7 just after `nav.cta`. Purpose: visible label + accessible name in English.)
- `src/i18n/zh.ts` (Modify — add `nav.blog: '博客'` and `nav.blog_aria: '博客（在新标签页中打开）'` in the Navigation block, near line 7 just after `nav.cta`. Purpose: visible label + accessible name in Chinese.)
- `src/components/Nav.astro` (Modify — three changes:
  1. ~line 13: extend the `navLinks` array entry shape (TypeScript inline) and append `{ key: 'nav.blog', href: 'https://blog.aconcagua.co', external: true, ariaKey: 'nav.blog_aria' }` as the last item.
  2. ~line 27 (`.nav-links` desktop loop): when `link.external`, render the anchor with `target="_blank"`, `rel="noopener noreferrer"`, `aria-label={t(link.ariaKey)}`, and append an inline `<svg aria-hidden="true">` external-link icon after the label.
  3. ~line 64 (`.nav-overlay` mobile loop): same external-link treatment, including the inline SVG.

  Also append a tiny scoped `<style>` rule (in the existing `<style>` block) to size/space the icon (e.g., `.nav-link-external-icon { width: 12px; height: 12px; margin-inline-start: 6px; vertical-align: -1px; opacity: 0.75; }`) — uses `currentColor` so it inherits the existing nav link colour token and stays consistent in both themes.)
- `src/components/Footer.astro` (Modify — three changes:
  1. ~line 9: append the same `{ key: 'nav.blog', href: 'https://blog.aconcagua.co', external: true, ariaKey: 'nav.blog_aria' }` to the local `navLinks` array, as the last item.
  2. ~line 83 (`.footer-links` loop in the Navigation column): apply the same external-link rendering — `target="_blank"`, `rel="noopener noreferrer"`, `aria-label={t(link.ariaKey)}`, and the inline SVG icon after the label.
  3. Add a tiny matching CSS rule in the component's `<style>` block (e.g., `.footer-link-external-icon { width: 11px; height: 11px; margin-inline-start: 6px; vertical-align: -1px; opacity: 0.6; }`) — same `currentColor` discipline.)

No other files require changes. The privacy pages, all three locale `index.astro`s, and any other page already mount `<Nav>` and `<Footer>`, so the link surfaces everywhere automatically.

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Add the two new keys (`nav.blog`, `nav.blog_aria`) to all three i18n dictionaries (`es.ts`, `en.ts`, `zh.ts`) with the values listed above. Order them alongside the existing `nav.*` keys in each file. Do not commit a partial set — every key must exist in all three.

**Phase 2: Implementation**
- [ ] In `src/components/Nav.astro`:
  - Update the `navLinks` constant: extend the inline item type to `{ key: string; href: string; external?: boolean; ariaKey?: string }` and append the Blog entry as the last item.
  - In the `.nav-links` map (desktop), branch on `link.external`: when true, set `target="_blank"`, `rel="noopener noreferrer"`, `aria-label={t(link.ariaKey!)}`, and render the inline external-link SVG (12×12, `currentColor`, `aria-hidden="true"`) directly after `{t(link.key)}`.
  - In the `.nav-overlay ul` map (mobile), apply the identical treatment so the mobile menu stays at parity.
  - Add the `.nav-link-external-icon` selector to the component-scoped `<style>` block (the file already imports `nav.css` and has a `<style>` block — keep new rules scoped).
- [ ] In `src/components/Footer.astro`:
  - Update the local `navLinks` constant (same shape change) and append the Blog entry.
  - In the `.footer-links` map for the Navigation column, apply the same external-link branch (target, rel, aria-label, inline SVG).
  - Add the `.footer-link-external-icon` rule to the component-scoped `<style>` block. Use `currentColor` so it inherits the existing footer-link colour (`rgba(255, 255, 255, 0.55)` and the `:hover` `var(--white)`), keeping the footer's intentional dark surface intact (`docs/PROJECT.md` flags footer as kept dark).

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] Confirm no per-page edits are required: `<Nav>` and `<Footer>` are already mounted in `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`, `src/pages/privacidad.astro`, `src/pages/en/privacy.astro`, `src/pages/zh/privacy.astro`. The shared-component pattern means the new link appears on all six pages once `Nav.astro` and `Footer.astro` ship.
- [ ] Verify all three locale dictionaries contain both new keys (`nav.blog`, `nav.blog_aria`) — missing keys silently fall back to Spanish, which is a bug per `docs/PROJECT.md`.
- [ ] No `astro.config.mjs` change required (blog is an external subdomain, not a project route — no redirect entry, no sitemap exclusion needed).

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` and confirm zero errors and zero `@astrojs/check` warnings (this is the project's authoritative gate per `docs/PROJECT.md`).
- [ ] Run `npm run dev` and execute the Manual Verification Script in Section 5 across all three locales, both themes, desktop + mobile.
- [ ] Visually confirm the external-link icon inherits the correct colour token in both light and dark themes (it should — it uses `currentColor`).

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero `@astrojs/check` errors and zero warnings.
- [ ] No new dependencies added (verify `package.json` and `package-lock.json` are unchanged for `dependencies` / `devDependencies` keys; lock file may shift only if `npm install` was unnecessarily run — it should not have been).
- [ ] No hardcoded hex colours in the diff (icon uses `currentColor`).
- [ ] All three i18n dictionaries contain `nav.blog` and `nav.blog_aria`.
- [ ] `Nav.astro` and `Footer.astro` both render the Blog link with `target="_blank"` and `rel="noopener noreferrer"`.
- [ ] No per-page edits required (changes flow through shared components — confirm by inspecting only the five files listed in "Files to Change").

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` already run on a fresh checkout.
- [ ] `npm run dev` running locally on `http://localhost:4321`.

**Scenario A — Spanish (default locale):**
1. [ ] Open `http://localhost:4321/`.
2. [ ] In the desktop nav (≥1025px), confirm a "Blog" link appears as the last item before the LangSwitcher / ThemeToggle / CTA cluster.
3. [ ] Confirm a small external-link icon sits directly after the "Blog" label.
4. [ ] Hover the link — it follows the existing `rgba(255, 255, 255, 0.8)` → `var(--white)` colour transition; the icon inherits the same colour change.
5. [ ] Click the link — it opens `https://blog.aconcagua.co` in a new tab; the original tab remains on `/`.
6. [ ] Right-click → Inspect: confirm `target="_blank"`, `rel="noopener noreferrer"`, and `aria-label="Blog (se abre en una pestaña nueva)"` are present on the anchor.
7. [ ] Resize to ≤768px → hamburger appears. Open the mobile overlay → confirm "Blog" appears in the overlay list with the same external-link icon and the same accessible-name behaviour.
8. [ ] Tab through the page with keyboard only — confirm the "Blog" link is reachable, has a visible focus outline, and screen-reader-announced text matches the `aria-label`.
9. [ ] Scroll to the footer → confirm "Blog" appears as the last item in the "Navegación" column with the icon, opens in a new tab, has the same `aria-label`.

**Scenario B — English:**
1. [ ] Open `http://localhost:4321/en/`.
2. [ ] Repeat steps 2–9 from Scenario A. Expected label: `Blog`. Expected `aria-label`: `Blog (opens in a new tab)`.

**Scenario C — Chinese:**
1. [ ] Open `http://localhost:4321/zh/`.
2. [ ] Repeat steps 2–9 from Scenario A. Expected label: `博客`. Expected `aria-label`: `博客（在新标签页中打开）`.

**Scenario D — Theme cross-check (run in any one locale):**
1. [ ] Toggle to light theme via ThemeToggle. Confirm the Blog label and external-link icon remain legible against `--bg-nav` (nav stays dark by design — both should read white-ish).
2. [ ] Scroll past the hero so the nav transitions to its `.scrolled` state — confirm Blog link still legible and icon still visible.
3. [ ] Footer is intentionally kept dark in both themes (per `docs/PROJECT.md`) — confirm the footer Blog link and icon read as light-on-dark in both themes.

**Success Criteria:**
- ✅ Blog link visible and clickable in both Nav (desktop + mobile overlay) and Footer across all three locales.
- ✅ Link opens `https://blog.aconcagua.co` in a new tab with `rel="noopener noreferrer"`.
- ✅ Localized accessible name announces "opens in a new tab" in each locale.
- ✅ External-link icon renders alongside the label and inherits link colour.
- ✅ No layout regressions at 1440px / 1024px / 768px / 375px breakpoints.
- ✅ No regressions in dark or light theme.
- ✅ `npm run build` passes cleanly.

## 6. Coverage Requirements

- [ ] No automated test suite exists in this project (per `docs/PROJECT.md` → "No test suite exists. Validation is via `npm run build` … and manual browser verification across all three locales."). The Manual Verification Script in Section 5 IS the coverage for this change.
- [ ] Edge cases to consider:
  - Mobile overlay focus trap must continue to include the Blog link (it will, because the focus trap queries `a[href], button:not([disabled])` — verified at `Nav.astro` ~line 98).
  - Mobile overlay closes on `.overlay-nav-link` click (line 124); the new Blog link, being external + `target="_blank"`, should still close the overlay before the new tab opens — this is fine, but verify in Scenario A step 7 that clicking Blog in mobile closes the overlay AND opens the new tab.
  - User has JavaScript disabled: pure anchor, still works.
  - User has a screen reader: `aria-label` is the authoritative accessible name and includes the new-tab hint; the SVG is `aria-hidden="true"` so it does not pollute the announcement.
  - `prefers-reduced-motion`: no new animations introduced.
  - Bidi / RTL: site is LTR-only across es/en/zh; `margin-inline-start` keeps the icon on the trailing edge anyway.

## 7. Acceptance Criteria (Definition of Done)

- [ ] All four implementation phases completed.
- [ ] `npm run build` passes with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification scenarios A, B, C, D all completed successfully.
- [ ] `nav.blog` and `nav.blog_aria` exist in all three of `es.ts`, `en.ts`, `zh.ts` with the values specified in Section 3.
- [ ] Blog link appears in both Nav (desktop bar + mobile overlay) and Footer Navigation column on every page and every locale.
- [ ] Blog link opens `https://blog.aconcagua.co` in a new tab with `rel="noopener noreferrer"`.
- [ ] Blog link has a localized `aria-label` carrying the "opens in a new tab" hint.
- [ ] External-link SVG icon renders next to the label, sized 11–12px, inheriting `currentColor`.
- [ ] No new dependencies introduced.
- [ ] No hardcoded hex colours introduced (icon uses `currentColor`; any new style rules consume tokens).
- [ ] No regressions in adjacent surfaces (LangSwitcher, ThemeToggle, CTA, focus trap, scroll-state nav).

### Traceability (issue requirement → implementation step)

| Requirement (from `issue_json`) | Implementation step |
|---|---|
| Link to `https://blog.aconcagua.co` is visible and easily reachable | Blog entry appended to `Nav.astro` `navLinks` (Phase 2 step 1) — surfaces in desktop nav + mobile overlay on every page/locale |
| Tasteful navigation item / not intrusive | Same array, same render loop, same styling tokens — link is visually consistent with About / Expeditions / Testimonials / Community; only differentiator is a 12px external-link glyph |
| Optionally reinforced in the footer | Same entry appended to `Footer.astro` `navLinks` (Phase 2 step 2) — appears in the "Navegación" column |
| Clearly labelled (e.g., "Blog") | `nav.blog` key — `Blog` / `Blog` / `博客` |
| Works across responsive breakpoints | Single `navLinks` array drives desktop, tablet, and mobile-overlay renderings; footer has its own breakpoints (1200px / 1024px / 600px) and the new link inherits them automatically |
| Accessibility best practices | `aria-label` localized per locale carrying the "opens in a new tab" hint; SVG icon `aria-hidden="true"`; `rel="noopener noreferrer"`; keyboard focus order unchanged; mobile-overlay focus trap continues to include the link |
