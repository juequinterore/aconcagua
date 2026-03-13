# Feature Specification: Red Top Navigation Bar

## 1. Design Analysis

**Target Scope:** `apps/aconcagua` — Astro 5 static multilingual website (`src/` directory)

**Affected Layers:**
- CSS Design Tokens: `src/styles/global.css` — update `--bg-nav` variable
- Component Stylesheet: `src/styles/nav.css` — replace hardcoded navy with new CSS variable references

**Problem Statement:**
The top navigation bar currently uses a hardcoded dark navy colour (`rgba(15, 25, 35, 0.96)` / `#0f1923`) in `nav.css`. The client requests the nav be updated to a red that complements the existing brand palette (gold accent `#c88a3e`, deep navy `#0f1923`, warm beige `#f7f5f2`). The hardcoded colours in `nav.css` are not using the existing `--bg-nav` CSS variable defined in `global.css`, creating a divergence between the design-token system and the actual rendered output.

**Solution Strategy:**
1. Choose a deep crimson red — `#8B1A2A` — that pairs harmoniously with the gold accent and the overall premium mountain aesthetic.
2. Introduce a new dedicated CSS variable `--nav-red` in `global.css` (brand-constant, not theme-aware) to hold the base hex value.
3. Derive alpha variants inline in `nav.css` using `rgba()` literals referencing the same hue values so there is a single source of truth.
4. Update `--bg-nav` in `global.css` (both dark and light theme blocks and the OS fallback block) to use the new crimson value — the nav is intentionally always dark regardless of page theme, per the comment `/* Navigation styles — nav is always dark regardless of page theme */`.
5. Replace every hardcoded navy colour in `nav.css` (`.nav.scrolled`, `.nav.nav-force-dark`, mobile `@media` rule, `.nav-overlay`) with `var(--bg-nav)` or the appropriate derived value.

**Entry Point / Exposure:**
- **UI Feature** — the `<nav id="main-nav">` element is rendered by `src/components/Nav.astro` which is imported by every page (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) through their layout. No new component is created; the change is purely visual/CSS.
- The nav is always visible at the top of every page. The red background appears in two states:
  1. **Scrolled state (desktop & tablet):** when user scrolls past 40 px, the nav gains a solid red background.
  2. **Mobile (`≤768 px`):** the nav always shows the semi-transparent red backdrop.
  3. **Mobile overlay menu:** full-screen overlay uses solid red.
  4. **`forceDark` prop pages:** pages that pass `forceDark={true}` to `Nav.astro` (e.g. sub-pages) use `.nav-force-dark` which also gets the red.

**User Story:**
> As a **website visitor**, I want the top navigation bar to have a rich crimson-red background so that it **visually stands out** and reinforces the brand's bold mountain identity, while still **harmonising** with the gold accent elements throughout the page.

---

## 2. Architecture & Data

### Architecture

This is a **pure CSS change** — no JavaScript logic, no Astro component structure, no i18n keys, no build configuration changes required.

```
User scrolls past 40px / opens mobile menu
  └─► nav.css :  .nav.scrolled  →  background: var(--bg-nav)
                                 ↑
                         global.css :  --bg-nav: rgba(139, 26, 42, 0.96)
                                                   ↑
                                         New crimson colour token
```

### Colour Selection Rationale

| Colour | Hex | Role |
|--------|-----|------|
| Deep Crimson | `#8B1A2A` | New nav background base |
| Crimson 96% opacity | `rgba(139, 26, 42, 0.96)` | Scrolled nav + force-dark + `--bg-nav` |
| Crimson 90% opacity | `rgba(139, 26, 42, 0.90)` | Mobile semi-transparent nav |
| Crimson solid | `#8B1A2A` | Mobile full-screen overlay |
| Gold accent | `#c88a3e` | **Unchanged** — brand constant |

**Why `#8B1A2A` (deep crimson)?**
- Evokes strength, passion, and high-altitude intensity — consistent with a mountain expedition brand
- Strong warm contrast against the gold CTA button (`#c88a3e`) without clashing
- White text on `#8B1A2A` achieves ~8.5:1 contrast ratio — exceeds WCAG AA (4.5:1) and WCAG AAA (7:1)
- Darker shade of red avoids a "warning" or "error" association; burgundy/crimson reads as "premium"
- Works in both dark and light page themes because the nav is always-dark by architectural design

### Contrast Verification

| Pair | Ratio | WCAG Level |
|------|-------|------------|
| White `#FFFFFF` on `#8B1A2A` | ~8.5:1 | ✅ AAA |
| Gold `#c88a3e` on `#8B1A2A` | ~3.4:1 | ✅ AA (large text / button) |
| Hamburger icon (white) on `#8B1A2A` | ~8.5:1 | ✅ AAA |

### Data Changes
- [ ] DB Schema: **None**
- [ ] API Contracts: **None**
- [ ] State Models: **None**
- [ ] Shared Domain Types: **None**
- [x] CSS Design Tokens: `--bg-nav` updated in `src/styles/global.css`

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**VALIDATION RULES**:
- [x] Feature modifies existing CSS — no new component file required
- [x] Parent component `Nav.astro` does **not** need modification (it already applies the correct CSS classes)
- [x] Each file entry specifies exact path, operation, purpose, and line number

**Files to Change:**

- `src/styles/global.css` (Modify — update `--bg-nav` token at lines ~35, ~67, ~93 — replace dark navy with crimson)
- `src/styles/nav.css` (Modify — replace 3 hardcoded navy colour values with `var(--bg-nav)` at lines ~14, ~124, ~176)

### Execution Steps

**Phase 1: CSS Design Token Update (TDD Required)**

> **Note:** This is a CSS-only project (Astro static site). "Tests" are visual regression checks via `astro build` + `astro preview` rather than automated unit tests.

- [ ] **RED**: Verify current state — run `npm run build && npm run preview`, confirm nav is navy.
- [ ] **GREEN**: Update `--bg-nav` variable in `src/styles/global.css` to crimson values (see Phase 2 below for exact values). This establishes the single source of truth.
- [ ] **REFACTOR**: Ensure `--bg-nav` value is consistent across all three blocks (`:root` dark default, `[data-theme="light"]`, and `@media (prefers-color-scheme: light) :root:not([data-theme])`).

**Phase 2: Nav Stylesheet Update (TDD Required)**

- [ ] **RED**: With only `global.css` updated, `nav.css` still uses hardcoded navy — nav is still navy. This proves the stylesheet divergence.
- [ ] **GREEN**: Replace hardcoded navy with `var(--bg-nav)` (and direct crimson `rgba`/hex values for mobile) in `src/styles/nav.css`:

  **Change 1 — Scrolled / force-dark state** (`nav.css` line ~14):
  ```css
  /* BEFORE */
  .nav.scrolled,
  .nav.nav-force-dark {
    background: rgba(15, 25, 35, 0.96);
    ...
  }

  /* AFTER */
  .nav.scrolled,
  .nav.nav-force-dark {
    background: var(--bg-nav);
    ...
  }
  ```

  **Change 2 — Mobile overlay background** (`nav.css` line ~124):
  ```css
  /* BEFORE */
  .nav-overlay {
    background: #0f1923;
    ...
  }

  /* AFTER */
  .nav-overlay {
    background: #8B1A2A;
    ...
  }
  ```

  **Change 3 — Mobile nav semi-transparent background** (`nav.css` line ~176):
  ```css
  /* BEFORE */
  @media (max-width: 768px) {
    .nav {
      background: rgba(15, 25, 35, 0.85);
      ...
    }
  }

  /* AFTER */
  @media (max-width: 768px) {
    .nav {
      background: rgba(139, 26, 42, 0.90);
      ...
    }
  }
  ```

- [ ] **REFACTOR**: Run `npx astro check` to confirm zero TypeScript / template errors.

**Phase 3: Design Token Source-of-Truth Update in `global.css`**

Exact values to update in `src/styles/global.css`:

  **Dark mode default (`:root`)** — line ~35:
  ```css
  /* BEFORE */
  --bg-nav: rgba(15, 25, 35, 0.96);

  /* AFTER */
  --bg-nav: rgba(139, 26, 42, 0.96);
  ```

  **Light mode (`[data-theme="light"]`)** — line ~67:
  ```css
  /* BEFORE */
  --bg-nav: rgba(247, 245, 242, 0.96);

  /* AFTER */
  --bg-nav: rgba(139, 26, 42, 0.96);
  ```

  **OS fallback (`@media (prefers-color-scheme: light) :root:not([data-theme])`)** — line ~93:
  ```css
  /* BEFORE */
  --bg-nav: rgba(247, 245, 242, 0.96);

  /* AFTER */
  --bg-nav: rgba(139, 26, 42, 0.96);
  ```

> **Rationale for updating light theme token:** The nav is architecturally designed to always be dark (`/* nav is always dark regardless of page theme */`). In the light theme, setting `--bg-nav` to crimson ensures consistency. The nav link text colour (`rgba(255,255,255,0.8)`) is already white and provides excellent contrast on crimson.

**Phase 4: Integration & Exposure (The "Glue" — MANDATORY)**

No new component, no new module, no new route. The integration is already in place:

- [x] **COMPONENT RENDERING**: `Nav.astro` renders `<nav class="nav" id="main-nav">` — the CSS classes `.nav.scrolled` and `.nav.nav-force-dark` already exist and will automatically pick up the new `--bg-nav` value once updated.
  - File: `src/components/Nav.astro` — **no changes required**
  - File: `src/styles/nav.css` — changes listed in Phase 2 above

- [x] **USER DISCOVERY**: The red nav is the nav bar itself. It is visible on every page load as soon as the user scrolls past 40 px (desktop) or immediately on mobile. No button or keyboard shortcut is required to "activate" the feature.

**Phase 5: Quality & Validation**

- [ ] Run build: `npm run build`
- [ ] Run Astro type check: `npx astro check`
- [ ] Run preview: `npm run preview`
- [ ] Visual check in all 3 locales: `/`, `/en/`, `/zh/`
- [ ] Visual check in dark mode and light mode (use ThemeToggle)
- [ ] Visual check on mobile viewport (hamburger + overlay)

---

## 4. Automated Verification

### Verification Commands

```bash
# Navigate to project root
cd /path/to/aconcagua

# Type check (Astro templates + TypeScript)
npx astro check

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Quality Gates
- [ ] `npx astro check` produces **zero errors and zero warnings**
- [ ] `npm run build` completes without errors
- [ ] No hardcoded navy values (`#0f1923`, `rgba(15, 25, 35`) remain in `nav.css`
- [ ] `--bg-nav` token is **identical** across all three blocks in `global.css`
- [ ] White text remains readable on the crimson nav background (verified visually)

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] Dependencies installed: `npm install`
- [ ] `.env` file in place if required

**Steps:**

1. [ ] Run `npm run build && npm run preview`
2. [ ] Open `http://localhost:4321` (or port shown in terminal)
3. [ ] **DISCOVERY TEST — Desktop:**
   - Scroll down past the hero section
   - Confirm nav transitions to **crimson red** background (not navy)
   - Confirm logo, nav links, and gold CTA button are clearly readable
4. [ ] **DISCOVERY TEST — Mobile:**
   - Resize browser to `≤768 px` viewport
   - Confirm the nav bar at the top shows a **crimson** semi-transparent background immediately (no scroll required)
   - Click the hamburger button
   - Confirm the full-screen overlay is **crimson** (not black/navy)
   - Confirm nav link text is white and readable
5. [ ] **THEME TEST:**
   - Toggle to light mode using the ThemeToggle button in the nav
   - Confirm nav remains **crimson** in light mode (not switching to cream/beige)
   - Toggle back to dark mode — nav remains crimson
6. [ ] **LOCALE TEST:**
   - Visit `/en/` — nav is crimson ✅
   - Visit `/zh/` — nav is crimson ✅
7. [ ] **FORCE-DARK TEST** (if any sub-pages pass `forceDark={true}`):
   - Visit those pages and confirm the `.nav-force-dark` class yields crimson background
8. [ ] **ERROR HANDLING TEST:**
   - Disable JavaScript
   - Reload page
   - Confirm nav still shows crimson (CSS-only, no JS dependency)

**Success Criteria:**
- [ ] Nav background is crimson (`#8B1A2A` base) in all states (scrolled, mobile, overlay)
- [ ] All text/icons on the nav remain readable (white, gold CTA)
- [ ] No navy remnants visible in any state or locale
- [ ] No console errors
- [ ] No layout shift visible during scroll transition

---

## 6. Coverage Requirements

- [ ] No automated test suite exists for this Astro project's CSS — visual verification is the acceptance mechanism
- [ ] Build must complete without errors as the minimum quality gate
- [ ] `npx astro check` must report zero issues

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] `src/styles/global.css` — `--bg-nav` token updated to `rgba(139, 26, 42, 0.96)` in all three CSS blocks
- [ ] `src/styles/nav.css` — three colour replacements applied (scrolled/force-dark, mobile overlay, mobile nav bg)
- [ ] `npx astro check` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] Nav renders crimson in all 3 locales in both dark and light modes
- [ ] Nav renders crimson on mobile (semi-transparent) and in the full-screen overlay
- [ ] White text contrast ratio on crimson ≥ 7:1 (AAA — verified above as ~8.5:1)
- [ ] Gold CTA button (`#c88a3e`) remains visually distinct against the crimson nav
- [ ] No regressions: all other page sections remain visually unchanged
- [ ] Feature is immediately visible without any user interaction (no configuration required)
