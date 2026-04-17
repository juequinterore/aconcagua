# Project: aconcagua

Astro static marketing site for Julián Kusi's guided Aconcagua expeditions.

## Overview

- **Type:** Single Astro package (not a monorepo)
- **Output:** Static site (SSG, no SSR)
- **Deployment:** Firebase Hosting (`firebase.json`)
- **Locales:** `es` (default, no URL prefix), `en`, `zh`
- **Path alias:** `@/*` → `src/*`

## Tech Stack

- **Runtime / SSG:** Astro v5.17.3
- **Language:** TypeScript (strict, `astro/tsconfigs/strict`), Astro components (`.astro`)
- **Styling:** Plain CSS with design tokens (`src/styles/global.css`, `nav.css`, `animations.css`) — no Tailwind, no CSS-in-JS
- **Image optimization:** sharp
- **Sitemap:** `@astrojs/sitemap`
- **i18n:** Astro built-in i18n (`prefixDefaultLocale: false`)
- **Third-party:** Calendly popup (invoked via inline `onclick` with `t('calendly.url')`)

## Commands

```bash
# Install deps (first checkout)
npm install

# Dev server
npm run dev

# Build + type-check (primary automated gate — @astrojs/check runs here)
npm run build

# Preview production build
npm run preview
```

- **No test suite exists.** Validation is via `npm run build` (Astro + `@astrojs/check` type-check) and manual browser verification across all three locales.
- **No linter / formatter configured.**

## Directory Structure

```
aconcagua/
├── astro.config.mjs              # Astro config: site, redirects, i18n, sitemap
├── firebase.json                 # Hosting config
├── package.json                  # Scripts: dev, build, preview
├── tsconfig.json                 # Strict, path alias @/* → src/*
├── public/                       # Static assets served at /
├── specs/                        # Feature specs (feat-*.md)
├── agents/                       # Agent working files per adw_id
├── dist/                         # Build output (gitignored)
└── src/
    ├── assets/                   # Imported assets (optimized by Astro)
    ├── components/               # UI components (.astro, PascalCase)
    │   ├── Nav.astro             # Hardcoded navLinks array (~line 13)
    │   ├── Hero.astro
    │   ├── About.astro
    │   ├── Stats.astro
    │   ├── Certifications.astro
    │   ├── Gallery.astro
    │   ├── Pricing.astro
    │   ├── PricingCard.astro
    │   ├── Testimonials.astro
    │   ├── TestimonialCard.astro
    │   ├── CTA.astro
    │   ├── Partners.astro
    │   ├── Social.astro
    │   ├── Footer.astro
    │   ├── ContactFloat.astro
    │   ├── LangSwitcher.astro
    │   └── ThemeToggle.astro
    ├── env.d.ts
    ├── i18n/
    │   ├── es.ts                 # Spanish translations (default)
    │   ├── en.ts                 # English
    │   ├── zh.ts                 # Chinese
    │   └── utils.ts              # useTranslations, getLangFromUrl, getAlternateUrls
    ├── layouts/
    │   └── BaseLayout.astro      # <head>, meta, FOWT theme script, global CSS
    ├── pages/
    │   ├── index.astro           # ES landing (default locale, no prefix)
    │   ├── 404.astro
    │   ├── privacidad.astro
    │   ├── en/
    │   │   ├── index.astro       # EN landing
    │   │   └── privacy.astro
    │   └── zh/
    │       ├── index.astro       # ZH landing
    │       └── privacy.astro
    ├── scripts/                  # Client-side scripts (if any)
    └── styles/
        ├── global.css            # Design tokens (:root + [data-theme="light"])
        ├── nav.css
        └── animations.css
```

## Architecture

Component-based static site. Each locale has its own page entry (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`) that composes the same set of components with a `lang` prop and a `t(key)` translation function.

**Data flow:**
```
Page (useTranslations(lang)) → Component (lang, t) → sub-component (lang, t) → t(key) string
```

**Component contract:** Every component that renders translated content receives:
- `lang: 'es' | 'en' | 'zh'`
- `t: (key: string) => string`

## Routing & Exposure

- File-based routing. Adding a new top-level route means creating three files: `src/pages/<route>.astro`, `src/pages/en/<route>.astro`, `src/pages/zh/<route>.astro` (unless the feature is locale-agnostic).
- `i18n.prefixDefaultLocale: false` → Spanish pages live at `/`, English at `/en/`, Chinese at `/zh/`. Do NOT prefix Spanish routes with `/es/`.
- Partner redirects declared in `astro.config.mjs`: `/globalrescue`, `/pire`, `/en/pire` — do not shadow them with new pages.

### Navigation (hardcoded — CRITICAL)

Primary nav is a hardcoded `navLinks` array in `src/components/Nav.astro` (~line 13). It renders both the desktop nav (`.nav-links`) and the mobile overlay (`.nav-overlay`) from the same array.

```ts
const navLinks = [
  { key: 'nav.about', href: '#sobre' },
  { key: 'nav.expeditions', href: '#expediciones' },
  { key: 'nav.testimonials', href: '#testimonios' },
  { key: 'nav.community', href: '#comunidad' },
  // { key: 'nav.<new>', href: '#<anchor-id>' },
];
```

All new top-level landing-page sections (anchor-scroll) MUST add an entry here AND a matching `nav.<new>` key in all three i18n dictionaries.

For new routes/pages, add a discoverable link — typically in `Footer.astro`, or a new entry in `navLinks` using `href="/<path>"`.

## i18n Rules

- Translation keys are dot-namespaced (e.g., `nav.about`, `hero.title`, `calendly.url`).
- Every user-visible string must exist in `es.ts`, `en.ts`, AND `zh.ts`.
- Missing keys silently fall back to Spanish — this is a bug, not a feature. Always add to all three or not at all.

## Theme System

- CSS custom properties in `src/styles/global.css`:
  - `:root` = dark defaults
  - `[data-theme="light"]` = light overrides
  - `@media (prefers-color-scheme: light) :root:not([data-theme])` = no-JS fallback
- **FOWT prevention:** blocking `is:inline` script in `BaseLayout.astro` `<head>` reads `localStorage` and sets `data-theme` on `<html>` before paint.
- **ThemeToggle.astro:** sun/moon toggle, placed between LangSwitcher and CTA in desktop nav; above CTA in mobile overlay.

### Key design tokens

- Base: `--bg-base`, `--bg-section-alt`, `--bg-card`, `--bg-nav`, `--bg-footer`
- Text: `--text-primary`, `--text-secondary`, `--text-muted` (`--text-dark` aliases `--text-primary`)
- Borders / shadows: `--border-subtle`, `--border-card`, `--shadow-*`
- Section backgrounds: `--section-{about,stats,pricing,testimonials,partners,social}-bg`
- Nav scroll state: `--bg-nav`, with `--nav-link-color` / `--nav-sep-color` cascading into LangSwitcher
- Footer stays dark via `--bg-footer` (#0f1923 dark, #1a1a1a light)
- CTA section is kept dark (hardcoded gradient — intentional exception, like Hero/Footer)

Any new UI MUST consume these tokens — no hardcoded colors except the intentional Hero/CTA/Footer gradients.

## Conventions

- **Component files:** PascalCase `.astro` (e.g., `Testimonials.astro`, `TestimonialCard.astro`)
- **Page files:** lowercase `.astro` (e.g., `index.astro`, `privacidad.astro`, `privacy.astro`)
- **Style files:** lowercase `.css`
- **i18n dictionaries:** lowercase locale code `.ts` (`es.ts`, `en.ts`, `zh.ts`)
- **Translation keys:** dot-namespaced
- **Images:**
  - In `public/` → referenced with absolute paths (e.g., `/logo.webp`)
  - In `src/assets/` → imported and go through Astro's image pipeline
  - Prefer `.webp` / `.avif`; include `width`/`height` for layout stability
- **External links:** `rel="noopener noreferrer"` and `target="_blank"` where appropriate
- **Styles:** prefer component-scoped `<style>` blocks; global rules belong in `src/styles/global.css`

## Prohibitions

- No Tailwind, CSS-in-JS, or utility class frameworks
- No React / Vue / Svelte components (pure Astro)
- No test frameworks (Jest, Vitest, Playwright) unless a feature explicitly requires
- No `npm install` of new deps without justification
- No hardcoded hex colors in new components (use tokens)
- No translation keys in only one locale
- No partial features or TODO comments — implementations must be complete

## Feature Workflow

1. **Spec:** `specs/feat-<adw_id>-issue-<n>-<slug>.md` (see `.claude/commands/feature.md`)
2. **Agent plan:** `agents/<adw_id>/feature_planner/plan-<adw_id>-issue-<n>-<slug>.json`
3. **Affected files checklist** for a landing section must include:
   - New component under `src/components/`
   - `src/components/Nav.astro` (add `navLinks` entry)
   - `src/i18n/es.ts`, `en.ts`, `zh.ts` (add `nav.<key>` + content keys)
   - `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro` (import + render)
4. **Gate:** `npm run build` must pass with zero errors / zero `@astrojs/check` warnings.
5. **Manual verification:** test at `http://localhost:4321/`, `/en/`, `/zh/` — desktop + mobile, light + dark themes.
