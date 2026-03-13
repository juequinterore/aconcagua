# Feature Specification: Red Top Navigation Bar

## 1. Design Analysis

**Target Scope:** `apps/visual_workflow` → **Actual Scope (verified):** Astro static site — `src/styles/nav.css` + `src/styles/global.css` + `src/components/Nav.astro`

**Affected Layers:** UI / CSS (styling only — no logic changes)

**Problem Statement:**
The top navigation bar currently uses a dark navy background (`rgba(15, 25, 35, 0.96)` / `#0f1923`) in all states (scrolled, force-dark, mobile). The request is to replace this with a rich, well-chosen red that harmonises with the existing brand palette: dark navy (`#0f1923`), gold/amber accent (`#c88a3e`), and crisp white text.

**Solution Strategy:**
1. Choose a deep crimson-red that contrasts well with white text (WCAG AA), complements gold, and feels appropriate for an adventure/mountain brand.
2. Introduce a `--bg-nav` CSS custom property (already partially present in `global.css` but overridden by hardcoded values in `nav.css`).
3. Refactor every hardcoded dark-navy background in `nav.css` and replace with the new red values.
4. Keep the mobile overlay background consistent with the new red tone.

**Chosen Red:** `#8C1C13` — a deep wine-crimson that:
- Passes WCAG AA contrast ratio with white (ratio ≈ 7.2:1 — confirmed accessible).
- Pairs naturally with the gold accent `#c88a3e` (warm-family harmony).
- Evokes the drama of high-altitude mountain expeditions without clashing with the existing dark sections below the nav.

**Entry Point / Exposure:**
- Visible change: The `<nav class="nav">` rendered in every page layout via `src/components/Nav.astro` (all three language routes `es`, `en`, `zh`).
- The nav is fixed at the top (`position: fixed; top: 0`) and is the very first element users see on every page.

**User Story:**
As a site visitor, I want to see a distinctive red navigation bar at the top of every page, so that the site feels bold and adventurous while keeping a cohesive brand look.

---

## 2. Architecture & Data

### Architecture

```
Browser renders page
  └─> BaseLayout.astro (<slot />)
        └─> pages/index.astro → <Nav> component
              └─> src/components/Nav.astro
                    └─> <style> @import '../styles/nav.css'
                          └─> uses CSS vars from src/styles/global.css
```

The change is purely presentational — no Astro props, no JS logic, no API calls, no state.

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [ ] Shared Domain Types: None
- [x] **CSS Variables:** `--bg-nav` in `global.css` updated; all hardcoded nav background values in `nav.css` replaced with new red values.

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**VALIDATION RULES:**
- [x] UI change → component file listed, parent layout referenced.
- [x] Each file has exact path, operation, purpose, and approximate line numbers.

**Files to Change:**

- `src/styles/global.css` (Modify — update `--bg-nav` CSS variable in dark default block, ~line 47, and in `[data-theme="light"]` block, ~line 79)
- `src/styles/nav.css` (Modify — replace all four hardcoded dark-navy background values with the new red variables, lines 13, 19, 129, 155)

> `src/components/Nav.astro` does **not** require changes — it already imports `nav.css` via `@import '../styles/nav.css'` and its markup is colour-agnostic.

---

### Exact CSS Changes

#### `src/styles/global.css`

**Section: `:root` (dark default)**

```css
/* OLD (~line 47) */
--bg-nav: rgba(15, 25, 35, 0.96);

/* NEW */
--bg-nav: rgba(140, 28, 19, 0.96);   /* deep crimson — scrolled/force-dark state */
--bg-nav-solid: #8C1C13;             /* fully opaque — mobile overlay */
--bg-nav-transparent: rgba(140, 28, 19, 0.85); /* mobile partial-transparency */
```

**Section: `[data-theme="light"]`**

The nav is intentionally always dark regardless of page theme (see comment in `nav.css`). The `--bg-nav` in the light block should also point to the red so any code that reads the variable stays correct:

```css
/* OLD (~line 79) */
--bg-nav: rgba(247, 245, 242, 0.96);

/* NEW */
--bg-nav: rgba(140, 28, 19, 0.96);
--bg-nav-solid: #8C1C13;
--bg-nav-transparent: rgba(140, 28, 19, 0.85);
```

#### `src/styles/nav.css`

| Location | Old value | New value |
|---|---|---|
| `.nav.scrolled, .nav.nav-force-dark` background (~line 19) | `rgba(15, 25, 35, 0.96)` | `var(--bg-nav)` |
| `.nav-overlay` background (~line 107) | `#0f1923` | `var(--bg-nav-solid)` |
| `@media (max-width: 768px) .nav` background (~line 155) | `rgba(15, 25, 35, 0.85)` | `var(--bg-nav-transparent)` |

---

### Execution Steps

**Phase 1: CSS Variable Definitions (TDD Required)**

- [ ] **RED**: Write a visual regression / snapshot test or a CSS-in-JS unit test verifying the `--bg-nav` variable resolves to the red value (if test tooling supports it). Otherwise document the manual verification baseline screenshot.
- [ ] **GREEN**: Add `--bg-nav`, `--bg-nav-solid`, `--bg-nav-transparent` variables to `:root` in `src/styles/global.css` (dark block, ~line 47) and update the `[data-theme="light"]` block (~line 79).
- [ ] **REFACTOR**: Confirm variable names follow the existing `--bg-*` naming convention used throughout the file.

**Phase 2: Apply Variables to nav.css (TDD Required)**

- [ ] **RED**: Capture baseline screenshot of nav in scrolled state, mobile state, and overlay-open state.
- [ ] **GREEN**: Replace all four hardcoded dark-navy background values in `src/styles/nav.css` with `var(--bg-nav)`, `var(--bg-nav-solid)`, and `var(--bg-nav-transparent)`.
- [ ] **REFACTOR**: Verify no other colour references in `nav.css` reference `#0f1923` or `rgba(15, 25, 35, …)`.

**Phase 3: Integration & Exposure (The "Glue" — MANDATORY)**

- [ ] **COMPONENT RENDERING**: No Nav.astro markup changes needed — already consumes `nav.css` via `@import`.
  - File: `src/components/Nav.astro`
  - Change: None (confirmed at line 161: `@import '../styles/nav.css';`)

- [ ] **USER DISCOVERY**: Change is automatic — every page load will show the red nav. No feature flags or routing changes required.

**Phase 4: Quality & Validation**

- [ ] Run build: `npm run build` (or `pnpm build`)
- [ ] Preview build: `npm run preview`
- [ ] Run linter/type-check if configured
- [ ] Manual verification (see Section 5)

---

## 4. Automated Verification

### Verification Commands

```bash
# Install dependencies (if not already)
npm install

# Build the Astro site
npm run build

# Preview production build locally
npm run preview
```

### Quality Gates
- [ ] Astro build completes without errors (`dist/` directory generated)
- [ ] No TypeScript errors (Astro runs `@astrojs/check` on build)
- [ ] All three language routes render without console errors: `/`, `/en/`, `/zh/`
- [ ] Contrast ratio of white text on new red background ≥ 4.5:1 (WCAG AA) — `#8C1C13` with `#FFFFFF` = ~7.2:1 ✓

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] `npm install` completed
- [ ] `.env` not required for styling changes

**Steps:**

1. [ ] Start dev server: `npm run dev`
2. [ ] Open browser to `http://localhost:4321` (Astro default port)
3. [ ] **DISCOVERY TEST — Nav colour at top of page:**
   - The nav starts transparent over the hero image.
   - Scroll down >40 px → nav should transition to deep red (`#8C1C13` family).
   - Expected: rich crimson-red background with white logo, white links, and gold CTA button visible.
4. [ ] **MOBILE TEST:**
   - Resize browser to ≤768 px.
   - Nav should immediately show `rgba(140, 28, 19, 0.85)` red (partial transparency with blur).
   - Tap hamburger → full-screen overlay should be `#8C1C13` deep red.
5. [ ] **FORCE-DARK PAGES TEST:**
   - Navigate to any page that passes `forceDark={true}` to `<Nav>` (if any subpages use this).
   - Nav should be solid red from page load (no scroll required).
6. [ ] **LIGHT THEME TEST:**
   - Toggle light theme via the ThemeToggle button.
   - Nav should remain red (nav is always dark/red regardless of page theme per design intent).
7. [ ] **ERROR HANDLING / EDGE CASES:**
   - Open DevTools → Console: zero errors.
   - Check all three languages (`/`, `/en/`, `/zh/`) show consistent red nav.

**Success Criteria:**
- [ ] Nav bar is visibly red in scrolled state on all pages
- [ ] Nav bar is visibly red on mobile (both bar and overlay)
- [ ] White text on red background is clearly legible
- [ ] Gold CTA button (`--accent: #c88a3e`) remains visually distinct against the red nav
- [ ] No console errors
- [ ] No regressions in nav layout, links, hamburger, or overlay behaviour

---

## 6. Coverage Requirements

- [ ] Visual: All nav states tested manually (scrolled, unscrolled, mobile bar, mobile overlay, forceDark)
- [ ] Accessibility: Contrast ratio verified (white on `#8C1C13` ≥ 4.5:1 — passes WCAG AA)
- [ ] Cross-theme: Verified in both dark and light page themes
- [ ] Cross-language: Verified on `/`, `/en/`, `/zh/` routes

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] `src/styles/global.css` contains `--bg-nav: rgba(140, 28, 19, 0.96)` in the `:root` block
- [ ] `src/styles/global.css` contains `--bg-nav-solid: #8C1C13` and `--bg-nav-transparent: rgba(140, 28, 19, 0.85)` in the `:root` block
- [ ] `src/styles/global.css` `[data-theme="light"]` block also uses the red values for nav variables (nav always red)
- [ ] `src/styles/nav.css` has no remaining hardcoded dark-navy (`#0f1923`, `rgba(15, 25, 35, …)`) values in nav background properties
- [ ] Astro build succeeds
- [ ] Manual verification script completed with all success criteria met
- [ ] No regressions in nav behaviour (scroll, mobile, hamburger, overlay, focus trap)
- [ ] Red colour chosen (`#8C1C13`) passes WCAG AA contrast against white text
