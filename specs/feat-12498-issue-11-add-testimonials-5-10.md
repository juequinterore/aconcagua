# Feature Specification: Add Testimonials 4–10

## 1. Design Analysis

**Target Scope:** `aconcagua` — Astro 5 static multilingual website (`src/`)

**Affected Layers:**
- i18n: Add testimonial entries 4–10 to `es.ts`, `en.ts`, `zh.ts`
- UI / Presentation: `Testimonials.astro` — extend the testimonials array with new entries

**Problem Statement:**
The testimonials carousel currently shows only 3 client testimonials. Adding more testimonials (up to 10 total) strengthens social proof and demonstrates the breadth of Julian Kusi's international clientele.

**Solution Strategy:**
Add 7 new testimonial entries (4–10) to all three locale files and register them in the `Testimonials.astro` component array.

**Entry Point:**
`Testimonials.astro` and all three locale files.

**User Story:**
> As a prospective expedition client, I want to see many genuine testimonials from climbers of various nationalities, so that I can trust the guide's reputation and expertise.

---

## 2. Architecture & Data

### Architecture

No structural changes — the existing `TestimonialCard.astro` component and carousel JS remain unchanged. Only data (i18n keys + Testimonials array) is extended.

### Data Changes
- [ ] DB Schema: **None**
- [ ] API Contracts: **None**
- [ ] State Models: **None**
- [ ] i18n Keys: Add `testimonials.4.*` through `testimonials.10.*` to `es.ts`, `en.ts`, `zh.ts`

---

## 3. Implementation Plan

### Affected Files

- `src/i18n/es.ts` — Add testimonials 4–10
- `src/i18n/en.ts` — Add testimonials 4–10
- `src/i18n/zh.ts` — Add testimonials 4–10
- `src/components/Testimonials.astro` — Extend the testimonials array with entries 4–10

---

### Testimonials Content

| # | Name | Location | summitDate | initials | photo |
|---|------|----------|-----------|----------|-------|
| 4 | Pablo Rodríguez | Colombia | undefined | PR | undefined |
| 5 | Ana Lima | Brazil | undefined | AL | undefined |
| 6 | Carlos Méndez | Mexico | undefined | CM | undefined |
| 7 | Fernanda Costa | Brazil | undefined | FC | undefined |
| 8 | David Martínez | Spain | undefined | DM | undefined |
| 9 | María González | Argentina | undefined | MG | undefined |
| 10 | Thomas Weber | Germany | undefined | TW | undefined |

---

### Execution Steps

#### Phase 1: i18n Keys (all three locales)

Add entries `testimonials.4.*` through `testimonials.10.*` following the existing pattern.

#### Phase 2: Update `Testimonials.astro`

Extend the `testimonials` array with 7 new entries for indices 4–10.

#### Phase 3: Build Validation

- Run `npm run build`
- Run `npx astro check`

---

## 4. Quality Gates

- [ ] `astro build` passes with zero errors
- [ ] `astro check` reports zero diagnostics
- [ ] All 10 testimonials appear in carousel (dots + prev/next navigation updated automatically)
- [ ] All three locale pages build without errors

---

## 5. Acceptance Criteria

- [ ] 10 testimonials total in the carousel (3 existing + 7 new)
- [ ] All i18n keys correctly added to `es.ts`, `en.ts`, and `zh.ts`
- [ ] `Testimonials.astro` array extended with entries 4–10
- [ ] No regressions to existing carousel or card layout
- [ ] Builds successfully on all 3 locales
