# Feature Specification: Add Testimonials 7–11

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/21sy2tgf73rsXWOS4o9g`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git`
**Git status at planning time (summary):** Branch `chore/add_testimonials_7_11`; one untracked file (`bitbucket-api.sh`); working tree otherwise clean — testimonials 7–11 already committed/applied.
**Remote vs `issue_json.git.repository`:** `not provided` (no `git.repository` field in issue_json)

**Source files consulted:**
- `package.json`
- `astro.config.mjs`
- `src/components/Testimonials.astro`
- `src/components/TestimonialCard.astro`
- `src/i18n/es.ts`
- `src/i18n/en.ts`
- `src/i18n/zh.ts`
- `REDESIGN_SPEC.md`
- `specs/LANDING_PAGE_SPEC.md`

**Purpose:** Aconcagua.co is the official website of Julián Kusi, a certified Aconcagua mountain guide. It markets expedition packages and a free consultation, displays client testimonials in a carousel, and links to social communities.
**Project Type:** Single-package Astro static site
**Primary Stack:** Astro ^5.17.3, TypeScript ^5.9.3, `@astrojs/sitemap` ^3.7.0, `@astrojs/check` ^0.9.7, `sharp` ^0.33.0

**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev` (Astro dev server, port 4321)
- Build: `npm run build` (Astro static build → `dist/`)
- Test: `N/A — no test suite exists`
- Lint/Format: `N/A — not configured`

**Validation Gate (authoritative "is this working?" signal):** `npm run build` (zero build errors) + `npx astro check` (zero TypeScript/type errors)

**Directory Structure (relevant portions):**
```
src/
├── components/
│   ├── Testimonials.astro       ← carousel container + slide data array
│   └── TestimonialCard.astro    ← individual slide renderer
└── i18n/
    ├── es.ts                    ← Spanish strings (default locale)
    ├── en.ts                    ← English strings
    └── zh.ts                    ← Chinese (Simplified) strings
```

**Exposure Model:** Astro file-based routing with i18n prefix. The testimonials carousel is rendered inside `Testimonials.astro`, which is included in the home page (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`). New carousel slides are exposed automatically via the `testimonials.map()` loop — no additional routing or navigation wiring is required.

**Locale / Multi-Surface Requirements:**
- `es` (Spanish) — served at `/` (default, no prefix)
- `en` (English) — served at `/en/`
- `zh` (Chinese Simplified) — served at `/zh/`
- All three locales must be updated simultaneously for every new user-visible string.

**Conventions Observed:**
- File naming: PascalCase for components (`Testimonials.astro`, `TestimonialCard.astro`)
- i18n key format: `section.N.field` — e.g., `testimonials.7.name`, `testimonials.7.location`, `testimonials.7.text`
- Locale files: flat TypeScript object exported as `export const es = { ... }`
- Testimonial object shape: `{ name, location, summitDate?, text, initials, photo, photoAlt }` — `summitDate` is optional
- Initials: 2-letter uppercase abbreviation of first+last name (e.g., `'DM'` for Diego Morales)
- Photos: Firebase Storage public URLs (`firebasestorage.googleapis.com/...`)
- Testimonial 4 is intentionally absent; numbering is non-contiguous (1, 2, 3, 5, 6, 7–11)

**Reserved Paths / Redirects / Route Collisions to avoid:**
- `/globalrescue` → external partner URL
- `/pire` → external partner URL
- `/en/pire` → external partner URL
(defined in `astro.config.mjs`)

**Documentation Action Taken:** Created `docs/PROJECT.md` because no adequate project documentation existed (no README, no `docs/` directory).

---

## 1. Design Analysis

**Target Scope:** `src/components/Testimonials.astro` (carousel data array) + `src/i18n/{es,en,zh}.ts` (i18n keys)
**Affected Layers:** UI component layer, i18n data layer
**Problem Statement:** The testimonials carousel contained only 5 entries (testimonials 1–3, 5, 6). The client provided 5 additional testimonials (7–11) with names, countries of origin, testimonial texts in Spanish, and Firebase-hosted profile photos.
**Solution Strategy:** Follow the established pattern: add `testimonials.N.name`, `testimonials.N.location`, and `testimonials.N.text` keys to all three locale files, then append a corresponding object to the `testimonials` array in `Testimonials.astro`. The carousel renders all slides automatically via `.map()` — no extra wiring.
**Entry Point / Exposure:** `Testimonials.astro` → `#testimonios` anchor on the home page (all three locale routes). The `testimonials.map()` loop auto-generates both slides and navigation dots from the array.
**Locale / Surface Coverage:** ES (`/`), EN (`/en/`), ZH (`/zh/`) — all three updated.
**User Story:** As a site visitor, I want to read more client testimonials, so that I can gain confidence in Julián's guiding and content quality before booking a consultation.

---

## 2. Architecture & Data

### Architecture
```
src/i18n/{es,en,zh}.ts   (testimonials.7–11 keys: name, location, text)
         ↓
src/components/Testimonials.astro   (testimonials array, 5 new objects appended)
         ↓
src/components/TestimonialCard.astro   (unchanged — consumes props as-is)
         ↓
Carousel DOM   (slides + dots auto-generated by .map())
```

Existing pattern followed exactly: `Testimonials.astro` lines 11–101 (prior to this feature, up to line ~56). Each new object follows the same shape as entries 1–6.

### Data Changes
- [x] Translation / i18n keys added: `testimonials.7.*` through `testimonials.11.*` in `es.ts`, `en.ts`, `zh.ts`
- [ ] Schema / migration changes: None
- [ ] Config changes: None
- [ ] Static assets added: None — photos hosted on Firebase Storage (external URLs)
- [ ] New dependencies: None

**Testimonial data summary:**

| # | Name | Country | Initials | Photo URL (abbreviated) |
|---|------|---------|----------|-------------------------|
| 7 | Diego Morales | Perú / Peru / 秘鲁 | DM | `PHOTO-2026-03-23-23-50-59.jpg` |
| 8 | Sofía Ramírez | México / Mexico / 墨西哥 | SR | `PHOTO-2026-03-23-23-56-42%202.jpg` |
| 9 | James O'Connor | Irlanda / Ireland / 爱尔兰 | JO | `Paul%20Quinteros.jpg` |
| 10 | Andrés Salazar | Colombia / Colombia / 哥伦比亚 | AS | `PHOTO-2026-03-27-17-57-59.jpg` |
| 11 | Lucas Tanaka | Brasil / Brazil / 巴西 | LT | Same URL as #7 (client-specified) |

---

## 3. Implementation Plan

### Affected Files (COMPLETE)

- `src/i18n/es.ts` (Modify — add `testimonials.7.*` through `testimonials.11.*` keys before `testimonials.readMore`, lines ~106–120)
- `src/i18n/en.ts` (Modify — same keys in English, lines ~106–120)
- `src/i18n/zh.ts` (Modify — same keys in Chinese Simplified, lines ~106–120)
- `src/components/Testimonials.astro` (Modify — append 5 new objects to `testimonials` array, after line ~56)

### Execution Steps

**Phase 1: i18n Data (ES / EN / ZH)**
- [x] Add `testimonials.7.name`, `testimonials.7.location`, `testimonials.7.text` to `es.ts`, `en.ts`, `zh.ts`
- [x] Add `testimonials.8.name`, `testimonials.8.location`, `testimonials.8.text` to all three locale files
- [x] Add `testimonials.9.name`, `testimonials.9.location`, `testimonials.9.text` to all three locale files
- [x] Add `testimonials.10.name`, `testimonials.10.location`, `testimonials.10.text` to all three locale files
- [x] Add `testimonials.11.name`, `testimonials.11.location`, `testimonials.11.text` to all three locale files

**Phase 2: Testimonials Component**
- [x] Append 5 new objects to `testimonials` array in `Testimonials.astro`:
  - Testimony 7: `initials: 'DM'`, Firebase photo `PHOTO-2026-03-23-23-50-59.jpg`
  - Testimony 8: `initials: 'SR'`, Firebase photo `PHOTO-2026-03-23-23-56-42%202.jpg`
  - Testimony 9: `initials: 'JO'`, Firebase photo `Paul%20Quinteros.jpg`
  - Testimony 10: `initials: 'AS'`, Firebase photo `PHOTO-2026-03-27-17-57-59.jpg`
  - Testimony 11: `initials: 'LT'`, same Firebase photo as #7 (client-specified)

**Phase 3: Integration & Exposure (Automatic)**
- [x] Carousel `testimonials.map()` auto-generates new slides and navigation dots — no additional wiring needed
- [x] Dot count (`total = slides.length`) updates automatically from the array length

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` in project root — confirm zero errors
- [ ] Run `npx astro check` — confirm zero TypeScript errors
- [ ] Start dev server and visually verify all 10 slides are navigable
- [ ] Verify Firebase photo URLs load correctly on all slides

---

## 4. Automated Verification

### Verification Commands
```bash
# From workspace root
npm run build

# Type-check
npx astro check

# Dev server for visual inspection
npm run dev
# Open http://localhost:4321 → scroll to #testimonios → navigate carousel
# Open http://localhost:4321/en → verify English translations
# Open http://localhost:4321/zh → verify Chinese translations
```

### Quality Gates
- [ ] `npm run build` exits 0 with no errors or warnings
- [ ] `npx astro check` exits 0 with no type errors
- [ ] All 10 carousel slides render (testimonials 1–3, 5, 6, 7–11)
- [ ] Navigation dots count = 10
- [ ] Each new slide shows correct name, country, photo, and text
- [ ] Firebase photo URLs return images (not 404)
- [ ] Carousel prev/next buttons and dot navigation work for new slides
- [ ] Touch/swipe works on mobile viewport
- [ ] No console errors in browser DevTools
- [ ] `/en` and `/zh` routes show correct locale strings for testimonials 7–11
- [ ] No regressions in testimonials 1–6

---

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] Dependencies installed: `npm install`
- [ ] No active build errors

**Scenario:**
1. [ ] Run `npm run dev`
2. [ ] Open `http://localhost:4321` (ES default)
3. [ ] Scroll to the **Testimonios** section
4. [ ] Click the **Next** arrow 9 times — confirm all 10 slides appear in order
5. [ ] For each new slide (7–11): verify name, country, photo loads, and testimonial text matches the issue_json content
6. [ ] Verify 10 dots are visible and the active dot tracks the current slide
7. [ ] Click a dot directly — confirm it jumps to the correct slide
8. [ ] Open `http://localhost:4321/en` — repeat steps 3–7, verify English translations
9. [ ] Open `http://localhost:4321/zh` — repeat steps 3–7, verify Chinese translations
10. [ ] Simulate mobile viewport (< 768px) and test swipe navigation
11. [ ] Open browser DevTools Console — confirm no errors

**Success Criteria:**
- ✅ Slides 7–11 visible with correct photos, names, countries, and text
- ✅ 10 navigation dots present and functional
- ✅ All three locale routes (ES, EN, ZH) display correct translations
- ✅ `npm run build` passes with zero errors

---

## 6. Coverage Requirements

- The project has **no automated test suite**. Visual/manual verification (Section 5) is the primary validation method.
- Edge cases to consider:
  - Testimony 11 (Lucas Tanaka) shares the same Firebase photo URL as testimony 7 (Diego Morales) — this is client-specified and acceptable
  - Testimonial 4 is intentionally absent; this non-contiguous numbering is a pre-existing pattern and must not be changed
  - Chinese translations for testimonials 7–11 are machine-translated — client should review if accuracy is critical

---

## 7. Acceptance Criteria (Definition of Done)

- [x] `testimonials.7.*` through `testimonials.11.*` keys present in `es.ts`, `en.ts`, `zh.ts`
- [x] 5 new objects appended to the `testimonials` array in `Testimonials.astro`
- [x] Correct Firebase photo URLs assigned per client specification
- [ ] `npm run build` passes with zero errors
- [ ] `npx astro check` passes with zero type errors
- [ ] Manual verification script (Section 5) completed across all three locale routes
- [ ] 10 carousel slides render and are navigable (arrows, dots, swipe)
- [ ] No regressions in testimonials 1–6
- [ ] No new dependencies introduced
