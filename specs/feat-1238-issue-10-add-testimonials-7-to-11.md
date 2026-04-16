# Feature Specification: Add Testimonials 7–11

## 1. Design Analysis
**Target Scope:** `apps/visual_workflow` → N/A. This is an Astro static site at the project root (`/`), not a monorepo sub-app. Affected scope: site root Astro project.

**Affected Layers:**
- UI component (`src/components/Testimonials.astro`)
- i18n data layer (`src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`)

**Problem Statement:**
The testimonials carousel only contains 5 entries (testimonials 1–3, 5, 6). The client has provided 5 additional testimonials (7–11) with names, countries, text, and Firebase-hosted photos that need to be added to the carousel.

**Solution Strategy:**
Follow the existing pattern: add i18n translation keys for each new testimonial in all three language files (ES, EN, ZH), then append corresponding entries to the `testimonials` array in `Testimonials.astro`.

**Entry Point / Exposure:**
- UI: Existing `#testimonios` section on the home page, rendered via the `Testimonials.astro` carousel. New slides are automatically rendered by the `testimonials.map()` loop — no additional wiring needed.

**User Story:**
As a site visitor, I want to read more client testimonials, so that I can gain confidence in Julián's guiding and content quality before booking a consultation.

---

## 2. Architecture & Data

### Architecture
```
i18n/{es,en,zh}.ts  (new keys for testimonials 7-11)
        ↓
Testimonials.astro  (new array entries referencing t('testimonials.N.*'))
        ↓
TestimonialCard.astro  (no changes — consumed via existing props)
        ↓
Carousel DOM  (auto-generates new slides + dots via .map())
```

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [ ] Shared Domain Types: None — i18n string additions only

---

## 3. Implementation Plan

### Affected Files

- `src/i18n/es.ts` (Modify — add keys `testimonials.7.*` through `testimonials.11.*` before `testimonials.readMore`)
- `src/i18n/en.ts` (Modify — same keys, English translations/transliterations)
- `src/i18n/zh.ts` (Modify — same keys, Chinese translations)
- `src/components/Testimonials.astro` (Modify — append 5 new objects to `testimonials` array, lines ~44–52)

### Execution Steps

**Phase 1: i18n Data (ES / EN / ZH)**
- [ ] Add `testimonials.7.name/location/text` through `testimonials.11.name/location/text` to `es.ts` (original Spanish text)
- [ ] Add same keys to `en.ts` (English translations)
- [ ] Add same keys to `zh.ts` (Chinese translations)

**Phase 2: Testimonials Component**
- [ ] Append 5 new objects to the `testimonials` array in `Testimonials.astro`:
  - Testimony 7: Diego Morales / Perú / DM initials / Firebase photo #1
  - Testimony 8: Sofía Ramírez / México / SR initials / Firebase photo #2
  - Testimony 9: James O'Connor / Irlanda / JO initials / Firebase photo #3
  - Testimony 10: Andrés Salazar / Colombia / AS initials / Firebase photo #4
  - Testimony 11: Lucas Tanaka / Brasil / LT initials / Firebase photo #5 (same as #1)

**Phase 3: Integration & Exposure (Automatic)**
- The carousel `testimonials.map()` automatically generates new slides and dots — no additional wiring required.
- Dot navigation updates automatically because `total = slides.length` is dynamic.

**Phase 4: Quality & Validation**
- [ ] Run `npm run build` (or `pnpm build`) in project root
- [ ] Verify no TypeScript / Astro compilation errors
- [ ] Start dev server and visually verify new slides appear and are navigable

---

## 4. Automated Verification

```bash
# From project root
npm run build

# Dev check
npm run dev
# Open http://localhost:4321 → scroll to #testimonios → navigate carousel
```

### Quality Gates
- [ ] Build completes without errors
- [ ] All 11 testimonial slides render (5 original + 5 new → carousel total 10, note testimonial 4 was intentionally skipped)
- [ ] Photos load from Firebase Storage URLs
- [ ] Navigation dots count matches slide count
- [ ] Carousel swipe / button nav works for new slides

---

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` (already done)

1. [ ] `npm run dev`
2. [ ] Open `http://localhost:4321`
3. [ ] Scroll to the **Testimonios** section
4. [ ] Click **Next** arrow until all slides have been seen — confirm slides 7–11 appear
5. [ ] Verify each new slide shows: name, country, photo, and correct testimonial text
6. [ ] Test in English (`/en`) and Chinese (`/zh`) routes to confirm translations appear
7. [ ] Test touch swipe on mobile viewport

**Success Criteria:**
- [ ] 10 dots visible in the carousel navigation (5 existing + 5 new)
- [ ] Each new testimonial card shows the correct photo, name, location, and text
- [ ] No broken image placeholders
- [ ] No console errors

---

## 6. Coverage Requirements
- No unit test infrastructure exists for Astro components in this project
- Visual / manual verification is the primary validation method

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] Testimonials 7–11 visible in the carousel on the home page
- [ ] Translations present for ES, EN, ZH
- [ ] Firebase-hosted photos load correctly
- [ ] Carousel navigation (arrows, dots, swipe) works with the updated count
- [ ] Build passes without errors
- [ ] No regressions in existing testimonials 1–6
