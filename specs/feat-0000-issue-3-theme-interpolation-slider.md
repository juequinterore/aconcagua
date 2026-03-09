# Feature Specification: Theme Interpolation Slider

## 1. Design Analysis

**Target Scope:** `aconcagua` — Astro.js static site (`src/components/`, `src/styles/`, `src/layouts/`)

**Affected Layers:**
- UI Component: `ThemeSlider.astro` (new) replaces `ThemeToggle.astro`
- CSS: `src/styles/global.css` (minor additions for slider track)
- Layout: `src/layouts/BaseLayout.astro` (FOWT inline script update)
- Navigation: `src/components/Nav.astro` (swap component reference)

**Problem Statement:**
The current theme system provides a binary dark/light toggle button (`ThemeToggle.astro`). The user wants a slider control that places dark mode at one extreme (left) and light mode at the other (right), with the theme **continuously interpolating** between the two endpoints based on the slider's position. At intermediate positions the page should blend the color tokens proportionally.

**Solution Strategy:**
Replace the `<ThemeToggle>` button with a `<ThemeSlider>` component containing an `<input type="range">` (0–100). A JavaScript interpolation engine lerps each CSS custom property value between its dark and light endpoints based on the slider position, then writes the computed values as inline CSS custom properties directly on `document.documentElement`. At the extreme positions (0 / 100) the system falls back to the existing `[data-theme]` attribute mechanism so the no-JS CSS fallback and existing `:root` / `[data-theme="light"]` blocks remain intact.

**Entry Point / Exposure:**
- Navigation bar — same position previously occupied by `ThemeToggle`: `[Logo] · [Nav Links] · [LangSwitcher] [ThemeSlider] [CTA Button]`
- Mobile overlay — inside `#nav-overlay`, above the CTA button (same position as before)
- User interacts by dragging the slider thumb or clicking the track

**User Story:**
As a site visitor, I want to drag a slider between a sun (☀) and moon (☾) icon to gradually blend the page between full light and full dark mode, so that I can choose exactly how bright or dark the interface feels while reading about the expedition.

---

## 2. Architecture & Data

### Architecture

```
User drags slider → input event → applyTheme(position)
                                        │
                        ┌───────────────┴───────────────┐
                        │  position === 0               │  1 ≤ position ≤ 99
                        │  → data-theme="dark"          │  → remove data-theme attr
                        │  → clear inline styles        │  → lerp() all color tokens
                        │                               │  → write inline CSS props
                        │  position === 100             │    on document.documentElement
                        │  → data-theme="light"         │
                        │  → clear inline styles        │
                        └───────────────────────────────┘
                                        │
                    localStorage.setItem('theme-position', position)
```

**Color Interpolation Engine (JavaScript lerp):**

Each CSS custom property token is defined as a pair of RGBA channel arrays:
```
dark value = [R, G, B, A?]
light value = [R, G, B, A?]
```

For each token at slider position `p` (0–100):
```
t = p / 100
channel = Math.round(dark + (light - dark) * t)
alpha   = +(darkAlpha + (lightAlpha - darkAlpha) * t).toFixed(3)
```

Shadow properties (multi-value strings) are handled by interpolating the embedded rgba opacity values via the same lerp function.

**Token interpolation table:**

| Token | Dark (p=0) | Light (p=100) |
|---|---|---|
| `--bg-base` | `#0f1923` | `#f7f5f2` |
| `--bg-section-alt` | `#111e2b` | `#eae6e1` |
| `--bg-card` | `rgba(255,255,255,0.05)` | `rgba(255,255,255,1)` |
| `--bg-nav` | `rgba(15,25,35,0.96)` | `rgba(247,245,242,0.96)` |
| `--bg-footer` | `#0f1923` | `#1a1a1a` |
| `--text-primary` | `#ffffff` | `#1a1a1a` |
| `--text-secondary` | `rgba(255,255,255,0.70)` | `rgba(90,106,114,1)` |
| `--text-muted` | `rgba(255,255,255,0.45)` | `rgba(138,154,163,1)` |
| `--border-subtle` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.08)` |
| `--border-card` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |
| `--shadow-card` opacity | 0.25 | 0.06 |
| `--shadow-hover` opacity | 0.40 | 0.10 |
| `--shadow-photo` opacity | 0.45 | 0.14 |

> `--accent`, `--accent-hover`, `--shadow-gold` are intentionally excluded — they remain unchanged in all positions.

### Data Changes

- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: `localStorage` key changes from `theme` ('dark'/'light') to `theme-position` (integer 0–100); backward-compat migration reads old `theme` key and converts to `0` or `100`.
- [ ] Shared Domain Types: None — pure front-end feature

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/components/ThemeSlider.astro` **(Create)** — New slider component with sun/moon icons, range input, JavaScript interpolation engine, and scoped CSS styles
- `src/components/ThemeToggle.astro` **(Modify — deprecate)** — Remove existing button content and replace with a simple re-export shim pointing to `ThemeSlider`, or leave file empty with a comment (backwards compatible since Nav imports it)
- `src/components/Nav.astro` **(Modify — line ~3, ~37, ~70)** — Replace `import ThemeToggle` / `<ThemeToggle />` with `import ThemeSlider` / `<ThemeSlider />`
- `src/layouts/BaseLayout.astro` **(Modify — lines ~161–167)** — Update the FOWT inline `<script is:inline>` to read `theme-position`, run the same lerp engine, and apply inline CSS custom properties before paint; add backward-compat migration from legacy `theme` key
- `src/styles/global.css` **(Modify — end of file)** — Add slider track/thumb scoped CSS-variable hooks (`--slider-track-bg`, `--slider-thumb-bg`) for the slider appearance and a `[data-theme="mixed"]` rule as a no-op placeholder comment

---

### Execution Steps

#### Phase 1: Color Token Definitions & Interpolation Engine (Foundation)

- [ ] **Design:** Define the complete token data structure (dark/light RGBA pairs) for all interpolatable CSS custom properties listed in Section 2.
- [ ] **Plan test:** Manual snapshot test — apply `applyTheme(50)` in browser console and verify each CSS custom property on `<html>` is the midpoint value. Document expected midpoint values for at least 3 tokens (`--bg-base`, `--text-primary`, `--border-subtle`).

Expected midpoints at p=50:
- `--bg-base`: `rgb(131, 135, 138)` (midpoint of [15,25,35] and [247,245,242])
- `--text-primary`: `rgb(140, 140, 140)` (midpoint of [255,255,255] and [26,26,26])
- `--border-subtle`: `rgba(127, 127, 127, 0.09)` (midpoint of rgba endpoints)

#### Phase 2: ThemeSlider Component (TDD Required)

- [ ] **RED:** Describe the expected DOM structure and behavior contract before writing code:
  - The component MUST render `<input type="range" min="0" max="100" step="1">`
  - Sun icon (`aria-hidden`) must appear at the right end (high value = light)
  - Moon icon (`aria-hidden`) must appear at the left end (low value = dark)
  - Component MUST have accessible label: `<label>` wrapping or `aria-label` + `aria-valuetext`
  - On mount: reads `localStorage('theme-position')`, falls back to legacy `localStorage('theme')`, then falls back to `prefers-color-scheme`
  - On input: calls `applyTheme(value)` + writes to `localStorage`

- [ ] **GREEN:** Implement `src/components/ThemeSlider.astro`:

  **HTML Structure:**
  ```html
  <div class="theme-slider-wrap" role="group" aria-label="Theme brightness">
    <!-- Moon icon: dark end (left) -->
    <svg class="slider-icon icon-moon" ...>...</svg>

    <input
      type="range"
      id="theme-slider"
      class="theme-slider"
      min="0" max="100" step="1"
      value="0"
      aria-label="Theme brightness: 0 is darkest, 100 is lightest"
    />

    <!-- Sun icon: light end (right) -->
    <svg class="slider-icon icon-sun" ...>...</svg>
  </div>
  ```

  **JavaScript (Astro module script — deduplicated):**
  ```javascript
  // Token map: [darkR, darkG, darkB, darkA?, lightR, lightG, lightB, lightA?]
  const TOKENS = {
    '--bg-base':          { dark:[15,25,35],        light:[247,245,242] },
    '--bg-section-alt':   { dark:[17,30,43],        light:[234,230,225] },
    '--bg-card':          { dark:[255,255,255,0.05], light:[255,255,255,1] },
    '--bg-nav':           { dark:[15,25,35,0.96],   light:[247,245,242,0.96] },
    '--bg-footer':        { dark:[15,25,35],        light:[26,26,26] },
    '--text-primary':     { dark:[255,255,255],     light:[26,26,26] },
    '--text-secondary':   { dark:[255,255,255,0.70],light:[90,106,114,1] },
    '--text-muted':       { dark:[255,255,255,0.45],light:[138,154,163,1] },
    '--border-subtle':    { dark:[255,255,255,0.10],light:[0,0,0,0.08] },
    '--border-card':      { dark:[255,255,255,0.08],light:[0,0,0,0.06] },
  };
  // Shadow opacity pairs: [darkOpacity, lightOpacity]
  const SHADOW_TOKENS = {
    '--shadow-card':  { dark:'0 4px 20px rgba(0,0,0,{a})',  light:'0 4px 20px rgba(0,0,0,{a})',  opacities:[0.25,0.06] },
    '--shadow-hover': { dark:'0 12px 40px rgba(0,0,0,{a})', light:'0 12px 40px rgba(0,0,0,{a})', opacities:[0.40,0.10] },
    '--shadow-photo': { dark:'0 20px 60px rgba(0,0,0,{a})', light:'0 20px 60px rgba(0,0,0,{a})', opacities:[0.45,0.14] },
  };

  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyTheme(position) {
    const t = position / 100;
    const root = document.documentElement;

    if (position === 0) {
      // Full dark: restore CSS cascade, clear all inline overrides
      root.removeAttribute('data-theme');
      for (const token of Object.keys(TOKENS)) root.style.removeProperty(token);
      for (const token of Object.keys(SHADOW_TOKENS)) root.style.removeProperty(token);
      return;
    }
    if (position === 100) {
      // Full light: use existing [data-theme="light"] CSS block, clear inline overrides
      root.setAttribute('data-theme', 'light');
      for (const token of Object.keys(TOKENS)) root.style.removeProperty(token);
      for (const token of Object.keys(SHADOW_TOKENS)) root.style.removeProperty(token);
      return;
    }

    // Intermediate: clear data-theme, apply inline interpolated values
    root.removeAttribute('data-theme');
    for (const [token, {dark, light}] of Object.entries(TOKENS)) {
      const r = Math.round(lerp(dark[0], light[0], t));
      const g = Math.round(lerp(dark[1], light[1], t));
      const b = Math.round(lerp(dark[2], light[2], t));
      if (dark.length === 4 || light.length === 4) {
        const dA = dark[3]  ?? 1;
        const lA = light[3] ?? 1;
        const a = +lerp(dA, lA, t).toFixed(3);
        root.style.setProperty(token, `rgba(${r},${g},${b},${a})`);
      } else {
        root.style.setProperty(token, `rgb(${r},${g},${b})`);
      }
    }
    for (const [token, cfg] of Object.entries(SHADOW_TOKENS)) {
      const a = +lerp(cfg.opacities[0], cfg.opacities[1], t).toFixed(3);
      root.style.setProperty(token, cfg.dark.replace('{a}', a));
    }
  }
  ```

  **Initialization:**
  ```javascript
  const sliders = document.querySelectorAll('.theme-slider');

  function getInitialPosition() {
    const stored = localStorage.getItem('theme-position');
    if (stored !== null) return parseInt(stored, 10);
    // Legacy migration
    const legacy = localStorage.getItem('theme');
    if (legacy === 'light') return 100;
    if (legacy === 'dark')  return 0;
    // OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 0 : 100;
  }

  const initial = getInitialPosition();
  sliders.forEach(s => { (s as HTMLInputElement).value = String(initial); });
  applyTheme(initial);

  sliders.forEach(slider => {
    slider.addEventListener('input', () => {
      const position = parseInt((slider as HTMLInputElement).value, 10);
      applyTheme(position);
      localStorage.setItem('theme-position', String(position));
      // Sync all slider instances (desktop + mobile)
      sliders.forEach(s => { if (s !== slider) (s as HTMLInputElement).value = String(position); });
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme-position') === null) {
      const pos = e.matches ? 0 : 100;
      sliders.forEach(s => { (s as HTMLInputElement).value = String(pos); });
      applyTheme(pos);
    }
  });
  ```

  **Scoped CSS:**
  ```css
  .theme-slider-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .slider-icon {
    color: rgba(255,255,255,0.80);
    flex-shrink: 0;
    pointer-events: none;
  }

  .theme-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 80px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255,255,255,0.20);
    outline: none;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .theme-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    transition: transform 0.15s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }

  .theme-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }

  .theme-slider::-webkit-slider-thumb:hover,
  .theme-slider:focus-visible::-webkit-slider-thumb {
    transform: scale(1.2);
  }

  .theme-slider:focus-visible {
    box-shadow: 0 0 0 2px var(--accent);
    border-radius: 2px;
  }
  ```

- [ ] **REFACTOR:** Ensure TypeScript types are preserved for Astro module scripts, icons use `aria-hidden="true"`, and the component is accessible to keyboard users.

#### Phase 3: Navigation Integration (The "Glue")

- [ ] **Modify `src/components/Nav.astro` — line ~3:** Replace import:
  ```astro
  // REMOVE:
  import ThemeToggle from './ThemeToggle.astro';
  // ADD:
  import ThemeSlider from './ThemeSlider.astro';
  ```

- [ ] **Modify `src/components/Nav.astro` — line ~37 (desktop nav-right):** Replace:
  ```astro
  // REMOVE:
  <ThemeToggle />
  // ADD:
  <ThemeSlider />
  ```

- [ ] **Modify `src/components/Nav.astro` — line ~70 (mobile overlay):** Replace:
  ```astro
  // REMOVE:
  <ThemeToggle />
  // ADD:
  <ThemeSlider />
  ```

- [ ] **Update `src/components/Nav.astro` — overlay close logic (line ~129):** The `theme-changed` custom event from `ThemeToggle` is no longer dispatched. The mobile overlay close-on-theme-change behavior can be removed or replaced with a slider input event if desired. Since the slider is a persistent control (not a tap), auto-closing the mobile overlay on slider interaction would be disruptive — **remove** the `overlay.addEventListener('theme-changed', closeMenu)` line.

#### Phase 4: FOWT Script Update — `src/layouts/BaseLayout.astro` (lines ~160–167)

The FOWT inline script must replicate the interpolation engine to prevent flash of wrong theme. Update the existing `<script is:inline>` block:

```html
<!-- FOWT prevention: apply stored theme-position before CSS renders -->
<script is:inline>
  (function() {
    var TOKENS = {
      '--bg-base':        { d:[15,25,35],         l:[247,245,242] },
      '--bg-section-alt': { d:[17,30,43],         l:[234,230,225] },
      '--bg-card':        { d:[255,255,255,0.05], l:[255,255,255,1] },
      '--bg-nav':         { d:[15,25,35,0.96],    l:[247,245,242,0.96] },
      '--bg-footer':      { d:[15,25,35],         l:[26,26,26] },
      '--text-primary':   { d:[255,255,255],      l:[26,26,26] },
      '--text-secondary': { d:[255,255,255,0.70], l:[90,106,114,1] },
      '--text-muted':     { d:[255,255,255,0.45], l:[138,154,163,1] },
      '--border-subtle':  { d:[255,255,255,0.10], l:[0,0,0,0.08] },
      '--border-card':    { d:[255,255,255,0.08], l:[0,0,0,0.06] },
    };
    var SHADOW_TOKENS = {
      '--shadow-card':  { tpl:'0 4px 20px rgba(0,0,0,{a})',  op:[0.25,0.06] },
      '--shadow-hover': { tpl:'0 12px 40px rgba(0,0,0,{a})', op:[0.40,0.10] },
      '--shadow-photo': { tpl:'0 20px 60px rgba(0,0,0,{a})', op:[0.45,0.14] },
    };

    function lerp(a, b, t) { return a + (b - a) * t; }

    function applyPosition(pos) {
      var t = pos / 100;
      var root = document.documentElement;
      if (pos === 0) { root.removeAttribute('data-theme'); return; }
      if (pos === 100) { root.setAttribute('data-theme', 'light'); return; }
      root.removeAttribute('data-theme');
      for (var token in TOKENS) {
        var cfg = TOKENS[token];
        var d = cfg.d, li = cfg.l;
        var r = Math.round(lerp(d[0],li[0],t));
        var g = Math.round(lerp(d[1],li[1],t));
        var b = Math.round(lerp(d[2],li[2],t));
        if (d.length === 4 || li.length === 4) {
          var dA = d[3]  !== undefined ? d[3]  : 1;
          var lA = li[3] !== undefined ? li[3] : 1;
          var a = Math.round(lerp(dA,lA,t)*1000)/1000;
          root.style.setProperty(token,'rgba('+r+','+g+','+b+','+a+')');
        } else {
          root.style.setProperty(token,'rgb('+r+','+g+','+b+')');
        }
      }
      for (var st in SHADOW_TOKENS) {
        var scfg = SHADOW_TOKENS[st];
        var sa = Math.round(lerp(scfg.op[0],scfg.op[1],t)*1000)/1000;
        root.style.setProperty(st, scfg.tpl.replace('{a}', sa));
      }
    }

    // Read position — support new key and legacy key migration
    var rawPos = localStorage.getItem('theme-position');
    var position;
    if (rawPos !== null) {
      position = parseInt(rawPos, 10);
    } else {
      var legacy = localStorage.getItem('theme');
      if (legacy === 'light') { position = 100; }
      else if (legacy === 'dark') { position = 0; }
      else {
        position = window.matchMedia('(prefers-color-scheme: dark)').matches ? 0 : 100;
      }
    }
    applyPosition(position);
  })();
</script>
```

#### Phase 5: Legacy ThemeToggle Deprecation — `src/components/ThemeToggle.astro`

- [ ] Replace all content of `ThemeToggle.astro` with a passthrough import:
  ```astro
  ---
  // Deprecated: use ThemeSlider.astro instead.
  // This shim exists so any pages that still reference ThemeToggle continue to build.
  import ThemeSlider from './ThemeSlider.astro';
  ---
  <ThemeSlider />
  ```
  This ensures a clean deprecation path without breaking any Astro page that might still import the old component.

#### Phase 6: Quality & Validation

- [ ] Run build: `pnpm build` (or `npx astro build`)
- [ ] Test in browser: open `http://localhost:4321`, drag the slider, verify smooth interpolation
- [ ] Test localStorage migration: set `theme=light` in localStorage, refresh — slider should initialize at 100
- [ ] Test FOWT: set `theme-position=50` in localStorage, do hard refresh — page should load at mid-theme with no flash
- [ ] Test mobile: open mobile overlay, use slider inside the overlay, verify it syncs with desktop instance

---

## 4. Automated Verification

### Verification Commands

```bash
# Build (Astro)
pnpm build
# or: npx astro build

# Development server for manual testing
pnpm dev
# or: npx astro dev
```

> Note: This is a pure Astro.js project. There is no Vitest or Jest configuration currently in `package.json`. Automated unit tests would require adding a testing dependency. For this feature, verification is primarily manual + build-time TypeScript checking.

### Quality Gates

- [ ] `pnpm build` completes with zero errors (Astro TypeScript + HTML validation)
- [ ] No JavaScript console errors in browser (all three locale routes: `/`, `/en/`, `/zh/`)
- [ ] `--theme-position` persists correctly across page reloads
- [ ] CSS custom property values at p=0 match `:root` defaults (no inline overrides set)
- [ ] CSS custom property values at p=100 match `[data-theme="light"]` values (no inline overrides set)
- [ ] CSS custom property values at p=50 are the arithmetic midpoint of dark and light values

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] Run `pnpm install` (no new dependencies needed — pure CSS/JS/Astro)
- [ ] Ensure no `.env` configuration needed for this feature

### Discovery Test

1. [ ] Start dev server: `pnpm dev` → `http://localhost:4321`
2. [ ] Without any prior knowledge, locate the slider control in the navigation bar
3. [ ] Confirm: moon icon on the left, sun icon on the right, gold circular thumb visible
4. [ ] Confirm the slider appears in both desktop nav and mobile overlay

### Interpolation Test

5. [ ] Move the slider fully left (0) → page should be in full dark mode (`#0f1923` background)
6. [ ] Move the slider fully right (100) → page should be in full light mode (`#f7f5f2` background)
7. [ ] Set slider to position 50 → background should be approximately `rgb(131, 135, 138)` — a neutral grey midpoint
8. [ ] Open browser DevTools → Elements panel → select `<html>` → verify inline `style` attribute contains interpolated `--bg-base` at intermediate positions and is absent at positions 0 and 100

### Persistence Test

9. [ ] Drag slider to position 35, then do a hard page refresh (Cmd+Shift+R / Ctrl+Shift+R)
10. [ ] Page should load at position 35 with no flash of wrong theme (FOWT check)
11. [ ] Slider thumb should be at position 35

### Legacy Migration Test

12. [ ] In DevTools Console: `localStorage.setItem('theme', 'light'); location.reload()`
13. [ ] Page should load at position 100 (full light), slider at right extreme
14. [ ] Check `localStorage` — should now contain `theme-position=100` after slider interaction

### Locale Test

15. [ ] Navigate to `/en/` → slider should retain the saved position
16. [ ] Navigate to `/zh/` → slider should retain the saved position

### Reduced Motion Test

17. [ ] In DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce"
18. [ ] Drag slider → theme changes should still work but without CSS transitions (the `prefers-reduced-motion` block in `global.css` disables `--theme-transition`)

### Accessibility Test

19. [ ] Tab to the slider → confirm visible gold focus ring around slider track
20. [ ] Use arrow keys to increment/decrement slider value — theme should change continuously
21. [ ] Screen reader (VoiceOver/NVDA): confirm slider is announced as "Theme brightness, slider" or similar

### Error Handling Test

22. [ ] Disable JavaScript → page should fall back to OS `prefers-color-scheme` via CSS media query (existing `@media (prefers-color-scheme: light)` in `global.css`) — slider will not be functional but CSS fallback applies
23. [ ] Set `localStorage.setItem('theme-position', 'NaN')` then reload → should fall back to OS preference gracefully

**Success Criteria:**
- [ ] Slider is visible and discoverable in the nav bar without instructions
- [ ] Dragging produces real-time, smooth visual interpolation across the entire page
- [ ] Theme persists across reloads with zero flash of wrong theme
- [ ] Works in all three language routes (`/`, `/en/`, `/zh/`)
- [ ] No console errors in any browser
- [ ] Keyboard accessible and screen-reader friendly

---

## 6. Coverage Requirements

Since there is no test runner in this project's `package.json`, the following manual checkpoints serve as coverage:

- [ ] p=0: dark endpoint verified (visual + DevTools)
- [ ] p=100: light endpoint verified (visual + DevTools)
- [ ] p=50: midpoint values verified programmatically in console
- [ ] localStorage read path tested (stored value)
- [ ] localStorage fallback paths tested (legacy `theme` key, no key at all)
- [ ] OS preference change event tested
- [ ] Two slider instances syncing (desktop + mobile) tested
- [ ] FOWT inline script tested (hard refresh at non-extreme position)
- [ ] `prefers-reduced-motion` interaction tested

---

## 7. Acceptance Criteria

**Definition of Done:**

- [ ] `ThemeSlider.astro` component created with sun/moon icons and range input
- [ ] Slider placed in Nav desktop bar and mobile overlay (same location as old toggle)
- [ ] Theme interpolates smoothly at all intermediate slider positions
- [ ] At p=0 full dark theme active (CSS cascade, no inline overrides)
- [ ] At p=100 full light theme active (CSS cascade via `[data-theme="light"]`, no inline overrides)
- [ ] FOWT inline script in `BaseLayout.astro` updated and tested
- [ ] Legacy `theme` localStorage key migrated to `theme-position` on first interaction
- [ ] `ThemeToggle.astro` deprecated with passthrough shim
- [ ] `Nav.astro` imports and renders `ThemeSlider` in both desktop and mobile locations
- [ ] `theme-changed` custom event listener removed from Nav overlay close logic
- [ ] Gold accent color and all layout/spacing tokens remain unchanged at all positions
- [ ] Slider is keyboard accessible (arrow keys change position, focus ring visible)
- [ ] `pnpm build` succeeds with zero errors
- [ ] No console errors in browser across all locale routes
- [ ] Manual verification script completed successfully
- [ ] No regressions in existing sections (hero, footer, cards, nav scroll state)
