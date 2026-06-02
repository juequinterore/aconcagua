# Feature Specification: SEO/GEO Optimization for Julián Kusi

> **TL;DR (≤2 sentences):** Strengthen on-page SEO and LLM-grounding signals for Julián Kusi as **the** Aconcagua guide by rewriting page titles/meta/headings to lead with the "Aconcagua guide / Julián Kusi" entity pair, expanding the existing FAQ with a guide-selection category, adding `WebSite` + `WebPage` JSON-LD (and `isPartOf` linking from `FAQPage`), and inserting a structured "Quick Facts" GEO block in `About.astro`. No new dependencies, no new routes, no schema/migration changes — purely content + meta + structured-data edits on existing components and i18n dictionaries.
> **Tier:** M · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/utfBn6ZLcQRSdRHRdP0U`
**Git remote(s) (from `git remote -v`):** `origin → git@github.com:juequinterore/aconcagua.git` (fetch & push)
**Git status at planning time (summary):** On branch `feat/optimize_julian_kusi_aconcagua_seo`; clean tree except one untracked file `bitbucket-api.sh` (unrelated to this feature).
**Remote vs `issue_json.git.repository`:** not provided in `issue_json` — `git remote -v` matches the SSH form of the project's known repo (`github.com:juequinterore/aconcagua.git`); proceeding.

**Source files consulted:**
- `docs/PROJECT.md` (authoritative project doc — already comprehensive)
- `package.json`, `astro.config.mjs`, `tsconfig.json`, `firebase.json`, `public/robots.txt`
- `src/layouts/BaseLayout.astro` (head/meta/JSON-LD pattern — Person + LocalBusiness already wired)
- `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro` (current titles/descriptions/ogUrls)
- `src/pages/privacidad.astro` (legal page pattern — also benefits from meta hygiene)
- `src/components/Hero.astro` (current `<h1>`)
- `src/components/About.astro` (current `<h2>` + bio block — target for "Quick Facts" GEO block)
- `src/components/Certifications.astro`, `src/components/Footer.astro` (entity-signal surfaces)
- `src/components/FAQ.astro` (existing FAQ with categories array + `FAQPage` JSON-LD — extension surface)
- `src/components/Nav.astro` (navLinks array already includes `#faq`)
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`, `src/i18n/utils.ts`
- `src/styles/global.css` (design tokens — `--section-*-bg`, `--text-*`, `--bg-card`, `--border-card`, `--radius-*`)

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions. Three locales (`es` default no-prefix, `en`, `zh`), Firebase Hosting deploy, no SSR.
**Project Type:** Single Astro package (not a monorepo), static site (SSG).
**Primary Stack:** Astro v5.17.3 · TypeScript (strict, `astro/tsconfigs/strict`) · plain CSS with design tokens · `@astrojs/sitemap` v3.7.0 · `@astrojs/check` (type-check at build time) · sharp.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`  *(invokes `astro build`, which runs `@astrojs/check` type-check)*
- Test: N/A — **no test suite exists**. Validation is via `npm run build` plus manual browser verification across all three locales (`docs/PROJECT.md` §Commands and §Feature Workflow).
- Lint/Format: N/A — no linter / formatter configured.

**Validation Gate (authoritative "is this working?" signal):** `npm run build` must exit 0 with zero errors and zero `@astrojs/check` warnings.

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs                 # site: https://aconcagua.co, i18n, sitemap
├── public/
│   ├── robots.txt                   # already references /sitemap-index.xml
│   └── openegraph.jpeg              # current OG image
└── src/
    ├── layouts/
    │   └── BaseLayout.astro         # <head>, meta, JSON-LD pattern  ← add WebSite + WebPage
    ├── components/
    │   ├── Hero.astro               # current <h1>
    │   ├── About.astro              # current <h2>  ← add "Quick Facts" block
    │   ├── FAQ.astro                # existing FAQ + FAQPage JSON-LD  ← add "guide" category
    │   ├── Nav.astro, Footer.astro  # already link to #faq
    │   └── …
    ├── pages/
    │   ├── index.astro              # ES landing  ← title/description rewrite
    │   ├── en/index.astro           # EN landing  ← title/description rewrite
    │   ├── zh/index.astro           # ZH landing  ← title/description rewrite
    │   └── privacidad.astro         # legal page (meta only)
    └── i18n/
        ├── es.ts                    # add quick-facts.* + faq.category.guide.* + faq.qa.guide-*.* keys
        ├── en.ts                    # mirror
        └── zh.ts                    # mirror
```

**Exposure Model:** File-based routing; each locale has a dedicated entry under `src/pages/`. Landing-page sections are composed inside `index.astro` per locale, each rendered with `lang` + `t()` props. Top-level nav anchors are defined by a hardcoded `navLinks` array in both `Nav.astro` and `Footer.astro` — `#faq` is already present, so FAQ is already discoverable.
**Locale / Multi-Surface Requirements:** Every visible string MUST exist in all three of `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`. Each of the three landing pages (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) MUST receive the same title/meta treatment, in its own language and with the correct `ogLocale`, `ogUrl`, and (for the JSON-LD pieces below) `inLanguage` values.
**Conventions Observed:**
- File naming: components PascalCase `.astro`; pages lowercase `.astro`; styles lowercase `.css`.
- Component contract: every component that renders translated content receives `lang: 'es' | 'en' | 'zh'` and `t: (key: string) => string` (`docs/PROJECT.md` §Architecture).
- Styling: plain CSS with design tokens, scoped `<style>` blocks per component, **no hardcoded colors** (use `--bg-card`, `--border-card`, `--text-primary`, `--text-secondary`, `--accent`, `--radius-lg`, `--shadow-card`, `--section-*-bg`, etc.).
- i18n: dot-namespaced keys; missing keys silently fall back to ES → bug, must populate all three.
- JSON-LD: emit one `<script type="application/ld+json">` per schema object in `<head>` (BaseLayout) or section (FAQ.astro); current pattern serializes via `set:html={JSON.stringify(schema)}`.
- Heading hierarchy: `<h1>` lives in `Hero.astro` (one per page); each section uses `<h2>`; sub-blocks use `<h3>`. We preserve this.

**Reserved Paths / Redirects / Route Collisions to avoid:** From `astro.config.mjs` — `/globalrescue`, `/pire`, `/en/pire` are redirects; do not create pages at these paths. This spec does not add routes, so no risk.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` (already comprehensive and current). **No `docs/PROJECT.md` created or modified.**

**Change Tier:** **M** — ~11 file modifications (3 page metas, 1 layout JSON-LD/meta tweak, 1 About update, 1 FAQ category extension, 3 i18n dictionaries, 1 privacy-page meta touch-up, 1 robots.txt review only-if-needed). No schema/migrations, no new dependencies, no new routes, no new component files.

## 1. Design Analysis

**Target Scope:** Marketing landing-page surfaces in `src/pages/*/index.astro`, the global `<head>` in `src/layouts/BaseLayout.astro`, the `About.astro` section component, the `FAQ.astro` section component, and all three i18n dictionaries. Privacy pages get minor meta polish.
**Affected Layers:** Page metadata · Document `<head>` (meta + JSON-LD) · Section components (About + FAQ) · i18n content.
**Problem Statement:** The site already presents Julián Kusi as a guide, but page titles/descriptions don't lead with the high-intent phrase "Aconcagua guide" + "Julián Kusi", on-page heading hierarchy doesn't reinforce that entity pair, structured data is missing the `WebSite`/`WebPage` graph that helps search engines + LLMs ground the site as Julián's primary surface, and the FAQ — while present — lacks the specific guide-selection / "who is the best Aconcagua guide" questions that capture top-of-funnel LLM/GEO queries. Acceptance criteria require: (1) FAQ exists and is linked from relevant pages, (2) JSON-LD validates and includes `Person` + `FAQPage` at minimum, (3) optimized titles/meta/headings emphasizing Julián Kusi as Aconcagua guide.
**Solution Strategy:**
1. **Titles + meta descriptions:** rewrite per-locale to lead with "Aconcagua Guide — Julián Kusi" / "Guía de Aconcagua — Julián Kusi" / "阿空加瓜向导 Julián Kusi", keep the keyword density natural, include 17 summits + 10+ years + tri-lingual claim, and stay under ~60 / ~155 chars respectively.
2. **Heading hierarchy:** keep Hero `<h1>` as the page's single H1 but reword the About section's `<h2>` (via an i18n key) so it explicitly contains the keyword pair "Aconcagua Guide — Julián Kusi" / "Guía de Aconcagua — Julián Kusi" / "阿空加瓜向导 Julián Kusi", with the current poetic line ("From the kitchen to the summit…") demoted to an `<h3>` subtitle. Hero `<h1>` already contains the marketing line; we extend it with a visually-hidden semantic suffix ("Aconcagua Mountain Guide — Julián Kusi") via an `sr-only` span so the page H1 carries the entity pair without disrupting visual design.
3. **GEO content block (`AboutQuickFacts`):** add a structured, factual "At-a-Glance" panel inside `About.astro` — a `<dl>` or list listing Guide / Location / Service Area / Languages / Credentials / Summits / Contact. This gives LLMs a dense, machine-readable answer block. No new component file; the block lives inside `About.astro` to keep the file count low and to avoid touching the `navLinks` exposure surface.
4. **FAQ category extension:** add a new `guide` category to `FAQ.astro`'s `categories` array with 5 guide-selection Q&As (Who is Julián Kusi, why choose him, credentials, languages, how to contact, area served). These flow through the existing `FAQPage` JSON-LD generator automatically.
5. **Structured data additions:** in `BaseLayout.astro`, add a `WebSite` schema (with `@id: https://aconcagua.co/#website`, `publisher` → `#business`, `inLanguage` array `['es-AR', 'en-US', 'zh-CN']`, `potentialAction` SearchAction targeting site search — even if site has no search box, the URL template can be a no-op pattern; SAFER ALTERNATIVE: omit `potentialAction` to avoid validator warnings about non-existent search endpoint. We will **omit** SearchAction.). Add a per-page `WebPage` schema with `@id: <ogUrl>#webpage`, `isPartOf` → `#website`, `inLanguage` (mapped from `lang` prop via existing `getLocale`-style mapping), `primaryImageOfPage`, `about` → `#julian-kusi` (Person), `mainEntity` → `#julian-kusi`. In `FAQ.astro`, extend the existing `FAQPage` schema with `isPartOf` → the page's `#webpage` `@id`.
6. **Meta polish:** add `og:site_name`, `og:image:alt`, `<meta name="author" content="Julián Kusi">`, `<meta name="robots" content="index, follow, max-image-preview:large">`. Localized via existing `t()` for the alt text.
**Entry Point / Exposure:** No new routes. FAQ is already exposed via `Nav.astro` (`#faq` in `navLinks` line 18) and `Footer.astro` (`#faq` in `navLinks` line 14). About is already exposed via `#sobre`. Page titles, meta, JSON-LD live in `BaseLayout.astro` (single global `<head>`) and are consumed by every page in `src/pages/`.
**Locale / Surface Coverage:** ES (no prefix) · EN (`/en/`) · ZH (`/zh/`). All three landing pages, all three i18n dictionaries, and the three `ogLocale`/`ogUrl` permutations must stay in parity. Privacy pages (`/privacidad`, `/en/privacy`, `/zh/privacy`) also receive the new meta polish.
**User Story:** As a prospective Aconcagua climber searching "Aconcagua guide" / "best Aconcagua guide" / "Aconcagua guiding company" on Google or asking an LLM (ChatGPT/Gemini/Perplexity) the same questions, I want to find Julián Kusi presented clearly, factually, and as the primary answer, so that I can verify his credentials and book a consultation with confidence.

## 2. Architecture & Data

### Architecture
- **Single source of truth for entity facts:** `BaseLayout.astro` already declares the `LocalBusiness` (`#business`) and `Person` (`#julian-kusi`) graphs. We extend the same `jsonLd` array with `WebSite` and `WebPage` nodes that cross-reference these `@id`s via `publisher` / `about` / `mainEntity`. No duplication of name/credential/contact data.
- **Per-page differentiation:** `WebPage` `@id`, `inLanguage`, `name`, and `url` are derived from existing `BaseLayout` props (`title`, `description`, `lang`, `ogUrl`) via a small local helper in the layout's frontmatter (no separate utility file needed — keep colocated with consumer per current convention).
- **FAQ category extension reuses existing infrastructure:** `FAQ.astro`'s `categories` array already drives both the visible UI and the `FAQPage` `mainEntity` list via `categories.flatMap(...)`. Adding the new `guide` category propagates automatically to both surfaces.
- **GEO "Quick Facts" block in About.astro:** rendered as a `<dl>` inside the existing `.about-bio-col` (or below the timeline) with semantic terms + definitions. Uses existing design tokens (`--bg-card`, `--border-card`, `--radius-lg`, `--text-primary`, `--text-secondary`, `--accent`, `--shadow-card`) — no new tokens, no hardcoded colors.
- **Heading hierarchy is preserved:** Hero `<h1>` remains the page H1 (single H1 per page); About `<h2>` is rewritten to lead with the keyword pair; About sub-heading becomes `<h3>`; FAQ stays `<h2>` for the section + `<h3>` per category (unchanged).

### Data Changes
- [x] Translation / i18n keys added (mirror in `es.ts` + `en.ts` + `zh.ts`):
  - `seo.h1_suffix` — sr-only H1 suffix appended in `Hero.astro` (e.g. "Aconcagua Mountain Guide — Julián Kusi")
  - `about.heading_seo` — new H2 text leading with "Aconcagua Guide — Julián Kusi"
  - `about.subheading` — current poetic heading text moved here, rendered as `<h3>`
  - `about.quickfacts.title` — title of the Quick Facts block
  - `about.quickfacts.guide.label`, `about.quickfacts.guide.value`
  - `about.quickfacts.location.label`, `about.quickfacts.location.value`
  - `about.quickfacts.area.label`, `about.quickfacts.area.value`
  - `about.quickfacts.languages.label`, `about.quickfacts.languages.value`
  - `about.quickfacts.credentials.label`, `about.quickfacts.credentials.value`
  - `about.quickfacts.summits.label`, `about.quickfacts.summits.value`
  - `about.quickfacts.contact.label`, `about.quickfacts.contact.value` *(label only; the link target is the existing `mailto:` from BaseLayout / Footer — render as a real link in `About.astro`)*
  - `og.site_name` — "Aconcagua.co — Julián Kusi" (or localized equivalent)
  - `og.image_alt` — localized alt for `openegraph.jpeg`
  - `faq.category.guide.title` — "About Your Guide" / "Sobre tu Guía" / "关于您的向导"
  - `faq.qa.guide-who.q` / `.a` — "Who is Julián Kusi?" with bio + credentials answer
  - `faq.qa.guide-why.q` / `.a` — "Why choose Julián Kusi as your Aconcagua guide?"
  - `faq.qa.guide-credentials.q` / `.a` — "What credentials does Julián Kusi hold?"
  - `faq.qa.guide-languages.q` / `.a` — "What languages does the guide speak?"
  - `faq.qa.guide-contact.q` / `.a` — "How do I contact Julián Kusi?"
  - `faq.qa.guide-area.q` / `.a` — "Where does Julián Kusi guide?"
  - Page-level title/description strings are inline in `src/pages/*/index.astro` (not in dicts) per current convention; rewrite them in place.
- [ ] Schema / migration changes: None.
- [x] Config changes: None to `astro.config.mjs`, `firebase.json`, `tsconfig.json`. (Sitemap, redirects, i18n, hosting all already correct.)
- [ ] Static assets added: None. `public/openegraph.jpeg`, `public/portrait.jpeg`, `public/logo.webp` are reused.
- [ ] New dependencies: None.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `src/pages/index.astro` (Modify — `<BaseLayout>` `title` and `description` props — rewrite to lead with "Guía de Aconcagua — Julián Kusi" while keeping under ~60/155 chars; no other changes.)
- `src/pages/en/index.astro` (Modify — `<BaseLayout>` `title` and `description` props — rewrite to lead with "Aconcagua Guide — Julián Kusi".)
- `src/pages/zh/index.astro` (Modify — `<BaseLayout>` `title` and `description` props — rewrite to lead with "阿空加瓜向导 Julián Kusi".)
- `src/pages/privacidad.astro` (Modify — `<BaseLayout>` `title` and `description` props — minor polish so the legal-page title also names Julián Kusi as Aconcagua guide; no content edits inside the page body.)
- *Optional sibling legal pages — verify in implementer phase:* `src/pages/en/privacy.astro`, `src/pages/zh/privacy.astro` — if present, apply the same meta polish as the ES privacy page. (Their existence was inferred from `docs/PROJECT.md` §Directory Structure and the BaseLayout cookie-banner copy referencing `/en/privacy` / `/zh/privacy`; implementer must read them and apply the same `title` + `description` rewrite if present, no-op if not.)
- `src/layouts/BaseLayout.astro` (Modify — frontmatter `jsonLd` constant and `<head>` block):
  - Anchor 1: extend `jsonLd` array with two new objects — a `WebSite` (`@id: https://aconcagua.co/#website`) and a per-page `WebPage` (computed `@id` from `ogUrl + '#webpage'`, `inLanguage` mapped from `lang`, `mainEntity` / `about` → `#julian-kusi`).
  - Anchor 2: add a small in-frontmatter `inLanguageByLang` map (`{ es: 'es-AR', en: 'en-US', zh: 'zh-CN' }`) for the `WebPage.inLanguage` value; mirrors the locale table already in `astro.config.mjs` sitemap config.
  - Anchor 3: in `<head>`, add `<meta property="og:site_name">`, `<meta property="og:image:alt">`, `<meta name="author" content="Julián Kusi">`, `<meta name="robots" content="index, follow, max-image-preview:large">`. The two `og:*` values come from new i18n keys (`og.site_name`, `og.image_alt`); BaseLayout must accept these via a new optional prop OR resolve them through a passed-in `t` function. **Planner direction:** add two new optional props `siteName?: string` and `ogImageAlt?: string` to `BaseLayout.Props` (kept simple — no `t` plumbing into the layout) and pass localized values explicitly from each page's `<BaseLayout …>` invocation, defaulting to sensible English fallbacks if omitted.
- `src/components/Hero.astro` (Modify — `<h1 class="hero-headline">` element):
  - Append a visually-hidden `<span class="sr-only">{t('seo.h1_suffix')}</span>` inside the existing H1 so the H1 carries the SEO entity pair without altering the visual layout.
  - Add the `.sr-only` rule in the component's `<style>` block (`position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;`).
- `src/components/About.astro` (Modify — `.about-bio-col` block):
  - Rename the rendered H2 to consume `t('about.heading_seo')` (new key) — keeps the existing CSS class `.about-bio-col h2`.
  - Insert a new `<h3 class="about-subheading">` immediately under the H2 consuming `t('about.subheading')` (the existing poetic line); add a small style rule for `.about-subheading` (font-size step below H2 via existing `--fs-h2`/`--fs-h3` tokens — if `--fs-h3` is absent, use a `clamp()` value matching adjacent components; implementer to confirm token availability).
  - Add a new `<section class="quick-facts" aria-label={t('about.quickfacts.title')}>` containing a `<dl>` with the seven Quick Facts pairs (Guide / Location / Service Area / Languages / Credentials / Summits / Contact). Placement: inside `.about-bio-col`, **after the timeline** so it reads as a dense summary at the end of the bio. Contact value renders as a `<a href="mailto:julian@aconcagua.co">` to provide a real internal/contact link.
  - Add styles for `.quick-facts`, `.quick-facts dl`, `.quick-facts dt`, `.quick-facts dd` using `--bg-card`, `--border-card`, `--radius-lg`, `--shadow-card`, `--text-primary`, `--text-secondary`, `--accent` — no hardcoded colors.
- `src/components/FAQ.astro` (Modify — `categories` constant at top of frontmatter):
  - Insert a new category object at the **start** of the `categories` array with `key: 'guide'`, `title: t('faq.category.guide.title')`, and 6 items (`guide-who`, `guide-why`, `guide-credentials`, `guide-languages`, `guide-area`, `guide-contact`) — placing it first makes the guide-selection answers the most prominent for users **and** prepends them in the `FAQPage` `mainEntity` array (which downstream search engines/LLMs tend to weight by position).
  - Extend the `faqPageSchema` object with `isPartOf: { '@id': <pageWebPageId> }`. To know the current page's `@id`, accept a new optional prop `pageId?: string` on FAQ.astro (default: `'https://aconcagua.co/#webpage'`). Each landing page (`src/pages/*/index.astro`) will pass its own `pageId` value matching the `WebPage.@id` constructed in `BaseLayout.astro` (`<ogUrl>#webpage`).
- `src/i18n/es.ts` (Modify — bottom of dictionary):
  - Add `og.site_name`, `og.image_alt`, `seo.h1_suffix`, `about.heading_seo`, `about.subheading`, the 7 `about.quickfacts.*` label/value pairs, `faq.category.guide.title`, and the 6 `faq.qa.guide-*.q` / `.a` pairs. Spanish copy (`es-AR` voice — informal "vos", consistent with existing dictionary).
- `src/i18n/en.ts` (Modify — bottom of dictionary):
  - Add the same keys with English copy (US English, consistent with existing tone).
- `src/i18n/zh.ts` (Modify — bottom of dictionary):
  - Add the same keys with Simplified Chinese copy (`zh-CN`, consistent with existing tone).
- `public/robots.txt` (Modify only if needed — current contents: `User-agent: *` / `Allow: /` / `Sitemap: https://aconcagua.co/sitemap-index.xml`). **Verify** that `Allow: /` is correct (it is). **No change required** unless the implementer detects an SEO-relevant directive missing during build verification. Listed here so the implementer explicitly considers and confirms it.
- *Do NOT modify:* `src/components/Nav.astro` (already links `#faq`), `src/components/Footer.astro` (already links `#faq`), `astro.config.mjs` (sitemap + i18n + redirects already correct), `firebase.json`, `tsconfig.json`.

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Draft the final per-locale strings for: page titles (≤60 chars), meta descriptions (≤155 chars), `seo.h1_suffix`, `about.heading_seo`, `about.subheading`, the 7 Quick Facts pairs, `og.site_name`, `og.image_alt`, the FAQ guide-category title, and 6 guide Q&As. Treat the existing entity facts in `BaseLayout.astro` `jsonLd` (17 summits, EPGAMT + WFR, Mendoza/Argentina, languages, email `julian@aconcagua.co`, WhatsApp `+57 314 629 4318`) as the source of truth — every fact appearing in copy MUST be consistent with the JSON-LD already declared.
- [ ] Confirm the `inLanguage` mapping (`es` → `es-AR`, `en` → `en-US`, `zh` → `zh-CN`) matches both `astro.config.mjs`'s sitemap mapping and `src/i18n/utils.ts`'s `getLocale()` — they already agree; use those values verbatim.

**Phase 2: Implementation**
- [ ] Update `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` with the complete new key set (parity across all three).
- [ ] Update `src/layouts/BaseLayout.astro`: extend `Props` with optional `siteName` and `ogImageAlt`, add the `WebSite` + `WebPage` objects to `jsonLd` (with the `inLanguageByLang` map), and add the four new `<meta>` tags in `<head>`.
- [ ] Update `src/components/Hero.astro`: add the `sr-only` span inside `<h1>` and the `.sr-only` style rule.
- [ ] Update `src/components/About.astro`: swap `t('about.heading')` → `t('about.heading_seo')`; add new `<h3 class="about-subheading">`; add the `<section class="quick-facts">` block with the `<dl>` + styles.
- [ ] Update `src/components/FAQ.astro`: insert the new `guide` category at index 0 of `categories`; add the `pageId` prop; add `isPartOf` to `faqPageSchema`.
- [ ] Update `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`: rewrite `title` + `description` props (per locale); pass new `siteName` + `ogImageAlt` props to `BaseLayout`; pass the matching `pageId` prop down to `<FAQ>` (e.g. `<FAQ lang={lang} t={t} pageId="https://aconcagua.co/#webpage" />` for ES, `…/en/#webpage` for EN, `…/zh/#webpage` for ZH).
- [ ] Update `src/pages/privacidad.astro` (and if present, `src/pages/en/privacy.astro`, `src/pages/zh/privacy.astro`): rewrite `title` + `description` props for the same SEO posture; no body changes.

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] FAQ is already linked from `Nav.astro` (`#faq` line 18) and `Footer.astro` (`#faq` line 14) — **no change**; verify the link still resolves after the categories change.
- [ ] About section is already linked from `Nav.astro` (`#sobre` line 14) and from the Hero scroll-indicator (`href="#sobre"`) — **no change**; verify after H2/H3/Quick-Facts changes.
- [ ] All three locale pages MUST consume the same prop set (`title`, `description`, `ogLocale`, `ogUrl`, `siteName`, `ogImageAlt`) — verify parity by diffing the three `<BaseLayout …>` invocations.
- [ ] Each locale page MUST pass the correctly-localized `pageId` to `<FAQ>` so the `FAQPage` JSON-LD's `isPartOf` references that page's `WebPage` `@id`.

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` — must exit 0 with zero `@astrojs/check` errors and zero warnings. This is the validation gate from Section 0.
- [ ] Run `npm run preview` and walk through manual verification (Section 5).
- [ ] Validate JSON-LD: paste the rendered `<head>` JSON-LD blocks (per locale) into the Schema.org validator (https://validator.schema.org/) and Google Rich Results Test (https://search.google.com/test/rich-results). Required pass criteria: `Person`, `FAQPage`, `WebSite`, `WebPage`, `LocalBusiness` all validate with zero errors. (Warnings about optional fields are acceptable; errors are not.)

## 4. Automated Verification

### Verification Commands
```bash
npm install            # only if node_modules is missing
npm run build          # authoritative gate — must exit 0
npm run preview        # for manual verification step below
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero errors and zero `@astrojs/check` warnings.
- [ ] No new TypeScript errors introduced (strict mode is on via `astro/tsconfigs/strict`).
- [ ] No new files outside the paths listed in §3 ("Affected Files").
- [ ] Every new i18n key exists in `es.ts`, `en.ts`, AND `zh.ts` (parity test — grep the three files for each new key name).
- [ ] No hardcoded hex colors introduced in `About.astro` or `Hero.astro` style blocks — only design tokens.
- [ ] No new dependencies added (`package.json` and `package-lock.json` unchanged).
- [ ] Heading hierarchy on each locale page: exactly one `<h1>` (Hero), each major section uses `<h2>`, sub-blocks `<h3>`. (Quick check via browser dev tools / Lighthouse SEO audit.)

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` has run successfully (deps present).
- [ ] `npm run build` succeeded and `npm run preview` is serving on its default port.

**Scenario (repeat per locale at `/`, `/en/`, `/zh/`):**
1. [ ] Load the page in a clean browser tab. Inspect the document `<title>` — confirm it leads with the localized "Aconcagua Guide / Julián Kusi" keyword pair and is ≤ ~60 chars.
2. [ ] View source. Confirm: `<meta name="description">` ≤ ~155 chars, includes "Aconcagua guide" and "Julián Kusi"; `<link rel="canonical">` matches the page URL; `<link rel="alternate" hreflang="…">` present for all three locales + `x-default`.
3. [ ] Confirm `<meta property="og:site_name">`, `<meta property="og:image:alt">`, `<meta name="author" content="Julián Kusi">`, `<meta name="robots" content="index, follow, max-image-preview:large">` are all present in `<head>`.
4. [ ] In the rendered HTML, locate the five `<script type="application/ld+json">` blocks (BaseLayout emits four: `LocalBusiness/TouristInformationCenter`, `Person`, `WebSite`, `WebPage`; FAQ emits the fifth: `FAQPage`). Paste each into https://validator.schema.org/ and confirm zero errors. Paste the combined `<head>` into Google Rich Results Test — confirm Person + FAQPage are detected.
5. [ ] In the About section, confirm the H2 leads with "Aconcagua Guide — Julián Kusi" (localized) and the previous poetic line is now an H3 directly below it.
6. [ ] Scroll past the timeline; confirm the "Quick Facts" `<dl>` renders cleanly in both light and dark theme (use the theme toggle in the nav), uses design tokens (no jarring colors), and the Contact `dd` is a clickable `mailto:` link.
7. [ ] Click `Nav → FAQ`. Confirm the FAQ section is visible, the **new "About Your Guide" category appears first** with six expandable questions, each answer mentioning Julián Kusi by name where appropriate.
8. [ ] Use the browser's accessibility tree (or VoiceOver/NVDA): confirm the Hero `<h1>` is announced with both the visual headline AND the sr-only "Aconcagua Mountain Guide — Julián Kusi" suffix.
9. [ ] Run a quick Lighthouse audit (SEO + Accessibility tabs) on each locale page in `npm run preview` — confirm SEO score is unchanged-or-better and Accessibility score is unchanged.

**Success Criteria:**
- ✅ Each locale's `<title>`, `<meta description>`, `<h1>` (semantically), and About `<h2>` lead with the "Aconcagua Guide / Julián Kusi" entity pair.
- ✅ JSON-LD validates with `Person` + `FAQPage` + `WebSite` + `WebPage` + `LocalBusiness` all present and error-free.
- ✅ FAQ has a new "About Your Guide" category as the first category with the six guide-selection Q&As, in all three locales.
- ✅ About section shows the new Quick Facts panel with all seven rows populated and themable.
- ✅ `npm run build` passes with zero errors/warnings.
- ✅ No visual regression in light/dark themes or on mobile (≤480px) and desktop (≥1200px).

## 6. Coverage Requirements

- [ ] **No test suite exists** in this project (per `docs/PROJECT.md` §Commands). Coverage is enforced by `npm run build` (Astro + `@astrojs/check` type-check) **and** the Manual Verification Script in §5 above — together they are the coverage gate.
- [ ] Edge cases to consider:
  - i18n key fallback: missing keys silently fall back to Spanish (`src/i18n/utils.ts`). The QA must explicitly verify EN + ZH render the new keys (no Spanish bleed-through).
  - JSON-LD `@id` cross-references: the FAQ component's `isPartOf` `@id` MUST match the BaseLayout's `WebPage` `@id` byte-for-byte. Mismatch is silent but downgrades rich-result grouping.
  - Title/description length: search engines truncate ~60 chars title / ~155 chars description; over-length copy reduces effectiveness.
  - Chinese title: the visual character count is what matters for SERP; aim for ~30 CJK characters max in the title.
  - Accessibility: the `sr-only` H1 suffix must NOT visually disrupt; verify by hiding CSS that on-page text is unchanged.
  - Single-H1 rule: do not introduce a second `<h1>` anywhere.

## 7. Acceptance Criteria (Definition of Done)

- [ ] All implementation phases (§3) completed.
- [ ] `npm run build` passes with zero errors and zero warnings.
- [ ] Manual verification script (§5) executed in all three locales, all steps green.
- [ ] FAQ section exists, is linked from `Nav.astro` and `Footer.astro` (no change required — already present), and includes the new "About Your Guide" category. *(Acceptance criterion 1 from `issue_json`.)*
- [ ] JSON-LD validates and includes `Person` (existing) + `FAQPage` (existing, extended with `isPartOf`) — and additionally `WebSite`, `WebPage`, `LocalBusiness`. *(Acceptance criterion 2 from `issue_json`.)*
- [ ] Key pages (`/`, `/en/`, `/zh/`) have optimized titles, meta descriptions, and heading hierarchy emphasizing Julián Kusi as Aconcagua guide. *(Acceptance criterion 3 from `issue_json`.)*
- [ ] No regressions in adjacent surfaces (Hero visual, About visual, FAQ visual, Nav, Footer, theme toggle, language switcher).
- [ ] No new dependencies, no schema/migration changes, no new routes.
- [ ] **Note on git workflow (out of planner scope):** `issue_json` acceptance criterion 4 specifies commits should land on branch `chore/add_seo_geo_faq_section`. The current working branch is `feat/optimize_julian_kusi_aconcagua_seo`. This is a git-workflow concern handled by the downstream commit/PR agent — the planner does not branch, commit, or push. Listed here only for visibility; verify with the user if the branch name discrepancy is intentional.

### Requirement → Implementation Traceability

| `issue_json` requirement | Spec section(s) |
| --- | --- |
| Audit/improve on-page SEO (titles, meta, H1/H2, keywords) | §1 Solution Strategy items 1–2; §3 Affected Files (page metas, Hero, About) |
| Add/expand dedicated FAQ section | §1 Solution Strategy item 4; §3 `FAQ.astro` + i18n entries |
| Implement JSON-LD (Person, LocalBusiness/Organization, WebSite, WebPage, FAQPage) | §1 Solution Strategy item 5; §3 `BaseLayout.astro` + `FAQ.astro` extensions |
| Clear entity signals for Julián Kusi (name, bio, credentials, location, contact, internal linking) | §1 Solution Strategy items 2–3; §3 About Quick Facts block, FAQ guide category, BaseLayout JSON-LD cross-references |
| GEO/LLM-oriented factual content blocks referencing Julián Kusi | §1 Solution Strategy items 3–4; §3 About Quick Facts + FAQ guide category |
| Verify technical SEO basics (canonical, sitemap/robots, OG/Twitter, performance/a11y) | §3 BaseLayout meta polish; §3 robots.txt verification; §5 Manual Verification |
| FAQ section linked from relevant pages (AC 1) | Already exposed via Nav + Footer (§1 Entry Point / Exposure) |
| JSON-LD includes Person + FAQPage (AC 2) | §3 BaseLayout + FAQ; §5 step 4 validation |
| Key pages have optimized titles/descriptions and heading hierarchy (AC 3) | §3 page metas + Hero sr-only + About H2 rewrite |
| Commit on branch `chore/add_seo_geo_faq_section` (AC 4) | §7 — out of planner scope; flagged for downstream agent |
