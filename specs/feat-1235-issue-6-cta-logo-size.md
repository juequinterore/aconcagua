# Feature Specification: Enlarge Julian Kusi Logo in CTA Section

## 1. Design Analysis
**Target Scope:** `apps/visual_workflow` → *Adapted:* `src/components/CTA.astro` (Astro static site)
**Affected Layers:** UI – single Astro component CSS
**Problem Statement:** The Julian Kusi logo displayed in the "Plan Your Expedition with a Free Consultation" section (`CTA.astro`) renders at only 200 px wide, which feels small relative to the surrounding content and makes the brand mark less impactful.
**Solution Strategy:** Increase the CSS width of `.cta-logo` from `200px` to `280px` (a ~40 % increase that is noticeable but not overpowering), and update the matching HTML `width` attribute so that browsers pre-allocate the correct layout space. Keep the existing `filter` drop-shadow and `height: auto` to preserve aspect ratio and the gold glow effect.
**Entry Point / Exposure:** `src/components/CTA.astro` – the `<img class="cta-logo">` element and its `.cta-logo` CSS rule.
**User Story:** As a site visitor, I want the Julian Kusi brand logo to feel prominent in the consultation section, so that it reinforces brand trust and is easy to identify at a glance.

---

## 2. Architecture & Data

### Architecture
This is a single-file Astro component change. No state management, no API, and no shared packages are involved.

```
Browser renders CTA.astro
  └── .cta-deco div (flex container, hidden on ≤900 px)
        └── <img class="cta-logo">   ← size increase applied here
```

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [ ] Shared Domain Types: None

---

## 3. Implementation Plan

### Affected Files (COMPLETE)

| File | Operation | Purpose |
|------|-----------|---------|
| `src/components/CTA.astro` | Modify | Increase logo width from `200` → `280` (HTML attribute) and `200px` → `280px` (CSS) |

**Validation checklist:**
- [x] Component file specified
- [x] Exact file path provided
- [x] Line numbers identified (HTML `width` attr: line 74; CSS `.cta-logo { width }`: line 219)

---

### Execution Steps

**Phase 1: Domain & Shared Types**
- N/A – pure CSS/HTML change, no domain logic.

**Phase 2: Data & Infrastructure**
- N/A

**Phase 3: UI Component (TDD)**
- [ ] **RED**: Visually confirm at 200 px the logo looks too small (screenshot / browser DevTools).
- [ ] **GREEN**: Apply width change to `200px → 280px` in both the HTML attribute and CSS rule.
- [ ] **REFACTOR**: Verify the updated logo remains within the `cta-inner` grid column, does not overflow on large screens (≥ 1400 px), and the `drop-shadow` filter still looks proportionate.

**Phase 4: Integration & Exposure (The "Glue" – MANDATORY)**

- [ ] **COMPONENT RENDERING**: The `<img>` already renders inside `CTA.astro`; no new wiring needed.
- [ ] **RESPONSIVE CHECK**: The `@media (max-width: 900px)` block hides `.cta-deco` entirely, so the size change has zero impact on mobile. No mobile override needed.
- [ ] **USER DISCOVERY**: The logo is visible by default on desktop when the user scrolls to the CTA section.

**Phase 5: Quality & Validation**
- [ ] Build: `npm run build` (Astro static build)
- [ ] Preview: `npm run preview` → open browser and scroll to CTA section
- [ ] Linter: `npm run lint` (if configured)
- [ ] Manual verification (see Section 5)

---

## 4. Automated Verification

### Verification Commands

```bash
# Install dependencies (if not already done)
npm install

# Build the site
npm run build

# Preview the production build locally
npm run preview
```

### Quality Gates
- [ ] Astro build completes with no errors
- [ ] No TypeScript compilation errors
- [ ] Logo renders at the new size without breaking the two-column grid layout

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] Dependencies installed: `npm install`
- [ ] Dev server running: `npm run dev`

**Steps:**

1. [ ] Open `http://localhost:4321` in a desktop browser (viewport ≥ 1024 px).
2. [ ] Scroll to the **"Plan Your Expedition with a Free Consultation"** section.
3. [ ] **DISCOVERY TEST**: The Julian Kusi logo should be visibly larger than before (≈280 px wide vs 200 px).
4. [ ] **AESTHETICS CHECK**: Logo should not overflow its column, not clip adjacent text, and the gold drop-shadow should still look balanced.
5. [ ] **RESPONSIVE TEST**: Resize browser to ≤ 900 px – logo column should disappear (hidden by existing media query), no broken layout.
6. [ ] **ERROR CHECK**: No console errors in DevTools.

**Success Criteria:**
- [ ] Logo is noticeably larger on desktop
- [ ] Layout remains balanced (two-column grid intact)
- [ ] No overflow or clipping
- [ ] Mobile layout unaffected

---

## 6. Coverage Requirements
- Not applicable for a CSS-only change. No JavaScript logic is added.

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] `src/components/CTA.astro` updated with `width="280"` attribute and `.cta-logo { width: 280px }` CSS
- [ ] Astro build succeeds
- [ ] Manual verification script completed successfully – logo is larger and aesthetically balanced
- [ ] No regressions in existing layout (desktop and mobile)
- [ ] Naming conventions preserved (no new files, existing class names retained)
