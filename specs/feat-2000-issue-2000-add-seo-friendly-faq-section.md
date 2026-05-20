# Feature Specification: SEO-friendly FAQ Section

> **TL;DR (≤2 sentences):** Add a new accordion-based FAQ section to the landing page (between Testimonials and CTA on all three locales) populated from the provided Spanish Q&As organised by category, plus a `FAQPage` JSON-LD block per locale for SEO/GEO. The section reuses the project's existing component / i18n / token / nav-link patterns — no new dependencies, no schema/route changes.
> **Tier:** M · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/gOIETHdEoMqvvYgMDUkB`
**Git remote(s) (from `git remote -v`):** `origin → git@github.com:juequinterore/aconcagua.git` (fetch & push)
**Git status at planning time (summary):** On branch `chore/add_seo_geo_faq_section`; clean working tree except one untracked file `bitbucket-api.sh` (unrelated to this feature).
**Remote vs `issue_json.git.repository`:** match (`git@github.com:juequinterore/aconcagua.git` is the SSH form of `https://github.com/juequinterore/aconcagua.git`).

**Source files consulted:**
- `docs/PROJECT.md` (authoritative project doc — already exists, complete)
- `package.json`, `astro.config.mjs`, `tsconfig.json`
- `src/layouts/BaseLayout.astro` (head/meta/JSON-LD pattern)
- `src/components/Nav.astro` (navLinks array — exposure surface)
- `src/components/About.astro`, `src/components/Testimonials.astro` (section/component conventions)
- `src/components/Footer.astro` (footer-nav reuses `navLinks`-style array)
- `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro` (landing-page composition)
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`, `src/i18n/utils.ts`
- `src/styles/global.css` (design tokens)

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions. Three locales (es default, en, zh), Firebase Hosting deploy, no SSR.
**Project Type:** Single Astro package (not a monorepo), static site (SSG).
**Primary Stack:** Astro v5.17.3 · TypeScript (strict) · plain CSS with design tokens · `@astrojs/sitemap` · `@astrojs/check` (type-check at build).
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`  *(runs `astro build` which includes `@astrojs/check` type-check)*
- Test: N/A — **no test suite exists**. Validation is via `npm run build` + manual browser verification across all three locales (`docs/PROJECT.md` ll. 39, 196–198).
- Lint/Format: N/A — no linter / formatter configured.

**Validation Gate (authoritative "is this working?" signal):** `npm run build` must exit 0 with zero errors and zero `@astrojs/check` warnings.

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs              # site, redirects, i18n (es default, no prefix)
├── package.json
├── tsconfig.json
└── src/
    ├── components/
    │   ├── Nav.astro             # navLinks array (line 13)  ← exposure surface
    │   ├── About.astro           # section component pattern reference
    │   ├── Testimonials.astro    # section component pattern reference
    │   ├── CTA.astro             # FAQ will be placed immediately above this
    │   └── Footer.astro          # navLinks-style array (line 9)
    ├── i18n/
    │   ├── es.ts                 # Spanish (default)
    │   ├── en.ts                 # English
    │   ├── zh.ts                 # Chinese
    │   └── utils.ts              # useTranslations (silent es fallback for missing keys)
    ├── layouts/
    │   └── BaseLayout.astro      # head/meta/JSON-LD pattern
    ├── pages/
    │   ├── index.astro           # ES landing
    │   ├── en/index.astro        # EN landing
    │   └── zh/index.astro        # ZH landing
    └── styles/
        └── global.css            # design tokens (--text-*, --bg-*, --section-*-bg, --radius-*, --accent, etc.)
```

**Exposure Model:** File-based routing. Landing-page sections are anchor-scroll sections (e.g., `#sobre`, `#expediciones`, `#testimonios`, `#comunidad`). Each section is a `.astro` component that takes `{ lang, t }` props, is imported and rendered inside the `<main>` of each locale's `index.astro`, and (when top-level) gets an entry in the hardcoded `navLinks` array of `src/components/Nav.astro` (which feeds both the desktop nav and the mobile overlay) and typically also in the `Footer.astro` navigation column. Pattern is documented in `docs/PROJECT.md` §"Navigation (hardcoded — CRITICAL)" and §"Feature Workflow".

**Locale / Multi-Surface Requirements:** Three locales must stay in parity: `es` (default, served at `/`), `en` (served at `/en/`), `zh` (served at `/zh/`). Every user-visible string MUST exist in all three i18n dictionaries (`docs/PROJECT.md` §"i18n Rules"). The FAQ section MUST be rendered on all three landing pages, the nav entry MUST appear in all three nav dictionaries, and a `FAQPage` JSON-LD block MUST be emitted per locale (locale-specific URL & text).

**Conventions Observed:**
- **File naming:** components are PascalCase `.astro` (e.g., `Testimonials.astro`); pages are lowercase `.astro`. → New file: `src/components/FAQ.astro`.
- **Component contract:** section components receive `{ lang: 'es' | 'en' | 'zh'; t: (key: string) => string }` (see `Testimonials.astro` ll. 4–9, `About.astro` ll. 2–7).
- **Section markup:** `<section id="<anchor>" class="<name> section-pad"><div class="container"> … </div></section>` with a `.tag` eyebrow + `<h2>` heading (`Testimonials.astro` ll. 66–71, `About.astro` ll. 17–48).
- **Styling:** component-scoped `<style>` block at the bottom of each component; global tokens live in `src/styles/global.css`. **No hardcoded hex colors** in new components (`docs/PROJECT.md` §"Prohibitions"). Use `--text-primary`, `--text-secondary`, `--text-muted`, `--bg-card`, `--border-card`, `--accent`, `--radius-md`/`--radius-lg`, `--shadow-card`, `--fs-h1`/`--fs-h3`/`--fs-body`/`--fs-small`, `--section-pad`, `--container`.
- **Section background token:** existing sections each have a dedicated `--section-<name>-bg` token in `:root` and `[data-theme="light"]` (`global.css` ll. 47–53, 79–84). A new `--section-faq-bg` SHOULD be added with an alt-band value that contrasts the adjacent Testimonials (`--bg-base`) and CTA sections (CTA is intentionally dark — exception). Choose `var(--bg-section-alt)` for dark/light parity matching the Pricing/About zig-zag pattern.
- **Reveal animations:** elements use `class="reveal"` / `reveal-left` / `reveal-right` (+ `reveal-delay-*`) — already observed by the global IntersectionObserver in `BaseLayout.astro` ll. 404–430. New section should opt in for header + cards.
- **i18n keys:** dot-namespaced, single namespace per dict file. New namespace: `faq.*`. Keep alphabetical/grouping comment consistent with existing dictionary block-comment style (`// FAQ`).
- **i18n missing-key behaviour:** `src/i18n/utils.ts` silently falls back to Spanish if a key is missing in `en`/`zh`. The project doc explicitly calls this a *bug*, not a feature — so every new key MUST be added to all three dictionaries.
- **JSON-LD pattern:** `BaseLayout.astro` ll. 31–153, 220–223 already injects a `LocalBusiness` + `Person` JSON-LD block per page. A `FAQPage` schema is a natural fit for this layout; emitting it from inside `FAQ.astro` (component-local `<script type="application/ld+json" set:html={…} />`) is consistent with Astro practice and avoids plumbing FAQ data up into the layout. Multiple JSON-LD `<script>` tags per page are valid per Schema.org / Google guidance.
- **External links pattern:** `target="_blank" rel="noopener noreferrer"` (`Nav.astro` ll. 32–35) — N/A for this feature but documents the convention.

**Reserved Paths / Redirects / Route Collisions to avoid:** Per `astro.config.mjs` ll. 6–10: `/globalrescue`, `/pire`, `/en/pire` are redirects. The FAQ section uses an in-page anchor (`#faq`) — no new top-level route, so no collision risk. `#faq` is not used by any existing component (verified by reading every existing section anchor: `#sobre`, `#expediciones`/`#plan-N`, `#testimonios`, `#comunidad`).

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` (already complete and authoritative). **No new `docs/PROJECT.md` will be created.**

**Change Tier:** **M** — 1 new component + 1 new section-background token + 9 file modifications (Nav, 3 i18n dicts, 3 page files, global.css, Footer). No schema/migration, no new dependencies, no new routes, no new external API.

## 1. Design Analysis

**Target Scope:** UI / content layer of the landing page only. No data, no API, no routing.
**Affected Layers:** Components (new `FAQ.astro`), navigation (`Nav.astro`), footer link list (`Footer.astro`), i18n (3 dictionaries), landing-page composition (3 `index.astro` pages), design tokens (`global.css`), SEO (FAQPage JSON-LD embedded in the new component).
**Problem Statement:** Visitors lack a single discoverable place that answers high-intent questions about Aconcagua expeditions (season, duration, permits, cost, training, safety). The site also misses an opportunity to surface this content to search engines and generative engines via structured data, hurting SEO/GEO.
**Solution Strategy:** Add a dedicated FAQ landing-page section that (a) presents 18 Q&As across 5 thematic categories using semantic `<details>`/`<summary>` accordions (accessible by default, no JS dependency), (b) is wired into the existing nav/footer exposure surfaces so it is discoverable, (c) emits a single `FAQPage` JSON-LD block per page with `mainEntity` containing every Q&A in plain text. The section composes the same `{ lang, t }` contract as every other section component, so all three locales render uniformly.
**Entry Point / Exposure:**
- New `navLinks` entry `{ key: 'nav.faq', href: '#faq' }` in `src/components/Nav.astro` (line 13 array) — surfaces in desktop nav AND mobile overlay (both rendered from the same array, lines 28–45 and 74–93).
- New entry in `Footer.astro` navigation column (`navLinks` array, line 9–15) — mirrors top nav.
- The `<FAQ />` component is imported and rendered in all three landing pages between `<Testimonials />` and `<CTA />`.
- The section element has `id="faq"` so `#faq` anchor links resolve correctly.
**Locale / Surface Coverage:** All three: `es` (`/`), `en` (`/en/`), `zh` (`/zh/`). One section component reused; per-locale text via `t('faq.*')`. JSON-LD schema constructed inside the component from the same `t()` calls, so it is naturally locale-correct.
**User Story:** As a prospective Aconcagua climber browsing the landing page in my language, I want a clearly organised FAQ that answers my most pressing questions (when to go, how much, do I need a guide, what gear, what about my health) so that I can self-qualify and book the consultation with confidence — and as a search-engine / generative-engine indexer I want machine-readable FAQPage structured data so I can surface these answers in rich results.

## 2. Architecture & Data

### Architecture

`FAQ.astro` follows the exact same shape as `Testimonials.astro` / `About.astro`:

```
<section id="faq" class="faq section-pad">
  <div class="container">
    <header class="faq-header reveal"> <p class="tag">…</p> <h2>…</h2> <p class="faq-subtitle">…</p> </header>
    <div class="faq-categories">
      {categories.map(cat => (
        <div class="faq-category reveal">
          <h3 class="faq-category-title">{cat.title}</h3>
          <ul class="faq-list" role="list">
            {cat.items.map(item => (
              <li class="faq-item">
                <details class="faq-details">
                  <summary class="faq-question">
                    <span>{item.q}</span>
                    <svg class="faq-chevron" aria-hidden="true">…</svg>
                  </summary>
                  <div class="faq-answer"> {item.answerNodes} </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
<script type="application/ld+json" set:html={JSON.stringify(faqPageSchema)} />
<style>…</style>
```

The categories + items array is built locally in the component's frontmatter from `t()` calls (mirrors the `testimonials` array in `Testimonials.astro` ll. 11–57 and the `timeline` array in `About.astro` ll. 9–14). The JSON-LD `mainEntity` is built from the same array, mapped to `{ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }` — guaranteeing the structured data and the rendered text never drift apart.

**Accordion choice:** native `<details>`/`<summary>` — zero JS, keyboard-accessible by default, prefers-reduced-motion respected by default, indexed by search engines (content remains in DOM regardless of open state). One item per category may use `open` attribute on the first item by default (`docs/PROJECT.md`-consistent — implementer decision: keep all closed by default for cleanest first-paint).

**Subtle CSS animation:** rotate the chevron 180° when `details[open]`. Wrap rotation in `@media (prefers-reduced-motion: no-preference)` per project convention (see `Testimonials.astro` ll. 171–175, 217–221).

**Multi-paragraph answers:** the longest answer (`total-cost.a`) describes three pricing tiers + key factors. Store it as one string with `\n\n` paragraph separators and render with `.split('\n\n').map(p => <p>{p}</p>)` so it reads as readable paragraphs in the UI, while the same string (joined) populates the JSON-LD `acceptedAnswer.text`. Apply the same `split('\n\n')` rendering to every answer for consistency (single-paragraph answers contain no `\n\n` and render unchanged).

### Data Changes

- [x] **Translation / i18n keys added** — new namespace `faq.*` in all three dictionaries (`src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`). Full key list below; total **47 new keys per locale** (= 141 strings total).
- [ ] **Schema / migration changes:** None — static site, no database.
- [x] **Config changes:** None to `astro.config.mjs`. One new CSS custom property added to `src/styles/global.css` (`--section-faq-bg`) in both the dark `:root`, the `[data-theme="light"]` block, and the no-JS `@media (prefers-color-scheme: light)` fallback.
- [ ] **Static assets added:** None (no images or icons beyond inline SVG chevron drawn with `currentColor`).
- [ ] **New dependencies:** None.

#### New i18n keys (full list)

Add under a `// FAQ` block-comment in each dictionary, between the existing `// Accessibility` block (last in `es.ts` line 196) and the closing `};`. **Add identical key list to `en.ts` and `zh.ts`.**

```
'nav.faq'                              # nav entry label

# Section header
'faq.tag'                              # eyebrow (e.g. 'PREGUNTAS FRECUENTES')
'faq.title'                            # H2 (e.g. 'Preguntas frecuentes')
'faq.subtitle'                         # short lead under H2

# Category titles
'faq.category.general.title'           # 'General y Logística'
'faq.category.permits.title'           # 'Permisos y Requisitos Legales'
'faq.category.preparation.title'       # 'Preparación Técnica y Equipo'
'faq.category.health.title'            # 'Salud y Seguridad'
'faq.category.investment.title'        # 'Inversión'

# General y Logística (6 Q&As)
'faq.qa.best-season.q' / 'faq.qa.best-season.a'
'faq.qa.duration.q' / 'faq.qa.duration.a'
'faq.qa.min-time.q' / 'faq.qa.min-time.a'
'faq.qa.success-rate.q' / 'faq.qa.success-rate.a'
'faq.qa.mules-porters.q' / 'faq.qa.mules-porters.a'
'faq.qa.abandon-expedition.q' / 'faq.qa.abandon-expedition.a'

# Permisos y Requisitos Legales (4 Q&As)
'faq.qa.permit-cost.q' / 'faq.qa.permit-cost.a'
'faq.qa.guide-required.q' / 'faq.qa.guide-required.a'
'faq.qa.minors.q' / 'faq.qa.minors.a'
'faq.qa.insurance.q' / 'faq.qa.insurance.a'

# Preparación Técnica y Equipo (3 Q&As)
'faq.qa.boots.q' / 'faq.qa.boots.a'
'faq.qa.climbing-experience.q' / 'faq.qa.climbing-experience.a'
'faq.qa.training.q' / 'faq.qa.training.a'

# Salud y Seguridad (3 Q&As)
'faq.qa.medical-service.q' / 'faq.qa.medical-service.a'
'faq.qa.altitude-sickness.q' / 'faq.qa.altitude-sickness.a'
'faq.qa.communication.q' / 'faq.qa.communication.a'

# Inversión (2 Q&As)
'faq.qa.total-cost.q' / 'faq.qa.total-cost.a'       # multi-paragraph; '\n\n' separates paragraphs
'faq.qa.recognize-local-company.q' / 'faq.qa.recognize-local-company.a'
```

**Total per locale:** 1 (nav.faq) + 3 (section header) + 5 (category titles) + 18 × 2 (Q+A) = **45 keys × 3 locales = 135 new strings.**
*(Off-by-two correction: 1 + 3 + 5 + 36 = 45. Use this figure; the earlier "47" estimate was loose.)*

#### Spanish source text (canonical — copy verbatim from `issue_json` into `src/i18n/es.ts`)

The Spanish text from `issue_json.content` is the source of truth for every `*.q` / `*.a` value in `es.ts`. The implementer copies each question and answer verbatim, preserving accents, punctuation, and the dollar/USD formatting. For the long `total-cost.a` answer, the implementer joins the four logical paragraphs (intro / Económico / Medio / Alto+factores) with `\n\n` between them — example:

```
El rango total puede ir de USD 2.000 a USD 10.000 dependiendo de la logística.\n\nNivel Económico ~USD 2.000: …\n\nNivel Medio ~USD 3.000 + Permiso y Seguro: …\n\nNivel Alto (~USD 6.000+ + Permiso y Seguro): … Factores clave a tener en cuenta: Costo del Permiso: … Seguro de Evacuación: …
```

#### English & Chinese translations

**Assumption (non-load-bearing):** because the project enforces strict locale parity, the implementer produces faithful, idiomatic English and Chinese translations of every Spanish Q&A above. Match the tone of the existing English and Chinese dictionaries (`en.ts`, `zh.ts`). Preserve all proper nouns (Plaza de Mulas, Plaza Argentina, Pago Fácil, Apostilla de la Haya, La Sportiva, Scarpa, Bestard, Mammut, Starlink, Mal Agudo de Montaña / Acute Mountain Sickness / 高山病) and all numbers exactly. Preserve `\n\n` paragraph separators in the `total-cost.a` translations. If the implementer is uncertain about any phrasing, default to a literal translation rather than a stylistic adaptation.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/components/FAQ.astro` — **Create** — new section component. Implements the structure described in §2 (header → 5 category groups → `<details>`/`<summary>` accordion items → component-local `FAQPage` JSON-LD `<script>` block → scoped `<style>` using design tokens).
- `src/components/Nav.astro` — **Modify** — `navLinks` array (line 13). Insert `{ key: 'nav.faq', href: '#faq' }` immediately before the external `nav.blog` entry so the in-page anchors stay grouped together. No other change to this file.
- `src/components/Footer.astro` — **Modify** — `navLinks` array (line 9). Insert the same `{ key: 'nav.faq', href: '#faq' }` entry in the corresponding position so the footer nav matches the top nav (existing convention — both arrays already mirror each other).
- `src/i18n/es.ts` — **Modify** — append the `// FAQ` block at the end of the object literal (just before the closing `};` on line 198). Spanish values copied verbatim from `issue_json.content` per the canonical text rule in §2. Also add `'nav.faq': 'FAQ'` (or `'Preguntas Frecuentes'` — implementer chooses the shorter form that fits the nav layout; if in doubt, use `'FAQ'` since it is universally recognised, fits naturally next to the existing `'Blog'` external link, and matches the existing short-label convention of the other nav entries).
- `src/i18n/en.ts` — **Modify** — append the same `// FAQ` block at the end of the object (before closing `};` on line 198). All values are English translations of the Spanish source. `'nav.faq': 'FAQ'`.
- `src/i18n/zh.ts` — **Modify** — append the same `// FAQ` block at the end of the object. All values are Chinese translations. `'nav.faq': '常见问题'` (standard Simplified Chinese rendering of "FAQ").
- `src/pages/index.astro` — **Modify** — `import` block (after `import Testimonials …` line 11) and `<main>` composition. Add `import FAQ from '../components/FAQ.astro';` and place `<FAQ lang={lang} t={t} />` between `<Testimonials />` and `<CTA />` (between lines 45 and 46).
- `src/pages/en/index.astro` — **Modify** — same change pattern (relative path `../../components/FAQ.astro`).
- `src/pages/zh/index.astro` — **Modify** — same change pattern (relative path `../../components/FAQ.astro`).
- `src/styles/global.css` — **Modify** — three blocks:
  1. `:root` (dark defaults, around lines 47–53): add `--section-faq-bg: var(--bg-section-alt);` next to the other `--section-*-bg` declarations.
  2. `[data-theme="light"]` (around lines 79–84): add `--section-faq-bg: var(--bg-section-alt);`.
  3. `@media (prefers-color-scheme: light)` no-JS fallback (around line 88+): add the same `--section-faq-bg: var(--bg-section-alt);`. Implementer reads the file to locate exact insertion points by symbol anchor `--section-*-bg`.

**Files explicitly NOT changed (and why):**

- `src/layouts/BaseLayout.astro` — the existing `LocalBusiness` + `Person` JSON-LD must be preserved unchanged. The new `FAQPage` JSON-LD lives inside `FAQ.astro` itself (component-local) so the layout has no FAQ-aware coupling. This keeps the layout reusable for other future pages that may not have an FAQ section (e.g., `privacidad.astro` / `privacy.astro`).
- `astro.config.mjs` — no new route, no redirect change. Sitemap auto-includes the existing pages.
- `firebase.json`, `firestore.rules`, `.firebaserc` — hosting / DB unrelated.
- `public/*` — no new asset.
- `package.json`, `tsconfig.json` — no new dependency, no compiler config change.

### Execution Steps

**Phase 1: Data / Model / Contract**

- [ ] Add `// FAQ` block to `src/i18n/es.ts` with `nav.faq`, `faq.tag`, `faq.title`, `faq.subtitle`, the 5 category-title keys, and all 36 Q+A keys. Values are the verbatim Spanish text from `issue_json.content` (for `*.q` / `*.a`) and short editorial values for `faq.tag` (`'PREGUNTAS FRECUENTES'`), `faq.title` (`'Preguntas frecuentes'`), and `faq.subtitle` (e.g. `'Respuestas a las dudas más comunes sobre el Aconcagua y nuestras expediciones.'`).
- [ ] Add the parallel `// FAQ` block to `src/i18n/en.ts` (English translations; `faq.tag`: `'FREQUENTLY ASKED QUESTIONS'`, `faq.title`: `'Frequently asked questions'`, `faq.subtitle`: English translation of the Spanish subtitle).
- [ ] Add the parallel `// FAQ` block to `src/i18n/zh.ts` (Simplified Chinese translations; `faq.tag`: `'常见问题'`, `faq.title`: `'常见问题解答'`, `faq.subtitle`: Chinese translation).

**Phase 2: Implementation**

- [ ] Create `src/components/FAQ.astro` with:
  - Frontmatter: `Props { lang; t }` interface (copy shape from `About.astro` ll. 2–6); destructure `Astro.props`; build a `categories` array of `{ key, title, items: [{ id, q, a }, …] }` from `t()` calls; build a `faqPageSchema` object `{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: categories.flatMap(c => c.items).map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) }`.
  - Markup: `<section id="faq" class="faq section-pad">` containing a reveal-animated header (`.tag` + `<h2>` + subtitle) and the 5 categories, each as `<div class="faq-category reveal">` with `<h3 class="faq-category-title">` + a `<ul class="faq-list" role="list">` of `<details>`-based items. Each item renders the answer as `item.a.split('\n\n').map(p => <p>{p}</p>)`.
  - JSON-LD: `<script type="application/ld+json" set:html={JSON.stringify(faqPageSchema)} />` placed after the `<section>` and before the `<style>` block. Follow the exact `set:html={JSON.stringify(…)}` pattern from `BaseLayout.astro` ll. 220–223.
  - Styles: scoped `<style>` block consuming **only** design tokens (`--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--bg-card`, `--border-card`, `--radius-md`, `--radius-lg`, `--shadow-card`, `--fs-h1`, `--fs-h3`, `--fs-body`, `--fs-small`, `--section-pad`, `--container`, `--section-faq-bg`). Section background: `background: var(--section-faq-bg);`. Chevron rotates 180° on `details[open]` inside `@media (prefers-reduced-motion: no-preference)`. Focus-visible outlines use `var(--accent)` matching `Testimonials.astro` ll. 212–215. Mobile layout: stack categories full-width; on ≥900 px keep single column (this is a long-form section — multi-column would harm readability).
- [ ] Add `--section-faq-bg` token to `src/styles/global.css` in all three theme blocks (anchor: `--section-*-bg` group). Value: `var(--bg-section-alt)` in every block, so light/dark both inherit the existing alt-band token.

**Phase 3: Integration & Exposure (MANDATORY)**

- [ ] `src/components/Nav.astro` — insert `{ key: 'nav.faq', href: '#faq' }` into the `navLinks` array (line 13) immediately before the `nav.blog` entry. Confirmed exposure: this single array drives both the desktop nav (`.nav-links` ul, lines 28–45) and the mobile overlay (`.nav-overlay` ul, lines 74–93), so no further nav wiring is required.
- [ ] `src/components/Footer.astro` — insert the same `{ key: 'nav.faq', href: '#faq' }` entry into the `navLinks` array (line 9) at the matching position so the footer nav mirrors the top nav.
- [ ] `src/pages/index.astro` — add `import FAQ from '../components/FAQ.astro';` and render `<FAQ lang={lang} t={t} />` between `<Testimonials lang={lang} t={t} />` and `<CTA lang={lang} t={t} />` in `<main>`.
- [ ] `src/pages/en/index.astro` — same change with relative path `../../components/FAQ.astro`.
- [ ] `src/pages/zh/index.astro` — same change with relative path `../../components/FAQ.astro`.

**Phase 4: Validation & Quality**

- [ ] Run `npm run build`. Confirm exit 0 with **zero** Astro errors and **zero** `@astrojs/check` (TypeScript) warnings. This is the authoritative validation gate per `docs/PROJECT.md`.
- [ ] Run `npm run dev` and perform the manual verification script in §5.
- [ ] (Optional) Paste the built page HTML through Google's Rich Results Test or run `npx schema-dts-gen`-style validation locally — the expected single `FAQPage` JSON-LD with 18 `Question`/`Answer` pairs per page should validate. (Not a build gate; manual sanity check.)

## 4. Automated Verification

### Verification Commands

```bash
npm install        # only needed if dependencies aren't already installed
npm run build      # AUTHORITATIVE GATE — must exit 0 with no errors and no @astrojs/check warnings
```

### Quality Gates

- [ ] `npm run build` exits 0 with zero errors and zero `@astrojs/check` warnings.
- [ ] Every new `faq.*` key (45 per locale) exists in **all three** dictionaries (`es.ts`, `en.ts`, `zh.ts`). Spot-check by grepping the new namespace across the i18n directory:
  ```bash
  grep -c "'faq\." src/i18n/es.ts src/i18n/en.ts src/i18n/zh.ts
  ```
  Each file should report the same count (45) plus 1 for `nav.faq` = 46 — confirming parity.
- [ ] `Nav.astro` and `Footer.astro` both contain a `{ key: 'nav.faq', href: '#faq' }` entry.
- [ ] All three `index.astro` files (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) import and render `<FAQ />`.
- [ ] `src/components/FAQ.astro` contains a `<script type="application/ld+json">` block. The generated HTML for each landing page (in `dist/`) contains exactly one `FAQPage` JSON-LD block in addition to the existing `LocalBusiness` and `Person` blocks (= 3 JSON-LD scripts total per landing page).
- [ ] `FAQ.astro` contains zero hardcoded hex colours (verify with `grep -E '#[0-9a-fA-F]{3,8}' src/components/FAQ.astro` → no results that are colours; inline SVG `fill="none"` / `stroke="currentColor"` is allowed).
- [ ] No new dependencies added to `package.json`.

## 5. Manual Verification Script

**Pre-conditions:**

- [ ] `npm install` has been run.
- [ ] `npm run dev` is running and listening on `http://localhost:4321`.

**Scenario (repeat for each locale: `/`, `/en/`, `/zh/`):**

1. [ ] Open the landing page. Scroll to the FAQ section — confirm it appears between Testimonials and the CTA and is visually separated by the `--section-faq-bg` band.
2. [ ] Confirm the eyebrow tag, the H2 title, and the subtitle render in the correct language.
3. [ ] Confirm 5 category titles render in order: General y Logística / Permisos y Requisitos Legales / Preparación Técnica y Equipo / Salud y Seguridad / Inversión (or their EN/ZH equivalents).
4. [ ] Confirm 18 questions render across the 5 categories (6 / 4 / 3 / 3 / 2).
5. [ ] Click each question — confirm the `<details>` accordion expands smoothly, the chevron rotates 180°, and the answer text appears.
6. [ ] For the `total-cost` answer, confirm it renders as multiple paragraphs (the 4 logical paragraphs separated by visible whitespace), not as one wall of text.
7. [ ] Click an open question — confirm it collapses. Confirm multiple questions can be open simultaneously (standard `<details>` behaviour; if the implementer chose a `name="faq"` exclusive-accordion grouping, document that — but default plan is *non-exclusive*, which is friendlier for printing/copying).
8. [ ] Click the new "FAQ" / "常见问题" nav entry in the top nav — confirm the page scrolls smoothly to `#faq`.
9. [ ] Open the mobile overlay (≤900 px viewport via DevTools or actual device) — confirm the FAQ entry appears in the overlay list and that tapping it closes the overlay and scrolls to `#faq`.
10. [ ] Open the footer — confirm a "FAQ" / "常见问题" link appears in the navigation column and that clicking it scrolls to `#faq`.
11. [ ] Toggle the theme (sun/moon button) — confirm the FAQ section text, borders, chevrons, and background switch correctly between dark and light without any hardcoded-colour bleed.
12. [ ] DevTools → Elements → confirm `<script type="application/ld+json">` containing `"@type":"FAQPage"` is present in the page source (in addition to the existing `LocalBusiness` and `Person` scripts).
13. [ ] DevTools → Console → no errors or warnings related to FAQ.
14. [ ] Keyboard-only navigation: Tab into the section, focus a `<summary>`, press Enter / Space — accordion toggles. Focus outline visible (matches `--accent`).
15. [ ] Screen reader (VoiceOver / NVDA) sanity check: each `<summary>` is announced with its expanded/collapsed state.

**Success Criteria:**

- ✅ FAQ section renders on all three locales with locale-correct text.
- ✅ All 18 Q&As are present in 5 ordered categories.
- ✅ Top nav, mobile overlay, and footer all link to `#faq`.
- ✅ A single `FAQPage` JSON-LD block per page contains all 18 Question/Answer entries.
- ✅ No hardcoded colours; theme toggle works correctly.
- ✅ `npm run build` passes with zero errors and zero `@astrojs/check` warnings.

## 6. Coverage Requirements

- [ ] **No test suite exists in this project** (`docs/PROJECT.md` §"Commands"). The manual verification script above IS the coverage. State this explicitly in the PR description.
- [ ] Edge cases to consider:
  - Multi-paragraph rendering of `total-cost.a` (verify visually that `\n\n` produces `<p>` breaks, not literal `\n\n`).
  - Long Spanish lines do not overflow on narrow viewports (320 px width); apply `overflow-wrap: anywhere` only if visible overflow is observed.
  - JSON-LD content quoting: the answers contain double quotes (`"Pago Fácil"`, `"express"`, `"Full Service"`, `"auto-evacuación"`). `JSON.stringify` handles escaping correctly — no extra work needed. Verify by viewing page source.
  - Anchor scroll: `#faq` lands with the section header visible (not occluded by the sticky nav). If the nav covers the heading, add `scroll-margin-top` matching the nav height to the `.faq` section (existing sections rely on the same mechanism).
  - i18n fallback regression: confirm no `faq.*` key falls back to Spanish on `/en/` or `/zh/` (silent fallback is a bug per project doc).

## 7. Acceptance Criteria (Definition of Done)

- [ ] All four phases above completed.
- [ ] `npm run build` exits 0 with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification script (§5) completed on all three locales in both light and dark themes, at desktop and mobile widths.
- [ ] `Nav.astro` `navLinks` array and `Footer.astro` `navLinks` array both contain the new `#faq` entry.
- [ ] All three landing-page files (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) import and render `<FAQ />`.
- [ ] All 45 `faq.*` keys plus `nav.faq` exist in **all three** i18n dictionaries (`es.ts`, `en.ts`, `zh.ts`); no silent fallback to Spanish on `/en/` or `/zh/`.
- [ ] `FAQ.astro` consumes only design tokens — no hardcoded hex colours.
- [ ] Generated HTML contains exactly one `FAQPage` JSON-LD block per landing page, in addition to the pre-existing `LocalBusiness` and `Person` blocks.
- [ ] No new dependencies added.
- [ ] No regressions in adjacent sections (Testimonials, CTA, Partners, Footer) — visually verify the section transition and the section-background zig-zag.
- [ ] Branch (`chore/add_seo_geo_faq_section`) remains the only place where changes land; no other branches touched. Commit/push handled by a downstream stage, not by the planner.
- [ ] Traceability — every implementation expectation in `issue_json` maps to a step above:
  - "Add a user-friendly FAQ section in the site (best placement/UX)" → Phase 2 + Phase 3 + §5 verification.
  - "Improve SEO/GEO by adding FAQPage structured data (JSON-LD) and ensuring headings/metadata are appropriate" → JSON-LD block in `FAQ.astro` + semantic `<section>` / `<h2>` / `<h3>` / `<details>`/`<summary>` markup + `faq.title`/`faq.subtitle` text + `id="faq"` anchor.
  - "Keep Spanish content accurate and well-formatted" → Phase 1 (Spanish verbatim from `issue_json`) + multi-paragraph `\n\n` rendering for `total-cost.a`.

## 8. Assumptions Recorded

These are recorded explicitly (per the planner's load-bearing-assumption protocol) because the user dismissed the clarifying questions. None of them alter the affected-files list:

- **A1 — English & Chinese translations are produced by the implementer.** The issue provides Spanish content only, but the project's strict locale-parity convention requires the FAQ to appear on all three landing pages with locale-correct text. The implementer produces faithful translations as part of Phase 1. *(If, instead, the user wants the FAQ to appear only on the Spanish landing page, the change to `src/pages/en/index.astro` and `src/pages/zh/index.astro` is dropped, the en/zh dictionary updates are reduced to just `nav.faq`, and the FAQPage JSON-LD is only emitted for `es`. This is a small, well-bounded rollback if requested in review.)*
- **A2 — Placement is between Testimonials and CTA.** This is the natural funnel position: social proof → answer objections → primary call to action. *(If a different placement is requested, only the import-order line and the `<main>` composition in the three `index.astro` files change.)*
- **A3 — Nav entry label is "FAQ" / "FAQ" / "常见问题".** Short label fits the existing nav layout. *(Trivial to swap to a longer label like "Preguntas Frecuentes" / "Frequently Asked Questions" / "常见问题" in just the three i18n files.)*
- **A4 — Native `<details>`/`<summary>` accordion, non-exclusive (multiple items may be open simultaneously), all closed on first paint.** Zero-JS, accessible, indexable. *(Trivial to switch to `name="faq"` exclusive accordion or default-open-first via a single attribute change in `FAQ.astro`.)*
