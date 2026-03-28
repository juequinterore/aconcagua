# Feature Specification: Testimonials Carousel with Real Photos

## 1. Design Analysis

**Target Scope:** `aconcagua` — Astro 5 static multilingual website (`src/`)

**Affected Layers:**
- UI / Presentation: `Testimonials.astro`, `TestimonialCard.astro`
- No i18n changes required (existing keys cover the section)

**Problem Statement:**
The current testimonials section has two limitations:
1. **Static grid layout** — shows all three cards simultaneously in a grid. On mobile (≤640px) it collapses to single-column, but desktop shows all cards at once with no interactivity.
2. **Gradient initials avatars** — the author avatars are purely CSS-generated circles with initials (MR, SK, JW), which look placeholder-like and reduce trust signals.

**Solution Strategy:**
1. **Carousel/Slider** — Replace the static `.testimonials-grid` with an interactive carousel that shows one card at a time, with prev/next navigation buttons and dot indicators. Pure vanilla JS, no external libraries.
2. **Real Photo Support** — Add an optional `photo` and `photoAlt` prop to `TestimonialCard.astro`. When provided, renders a circular `<img>` instead of the gradient initials avatar. Falls back gracefully to initials when no photo is provided.

**Entry Point:**
Section 6 on all three locale pages (`/`, `/en/`, `/zh/`), rendered by `Testimonials.astro`.

**User Story:**
> As a prospective expedition client, I want to see client testimonials presented in an engaging carousel with real client photos, so that the social proof feels authentic and visually compelling.

---

## 2. Architecture & Data

### Architecture

```
Testimonials.astro
  ├─ Carousel wrapper (overflow: hidden)
  │   └─ Carousel track (display: flex, transform: translateX)
  │       ├─ TestimonialCard (with photo prop)
  │       ├─ TestimonialCard (with photo prop)
  │       └─ TestimonialCard (with photo prop)
  ├─ Prev / Next navigation buttons
  └─ Dot indicators (3 dots)
```

### Data Changes
- [ ] DB Schema: **None**
- [ ] API Contracts: **None**
- [ ] State Models: **None**
- [ ] i18n Keys: **None new** (existing `testimonials.*` keys are sufficient)

### Photo Assets
- Add optional client photos at `public/testimonials/marco-rossi.webp`, `sarah-kim.webp`, `james-walsh.webp`
- When real photos are not yet available, gallery images serve as placeholders
- TestimonialCard falls back to initials avatar if `photo` prop is not provided

---

## 3. Implementation Plan

### Affected Files

- `src/components/TestimonialCard.astro` (Modify — add optional `photo` and `photoAlt` props)
- `src/components/Testimonials.astro` (Modify — replace static grid with carousel + JS controls)

---

### Execution Steps

#### Phase 1: Update `TestimonialCard.astro`

- Add `photo?: string` and `photoAlt?: string` to the Props interface
- In the author footer: conditionally render `<img>` circle OR gradient initials div
- `<img>` styling: 44px × 44px, `border-radius: 50%`, `object-fit: cover`
- Keep the existing gradient initials as fallback

#### Phase 2: Update `Testimonials.astro` — Carousel

Replace `.testimonials-grid` with:

```
.carousel-wrapper   (overflow: hidden, width: 100%)
  .carousel-track   (display: flex, transition: transform 0.45s ease)
    .carousel-slide × N   (flex: 0 0 100%)
      <TestimonialCard />
.carousel-nav
  .carousel-btn.prev
  .carousel-dots
  .carousel-btn.next
```

JavaScript (inline `<script>`):
- Track `currentIndex` (0-based)
- `goTo(index)` — updates `transform: translateX(-index * 100%)`
- Prev / Next buttons call `goTo(currentIndex - 1)` and `goTo(currentIndex + 1)` with wrap-around
- Dot click → `goTo(i)`
- Active dot highlighted in gold
- Respect `prefers-reduced-motion`: if reduced motion, disable transition
- Touch/swipe: `touchstart` / `touchend` delta detection (≥50px threshold)
- Auto-advance: **disabled** (avoids accessibility issues with auto-play)

#### Phase 3: Build Validation

- Run `npm run build`
- Run `npx astro check`

---

## 4. Quality Gates

- [ ] `astro build` passes with zero errors
- [ ] `astro check` reports zero diagnostics
- [ ] Carousel navigates correctly (prev/next wrap-around, dot click)
- [ ] Fallback to initials avatar when `photo` is not provided
- [ ] All three locale pages build without errors
- [ ] Reduced-motion: no transform transition when `prefers-reduced-motion: reduce`
- [ ] Mobile: touch swipe works to navigate

---

## 5. Acceptance Criteria

- [ ] `TestimonialCard.astro` accepts optional `photo` and `photoAlt` props
- [ ] When `photo` is provided, renders a circular `<img>` instead of gradient initials
- [ ] `Testimonials.astro` uses a single-card carousel layout
- [ ] Prev/Next navigation buttons visible and functional
- [ ] Dot indicators reflect current slide; active dot in gold
- [ ] Carousel wraps (last → first, first → last)
- [ ] Touch/swipe support on mobile
- [ ] No external JS libraries added
- [ ] Zero regressions on other sections
- [ ] Builds successfully on all 3 locales
