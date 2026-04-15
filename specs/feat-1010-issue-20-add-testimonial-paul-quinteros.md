# Feature Specification: Add Testimonial — Paul Quinteros (Ecuador)

## 1. Design Analysis
**Target Scope:** `apps/visual_workflow` → actually this is an Astro static site at the root of the workspace.
**Affected Layers:** UI (Testimonials carousel), i18n translations (es, en, zh)
**Problem Statement:** A new client testimonial from Paul Quinteros (Ecuador) must be added to the testimonials carousel displayed on the website.
**Solution Strategy:** Add the testimonial data to the three i18n translation files (`es.ts`, `en.ts`, `zh.ts`) under key `testimonials.7.*`, then register the new entry in the `Testimonials.astro` component array.
**Entry Point / Exposure:**
  - *UI Features:* The testimonial appears in the `#testimonios` carousel section on all language variants of the index page (`/`, `/en/`, `/zh/`). Users navigate to it via the carousel's next/prev buttons or dot indicators.
**User Story:** As a website visitor, I want to read Paul Quinteros's testimonial so that I can learn about real client experiences with Julián Kusi.

## 2. Architecture & Data
### Architecture
```
i18n/{es,en,zh}.ts  →  Testimonials.astro (t() lookup)  →  TestimonialCard.astro  →  Carousel DOM
```
The `Testimonials.astro` component holds a static array of testimonial objects. Each object reads its copy via the `t()` i18n helper. Adding a new testimonial requires:
1. New translation keys in all three locale files.
2. A new entry in the array inside `Testimonials.astro`.

### Data Changes
- [ ] DB Schema: None
- [x] API Contracts: None (static site)
- [x] State Models: New testimonial object in `Testimonials.astro` array (index 7)
- [x] Shared Domain Types: None

## 3. Implementation Plan

### Affected Files (COMPLETE)
- `src/i18n/es.ts` (Modify — add `testimonials.7.*` keys after line ~105)
- `src/i18n/en.ts` (Modify — add `testimonials.7.*` keys with English translation after line ~105)
- `src/i18n/zh.ts` (Modify — add `testimonials.7.*` keys with Chinese translation after line ~105)
- `src/components/Testimonials.astro` (Modify — add new testimonial object to array after line ~56)

### Execution Steps

**Phase 1: i18n Translations (TDD — static site, no test runner for i18n)**
- [x] Add `testimonials.7.name`, `testimonials.7.location`, `testimonials.7.text` to `src/i18n/es.ts`
- [x] Add same keys (English translation) to `src/i18n/en.ts`
- [x] Add same keys (Chinese translation) to `src/i18n/zh.ts`

**Phase 2: Component Registration**
- [x] Add testimonial object `{ name, location, summitDate: undefined, text, initials: 'PQ', photo: <firebase_url>, photoAlt }` to the `testimonials` array in `src/components/Testimonials.astro`

**Phase 3: Integration & Exposure**
- [x] New carousel slide rendered automatically by `testimonials.map(...)` loop — no additional wiring needed.
- [x] Photo URL: `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/Paul%20Quinteros.jpg?alt=media&token=37a8760e-cb6b-4379-89cf-b2c466d09849`

**Phase 4: Quality & Validation**
- [ ] Run build: `npm run build` or `pnpm build`
- [ ] Manual verification: start dev server and navigate to `#testimonios` carousel

## 4. Automated Verification
```bash
# Build
pnpm build

# Type check (if configured)
pnpm astro check
```

### Quality Gates
- [ ] TypeScript compilation succeeds with no errors
- [ ] Build completes without errors
- [ ] All three locale files contain `testimonials.7.*` keys

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] Dependencies installed: `pnpm install`

**Steps:**
1. [ ] Start development server: `pnpm dev`
2. [ ] Open browser to `http://localhost:4321`
3. [ ] Navigate to `#testimonios` section
4. [ ] Click "next" button until Paul Quinteros slide appears
5. [ ] Verify: name "Paul Quinteros", location "Ecuador", photo displayed, Spanish text correct
6. [ ] Switch to `/en/` URL, verify English translation renders
7. [ ] Switch to `/zh/` URL, verify Chinese translation renders

**Success Criteria:**
- [ ] Paul Quinteros slide appears in carousel for all three languages
- [ ] Photo loads from Firebase Storage URL
- [ ] No console errors

## 6. Coverage Requirements
- Static site — no automated test coverage tooling required for i18n additions.

## 7. Acceptance Criteria

**Definition of Done:**
- [x] `testimonials.7.*` keys present in `es.ts`, `en.ts`, `zh.ts`
- [x] Testimonial object added to `Testimonials.astro` array with correct initials `PQ`, photo URL, and undefined `summitDate`
- [ ] Build passes without errors
- [ ] Manual verification confirms carousel slide is visible and correct
- [x] No regressions in existing testimonials (1, 2, 3, 5, 6)
- [x] Naming conventions followed (key pattern `testimonials.N.field`)
