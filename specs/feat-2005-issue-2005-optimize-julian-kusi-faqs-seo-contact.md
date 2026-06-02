# Feature Specification: Optimize Julián Kusi FAQs — SEO content + clickable contact links

> **TL;DR (≤2 sentences):** Enrich the "¿Quién es Julián Kusi?" and "¿Por qué elegir a Julián Kusi…?" FAQ answers with the provided biographical/three-pillars narrative (mixed into the existing answers, all three locales), and turn the WhatsApp number and the "30-minute consultation" phrase inside the "¿Cómo contacto…?" answer into a clickable `wa.me` link and a Calendly popup trigger. Done by editing the three i18n dictionaries plus a targeted special-case render in `FAQ.astro`.
> **Tier:** M · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/SJtInmGfsUMP9LDoDWzw`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git (fetch & push)`
**Git status at planning time (summary):** On branch `chore/faqs_content_ux_seo_updates`; one untracked file (`bitbucket-api.sh`); nothing staged.
**Remote vs `issue_json.git.repository`:** match (`github.com/juequinterore/aconcagua.git`).

**Source files consulted:** `docs/PROJECT.md`, `package.json`, `astro.config.mjs`, `src/components/FAQ.astro`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`, `src/scripts/analytics.ts` (grep), `src/components/CTA.astro` / `Hero.astro` / `Nav.astro` / `PricingCard.astro` (Calendly invocation pattern, grep), `src/components/Footer.astro` (wa.me link pattern, grep).

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions (multilingual: es/en/zh).
**Project Type:** Single Astro package (SSG), not a monorepo.
**Primary Stack:** Astro v5.17.3, TypeScript (strict), plain CSS with design tokens. No UI framework, no Tailwind.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (runs `@astrojs/check` type-check)
- Test: `N/A — no test suite exists`
- Lint/Format: `N/A — none configured`

**Validation Gate (authoritative "is this working?" signal):** `npm run build` (must pass with zero errors and zero `@astrojs/check` warnings), followed by manual browser verification at `/`, `/en/`, `/zh/`.

**Directory Structure (relevant portions):**
```
src/
├── components/
│   └── FAQ.astro          # FAQ section: categories array, special-case render for guide-contact, FAQPage JSON-LD
├── i18n/
│   ├── es.ts              # Spanish (default) — faq.qa.* keys ~lines 291–314
│   ├── en.ts              # English
│   └── zh.ts              # Chinese
└── pages/
    ├── index.astro        # ES landing — renders <FAQ>
    ├── en/index.astro
    └── zh/index.astro
```

**Exposure Model:** File-based routing; each locale page composes shared components with `lang` + `t(key)`. `FAQ.astro` is already imported and rendered on all three landing pages (verified: `faq` appears in `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`). No new component, route, or nav entry is needed — this change modifies an already-exposed section.

**Locale / Multi-Surface Requirements:** es (default), en, zh — all three i18n dictionaries must stay in parity. Every user-visible string must exist in `es.ts`, `en.ts`, and `zh.ts` (missing keys silently fall back to Spanish — treated as a bug).

**Conventions Observed:**
- i18n keys: dot-namespaced (e.g., `faq.qa.guide-who.a`).
- FAQ answer rendering: `item.a.split('\n\n').map(p => <p>{p}</p>)` — answer text is rendered as **escaped text**, so HTML/links cannot be embedded via the translation string. Multi-paragraph answers use `\n\n` as the separator (verified in `FAQ.astro` lines 135–137).
- Special-case render already exists for `item.id === 'guide-contact'` (the `faq-contact-links` row, `FAQ.astro` lines 138–151) — the same conditional mechanism is the precedent for any inline markup in an answer.
- Calendly booking: invoked site-wide via a `<button onclick={`Calendly.initPopupWidget({url: '${t('calendly.url')}'}); return false;`}>` (verified in `Hero.astro:32`, `CTA.astro:35`, `Nav.astro:53/98`, `PricingCard.astro:58`). The widget JS/CSS is loaded once in `BaseLayout.astro`. `calendly.url` = `https://calendly.com/juliankusi/30min` (all locales).
- WhatsApp: anchored as `https://wa.me/573146294318` with `target="_blank" rel="noopener noreferrer"` (verified in `Footer.astro:36/149`, `FAQ.astro:12`).
- Analytics auto-instrumentation (verified in `src/scripts/analytics.ts`): `button[onclick*="Calendly"]` → `calendly_open` event (line 50); `a[href*="wa.me"]` → WhatsApp tracking (line 89). Using these two exact mechanisms means the new links are tracked with **no analytics changes required**.
- External links: `rel="noopener noreferrer"` + `target="_blank"`.
- Styling: component-scoped `<style>`; consume design tokens (`--accent`, `--accent-hover`, etc.); no hardcoded hex.

**Reserved Paths / Redirects / Route Collisions to avoid:** `/globalrescue`, `/pire`, `/en/pire` (in `astro.config.mjs`). Not relevant to this change (no routing changes).

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` (accurate and complete) — no `docs/PROJECT.md` created.

**Change Tier:** M — 4 files modified (3 i18n dictionaries + `FAQ.astro`); no schema/migration, no new dependencies, no new routes/components, reuses existing render + Calendly + wa.me patterns.

## 1. Design Analysis

**Target Scope:** The FAQ section — specifically the "Sobre tu Guía" category's `guide-who`, `guide-why`, and `guide-contact` items, plus their translation strings.
**Affected Layers:** Content/i18n (`es.ts`/`en.ts`/`zh.ts`) and presentation (`FAQ.astro` render + scoped styles + FAQPage JSON-LD assembly).
**Problem Statement (from issue_json):**
1. The "¿Quién es Julián Kusi?" answer should be enriched by **mixing in** the provided biographical narrative (Medellín/Valle de Aburrá origins, age-20 move to Mendoza for kitchen work, first contact with Aconcagua base camps, decision to train as a guide) with the existing answer — not replacing it — for reader impact and SEO/GEO.
2. The "¿Por qué elegir a Julián Kusi…?" answer should be enriched by **mixing in** the provided "three pillars" narrative (knowledge from the ground up; empathy/adaptation to the new climber; trust that builds loyalty) — not replacing it.
3. In the "¿Cómo contacto…?" answer, the WhatsApp number ("Al WhatsApp +57 314 629 4318") must become a clickable WhatsApp link, and the "30-minute consultation directly from this website" phrase must become a clickable link to the consultation/booking (Calendly) flow — low-friction, clear, SEO/GEO-friendly.

**Solution Strategy:**
- Requirements 1 & 2 are pure content edits: rewrite the `.a` strings for `guide-who` and `guide-why` in all three locales, blending the new narrative with the existing facts. Use `\n\n` to break the "why" answer into the lead-in + three pillar paragraphs (matching the existing multi-paragraph render). Keep the answer text plain (it feeds the FAQPage JSON-LD `text` field too).
- Requirement 3 needs inline interactive elements inside an answer, which the generic escaped-text render cannot produce. Reuse the existing `item.id === 'guide-contact'` conditional in `FAQ.astro` to render a **dedicated contact answer** assembled from segmented i18n strings interleaved with: (a) an inline `<a href="https://wa.me/573146294318" target="_blank" rel="noopener noreferrer">` for the phone, and (b) an inline Calendly `<button onclick="Calendly.initPopupWidget({url: t('calendly.url')})…">` styled as a text link for the consultation. The existing `faq-contact-links` row (Email · WhatsApp · Instagram · TikTok) stays as-is.
- Keep the FAQPage JSON-LD `text` for `guide-contact` as clean plain text by concatenating the same segments without markup.

**Entry Point / Exposure:** `FAQ.astro` is already rendered on all three landing pages — no wiring changes. The contact answer's interactive elements reuse already-loaded Calendly (BaseLayout) and already-instrumented analytics selectors.

**Locale / Surface Coverage:** es, en, zh — all three dictionaries updated for every changed/added key. The new "who"/"why" narrative is provided in Spanish; equivalent English and Chinese integrations must be authored to maintain parity (no machine-fallback gaps).

**User Story:** As a prospective Aconcagua client reading the FAQ, I want a richer guide story and one-tap WhatsApp/booking access from the contact answer, so that I trust the guide and can reach him with minimal friction.

## 2. Architecture & Data

### Architecture
No structural change. The FAQ remains a static section driven by the `categories` array in `FAQ.astro`, with answers sourced from i18n. The only code change is extending the existing `item.id === 'guide-contact'` conditional branch to render an inline-linked contact answer, and adjusting the FAQPage JSON-LD so the `guide-contact` entry's `text` is built from the contact segments (clean plain text) rather than a now-removed single `.a` string. Reuses: the Calendly popup button pattern (`Hero/CTA/Nav/PricingCard`), the `wa.me` anchor pattern (`Footer`, existing FAQ links row), and the analytics selectors in `src/scripts/analytics.ts`.

### Data Changes
- [ ] Translation / i18n keys: **Modify** `faq.qa.guide-who.a` and `faq.qa.guide-why.a` (es/en/zh). **Restructure** the `guide-contact` answer from the single `faq.qa.guide-contact.a` string into segmented keys so inline links can be interleaved (see Implementation Plan for the recommended segmentation). The existing `faq.qa.guide-contact.links_intro` / `link_*` keys are unchanged.
- [ ] Schema / migration changes: None.
- [ ] Config changes: None.
- [ ] Static assets: None.
- [ ] New dependencies: None (Calendly + analytics already present).

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `src/i18n/es.ts` (Modify — keys `faq.qa.guide-who.a`, `faq.qa.guide-why.a`, and the `faq.qa.guide-contact.*` answer keys — integrate new Spanish narrative; segment the contact answer)
- `src/i18n/en.ts` (Modify — same keys — author the equivalent English integrations and contact segments)
- `src/i18n/zh.ts` (Modify — same keys — author the equivalent Chinese integrations and contact segments)
- `src/components/FAQ.astro` (Modify — the `categories`/`faqPageSchema` construction and the `item.id === 'guide-contact'` render branch in the answer template, plus scoped `<style>` — render the contact answer with an inline `wa.me` anchor and an inline Calendly `<button>`; keep JSON-LD `text` as plain string)

### Execution Steps

**Phase 1: Content / i18n (`es.ts`, `en.ts`, `zh.ts`)**
- [ ] **`guide-who.a`** — Rewrite to blend the existing facts (certified guide, base in Mendoza, 2013 cook → porter → official EPGAMT certification, 17 Aconcagua summits, 10+ years, top safety standards) with the new biographical narrative (born in Medellín / Valle de Aburrá ~1,500 msnm, grew up surrounded by mountains; at age 20 moved to Mendoza for kitchen work, which brought him to Aconcagua base camps; that first contact sparked his mountaineering passion; he settled in Mendoza to study the professional mountain-guide career and rose through every rung — base logistics, high-altitude porter, then experienced guide). Keep it a single rich paragraph or split with `\n\n` if it reads better. Do **not** drop the existing summit/certification facts. Author es (provided text is the source), then equivalent en and zh.
- [ ] **`guide-why.a`** — Rewrite to blend the existing differentiators (17 summits, EPGAMT + WFR, trilingual es/en/zh, route knowledge, safety-first, above-average success rate, only trilingual certified guide) with the new "three pillars" narrative. Use `\n\n` to produce a lead-in paragraph + three pillar paragraphs:
  - Pillar 1 — "Conocimiento de la montaña desde la raíz" (started 2013 in base camps, 3 seasons, then porter in high camps, guide since 2017; understands Aconcagua from every perspective).
  - Pillar 2 — "Empatía y adaptación al nuevo escalador" (today's climber profile; first-time 6,000 m / double boots; patience, pedagogy, listening; he trains and accompanies, not just guides).
  - Pillar 3 — "Confianza que genera fidelidad" (human/didactic approach; clients feel safe; many return after a weather/physical turnaround; verify his methodology on social media).
  Author es, then equivalent en and zh. Reconcile the year discrepancy (existing copy: official EPGAMT certification 2018; new copy: "guía desde 2017") so the merged text is internally consistent — see Edge Cases.
- [ ] **`guide-contact` answer segmentation** — Replace the single `faq.qa.guide-contact.a` string with segments the component can interleave with inline elements. Recommended key set (implementer may adjust segment boundaries per language word-order):
  - `faq.qa.guide-contact.a_intro` — text before the WhatsApp number, e.g. ES: `"Podés contactar a Julián Kusi por correo electrónico a julian@aconcagua.co, por WhatsApp al "`
  - `faq.qa.guide-contact.a_whatsapp_label` — the linked phone text, e.g. `"+57 314 629 4318"`
  - `faq.qa.guide-contact.a_mid` — text between phone link and consultation link, e.g. ES: `", o agendando una "`
  - `faq.qa.guide-contact.a_consult_label` — the linked consultation text, e.g. ES: `"asesoría gratuita de 30 minutos directamente desde este sitio web"`
  - `faq.qa.guide-contact.a_outro` — trailing text, e.g. ES: `"."`
  Provide all five segments for es, en, and zh (en consult label ≈ "free 30-minute consultation directly from this website"; zh ordered naturally). Keep `links_intro` and `link_*` keys unchanged.

**Phase 2: Implementation (`FAQ.astro`)**
- [ ] In the answer template, branch on `item.id === 'guide-contact'` to render the contact answer as a single `<p class="faq-answer-contact">` composed of: `a_intro` text + an inline `<a class="faq-inline-link" href="https://wa.me/573146294318" target="_blank" rel="noopener noreferrer">{a_whatsapp_label}</a>` + `a_mid` text + an inline `<button type="button" class="faq-inline-link faq-inline-button" onclick={`Calendly.initPopupWidget({url: '${t('calendly.url')}'}); return false;`}>{a_consult_label}</button>` + `a_outro` text. For all other items keep the existing `item.a.split('\n\n').map(...)` render. (Note: a `<button>` is valid phrasing content inside `<p>`.)
- [ ] Add scoped styles: a `.faq-inline-link` rule matching the existing `.faq-contact-links a` look (color `var(--accent)`, underline, `text-underline-offset: 2px`, hover `var(--accent-hover)`), and `.faq-inline-button` resets so the button reads as inline text (`background: none; border: 0; padding: 0; font: inherit; cursor: pointer;`). No hardcoded colors — tokens only.
- [ ] Update `faqPageSchema` so the `guide-contact` question's `acceptedAnswer.text` is built from the plain concatenation of the contact segments (`a_intro + a_whatsapp_label + a_mid + a_consult_label + a_outro`, whitespace-normalized) instead of the removed `item.a`. Keep all other questions reading `item.a` as before. Ensure the `categories[...].items` entry for `guide-contact` no longer references a non-existent `faq.qa.guide-contact.a` key (build/type-check must stay green).

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] No new exposure wiring required: `FAQ.astro` is already imported/rendered in `src/pages/index.astro`, `src/pages/en/index.astro`, and `src/pages/zh/index.astro`. Confirm the section still renders on all three locales after the changes.
- [ ] Confirm the Calendly button uses `t('calendly.url')` so it inherits the per-locale value (identical across locales today, but keep the indirection).

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` — zero errors, zero `@astrojs/check` warnings.
- [ ] Manual verification (Section 5) across `/`, `/en/`, `/zh/`.

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```

### Quality Gates
- [ ] `npm run build` exits 0 with no errors and no `@astrojs/check` warnings.
- [ ] No reference to a removed/renamed i18n key remains in `FAQ.astro` (no fallback-to-Spanish from a typo'd key).
- [ ] All new/changed keys exist in **all three** dictionaries (es, en, zh) — no single-locale keys.
- [ ] FAQPage JSON-LD still emits a valid object: the `guide-contact` answer `text` is clean plain text (no HTML, no `undefined`).
- [ ] No hardcoded hex colors introduced — inline link/button use `--accent` / `--accent-hover`.
- [ ] No new dependencies.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm run dev` running (or `npm run preview` after a build).

**Scenario (repeat for `/`, `/en/`, `/zh/`):**
1. [ ] Scroll to the FAQ section → "Sobre tu Guía" category.
2. [ ] Open "¿Quién es Julián Kusi?" → answer includes both the existing summit/certification facts **and** the new biographical narrative (Medellín origins, Mendoza/kitchen → base camps → guide path); reads coherently in the locale's language.
3. [ ] Open "¿Por qué elegir a Julián Kusi…?" → answer shows the lead-in plus the three pillars, integrated with the existing differentiators; paragraphs render distinctly.
4. [ ] Open "¿Cómo contacto…?" → the WhatsApp number is a link; clicking opens `wa.me/573146294318` (new tab). The "30-minute consultation" phrase is a link; clicking opens the Calendly popup widget. The Email · WhatsApp · Instagram · TikTok row still renders below.
5. [ ] Toggle light/dark theme → inline links use accent tokens and remain legible; no layout break.
6. [ ] View page source / DevTools → the FAQPage `application/ld+json` block parses and the contact answer `text` is plain (no tags).

**Success Criteria:**
- ✅ "Who"/"Why" answers contain the new narrative mixed with (not replacing) the prior content, in all three locales.
- ✅ WhatsApp number → `wa.me` link; consultation phrase → Calendly popup, in all three locales.
- ✅ `npm run build` passes.

## 6. Coverage Requirements

- [ ] No test suite exists in this project — the manual verification script above **is** the coverage.
- [ ] Edge cases to consider:
  - **Year consistency:** existing copy says official EPGAMT certification in 2018; new pillar copy says "guía desde 2017". Reconcile so the merged narrative is internally consistent (e.g., began guiding in 2017, obtained official certification in 2018) — do not emit contradictory years.
  - **JSON-LD integrity:** the `guide-contact` schema `text` must remain a plain concatenated string after the answer is restructured.
  - **i18n parity:** every segment key present in es, en, and zh (Chinese word order may require reordering the intro/mid/outro segments around the labels).
  - **`\n\n` paragraph splitting** still applies to `guide-who`/`guide-why`; ensure no stray empty paragraphs.

## 7. Acceptance Criteria (Definition of Done)

- [ ] `guide-who.a` and `guide-why.a` enriched (mixed, not replaced) in es/en/zh.
- [ ] `guide-contact` answer renders an inline `wa.me` WhatsApp link and an inline Calendly consultation trigger in es/en/zh; existing contact-links row preserved.
- [ ] `npm run build` passes with zero errors/warnings.
- [ ] Manual verification script completed on `/`, `/en/`, `/zh/`, light + dark.
- [ ] No new dependencies; no hardcoded colors; analytics selectors (`a[href*="wa.me"]`, `button[onclick*="Calendly"]`) satisfied.
- [ ] Traceability: issue req 1 → `guide-who.a` edits; req 2 → `guide-why.a` edits; req 3 → `guide-contact` segmentation + `FAQ.astro` inline render.
