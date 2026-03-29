# Feature Specification: Add Testimonials 5, 6, and 7

## 1. Design Analysis

**Target Scope:** `aconcagua` — Astro 5 static multilingual website (`src/`)

**Affected Layers:**
- UI / Presentation: `src/components/Testimonials.astro` (add 3 new carousel entries)
- i18n / Content: `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (add keys for testimonials 5, 6, 7)

**Problem Statement:**
The testimonials carousel currently shows 3 client testimonials (Marcelo Simionato, Catalina Caicedo, Ricardo Peralta). Three additional real-client testimonials have been collected and need to be added to expand social proof on the landing page.

**Solution Strategy:**
Add i18n keys for `testimonials.5`, `testimonials.6`, and `testimonials.7` in all three locale files (es, en, zh). Update `Testimonials.astro` to include three new carousel entries referencing these keys. All three new testimonials use the initials-avatar fallback (no photos available).

**Entry Point / Exposure:**
- The `#testimonios` section on the landing page — accessible via the nav link "Testimonios" / "Testimonials" / "客户评价".

**User Story:**
> As a prospective Aconcagua client, I want to see more real testimonials from past clients so that I have greater confidence in Julián Kusi's expertise and reputation.

---

## 2. Architecture & Data

### Architecture

```
i18n files (es/en/zh.ts)
  → Testimonials.astro (reads via t() helper — extends array from 3 to 6 entries)
    → TestimonialCard.astro (renders name, location, text, initials avatar)
      → Browser (carousel with prev/next/dots navigation — dots auto-expand)
```

No backend, no API, no database changes. Pure static content managed through the i18n translation keys and component data array.

### Data Changes
- [ ] DB Schema: **None**
- [ ] API Contracts: **None**
- [ ] State Models: **None**
- [x] i18n Keys: Add `testimonials.5.*`, `testimonials.6.*`, `testimonials.7.*` to all three locale files

---

## 3. Implementation Plan

### New Testimonials Data

| # | Name | Country | summitDate | Image | Initials |
|---|------|---------|------------|-------|----------|
| 5 | Valentina Ríos | Colombia | — | None (initials: VR) | VR |
| 6 | Miguel Ángel Pérez | Mexico | enero de 2026 | None (initials: MP) | MP |
| 7 | Camila Ruiz | Colombia | — | None (initials: CR) | CR |

### Affected Files

- `src/i18n/es.ts` — Add `testimonials.5.*`, `testimonials.6.*`, `testimonials.7.*` keys
- `src/i18n/en.ts` — Add English translations for the same keys
- `src/i18n/zh.ts` — Add Chinese translations for the same keys
- `src/components/Testimonials.astro` — Add 3 new entries to the `testimonials` array

---

### Execution Steps

#### Phase 1: i18n Keys — es.ts

Add after `testimonials.3.text`:

```ts
'testimonials.5.name': 'Valentina Ríos',
'testimonials.5.location': 'Colombia',
'testimonials.5.text': 'La asesoría de Julián fue fundamental para mi expedición al Aconcagua. Sus videos de YouTube cubren todo lo que necesitás saber sobre el equipamiento y la aclimatación. Llegué preparada gracias a su contenido. ¡Muy recomendado para cualquier alpinista que quiera intentar esta cumbre!',
'testimonials.6.name': 'Miguel Ángel Pérez',
'testimonials.6.location': 'México',
'testimonials.6.summitDate': 'enero de 2026',
'testimonials.6.text': 'Escalé el Aconcagua en enero de 2026 y puedo decir que sin la preparación previa con los videos de Julián, no lo hubiera logrado. El cerro es brutal pero con la información correcta y la mentalidad adecuada, se puede. ¡Gracias Juli!',
'testimonials.7.name': 'Camila Ruiz',
'testimonials.7.location': 'Colombia',
'testimonials.7.text': 'El canal de YouTube de Julián es una mina de oro para cualquiera que piense en subir el Aconcagua. Yo lo seguí durante un año entero antes de mi expedición y fue la mejor decisión. Su guía completa cubre absolutamente todo. ¡Gracias, Juli!',
```

#### Phase 2: i18n Keys — en.ts

```ts
'testimonials.5.name': 'Valentina Ríos',
'testimonials.5.location': 'Colombia',
'testimonials.5.text': 'Julián\'s guidance was fundamental to my Aconcagua expedition. His YouTube videos cover everything you need to know about equipment and acclimatization. I arrived well-prepared thanks to his content. Highly recommended for any mountaineer who wants to attempt this summit!',
'testimonials.6.name': 'Miguel Ángel Pérez',
'testimonials.6.location': 'Mexico',
'testimonials.6.summitDate': 'January 2026',
'testimonials.6.text': 'I climbed Aconcagua in January 2026 and I can say that without the prior preparation from Julián\'s videos, I wouldn\'t have made it. The mountain is brutal, but with the right information and the right mindset, it\'s achievable. Thanks Juli!',
'testimonials.7.name': 'Camila Ruiz',
'testimonials.7.location': 'Colombia',
'testimonials.7.text': 'Julián\'s YouTube channel is a gold mine for anyone thinking about climbing Aconcagua. I followed it for an entire year before my expedition and it was the best decision. His complete guide covers absolutely everything. Thanks, Juli!',
```

#### Phase 3: i18n Keys — zh.ts

```ts
'testimonials.5.name': 'Valentina Ríos',
'testimonials.5.location': '哥伦比亚',
'testimonials.5.text': 'Julian的指导对我的阿空加瓜探险至关重要。他的YouTube视频涵盖了关于装备和高海拔适应所需了解的一切。感谢他的内容，我做好了充分准备。强烈推荐给任何想尝试这座顶峰的登山者！',
'testimonials.6.name': 'Miguel Ángel Pérez',
'testimonials.6.location': '墨西哥',
'testimonials.6.summitDate': '2026年1月',
'testimonials.6.text': '2026年1月我攀登了阿空加瓜，我可以说，如果没有事先通过Julian的视频做准备，我不可能成功。这座山非常艰难，但有了正确的信息和适当的心态，是可以实现的。谢谢Juli！',
'testimonials.7.name': 'Camila Ruiz',
'testimonials.7.location': '哥伦比亚',
'testimonials.7.text': 'Julian的YouTube频道对于任何考虑攀登阿空加瓜的人来说都是一座金矿。我在探险前关注了整整一年，这是最好的决定。他的完整指南涵盖了一切。谢谢Juli！',
```

#### Phase 4: Update Testimonials.astro

Add 3 new entries to the `testimonials` array after the existing entry for `testimonials.3`:

```js
{
  name: t('testimonials.5.name'),
  location: t('testimonials.5.location'),
  summitDate: undefined,
  text: t('testimonials.5.text'),
  initials: 'VR',
  photo: undefined,
  photoAlt: t('testimonials.5.name'),
},
{
  name: t('testimonials.6.name'),
  location: t('testimonials.6.location'),
  summitDate: t('testimonials.6.summitDate'),
  text: t('testimonials.6.text'),
  initials: 'MP',
  photo: undefined,
  photoAlt: t('testimonials.6.name'),
},
{
  name: t('testimonials.7.name'),
  location: t('testimonials.7.location'),
  summitDate: undefined,
  text: t('testimonials.7.text'),
  initials: 'CR',
  photo: undefined,
  photoAlt: t('testimonials.7.name'),
},
```

#### Phase 5: Build Validation

- Run `npm run build`
- Run `npx astro check`

---

## 4. Quality Gates

- [ ] `astro build` passes with zero errors
- [ ] `astro check` reports zero diagnostics
- [ ] Carousel now shows 6 slides (dots show 6 indicators)
- [ ] Testimonials 5, 6, 7 show initials avatars (VR, MP, CR)
- [ ] Testimonial 6 (Miguel) shows summit date badge "enero de 2026"
- [ ] All three locale pages build without errors

---

## 5. Acceptance Criteria

- [ ] `testimonials.5.*`, `testimonials.6.*`, `testimonials.7.*` keys added to es, en, zh locale files
- [ ] `Testimonials.astro` array includes entries for testimonials 5, 6, 7
- [ ] No regressions to existing 3 testimonials
- [ ] Carousel navigation works for all 6 slides
- [ ] Builds successfully on all 3 locales
