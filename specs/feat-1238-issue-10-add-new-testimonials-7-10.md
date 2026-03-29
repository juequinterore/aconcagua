# Feature Specification: Add New Testimonials 7–10

## 1. Design Analysis

**Target Scope:** `aconcagua` — Astro 5 static multilingual website (`src/`)

**Affected Layers:**
- i18n / Content: `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (add testimonials 4–7 keys)
- UI / Presentation: `src/components/Testimonials.astro` (add 4 new entries to testimonials array)

**Problem Statement:**
The testimonials carousel currently displays 3 client testimonials (Marcelo Simionato, Catalina Caicedo, Ricardo Peralta). Julian Kusi's client list contains additional real testimonials that should be added to the site to expand social proof and authenticity. This issue covers testimonials numbered 7–10 in the client's master list (which map to i18n indices 4–7, continuing from the existing 1–3).

**Solution Strategy:**
Append 4 new testimonials to the i18n translation files (es/en/zh) and add the corresponding entries to `Testimonials.astro`. The carousel is already fully built (prev/next, dot navigation, touch/swipe, read-more modal, line-clamp) — no structural component changes are needed. This is purely a content addition.

**Entry Point / Exposure:**
- The `#testimonios` section on the landing page — accessible via the nav link "Testimonios" / "Testimonials" / "客户评价". The carousel automatically picks up new slides from the `testimonials` array.

**User Story:**
> As a site visitor, I want to read more real testimonials from Aconcagua clients, so that I can see the range of people Julian has guided and make a more informed decision about hiring him.

---

## 2. Architecture & Data

### Architecture

```
i18n files (es/en/zh.ts) — testimonials.4 through testimonials.7 keys added
  → Testimonials.astro (reads via t() helper, adds 4 new array entries)
    → TestimonialCard.astro (existing component, no changes needed)
      → Browser (carousel with additional slides)
```

No backend, no API, no state management. Pure static content through i18n translation keys.

### Data Changes

- [ ] DB Schema: None
- [ ] API Contracts: None
- [ ] State Models: None
- [x] Content only: 4 new testimonial entries added to i18n files and component array

---

## 3. Implementation Plan

### Affected Files

| File | Operation | Purpose |
|------|-----------|---------|
| `src/i18n/es.ts` | Modify | Add `testimonials.4` – `testimonials.7` Spanish keys |
| `src/i18n/en.ts` | Modify | Add `testimonials.4` – `testimonials.7` English keys |
| `src/i18n/zh.ts` | Modify | Add `testimonials.4` – `testimonials.7` Chinese keys |
| `src/components/Testimonials.astro` | Modify | Add 4 new entries to the `testimonials` array |

### New Testimonial Data

| i18n # | Client List # | Name | Country | Summit Date | Photo |
|--------|--------------|------|---------|-------------|-------|
| 4 | 7 | Julio Catillo | Bolivia | None | Firebase Storage: `Julio.jpg` |
| 5 | 8 | Valentina Ríos | Colombia | None | None (initials fallback: "VR") |
| 6 | 9 | Miguel Ángel Pérez | México | enero 2026 | None (initials fallback: "MP") |
| 7 | 10 | Camila Ruiz | Colombia | None | None (initials fallback: "CR") |

### Testimonial Texts (Spanish originals)

**testimonials.4 — Julio Catillo / Bolivia:**
> "Muy buenos vídeos"

**testimonials.5 — Valentina Ríos / Colombia:**
> "La asesoría de Julián fue fundamental para mi expedición al Aconcagua. Sus videos de YouTube cubren todo lo que necesitás saber sobre el equipamiento y la aclimatación. Llegué preparada gracias a su contenido. ¡Muy recomendado para cualquier alpinista que quiera intentar esta cumbre!"

**testimonials.6 — Miguel Ángel Pérez / México:**
> "Escalé el Aconcagua en enero de 2026 y puedo decir que sin la preparación previa con los videos de Julián, no lo hubiera logrado. El cerro es brutal pero con la información correcta y la mentalidad adecuada, se puede. ¡Gracias Juli!"

**testimonials.7 — Camila Ruiz / Colombia:**
> "El canal de YouTube de Julián es una mina de oro para cualquiera que piense en subir el Aconcagua. Yo lo seguí durante un año entero antes de mi expedición y fue la mejor decisión. Su guía completa cubre absolutamente todo. ¡Gracias, Juli!"

---

### Execution Steps

#### Phase 1: i18n Content — Add testimonials.4 – testimonials.7

**File: `src/i18n/es.ts`**
- Add 4 new testimonial entries after `testimonials.3.*` keys (before `testimonials.readMore`)
- Keys: `name`, `location`, `text` for each. `summitDate` only for testimonial 6 (Miguel Ángel)

**File: `src/i18n/en.ts`**
- Add English translations for all 4 new testimonials

**File: `src/i18n/zh.ts`**
- Add Chinese translations for all 4 new testimonials

#### Phase 2: Component Update — Testimonials.astro

- Add 4 new objects to the `testimonials` array in `Testimonials.astro`
- Testimonial 4 (Julio): use Firebase Storage URL and initials `JC`
- Testimonials 5–7: no photo (`undefined`), use initials `VR`, `MP`, `CR`

#### Phase 3: Validation

- Run `npx astro check` — must report 0 errors
- Run `npm run build` — must succeed

---

## 4. Automated Verification

```bash
# Type / template check
npx astro check

# Build
npm run build

# Preview
npm run preview
```

### Quality Gates

- [x] `astro check` passes with 0 errors
- [ ] Build completes without errors
- [ ] All 7 slides render in browser carousel
- [ ] Firebase Storage image loads for testimonial 4 (Julio Catillo)
- [ ] Testimonials 5–7 show initials avatars
- [ ] Carousel dots show 7 indicators
- [ ] No regressions on existing 3 testimonials

---

## 5. Manual Verification Script

1. `npm run dev` → open `http://localhost:4321`
2. Scroll to the Testimonios section
3. Navigate carousel to slides 4–7:
   - **Slide 4**: Julio Catillo — Bolivia — "Muy buenos vídeos" — Julio photo
   - **Slide 5**: Valentina Ríos — Colombia — long text — "VR" initials
   - **Slide 6**: Miguel Ángel Pérez — México — summit date badge — "MP" initials
   - **Slide 7**: Camila Ruiz — Colombia — long text — "CR" initials
4. Confirm carousel dots now show 7 dots
5. Switch to `/en` — verify English translations
6. Switch to `/zh` — verify Chinese translations

---

## 6. Coverage Requirements

- No automated tests required for static i18n content additions
- Manual verification via dev server is the primary QA gate

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] 4 new testimonials added (i18n keys testimonials.4 – testimonials.7)
- [ ] Testimonial 4 (Julio Catillo) uses Firebase Storage photo URL
- [ ] Testimonials 5–7 use initials fallback avatars
- [ ] All 3 locale files updated (es, en, zh)
- [ ] `Testimonials.astro` array includes all 7 entries
- [ ] `astro check` passes with 0 errors
- [ ] Build passes (`npm run build`)
- [ ] Existing 3 testimonials unchanged (no regressions)
- [ ] Carousel dots reflect the new total count
