# Feature Specification: Add Testimonials 6 & 7

## 1. Design Analysis
**Target Scope:** `apps/visual_workflow` equivalent → This is an Astro static site (`aconcagua` repo), not the React/NestJS monorepo. The target scope is the root Astro project.

**Affected Layers:** UI (Testimonials carousel component), i18n translation files (ES, EN, ZH)

**Problem Statement:** Two new real testimonials need to be added to the testimonials carousel — Carlos Mendoza (Colombia) as testimonial #6 and Ana Paula Ferreira (Brazil) as testimonial #7 — without modifying the 4 existing testimonials (Marcelo #1, Catalina #2, Ricardo #3, Guiselle #5). All 3 language versions (ES, EN, ZH) must display appropriate translations.

**Solution Strategy:** Add translated strings for `testimonials.6.*` and `testimonials.7.*` to all three i18n files (`es.ts`, `en.ts`, `zh.ts`), then register both new testimony entries in `Testimonials.astro` so the carousel picks them up automatically.

**Entry Point / Exposure:**
- UI Feature: Testimonials section (`#testimonios`) — existing carousel in `src/components/Testimonials.astro`. The new cards are rendered as the 5th and 6th slides in the carousel, navigable via prev/next buttons and dots.

**User Story:** As a website visitor, I want to read Carlos Mendoza's and Ana Paula Ferreira's testimonials in my preferred language (ES/EN/ZH), so that I can see authentic social proof from real clients of Julián Kusi.

---

## 2. Architecture & Data

### Architecture
```
i18n files (es.ts / en.ts / zh.ts)
       │  add testimonials.6.* and testimonials.7.* keys
       ▼
Testimonials.astro  ──  t('testimonials.6.*') and t('testimonials.7.*') lookups
       │  push two new entries to testimonials[]
       ▼
TestimonialCard.astro  ──  renders name, location, text, photo/initials
       │
       ▼
carousel-track  ──  5th and 6th slides, dot & nav auto-generated from array length
```

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [x] Shared Domain Types: i18n string maps updated in `src/i18n/es.ts`, `en.ts`, `zh.ts`

---

## 3. Implementation Plan

### Affected Files

- `src/i18n/es.ts` (Modify — add `testimonials.6.*` and `testimonials.7.*` keys in Spanish)
- `src/i18n/en.ts` (Modify — add `testimonials.6.*` and `testimonials.7.*` keys in English)
- `src/i18n/zh.ts` (Modify — add `testimonials.6.*` and `testimonials.7.*` keys in Chinese)
- `src/components/Testimonials.astro` (Modify — append testimony 6 and 7 objects to `testimonials[]` array)

### Execution Steps

**Phase 1: i18n Translations (TDD — N/A for static strings, verified via build)**
- [ ] Add Spanish keys `testimonials.6.*` and `testimonials.7.*` to `src/i18n/es.ts`
- [ ] Add English translation keys to `src/i18n/en.ts`
- [ ] Add Chinese translation keys to `src/i18n/zh.ts`

**Phase 2: Component Registration**
- [ ] Append testimony 6 object to `testimonials[]` array in `src/components/Testimonials.astro`
  - `name`: `t('testimonials.6.name')`
  - `location`: `t('testimonials.6.location')`
  - `summitDate`: `undefined`
  - `text`: `t('testimonials.6.text')`
  - `initials`: `'CM'`
  - `photo`: `undefined` (no photo provided — initials fallback)
  - `photoAlt`: `t('testimonials.6.name')`
- [ ] Append testimony 7 object to `testimonials[]` array in `src/components/Testimonials.astro`
  - `name`: `t('testimonials.7.name')`
  - `location`: `t('testimonials.7.location')`
  - `summitDate`: `undefined`
  - `text`: `t('testimonials.7.text')`
  - `initials`: `'AF'`
  - `photo`: `undefined` (no photo provided — initials fallback)
  - `photoAlt`: `t('testimonials.7.name')`

**Phase 3: Integration & Exposure**
- [ ] Carousel dots and navigation auto-scale to array length — no additional wiring needed
- [ ] `TestimonialCard.astro` renders initials fallback when `photo` is `undefined` — no changes needed

**Phase 4: Quality & Validation**
- [ ] Run build: `npm run build` → all pages built successfully, no errors

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
- [ ] Astro build completes without errors
- [ ] All pages built (ES, EN, ZH + sub-pages)
- [ ] No TypeScript compilation errors
- [ ] Existing 4 testimonials untouched

---

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] Dependencies installed: `npm install`

**Steps:**
1. [ ] Start dev server: `npm run dev`
2. [ ] Open `http://localhost:4321` (ES version)
3. [ ] Navigate to `#testimonios` section
4. [ ] Click forward (→) until slide 5 (Carlos Mendoza) and slide 6 (Ana Paula Ferreira) appear
5. [ ] Verify initials avatars 'CM' and 'AF' render correctly
6. [ ] Open `http://localhost:4321/en` — verify English translations
7. [ ] Open `http://localhost:4321/zh` — verify Chinese translations
8. [ ] Confirm existing slides 1–5 are unchanged

**Success Criteria:**
- [ ] Testimony 6 (Carlos Mendoza, Colombia) appears as 5th carousel slide
- [ ] Testimony 7 (Ana Paula Ferreira, Brazil) appears as 6th carousel slide
- [ ] Initials avatars 'CM' and 'AF' display correctly
- [ ] Text displayed in correct language per site language
- [ ] Existing testimonials 1, 2, 3, 5 are unchanged
- [ ] No console errors

---

## 6. Translations Summary

| Key | ES | EN | ZH |
|-----|----|----|-----|
| `testimonials.6.name` | Carlos Mendoza | Carlos Mendoza | Carlos Mendoza |
| `testimonials.6.location` | Colombia | Colombia | 哥伦比亚 |
| `testimonials.6.text` | Original Spanish | English translation | Chinese translation |
| `testimonials.7.name` | Ana Paula Ferreira | Ana Paula Ferreira | Ana Paula Ferreira |
| `testimonials.7.location` | Brasil | Brazil | 巴西 |
| `testimonials.7.text` | Original Spanish | English translation | Chinese translation |

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] Testimony 6 (Carlos Mendoza) added with initials fallback avatar
- [ ] Testimony 7 (Ana Paula Ferreira) added with initials fallback avatar
- [ ] All 3 language files updated (ES original, EN translation, ZH translation)
- [ ] Existing testimonials 1, 2, 3, 5 not modified
- [ ] No dummy/placeholder text in any testimonial
- [ ] Astro build succeeds with 0 errors
- [ ] No regression in existing testimonials
