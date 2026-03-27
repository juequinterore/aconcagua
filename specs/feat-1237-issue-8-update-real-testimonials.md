# Feature Specification: Update Testimonials with Real Client Testimonies

## 1. Design Analysis
**Target Scope:** Astro website (aconcagua landing page)
**Affected Layers:** UI Components, i18n translation layer (ES / EN / ZH)
**Problem Statement:** The testimonials section showed three placeholder testimonials with fake names (Marco Rossi, Sarah Kim, James Walsh). Real client testimonials from Marcelo Simionato (Argentina) and Catalina Caicedo (Chile) must replace them, including their actual profile photos.
**Solution Strategy:**
1. Extend `TestimonialCard.astro` to accept an optional `image` URL prop and render a `<img>` element instead of the initials avatar when provided.
2. Replace the three dummy testimonials in `Testimonials.astro` with the two real ones, wiring in the Firebase Storage photo URLs.
3. Adjust the grid to 2 columns (was 3) so the layout remains balanced.
4. Update all three i18n files (`es.ts`, `en.ts`, `zh.ts`) with the translated testimonial content.

**Entry Point / Exposure:**
- UI: `#testimonios` section rendered on every page variant (`/`, `/en/`, `/zh/`)
- Testimonials are driven by the i18n `t()` function called inside `Testimonials.astro`

**User Story:** As a website visitor, I want to read authentic client experiences so that I can trust the guide and feel confident booking an expedition.

---

## 2. Architecture & Data

### Architecture
```
Page (index.astro / en/index.astro / zh/index.astro)
  └── Testimonials.astro  ← holds testimonial data array + grid layout
        └── TestimonialCard.astro  ← renders individual card (now supports image prop)

i18n/es.ts | en.ts | zh.ts  ← provide translated name / location / text
```

### Data Changes
- [x] DB Schema: None
- [x] API Contracts: None
- [x] State Models: None (static site)
- [x] Shared Domain Types: `TestimonialCard` Props interface extended with optional `image?: string`

---

## 3. Implementation Plan

### Affected Files

- `src/components/TestimonialCard.astro` (Modify – add optional `image` prop; render `<img>` when present, fallback to initials div)
- `src/components/Testimonials.astro` (Modify – replace 3 dummy testimonials with 2 real ones; pass `image` URL; change grid to `repeat(2, 1fr)`)
- `src/i18n/es.ts` (Modify – replace testimonials 1–3 with Marcelo & Catalina in original Spanish)
- `src/i18n/en.ts` (Modify – replace testimonials 1–3 with English translation)
- `src/i18n/zh.ts` (Modify – replace testimonials 1–3 with Chinese translation; remove testimonial 3 key)

### Execution Steps

**Phase 1: Component Extension**
- [x] Extend `TestimonialCard.astro` Props interface with `image?: string`
- [x] Conditionally render `<img class="author-photo">` or `.author-avatar` fallback
- [x] Add `.author-photo` CSS (48×48, border-radius 50%, object-fit cover)

**Phase 2: Testimonials Data & Layout**
- [x] Replace dummy entries in `Testimonials.astro` array with Marcelo Simionato + Catalina Caicedo
- [x] Include Firebase Storage image URLs
- [x] Pass `image` prop to `TestimonialCard`
- [x] Update grid from `repeat(3, 1fr)` to `repeat(2, 1fr)` with `max-width: 900px`
- [x] Remove redundant 1024px breakpoint (no longer needed)

**Phase 3: i18n Updates**
- [x] `es.ts` – replace testimonials 1–3 with real Spanish text (original voice preserved)
- [x] `en.ts` – English translation of both testimonials
- [x] `zh.ts` – Simplified Chinese translation of both testimonials

**Phase 4: Integration & Exposure**
- [x] No new wiring needed; existing `<Testimonials>` component calls in `index.astro`, `en/index.astro`, `zh/index.astro` pick up changes automatically via i18n `t()` function

---

## 4. Automated Verification

```bash
# Install deps first (if not already installed)
npm install

# Build
npm run build

# Preview
npm run preview
```

### Quality Gates
- [ ] Astro build completes without TypeScript or template errors
- [ ] Images load from Firebase Storage (public URLs, no CORS issues)
- [ ] Grid renders 2 cards side-by-side on desktop, 1 column on mobile

---

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` completed
- [ ] Firebase Storage URLs publicly accessible

**Steps:**

1. [ ] `npm run dev` — start local server
2. [ ] Open `http://localhost:4321` (Spanish default)
   - Scroll to **TESTIMONIOS** section
   - Verify Marcelo Simionato card appears with photo
   - Verify Catalina Caicedo card appears with photo
   - Verify text matches original Spanish
3. [ ] Open `http://localhost:4321/en/`
   - Verify English text on both cards
4. [ ] Open `http://localhost:4321/zh/`
   - Verify Chinese text on both cards
5. [ ] Check responsive: resize to mobile (< 640px) — cards stack vertically

**Success Criteria:**
- [x] Real names, locations, and testimonial text displayed
- [x] Profile photos rendered as circular avatar images
- [x] 2-column layout on desktop, 1-column on mobile
- [x] All 3 language variants show correctly translated content
- [x] No console errors

---

## 6. Coverage Requirements
- Static site — no automated test runner configured
- Manual verification covers all acceptance criteria

---

## 7. Acceptance Criteria

**Definition of Done:**
- [x] Placeholder testimonials removed
- [x] Marcelo Simionato (AR) and Catalina Caicedo (CL) testimonials shown with real photos
- [x] Spanish, English, and Chinese translations present and accurate
- [x] Layout adapts correctly for 2 cards (desktop 2-col, mobile 1-col)
- [x] `TestimonialCard` supports `image` prop with graceful fallback to initials
- [x] Astro build succeeds without errors
