# Feature Specification: Link to blog.aconcagua.co from the marketing site

> **TL;DR (≤2 sentences):** Add a "Blog" entry to the existing primary nav and footer "Navegación" column that opens `https://blog.aconcagua.co` in a new tab, marked with a small inline external-link glyph and an "opens in a new tab" aria suffix. The existing `navLinks` array shape in `Nav.astro` and `Footer.astro` is extended to support an optional `external: true` flag so anchor-scroll links keep their current behaviour while the blog renders with `target="_blank" rel="noopener noreferrer"`.
> **Tier:** S · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/hZSNRqJizZeiegGSPCCh`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git (fetch/push)`
**Git status at planning time (summary):** On branch `chore/add_accessible_discoverable_blog_link`; tree clean except for one untracked file (`bitbucket-api.sh`) at the repo root, unrelated to this change.
**Remote vs `issue_json.git.repository`:** not provided — issue_json carries no `git.repository` field, so no remote-mismatch check is required. The remote name (`aconcagua`) and the issue subject ("Update aconcagua.co (this project)") are consistent.

**Source files consulted:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `firebase.json`, `.firebaserc`, `docs/PROJECT.md`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/LangSwitcher.astro`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`, `src/i18n/utils.ts`, `src/styles/global.css`, `src/styles/nav.css`, `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`.

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions, hosted at `https://aconcagua.co` and deployed to Firebase Hosting.
**Project Type:** Single Astro package (not a monorepo). Static site generation only.
**Primary Stack:** Astro 5.17.3, TypeScript (strict, `astro/tsconfigs/strict`), `.astro` components, plain CSS with design tokens (no Tailwind, no CSS-in-JS), `@astrojs/sitemap`, `sharp`. Path alias `@/*` → `src/*`.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (this is also the type-check gate via `@astrojs/check`)
- Test: N/A — there is no test suite (`docs/PROJECT.md` line 39: "No test suite exists")
- Lint/Format: N/A — none configured

**Validation Gate (authoritative "is this working?" signal):** `npm run build` — must exit 0 with zero `@astrojs/check` errors/warnings. There is no other automated gate in this project.

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs              # i18n config: defaultLocale 'es', locales ['es','en','zh'], prefixDefaultLocale: false
├── docs/PROJECT.md               # Project conventions + nav/footer rules
└── src/
    ├── components/
    │   ├── Nav.astro             # Primary nav — hardcoded navLinks array (lines 13-18)
    │   ├── Footer.astro          # Footer — duplicate navLinks array for "Navegación" column (lines 9-14)
    │   └── LangSwitcher.astro    # External-link rendering reference (uses class:list pattern)
    ├── i18n/
    │   ├── es.ts                 # 'nav.about', 'nav.expeditions', 'nav.testimonials', 'nav.community', 'nav.cta', 'nav.toggle_menu'
    │   ├── en.ts                 # same keys, English
    │   └── zh.ts                 # same keys, Chinese
    └── styles/
        ├── nav.css               # .nav-links a (lines 51-62), .nav-overlay ul a (lines 147-158)
        └── global.css            # design tokens (--accent, --white, etc.)
```

**Exposure Model:** File-based routing. The site has three landing pages (`src/pages/index.astro` for `es`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) that each compose `<Nav lang t />` and `<Footer lang t />`. Both privacy pages (`src/pages/privacidad.astro`, `src/pages/en/privacy.astro`, `src/pages/zh/privacy.astro`) also render Nav and Footer. **Because all surface pages render the same `Nav.astro` and `Footer.astro`, modifying these two components automatically exposes the blog link on every page in every locale.**

The primary nav surface is the `navLinks` array in `src/components/Nav.astro` (~line 13). It feeds two render targets in the same component: the desktop `<ul class="nav-links">` and the mobile `<div class="nav-overlay">`. The footer "Navegación" column re-declares the same anchors as a separate `navLinks` array in `src/components/Footer.astro` (~line 9). `docs/PROJECT.md` lines 122-134 explicitly call out that this duplicate array is the convention and that "for new routes/pages, add a discoverable link — typically in `Footer.astro`, or a new entry in `navLinks` using `href="/<path>"`."

**Locale / Multi-Surface Requirements:** Three locales (`es`, `en`, `zh`). Every user-visible string MUST exist in `es.ts`, `en.ts`, and `zh.ts` — `docs/PROJECT.md` lines 138-140: "Missing keys silently fall back to Spanish — this is a bug, not a feature. Always add to all three or not at all." The blog itself is a separate site (`https://blog.aconcagua.co`) and its localisation is out of scope; only the link label and the aria "opens in a new tab" suffix are localised here.

**Conventions Observed:**
- Component naming: `PascalCase.astro` (e.g. `Nav.astro`). Page naming: lowercase (e.g. `index.astro`).
- i18n keys: dot-namespaced (e.g. `nav.about`, `cta.whatsapp_url`, `gallery.next`).
- External links throughout the codebase use `target="_blank" rel="noopener noreferrer"` (verified: `Partners.astro:36-37`, `CTA.astro:50-51`, `Social.astro:61-62`, `Footer.astro:69-70`, `Footer.astro:159-160`, `ContactFloat.astro:41`, all three privacy pages line 57).
- Focus-visible styling pattern: components use `:focus-visible` selectors with `outline` (verified in `TestimonialCard.astro:185,300`, `Testimonials.astro:212,242`, `ContactFloat.astro:79,88,113`, `ThemeToggle.astro:84`, `Gallery.astro:186`).
- Inline icons: SVGs use `fill="currentColor"` (Footer social icons) or `stroke="currentColor"` (Footer contact icons) so they inherit the surrounding text colour and respect both themes.
- Styling: component-scoped `<style>` blocks, design tokens from `global.css`, no hardcoded hex values in new code (`docs/PROJECT.md` line 161: "Any new UI MUST consume these tokens — no hardcoded colors except the intentional Hero/CTA/Footer gradients").

**Reserved Paths / Redirects / Route Collisions to avoid:** `astro.config.mjs` declares `/globalrescue`, `/pire`, `/en/pire` redirects. The blog target is on a different subdomain (`blog.aconcagua.co`) so there is no route collision on `aconcagua.co`. No new route is introduced.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` (a thorough project description already exists; see lines 113-134 specifically for nav/footer conventions). No new `docs/PROJECT.md` is needed.

**Change Tier:** S — 5 file modifications (2 components + 3 locale dictionaries), no new files, no schema/migration, no new dependencies, no new routes, no new public API. The 3 i18n edits are mandatory parity for one new translation key family; the logical change is a single nav-entry addition.

## 1. Design Analysis

**Target Scope:** UI / navigation surface only. No data layer, no routing, no build configuration changes.
**Affected Layers:** `src/components/Nav.astro`, `src/components/Footer.astro`, `src/i18n/{es,en,zh}.ts`.
**Problem Statement:** The newly published `https://blog.aconcagua.co` is currently unreachable from the marketing site. We need to surface it discoverably on desktop and mobile, with good UX (not intrusive, consistent with existing styling) and proper accessibility (focus states, keyboard navigation, descriptive labels).
**Solution Strategy:** Reuse the project's existing nav-link mechanics. Extend the `navLinks` array shape in `Nav.astro` (and the parallel array in `Footer.astro`) with an optional `external: true` field. When present, the rendered `<a>` gets `target="_blank"`, `rel="noopener noreferrer"`, an `aria-label` composed of the visible label + a localised "opens in a new tab" suffix, and a small inline external-link SVG glyph (`currentColor`, `aria-hidden="true"`) placed after the label. All other rendering paths are untouched; existing anchor-scroll links continue to render as before.

The "interesting but not intrusive" requirement is satisfied by:
- Using the **same typography, color and spacing** as sibling nav links (`var(--text-primary)` via existing `.nav-links a` rules and overlay-link rules — the new entry inherits everything).
- A **12 px** external-link glyph rendered at reduced opacity, inheriting `currentColor`, with no animation, no badge, no highlight.
- **No special positioning** — it sits at the end of the existing list, after `nav.community`, where users expect a tertiary item.

The mobile experience is automatic: the existing mobile overlay already iterates the same `navLinks` array and renders each entry as a serif overlay-link via existing `.nav-overlay ul a` styles. The new entry inherits the same mobile rendering, so mobile typography, focus, and tap target behaviour all match the existing items at zero extra CSS cost.

**Entry Point / Exposure:** Modifications to `src/components/Nav.astro` (lines ~13-18 — `navLinks` const; lines ~28-32 — desktop list render; lines ~63-69 — mobile overlay list render) and `src/components/Footer.astro` (lines ~9-14 — footer `navLinks` const; lines ~82-86 — footer list render). Because every page (`index.astro`, `en/index.astro`, `zh/index.astro`, `privacidad.astro`, `en/privacy.astro`, `zh/privacy.astro`) renders these two components, no per-page edits are required.

**Locale / Surface Coverage:**
- Locales: `es`, `en`, `zh` — all three i18n dictionaries updated.
- Surfaces: desktop nav, mobile nav overlay, footer "Navegación" column. All three are covered by the two component edits because they all read from `navLinks` arrays.

**User Story:** As a visitor on `aconcagua.co` (desktop or mobile, in any of the three supported languages), I want to find a clear, unobtrusive link to the blog, so that I can read Julián's published articles without having to know the subdomain by heart.

## 2. Architecture & Data

### Architecture
The change is purely additive against the established `navLinks` pattern documented in `docs/PROJECT.md` lines 122-134. It introduces one optional field (`external?: boolean`) on the array element shape; the renderer in each component branches on it. No new module, no new component, no new file. The mobile overlay automatically inherits the new entry because it iterates the same array (`Nav.astro:64-68`).

The external-link SVG is inlined directly in each render block (matching the established Footer social-icon pattern at `Footer.astro:20,25,30,35` which already inlines SVGs in JS strings rendered via `set:html`, and the Footer contact icons at `Footer.astro:117-127` which inline SVGs as JSX). For the nav and footer link, the cleaner JSX form is appropriate (no `set:html`).

### Data Changes
- [x] Translation / i18n keys added: `nav.blog` and `a11y.opens_new_tab` in each of `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`.
- [x] Schema / migration changes: None.
- [x] Config changes: None. `astro.config.mjs` is untouched (the blog is a sibling subdomain, not a redirect on `aconcagua.co`).
- [x] Static assets added: None. The external-link glyph is an inline SVG.
- [x] New dependencies: None.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `src/components/Nav.astro` (Modify — `navLinks` const + the two `.map(link => …)` render blocks (desktop `<ul class="nav-links">` and mobile `<div class="nav-overlay">`) — add the blog entry to the array with `external: true`, add an internal-vs-external branch in both render blocks so the external link renders with `target`, `rel`, `aria-label`, and the inline external-link SVG glyph)
- `src/components/Footer.astro` (Modify — `navLinks` const + the footer "Navegación" column `.map(link => …)` render block — same shape change as Nav, same external-rendering branch; the inline glyph in the footer column may use the existing footer link styles unchanged)
- `src/i18n/es.ts` (Modify — add two keys: `'nav.blog': 'Blog'` and `'a11y.opens_new_tab': 'se abre en una pestaña nueva'`)
- `src/i18n/en.ts` (Modify — add `'nav.blog': 'Blog'` and `'a11y.opens_new_tab': 'opens in a new tab'`)
- `src/i18n/zh.ts` (Modify — add `'nav.blog': '博客'` and `'a11y.opens_new_tab': '在新标签页中打开'`)

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] In each of `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`, append the two new keys (`nav.blog`, `a11y.opens_new_tab`) inside the existing dictionary object. Place `nav.blog` adjacent to the other `nav.*` keys for readability; `a11y.opens_new_tab` may sit at the end alongside other miscellaneous accessibility labels (no `a11y.*` group exists today, so this becomes the first member of that family).

**Phase 2: Implementation**
- [ ] In `src/components/Nav.astro`, extend the `navLinks` const to include `{ key: 'nav.blog', href: 'https://blog.aconcagua.co', external: true }` as the final entry. Update the array element type to allow an optional `external?: boolean`.
- [ ] In `src/components/Nav.astro`, update both `.map(link => …)` renderers (the desktop `<ul class="nav-links">` and the mobile `<div class="nav-overlay">`'s `<ul>`). For each, when `link.external` is truthy, render the `<a>` with:
  - `href={link.href}`
  - `target="_blank"`
  - `rel="noopener noreferrer"`
  - `aria-label={`${t(link.key)}, ${t('a11y.opens_new_tab')}`}`
  - the visible `{t(link.key)}` text label
  - an inline 12 px SVG external-link glyph after the label, with `aria-hidden="true"`, `focusable="false"`, `stroke="currentColor"` (or `fill="currentColor"`), small inline margin-left (~4 px), and a slightly reduced opacity (~0.7) so it reads as a hint rather than a primary feature.
  When `link.external` is falsy/undefined, keep the current rendering exactly (`<a href={link.href}>{t(link.key)}</a>` for desktop; `<a href={link.href} class="overlay-nav-link">{t(link.key)}</a>` for the mobile overlay) — non-external entries MUST be byte-identical in output to today.
- [ ] In `src/components/Footer.astro`, extend the local `navLinks` const with the same blog entry (`{ key: 'nav.blog', href: 'https://blog.aconcagua.co', external: true }`) and update the type accordingly. Update the "Navegación" column's `.map(link => …)` renderer in the same way: when `link.external`, render `<a href target="_blank" rel="noopener noreferrer" aria-label={…}>{t(link.key)}<svg …/></a>`. Reuse the same inline SVG markup for visual consistency. Existing entries must continue to render as before.
- [ ] Add minimal component-scoped styling for the new glyph wrapper inside `Nav.astro`'s `<style>` block (or directly via inline style attribute when minimal — the implementer's call). The wrapper rule MUST consume tokens / `currentColor` only; no new hardcoded hex values. The glyph MUST sit on the same baseline as the label text and MUST NOT increase the existing nav row height. If the implementer needs to adjust existing `.nav-links a` flex alignment to keep the glyph baseline stable, do so in the existing nav.css rule rather than adding a sibling rule, and limit the change to alignment only (no colour, no size, no spacing changes that affect the existing four entries).

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] No additional registration is needed. `Nav.astro` is rendered by `src/pages/index.astro` (line 37), `src/pages/en/index.astro` (line 28), `src/pages/zh/index.astro` (line 28), and the three privacy pages. `Footer.astro` is rendered by all the same pages. Updating the two components automatically exposes the blog link on every page in every locale.
- [ ] Verify after the edit that no page file imports or composition needs to change. (Expected: zero page-file edits.)

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` — must exit 0 with no `@astrojs/check` errors/warnings.
- [ ] Run `npm run dev` and execute the manual verification script (Section 5) on the three locales, in light and dark themes, on a desktop viewport (≥1025 px) and a mobile viewport (≤768 px, where the overlay activates).

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero `@astrojs/check` errors and zero warnings.
- [ ] No new dependencies were added to `package.json`.
- [ ] No hardcoded hex values introduced — all colours go through `currentColor` or existing tokens (`docs/PROJECT.md` line 161).
- [ ] All three locale dictionaries contain both new keys (`nav.blog`, `a11y.opens_new_tab`); none of them rely on the Spanish fallback (`docs/PROJECT.md` lines 138-140).
- [ ] Both `navLinks` arrays (Nav and Footer) include the blog entry with `external: true` and a literal `https://blog.aconcagua.co` href.
- [ ] Existing four nav entries (`nav.about`, `nav.expeditions`, `nav.testimonials`, `nav.community`) render identically to before (no `target`, no `rel`, no aria-label suffix, no glyph) — verifiable by visual diff and by inspecting the rendered DOM.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` has run successfully.
- [ ] `npm run dev` is running (default `http://localhost:4321/`).

**Scenario (repeat per locale + per theme + per viewport):**

For each of `/`, `/en/`, `/zh/`:

1. [ ] **Desktop (≥1025 px) — primary nav:** Confirm a "Blog" / "Blog" / "博客" entry appears at the end of the top nav, next to the other links. Confirm the small external-link glyph is visible, subdued, and inline with the label.
2. [ ] **Click the blog link:** A new browser tab opens at `https://blog.aconcagua.co`. The original tab remains on the marketing site and does not navigate.
3. [ ] **Keyboard navigation:** Tab through the nav. The blog link receives a visible focus ring consistent with the project's `:focus-visible` patterns. Pressing Enter activates the link and opens it in a new tab.
4. [ ] **Screen-reader label:** Inspect the rendered `<a>` and confirm `aria-label` reads in the active locale:
    - `es`: `Blog, se abre en una pestaña nueva`
    - `en`: `Blog, opens in a new tab`
    - `zh`: `博客, 在新标签页中打开`
5. [ ] **Mobile (≤768 px) — overlay:** Tap the hamburger. The overlay opens. Confirm the blog entry appears in the same serif treatment as the other overlay links, at the end of the list. Tapping it opens `https://blog.aconcagua.co` in a new tab; the overlay state on the source tab is unchanged.
6. [ ] **Footer "Navegación" column:** Scroll to the footer. Confirm a "Blog" entry appears at the end of the existing list ("Sobre Mí / About / 关于我", "Expediciones / Expeditions / 探险套餐", "Testimonios / Testimonials / 客户评价", "Comunidad / Community / 社区"). Confirm it has the inline external-link glyph and that clicking it opens a new tab.
7. [ ] **Theme toggle:** Switch between dark and light themes. The blog link and its glyph remain readable in both modes (the glyph inherits `currentColor` so this should be automatic).
8. [ ] **Mobile overlay focus trap:** With the overlay open, Tab cycles through the focusable elements including the new blog link, and the existing focus-trap logic (`Nav.astro:138-156`) correctly wraps focus from last → first.
9. [ ] **Existing entries unaffected:** Click each of the other four entries; they continue to anchor-scroll within the page and do not open in a new tab.

**Success Criteria:**
- ✅ A discoverable, non-intrusive "Blog" link is reachable from every page in every locale on both desktop and mobile.
- ✅ The link points to `https://blog.aconcagua.co` and opens in a new tab with `rel="noopener noreferrer"`.
- ✅ Keyboard navigation works; focus state matches the project's `:focus-visible` pattern.
- ✅ Screen-reader users hear a localised "opens in a new tab" suffix.
- ✅ Visual styling is consistent with the existing nav and footer link treatments in both themes.
- ✅ `npm run build` passes with zero errors / warnings.

## 6. Coverage Requirements

- [ ] The project has **no automated test suite** (`docs/PROJECT.md` line 39). The manual verification script in Section 5 IS the coverage. State this explicitly in the implementer's PR description.
- [ ] Edge cases to consider:
    - The blog domain is unreachable / DNS fails → the link still opens a new tab; the browser shows its own error. Out of scope for this site.
    - `target="_blank"` on iOS Safari with pop-up restrictions → standard `rel="noopener noreferrer"` is the correct mitigation; nothing additional needed.
    - User has disabled JS → no impact; this is a plain static `<a>` link with no JS dependency.
    - Right-click → "Open in new tab" / "Copy link address" → works as expected on a plain anchor.
    - Existing focus-trap keystrokes in the mobile overlay → must include the new link in the focusable set; verified manually in step 8.

## 7. Acceptance Criteria (Definition of Done)

- [ ] Both component edits (`Nav.astro`, `Footer.astro`) and all three i18n edits are present.
- [ ] `npm run build` passes with zero errors.
- [ ] Manual verification script (Section 5) passes for all three locales × both themes × desktop + mobile.
- [ ] The blog link appears at the end of the primary nav, in the mobile overlay, and in the footer "Navegación" column on every page.
- [ ] The link opens `https://blog.aconcagua.co` in a new tab with `rel="noopener noreferrer"`.
- [ ] `aria-label` includes the localised "opens in a new tab" suffix in `es`, `en`, and `zh`.
- [ ] No regressions in the four existing nav entries; their rendered HTML is unchanged.
- [ ] No new dependencies in `package.json`.
- [ ] No hardcoded hex colours introduced.

### Traceability — `issue_json` requirements → spec sections
| Requirement (from `issue_json.content`) | Where addressed |
| --- | --- |
| "link to the blog so it is visible and reachable easily" | Phase 2 — entries added to both `Nav.astro` (desktop + mobile overlay) and `Footer.astro` "Navegación" column. |
| "accessible, interesting, but not intrusive at all" | Section 1 (design rationale: same typography/spacing as siblings, subdued external-link glyph, no badge/animation). |
| "good UI and good UX" | Section 1 + Section 5 (visual consistency, theme parity, focus-visible). |
| "point to https://blog.aconcagua.co" | Phase 2 — literal `href: 'https://blog.aconcagua.co'`. |
| "work well on desktop and mobile" | Section 1 — desktop nav + mobile overlay both inherit from the same `navLinks` array; verified in Section 5 steps 1, 5. |
| "focus states, keyboard navigation, appropriate labels" | Phase 2 — `aria-label` with localised "opens in a new tab"; existing `:focus-visible` pattern inherited. Verified in Section 5 steps 3, 4, 8. |
| "keep styling consistent with the current design" | Phase 2 — reuse existing `.nav-links a`, `.nav-overlay ul a`, `.footer-links a` styling; glyph uses `currentColor`; no new tokens. |
