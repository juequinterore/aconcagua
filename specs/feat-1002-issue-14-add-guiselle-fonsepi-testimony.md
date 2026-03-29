# Feature Specification: Add Guiselle Fonsepi Testimony (Testimony 5)

## 1. Design Analysis
**Target Scope:** `apps/visual_workflow` equivalent → This is an Astro static site (`aconcagua` repo), not the React/NestJS monorepo. The target scope is the root Astro project.

**Affected Layers:** UI (Testimonials carousel component), i18n translation files (ES, EN, ZH)

**Problem Statement:** A new real testimonial from Guiselle Fonsepi (Costa Rica) with a photo and Spanish original text needs to be added to the testimonials carousel, without modifying the 3 existing testimonials. All 3 language versions of the site (ES, EN, ZH) must display appropriate translations.

**Solution Strategy:** Add translated strings for `testimonials.5.*` to all three i18n files (`es.ts`, `en.ts`, `zh.ts`), then register the new testimony entry in `Testimonials.astro` so the carousel picks it up automatically.

**Entry Point / Exposure:**
- UI Feature: Testimonials section (`#testimonios`) — existing carousel in `src/components/Testimonials.astro`. The new card is rendered as the 4th slide in the carousel (index 3), navigable via prev/next buttons and dots.

**User Story:** As a website visitor, I want to read Guiselle Fonsepi's testimonial in my preferred language (ES/EN/ZH), so that I can see authentic social proof from real clients of Julián Kusi.

---

## 2. Architecture & Data

### Architecture
```
i18n files (es.ts / en.ts / zh.ts)
       │  add testimonials.5.* keys
       ▼
Testimonials.astro  ──  t('testimonials.5.*') lookups
       │  push new entry to testimonials[]
       ▼
TestimonialCard.astro  ──  renders name, location, text, photo
       │
       ▼
carousel-track  ──  4th slide, dot & nav auto-generated from array length
```

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [x] Shared Domain Types: i18n string maps updated in `src/i18n/es.ts`, `en.ts`, `zh.ts`

---

## 3. Implementation Plan

### Affected Files

- `src/i18n/es.ts` (Modify — add `testimonials.5.name`, `testimonials.5.location`, `testimonials.5.text` in Spanish original at ~line 99)
- `src/i18n/en.ts` (Modify — add `testimonials.5.name`, `testimonials.5.location`, `testimonials.5.text` English translation at ~line 99)
- `src/i18n/zh.ts` (Modify — add `testimonials.5.name`, `testimonials.5.location`, `testimonials.5.text` Chinese translation at ~line 99)
- `src/components/Testimonials.astro` (Modify — append testimony 5 object to `testimonials[]` array at ~line 38)

### Execution Steps

**Phase 1: i18n Translations (TDD — N/A for static strings, verified via build)**
- [x] Add Spanish original keys `testimonials.5.*` to `src/i18n/es.ts`
- [x] Add English translation keys `testimonials.5.*` to `src/i18n/en.ts`
- [x] Add Chinese translation keys `testimonials.5.*` to `src/i18n/zh.ts`

**Phase 2: Component Registration**
- [x] Append testimony 5 object to `testimonials[]` array in `src/components/Testimonials.astro` (after index 2 / Ricardo Peralta entry)
  - `name`: `t('testimonials.5.name')`
  - `location`: `t('testimonials.5.location')`
  - `summitDate`: `undefined` (no specific summit date mentioned)
  - `text`: `t('testimonials.5.text')`
  - `initials`: `'GF'`
  - `photo`: Firebase Storage URL for Guiselle's photo
  - `photoAlt`: `t('testimonials.5.name')`

**Phase 3: Integration & Exposure**
- [x] Carousel dots and navigation auto-scale to array length — no additional wiring needed
- [x] `TestimonialCard.astro` renders `photo` prop as `<img>` when provided — no changes needed

**Phase 4: Quality & Validation**
- [x] Run build: `npm run build` → ✅ 7 pages built successfully, no errors

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
- [x] All 7 pages built (ES, EN, ZH + sub-pages)
- [x] No TypeScript compilation errors
- [x] Existing 3 testimonials untouched

---

## 5. Manual Verification Script

**Pre-conditions:**
- [x] Dependencies installed: `npm install`

**Steps:**
1. [ ] Start dev server: `npm run dev`
2. [ ] Open `http://localhost:4321` (ES version)
3. [ ] Navigate to `#testimonios` section
4. [ ] Click forward (→) until slide 4 appears — verify Guiselle Fonsepi card with photo
5. [ ] Click "Leer más" if text is clamped — verify full Spanish text in modal
6. [ ] Open `http://localhost:4321/en` — navigate to testimonials, verify English translation
7. [ ] Open `http://localhost:4321/zh` — navigate to testimonials, verify Chinese translation
8. [ ] Confirm existing slides 1 (Marcelo), 2 (Catalina), 3 (Ricardo) are unchanged

**Success Criteria:**
- [ ] Testimony 5 (Guiselle Fonsepi, Costa Rica) appears as 4th carousel slide
- [ ] Photo loads correctly from Firebase Storage URL
- [ ] Text displayed in correct language per site language
- [ ] Existing 3 testimonials are unchanged
- [ ] No console errors

---

## 6. Translations Summary

| Key | ES | EN | ZH |
|-----|----|----|-----|
| `testimonials.5.name` | Guiselle Fonsepi | Guiselle Fonsepi | Guiselle Fonsepi |
| `testimonials.5.location` | Costa Rica | Costa Rica | 哥斯达黎加 |
| `testimonials.5.text` | Original Spanish | English translation | Chinese translation |

---

## 7. Acceptance Criteria

**Definition of Done:**
- [x] Testimony 5 added with real photo and real text
- [x] All 3 language files updated (ES original, EN translation, ZH translation)
- [x] Existing testimonials 1, 2, 3 not modified
- [x] No dummy/placeholder testimonials added
- [x] Astro build succeeds with 0 errors
- [x] Photo served from provided Firebase Storage URL
- [x] No regression in existing testimonials
