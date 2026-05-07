# Feature Specification: Per-Package Landing Pages

> **TL;DR (≤2 sentences):** Each of the 4 Aconcagua expedition packages gets its own dedicated landing page at locale-aware numeric URLs (`/paquetes/<id>`, `/en/packages/<id>`, `/zh/packages/<id>`), generated from a single dynamic Astro route + reusable detail component, with the homepage `Pricing` cards becoming links to those pages instead of direct Calendly triggers. Missing copy is filled with explicitly tagged `[PLACEHOLDER]` translation values across all three locales.
> **Tier:** L · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/1fz5gLByElsOspy6fFbc`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git (fetch+push)`
**Git status at planning time (summary):** On branch `chore/restructure_homepage_pricing_pages`; 1 untracked file (`bitbucket-api.sh`) — clean working tree otherwise.
**Remote vs `issue_json.git.repository` (`https://github.com/juequinterore/aconcagua.git`):** match (SSH vs HTTPS form of the same repo).

**Source files consulted:**
- `package.json`, `astro.config.mjs`, `tsconfig.json`, `firebase.json`
- `docs/PROJECT.md`
- `src/components/Pricing.astro`, `src/components/PricingCard.astro`, `src/components/Footer.astro`, `src/components/Nav.astro`
- `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`
- `src/pages/privacidad.astro`, `src/pages/en/privacy.astro` (locale-aware slug precedent)
- `src/pages/404.astro`
- `src/i18n/utils.ts`, `src/i18n/es.ts` (full), `src/i18n/en.ts` and `src/i18n/zh.ts` (`pricing.*` block)
- `src/layouts/BaseLayout.astro`

**Purpose:** Astro static marketing site for Julián Kusi's guided Aconcagua expeditions. Multi-locale (es/en/zh) static SSG site deployed to Firebase Hosting.

**Project Type:** Single Astro package (not a monorepo); SSG static site; no SSR.

**Primary Stack:**
- Runtime/SSG: Astro `^5.17.3`
- Language: TypeScript (strict, `astro/tsconfigs/strict`), Astro components (`.astro`)
- Styling: Plain CSS with design tokens in `src/styles/global.css` — no Tailwind, no CSS-in-JS
- i18n: Astro built-in i18n (`prefixDefaultLocale: false`, default `es`)
- Image: `sharp`; Sitemap: `@astrojs/sitemap`

**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (runs `astro build`, which includes `@astrojs/check` type-check)
- Test: `N/A — no test suite exists` (per `docs/PROJECT.md` line 39)
- Lint/Format: `N/A — no linter / formatter configured`

**Validation Gate (authoritative "is this working?" signal):** `npm run build` — must exit 0 with zero `@astrojs/check` errors and zero Astro warnings.

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs              # i18n + redirects + sitemap config
├── src/
│   ├── components/
│   │   ├── Pricing.astro         # 4 cards, hardcoded array; renders PricingCard
│   │   ├── PricingCard.astro     # Card UI; CTA = inline Calendly button
│   │   ├── Footer.astro          # `expeditions` array currently uses #plan-N anchors
│   │   ├── Nav.astro             # navLinks (#sobre, #expediciones, …)
│   │   └── …
│   ├── i18n/
│   │   ├── utils.ts              # useTranslations, getLangFromUrl, getAlternateUrls
│   │   ├── es.ts                 # pricing.card1..card4.* keys exist
│   │   ├── en.ts                 # parallel
│   │   └── zh.ts                 # parallel
│   ├── layouts/
│   │   └── BaseLayout.astro      # <head>, hreflang alternates (currently HARDCODED to homepages)
│   └── pages/
│       ├── index.astro           # ES homepage (default locale, no prefix)
│       ├── privacidad.astro      # ES legal page (LOCALE-AWARE SLUG: "privacidad" vs "privacy")
│       ├── 404.astro
│       ├── en/
│       │   ├── index.astro
│       │   └── privacy.astro     # → established slug pattern: ES "privacidad" / EN+ZH "privacy"
│       └── zh/
│           ├── index.astro
│           └── privacy.astro
```

**Exposure Model:** File-based routing under `src/pages/`. Astro 5 dynamic routes (`[param].astro` + `getStaticPaths()`) generate static pages at build time. Locale strategy = three parallel page trees: ES at root, EN under `/en/`, ZH under `/zh/`. The `prefixDefaultLocale: false` setting means **Spanish routes MUST NOT be prefixed with `/es/`**.

**Locale / Multi-Surface Requirements:** All three locales (`es`, `en`, `zh`) MUST be kept in parity for any user-visible addition. Slug naming follows the existing privacy-page precedent: ES uses a Spanish slug, EN+ZH use the English slug ("packages"). Therefore:
- ES: `/paquetes/<id>`
- EN: `/en/packages/<id>`
- ZH: `/zh/packages/<id>`

**Conventions Observed:**
- File naming: PascalCase `.astro` for components (e.g., `PricingCard.astro`); lowercase `.astro` for pages (e.g., `privacidad.astro`).
- Component contract: every translated component receives `lang: 'es' | 'en' | 'zh'` and `t: (key: string) => string` props (verified in `Pricing.astro`, `Footer.astro`, `Nav.astro`).
- Translation keys: dot-namespaced (e.g., `pricing.card1.name`, `nav.about`); every user-visible string must exist in `es.ts`, `en.ts`, AND `zh.ts` (silent ES fallback is treated as a bug per `docs/PROJECT.md` line 140).
- Styling: component-scoped `<style>` blocks; design tokens from `src/styles/global.css` (`--bg-card`, `--border-card`, `--accent`, `--text-primary`, `--text-secondary`, `--shadow-card`, `--radius-lg`, `--card-pad`, etc.). No hardcoded hex except intentional Hero/CTA/Footer gradients.
- External links: `target="_blank"` + `rel="noopener noreferrer"` + a11y label using `t('a11y.opens_new_tab')`.
- Path alias: `@/*` → `src/*` (`tsconfig.json`).

**Reserved Paths / Redirects / Route Collisions to avoid (from `astro.config.mjs`):**
- `/globalrescue` → external (Global Rescue)
- `/pire` → external (Pire Aconcagua ES)
- `/en/pire` → external (Pire Aconcagua EN)
- None of these collide with `/paquetes/*`, `/en/packages/*`, or `/zh/packages/*`. ✓

**Documentation Action Taken:** Used existing docs at `README.md` (not separately read; `docs/PROJECT.md` is the authoritative project doc) and `docs/PROJECT.md`. No new project doc created.

**Change Tier:** L — adds 5 new files (3 new dynamic-route pages, 1 reusable detail component, 1 data module) and modifies 8 existing files (2 components, 3 i18n dictionaries, 1 i18n util, 1 footer component, 1 layout). Introduces a new public route surface (numeric package URLs) and changes a primary user flow (homepage card CTAs no longer launch Calendly directly). No new dependencies. No schema/migration changes. Numeric path identifiers are a hard requirement from `issue_json`.

## 1. Design Analysis

**Target Scope:** Astro pages tree (`src/pages/`), the homepage `Pricing`/`PricingCard` components, the `Footer` "Expeditions" column, the i18n dictionaries, and the `i18n/utils.ts` helper. The `Nav` and `BaseLayout` are touched lightly (an optional `alternates` prop on `BaseLayout` so package pages get correct hreflang).

**Affected Layers:**
- Routing layer (new dynamic pages per locale)
- View/component layer (new shared `PackageDetail` component; `PricingCard` CTA model changes)
- Data layer (new `src/data/packages.ts` single source of truth for package metadata)
- i18n layer (new translation keys across all three dictionaries; new helper for locale-aware package URLs)
- Navigation/exposure layer (`Footer` expeditions column updated to point to new URLs)
- SEO layer (`BaseLayout` gains optional `alternates` prop so per-package hreflang works)

**Problem Statement (from `issue_json`):** All four expedition packages currently live inside one `Pricing` section on the homepage. There is no per-package detail page, so users cannot deep-link to a specific package, search engines cannot index per-package content, and there is nowhere to expand on what each tier offers. Goal: split each package into its own dedicated landing page while keeping the homepage card grid as a discovery surface that links into those pages. Missing copy must be filled with explicitly tagged placeholders, not omitted.

**Solution Strategy:**
1. **Single source of truth:** Create `src/data/packages.ts` with a typed `packages` array (`id: 1..4`, `nameKey`, `priceKey`, `featureKeys`, `badgeKey?`, `featured`, `heroImageSrc`) — replacing the inline literal arrays currently duplicated between `Pricing.astro` and `Footer.astro`'s expeditions column.
2. **One reusable detail component:** Create `src/components/PackageDetail.astro` that accepts `lang`, `t`, and `packageId: 1 | 2 | 3 | 4`. It composes the same proven layout primitives as the existing site (BaseLayout patterns, design tokens, reveal animations) into a detail page.
3. **One dynamic route per locale, three locales:** Create `src/pages/paquetes/[id].astro` (ES), `src/pages/en/packages/[id].astro` (EN), `src/pages/zh/packages/[id].astro` (ZH). Each uses `getStaticPaths()` to enumerate ids `[1,2,3,4]`, sets `lang`/`t`, builds canonical+alternate URLs from a new helper, and renders `<PackageDetail>`. This keeps the per-locale page files thin (~30–40 lines each), matching the existing pattern in `src/pages/index.astro` / `src/pages/en/index.astro` / `src/pages/zh/index.astro`.
4. **Homepage cards become links, not buttons:** Add an `href` prop to `PricingCard.astro`. Replace the inline-onclick Calendly `<button>` with an `<a class="btn btn-outline pricing-cta" href={href}>` whose label comes from a new translation key (`pricing.view_details`). The Calendly CTA moves to each package's landing page (where it remains the primary conversion action). This satisfies the requirement "each package item on the homepage must redirect/link to its own landing page" and follows the standard teaser-card → detail-page funnel pattern.
5. **Locale-aware URL helper:** Add `getPackageUrl(lang: Lang, id: number): string` and `getPackageAlternates(id: number): Array<{ lang: Lang | 'x-default'; href: string }>` to `src/i18n/utils.ts`. These centralise the slug map (`paquetes` for ES, `packages` for EN+ZH) so no string is duplicated across pages.
6. **Footer parity:** Update `Footer.astro`'s `expeditions` array to render hrefs via `getPackageUrl(lang, id)` instead of `#plan-N` hashes.
7. **Placeholders, explicitly tagged:** Where copy is missing, use translation values that begin literally with `[PLACEHOLDER]` and a brief description (e.g., `'package.1.overview': '[PLACEHOLDER] Brief overview of the Basic package — content TBD.'`). The `PackageDetail` component visually distinguishes placeholder content by wrapping it in a `<p class="placeholder">` style scoped to that component (subtle accent border + uppercase "PLACEHOLDER" tag chip), so the visual placeholder treatment is uniform without leaking into other components.
8. **SEO hygiene:** `BaseLayout.astro` currently hardcodes hreflang alternates to homepage URLs (line 24–29). Extend it to accept an optional `alternates?: Array<{ lang: string; href: string }>` prop (default = current homepage list) so each package page emits correct per-page alternates and canonical URL. Pre-existing legal pages remain unchanged.

**Entry Point / Exposure:** Three concrete surfaces make a package detail page reachable, and EVERY one is updated by this change:
1. **Homepage cards** (`src/components/Pricing.astro` → `src/components/PricingCard.astro`): each card's CTA links to its package URL.
2. **Footer "Expeditions" column** (`src/components/Footer.astro` `expeditions` array): each footer link points to the corresponding package URL for the current locale.
3. **Direct URL / external link / search engine:** dynamic routes generate static `.html` files for `/paquetes/1..4`, `/en/packages/1..4`, `/zh/packages/1..4` (12 pages total). Sitemap (`@astrojs/sitemap`) auto-includes them.

The `Nav.astro` `navLinks` array is intentionally NOT changed — it still anchors to `#expediciones`, which is the homepage section that lists all packages and links into the detail pages.

**Locale / Surface Coverage:** All three locales (es/en/zh) get full parity:
- 4 dynamic-route pages per locale × 3 locales = 12 generated pages.
- Every new translation key MUST exist in `es.ts`, `en.ts`, AND `zh.ts`.
- Slug pattern follows the existing precedent (`/privacidad` ES, `/en/privacy`, `/zh/privacy`): ES uses Spanish slug `paquetes`, EN+ZH use English slug `packages`.

**User Story:** As a prospective climber visiting aconcagua.co, I want each expedition package to have its own dedicated, deep-linkable page in my language, so that I can read in detail what's included before booking a Calendly call — and so I can share a specific package URL with friends or family.

## 2. Architecture & Data

### Architecture

**Composition (top-down for a package detail page):**
```
src/pages/<locale>/<slug>/[id].astro      ← per-locale dynamic route, getStaticPaths returns ids 1..4
   └── BaseLayout (with alternates prop)  ← <head>, JSON-LD, FOWT script (existing)
        ├── Nav (lang, t)                 ← existing component, unchanged
        ├── <main>
        │    └── PackageDetail (lang, t, packageId)  ← NEW reusable component
        │         ├── Header section: breadcrumb back-link, name (h1), price, primary Calendly CTA
        │         ├── "What's included" section: feature list from existing pricing.cardN.featureN keys
        │         ├── "Overview" section: package.<id>.overview (placeholder copy)
        │         ├── "Highlights" / "What to expect" section: package.<id>.highlights (placeholder copy)
        │         ├── Secondary Calendly CTA
        │         └── "← Back to all packages" link to homepage (#expediciones)
        └── Footer (lang, t)              ← existing, modified to use new URLs
```

**Data flow** (matches existing project pattern):
```
[id].astro page (sets lang, t, packageId)
   → PackageDetail (lang, t, packageId)
      → reads packages[packageId-1] from src/data/packages.ts
      → calls t('pricing.cardN.name'), t('package.<id>.overview'), etc.
```

**Patterns reused (cited from existing code):**
- The "thin per-locale page → composed component tree" pattern from `src/pages/index.astro` (line 17–51), `src/pages/en/index.astro` (line 17–42), `src/pages/zh/index.astro`.
- The `lang` + `t` prop contract used by every component (e.g., `Pricing.astro` line 4–9, `Footer.astro` line 1–7).
- Design tokens used in `PricingCard.astro` (lines 47–117): `--bg-card`, `--border-card`, `--radius-lg`, `--card-pad`, `--shadow-card`, `--accent`, `--text-primary`, `--text-secondary` — `PackageDetail` MUST reuse these.
- Section padding utility class `section-pad` and `.container` wrapper used by every section component — reuse on `PackageDetail`.
- Reveal animations: existing `.reveal` class with `IntersectionObserver` in `BaseLayout.astro` script (line 401–429). New sections SHOULD use `class="reveal"` to match existing animation behaviour.
- Calendly invocation pattern: `onclick={`Calendly.initPopupWidget({url: '${t('calendly.url')}'}); return false;`}` — verified in `Nav.astro` line 52, `Pricing.astro`-via-`PricingCard.astro` line 32. The package landing page reuses this exactly.
- Locale-aware slug pattern verified at `src/components/Footer.astro` line 53: `lang === 'es' ? '/privacidad' : lang === 'zh' ? '/zh/privacy' : '/en/privacy'`.

### Data Changes

- [x] **Translation / i18n keys added** (in all of `src/i18n/es.ts`, `en.ts`, `zh.ts`):
  - `pricing.view_details` — CTA label on the homepage card replacing the Calendly button.
    - es: `'Ver detalles'` · en: `'View details'` · zh: `'查看详情'`
  - `package.detail.back_to_packages` — breadcrumb / back link label.
    - es: `'← Volver a Expediciones'` · en: `'← Back to all expeditions'` · zh: `'← 返回所有探险套餐'`
  - `package.detail.included_heading` — section heading for the feature list.
    - es: `'Qué incluye'` · en: `"What's included"` · zh: `'套餐包含'`
  - `package.detail.overview_heading` — section heading.
    - es: `'Resumen'` · en: `'Overview'` · zh: `'概述'`
  - `package.detail.highlights_heading` — section heading.
    - es: `'Lo destacado'` · en: `'Highlights'` · zh: `'亮点'`
  - `package.detail.placeholder_tag` — text shown inside the placeholder chip in the UI.
    - es: `'CONTENIDO DE EJEMPLO'` · en: `'PLACEHOLDER'` · zh: `'占位内容'`
  - `package.detail.cta_book` — primary CTA label on the landing page.
    - Reuse existing `pricing.card3.cta` → `'Reservar Expedición' / 'Book Expedition' / '预订探险'` is fine; the planner names the existing key, not a new one. Or add `package.detail.cta_book` mirroring the same value to keep the detail page label independent. **Decision (planner):** add `package.detail.cta_book` to keep the landing-page CTA decoupled from the homepage card CTA (avoids future entanglement).
    - es: `'Reservar Expedición'` · en: `'Book Expedition'` · zh: `'预订探险'`
  - `package.detail.price_prefix` — small label shown above the price on the landing page.
    - es: `'Desde'` · en: `'From'` · zh: `'起价'` *(NOTE: the existing `pricing.cardN.price` strings already include "desde / from / 起价" — so this key is OPTIONAL. Implementer may omit and rely on the existing price strings. The planner records this as an optional refinement.)*
  - **Per-package placeholder copy** (4 packages × 2 placeholder fields = 8 keys × 3 locales = 24 entries):
    - `package.1.overview`, `package.2.overview`, `package.3.overview`, `package.4.overview`
    - `package.1.highlights`, `package.2.highlights`, `package.3.highlights`, `package.4.highlights`
    - Each value MUST literally begin with `[PLACEHOLDER]` and contain a one-sentence description in the target language. Example (es / package 1 / overview): `'[PLACEHOLDER] Resumen del paquete Básico — contenido pendiente de definir.'`. Equivalent en: `'[PLACEHOLDER] Overview of the Basic package — copy to be supplied.'`. Equivalent zh: `'[占位内容] 基础套餐概述 — 内容待补充。'`.
- [ ] Schema / migration changes: None.
- [x] **Config changes:** None to `astro.config.mjs` (dynamic routes work out of the box; sitemap auto-includes them; no new redirects needed; existing reserved paths don't collide).
- [x] **Static assets added:** `src/data/packages.ts` references `heroImageSrc: '/hero.webp'` for all four packages initially (placeholder — reusing the existing public-folder hero image already preloaded in `BaseLayout.astro` line 193). No new image files added in this feature; per-package hero images can be swapped in later by editing only `src/data/packages.ts`.
- [ ] **New dependencies:** None.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/data/packages.ts` (Create — single source of truth for the four packages: `id`, `nameKey`, `priceKey`, `featureKeys: string[]`, `badgeKey?: string`, `featured: boolean`, `heroImageSrc: string`. Exports `packages: ReadonlyArray<Package>` and `getPackageById(id: number)` helper. This replaces the inline literal in `Pricing.astro` lines 11–68.)
- `src/components/PackageDetail.astro` (Create — reusable component receiving `lang`, `t`, `packageId`. Renders breadcrumb back-link, header (name + price + primary Calendly CTA), "What's included" feature list, "Overview" placeholder section, "Highlights" placeholder section, secondary Calendly CTA, footer back-link. All copy via `t(...)`. All styling via design tokens. Includes a scoped `.placeholder` style: muted card with a small uppercase "PLACEHOLDER" chip in `--accent` color so placeholder content is unmistakably marked.)
- `src/pages/paquetes/[id].astro` (Create — ES dynamic route. `getStaticPaths()` returns `[{params:{id:'1'}},…,{params:{id:'4'}}]`. Sets `lang='es'`, `t=useTranslations('es')`, parses `id` from `Astro.params.id` (validate against `packages` data; throw if not found so build fails loudly on a typo). Computes canonical via `getPackageUrl('es', id)` and alternates via `getPackageAlternates(id)`. Renders `<BaseLayout title=… description=… lang ogLocale="es_AR" ogUrl=canonical alternates={alternates}><Nav lang t/><main id="main-content"><PackageDetail lang t packageId={id}/></main><Footer lang t/></BaseLayout>`. Title/description templated from package name + locale string.)
- `src/pages/en/packages/[id].astro` (Create — EN equivalent of the above. Sets `lang='en'`, `ogLocale='en_US'`. Same `getStaticPaths()` shape.)
- `src/pages/zh/packages/[id].astro` (Create — ZH equivalent. `lang='zh'`, `ogLocale='zh_CN'`.)
- `src/i18n/utils.ts` (Modify — `getPackageUrl` and `getPackageAlternates` exports — append two new exported functions at the end of the file. `getPackageUrl(lang, id)` returns `/paquetes/<id>` for `es`, `/en/packages/<id>` for `en`, `/zh/packages/<id>` for `zh`. `getPackageAlternates(id)` returns the four-entry array used for hreflang including an `x-default` pointing to the ES URL. Do not modify the existing `useTranslations`, `getLangFromUrl`, `getLocale`, or `getAlternateUrls` exports.)
- `src/components/PricingCard.astro` (Modify — `Props` interface and rendered button — replace the `calendlyUrl: string` prop with `href: string`. Replace both `<button … onclick={Calendly…}>` branches (lines 29–43) with a single `<a class="btn btn-outline pricing-cta" href={href}>{cta}</a>` for non-featured cards and `<a class="btn btn-primary pricing-cta" href={href}>{cta}</a>` for the `featured` card. Keep the existing card chrome, badge, header, and feature list unchanged. Update component-scoped CSS only if `.pricing-cta` selector needs to also style anchors (it currently styles `.btn` already, so likely no CSS change required — verify via build).)
- `src/components/Pricing.astro` (Modify — `cards` array literal (lines 11–68) and the `<PricingCard …>` element (lines 82–90) — import `packages` from `@/data/packages` and `getPackageUrl` from `@/i18n/utils`, derive `cards` by mapping `packages` to `{ name: t(p.nameKey), price: t(p.priceKey), features: p.featureKeys.map(t), cta: t('pricing.view_details'), featured: p.featured, badge: p.badgeKey ? t(p.badgeKey) : undefined, href: getPackageUrl(lang, p.id) }`. Pass `href={card.href}` to `<PricingCard>` instead of `calendlyUrl`. Keep the existing `<section id="expediciones">` wrapper and `id={`plan-${i+1}`}` per-card anchors so existing `#plan-N` deep-links continue to work.)
- `src/components/Footer.astro` (Modify — `expeditions` constant array (lines 45–50) — replace each `{ key: 'pricing.cardN.name', href: '#plan-N' }` entry with `{ key: 'pricing.cardN.name', href: getPackageUrl(lang, N) }`. Add `import { getPackageUrl } from '../i18n/utils';` at the top of the frontmatter. The existing `<a href={exp.href}>{t(exp.key)}</a>` rendering at line 108 stays unchanged.)
- `src/layouts/BaseLayout.astro` (Modify — `Props` interface (lines 6–13) and `alternates` constant (lines 24–29) — add an optional `alternates?: Array<{ lang: string; href: string }>` prop; default it to the existing four-entry homepage list so all currently-passing pages continue to behave identically. Replace the hardcoded `const alternates = [...]` with `const { alternates = [<existing 4 entries>], …rest } = Astro.props;`. The downstream `<link rel="alternate">` `.map(...)` block at line 174–176 stays unchanged.)
- `src/i18n/es.ts` (Modify — append a new `// Package detail pages` section after the existing `// Pricing` block (around line 87). Add: `pricing.view_details`, `package.detail.back_to_packages`, `package.detail.included_heading`, `package.detail.overview_heading`, `package.detail.highlights_heading`, `package.detail.placeholder_tag`, `package.detail.cta_book`, and `package.{1,2,3,4}.{overview,highlights}` — values per the i18n table in §2.)
- `src/i18n/en.ts` (Modify — same key set, English values.)
- `src/i18n/zh.ts` (Modify — same key set, Chinese values.)

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Create `src/data/packages.ts` exporting a `Package` type and a `packages: ReadonlyArray<Package>` constant of length 4 (ids `1,2,3,4`). Each entry references the **existing** `pricing.cardN.*` translation keys (no key renaming). Include `featured: boolean` (`true` only for id 3) and `badgeKey: 'pricing.card3.badge'` for id 3 only. Include `heroImageSrc: '/hero.webp'` for all four (placeholder; comment-flagged in code).
- [ ] In `src/i18n/utils.ts`, add `getPackageUrl(lang: Lang, id: number): string` and `getPackageAlternates(id: number): { lang: 'es'|'en'|'zh'|'x-default'; href: string }[]`. Centralise the slug map: `{ es: 'paquetes', en: 'packages', zh: 'packages' }`. ES URL = `/paquetes/<id>`; EN URL = `/en/packages/<id>`; ZH URL = `/zh/packages/<id>`. Alternates array uses absolute URLs prefixed with `https://aconcagua.co` (matching existing `getAlternateUrls` style); `x-default` = ES URL.
- [ ] In each of `src/i18n/es.ts`, `en.ts`, `zh.ts`, append the new translation keys listed in §2. Every key MUST exist in all three files. Placeholder values MUST literally begin with `[PLACEHOLDER]` (or `[占位内容]` in zh) so they are obvious in the rendered page and `grep`-able.

**Phase 2: Implementation**
- [ ] Create `src/components/PackageDetail.astro` with `Props { lang: Lang; t: (key:string)=>string; packageId: number }`. Frontmatter looks up the package via `getPackageById(packageId)` from `src/data/packages.ts` and throws if not found (so a malformed id surfaces at build time). Compose the page body using design tokens from `src/styles/global.css`; reuse `.container`, `.section-pad`, `.btn`, `.btn-primary`, `.btn-outline`, `.reveal` classes already used elsewhere. Include a scoped `<style>` block defining `.placeholder` (e.g., a card with `border-left: 3px solid var(--accent)`, muted body text, and a small `.placeholder-tag` chip rendered before the body that displays `t('package.detail.placeholder_tag')` in `--accent`). The exact pixel/opacity values are an implementer-craft decision; planner mandates only that placeholders look obviously different from real copy and use existing tokens (no hardcoded hex).
- [ ] Create `src/pages/paquetes/[id].astro`:
  - `export async function getStaticPaths() { return packages.map(p => ({ params: { id: String(p.id) } })); }`
  - In the frontmatter body: parse `Astro.params.id` to a number; look up the package; build title/description from the package name plus a locale-specific suffix (e.g., `${name} — Expediciones Aconcagua | Julián Kusi`); compute canonical and alternates via the new helpers.
  - Render `<BaseLayout … alternates={alternates}><Nav lang t/><main id="main-content"><PackageDetail lang t packageId={id}/></main><Footer lang t/></BaseLayout>`.
- [ ] Create `src/pages/en/packages/[id].astro` — EN equivalent. Title/description in English. `ogLocale="en_US"`.
- [ ] Create `src/pages/zh/packages/[id].astro` — ZH equivalent. Title/description in Chinese. `ogLocale="zh_CN"`.

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] **Homepage cards (Surface 1):** Modify `src/components/PricingCard.astro` to accept `href: string` instead of `calendlyUrl: string`; replace the inline-Calendly button with a styled `<a>` link. Modify `src/components/Pricing.astro` to import `packages` from `@/data/packages` and `getPackageUrl` from `@/i18n/utils`, derive each card's `href` via `getPackageUrl(lang, p.id)`, change the card CTA label to `t('pricing.view_details')`, and pass `href` (not `calendlyUrl`) to `<PricingCard>`. Keep `id={`plan-${i+1}`}` on each card wrapper for backward-compatible deep-link anchors. **No other changes to the homepage are required** — the `Pricing` section continues to render on `/`, `/en/`, `/zh/`, satisfying the "Keep the main website/homepage showing the available packages" requirement.
- [ ] **Footer "Expeditions" column (Surface 2):** In `src/components/Footer.astro` add `import { getPackageUrl } from '../i18n/utils';` and rewrite the `expeditions` array (lines 45–50) so each `href` is `getPackageUrl(lang, N)`. Render block at line 107–110 unchanged.
- [ ] **Direct URL / sitemap (Surface 3):** No additional action needed beyond the dynamic-route page files — Astro generates static HTML for each `getStaticPaths()` entry, and `@astrojs/sitemap` includes all generated pages by default (only `/404` is filtered, per `astro.config.mjs` line 22).
- [ ] **SEO hreflang (BaseLayout):** Modify `src/layouts/BaseLayout.astro` to accept an optional `alternates` prop with the current homepage list as default. Each new `[id].astro` page passes its three localised package URLs (plus an `x-default` entry) so hreflang on the package pages is correct. Existing pages (`index.astro` × 3, `privacidad.astro`, `privacy.astro` × 2, `404.astro`) keep working with the unchanged default.
- [ ] **Locale parity check:** Confirm that every key listed in §2 is present in **all three** dictionaries (`es.ts`, `en.ts`, `zh.ts`) — the silent-fallback rule from `docs/PROJECT.md` line 140 means a missing zh key would render in es and pass the build silently. Use a final `grep -c "package.detail" src/i18n/{es,en,zh}.ts` style check during implementation to verify counts match.

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` from the workspace root. MUST exit 0 with **zero** `@astrojs/check` errors and zero Astro warnings. This is the authoritative validation gate (per `docs/PROJECT.md` line 39 and §0 above).
- [ ] Inspect the generated `dist/` directory and confirm all twelve files exist:
  - `dist/paquetes/1/index.html`, `…/2/index.html`, `…/3/index.html`, `…/4/index.html`
  - `dist/en/packages/1/index.html` … `4/index.html`
  - `dist/zh/packages/1/index.html` … `4/index.html`
- [ ] Run `npm run preview` and execute the manual verification script in §5.

## 4. Automated Verification

### Verification Commands
```bash
# Authoritative validation gate (per docs/PROJECT.md §Commands)
npm run build

# Local preview (used by manual verification in §5)
npm run preview
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero errors and zero `@astrojs/check` warnings.
- [ ] `dist/paquetes/<id>/index.html` exists for `id ∈ {1,2,3,4}`.
- [ ] `dist/en/packages/<id>/index.html` exists for `id ∈ {1,2,3,4}`.
- [ ] `dist/zh/packages/<id>/index.html` exists for `id ∈ {1,2,3,4}`.
- [ ] Generated sitemap (`dist/sitemap-*.xml`) includes the 12 new URLs.
- [ ] No translation key referenced in `PackageDetail.astro` or the per-locale page files is missing from any of `es.ts`, `en.ts`, `zh.ts` (a missing key falls back to ES silently, per `docs/PROJECT.md` line 140 — manually grep all three files for each new key).
- [ ] No hardcoded hex colors introduced in `PackageDetail.astro` (consume `--accent`, `--text-primary`, `--text-secondary`, `--bg-card`, `--border-card`, `--shadow-card`, `--radius-lg`, `--card-pad` from `src/styles/global.css`).
- [ ] No new dependencies in `package.json`.
- [ ] No git mutations; no `astro.config.mjs` changes; no new redirects.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` has been run successfully.
- [ ] `npm run build` completes with zero errors.
- [ ] `npm run preview` is running locally (default `http://localhost:4321/`).

**Scenario A — Spanish (default locale, no URL prefix):**
1. [ ] Navigate to `http://localhost:4321/`. The homepage `Pricing` grid still shows the four packages as before.
2. [ ] Each package card now displays the localized "Ver detalles" CTA (NOT the Calendly button).
3. [ ] Click the CTA on card 1. Browser navigates to `http://localhost:4321/paquetes/1`. URL is exactly `/paquetes/1` (no trailing or leading additions).
4. [ ] Page renders: header with package name (`Básico`), price (`desde USD $2,500`), primary "Reservar Expedición" button (which opens Calendly popup on click), feature list matching the homepage card, "Resumen" section with `[PLACEHOLDER]` content visually marked, "Lo destacado" section with `[PLACEHOLDER]` content visually marked, secondary CTA, "← Volver a Expediciones" link.
5. [ ] Confirm the Calendly popup opens when clicking either the primary or the secondary CTA on the page.
6. [ ] Click "← Volver a Expediciones" — returns to the homepage.
7. [ ] Repeat steps 3–6 for `/paquetes/2`, `/paquetes/3` (must show "Más Popular" badge and `featured` styling), and `/paquetes/4`.
8. [ ] Scroll to the homepage Footer; the "Expediciones" column links now point to `/paquetes/1`–`/paquetes/4`. Click each — each navigates to the correct landing page.

**Scenario B — English:**
1. [ ] Navigate to `http://localhost:4321/en/`. Homepage cards show English "View details" CTAs.
2. [ ] Click card 1's CTA → navigates to `/en/packages/1`. Header shows "Basic", "from USD $2,500", "Book Expedition" CTA. Sections labelled "What's included", "Overview", "Highlights". Placeholder chip reads "PLACEHOLDER".
3. [ ] Repeat for `/en/packages/2`, `/en/packages/3` (Most Popular), `/en/packages/4`.
4. [ ] Footer "Expeditions" column links point to `/en/packages/1..4`.

**Scenario C — Chinese:**
1. [ ] Navigate to `http://localhost:4321/zh/`. Homepage cards show "查看详情" CTAs.
2. [ ] Click card 1's CTA → navigates to `/zh/packages/1`. Sections labelled "套餐包含", "概述", "亮点". Placeholder chip reads "占位内容".
3. [ ] Repeat for `/zh/packages/2..4`.
4. [ ] Footer "Expeditions" column links point to `/zh/packages/1..4`.

**Scenario D — cross-cutting:**
1. [ ] On any package page, view source and confirm:
   - `<link rel="canonical" href="https://aconcagua.co/paquetes/1" />` (or the locale-appropriate URL).
   - Three `<link rel="alternate" hreflang="…">` tags for `es`, `en`, `zh` plus `x-default`, all pointing to the SAME package id across locales.
2. [ ] On any package page, confirm `Nav` and `Footer` render correctly (theme toggle works, language switcher works, mobile hamburger works).
3. [ ] Toggle theme to light on a package page; confirm placeholder visual styling remains visible/legible (token-driven, both themes).
4. [ ] Resize to mobile width; confirm layout reflows (uses existing responsive tokens).
5. [ ] Hit a non-existent id: `http://localhost:4321/paquetes/99` returns the 404 page (Astro's default static-404 behaviour for unmatched dynamic routes).

**Success Criteria:**
- ✅ The homepage continues to display the four package cards (issue requirement).
- ✅ Each homepage card links to its own dedicated landing page (issue requirement).
- ✅ Every package URL contains a numeric identifier in the path (`/paquetes/1`, `/en/packages/1`, `/zh/packages/1`) — issue requirement.
- ✅ URLs follow the existing locale-aware slug pattern (ES root, EN under `/en/`, ZH under `/zh/` — same shape as the existing `privacidad`/`privacy` pages) — issue requirement.
- ✅ All three locales reach parity (12 generated pages total, all keys present in all dictionaries).
- ✅ Missing landing-page content uses `[PLACEHOLDER]` / `[占位内容]` and is visually tagged — issue requirement.
- ✅ `npm run build` passes with zero errors.

## 6. Coverage Requirements

- [ ] No automated test suite exists in this project (verified via `package.json` and `docs/PROJECT.md` line 39). The manual verification script in §5 IS the coverage for this change.
- [ ] **Edge cases to consider:**
  - Unknown id (e.g., `/paquetes/99`) → must 404 cleanly. `getStaticPaths()` only enumerates ids 1–4, so any other request is unmatched at build time and falls through to the 404 page.
  - Featured card (id 3) — `package.3.badge` MUST render the "Más Popular / Most Popular / 最受欢迎" chip on the landing page, matching the homepage card's `pricing.card3.badge` translation.
  - Locale fallback bug avoidance — `docs/PROJECT.md` warns that missing keys silently fall back to Spanish. Verify each new key exists in all three dictionaries before declaring done.
  - hreflang correctness on the package pages — must point each lang to the SAME package id, not the homepage. Achieved via the new `BaseLayout.alternates` prop + `getPackageAlternates(id)`.
  - Existing `#plan-N` deep links from external sources still resolve (the homepage `Pricing` section keeps `id="plan-N"` on each card wrapper).
  - Existing reserved redirects (`/globalrescue`, `/pire`, `/en/pire`) — none collide with the new routes; verified in §0.

## 7. Acceptance Criteria (Definition of Done)

- [ ] All implementation phases (1–4) completed.
- [ ] Validation gate (`npm run build`) passes with zero errors and zero `@astrojs/check` warnings.
- [ ] All 12 generated pages exist in `dist/` with correct URLs.
- [ ] Manual verification script (Scenarios A, B, C, D) completed end-to-end with no regressions.
- [ ] Every exposure surface from §0 is updated:
  - Homepage cards (Pricing/PricingCard) — link to landing pages ✓
  - Footer "Expeditions" column — links to landing pages ✓
  - Direct URL / sitemap — auto-included ✓
- [ ] Locale parity verified across `es.ts`, `en.ts`, `zh.ts` for every new key.
- [ ] No new dependencies in `package.json`.
- [ ] No `astro.config.mjs` changes (verified — none required).
- [ ] No regressions in adjacent surfaces: existing pages (`/`, `/en/`, `/zh/`, `/privacidad`, `/en/privacy`, `/zh/privacy`, `/404`) still render and validate identically.

### Traceability — every requirement in `issue_json` mapped:

| Requirement (from `issue_json`)                                                                  | Implementation step(s)                                                  |
|--------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| Split each package into its own dedicated landing page (instead of single Pricing component).   | Phase 1 (`src/data/packages.ts`), Phase 2 (`PackageDetail.astro` + 3 dynamic-route pages). |
| Keep the main website/homepage showing the available packages.                                   | `Pricing.astro` retains its 4-card grid; only the per-card CTA changes. |
| Each homepage package item must redirect/link to its own landing page.                           | Phase 3 — `PricingCard` button → `<a href={getPackageUrl(lang,id)}>` link; Footer expeditions column updated. |
| Landing pages must follow existing i18n routing conventions (lang-prefixed URL).                 | ES at `/paquetes/<id>` (no prefix, default locale), EN at `/en/packages/<id>`, ZH at `/zh/packages/<id>` — matches the privacidad/privacy precedent. |
| Match existing routing pattern in repo.                                                          | Three parallel page trees + Astro file-based routing + dynamic `[id].astro` + `getStaticPaths()`. |
| Package URLs must be numeric identifiers.                                                        | Path param `[id]` enumerates `1..4` only; verified via `getStaticPaths()`. |
| Missing info → use placeholders, clearly tagged.                                                 | New keys `package.<id>.{overview,highlights}` literally start with `[PLACEHOLDER]` / `[占位内容]`; `PackageDetail` renders a visible "PLACEHOLDER" chip. |
| Use best practices (routing, layout, maintainable structure).                                    | Single source of truth (`src/data/packages.ts`); single reusable detail component; centralised slug helper in `i18n/utils.ts`; no duplication across locales beyond the necessary three thin route files. |
