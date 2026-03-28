# Feature Specification: Update Testimonies Carousel Content

## 1. Design Analysis
**Target Scope:** `aconcagua` — Astro 5 static multilingual website (`src/`)
**Affected Layers:**
- UI / Presentation: `src/components/Testimonials.astro` (photo URLs + 4th testimony)
- i18n / Content: `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (testimony names, locations, and texts)

**Problem Statement:**
The testimonials carousel was displaying three placeholder/dummy testimonies (Marco Rossi from Italy, Sarah Kim from South Korea, James Walsh from United States) with fake text and no real photos. Real testimonies from actual clients need to replace them, and a fourth testimony must be added.

**Solution Strategy:**
Replace all dummy testimony data across the three i18n files (es, en, zh) with real client data provided in the issue. Update `Testimonials.astro` to reference Firebase Storage image URLs for testimonies 1–3 and use an initials fallback avatar for testimony 4 (no image provided). The carousel component itself does not need structural changes.

**Entry Point / Exposure:**
- *UI Features:* The `#testimonios` section on the landing page — accessible via the nav link "Testimonios" / "Testimonials" / "客户评价". The carousel is already wired into `App` / page layout.

**User Story:** As a site visitor, I want to read real testimonies from actual Aconcagua expedition clients (with their photos), so that I can trust the guide's expertise and make an informed decision.

---

## 2. Architecture & Data
### Architecture
The testimonials data flows through the i18n translation layer:

```
i18n files (es/en/zh.ts)
  → Testimonials.astro (reads via t() helper)
    → TestimonialCard.astro (renders name, location, text, photo/initials)
      → Browser (carousel with prev/next/dots navigation)
```

No backend, no API, no Zustand. Pure static content managed through the i18n translation keys and the component's data array.

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [x] Shared Domain Types: None — only i18n string values and component photo props changed

---

## 3. Implementation Plan

### Affected Files

- `src/i18n/es.ts` (Modify — replace testimonials.1–3 keys, add testimonials.4 keys at lines ~90–101)
- `src/i18n/en.ts` (Modify — replace testimonials.1–3 keys with English translations, add testimonials.4 keys at lines ~90–101)
- `src/i18n/zh.ts` (Modify — replace testimonials.1–3 keys with Chinese translations, add testimonials.4 keys at lines ~90–101)
- `src/components/Testimonials.astro` (Modify — update photo URLs to Firebase Storage, update initials, add 4th testimony entry at lines ~11–36)

### Testimony Data Summary

| # | Name | Country | Image |
|---|------|---------|-------|
| 1 | Julio Catillo | Bolivia | Firebase Storage: `Julio.jpg` |
| 2 | Marcelo Simionato | Argentina | Firebase Storage: `Marcelo.jpg` |
| 3 | Catalina Caicedo | Chile | Firebase Storage: `Cata.jpg` |
| 4 | Ricardo Peralta | Costa Rica | None (initials fallback: "RP") |

### Execution Steps

**Phase 1: Content Update — i18n files (TDD: verify keys exist)**
- [x] **RED**: Confirm all 4 testimonials keys are present in each language file
- [x] **GREEN**: Update `src/i18n/es.ts` — testimonials 1–4 (names, locations, original Spanish texts)
- [x] **GREEN**: Update `src/i18n/en.ts` — testimonials 1–4 (English translations)
- [x] **GREEN**: Update `src/i18n/zh.ts` — testimonials 1–4 (Chinese translations)
- [x] **REFACTOR**: Verified exact text preserved for Spanish (es), translations for en and zh

**Phase 2: Component Update — Testimonials.astro**
- [x] **GREEN**: Replace `photo` fields with Firebase Storage URLs for testimonies 1–3
- [x] **GREEN**: Update `initials` fields to match new client initials (JC, MS, CC, RP)
- [x] **GREEN**: Add 4th testimony entry (Ricardo Peralta, no photo → `undefined`, initials `RP`)
- [x] **REFACTOR**: Confirmed no structural changes needed to carousel JS or TestimonialCard

**Phase 3: Integration & Exposure**
- [x] **COMPONENT RENDERING**: Carousel already wired in the existing page layout — 4th slide automatically renders from the new array entry
- [x] **USER DISCOVERY**: Accessible via "Testimonios" nav link on the landing page

**Phase 4: Quality & Validation**
- [x] Run `npx astro check` — 0 errors, 0 warnings (10 pre-existing hints)
- [ ] Run `npm run build` — requires installed Astro dev environment

---

## 4. Automated Verification

```bash
# Type check (Astro)
npx astro check

# Build
npm run build

# Preview
npm run preview
```

### Quality Gates
- [x] `astro check` passes with 0 errors
- [ ] Build completes without errors
- [ ] All 4 slides render in browser carousel
- [ ] Firebase Storage images load for testimonies 1–3
- [ ] Testimony 4 shows "RP" initials avatar (no image)
- [ ] Carousel dots show 4 indicators (previously 3)

---

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` completed
- [ ] Firebase Storage bucket `aconcagua-co.firebasestorage.app` is publicly accessible

**Steps:**
1. [ ] `npm run dev` → open `http://localhost:4321`
2. [ ] Scroll to the Testimonios section
3. [ ] **Slide 1**: Julio Catillo — Bolivia — "Muy buenos vídeos" — photo of Julio
4. [ ] **Slide 2**: Marcelo Simionato — Argentina — long Spanish text — photo of Marcelo
5. [ ] **Slide 3**: Catalina Caicedo — Chile — long Spanish text — photo of Catalina
6. [ ] **Slide 4**: Ricardo Peralta — Costa Rica — short text — "RP" initials avatar
7. [ ] Carousel dots show 4 dots; prev/next buttons navigate between all 4
8. [ ] Switch language to English (`/en`) — verify translated texts render
9. [ ] Switch language to Chinese (`/zh`) — verify Chinese texts render

**Success Criteria:**
- [ ] All 4 real testimonies visible with correct names, countries, and texts
- [ ] Firebase Storage photos load for slides 1–3 (circular, bordered)
- [ ] Slide 4 shows "RP" initials avatar fallback
- [ ] No broken images or console errors
- [ ] Carousel navigation works for all 4 slides

---

## 6. Coverage Requirements
- No automated tests required for static i18n content changes
- Manual visual verification is the primary QA gate

---

## 7. Acceptance Criteria

**Definition of Done:**
- [x] All 3 dummy testimonies replaced with real client data
- [x] 4th testimony (Ricardo Peralta) added
- [x] Firebase Storage image URLs used for testimonies 1–3
- [x] `initials` updated to match new client names
- [x] i18n updated for Spanish (original), English (translated), Chinese (translated)
- [x] `astro check` passes with 0 errors
- [ ] Build passes (`npm run build`)
- [ ] Manual verification script completed
- [x] No regressions in carousel JS logic (untouched)
- [x] `TestimonialCard.astro` unchanged (no structural changes needed)
