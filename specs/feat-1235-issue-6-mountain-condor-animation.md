# Feature Specification: Mountain Condor Flying Animation

## 1. Design Analysis

**Target Scope:** `src/components/` — Astro static site (`aconcagua.co`)

**Affected Layers:**
- UI / Presentation (`MountainHiker.astro` — replaced in-place)
- Client-side scripting (vanilla JS scroll listener, rAF loop — updated constants for condor geometry)
- Existing Hero component (`Hero.astro` — import/reference rename)

**Problem Statement:**
The current decorative scroll-driven animation in the Hero mountain ridge uses a human hiker silhouette walking along the ridge. The brand is centred on the Andes and Aconcagua — a landscape most famously associated with the Andean condor (Vultur gryphus), South America's largest soaring bird and a powerful symbol of the region. Replacing the hiker with a condor in flight better aligns the animation with the brand identity, adds visual drama, and shifts the motion metaphor from "effort on foot" to "freedom in flight."

**Solution Strategy:**
1. Replace the inline SVG in `MountainHiker.astro` with a condor-in-flight SVG (broad spread wings, distinctive silhouette).
2. Update the CSS animations from leg-walking cycles to soaring / gliding keyframes (gentle wing-tip rock when active, slow banking sway at idle).
3. Adjust positioning constants to account for the condor's wider footprint and its flight path slightly **above** the ridge (birds soar above terrain, not on it).
4. Rename the component from `MountainHiker.astro` to `MountainCondor.astro` to match the new character.
5. Update `Hero.astro` to import and render `<MountainCondor />` instead of `<MountainHiker />`.
6. Keep all scroll-driven logic, lerp smoothing, and `prefers-reduced-motion` behaviour intact.

**Entry Point / Exposure:**
- *UI Feature — automatic:* The condor is rendered as part of the Hero section (just like the hiker was). No user action is required — it appears at the bottom of the hero as the page loads and animates as the user scrolls through the hero section.

**User Story:**
As a *site visitor*, I want to see an Andean condor soaring gracefully above the mountain silhouette as I scroll down, so that the brand identity (freedom, Andes, South America) is reinforced at the most impactful visual transition on the page.

---

## 2. Architecture & Data

### Architecture

The animation follows the same scroll-driven pattern as the previous hiker implementation:

```
User scrolls ──► scroll event (passive)
                    │
                    ▼
           heroScrollProgress (0–1)
                    │
          ┌─────────┴────────────┐
          │                      │
     X position            Y position
 (progress × viewportW)   (ridgeY() + hover offset above ridge)
          │                      │
          └────────────┬─────────┘
                       ▼
              CSS transform: translate(Xpx, Ypx)
              CSS class: .soaring / .gliding
```

**Key components:**

| Element | Description |
|---------|-------------|
| `MountainCondor.astro` | **New** Astro component — condor SVG + scoped styles + `<script>`. Replaces `MountainHiker.astro`. |
| `Hero.astro` | **Modified** — import changed from `MountainHiker` to `MountainCondor`; JSX tag updated accordingly. |

**Condor SVG Design:**
- ViewBox: `0 0 60 32` — wide aspect ratio to accommodate spread wings
- Wings: two broad curved arcs (left / right `<path>`) emanating from the central body
- Body: central elongated ellipse (`<ellipse>`)
- Head/neck: small circle + short line at the leading tip
- White collar: white ellipse overlaid on the neck (distinctive Andean condor marking)
- Fill: `var(--accent)` at 0.85 opacity for primary shapes; `var(--white)` for collar detail — adapts to brand tokens

**Animation States:**

| State | Trigger | CSS Keyframes |
|-------|---------|---------------|
| `gliding` (idle) | No active scroll | `condor-glide`: gentle ±3° whole-body bank (slow, 3 s) |
| `soaring` (active) | During scroll | `condor-soar`: wing-tip dip — wings rock ±8° about the body centre (0.8 s) |

**Positioning Changes vs Hiker:**

| Constant | Hiker | Condor | Reason |
|----------|-------|--------|--------|
| SVG width | 28 px | 60 px | Wide wings |
| SVG height | 40 px | 32 px | Soaring bird is flat |
| Half-width offset | 14 px | 30 px | Centering on ridge X |
| Belly Y in SVG | 32 px | 24 px | Where body center sits in viewBox |
| Hover offset above ridge | 0 px | 18 px | Condor flies above, not on, the ridge |

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [ ] Shared Domain Types: None

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/components/MountainCondor.astro` **(Create)** — New Astro component containing:
  - Condor SVG silhouette (viewBox 0 0 60 32, inline, aria-hidden)
  - Scoped `<style>` block: `.condor-wrapper` positioning, `.condor` absolute positioning, `@keyframes condor-glide`, `@keyframes condor-soar`, `@keyframes wing-l`, `@keyframes wing-r`, reduced-motion override
  - `<script>` block: same RIDGE/MOUNTAIN_H constants as before, updated geometry constants (CONDOR_W, CONDOR_H, CONDOR_W_HALF, CONDOR_BELLY_Y, HOVER_OFFSET), same ridgeY() interpolation, same lerp rAF loop, same scroll/idle state switching

- `src/components/MountainHiker.astro` **(Modify — full replacement)** — File content replaced to redirect to `MountainCondor.astro`. **(Alternative: Delete and update Hero.astro only.)**
  > **Recommended approach:** Keep `MountainHiker.astro` as a thin re-export or simply delete it and update `Hero.astro`. Deleting is cleaner.

- `src/components/Hero.astro` **(Modify — line ~2 frontmatter + line ~67 template)**
  - Line ~2: Change `import MountainHiker from './MountainHiker.astro';` → `import MountainCondor from './MountainCondor.astro';`
  - Line ~67: Change `<MountainHiker />` → `<MountainCondor />`

---

### Execution Steps

#### Phase 1: Domain & Shared Types *(N/A — pure UI feature)*

Not applicable. This is a presentational-only change inside a single Astro component.

---

#### Phase 2: SVG Asset Design (RED → GREEN → REFACTOR)

- [ ] **RED**: Define acceptance criteria:
  - Condor silhouette is immediately recognisable at 60 × 32 px
  - White collar accent is visible
  - Looks correct in both dark and light themes (uses CSS custom properties)
  - No interactive elements, no `title`, `desc` (purely decorative, `aria-hidden="true"`)

- [ ] **GREEN**: Implement condor SVG inside `MountainCondor.astro`:

```svg
<svg
  class="condor gliding"
  width="60"
  height="32"
  viewBox="0 0 60 32"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  focusable="false"
>
  <!-- Left wing group (animated) -->
  <g class="wing-l" style="transform-origin: 30px 18px;">
    <path
      d="M30 18 C22 14, 10 10, 0 14 C8 12, 20 16, 30 18Z"
      fill="var(--accent)"
      opacity="0.88"
    />
    <!-- Left wing tip feathers -->
    <path
      d="M6 13 C4 10, 2 12, 0 14"
      stroke="var(--accent)"
      stroke-width="1"
      stroke-linecap="round"
      opacity="0.7"
    />
  </g>

  <!-- Right wing group (animated) -->
  <g class="wing-r" style="transform-origin: 30px 18px;">
    <path
      d="M30 18 C38 14, 50 10, 60 14 C52 12, 40 16, 30 18Z"
      fill="var(--accent)"
      opacity="0.88"
    />
    <!-- Right wing tip feathers -->
    <path
      d="M54 13 C56 10, 58 12, 60 14"
      stroke="var(--accent)"
      stroke-width="1"
      stroke-linecap="round"
      opacity="0.7"
    />
  </g>

  <!-- Body -->
  <ellipse cx="30" cy="19" rx="7" ry="5" fill="var(--accent)" opacity="0.92" />

  <!-- White collar (Andean condor marking) -->
  <ellipse cx="30" cy="14" rx="4" ry="2.5" fill="var(--white)" opacity="0.9" />

  <!-- Neck -->
  <line x1="30" y1="12" x2="30" y2="10" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" opacity="0.88" />

  <!-- Head (bald, reddish — represented as a lighter circle) -->
  <circle cx="30" cy="9" r="3" fill="var(--accent)" opacity="0.75" />

  <!-- Tail fan -->
  <path
    d="M26 23 C27 27, 30 28, 30 28 C30 28, 33 27, 34 23"
    fill="var(--accent)"
    opacity="0.8"
  />
</svg>
```

- [ ] **REFACTOR**: Simplify path data for clean rendering at small sizes; verify `aria-hidden="true"` and `focusable="false"` on the `<svg>` element.

---

#### Phase 3: CSS Positioning & Animation (TDD — visual verification)

- [ ] **RED**: Sketch expected behaviour:
  - Condor flies visibly **above** the mountain ridge (not on it)
  - Wings animate in a soaring/gliding pattern (not leg-walking)
  - Animation pauses when `prefers-reduced-motion: reduce` is active
  - Z-index places condor above the mountain silhouette and below the nav

- [ ] **GREEN**: Implement scoped CSS in `MountainCondor.astro`:

```css
/* Container — mirrors .hiker-wrapper geometry */
.condor-wrapper {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 160px;       /* taller than mountain (120px) to allow hover-above-ridge */
  z-index: 3;
  pointer-events: none;
  overflow: visible;
}

.condor {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 32px;
  transform-origin: center center;
  will-change: translate, rotate;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
  transition: none;
}

/* Idle glide — slow, graceful banking */
@keyframes condor-glide {
  0%, 100% { rotate: -3deg; }
  50%       { rotate:  3deg; }
}

/* Active soar — wing-tip oscillation while following ridge */
@keyframes wing-l {
  0%, 100% { transform: rotate(-8deg); }
  50%       { transform: rotate( 5deg); }
}
@keyframes wing-r {
  0%, 100% { transform: rotate( 8deg); }
  50%       { transform: rotate(-5deg); }
}

.condor.gliding {
  animation: condor-glide 3s ease-in-out infinite;
}

.condor.soaring .wing-l { animation: wing-l 0.8s ease-in-out infinite; }
.condor.soaring .wing-r { animation: wing-r 0.8s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .condor,
  .condor .wing-l,
  .condor .wing-r { animation: none !important; }
}
```

- [ ] **REFACTOR**: Confirm `z-index` layering: nav (z: 100) > condor (z: 3) > hero content (z: 2) > mountain (z: 1).

---

#### Phase 4: Scroll-Driven Logic (TDD Required)

- [ ] **RED**: Expected behaviour:
  - At scroll 0 → condor at ~8 % viewport width, flying above the left ridge
  - At scroll 50 % → condor at ~50 % width, following ridge height + hover offset
  - At scroll 100 % → condor at ~92 % width, above the right ridge
  - Condor always appears to fly **above** the ridge (hover offset lifts it)
  - Scrolling activates `.soaring` class; 300 ms after scroll stops → `.gliding`

- [ ] **GREEN**: Implement `<script>` in `MountainCondor.astro`:

```typescript
// Ridge control points — must match Hero.astro clip-path (x%, y%)
// y% = percentage from TOP of the 120px mountain div
const RIDGE: [number, number][] = [
  [0,  70], [8,  55], [15, 70], [22, 45], [30, 65],
  [38, 30], [46, 55], [50, 40], [54, 55], [62, 20],
  [70, 50], [78, 35], [85, 58], [92, 42], [100, 60],
];

const MOUNTAIN_H    = 120;  // px — must match Hero.astro .hero-mountain height
const CONDOR_W      = 60;   // px — rendered SVG width
const CONDOR_H      = 32;   // px — rendered SVG height
const CONDOR_W_HALF = 30;   // px — half-width for X centering
const CONDOR_BELLY_Y = 19;  // px — body centre Y within SVG viewBox (out of 32)
const HOVER_OFFSET  = 18;   // px — condor flies this many px above the ridge
const X_START       = 0.08; // start at 8% of viewport width
const X_END         = 0.92; // end at 92%
const LERP_FACTOR   = 0.10; // smoothing (slightly gentler than hiker for graceful flight)

function ridgeY(xPercent: number): number {
  for (let i = 0; i < RIDGE.length - 1; i++) {
    const [x0, y0] = RIDGE[i];
    const [x1, y1] = RIDGE[i + 1];
    if (xPercent >= x0 && xPercent <= x1) {
      const t = (xPercent - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return RIDGE[RIDGE.length - 1][1];
}

const hero   = document.querySelector<HTMLElement>('.hero');
const condor = document.querySelector<HTMLElement>('.condor');

if (hero && condor) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Place at peak (62%, y=20%) — no animation
    const staticX   = 0.62 * window.innerWidth - CONDOR_W_HALF;
    const staticYPx = (20 / 100) * MOUNTAIN_H;
    const offset    = -(MOUNTAIN_H - staticYPx) + (CONDOR_H - CONDOR_BELLY_Y) - HOVER_OFFSET;
    condor.style.translate = `${staticX}px ${offset}px`;
  } else {
    condor.classList.add('gliding');

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafId: number;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    function computeTarget(): void {
      const heroRect = hero!.getBoundingClientRect();
      const heroH    = hero!.offsetHeight;
      const scrolled = -heroRect.top;
      const progress = Math.max(0, Math.min(1, scrolled / heroH));

      const xPercent = X_START + progress * (X_END - X_START);
      targetX = xPercent * window.innerWidth - CONDOR_W_HALF;

      const yPercent = ridgeY(xPercent * 100);
      const yPx      = (yPercent / 100) * MOUNTAIN_H;
      // Condor belly aligns with ridge, then lifts by HOVER_OFFSET
      targetY = -(MOUNTAIN_H - yPx) + (CONDOR_H - CONDOR_BELLY_Y) - HOVER_OFFSET;
    }

    function loop(): void {
      currentX += (targetX - currentX) * LERP_FACTOR;
      currentY += (targetY - currentY) * LERP_FACTOR;
      condor!.style.translate = `${currentX}px ${currentY}px`;
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener('scroll', () => {
      condor!.classList.remove('gliding');
      condor!.classList.add('soaring');

      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        condor!.classList.remove('soaring');
        condor!.classList.add('gliding');
      }, 300);

      computeTarget();
    }, { passive: true });

    window.addEventListener('resize', computeTarget, { passive: true });

    computeTarget();
    rafId = requestAnimationFrame(loop);
  }
}
```

- [ ] **REFACTOR**: Verify LERP_FACTOR = 0.10 gives smooth condor flight feel; adjust if condor appears too snappy or too laggy during testing.

---

#### Phase 4 (Integration & Exposure — MANDATORY)

**COMPONENT RENDERING:**
- File: `src/components/Hero.astro`
- Change 1 (line ~2, frontmatter): Replace import
  ```diff
  - import MountainHiker from './MountainHiker.astro';
  + import MountainCondor from './MountainCondor.astro';
  ```
- Change 2 (line ~67, template): Replace JSX tag
  ```diff
  - <MountainHiker />
  + <MountainCondor />
  ```

**OLD FILE REMOVAL:**
- `src/components/MountainHiker.astro` — **Delete** this file after `MountainCondor.astro` is created and wired up, to avoid dead code.

**USER DISCOVERY:**
- Automatic on page load — the condor is visible near the bottom of the hero section, flying above the mountain ridge. No user interaction is required. Scrolling activates the wing animation.

---

#### Phase 5: Quality & Validation

- [ ] Run build: `npm run build` (or `pnpm build` / `astro build`)
- [ ] Type check: `npx astro check`
- [ ] Start dev server: `npm run dev` → visual verification
- [ ] Check reduced-motion: DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`
- [ ] Check light theme: toggle via ThemeSlider component

---

## 4. Automated Verification

### Verification Commands

```bash
# Install dependencies (first time)
npm install

# Type-check Astro components
npx astro check

# Build for production
npm run build

# Development server for visual verification
npm run dev
```

### Quality Gates
- [ ] `astro check` reports zero TypeScript errors
- [ ] Production build completes without errors or warnings
- [ ] `dist/` output does not reference `MountainHiker` (confirm old component removed)
- [ ] No JavaScript console errors on page load or during scroll
- [ ] Lighthouse Performance score unaffected (condor script is < 2 KB, zero network requests)
- [ ] Condor SVG renders correctly in Chrome 111+, Firefox 113+, Safari 16.4+

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] `npm install` completed successfully
- [ ] Dev server running: `npm run dev` → `http://localhost:4321`

**Steps:**

1. [ ] Open `http://localhost:4321` in browser (dark theme, default)
2. [ ] **DISCOVERY TEST**:
   - Without scrolling, locate the condor silhouette at the lower-left area of the hero section, above the mountain ridge.
   - Verify it is immediately visible without any user interaction.
3. [ ] **SILHOUETTE TEST**:
   - Verify the shape is recognisable as a large soaring bird with spread wings.
   - Verify the white collar accent is visible on the bird's neck.
4. [ ] **SCROLL / SOARING ANIMATION TEST**:
   - Slowly scroll through the hero section.
   - Verify the condor moves smoothly from left to right across the viewport.
   - Verify the condor flies **above** the mountain ridge (not on it) throughout the journey.
   - Verify the wing-soaring animation activates during scroll.
   - Verify the condor's vertical position rises at mountain peaks and descends in valleys (while always staying above the ridge surface).
5. [ ] **IDLE / GLIDING ANIMATION TEST**:
   - Stop scrolling mid-hero.
   - Verify the condor transitions to a slow, gentle banking glide within 300 ms.
6. [ ] **LIGHT THEME TEST**:
   - Toggle to light theme via the ThemeSlider.
   - Verify the condor colour adapts correctly (uses `var(--accent)` and `var(--white)` tokens).
7. [ ] **REDUCED MOTION TEST**:
   - DevTools → Rendering → Emulate CSS media feature: `prefers-reduced-motion: reduce`.
   - Refresh page — verify condor is visible at mountain peak (~62 % x) with no animation, but still positioned correctly above the ridge.
8. [ ] **MOBILE TEST**:
   - Resize viewport to 375 px width.
   - Verify condor is still visible, proportional, and correctly positioned above the ridge.
9. [ ] **ERROR TEST**:
   - Open DevTools Console — verify zero JavaScript errors at any point during scroll, idle, and resize.
10. [ ] **OLD CHARACTER REMOVED TEST**:
    - Verify the hiker figure is completely gone and no remnant shapes appear on the mountain.

**Success Criteria:**
- [ ] Condor is immediately discoverable (visible at bottom of hero on load)
- [ ] Condor silhouette is recognisable as an Andean condor in flight
- [ ] Condor flies above (not on) the mountain ridge throughout the animation
- [ ] Soaring wing animation is active during scroll; gliding sway resumes on idle
- [ ] Both dark and light themes render correctly without additional theming logic
- [ ] `prefers-reduced-motion` respected — condor appears static at the peak
- [ ] No console errors, no layout shifts, no performance regression
- [ ] `MountainHiker.astro` is fully removed; no hiker remains on the page

---

## 6. Coverage Requirements

- [ ] Visual regression (manual): condor visible and above-ridge at 0 %, 50 %, 100 % scroll progress
- [ ] Functional unit test (isolated): `ridgeY()` pure function — no DOM dependency, can be extracted and tested with a simple Node.js/Jest/Vitest test file
- [ ] Edge cases:
  - `.hero` element not found in DOM → guard clause prevents script crash
  - Viewport resized during scroll → `computeTarget()` called on `resize` event ensures correct repositioning
  - Scroll position before hero → `Math.max(0, ...)` clamps progress to 0
  - Scroll past hero → `Math.min(1, ...)` clamps progress to 1
- [ ] Cross-browser: Chrome 111+, Firefox 113+, Safari 16.4+

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] `src/components/MountainCondor.astro` created with condor SVG, scoped CSS animations, and scroll-driven positioning script
- [ ] `src/components/Hero.astro` import and JSX tag updated to reference `MountainCondor`
- [ ] `src/components/MountainHiker.astro` deleted (no dead code)
- [ ] Condor is visible above the mountain ridge across the full scroll range
- [ ] Soaring animation activates during scroll; gliding animation resumes on idle
- [ ] `prefers-reduced-motion` respected — static condor at peak, no animation
- [ ] Theme-adaptive colours work in dark and light modes
- [ ] No layout shift, no JavaScript errors, no performance regression
- [ ] Manual verification script completed and all steps passed
- [ ] Naming follows Astro PascalCase convention (`MountainCondor.astro`)
- [ ] Component remains `aria-hidden="true"` and `pointer-events: none` (purely decorative)
- [ ] DDD / module rules not applicable (pure Astro static site, no backend or shared packages involved)
