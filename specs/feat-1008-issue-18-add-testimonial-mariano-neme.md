# Feature Specification: Add Mariano Neme Testimonial (Testimony 6)

## 1. Design Analysis
**Target Scope:** `apps/visual_workflow` equivalent → This is an Astro static site (`aconcagua` repo), not the React/NestJS monorepo. The target scope is the root Astro project.

**Affected Layers:** UI (Testimonials carousel component), i18n translation files (ES, EN, ZH)

**Problem Statement:** A new real testimonial from Mariano Neme (Argentina) needs to be added to the testimonials carousel. All 3 language versions of the site (ES, EN, ZH) must display appropriate translations.

**Solution Strategy:** Add translated strings for `testimonials.6.*` to all three i18n files (`es.ts`, `en.ts`, `zh.ts`), then register the new testimony entry in `Testimonials.astro` so the carousel picks it up automatically.

**Entry Point / Exposure:**
- UI Feature: Testimonials section (`#testimonios`) — existing carousel in `src/components/Testimonials.astro`. The new card is rendered as the 5th slide in the carousel (index 4), navigable via prev/next buttons and dots.

**User Story:** As a website visitor, I want to read Mariano Neme's testimonial in my preferred language (ES/EN/ZH), so that I can see authentic social proof from real clients of Julián Kusi.

---

## 2. Architecture & Data

### Architecture
```
i18n files (es.ts / en.ts / zh.ts)
       │  add testimonials.6.* keys
       ▼
Testimonials.astro  ──  t('testimonials.6.*') lookups
       │  push new entry to testimonials[]
       ▼
TestimonialCard.astro  ──  renders name, location, text, photo
       │
       ▼
carousel-track  ──  5th slide, dot & nav auto-generated from array length
```

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [x] Shared Domain Types: i18n string maps updated in `src/i18n/es.ts`, `en.ts`, `zh.ts`

---

## 3. Implementation Plan

### Affected Files

- `src/i18n/es.ts` (Modify — add `testimonials.6.name`, `testimonials.6.location`, `testimonials.6.text` in Spanish original after testimonials.5.*)
- `src/i18n/en.ts` (Modify — add `testimonials.6.name`, `testimonials.6.location`, `testimonials.6.text` English translation after testimonials.5.*)
- `src/i18n/zh.ts` (Modify — add `testimonials.6.name`, `testimonials.6.location`, `testimonials.6.text` Chinese translation after testimonials.5.*)
- `src/components/Testimonials.astro` (Modify — append testimony 6 object to `testimonials[]` array after the Guiselle Fonsepi entry)

### Execution Steps

**Phase 1: i18n Translations (TDD — N/A for static strings, verified via build)**
- [x] Add Spanish original keys `testimonials.6.*` to `src/i18n/es.ts`
- [x] Add English translation keys `testimonials.6.*` to `src/i18n/en.ts`
- [x] Add Chinese translation keys `testimonials.6.*` to `src/i18n/zh.ts`

**Phase 2: Component Registration**
- [x] Append testimony 6 object to `testimonials[]` array in `src/components/Testimonials.astro` (after index 5 / Guiselle Fonsepi entry)
  - `name`: `t('testimonials.6.name')`
  - `location`: `t('testimonials.6.location')`
  - `summitDate`: `undefined` (no specific summit date mentioned)
  - `text`: `t('testimonials.6.text')`
  - `initials`: `'MN'`
  - `photo`: `undefined` (initials fallback — no photo available)
  - `photoAlt`: `t('testimonials.6.name')`

**Phase 3: Integration & Exposure**
- [x] Carousel dots and navigation auto-scale to array length — no additional wiring needed
- [x] `TestimonialCard.astro` renders `initials` fallback when `photo` is undefined — no changes needed

**Phase 4: Quality & Validation**
- [x] Run build: `npm run build` → verify pages built successfully, no errors

---

## 4. Automated Verification

### Verification Commands
```bash
# Build
npm run build

# Type check (via build)
npm run build
```

### Quality Gates
- [x] Astro build completes without errors
- [x] All pages built (ES, EN, ZH + sub-pages)
- [x] No TypeScript compilation errors
- [x] Existing testimonials untouched

---

## 5. Manual Verification Script

**Pre-conditions:**
- [x] Dependencies installed: `npm install`

**Steps:**
1. [ ] Start dev server: `npm run dev`
2. [ ] Open `http://localhost:4321` (ES version)
3. [ ] Navigate to `#testimonios` section
4. [ ] Click forward (→) until slide 5 appears — verify Mariano Neme card with initials MN
5. [ ] Open `http://localhost:4321/en` — navigate to testimonials, verify English translation
6. [ ] Open `http://localhost:4321/zh` — navigate to testimonials, verify Chinese translation
7. [ ] Confirm existing slides 1–4 are unchanged

**Success Criteria:**
- [ ] Testimony 6 (Mariano Neme, Argentina) appears as 5th carousel slide
- [ ] Initials "MN" displayed as avatar fallback
- [ ] Text displayed in correct language per site language
- [ ] Existing testimonials are unchanged
- [ ] No console errors

---

## 6. Translations Summary

| Key | ES | EN | ZH |
|-----|----|----|-----|
| `testimonials.6.name` | Mariano Neme | Mariano Neme | Mariano Neme |
| `testimonials.6.location` | Argentina | Argentina | 阿根廷 |
| `testimonials.6.text` | Spanish original | English translation | Chinese translation |

---

## 7. Acceptance Criteria

**Definition of Done:**
- [x] Testimony 6 added with real text
- [x] All 3 language files updated (ES original, EN translation, ZH translation)
- [x] Existing testimonials 1, 2, 3, 5 not modified
- [x] No dummy/placeholder testimonials added
- [x] Astro build succeeds with 0 errors
- [x] Initials fallback 'MN' used (no photo available)
- [x] No regression in existing testimonials
