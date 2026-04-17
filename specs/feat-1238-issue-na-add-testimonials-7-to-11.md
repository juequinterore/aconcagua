# Feature Specification: Add Testimonials 7–11

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/2bIVk0Fe46f1dB5OurZm`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git`
**Git status at planning time (summary):** branch `chore/add_testimonials_7_11`, clean — only `bitbucket-api.sh` untracked; all source changes committed.
**Remote vs `issue_json.git.repository`:** not provided

**Source files consulted:**
- `docs/PROJECT.md`
- `package.json`
- `src/components/Testimonials.astro`
- `src/components/TestimonialCard.astro`
- `src/i18n/es.ts`
- `src/i18n/en.ts`
- `src/i18n/zh.ts`
- `agents/1238/feature_planner/plan-1238-issue-10-add-testimonials-7-to-11.json`
- `specs/feat-1238-issue-10-add-testimonials-7-to-11.md`

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions, targeting Spanish, English, and Chinese-speaking audiences.
**Project Type:** Single Astro package, static site (SSG)
**Primary Stack:** Astro v5.17.3, TypeScript (strict), plain CSS with design tokens; no framework UI libs.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Test: N/A — no test suite exists; validation is `npm run build` + manual browser check
- Lint/Format: N/A — none configured

**Validation Gate (authoritative "is this working?" signal):** `npm run build` (runs Astro + `@astrojs/check` type-check; must exit 0 with zero errors/warnings)

**Directory Structure (relevant portions):**
```
src/
├── components/
│   ├── Testimonials.astro       ← carousel component with testimonials array
│   └── TestimonialCard.astro    ← card + modal sub-component (no changes needed)
└── i18n/
    ├── es.ts                    ← Spanish translations
    ├── en.ts                    ← English translations
    └── zh.ts                    ← Chinese translations
```

**Exposure Model:** File-based routing. The `#testimonios` anchor section is rendered on all three locale home pages (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) via `<Testimonials lang={lang} t={t} />`. The carousel `testimonials.map()` auto-generates slides and dots from the array — no additional wiring is needed when adding new array entries.
**Locale / Multi-Surface Requirements:** ES (default `/`), EN (`/en/`), ZH (`/zh/`) — all three i18n dictionaries must be updated in parity.
**Conventions Observed:**
- File naming: PascalCase `.astro` for components (`Testimonials.astro`, `TestimonialCard.astro`)
- i18n keys: dot-namespaced (`testimonials.N.name`, `testimonials.N.location`, `testimonials.N.text`)
- Images: external Firebase Storage URLs referenced directly in component props (`photo:` field); no local download required
- Testimonial array pattern: `{ name, location, summitDate, text, initials, photo, photoAlt }` — `summitDate` is `undefined` for new testimonials

**Reserved Paths / Redirects / Route Collisions to avoid:** `/globalrescue`, `/pire`, `/en/pire` (declared in `astro.config.mjs`). This feature adds no new routes.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md`

---

## 1. Design Analysis

**Target Scope:** `src/components/Testimonials.astro` + `src/i18n/{es,en,zh}.ts`
**Affected Layers:**
- UI data layer: `testimonials` array in `Testimonials.astro`
- i18n data layer: three translation dictionaries

**Problem Statement:**
The testimonials carousel had 5 entries (testimonials 1–3, 5, 6; testimonial 4 was intentionally absent). The client provided 5 additional testimonials (7–11) with names, countries, testimonial texts in Spanish, and Firebase-hosted photos that must be added to the carousel and exposed on all three locale pages.

**Solution Strategy:**
Follow the existing pattern exactly:
1. Add `testimonials.7.*` through `testimonials.11.*` keys to `es.ts` (original Spanish), `en.ts` (English translations), and `zh.ts` (Chinese translations).
2. Append 5 new objects to the `testimonials` array in `Testimonials.astro`, each referencing the new i18n keys and the Firebase photo URL.
The carousel `testimonials.map()` auto-renders all new slides and dots — no other component or page wiring needed.

**Entry Point / Exposure:**
The `#testimonios` section is already rendered on all three locale pages via `<Testimonials />`. New array entries appear automatically via the existing `.map()` loop.

**Locale / Surface Coverage:**
- `/` (ES): `es.ts` keys
- `/en/` (EN): `en.ts` keys
- `/zh/` (ZH): `zh.ts` keys

**User Story:** As a site visitor, I want to read more client testimonials, so that I gain confidence in Julián's guiding and content quality before booking a consultation.

---

## 2. Architecture & Data

### Architecture
```
i18n/{es,en,zh}.ts  (new keys: testimonials.7–11.{name,location,text})
        ↓
Testimonials.astro  (new array entries referencing t('testimonials.N.*'), photo URLs, initials)
        ↓
TestimonialCard.astro  (no changes — consumes existing props)
        ↓
Carousel DOM  (auto-generates new slides + dots via .map(); carousel script is dynamic on slides.length)
```

**Existing pattern reference:** `Testimonials.astro` lines 57–101 (testimonials 7–11 in the current array); `es.ts` lines 106–120; `en.ts` lines 106–120; `zh.ts` lines 106–120.

### Data Changes
- [x] Translation / i18n keys added: `testimonials.{7..11}.{name,location,text}` in `es.ts`, `en.ts`, `zh.ts`
- [ ] Schema / migration changes: None
- [ ] Config changes: None
- [x] Static assets added: None — Firebase Storage URLs used directly
- [ ] New dependencies: None

---

## 3. Implementation Plan

### Affected Files (COMPLETE)

| Path | Operation | Purpose |
|------|-----------|---------|
| `src/i18n/es.ts` | Modify — before `testimonials.readMore` (~line 107) | Add `testimonials.{7..11}.name/location/text` in Spanish |
| `src/i18n/en.ts` | Modify — before `testimonials.readMore` (~line 107) | Add same keys in English |
| `src/i18n/zh.ts` | Modify — before `testimonials.readMore` (~line 107) | Add same keys in Chinese |
| `src/components/Testimonials.astro` | Modify — `testimonials` array (~line 57) | Append 5 new objects for testimonials 7–11 |

### New Testimonials Data Reference

| # | Name | Country | Initials | Photo URL |
|---|------|---------|----------|-----------|
| 7 | Diego Morales | Perú / Peru / 秘鲁 | DM | `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/PHOTO-2026-03-23-23-50-59.jpg?alt=media&token=bf3ade1f-2c0c-4773-98dc-aa7867f23f21` |
| 8 | Sofía Ramírez | México / Mexico / 墨西哥 | SR | `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/PHOTO-2026-03-23-23-56-42%202.jpg?alt=media&token=a3c201c7-700c-4728-9479-933c0e2eca22` |
| 9 | James O'Connor | Irlanda / Ireland / 爱尔兰 | JO | `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/Paul%20Quinteros.jpg?alt=media&token=37a8760e-cb6b-4379-89cf-b2c466d09849` |
| 10 | Andrés Salazar | Colombia / Colombia / 哥伦比亚 | AS | `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/PHOTO-2026-03-27-17-57-59.jpg?alt=media&token=7c480ca2-2caf-4f24-b0b4-2b8ca3575f63` |
| 11 | Lucas Tanaka | Brasil / Brazil / 巴西 | LT | *(same as testimony 7 — client-specified)* |

### Execution Steps

**Phase 1: i18n Data (ES / EN / ZH)**
- [x] Add `testimonials.7.name/location/text` through `testimonials.11.name/location/text` to `es.ts` with original Spanish text from issue
- [x] Add same keys to `en.ts` with English translations
- [x] Add same keys to `zh.ts` with Chinese translations
- Note: Keys must appear in all three files identically — missing keys silently fall back to Spanish, per project rules

**Phase 2: Testimonials Component**
- [x] Append 5 new objects to the `testimonials` array in `Testimonials.astro`:
  - Entry 7: `{ name: t('testimonials.7.name'), location: t('testimonials.7.location'), summitDate: undefined, text: t('testimonials.7.text'), initials: 'DM', photo: '<firebase-url-7>', photoAlt: t('testimonials.7.name') }`
  - Entry 8: same pattern with `initials: 'SR'` and Firebase URL 8
  - Entry 9: same pattern with `initials: 'JO'` and Firebase URL 9
  - Entry 10: same pattern with `initials: 'AS'` and Firebase URL 10
  - Entry 11: same pattern with `initials: 'LT'` and same Firebase URL as 7 (client-specified)

**Phase 3: Integration & Exposure**
- [x] No additional wiring required — carousel `testimonials.map()` auto-generates slides and dots; `total = slides.length` is dynamic.
- [x] All three locale pages (`/`, `/en/`, `/zh/`) render `<Testimonials />` — no page file changes needed.

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` and confirm zero errors / zero `@astrojs/check` warnings.
- [ ] Start dev server and manually verify 10 slides (5 original + 5 new), carousel navigation, photo load, i18n across all three locales.

> **Implementation status at planning time:** All source changes (Phases 1–3) are already committed on branch `chore/add_testimonials_7_11`. Phase 4 (build validation + manual verification) remains to be confirmed.

---

## 4. Automated Verification

### Verification Commands
```bash
# From project root
npm run build
# Expected: exits 0 with no TypeScript/Astro errors or warnings

# Dev server
npm run dev
# Then open http://localhost:4321/ → scroll to #testimonios
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero errors and zero `@astrojs/check` warnings.
- [ ] All 10 carousel slides render (testimonials 1–3, 5–11; 4 is intentionally absent).
- [ ] Firebase-hosted photos load for each of the 5 new testimonials.
- [ ] Carousel navigation dots count = 10.
- [ ] Arrow buttons, dot buttons, and touch swipe navigate correctly across all 10 slides.
- [ ] No console errors in browser devtools.
- [ ] `/en/` and `/zh/` routes show correct locale-specific translations for testimonials 7–11.
- [ ] No hardcoded colors introduced; all styling uses existing CSS design tokens.
- [ ] No new npm dependencies added.

---

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] Dependencies installed: `npm install`
- [ ] Dev server running: `npm run dev`

**Scenario:**
1. [ ] Open `http://localhost:4321/` in a browser.
2. [ ] Scroll to the **Testimonios** section (`#testimonios`).
3. [ ] Verify 10 navigation dots are visible.
4. [ ] Click the **Next** arrow until all 10 slides have been seen (or use dots). For slides 7–11, confirm:
   - Slide 7: name "Diego Morales", country "Perú", correct photo, Spanish text about Plaza de Mulas.
   - Slide 8: name "Sofía Ramírez", country "México", correct photo, text about Confluencia.
   - Slide 9: name "James O'Connor", country "Irlanda", correct photo, text about Dublín.
   - Slide 10: name "Andrés Salazar", country "Colombia", correct photo, text about Medellín.
   - Slide 11: name "Lucas Tanaka", country "Brasil", photo (same as slide 7), text about São Paulo.
5. [ ] On a long testimonial, verify the **"Leer más"** button appears and opens the modal with the full text; close button and backdrop click close the modal.
6. [ ] Repeat steps 2–5 at `http://localhost:4321/en/` — verify English names/locations/text.
7. [ ] Repeat at `http://localhost:4321/zh/` — verify Chinese translations.
8. [ ] Resize to mobile viewport (375px); verify carousel is navigable via swipe.
9. [ ] Toggle between light and dark themes; verify cards render correctly on both.

**Success Criteria:**
- ✅ 10 dots visible; all 10 testimonials reachable via navigation.
- ✅ Each new testimonial (7–11) displays correct name, location, photo, and text on all three locales.
- ✅ "Read more" modal opens and closes without error.
- ✅ No broken image placeholders (all Firebase URLs resolve).
- ✅ No console errors.
- ✅ `npm run build` passes with zero errors.

---

## 6. Coverage Requirements

- No automated test suite exists in this project (`docs/PROJECT.md` confirms this). The manual verification script above IS the full coverage.
- Edge cases to consider:
  - Testimony 4 is intentionally absent from the array — ensure the pattern of numbering gaps is maintained (do not renumber).
  - Testimony 11 reuses the same photo URL as testimony 7 (client-specified) — this is expected, not a bug.
  - Chinese translations for new testimonials are machine-translated — client should verify accuracy before release.
  - The `James O'Connor` entry contains an apostrophe which must be properly escaped in TypeScript string literals (single-quoted strings use `\'`); verify in `en.ts` and `zh.ts`.

---

## 7. Acceptance Criteria (Definition of Done)

- [x] Testimonials 7–11 added to `Testimonials.astro` array with correct initials, Firebase photo URLs, and i18n references.
- [x] Translation keys `testimonials.{7..11}.{name,location,text}` added to all three i18n dictionaries (`es.ts`, `en.ts`, `zh.ts`).
- [ ] `npm run build` passes with zero errors / warnings.
- [ ] Manual verification script completed across all three locales, both themes, and mobile viewport.
- [ ] No regressions in existing testimonials 1–3, 5, 6.
- [ ] All carousel navigation (arrows, dots, swipe) works correctly with 10 slides.
- [ ] No new dependencies introduced.
- [ ] No translation keys added to only one or two locales.
