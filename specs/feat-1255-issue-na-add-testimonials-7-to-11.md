# Feature Specification: Add Testimonials 7–11

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/sxWvvKC83QNycdMhqbxm`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git`
**Git status at planning time (summary):** `On branch chore/add_testimonials_7_to_11 — 1 untracked file (bitbucket-api.sh), working tree otherwise clean`
**Remote vs `issue_json.git.repository`:** `not provided`

**Source files consulted:**
- `docs/PROJECT.md`
- `package.json`
- `src/components/Testimonials.astro`
- `src/components/TestimonialCard.astro`
- `src/i18n/es.ts`
- `src/i18n/en.ts`
- `src/i18n/zh.ts`

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions — a single-page landing site with multi-locale support (es, en, zh) deployed to Firebase Hosting.
**Project Type:** Single Astro package (SSG, not a monorepo)
**Primary Stack:** Astro v5.17.3, TypeScript (strict), plain CSS with design tokens; no Tailwind, no React/Vue/Svelte
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Test: `N/A — no test suite exists; validation is via build + manual browser check`
- Lint/Format: `N/A — no linter or formatter configured`

**Validation Gate (authoritative "is this working?" signal):** `npm run build` (runs Astro SSG + `@astrojs/check` TypeScript type-check; must exit 0 with zero errors and zero warnings)

**Directory Structure (relevant portions):**
```
src/
├── components/
│   ├── Testimonials.astro        ← testimonial array + carousel (already modified)
│   └── TestimonialCard.astro     ← card + modal rendering (unchanged)
└── i18n/
    ├── es.ts                     ← Spanish keys (already modified)
    ├── en.ts                     ← English keys (already modified)
    └── zh.ts                     ← Chinese keys (already modified)
```

**Exposure Model:** File-based routing; the testimonials carousel lives in `src/components/Testimonials.astro`, embedded in all three locale landing pages (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`). The `testimonials.map()` loop in `Testimonials.astro` auto-renders each array entry as a carousel slide — no additional page wiring needed for new entries.
**Locale / Multi-Surface Requirements:** Three locales must stay in parity — `es` (default), `en`, `zh`. Every testimonial `name`, `location`, and `text` key must exist in all three i18n dictionaries.
**Conventions Observed:**
- File naming: PascalCase `.astro` components (`Testimonials.astro`, `TestimonialCard.astro`)
- i18n approach: dot-namespaced keys (`testimonials.N.name`, `testimonials.N.location`, `testimonials.N.text`) in `es.ts` / `en.ts` / `zh.ts`
- Photo hosting: Firebase Storage URLs used directly as `photo` prop strings (not imported assets)
- Initials: uppercase 2-letter string derived from the person's name initials
- `summitDate`: `undefined` for testimonials that do not include a summit date

**Reserved Paths / Redirects / Route Collisions to avoid:** `/globalrescue`, `/pire`, `/en/pire` (declared in `astro.config.mjs`); no new pages are created by this feature so no collision risk.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` (comprehensive, up to date).

---

## 1. Design Analysis

**Target Scope:** `src/components/Testimonials.astro` (testimonial data array) + `src/i18n/{es,en,zh}.ts` (translation keys)
**Affected Layers:** i18n data layer, UI component layer
**Problem Statement:** The testimonials carousel needs 5 additional entries (testimonials 7–11) as specified in the issue, each with a name, country, testimonial text, and Firebase-hosted profile photo.
**Solution Strategy:** Follow the established pattern already used for testimonials 1–6: add `testimonials.N.{name,location,text}` keys in all three i18n files, then append a corresponding object to the `testimonials` array in `Testimonials.astro` referencing those keys plus the Firebase photo URL and initials.

**⚠️ IMPLEMENTATION STATUS — ALREADY COMPLETE:**
A full audit of the current branch (`chore/add_testimonials_7_to_11`) confirms that **all five testimonials (7–11) are already implemented** and match the issue requirements exactly:

| # | Name | Location | Photo URL (last segment) | Initials | es.ts ✓ | en.ts ✓ | zh.ts ✓ | Testimonials.astro ✓ |
|---|------|----------|--------------------------|----------|---------|---------|---------|----------------------|
| 7 | Diego Morales | Perú / Peru / 秘鲁 | `PHOTO-2026-03-23-23-50-59.jpg` | DM | ✅ | ✅ | ✅ | ✅ (line 58–65) |
| 8 | Sofía Ramírez | México / Mexico / 墨西哥 | `PHOTO-2026-03-23-23-56-42%202.jpg` | SR | ✅ | ✅ | ✅ | ✅ (line 66–74) |
| 9 | James O'Connor | Irlanda / Ireland / 爱尔兰 | `Paul%20Quinteros.jpg` | JO | ✅ | ✅ | ✅ | ✅ (line 75–83) |
| 10 | Andrés Salazar | Colombia / Colombia / 哥伦比亚 | `PHOTO-2026-03-27-17-57-59.jpg` | AS | ✅ | ✅ | ✅ | ✅ (line 84–92) |
| 11 | Lucas Tanaka | Brasil / Brazil / 巴西 | `PHOTO-2026-03-23-23-50-59.jpg` | LT | ✅ | ✅ | ✅ | ✅ (line 93–101) |

The **only remaining task is validation**: running `npm run build` to confirm zero type-check errors and the carousel renders all 10 slides correctly across all three locales.

**Entry Point / Exposure:** The `#testimonios` anchor section on all three locale landing pages. New slides are auto-rendered by the `testimonials.map()` loop — no extra wiring needed.
**Locale / Surface Coverage:** ES (default), EN (`/en/`), ZH (`/zh/`) — all three covered.
**User Story:** As a site visitor, I want to read additional real testimonials from climbers who followed Julián's content, so that I gain confidence in his expertise before booking a consultation.

---

## 2. Architecture & Data

### Architecture
Data flows from the i18n dictionaries through the `t()` function into the `testimonials` array in `Testimonials.astro`, which is then mapped to `<TestimonialCard>` components inside the carousel. This is the same pattern used for all existing testimonials (1–3, 5–6):

```
i18n/{es,en,zh}.ts  (testimonials.N.{name,location,text} keys)
        ↓  t(key)
Testimonials.astro  (testimonials array → map → <TestimonialCard>)
        ↓
TestimonialCard.astro  (renders card + modal dialog)
```

### Data Changes
- [ ] Translation / i18n keys added: `testimonials.{7,8,9,10,11}.{name,location,text}` in `es.ts`, `en.ts`, `zh.ts` — **DONE** (verified in current branch)
- [ ] Schema / migration changes: None
- [ ] Config changes: None
- [ ] Static assets added: None (Firebase Storage URLs used directly)
- [ ] New dependencies: None

---

## 3. Implementation Plan

### Affected Files (COMPLETE — all already modified in current branch)

- `src/components/Testimonials.astro` (Modify — append 5 entries to `testimonials` array at lines 58–101 — **DONE**)
- `src/i18n/es.ts` (Modify — add `testimonials.{7–11}.{name,location,text}` keys at lines 106–120 — **DONE**)
- `src/i18n/en.ts` (Modify — add English translations of testimonials 7–11 at lines 106–120 — **DONE**)
- `src/i18n/zh.ts` (Modify — add Chinese translations of testimonials 7–11 at lines 106–120 — **DONE**)

### Execution Steps

**Phase 1: Data / Model / Contract**
- [x] Add `testimonials.{7,8,9,10,11}.{name,location,text}` keys to `src/i18n/es.ts` with exact text from issue_json — **COMPLETE**
- [x] Add English translations (same names, localized country names, translated texts) to `src/i18n/en.ts` — **COMPLETE**
- [x] Add Chinese translations (same names, localized country names and texts in 中文) to `src/i18n/zh.ts` — **COMPLETE**

**Phase 2: Implementation**
- [x] Append 5 objects to the `testimonials` array in `Testimonials.astro`, each with:
  - `name: t('testimonials.N.name')`
  - `location: t('testimonials.N.location')`
  - `summitDate: undefined`
  - `text: t('testimonials.N.text')`
  - `initials: 'XX'` (2-letter uppercase)
  - `photo: '<firebase-url>'`
  - `photoAlt: t('testimonials.N.name')`
  — **COMPLETE**

**Phase 3: Integration & Exposure (MANDATORY)**
- [x] The carousel's `testimonials.map()` loop in `Testimonials.astro` automatically renders all array entries — new slides appear without any additional wiring. The dot-counter also auto-generates from array length — **already handled by existing code**.
- [x] No navigation changes required (testimonials section already linked via `#testimonios` in `Nav.astro`).

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` and confirm exit 0 with zero `@astrojs/check` errors/warnings.
- [ ] Manually verify carousel at `http://localhost:4321/`, `/en/`, `/zh/` — confirm 10 slides total, correct names / locations / texts per locale, photos load, "Read more" modal works for long texts.

---

## 4. Automated Verification

### Verification Commands
```bash
# Primary gate — must exit 0
npm run build

# Dev server for manual inspection
npm run dev
# Then open: http://localhost:4321/  (ES)
#            http://localhost:4321/en/  (EN)
#            http://localhost:4321/zh/  (ZH)
```

### Quality Gates
- [ ] `npm run build` exits 0 with no `@astrojs/check` type errors or warnings.
- [ ] Carousel renders exactly 10 slides (5 original + 5 new) across all three locales.
- [ ] Each new testimonial card shows the correct name, location (locale-appropriate), and photo.
- [ ] "Read more" button appears and opens the modal when text overflows 4 lines.
- [ ] No hardcoded hex colors introduced (only Firebase URL strings and design token references).
- [ ] No new npm dependencies added.
- [ ] All i18n keys present in all three dictionaries (no missing-key silent fallbacks).

---

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` completed
- [ ] `npm run dev` running at `http://localhost:4321`

**Scenario — ES locale (`/`):**
1. [ ] Navigate to `http://localhost:4321/` and scroll to the `#testimonios` section.
2. [ ] Count the carousel dots — expect **10 dots**.
3. [ ] Click through slides 6–10 (zero-indexed 5–9); verify names and locations match:
   - Slide 6: Diego Morales — Perú
   - Slide 7: Sofía Ramírez — México
   - Slide 8: James O'Connor — Irlanda
   - Slide 9: Andrés Salazar — Colombia
   - Slide 10: Lucas Tanaka — Brasil
4. [ ] Confirm each testimonial photo loads (circular, 44×44, bordered).
5. [ ] Confirm "Leer más" button appears on cards whose text overflows 4 lines and opens the full-text modal.
6. [ ] Confirm modal closes on ✕ button, backdrop click, and Escape key.

**Scenario — EN locale (`/en/`):**
1. [ ] Navigate to `http://localhost:4321/en/` → `#testimonios` section.
2. [ ] Verify slides 6–10 show localized location names:
   - Slide 6: Diego Morales — Peru
   - Slide 7: Sofía Ramírez — Mexico
   - Slide 8: James O'Connor — Ireland
   - Slide 9: Andrés Salazar — Colombia
   - Slide 10: Lucas Tanaka — Brazil
3. [ ] Confirm "Read more" label appears (not Spanish "Leer más").

**Scenario — ZH locale (`/zh/`):**
1. [ ] Navigate to `http://localhost:4321/zh/` → `#testimonios` section.
2. [ ] Verify slides 6–10 show Chinese location names:
   - Slide 6: Diego Morales — 秘鲁
   - Slide 7: Sofía Ramírez — 墨西哥
   - Slide 8: James O'Connor — 爱尔兰
   - Slide 9: Andrés Salazar — 哥伦比亚
   - Slide 10: Lucas Tanaka — 巴西
3. [ ] Confirm "阅读更多" label appears.

**Success Criteria:**
- ✅ 10 carousel dots visible on all three locale pages.
- ✅ Names, locations, and texts for testimonials 7–11 match the issue_json specifications exactly.
- ✅ Profile photos load correctly from Firebase Storage URLs.
- ✅ "Read more" / "Leer más" / "阅读更多" modal works for long-text cards.
- ✅ `npm run build` exits 0 with zero type errors.

---

## 6. Coverage Requirements

- [ ] No test suite exists in this project. The manual verification script above IS the coverage gate.
- [ ] Edge cases to consider:
  - James O'Connor's apostrophe in name is correctly escaped in TypeScript string literals (`'James O\'Connor'`) — **verified present in es.ts, en.ts, zh.ts**.
  - Lucas Tanaka (testimonial 11) intentionally shares the same Firebase photo URL as Diego Morales (testimonial 7) — this matches the issue_json specification (same URL provided) and is correct.
  - Long testimonial texts (especially testimonials 7, 8, 9, 10, 11) will trigger the 4-line clamp and "Read more" button — confirm in manual verification.

---

## 7. Acceptance Criteria (Definition of Done)

- [ ] All implementation phases completed — **ALREADY DONE in current branch**.
- [ ] `npm run build` exits 0 with zero `@astrojs/check` errors or warnings.
- [ ] Manual verification script completed across all three locales (ES, EN, ZH).
- [ ] 10 total carousel slides rendered on every locale landing page.
- [ ] Every new testimonial entry has: name, location (locale-specific), text (locale-specific), photo (Firebase URL), initials, and no `summitDate`.
- [ ] No regressions in existing testimonials 1–3, 5–6.
- [ ] No new npm dependencies introduced.
- [ ] No translation keys present in only one or two locales.
