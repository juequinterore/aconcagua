# Feature Specification: Mountain Hiker Scroll Animation

## 1. Design Analysis

**Target Scope:** `apps/visual_workflow` → *(Actual project)* `src/components/` — Astro static site (`aconcagua.co`)

**Affected Layers:**
- UI / Presentation (new Astro component, SVG illustration)
- Client-side scripting (vanilla JS scroll listener, IntersectionObserver)
- Existing Hero component (minor wiring)

**Problem Statement:**
The separator between the Hero (section 1) and Stats (section 2) is a CSS `clip-path` mountain silhouette in `.hero-mountain`. It is a purely decorative, static shape. There is no sense of life, scale, or personality at this transition. The client wants a small mountaineer figure that **inhabits** this mountain ridge, giving the separator narrative meaning and delighting the user as they scroll.

**Solution Strategy:**
Introduce a lightweight `MountainHiker.astro` component that:
1. Renders a minimal SVG mountaineer silhouette (~30 px tall) positioned absolutely inside the Hero section, riding the ridge of `.hero-mountain`.
2. Listens to the page `scroll` event and drives the hiker's horizontal (X) position across the viewport as the user scrolls through the Hero section (0 → 100 % of hero height).
3. Interpolates the hiker's vertical (Y) position from the same polygon control points used by the CSS `clip-path`, so the figure visually walks *on* the ridge.
4. Applies a CSS `@keyframes` walking leg-cycle when scroll is in progress, and a gentle idle sway when at rest.
5. Fully respects `prefers-reduced-motion`: the hiker is shown at a fixed midpoint position with no animation.

**Entry Point / Exposure:**
- *UI Feature — automatic:* The hiker is rendered as part of the Hero section. No user action required to discover it — it appears naturally as the user's eye reaches the bottom of the hero area and becomes interactive the moment they begin to scroll.

**User Story:**
As a *site visitor*, I want to see a charming mountaineer figure walk across the mountain silhouette as I scroll down, so that the brand personality (adventure, scale, human journey) is reinforced visually at the most impactful transition on the page.

---

## 2. Architecture & Data

### Architecture

```
User scrolls ──► scroll event (passive)
                    │
                    ▼
           heroScrollProgress (0–1)
                    │
          ┌─────────┴────────────┐
          │                      │
     X position            Y position
 (progress × viewportW)   (interpolate ridgePoints[])
          │                      │
          └────────────┬─────────┘
                       ▼
              CSS transform: translate(Xpx, Ypx)
              CSS class: .walking / .idle
```

**Key components:**

| Element | Description |
|---------|-------------|
| `MountainHiker.astro` | New Astro component — SVG figure + scoped styles + `<script>` |
| `Hero.astro` | Modified to import and render `<MountainHiker />` |

**Ridge interpolation logic:**
The clip-path polygon points (excluding the floor corners `0%,100%` and `100%,100%`) define the ridge. Stored as JS array of `[xPercent, yPercent]` pairs. Given the hiker's current X as a percentage of viewport width, perform linear segment interpolation to find the corresponding Y percentage within the 120 px mountain div. Convert to absolute pixel offsets for `transform: translate()`.

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [ ] Shared Domain Types: None

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/components/MountainHiker.astro` **(Create)** — New component: SVG hiker, scoped CSS (positioning, walking keyframe, idle sway, reduced-motion override), client-side `<script>` (scroll driver + ridge interpolation)
- `src/components/Hero.astro` **(Modify — line ~1 frontmatter + line ~63–65 template)** — Import `MountainHiker.astro` and render `<MountainHiker />` as a sibling or child within the `.hero` container, above `.hero-mountain`

---

### Execution Steps

#### Phase 1: Domain & Shared Types *(N/A for this feature — no shared packages involved)*

Not applicable. This is a pure UI/presentation feature in a single Astro component.

---

#### Phase 2: SVG Asset Design (RED → GREEN → REFACTOR)

- [ ] **RED**: Define acceptance criteria: mountaineer silhouette must be visible at ≥ 24 px height, recognisable as a person with backpack, looks correct in both dark and light themes.
- [ ] **GREEN**: Design inline SVG mountaineer in `MountainHiker.astro`:
  - Head: circle
  - Torso: short vertical line / rect
  - Backpack: rounded rect behind torso
  - Arms: angled lines
  - Legs: two `<line>` / `<path>` elements wrapped in a `<g class="legs">` for animation
  - Walking stick / ice axe: diagonal line in front
  - Viewbox: `0 0 28 40`, total height ~40px rendered at 28 px wide
  - Fill/stroke: `var(--text-primary)` at 85 % opacity — adapts to dark/light theme automatically
- [ ] **REFACTOR**: Simplify SVG paths; ensure `aria-hidden="true"` and no interactive elements

---

#### Phase 3: Positioning & CSS Animation (TDD — visual verification)

- [ ] **RED**: Sketch expected behaviour: hiker sits on ridge, is never clipped by the hero overflow, shadow-free at reduced sizes
- [ ] **GREEN**: Implement in `MountainHiker.astro`:

```css
/* Container — stretches across the full hero bottom */
.hiker-wrapper {
  position: absolute;
  bottom: -2px;           /* flush with hero-mountain top edge */
  left: 0;
  width: 100%;
  height: 140px;          /* slightly taller than mountain div */
  z-index: 3;             /* above mountain (z:1) & content (z:2) */
  pointer-events: none;   /* never block user interaction */
  overflow: visible;
}

/* The hiker SVG itself */
.hiker {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 28px;
  transform-origin: bottom center;
  will-change: transform;
  transition: none;       /* JS drives position; no CSS transition fights */
}

/* Idle sway — gentle 2-second rock */
@keyframes hiker-idle {
  0%, 100% { transform: rotate(-2deg); }
  50%       { transform: rotate(2deg); }
}

/* Walking — legs swing */
@keyframes leg-l {
  0%, 100% { transform: rotate(-20deg); }
  50%       { transform: rotate(15deg); }
}
@keyframes leg-r {
  0%, 100% { transform: rotate(15deg); }
  50%       { transform: rotate(-20deg); }
}

.hiker.idle {
  animation: hiker-idle 2s ease-in-out infinite;
}

.hiker.walking .leg-l { animation: leg-l 0.4s ease-in-out infinite; }
.hiker.walking .leg-r { animation: leg-r 0.4s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .hiker, .hiker .leg-l, .hiker .leg-r { animation: none !important; }
}
```

- [ ] **REFACTOR**: Confirm `z-index` layering doesn't conflict with nav (z: 100), hero content (z: 2), mountain (z: 1)

---

#### Phase 4: Scroll-Driven Logic (TDD Required)

- [ ] **RED**: Expected: at scroll 0 → hiker at 8 % width; at scroll 50 % → hiker at ~50 % width; at scroll 100 % → hiker at 90 % width. Y tracks ridge curve.
- [ ] **GREEN**: Implement `<script>` in `MountainHiker.astro`:

```typescript
// Ridge control points from Hero.astro clip-path (x%, y%)
// y% = percentage from TOP of the 120px mountain div
const RIDGE: [number, number][] = [
  [0,  70], [8,  55], [15, 70], [22, 45], [30, 65],
  [38, 30], [46, 55], [50, 40], [54, 55], [62, 20],
  [70, 50], [78, 35], [85, 58], [92, 42], [100, 60],
];
const MOUNTAIN_H = 120; // px — must match Hero.astro .hero-mountain height
const HIKER_H    = 40;  // px — SVG viewBox height in rendered pixels
const X_START    = 0.08; // start at 8% of viewport width
const X_END      = 0.92; // end at 92%

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

const hero   = document.querySelector<HTMLElement>('.hero')!;
const hiker  = document.querySelector<HTMLElement>('.hiker')!;
if (!hero || !hiker) return;

let scrollTimer: ReturnType<typeof setTimeout> | null = null;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  // Place at peak (62%, 20%) and leave static
  const staticX = 0.62 * window.innerWidth;
  const staticY = (20 / 100) * MOUNTAIN_H;
  hiker.style.transform = `translate(${staticX}px, ${-staticY - HIKER_H}px)`;
  return;
}

hiker.classList.add('idle');

function update(): void {
  const heroRect  = hero.getBoundingClientRect();
  const heroH     = hero.offsetHeight;
  const scrolled  = -heroRect.top;                        // px scrolled into hero
  const progress  = Math.max(0, Math.min(1, scrolled / heroH));

  const xPercent  = X_START + progress * (X_END - X_START); // 0.08 → 0.92
  const xPx       = xPercent * window.innerWidth;

  const yPercent  = ridgeY(xPercent * 100);               // 0–100
  const yPx       = (yPercent / 100) * MOUNTAIN_H;        // px from top of mountain div
  // bottom of hiker aligns with ridge; translate up by HIKER_H
  const yOffset   = -(MOUNTAIN_H - yPx) - HIKER_H;        // negative = up from wrapper bottom

  hiker.style.transform = `translateX(${xPx - 14}px) translateY(${yOffset}px)`;
}

window.addEventListener('scroll', () => {
  hiker.classList.remove('idle');
  hiker.classList.add('walking');

  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    hiker.classList.remove('walking');
    hiker.classList.add('idle');
  }, 300);

  update();
}, { passive: true });

// Initial placement
update();
```

- [ ] **REFACTOR**: Extract magic numbers to named constants; throttle via `requestAnimationFrame` if needed for performance

---

#### Phase 5: Integration & Exposure (The "Glue" — MANDATORY)

**COMPONENT RENDERING:**
- File: `src/components/Hero.astro`
- Change: Add import in frontmatter `---` block (line ~1) and render `<MountainHiker />` immediately before `</section>` (after `.hero-mountain` div, line ~65)
- Exact diff:

```diff
 ---
+import MountainHiker from './MountainHiker.astro';
 interface Props {
```

```diff
   <div class="hero-mountain" aria-hidden="true"></div>
+  <MountainHiker />
 </section>
```

**USER DISCOVERY:**
- Automatic on page load — the hiker is visible as soon as the user's viewport reaches the bottom of the Hero section. No interaction required.
- On scroll: the animation activates naturally.

---

#### Phase 6: Quality & Validation

- [ ] Run build: `npm run build` (or `pnpm build` / `astro build`)
- [ ] Start dev: `npm run dev` and verify visually
- [ ] Linter/TypeScript: `astro check` if configured
- [ ] Check reduced-motion: OS accessibility setting or DevTools emulation

---

## 4. Automated Verification

### Verification Commands

```bash
# Install deps (first time)
npm install

# Build for production
npm run build

# Dev server
npm run dev

# (Optional) Astro type-check
npx astro check
```

### Quality Gates
- [ ] TypeScript compilation succeeds with no errors (`astro check`)
- [ ] Build output contains `MountainHiker` HTML (grep `dist/`)
- [ ] No JS console errors on page load
- [ ] Lighthouse performance score unaffected (hiker script is <2 KB, no network requests)
- [ ] Hiker visible in Chrome, Firefox, Safari

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] `npm install` completed
- [ ] Dev server running: `npm run dev` → `http://localhost:4321`

**Steps:**

1. [ ] Open `http://localhost:4321` in browser (dark mode, default)
2. [ ] **DISCOVERY TEST**: Without scrolling, verify the hiker figure is visible at the left side of the mountain ridge near the bottom of the hero section
3. [ ] **SCROLL ANIMATION TEST**:
   - Slowly scroll down through the hero section
   - Verify the hiker moves smoothly from left to right along the mountain ridge
   - Verify the hiker's vertical position tracks the peaks and valleys of the mountain silhouette (rises at peaks like 62%, dips at valleys)
   - Verify walking leg animation activates during scroll, stops after ~300 ms of no scroll
4. [ ] **IDLE ANIMATION TEST**:
   - Stop scrolling mid-way through the hero
   - Verify the hiker transitions to a gentle idle sway within 300 ms
5. [ ] **LIGHT THEME TEST**:
   - Toggle to light theme via the theme slider
   - Verify hiker colour adapts automatically (uses `var(--text-primary)`)
6. [ ] **REDUCED MOTION TEST**:
   - DevTools → Rendering → Emulate CSS media feature: `prefers-reduced-motion: reduce`
   - Refresh page — verify hiker is visible at mountain peak (~62 % x) with no animation
7. [ ] **MOBILE TEST**:
   - Resize to 375 px width
   - Verify hiker is still visible and proportional (may scale to smaller size at mobile breakpoint)
8. [ ] **ERROR TEST**:
   - Open DevTools Console — verify zero JavaScript errors

**Success Criteria:**
- [ ] Hiker is discoverable immediately (within viewport at bottom of hero)
- [ ] Scroll-driven movement is smooth and on-mountain
- [ ] Walking ↔ idle transitions are natural
- [ ] Dark and light themes work without explicit theming logic in the component
- [ ] No animation when reduced-motion is preferred
- [ ] No console errors or layout shifts

---

## 6. Coverage Requirements

- [ ] Visual regression test (manual): hiker visible at start, mid-scroll, end-scroll positions
- [ ] Functional test: ridge interpolation function `ridgeY()` — unit-testable in isolation (pure function, no DOM dependency)
- [ ] Edge cases: hero section not found (guard clause), viewport resize during scroll (re-call `update()` on `resize` event)
- [ ] Cross-browser: Chrome 111+, Firefox 113+, Safari 16.4+ (same baseline as `color-mix()` used in global.css)

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] `MountainHiker.astro` created with SVG, CSS, and scroll script
- [ ] `Hero.astro` imports and renders `<MountainHiker />`
- [ ] Hiker visible and correctly positioned on mountain ridge
- [ ] Scroll-driven horizontal + vertical movement works
- [ ] Walking animation during scroll, idle sway at rest
- [ ] `prefers-reduced-motion` respected — no animation, fixed position
- [ ] Theme-adaptive colour (dark ↔ light)
- [ ] No layout shift, no JS errors, no performance regression
- [ ] Manual verification script passed in full
- [ ] Naming follows Astro PascalCase component convention (`MountainHiker.astro`)
- [ ] Component is `aria-hidden` and pointer-events-none (purely decorative)
