# Feature Specification: Add Testimonials 7, 8 & 9

## 1. Design Analysis

**Target Scope:** `aconcagua` — Astro 5 static multilingual website (`src/`)

**Affected Layers:**
- UI / Presentation: `Testimonials.astro`
- i18n: Add `testimonials.7.*`, `testimonials.8.*`, `testimonials.9.*` keys to all three locale files

**Problem Statement:**
The testimonials carousel currently displays 5 real client testimonials (Marcelo Simionato, Catalina Caicedo, Ricardo Peralta, Guiselle Fonsepi, Mariano Neme). Three additional real client testimonials are ready to be published: Paul Quinteros (Ecuador), Carlos Mendoza (Colombia), and Ana Paula Ferreira (Brazil). Adding them expands the social proof on the landing page.

**Solution Strategy:**
1. Add translation keys `testimonials.7.*`, `testimonials.8.*`, `testimonials.9.*` to `src/i18n/es.ts`, `src/i18n/en.ts`, and `src/i18n/zh.ts`.
2. Register three new entries in the `testimonials[]` array in `src/components/Testimonials.astro`.

**Entry Point:**
`Testimonials.astro` → `TestimonialCard.astro` — carousel auto-scales to array length.

**User Story:**
> As a website visitor, I want to read Paul Quinteros's, Carlos Mendoza's, and Ana Paula Ferreira's testimonials so that I can see broader social proof from real clients of Julián Kusi.

---

## 2. Architecture & Data

### Architecture

```
i18n/{es,en,zh}.ts  →  Testimonials.astro (t() lookup)  →  TestimonialCard.astro  →  Carousel DOM
```

### Data Changes
- [ ] DB Schema: **None**
- [ ] API Contracts: **None**
- [ ] State Models: Three new testimonial objects in `Testimonials.astro` array
- [x] i18n Keys: Add `testimonials.7.*`, `testimonials.8.*`, `testimonials.9.*` to `es.ts`, `en.ts`, `zh.ts`

---

## 3. Testimonial Content

### Testimonial 7 — Paul Quinteros (Ecuador)
- **Initials:** PQ
- **Photo:** `https://firebasestorage.googleapis.com/v0/b/aconcagua-co.firebasestorage.app/o/Paul%20Quinteros.jpg?alt=media&token=37a8760e-cb6b-4379-89cf-b2c466d09849`
- **ES:** `1000 gracias por todo hermano te agradezco bastante y si es que estás en Ecuador no dudes en avisarme que que yo te recibo ahí con todo el cariño y todo todo el aprecio estimado Julián`
- **EN:** `1000 thanks for everything brother, I really appreciate it, and if you are ever in Ecuador do not hesitate to let me know — I will welcome you with all the love and appreciation in the world, dear Julián.`
- **ZH:** `千万个感谢，兄弟，非常感激你。如果你有机会来厄瓜多尔，一定告诉我，我会用全部的爱和敬意来迎接你，亲爱的Julián。`

### Testimonial 8 — Carlos Mendoza (Colombia)
- **Initials:** CM
- **Photo:** `undefined` (initials fallback)
- **ES:** `Julián es sin duda uno de los mejores recursos que encontré al prepararme para el Aconcagua. Su canal de YouTube es una guía completa: desde el equipo hasta la aclimatación, todo explicado con claridad y honestidad. Gracias a sus consejos llegué bien preparado y logré llegar a cumbre. Es de esas personas que realmente quieren que otros alcancen su sueño. Mil gracias Julián, ¡hasta la próxima montaña!`
- **EN:** `Julián is without a doubt one of the best resources I found when preparing for Aconcagua. His YouTube channel is a complete guide — from gear to acclimatization, everything explained with clarity and honesty. Thanks to his advice I arrived well prepared and made it to the summit. He is one of those people who genuinely wants others to achieve their dream. A thousand thanks Julián — see you on the next mountain!`
- **ZH:** `Julián无疑是我在准备阿空加瓜登山时找到的最佳资源之一。他的YouTube频道是一份完整的指南——从装备到适应高原反应，一切都讲解得清晰真实。凭借他的建议，我做好了充分准备，最终成功登顶。他是那种真心希望别人实现梦想的人。衷心感谢Julián，下一座山峰再见！`

### Testimonial 9 — Ana Paula Ferreira (Brazil)
- **Initials:** AF
- **Photo:** `undefined` (initials fallback)
- **ES:** `Conheci o trabalho do Julián através do YouTube e foi fundamental na minha preparação para o Aconcagua. Ele explica cada detalhe de forma clara e acessível, desde o equipamento até a estratégia de aclimatação. Apliquei todos os seus conselhos durante minha expedição em janeiro de 2026 e consegui chegar ao cume. Muito obrigada, Julián! Você é incrível e espero subir com você algum dia.`
- **EN:** `I discovered Julián's work through YouTube and it was fundamental in my preparation for Aconcagua. He explains every detail in a clear and accessible way, from gear to acclimatization strategy. I applied all his advice during my expedition in January 2026 and managed to reach the summit. Thank you so much, Julián! You are incredible and I hope to climb with you someday.`
- **ZH:** `我通过YouTube发现了Julián的工作，它对我的阿空加瓜准备至关重要。他以清晰易懂的方式解释每一个细节，从装备到高原适应策略。我在2026年1月的探险中运用了他的所有建议，最终成功登顶。非常感谢你，Julián！你真的太厉害了，希望有一天能和你一起攀登。`

---

## 4. Implementation Plan

### Affected Files

- `src/i18n/es.ts` — Add `testimonials.7.*`, `testimonials.8.*`, `testimonials.9.*` keys
- `src/i18n/en.ts` — Add `testimonials.7.*`, `testimonials.8.*`, `testimonials.9.*` keys
- `src/i18n/zh.ts` — Add `testimonials.7.*`, `testimonials.8.*`, `testimonials.9.*` keys
- `src/components/Testimonials.astro` — Append 3 new testimonial objects to the `testimonials[]` array

---

### Execution Steps

#### Phase 1: i18n Translations

Add keys to all three locale files following the existing pattern (`testimonials.N.name`, `testimonials.N.location`, `testimonials.N.text`).

#### Phase 2: Component Registration

Append to `testimonials[]` in `Testimonials.astro`:
- Testimonial 7: `{ name, location, summitDate: undefined, text, initials: 'PQ', photo: '<firebase_url>', photoAlt }`
- Testimonial 8: `{ name, location, summitDate: undefined, text, initials: 'CM', photo: undefined, photoAlt }`
- Testimonial 9: `{ name, location, summitDate: undefined, text, initials: 'AF', photo: undefined, photoAlt }`

#### Phase 3: Build Validation

- Run `npm run build`
- Run `npx astro check`

---

## 5. Quality Gates

- [ ] `astro build` passes with zero errors
- [ ] `astro check` reports zero diagnostics
- [ ] All three locale pages build without errors
- [ ] New testimonials appear in carousel for all three languages
- [ ] No regressions to existing testimonials (1, 2, 3, 5, 6)

---

## 6. Acceptance Criteria

- [ ] `testimonials.7.*`, `testimonials.8.*`, `testimonials.9.*` keys present in `es.ts`, `en.ts`, `zh.ts`
- [ ] Three new testimonial objects appended to `testimonials[]` array in `Testimonials.astro`
- [ ] Carousel dots auto-scale to 8 total slides
- [ ] Paul Quinteros photo loads from Firebase Storage
- [ ] Carlos Mendoza and Ana Paula Ferreira display initials fallback avatar
- [ ] Build passes without errors across all 3 locales
