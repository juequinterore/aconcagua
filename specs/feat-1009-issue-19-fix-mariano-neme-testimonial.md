# Feature Specification: Fix Mariano Neme's Testimonial (Photo + Text)

## 1. Design Analysis
**Target Scope:** Root Astro static site (`aconcagua` repo) — `src/components/Testimonials.astro` and `src/i18n/` translation files.

**Affected Layers:** UI (Testimonials carousel data), i18n translation files (ES, EN, ZH)

**Problem Statement:** Mariano Neme's testimonial (key `testimonials.6`) was added in issue #18 but contains two defects:
1. **Missing photo**: `photo` field is `undefined` — the real Firebase Storage photo URL is now available and must be set.
2. **Fake/dummy text**: All three i18n files contain a fabricated long text. The real testimonial text provided by Mariano is short and authentic: *"Groso total @julian_kusi , yo fui este año a Aconcagua y gran parte de la info de calidad la adquirí viendo el contenido en todas sus plataformas"*.

**Solution Strategy:**
1. Replace `photo: undefined` in `Testimonials.astro` with the real Firebase Storage URL.
2. Replace the dummy ES text in `src/i18n/es.ts` with the real testimonial verbatim.
3. Replace the dummy EN text in `src/i18n/en.ts` with a faithful English translation.
4. Replace the dummy ZH text in `src/i18n/zh.ts` with a faithful Chinese translation.
No structural changes are needed; only data corrections.

**Entry Point / Exposure:**
- UI Feature: Testimonials section (`#testimonios`) — existing carousel in `src/components/Testimonials.astro`. Mariano Neme's card is the 5th slide (index 4), navigable via prev/next buttons and dots.

**User Story:** As a website visitor, I want to see Mariano Neme's real photo and authentic testimonial text, so that the social proof is genuine and trustworthy.

---

## 2. Architecture & Data

### Architecture
```
i18n files (es.ts / en.ts / zh.ts)
       │  fix testimonials.6.text key (real text)
       ▼
Testimonials.astro  ──  fix photo field for testimonial 6 (MN)
       │
       ▼
TestimonialCard.astro  ──  renders real photo + real text
       │
       ▼
carousel-track  ──  5th slide, no structural changes needed
```

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [x] i18n string maps: Fix `testimonials.6.text` in `src/i18n/es.ts`, `en.ts`, `zh.ts`
- [x] Component data array: Fix `photo` field for testimonial 6 in `src/components/Testimonials.astro`

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

- `src/components/Testimonials.astro` (Modify — line ~54 — change `photo: undefined` to real Firebase Storage URL for testimonial 6 `MN`)
- `src/i18n/es.ts` (Modify — line ~105 — replace dummy Spanish text with the real testimonial verbatim)
- `src/i18n/en.ts` (Modify — line ~105 — replace dummy English text with faithful English translation)
- `src/i18n/zh.ts` (Modify — line ~105 — replace dummy Chinese text with faithful Chinese translation)

### Exact Values

**`src/components/Testimonials.astro` — photo field (line ~54)**
```
// BEFORE
photo: undefined,

// AFTER
photo: 'https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/Mariano%20Neme.jpg?alt=media&token=18adca49-1013-4bf3-8bd2-dda0af406b19',
```

**`src/i18n/es.ts` — testimonials.6.text (line ~105)**
```
// BEFORE (dummy)
'testimonials.6.text': 'Seguí los videos de Julián durante meses antes de mi expedición al Aconcagua. ...',

// AFTER (real)
'testimonials.6.text': 'Groso total @julian_kusi , yo fui este año a Aconcagua y gran parte de la info de calidad la adquirí viendo el contenido en todas sus plataformas',
```

**`src/i18n/en.ts` — testimonials.6.text (line ~105)**
```
// BEFORE (dummy)
'testimonials.6.text': 'I followed Julián\'s videos for months before my Aconcagua expedition. ...',

// AFTER (faithful translation)
'testimonials.6.text': 'Total legend @julian_kusi — I went to Aconcagua this year and most of the quality information I got was from watching the content on all your platforms',
```

**`src/i18n/zh.ts` — testimonials.6.text (line ~105)**
```
// BEFORE (dummy)
'testimonials.6.text': '在攀登阿空加瓜前，我跟随Julián的视频学习了好几个月。...',

// AFTER (faithful translation)
'testimonials.6.text': '@julian_kusi 真的太棒了，我今年去了阿空加瓜，大部分高质量的信息都是通过观看您在各个平台上的内容获得的',
```

### Execution Steps

**Phase 1: Fix Testimonials.astro (Component Data)**
- [ ] Open `src/components/Testimonials.astro`
- [ ] Locate testimonial 6 entry (`initials: 'MN'`) at line ~48–56
- [ ] Replace `photo: undefined` with the real Firebase Storage URL
- [ ] Verify no other fields are changed for this entry

**Phase 2: Fix i18n Text — Spanish (Real testimonial verbatim)**
- [ ] Open `src/i18n/es.ts`
- [ ] Locate `'testimonials.6.text'` at line ~105
- [ ] Replace dummy text with real text verbatim: `'Groso total @julian_kusi , yo fui este año a Aconcagua y gran parte de la info de calidad la adquirí viendo el contenido en todas sus plataformas'`

**Phase 3: Fix i18n Text — English (Faithful translation)**
- [ ] Open `src/i18n/en.ts`
- [ ] Locate `'testimonials.6.text'` at line ~105
- [ ] Replace dummy text with: `'Total legend @julian_kusi — I went to Aconcagua this year and most of the quality information I got was from watching the content on all your platforms'`

**Phase 4: Fix i18n Text — Chinese (Faithful translation)**
- [ ] Open `src/i18n/zh.ts`
- [ ] Locate `'testimonials.6.text'` at line ~105
- [ ] Replace dummy text with: `'@julian_kusi 真的太棒了，我今年去了阿空加瓜，大部分高质量的信息都是通过观看您在各个平台上的内容获得的'`

**Phase 5: Integration & Exposure (The "Glue" - MANDATORY)**

- [ ] **COMPONENT DATA**: `src/components/Testimonials.astro` line ~54
  - Change: `photo: undefined` → `photo: 'https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/Mariano%20Neme.jpg?alt=media&token=18adca49-1013-4bf3-8bd2-dda0af406b19'`
- [ ] **USER DISCOVERY**: No structural changes needed. Carousel and dots auto-scale from array length. Testimonial 6 is already wired in as the 5th slide.

**Phase 6: Quality & Validation**
- [ ] Run build: `npm run build`
- [ ] Visually verify the 5th carousel slide shows Mariano Neme's photo and real short text
- [ ] Check all 3 language routes: `/`, `/en`, `/zh`

---

## 4. Automated Verification

### Verification Commands
```bash
# Build (Astro)
npm run build

# Dev server for manual check
npm run dev
```

### Quality Gates
- [ ] Astro build completes with zero errors
- [ ] TypeScript compilation succeeds with no errors
- [ ] All pages built (ES, EN, ZH)
- [ ] No regressions in existing testimonials 1–5
- [ ] Linter shows ZERO issues

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] Dependencies installed: `npm install`

**Steps:**

1. [ ] Start dev server: `npm run dev`
2. [ ] Open browser to `http://localhost:4321` (ES version)
3. [ ] **DISCOVERY TEST**: Scroll to `#testimonios` section
4. [ ] Navigate forward (→) to slide 5 (Mariano Neme, Argentina)
5. [ ] **PHOTO TEST**: Verify real photo of Mariano Neme is displayed (not initials `MN`)
6. [ ] **TEXT TEST**: Verify text reads: *"Groso total @julian_kusi , yo fui este año a Aconcagua..."*
7. [ ] Open `http://localhost:4321/en` → navigate to testimonials slide 5 → verify English translation
8. [ ] Open `http://localhost:4321/zh` → navigate to testimonials slide 5 → verify Chinese translation
9. [ ] Verify slides 1–4 are completely unchanged

**Success Criteria:**
- [ ] Slide 5 shows Mariano Neme's real photo (Firebase Storage URL)
- [ ] Real authentic short text displayed in each language
- [ ] No initials fallback (photo loads correctly)
- [ ] Existing testimonials unchanged
- [ ] No console errors

---

## 6. Coverage Requirements
- [ ] No new test files needed (pure data/content fix)
- [ ] Astro build acts as type-check and integration verification
- [ ] Manual visual verification confirms photo and text correctness

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] `photo` field for testimonial 6 (`MN`) set to real Firebase Storage URL
- [ ] `testimonials.6.text` in `es.ts` is the real verbatim testimonial (not dummy)
- [ ] `testimonials.6.text` in `en.ts` is a faithful English translation (not dummy)
- [ ] `testimonials.6.text` in `zh.ts` is a faithful Chinese translation (not dummy)
- [ ] All other fields (`name`, `location`, `initials`, `summitDate`) remain unchanged
- [ ] No other testimonials modified
- [ ] Astro build succeeds with 0 errors
- [ ] No regressions in existing features
