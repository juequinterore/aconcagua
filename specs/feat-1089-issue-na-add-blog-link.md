# Feature Specification: Add Blog link to site

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/EAJbtEjrFiU2NfC6cvr5`
**Git remote(s) (from `git remote -v`):** `origin → git@github.com:juequinterore/aconcagua.git (fetch + push)`
**Git status at planning time (summary):** On branch `chore/add_visible_link_to_blog`; one untracked file (`bitbucket-api.sh`) outside the spec scope; tracked tree clean.
**Remote vs `issue_json.git.repository`:** `not provided` — `issue_json` does not include a `git.repository` field; no mismatch check applies.

**Source files consulted:**
- `docs/PROJECT.md` (authoritative project guide — already exists, comprehensive)
- `package.json` (scripts, deps, Astro 5.17.3)
- `astro.config.mjs` (i18n, redirects, sitemap)
- `src/components/Nav.astro` (hardcoded `navLinks` array, mobile overlay reuse, scroll behavior)
- `src/components/Footer.astro` (footer Navigation column reuses the same shape)
- `src/styles/nav.css` (nav link styles, mobile overlay typography, mobile breakpoint)
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (translation dictionaries — `nav.*` namespace)
- `src/i18n/utils.ts` (`useTranslations`, fallback-to-Spanish behavior)
- `src/pages/index.astro` (composition pattern)

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions. Multi-locale (`es` default, `en`, `zh`), deployed to Firebase Hosting.
**Project Type:** Single Astro package (not a monorepo) producing a static site.
**Primary Stack:** Astro v5.17.3, TypeScript (strict), `.astro` components, plain CSS with design tokens, `@astrojs/sitemap`, `sharp`. No Tailwind. No tests.

**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev` (Astro dev server, default port 4321)
- Build: `npm run build` (runs `@astrojs/check` type-check then `astro build`)
- Test: `N/A — no test suite exists` (per `docs/PROJECT.md` line 39)
- Lint/Format: `N/A — no linter configured` (per `docs/PROJECT.md` line 40)

**Validation Gate (authoritative "is this working?" signal):** `npm run build` — must complete with zero errors and zero `@astrojs/check` warnings.

**Directory Structure (relevant portions):**
```
src/
├── components/
│   ├── Nav.astro            # Hardcoded navLinks (line 13), reused for mobile overlay (line 64)
│   ├── Footer.astro         # Hardcoded navLinks (line 9), Navigation column (lines 80–87)
│   └── ... (other section components, untouched)
├── i18n/
│   ├── es.ts                # 'nav.about', 'nav.expeditions', 'nav.testimonials', 'nav.community', 'nav.cta'
│   ├── en.ts                # mirror
│   ├── zh.ts                # mirror
│   └── utils.ts             # useTranslations() with fallback-to-es
├── pages/
│   ├── index.astro          # ES landing
│   ├── en/index.astro       # EN landing
│   └── zh/index.astro       # ZH landing
└── styles/
    └── nav.css              # .nav-links, .nav-overlay typography
```

**Exposure Model:** File-based routing for pages; navigation is driven by a hardcoded `navLinks` array in `src/components/Nav.astro` (rendered both in desktop nav and the mobile overlay) and a parallel hardcoded array in `src/components/Footer.astro`. New navigation entries MUST be added to BOTH files, and any new translation keys MUST exist in all three locale dictionaries (per `docs/PROJECT.md` lines 118–134, 191–195).
**Locale / Multi-Surface Requirements:** Every user-visible string must exist in `es.ts`, `en.ts`, AND `zh.ts`. Fallback to Spanish is silent — relying on it is treated as a bug per `docs/PROJECT.md` line 140.
**Conventions Observed:**
- File naming: PascalCase `.astro` for components (e.g., `Nav.astro`); lowercase `.astro` for pages.
- Module/component pattern: each component receives `lang: 'es' | 'en' | 'zh'` and `t: (key: string) => string` as props (e.g., `Nav.astro` lines 5–11).
- Styling approach: scoped `<style>` per component, design tokens in `src/styles/global.css`, no hardcoded hex colors except intentional Hero/CTA/Footer gradients.
- i18n approach: dot-namespaced keys (`nav.about`, `footer.tagline`); same key in all three locale files; fallback is silent and considered a bug.
- External links: existing pattern in `Footer.astro` uses `target="_blank" rel="noopener noreferrer"` (lines 67–73, 134, 159–161) — this is the convention.
- Test pattern: N/A (no tests).

**Reserved Paths / Redirects / Route Collisions to avoid:** From `astro.config.mjs`: `/globalrescue`, `/pire`, `/en/pire`. The blog target is the external subdomain `https://blog.aconcagua.co` (NOT a path on `aconcagua.co`), so there is no on-site path collision. We do NOT create a `/blog` route.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` — comprehensive and accurate. No new project doc was needed.

## 1. Design Analysis

**Target Scope:** Cross-cutting navigation surfaces — the primary `Nav.astro` (desktop nav + mobile overlay) and the `Footer.astro` Navigation column. No section component, no new page, no new route.
**Affected Layers:** Navigation, footer, i18n dictionaries (all three locales). No data, no schema, no config.
**Problem Statement:** A new external blog has been published at `https://blog.aconcagua.co`. The marketing site currently has no path that surfaces or links to it, so visitors cannot discover or reach it from `aconcagua.co`. The link must be visible, easy to reach, clearly labeled "Blog", visually consistent with the existing minimalist nav (no shouting), and accessible.
**Solution Strategy:**
1. Add a new `nav.blog` entry to all three i18n dictionaries (`es.ts`, `en.ts`, `zh.ts`) plus a sibling key (`nav.blog_aria_external`) that supplies the screen-reader-only suffix declaring the link opens in a new tab. Both keys are required (no silent fallback).
2. Extend the `navLinks` array shape in `Nav.astro` and `Footer.astro` with an optional `external?: boolean` flag. When `external` is true, the renderer adds `target="_blank"`, `rel="noopener noreferrer"`, an `aria-label` composed of `t(link.key)` + `t('nav.blog_aria_external')`, and an inline external-link glyph (small SVG, ~12px, `currentColor`, `aria-hidden="true"`) to visually signal off-site.
3. Insert the new entry as the **last** item in both nav arrays — keeps it discoverable but not displacing the section anchors that drive landing-page reading order. (Issue requires "interesting but not intrusive": rightmost position in the link cluster + subtle external-glyph icon is the chosen UI/UX register.)
4. Style the external-link glyph in scoped CSS using existing design-token-friendly properties (`currentColor`, opacity, transition) — no new color values, no new dependency, no animation that would feel intrusive. On hover, the glyph follows the same color transition as the link text. In the mobile overlay, the glyph uses the larger overlay font scale automatically since it is sized in `em`.
5. Footer mirrors the change so the link remains reachable from the bottom of the page (long pages on mobile).

**Entry Point / Exposure:**
- `src/components/Nav.astro` — desktop nav `<ul class="nav-links">` (lines 27–33) AND mobile overlay `<ul>` (lines 63–69). Both render from the same `navLinks` array (line 13), so a single array entry covers both surfaces.
- `src/components/Footer.astro` — Navigation column `<ul class="footer-links">` (lines 80–87). Renders from a separate hardcoded `navLinks` array (line 9). MUST be updated independently.

**Locale / Surface Coverage:** ES (`/`), EN (`/en/`), ZH (`/zh/`) — all three locales, both desktop and mobile nav, plus footer. Six visible appearances of the link in total (desktop nav × 3 locales + mobile overlay × 3 locales + footer × 3 locales = nine, all driven by two array entries and three i18n strings — no per-locale code branches).
**User Story:** As a visitor on aconcagua.co (in any of the three supported languages, on desktop or mobile), I want a clearly labeled, unobtrusive way to reach the new blog at `blog.aconcagua.co`, so that I can read Julián's published expedition content without leaving the website cold or having to search for it.

## 2. Architecture & Data

### Architecture

The change extends two existing data structures (the `navLinks` arrays) and the rendering logic that consumes them. No new component is created — adding a wrapper component would be speculative scaffolding for a single link. The pattern follows what's already done for the existing in-page anchor links; the only new branch is the `external` flag, which is the smallest possible diff that satisfies the security/UX requirements for off-site links.

The external-link glyph is implemented as inline SVG inside the `<a>` element (`aria-hidden="true"`, sized with `em` so it scales with the surrounding font in both the small desktop nav and the large mobile overlay typography). This matches the inline-SVG pattern already used in `Footer.astro` for the contact icons (lines 117–135).

The `aria-label` for the external link concatenates the localized link text with a localized "(opens in new tab)" suffix, satisfying WCAG 2.4.4 "Link Purpose (In Context)" and 3.2.5 "Change on Request" — users are warned, in their language, that activation will spawn a new tab.

**Patterns reused (with citations):**
- Hardcoded link array driving both desktop and mobile nav: `src/components/Nav.astro` lines 13, 28–32, 64–68
- `target="_blank" rel="noopener noreferrer"` for external links: `src/components/Footer.astro` lines 66–73 (social), 134 (WhatsApp)
- Inline SVG with `aria-hidden`: `src/components/Footer.astro` lines 117–135
- Locale-mirrored dictionaries: `src/i18n/{es,en,zh}.ts` (every existing nav key)

### Data Changes
- [x] Translation / i18n keys added:
  - `nav.blog` — `es.ts: 'Blog'`, `en.ts: 'Blog'`, `zh.ts: '博客'`
  - `nav.blog_aria_external` — `es.ts: '(se abre en una pestaña nueva)'`, `en.ts: '(opens in a new tab)'`, `zh.ts: '（在新标签页中打开）'`
  - `nav.blog_url` — `es.ts: en.ts: zh.ts: 'https://blog.aconcagua.co'` (single canonical URL key, mirrors how `cta.whatsapp_url` and `calendly.url` are kept in dictionaries — keeps the URL out of component source for symmetry with existing convention)
- [ ] Schema / migration changes: None
- [ ] Config changes (list files): None — `astro.config.mjs` is untouched. `https://blog.aconcagua.co` is an external subdomain, not a route on this site; no redirect, no sitemap entry, no i18n routing change required.
- [ ] Static assets added: None — the external-link glyph is inline SVG (~120 bytes), no file in `public/`.
- [ ] New dependencies (with justification): None.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `src/i18n/es.ts` (Modify — add `'nav.blog'`, `'nav.blog_aria_external'`, `'nav.blog_url'` to the `// Navigation` block, near line 7 — purpose: Spanish strings + canonical URL)
- `src/i18n/en.ts` (Modify — add the same three keys to the `// Navigation` block, near line 7 — purpose: English strings + canonical URL, parity)
- `src/i18n/zh.ts` (Modify — add the same three keys to the `// Navigation` block, near line 7 — purpose: Chinese strings + canonical URL, parity)
- `src/components/Nav.astro` (Modify — at the `navLinks` array (~line 13), append `{ key: 'nav.blog', href: t('nav.blog_url'), external: true }`; widen the inline type to `{ key: string; href: string; external?: boolean }`; in the desktop `<ul class="nav-links">` map (lines 28–32) and the mobile overlay `<ul>` map (lines 64–68), branch on `link.external` to add `target`, `rel`, composite `aria-label`, and the inline external-link SVG; add scoped CSS for `.nav-link-external-icon` in the `<style>` block — purpose: render the entry on both desktop and mobile surfaces with correct external-link semantics and unobtrusive visual cue)
- `src/components/Footer.astro` (Modify — at the `navLinks` array (~line 9), append the same `{ key: 'nav.blog', href: t('nav.blog_url'), external: true }` entry, widen the inline type, and update the Navigation column `<ul class="footer-links">` map (~lines 83–85) to branch on `link.external` and emit `target`, `rel`, composite `aria-label`, and the inline external-link SVG; add scoped CSS for `.footer-link-external-icon` mirroring the nav style — purpose: keep the link reachable from the page bottom across all locales)

That is the **complete** change set. No new file is created. No file is deleted.

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Add three keys (`nav.blog`, `nav.blog_aria_external`, `nav.blog_url`) to each of `src/i18n/es.ts`, `en.ts`, `zh.ts`. Place them under the existing `// Navigation` comment block. Use the exact strings listed in §2 "Data Changes". Verify all three locales have all three keys (no missing-key fallback).

**Phase 2: Implementation**
- [ ] In `src/components/Nav.astro`, widen the `navLinks` array element type to allow an optional `external` boolean. Append `{ key: 'nav.blog', href: t('nav.blog_url'), external: true }` as the **last** entry. Note: because the array is declared in the component frontmatter, `t` is already in scope there — no import change needed.
- [ ] In `Nav.astro` desktop `<ul class="nav-links">` (lines 27–33) and mobile overlay `<ul>` (lines 63–69), update the `.map(link => …)` rendering so that when `link.external` is true, the rendered `<a>` includes:
  - `href={link.href}`
  - `target="_blank"`
  - `rel="noopener noreferrer"`
  - `aria-label={`${t(link.key)} ${t('nav.blog_aria_external')}`}`
  - The link text is `{t(link.key)}` followed by an inline `<svg class="nav-link-external-icon" aria-hidden="true" focusable="false" width="0.7em" height="0.7em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>` (an arrow ↗ glyph, sized in `em` so it scales with the parent font in both desktop and mobile-overlay contexts).
  - When `link.external` is false/undefined, the existing rendering (`<a href={link.href}>{t(link.key)}</a>`) is preserved verbatim.
- [ ] Add a scoped CSS rule inside `Nav.astro`'s `<style>` block (alongside the existing `@import '../styles/nav.css';`):
  ```css
  .nav-link-external-icon {
    display: inline-block;
    margin-left: 0.35em;
    vertical-align: -0.05em;
    opacity: 0.6;
    transition: opacity 0.2s, transform 0.2s;
  }
  a:hover > .nav-link-external-icon,
  a:focus-visible > .nav-link-external-icon {
    opacity: 1;
    transform: translate(1px, -1px);
  }
  ```
  Uses `currentColor` (inherited from the SVG `stroke="currentColor"`), `em` units, opacity, and transform — no hardcoded color, no new design token, no animation longer than 200 ms (matches the existing `transition: color 0.2s` cadence in `nav.css`).
- [ ] In `src/components/Footer.astro`, repeat the array extension and rendering branch in the Navigation column (`{navLinks.map(link => (<li><a href={link.href}>{t(link.key)}</a></li>))}` at lines 83–85). Append the same `{ key: 'nav.blog', href: t('nav.blog_url'), external: true }` entry to the array at line 9. Add an analogous scoped CSS rule (`.footer-link-external-icon`, identical body — name kept distinct so the two components remain independently styleable).

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] Verify the entry renders in: desktop nav at `/`, `/en/`, `/zh/`. Mobile overlay (open hamburger) at `/`, `/en/`, `/zh/`. Footer Navigation column at `/`, `/en/`, `/zh/`. Each of the nine appearances must show the localized "Blog" / "博客" label with the trailing arrow glyph.
- [ ] Verify each rendered `<a>` includes `target="_blank"`, `rel="noopener noreferrer"`, and a localized `aria-label` ending with the "(opens in a new tab)" suffix in the active locale.
- [ ] Verify there is no `/blog` route on this site (none was created; the destination is the external subdomain).

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` — must complete with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification per §5 — exercise all three locales, both viewports, both themes (light + dark), and both keyboard activation paths.

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```
(The Astro build runs `@astrojs/check` for TypeScript/Astro type-checking as part of the same script — there is no separate lint or test step in this project.)

### Quality Gates
- [ ] `npm run build` exits 0 with no errors and no warnings (the project's authoritative validation gate per `docs/PROJECT.md`).
- [ ] No new dependencies added (verify `package.json` and `package-lock.json` diffs are zero).
- [ ] No hardcoded hex colors introduced in the new CSS — only `currentColor`, `opacity`, `transform`, transition, and `em`-based sizing.
- [ ] All three i18n dictionaries contain `nav.blog`, `nav.blog_aria_external`, and `nav.blog_url`.
- [ ] Both `Nav.astro` and `Footer.astro` `navLinks` arrays include the new entry as the last element.
- [ ] No `/blog` route was created in `src/pages/` (this is intentional — the link is external).
- [ ] No reserved redirect path (`/globalrescue`, `/pire`, `/en/pire`) is shadowed.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` has been run.
- [ ] `npm run dev` is running; dev server is reachable at `http://localhost:4321`.
- [ ] Browser DevTools is open, with the Network tab and Console available.

**Scenario A — Desktop nav, Spanish (default):**
1. [ ] Navigate to `http://localhost:4321/`.
2. [ ] In the top nav, observe the link cluster: "Sobre Mí · Expediciones · Testimonios · Comunidad · Blog ↗". The "Blog" entry sits last and shows a small arrow glyph.
3. [ ] Hover the "Blog" link — the text should shift to white (existing nav-link hover) and the arrow glyph's opacity/transform shifts subtly. No layout shift in the rest of the nav.
4. [ ] Inspect the rendered element — confirm `target="_blank"`, `rel="noopener noreferrer"`, `href="https://blog.aconcagua.co"`, and `aria-label="Blog (se abre en una pestaña nueva)"`.
5. [ ] Click the link — a new tab opens to `https://blog.aconcagua.co`. The `aconcagua.co` tab is preserved.

**Scenario B — Desktop nav, English:**
1. [ ] Navigate to `http://localhost:4321/en/`.
2. [ ] Confirm the link reads "Blog" with the arrow glyph and the `aria-label` is "Blog (opens in a new tab)".

**Scenario C — Desktop nav, Chinese:**
1. [ ] Navigate to `http://localhost:4321/zh/`.
2. [ ] Confirm the link reads "博客" with the arrow glyph and the `aria-label` is "博客 （在新标签页中打开）".

**Scenario D — Mobile overlay, all locales:**
1. [ ] Resize the browser to ≤ 768 px (or use device emulation).
2. [ ] Open the hamburger.
3. [ ] Confirm "Blog" / "博客" appears as the last item, rendered in the overlay's serif Playfair display font. The arrow glyph scales up with the larger text (because it is sized in `em`) and remains visually balanced.
4. [ ] Tap the link — overlay closes (existing close-on-click behavior covers it via the `.overlay-nav-link` selector wired in `Nav.astro` line 124; verify the new link carries the `overlay-nav-link` class so this works).
5. [ ] Repeat for `/en/` and `/zh/`.

**Scenario E — Footer Navigation column:**
1. [ ] At `/`, `/en/`, `/zh/`, scroll to the footer and locate the "Navegación" / "Navigation" / "导航" column.
2. [ ] Confirm "Blog" / "博客" appears as the last entry, with the arrow glyph, target=_blank, rel set, and localized aria-label.
3. [ ] Click — confirms the same external-tab behavior.

**Scenario F — Theme parity:**
1. [ ] Toggle the theme (sun/moon button). The nav stays dark (per `nav.css` — intentional). Confirm the Blog link and its arrow glyph remain legible against the dark nav surface in both light and dark page themes. The footer also stays dark by design (`--bg-footer`); confirm the new link reads correctly there too.

**Scenario G — Keyboard / a11y:**
1. [ ] Tab through the nav — focus reaches the Blog link in the same order as the other nav links. The focus ring (browser default or any global outline rule) is visible.
2. [ ] Press Enter on the focused Blog link — opens in new tab.
3. [ ] With a screen reader (VoiceOver on macOS / NVDA on Windows), confirm the announced label includes the "(opens in a new tab)" suffix in the active locale.
4. [ ] Confirm the inline arrow SVG is NOT announced (it is `aria-hidden="true"` and `focusable="false"`).

**Success Criteria:**
- ✅ The Blog link is visible from every page of `aconcagua.co` (header on every locale × viewport × footer on every locale).
- ✅ The label is "Blog" in ES/EN and "博客" in ZH — clear, fits the existing visual register, no over-decoration.
- ✅ Activation opens `https://blog.aconcagua.co` in a new tab; the source tab is preserved.
- ✅ Screen readers announce the localized "(opens in a new tab)" hint.
- ✅ `npm run build` completes with zero errors/warnings.
- ✅ No regressions in the other nav links, the mobile overlay focus trap, the hamburger close behavior, the footer layout, or the theme system.

## 6. Coverage Requirements

- [ ] The project has no test suite (per `docs/PROJECT.md` line 39). The manual verification script in §5 IS the coverage. This is stated explicitly to comply with §0 of the global rules.
- [ ] Edge cases to consider:
  - User opens hamburger, taps Blog → overlay must close (covered by `.overlay-nav-link` click handler in `Nav.astro` lines 124–126; the new link must carry that class).
  - Screen reader users on iOS/macOS Safari — VoiceOver MUST read the localized "(opens in a new tab)" suffix from the `aria-label`.
  - Keyboard-only users — the focus trap inside the mobile overlay (`Nav.astro` lines 138–156) must continue to function with the new link present (the trap is built from `overlay.querySelectorAll(focusableSelectors)` which already includes any `a[href]`, so the new link integrates automatically).
  - Pop-up blockers — `target="_blank"` with `rel="noopener noreferrer"` is the standard, browser-blocker-friendly pattern; no `window.open` JS shim is added.
  - Future redesigns — keeping the URL in `nav.blog_url` (a translation key) means a brand decision to point the link elsewhere is a one-locale-edit-times-three change, not a code-search.
  - Sitemap — `https://blog.aconcagua.co` lives on a different origin and is intentionally not added to this site's sitemap (sitemaps are per-origin per the spec). No action.

## 7. Acceptance Criteria (Definition of Done)

- [ ] All implementation phases (1–4) completed.
- [ ] `npm run build` passes with zero errors/warnings.
- [ ] Manual verification script (§5, scenarios A–G) executed and all success criteria met.
- [ ] Both `Nav.astro` and `Footer.astro` `navLinks` arrays include the new entry; both i18n surfaces include the new keys.
- [ ] No new dependencies; no new pages; no new redirects; no shadowing of existing redirects.
- [ ] No regressions in: existing nav anchors, mobile overlay focus trap, hamburger toggle, theme toggle, language switcher, footer layout.

### Traceability — `issue_json` requirements → plan steps
| Requirement (from `issue_json.content`) | Plan step(s) |
| --- | --- |
| "Update the aconcagua.co project to include a link to the blog" | §3 Phase 2 — Append entry to `Nav.astro` and `Footer.astro` `navLinks` |
| "visible and easily reachable from the website" | Header on every page (Nav) + bottom of every page (Footer), all three locales — §3 Phase 3 |
| "UI/UX approach that is interesting but not intrusive" | Subtle external-link arrow glyph, `em`-sized, opacity 0.6 → 1 on hover, 200 ms transition, last-position placement — §3 Phase 2 + scoped CSS |
| "clearly labeled (e.g., 'Blog')" | `nav.blog` = "Blog" / "Blog" / "博客" — §2 Data Changes |
| "fit the existing visual style" | Reuses existing nav-link color, hover transition, scoped CSS, design tokens; no new colors; arrow glyph styled with `currentColor` |
| "accessible" | `aria-label` with localized "(opens in a new tab)" suffix; SVG is `aria-hidden`/`focusable="false"`; keyboard focus order preserved; mobile overlay focus trap continues to work |
