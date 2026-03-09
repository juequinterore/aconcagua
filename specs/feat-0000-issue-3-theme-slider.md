# Feature Specification: Theme Slider (Dark ↔ Light Interpolation)

## 1. Design Analysis

**Target Scope:** `aconcagua` – Astro 5 static marketing site (`src/` at repo root)

**Affected Layers:**
- UI Component: `src/components/ThemeSlider.astro` (new)
- Styling: `src/styles/global.css` (modify – add `--theme-mix` variable + `color-mix()` interpolation)
- Layout: `src/layouts/BaseLayout.astro` (modify – update FOWT prevention script)
- Navigation: `src/components/Nav.astro` (modify – swap `<ThemeToggle />` for `<ThemeSlider />`)

**Problem Statement:**
The existing theme system offers only a binary dark/light toggle (button). The user wants a slider that continuously interpolates all site-wide CSS color tokens between the dark extreme (left) and the light extreme (right), providing a smooth visual gradient between the two modes. The preference must persist across page loads.

**Solution Strategy:**
1. Introduce a CSS custom property `--theme-mix` (range: `0` = full dark → `1` = full light) set on `<html>`.
2. Rewrite all theme-sensitive CSS color tokens in `global.css` to use `color-mix(in oklch, <dark-color> calc((1 - var(--theme-mix)) * 100%), <light-color>)` so they interpolate automatically whenever `--theme-mix` changes.
3. Replace the `ThemeToggle` button with a new `ThemeSlider` component (HTML `<input type="range">`). The slider's `input` event sets `--theme-mix` on `<html>` and persists the value in `localStorage`.
4. Keep the `data-theme` attribute updated (dark ↔ light at midpoint) for components that reference it via `:global([data-theme="light"])`.
5. Update the FOWT (Flash-Of-Wrong-Theme) inline script in `BaseLayout.astro` to restore `--theme-mix` from `localStorage` before CSS renders.

**Entry Point / Exposure:**
- **Desktop Nav:** `Nav.astro` → `.nav-right` bar — the `<ThemeToggle />` is replaced by `<ThemeSlider />`. The slider appears inline in the top-right navigation bar next to the language switcher.
- **Mobile Overlay:** `Nav.astro` → `.nav-overlay` — the second `<ThemeToggle />` is also replaced by `<ThemeSlider />`.

**User Story:**
As a visitor to the Aconcagua website, I want to drag a slider in the navigation bar to smoothly blend the site's color scheme from full dark mode to full light mode, so that I can view the site in exactly the tone I find most comfortable — not just two fixed states.

---

## 2. Architecture & Data

### Architecture

```
User drags slider
      │
      ▼
ThemeSlider.astro (input[type=range], value 0–100)
      │  oninput
      ▼
JS: compute mix = value / 100
    document.documentElement.style.setProperty('--theme-mix', mix)
    data-theme = mix < 0.5 ? 'dark' : 'light'
    localStorage.setItem('theme-mix', value)
      │
      ▼
CSS: color-mix(in oklch, darkColor calc((1-var(--theme-mix))*100%), lightColor)
     resolves automatically for all theme-sensitive tokens
```

**On page load (FOWT prevention — inline in `<head>`):**
```
Read localStorage('theme-mix')  →  default 0 (dark)
Set html --theme-mix = storedValue / 100
Set html data-theme = storedValue < 50 ? 'dark' : 'light'
```

### Data Changes

- [ ] **DB Schema:** None
- [ ] **API Contracts:** None
- [ ] **State Models:** `localStorage` key changes: was `theme` (string `"dark"|"light"`) → add `theme-mix` (number string `"0"`–`"100"`). Old `theme` key can co-exist for graceful fallback.
- [ ] **Shared Domain Types:** None — this is a pure front-end/CSS concern.

### CSS Color Interpolation Detail

All theme-variant CSS tokens in `:root` (the dark defaults) and `[data-theme="light"]` will be collapsed into a single `:root` block using `color-mix()`. The `[data-theme="light"]` block is kept **only** for components that must flip at the 50% midpoint (e.g. icon visibility in ThemeSlider itself).

**Example transformation:**

_Before (two blocks):_
```css
:root { --bg-base: #0f1923; }
[data-theme="light"] { --bg-base: #f7f5f2; }
```

_After (single `color-mix` expression):_
```css
:root {
  --theme-mix: 0; /* 0=dark, 1=light */
  --bg-base: color-mix(in oklch, #0f1923 calc((1 - var(--theme-mix)) * 100%), #f7f5f2);
}
```

Shadow variables (which contain `rgba()`) use the same `color-mix()` approach since `color-mix()` handles alpha correctly. Variables that are identical in both themes (brand colors, layout sizes, typography) remain unchanged.

**Browser support note:** `color-mix()` with `calc()` percentages is supported in Chrome 111+, Firefox 113+, Safari 16.4+ (2023+). This matches the site's target audience for 2026.

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/components/ThemeSlider.astro` **(Create)** – New range-input component that replaces ThemeToggle. Contains the slider HTML, sun/moon icon labels at each end, scoped styles, and the module script that drives `--theme-mix` interpolation.
- `src/styles/global.css` **(Modify)** – Lines 31–85 (current dark-default block + `[data-theme="light"]` block): collapse into a single `color-mix()`-based token set under `:root`. Add `--theme-mix: 0;` declaration. Preserve the `[data-theme="light"]` selector only for non-color binary switches (icon visibility handled in ThemeSlider). Add slider-specific CSS for the range input thumb/track. Lines ~59: update `--theme-transition` to also include the new variable. Lines ~336–344: update the transition list if needed.
- `src/components/Nav.astro` **(Modify)** – Lines 3, 37, 70: replace two `import ThemeToggle` and both `<ThemeToggle />` usages with `import ThemeSlider` and `<ThemeSlider />`.
- `src/layouts/BaseLayout.astro` **(Modify)** – Lines 160–167 (inline FOWT script): extend to also restore `--theme-mix` from `localStorage('theme-mix')` and set it as an inline style on `<html>` before CSS renders. Keep backward compat: if `theme-mix` absent but old `theme` key exists, convert it (`dark` → `0`, `light` → `100`).

### Execution Steps

---

**Phase 1: CSS Token Refactor – Add `--theme-mix` Interpolation (TDD Required)**

> All visual changes live in CSS; the "test" here is a visual regression check using the dev server.

- [ ] **RED**: In `global.css`, add `--theme-mix: 0;` to `:root`. Manually set it to `0.5` in DevTools and observe that nothing interpolates yet — confirming the variable exists but is not yet wired.
- [ ] **GREEN**: For each color token that differs between dark and light (listed below), rewrite as a `color-mix()` expression in the `:root` block and remove the override from `[data-theme="light"]`:

  | Token | Dark value | Light value |
  |---|---|---|
  | `--bg-base` | `#0f1923` | `#f7f5f2` |
  | `--bg-section-alt` | `#111e2b` | `#eae6e1` |
  | `--bg-card` | `rgba(255,255,255,0.05)` | `#ffffff` |
  | `--bg-nav` | `rgba(15,25,35,0.96)` | `rgba(247,245,242,0.96)` |
  | `--bg-footer` | `#0f1923` | `#1a1a1a` |
  | `--text-primary` | `#ffffff` | `#1a1a1a` |
  | `--text-secondary` | `rgba(255,255,255,0.70)` | `#5a6a72` |
  | `--text-muted` | `rgba(255,255,255,0.45)` | `#8a9aa3` |
  | `--border-subtle` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.08)` |
  | `--border-card` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |
  | `--shadow-card` | `0 4px 20px rgba(0,0,0,0.25)` | `0 4px 20px rgba(0,0,0,0.06)` |
  | `--shadow-hover` | `0 12px 40px rgba(0,0,0,0.40)` | `0 12px 40px rgba(0,0,0,0.10)` |
  | `--shadow-gold` | `0 8px 24px rgba(200,138,62,0.35)` | `0 8px 24px rgba(200,138,62,0.30)` |
  | `--shadow-photo` | `0 20px 60px rgba(0,0,0,0.45)` | `0 20px 60px rgba(0,0,0,0.14)` |
  | Section bg aliases | dark variants | light variants |

  **Note on shadows:** `color-mix()` does not apply to `box-shadow` shorthand strings directly. For shadow variables, use a single `rgba()` alpha that is interpolated via `color-mix()` on a transparent/opaque pair, or keep the `[data-theme="light"]` override for shadows only as an acceptable simplification. Document this explicitly in code comments.

- [ ] **REFACTOR**: Verify `--theme-mix: 0.5` shows a visually mid-point blend in browser DevTools. Remove the `[data-theme="light"]` overrides for all successfully migrated color tokens.

---

**Phase 2: FOWT Prevention Update (TDD Required)**

- [ ] **RED**: Clear `localStorage`, hard-reload page; confirm no flash (baseline).
- [ ] **GREEN**: Update the inline `<script is:inline>` in `BaseLayout.astro` (lines 160–167):

  ```js
  (function() {
    var storedMix = localStorage.getItem('theme-mix');
    var mix;
    if (storedMix !== null) {
      mix = parseFloat(storedMix) / 100;
    } else {
      // Fallback: honour old binary 'theme' key
      var oldTheme = localStorage.getItem('theme');
      if (oldTheme === 'light') { mix = 1; }
      else if (oldTheme === 'dark') { mix = 0; }
      else {
        // OS preference
        mix = window.matchMedia('(prefers-color-scheme: dark)').matches ? 0 : 1;
      }
    }
    document.documentElement.style.setProperty('--theme-mix', mix);
    document.documentElement.setAttribute('data-theme', mix < 0.5 ? 'dark' : 'light');
  })();
  ```

- [ ] **REFACTOR**: Test with `localStorage.setItem('theme-mix', '75')`, reload, confirm colours are 75% toward light without flash.

---

**Phase 3: ThemeSlider Component (TDD Required)**

- [ ] **RED**: Create `src/components/ThemeSlider.astro` with a placeholder `<div>Slider TODO</div>`. Import it in `Nav.astro` alongside the existing `ThemeToggle` import. Verify build succeeds and placeholder renders.
- [ ] **GREEN**: Implement full `ThemeSlider.astro`:

  **HTML Structure:**
  ```html
  <div class="theme-slider-wrap" role="group" aria-label="Theme brightness">
    <!-- Sun icon (light extreme, right) and Moon icon (dark extreme, left) as decorative labels -->
    <svg class="slider-icon icon-moon" ...><!-- moon SVG --></svg>
    <input
      type="range"
      class="theme-slider"
      min="0"
      max="100"
      value="0"
      step="1"
      aria-label="Theme: 0 is dark, 100 is light"
    />
    <svg class="slider-icon icon-sun" ...><!-- sun SVG --></svg>
  </div>
  ```

  **Script (module, deduplicated by Astro):**
  ```ts
  const sliders = document.querySelectorAll<HTMLInputElement>('.theme-slider');
  const html = document.documentElement;

  function applyMix(value: number) {
    const mix = value / 100;
    html.style.setProperty('--theme-mix', String(mix));
    html.setAttribute('data-theme', mix < 0.5 ? 'dark' : 'light');
    sliders.forEach(s => { s.value = String(value); });
  }

  // Restore saved position
  const saved = localStorage.getItem('theme-mix');
  const initialValue = saved !== null
    ? parseFloat(saved)
    : (html.getAttribute('data-theme') === 'light' ? 100 : 0);
  applyMix(initialValue);

  sliders.forEach(slider => {
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      localStorage.setItem('theme-mix', String(v));
      applyMix(v);
      slider.dispatchEvent(new CustomEvent('theme-changed', { bubbles: true }));
    });
  });

  // OS preference changes (only if no saved preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme-mix') === null) {
      applyMix(e.matches ? 0 : 100);
    }
  });
  ```

  **Scoped styles** (see Section 3 – Styling notes below).

- [ ] **REFACTOR**: Ensure slider thumb is visible/styled on all three desktop browsers. Confirm aria-label is meaningful for screen readers.

**Slider Styling Notes:**
- Slider track background should use a CSS gradient from dark (`#0f1923`) on the left to light (`#f7f5f2`) on the right, giving the user a visual preview of the range.
- Thumb styled to match the accent gold (`#c88a3e`) for brand consistency.
- Width: `~80px` on desktop, `~100px` on mobile overlay.
- Cross-browser CSS for `input[type=range]`: needs `-webkit-appearance: none` + separate thumb pseudo-elements for WebKit and Firefox.
- The wrapper `.theme-slider-wrap` uses `display: flex; align-items: center; gap: 6px;` to place moon icon — slider — sun icon inline.

---

**Phase 4: Integration & Exposure (The "Glue" — MANDATORY)**

- [ ] **COMPONENT RENDERING — Nav.astro (Desktop):**
  - File: `src/components/Nav.astro`
  - Change: Line 3 — change `import ThemeToggle from './ThemeToggle.astro';` to `import ThemeSlider from './ThemeSlider.astro';`
  - Change: Line 37 — replace `<ThemeToggle />` with `<ThemeSlider />`
  - Rationale: Desktop nav `.nav-right` is where the current toggle lives; the slider takes its place.

- [ ] **COMPONENT RENDERING — Nav.astro (Mobile Overlay):**
  - File: `src/components/Nav.astro`
  - Change: Line 70 — replace `<ThemeToggle />` with `<ThemeSlider />`
  - Note: Astro deduplicates module scripts, so the single `<script>` block in ThemeSlider runs once even though the component appears twice. The `document.querySelectorAll('.theme-slider')` pattern (already proven in ThemeToggle) ensures both sliders stay in sync.

- [ ] **STORE / STATE — localStorage:**
  - Old key: `theme` (`"dark"` | `"light"`)
  - New key: `theme-mix` (`"0"` – `"100"`)
  - Backward-compat fallback: handled in FOWT script (Phase 2) and ThemeSlider init script.

- [ ] **FOWT SCRIPT — BaseLayout.astro:**
  - File: `src/layouts/BaseLayout.astro`
  - Change: Lines 160–167 — replace inline FOWT script with updated version (see Phase 2).
  - Purpose: Sets `--theme-mix` as inline style on `<html>` before CSS renders, preventing flash.

- [ ] **USER DISCOVERY:**
  - The slider is rendered in the top-right navigation bar on desktop (visible at all times) and in the full-screen mobile overlay menu.
  - Visual affordance: moon icon on left, track with dark-to-light gradient, sun icon on right — self-explanatory.
  - No additional button/link is needed; the slider replaces the existing toggle control.

- [ ] **OLD COMPONENT:**
  - `src/components/ThemeToggle.astro` — **No longer imported or used** after Nav.astro is updated. The file may be kept for reference or deleted; it is not imported by any other component.

---

**Phase 5: Quality & Validation**

- [ ] Run build: `npm run build` (or `astro build`)
- [ ] Run preview: `npm run preview`
- [ ] Run linter (if configured): `npm run lint` — **Note:** No lint script is defined in `package.json`; skip if absent.
- [ ] Manual verification (see Section 5)

---

## 4. Automated Verification

### Verification Commands

```bash
# Install dependencies (if not already done)
npm install

# Development server
npm run dev

# Production build check
npm run build

# Preview production build
npm run preview
```

> **Note:** The `aconcagua` project does not include a test suite or linter as of the current `package.json`. Verification is therefore manual + build-success based.

### Quality Gates

- [ ] `astro build` completes with zero errors
- [ ] No TypeScript errors in `.astro` component scripts
- [ ] Browser console shows zero errors on page load
- [ ] Slider renders correctly on Chrome, Firefox, and Safari (cross-browser CSS)
- [ ] `color-mix()` expressions resolve correctly — verified visually at `--theme-mix: 0`, `0.5`, and `1.0`
- [ ] FOWT: hard-reload at `theme-mix=75` does not flash incorrect colours
- [ ] Mobile overlay slider is touch-friendly (minimum 44×44px tap target for thumb)

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] Dependencies installed: `npm install`
- [ ] Development server running: `npm run dev` → `http://localhost:4321`

### Steps

**A. Basic Functionality**

1. [ ] Open `http://localhost:4321` in Chrome.
2. [ ] **DISCOVERY TEST:** Locate the slider in the top navigation bar — it should be visible between the language switcher and the CTA button, with a moon icon on its left and a sun icon on its right.
3. [ ] Drag the slider from left (dark) to right (light):
   - Background transitions smoothly from `#0f1923` to `#f7f5f2`.
   - Text transitions from white to near-black.
   - Cards, borders, and shadows all transition.
4. [ ] Drag to exact midpoint (value 50) — verify the site looks like a distinct "sepia/dusk" intermediate state.
5. [ ] Drag all the way to the right (full light) — verify the site matches the existing light mode design.
6. [ ] Drag all the way to the left (full dark) — verify the site matches the existing dark mode design.

**B. Persistence**

7. [ ] Set slider to ~70 (mostly light). Reload the page — slider should restore to 70 and colours should match without a flash.
8. [ ] Open a second tab — it should open at position 70.
9. [ ] Clear `localStorage` (`localStorage.clear()` in DevTools console), reload — site should default to dark (position 0) or OS preference.

**C. Mobile**

10. [ ] Open browser DevTools → toggle mobile emulation (e.g., iPhone 14).
11. [ ] Tap the hamburger menu.
12. [ ] The mobile overlay should show the slider — drag it and verify colours update site-wide.
13. [ ] Slider thumb should be easily tappable (≥ 44px height).

**D. Accessibility**

14. [ ] Tab to the slider using keyboard; arrow keys should move it in steps.
15. [ ] Screen reader (VoiceOver/NVDA): slider should announce "Theme: 0 is dark, 100 is light" and current value.
16. [ ] With OS `prefers-reduced-motion: reduce` active, the `color-mix()` transitions are immediate (no animation); verify no layout shift.

**E. Cross-browser**

17. [ ] Repeat steps 1–6 in Firefox and Safari — confirm slider thumb is styled and `color-mix()` resolves correctly.

**F. Old `theme` localStorage Key (Backward Compat)**

18. [ ] In DevTools console: `localStorage.clear(); localStorage.setItem('theme', 'light'); location.reload();`
19. [ ] Verify: slider initializes at position 100 (full light) with no flash.

**Success Criteria:**
- [ ] Feature accessible via visible slider in nav (desktop) and mobile overlay
- [ ] Smooth colour interpolation at all slider positions
- [ ] Preference persists across reloads without FOWT
- [ ] No console errors
- [ ] Accessible via keyboard and screen reader

---

## 6. Coverage Requirements

> This project has no automated test suite. Coverage is verified manually.

- [ ] All slider positions (0, 25, 50, 75, 100) visually verified
- [ ] Both slider instances (desktop + mobile overlay) stay in sync
- [ ] Edge cases: rapid dragging does not cause jank (rAF throttling optional if needed)
- [ ] OS dark/light preference respected when no `theme-mix` stored
- [ ] Old `theme` localStorage key gracefully upgraded

---

## 7. Acceptance Criteria

**Definition of Done:**

- [ ] `src/components/ThemeSlider.astro` created with range input, moon/sun icons, module script, and scoped styles
- [ ] `src/styles/global.css` updated: all theme-variant color tokens use `color-mix()` with `--theme-mix`
- [ ] `src/layouts/BaseLayout.astro` FOWT script updated to set `--theme-mix` before CSS renders
- [ ] `src/components/Nav.astro` updated: both `<ThemeToggle />` replaced with `<ThemeSlider />`
- [ ] `astro build` completes with zero errors
- [ ] Manual verification script completed and all steps pass
- [ ] Slider visible and discoverable in the navigation bar without any documentation
- [ ] Smooth interpolation between dark and light at all intermediate positions
- [ ] No FOWT on reload
- [ ] Backward compatible with old `theme` localStorage key
- [ ] Keyboard and basic screen-reader accessible
- [ ] No regressions in existing Nav, LangSwitcher, or component-level `[data-theme="light"]` styles
