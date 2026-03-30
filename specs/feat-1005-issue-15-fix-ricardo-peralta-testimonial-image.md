# Feature Specification: Fix Ricardo Peralta Testimonial Image

## 1. Design Analysis
**Target Scope:** `apps/visual_workflow` — No, this is the Aconcagua website (Astro), specifically `src/components/Testimonials.astro`
**Affected Layers:** UI (Testimonials carousel component)
**Problem Statement:** Ricardo Peralta's testimonial card (testimonial #3) was missing its photo. The `photo` field was set to `undefined`, causing the testimonial card to fall back to showing initials ('RP') instead of the actual profile photo.
**Solution Strategy:** Set the `photo` property for testimonial #3 in `Testimonials.astro` to the correct Firebase Storage URL provided.
**Entry Point / Exposure:**
  - *UI Feature:* The testimonials carousel section on the landing page (`#testimonios`). Ricardo Peralta is the 3rd slide in the carousel.
**User Story:** As a site visitor, I want to see Ricardo Peralta's real photo in his testimonial card, so that the testimonial feels more authentic and trustworthy.

## 2. Architecture & Data
### Architecture
The testimonials data is hardcoded directly in `src/components/Testimonials.astro` as an array of objects. Each testimonial object includes a `photo` URL that is passed as a prop to `TestimonialCard.astro`. The fix is a single-line change in the data array.

```
Testimonials.astro (data array)
  → TestimonialCard.astro (photo prop)
    → <img> element rendered in carousel slide
```

### Data Changes
- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [ ] Shared Domain Types: None — only a hardcoded URL string in the component data array

## 3. Implementation Plan

### Affected Files

- `src/components/Testimonials.astro` (Modify — line ~36: change `photo: undefined` to the correct Firebase Storage URL for testimonial #3 / Ricardo Peralta)

### Execution Steps

**Phase 1: Identify the bug**
- [x] Locate testimonial #3 in `Testimonials.astro` — confirmed `photo: undefined` for Ricardo Peralta (initials 'RP')

**Phase 2: Apply fix**
- [x] Replace `photo: undefined` with the correct URL:
  `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/PHOTO-2026-03-23-23-37-24.jpg?alt=media&token=004ecdb3-7700-4258-86b6-d5798f6ff41c`

**Phase 3: Verify**
- [ ] Build the project and confirm no errors
- [ ] Visually verify the 3rd testimonial slide shows Ricardo Peralta's photo

## 4. Automated Verification
```bash
# Build
npm run build
# or
pnpm build
```

### Quality Gates
- [ ] Astro build completes without errors
- [ ] No TypeScript errors

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] Dependencies installed: `pnpm install`

1. [ ] Start development server: `pnpm dev` (or `npm run dev`)
2. [ ] Open browser to `http://localhost:4321`
3. [ ] Navigate to the Testimonials section (`#testimonios`)
4. [ ] Click through to the 3rd slide (Ricardo Peralta)
5. [ ] **VERIFY:** Ricardo Peralta's photo is displayed (not initials 'RP')
6. [ ] **VERIFY:** Other testimonials are unchanged (Marcelo, Catalina, Guiselle)

**Success Criteria:**
- [ ] Ricardo Peralta's photo is shown in his testimonial card
- [ ] All other testimonials remain unchanged
- [ ] No console errors

## 6. Coverage Requirements
- N/A — this is a single-line data fix with no logic changes

## 7. Acceptance Criteria

**Definition of Done:**
- [x] `photo` field for testimonial #3 (Ricardo Peralta) set to the correct Firebase URL
- [ ] Build passes without errors
- [ ] Visual verification confirms photo displays correctly
- [ ] No other testimonials were modified
- [ ] No dummy/fake testimonials added
