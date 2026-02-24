# Aconcagua.co — Landing Page Specification
**Client:** Julian Kusi · Mountain Guide
**Domain:** aconcagua.co
**Hosting:** GitHub Pages (static)
**GitHub Account:** juequinterore
**Date:** February 2026
**Version:** 1.1 — All open questions resolved

---

## 1. Project Overview

Julian Kusi is a certified Aconcagua mountain guide based in Mendoza, Argentina. He started in 2013 as a base-camp cook, became a porter, and earned his official guide certification in 2018. He now has 17 successful summits and guides international clients at a premium price point ($2,000–$7,000 USD). This landing page is his primary conversion asset — it must communicate authority, safety, and aspiration in equal measure.

### Core Goals
1. **Convert** — drive visitors to book a free 30-min Calendly consultation
2. **Establish authority** — communicate credentials, track record, and testimonials
3. **Rank** — capture SEO traffic from Aconcagua climbing research queries in 3 languages
4. **Impress** — visual quality that matches the $4,500+ price point
5. **Work everywhere** — flawless mobile/desktop across all modern browsers

### Target Audience
- International mountaineers researching Aconcagua
- **Primary markets:** Spanish-speaking Latin America + Spain, English-speaking (US, UK, Europe, Australia), Mandarin-speaking (China, Taiwan, SE Asia)
- Intermediate-to-advanced climbers looking for a certified guide
- Aspiring summiteers who want full logistical support

### Confirmed Contact & Social
| Item | Value |
|------|-------|
| Email | julian@aconcagua.co |
| WhatsApp | +57 314 629 4318 |
| Calendly | https://calendly.com/juliankusi/30min |
| YouTube | https://www.youtube.com/@JulianKusi — 9,600 subscribers |
| Instagram | https://www.instagram.com/julian_kusi — 13,500 followers |
| TikTok | https://www.tiktok.com/@julian_kusi — 3,600 followers |
| Languages | Spanish (es) · English (en) · Mandarin (zh) |

---

## 2. Technology Stack

### Framework: Astro 4+ with built-in i18n
**Rationale:** Zero JS by default, component architecture, native i18n routing (added in Astro 4.0), built-in image optimization, first-class GitHub Pages support. The built-in i18n avoids any third-party library for the 3-language requirement.

```
astro@latest             # static site generator (v4+)
@astrojs/sitemap         # auto-generates per-locale sitemap.xml
sharp                    # image processing (required for image optimization)
```

No framework adapters needed — pure static output.

### Why Not the Alternatives
- **Plain HTML/CSS/JS** — component reuse impossible without a build step; no image optimization
- **Next.js** — overkill for a static landing page, heavier bundle, i18n more complex
- **Vite + vanilla** — same i18n pain as plain HTML for 3 languages

### GitHub Pages Setup
- **Repo:** `github.com/juequinterore/aconcagua` (or a dedicated repo name)
- Output: `dist/` — pure static HTML/CSS/JS
- Deploy via GitHub Actions (workflow below)
- Custom domain: `aconcagua.co` via `public/CNAME`
- Default locale (`es`) served at `/` — no `/es/` prefix
- English at `/en/`, Mandarin at `/zh/`

### File Structure
```
aconcagua/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── CNAME                       # aconcagua.co
│   ├── robots.txt
│   ├── favicon.ico
│   ├── favicon.svg                 # SVG favicon (mountain icon)
│   ├── og-image.jpg                # 1200×630 Open Graph (es default)
│   ├── og-image-en.jpg             # OG for English
│   ├── og-image-zh.jpg             # OG for Mandarin
│   └── fonts/
│       ├── playfair-display-700.woff2
│       ├── playfair-display-600.woff2
│       ├── inter-400.woff2
│       ├── inter-500.woff2
│       └── inter-600.woff2
├── src/
│   ├── i18n/
│   │   ├── es.ts                   # Spanish strings (default)
│   │   ├── en.ts                   # English strings
│   │   ├── zh.ts                   # Mandarin strings
│   │   └── utils.ts                # useTranslations() helper
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Stats.astro
│   │   ├── About.astro
│   │   ├── Pricing.astro
│   │   ├── PricingCard.astro
│   │   ├── Testimonials.astro
│   │   ├── TestimonialCard.astro
│   │   ├── CTA.astro
│   │   ├── Partners.astro
│   │   ├── Social.astro
│   │   ├── Footer.astro
│   │   └── LangSwitcher.astro      # es / en / 中文 toggle in nav
│   ├── layouts/
│   │   └── BaseLayout.astro        # <html lang>, <head>, SEO meta, fonts
│   ├── pages/
│   │   ├── index.astro             # Spanish (default)
│   │   ├── en/
│   │   │   └── index.astro         # English
│   │   └── zh/
│   │       └── index.astro         # Mandarin
│   └── styles/
│       ├── global.css              # Reset, tokens, utilities
│       ├── animations.css          # Scroll reveal, keyframes
│       └── nav.css                 # Sticky nav behavior
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

### i18n Architecture

**`astro.config.mjs`:**
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aconcagua.co',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'zh'],
    routing: {
      prefixDefaultLocale: false,   // / not /es/
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-AR',
          en: 'en-US',
          zh: 'zh-CN',
        },
      },
    }),
  ],
});
```

**`src/i18n/utils.ts`:**
```ts
import es from './es';
import en from './en';
import zh from './zh';

const translations = { es, en, zh };

export function useTranslations(lang: 'es' | 'en' | 'zh') {
  return function t(key: string): string {
    return translations[lang][key] ?? translations['es'][key] ?? key;
  };
}
```

Each page (`index.astro`, `en/index.astro`, `zh/index.astro`) calls `useTranslations(lang)` and passes the `t` function to every component as a prop.

### Language Switcher (Nav)
- Displayed in nav: `ES · EN · 中文`
- Current active language highlighted (gold)
- Links to equivalent page in other locales
- On mobile: included in hamburger menu

---

## 3. Design System

### 3.1 Color Palette

```css
:root {
  /* Core brand */
  --dark:           #0f1923;   /* Hero, stats, CTA, footer backgrounds */
  --primary:        #1a3a4a;   /* Deep teal-blue: headings, gradients */
  --accent:         #c88a3e;   /* Gold/amber: CTAs, stats numbers, highlights */
  --accent-hover:   #a06f2f;   /* Gold darkened: button hover state */

  /* Surfaces */
  --light-bg:       #f7f5f2;   /* Warm off-white: About, Social sections */
  --alt-bg:         #eae6e1;   /* Warm gray: Testimonials section */
  --white:          #ffffff;   /* Pricing, Partners sections */

  /* Text */
  --text-dark:      #1a1a1a;
  --text-secondary: #5a6a72;

  /* Semantic */
  --success:        #2d6a4f;   /* Check icons on standard cards */

  /* Section rhythm (scroll order):
     Hero (dark + image) → Stats (dark) → About (light-bg) →
     Pricing (white) → Testimonials (alt-bg) → CTA (dark) →
     Partners (white) → Social (light-bg) → Footer (dark)    */
}
```

### 3.2 Typography

Two fonts, both self-hosted as `.woff2` for zero render-blocking from external CDNs.

| Role | Font | Weight |
|------|------|--------|
| Hero headline, section titles | Playfair Display | 700 |
| Section subheadings, card names | Playfair Display | 600 |
| Price values, stat numbers | Playfair Display | 700 |
| Body copy, descriptions | Inter | 400 |
| Labels, nav, buttons | Inter | 500–600 |

**Note on Mandarin:** Playfair Display does not support CJK characters. For the `zh` locale, section headings use a system CJK font stack as fallback:

```css
.lang-zh h1, .lang-zh h2, .lang-zh h3 {
  font-family:
    'PingFang SC',           /* macOS/iOS */
    'Microsoft YaHei',       /* Windows */
    'Source Han Sans SC',    /* Adobe/Google */
    sans-serif;
}
```
Body copy in Mandarin uses the same system stack. Inter handles Latin characters mixed in (numbers, brand names).

**Type Scale (fluid):**
```css
--fs-hero:  clamp(2.5rem, 6vw, 4.5rem);
--fs-h1:    clamp(2rem, 4vw, 2.75rem);
--fs-h2:    clamp(1.5rem, 3vw, 2rem);
--fs-h3:    clamp(1.125rem, 2vw, 1.375rem);
--fs-body:  1rem;
--fs-small: 0.875rem;
--fs-xs:    0.8125rem;
```

**Line heights:** 1.1 display / 1.2 headings / 1.7–1.8 body / 1.9 body-zh (CJK needs more breathing room).

### 3.3 Spacing

```css
--section-pad:  clamp(64px, 8vw, 120px);
--container:    min(1200px, 90vw);
--card-pad:     28px 32px;
--gap-grid:     24px;
```

### 3.4 Border Radius & Shadows

```css
--radius-sm:  6px;
--radius-md:  12px;
--radius-lg:  16px;
--radius-xl:  24px;

--shadow-card:  0 4px 20px rgba(0,0,0,0.06);
--shadow-hover: 0 12px 40px rgba(0,0,0,0.08);
--shadow-gold:  0 8px 24px rgba(200,138,62,0.30);
--shadow-photo: 0 20px 60px rgba(0,0,0,0.12);
```

### 3.5 Animation System

All animations gated on `@media (prefers-reduced-motion: no-preference)`. Fallback: instant visibility.

```css
/* Scroll reveal */
@media (prefers-reduced-motion: no-preference) {
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.10s; }
  .reveal-delay-2 { transition-delay: 0.20s; }
  .reveal-delay-3 { transition-delay: 0.30s; }
  .reveal-delay-4 { transition-delay: 0.40s; }

  /* Scroll indicator pulse */
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.4; transform: translateY(0); }
    50%       { opacity: 1.0; transform: translateY(5px); }
  }

  /* Stats counter: JS animates numbers 0 → final on viewport entry */
  /* requestAnimationFrame + easeOutQuart, 1.2s duration */
}
```

**Nav scroll state:** On scroll past hero bottom → add `.scrolled` class → `background: rgba(15,25,35,0.97)`, `backdrop-filter: blur(12px)`, transition 0.35s.

---

## 4. SEO Strategy

### 4.1 Three-Language SEO

Each locale gets fully translated meta tags, not auto-translated. Priority keywords per language:

**Spanish (es — default `/`):**
- `guía aconcagua certificado`
- `expedición aconcagua guía profesional`
- `escalar aconcagua con guía 2026`
- `guía de montaña mendoza argentina`

**English (en — `/en/`):**
- `aconcagua mountain guide`
- `certified aconcagua guide argentina`
- `climb aconcagua with a guide 2026`
- `aconcagua expedition guide mendoza`

**Mandarin (zh — `/zh/`):**
- `阿空加瓜向导` (Aconcagua guide)
- `阿空加瓜登山` (Aconcagua climbing)
- `南美最高峰向导` (South America highest peak guide)
- `阿根廷登山向导` (Argentina mountain guide)

### 4.2 hreflang Tags

In `<head>` of every page:
```html
<link rel="alternate" hreflang="es" href="https://aconcagua.co/" />
<link rel="alternate" hreflang="en" href="https://aconcagua.co/en/" />
<link rel="alternate" hreflang="zh" href="https://aconcagua.co/zh/" />
<link rel="alternate" hreflang="x-default" href="https://aconcagua.co/" />
```

### 4.3 Per-Locale Meta Tags

**Spanish:**
```html
<html lang="es">
<title>Julian Kusi · Guía Certificado del Aconcagua | aconcagua.co</title>
<meta name="description" content="17 cumbres exitosas. Más de 10 años guiando expediciones en el Aconcagua. Guía certificado desde USD $2,000. Mendoza, Argentina.">
```

**English:**
```html
<html lang="en">
<title>Julian Kusi · Certified Aconcagua Mountain Guide | aconcagua.co</title>
<meta name="description" content="17 successful summits. 10+ years guiding expeditions on Aconcagua, the highest peak in the Americas. Certified guide from USD $2,000. Mendoza, Argentina.">
```

**Mandarin:**
```html
<html lang="zh">
<title>Julian Kusi · 阿空加瓜专业认证向导 | aconcagua.co</title>
<meta name="description" content="17次成功登顶。10年以上阿空加瓜探险引导经验。美洲最高峰专业认证向导，服务价格从2000美元起。阿根廷门多萨。">
```

### 4.4 Open Graph

Per locale (different title/description, can share same image initially):
```html
<meta property="og:locale" content="es_AR">          <!-- or en_US / zh_CN -->
<meta property="og:url" content="https://aconcagua.co/">
<meta property="og:image" content="https://aconcagua.co/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

### 4.5 Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Aconcagua · Julian Kusi",
  "description": "Guía de montaña certificado con 17 cumbres en el Aconcagua",
  "url": "https://aconcagua.co",
  "email": "julian@aconcagua.co",
  "telephone": "+57-314-629-4318",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Mendoza",
    "addressCountry": "AR"
  },
  "priceRange": "USD $2,000 – $7,000",
  "sameAs": [
    "https://www.youtube.com/@JulianKusi",
    "https://www.instagram.com/julian_kusi",
    "https://www.tiktok.com/@julian_kusi"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "3"
  }
}
```

### 4.6 Technical SEO
- `robots.txt`: `User-agent: * / Allow: /`
- `sitemap.xml`: Auto-generated by `@astrojs/sitemap`, includes all 3 locales
- All images have descriptive `alt` text translated per locale
- One `<h1>` per page. Sections use `<h2>`. Cards use `<h3>`.
- Performance target ≥ 95 Lighthouse on all axes (directly impacts SEO ranking)

---

## 5. Page Sections — Detailed Specification

> All copy below is shown in Spanish (default). English and Mandarin translations go in `src/i18n/en.ts` and `src/i18n/zh.ts` respectively. Placeholders marked with `[PLACEHOLDER]`.

---

### Section 1: Navigation

**Structure (desktop, left → right):**
```
ACONCAGUA.   |   Sobre Mí  Expediciones  Testimonios  Comunidad   |   ES · EN · 中文   |   [Reservá tu Asesoría]
```

- Logo: Playfair Display 700, white, `.` in `var(--accent)` gold
- Nav links: Inter 500, `rgba(255,255,255,0.8)`, hover → gold
- Language switcher: Inter 500, current locale highlighted gold, others muted. Simple `<a>` links to `/`, `/en/`, `/zh/`
- CTA button: gold bg, white text, `border-radius: var(--radius-sm)`

**Scroll behavior:**
- Default: transparent (hero background shows through)
- After hero exits viewport: `background: rgba(15,25,35,0.97)`, `backdrop-filter: blur(12px)`, `box-shadow: 0 2px 20px rgba(0,0,0,0.20)`, padding tightens from `16px 0` → `10px 0`

**Mobile (≤768px):**
- Nav links hidden
- Language switcher hidden (moved inside hamburger menu)
- CTA button hidden (appears in hero)
- Hamburger: 3 bars (24×2px, white), morphs to X on open
- Mobile overlay: full viewport, `var(--dark)` bg, links centered vertically, large Inter 600 text, language options at bottom

**Accessibility:**
- `<nav aria-label="Navegación principal">`
- Hamburger: `aria-expanded="false/true"`, `aria-controls="mobile-menu"`
- Mobile menu: focus trap, closes on Escape key

---

### Section 2: Hero

**Intent:** Full emotional impact. In the first 3 seconds, the visitor must feel: "this person is the real deal and I want to summit with him."

**Background:**
```css
background:
  linear-gradient(180deg,
    rgba(15,25,35,0.72) 0%,
    rgba(15,25,35,0.35) 35%,
    rgba(26,58,74,0.55) 75%,
    rgba(15,25,35,0.92) 100%
  ),
  url('/images/hero-placeholder.jpg') center/cover no-repeat;
```

**Hero image:** `[PLACEHOLDER]` — replace with Julian's best mountain shot (Julian visible, dramatic sky, Aconcagua ridge). Requirements when available: minimum 2400×1600px, WebP format, optimized to ≤350KB. Use `fetchpriority="high"`, no `loading="lazy"` — this is the LCP element.

**Mountain silhouette at base of hero:**
```css
.hero::after {
  /* CSS clip-path mountain ridgeline, bleeds into dark stats section */
  clip-path: polygon(
    0% 100%, 0% 78%, 5% 70%, 10% 74%, 15% 62%, 20% 67%,
    25% 50%, 30% 54%, 35% 44%, 40% 40%, 45% 32%,
    48% 30%, 50% 27%, 52% 30%, 55% 34%,
    60% 42%, 65% 52%, 70% 47%, 75% 54%,
    80% 60%, 85% 54%, 90% 64%, 95% 60%,
    100% 70%, 100% 100%
  );
  background: linear-gradient(180deg,
    rgba(26,58,74,0.5) 0%,
    rgba(15,25,35,0.98) 60%,
    #0f1923 100%
  );
}
```

**Content (centered, max-width 800px):**

| Element | Spec |
|---------|------|
| Tag ornament | `— GUÍA DE MONTAÑA CERTIFICADO —` · Inter 600 · uppercase · gold · `letter-spacing: 0.2em` |
| H1 | `Tu cumbre comienza` *aquí* · Playfair Display 700 · `--fs-hero` · *aquí* italic gold |
| Subtext | 17 cumbres / 10+ años / seguridad · Inter 400 · `rgba(255,255,255,0.75)` · max-width 560px |
| Primary CTA | `Reservá tu Asesoría →` · gold fill · white text · `14px 32px` · hover: lift + shadow |
| Secondary CTA | `Ver Expediciones` · transparent · white border · hover: subtle fill |
| Scroll indicator | "Explorá" label + animated vertical line (1px, 40px, gradient down) |

**Tag ornament implementation:** `::before` and `::after` pseudo-elements as 32px × 1px horizontal lines (gold, 50% opacity) flanking the text.

---

### Section 3: Stats Bar

**Background:** `var(--dark)` — continues dark from hero. Gold border top + bottom: `1px solid rgba(200,138,62,0.15)`.

**Layout:** 4-column grid → 2×2 on mobile (≤768px).

| # | Number | Label (es) | Label (en) | Label (zh) |
|---|--------|------------|------------|------------|
| 1 | `17` | Cumbres Exitosas | Successful Summits | 成功登顶 |
| 2 | `10+` | Años de Experiencia | Years of Experience | 年经验 |
| 3 | `20K+` | Seguidores | Followers | 粉丝 |
| 4 | `2026` | Temporada Activa | Active Season | 当前季节 |

> Note: 20K+ is the combined approximate across all platforms (9.6K YT + 13.5K IG + 3.6K TK ≈ 26.7K). Use `26K+` for accuracy, or keep `20K+` as conservative. **Confirm with Julian.**

**Number treatment:** Playfair Display 700, `clamp(1.75rem, 3vw, 2.5rem)`, `var(--accent)`.

**Animated counter:** JavaScript `IntersectionObserver` triggers count-up from 0 → target over 1.2s using `easeOutQuart`. Numbers with `+` or `K+` suffix handled by formatting function. Respects `prefers-reduced-motion`.

**Column dividers:** 1px vertical, `rgba(200,138,62,0.15)`, 50% height, centered. Mobile: remove 2nd divider.

---

### Section 4: About

**Background:** `var(--light-bg)` — warm, grounding.

**Desktop layout:** 2-column `1fr 1.2fr`, 64px gap, vertically centered.

**Left — Photo:**
- `aspect-ratio: 3/4`
- `border-radius: var(--radius-xl)`
- `box-shadow: var(--shadow-photo)`
- `[PLACEHOLDER]` — gradient placeholder until real photo provided
- Bottom-left caption overlay: "JULIAN KUSI / GUÍA DE MONTAÑA" — Inter 500, uppercase, white, `--fs-small`
- When real photo arrives: Astro `<Image>` component, `srcset` at 400/600/800px widths, WebP

**Right — Bio:**

```
SOBRE JULIAN KUSI                          ← gold tag
De la cocina a la cumbre del Aconcagua    ← Playfair Display 600, --fs-h1
[body copy]                                ← Inter 400, --text-secondary, line-height 1.8
[Timeline]
```

**Timeline (horizontal desktop, vertical mobile):**

| Year | Role (es) | Role (en) | Role (zh) | Description (es) |
|------|-----------|-----------|-----------|------------------|
| 2013 | Cocinero | Camp Cook | 厨师 | Campamentos base |
| 2016 | Porteador | Porter | 搬运工 | Carga y logística |
| 2018 | Guía | Guide | 向导 | Certificación oficial |
| 2024 | 17 Cumbres | 17 Summits | 17次登顶 | Experiencia elite |

Year: monospace or Inter Mono, gold. Role: Inter 600, dark. Description: Inter 400, secondary, xs.

---

### Section 5: Pricing

**Background:** `var(--white)`.

**Section header:**
- Tag: `EXPEDICIONES` / `EXPEDITIONS` / `探险套餐`
- Title: `Elegí tu Aventura` / `Choose Your Adventure` / `选择您的探险`
- Subtitle: translated per locale

**Grid:** 3-column desktop, single-column mobile (featured card first).

#### Card 1 — Asesoría / Advisory / 咨询服务
**Price:** USD $2,000

| Feature (es) | Feature (en) | Feature (zh) |
|---|---|---|
| Consulta personalizada de 90 min | 90-min personalized consultation | 90分钟个性化咨询 |
| Plan de aclimatación detallado | Detailed acclimatization plan | 详细高原适应计划 |
| Lista de equipamiento personalizada | Personalized gear checklist | 个性化装备清单 |
| Recomendaciones de rutas | Route recommendations | 路线建议 |
| Soporte por WhatsApp (1 mes) | WhatsApp support (1 month) | WhatsApp支持（1个月） |

**CTA:** `Consultar Disponibilidad` / `Check Availability` / `查询可用性` — outline button

#### Card 2 — Expedición Full / Full Expedition / 完整探险 ★ FEATURED
**Price:** USD $4,500 · Badge: `Más Popular` / `Most Popular` / `最受欢迎`
**Border:** `2px solid var(--accent)` · Scale: `1.04` · Shadow: gold glow

| Feature (es) | Feature (en) | Feature (zh) |
|---|---|---|
| Todo lo del plan Asesoría | Everything in Advisory | 包含咨询套餐所有服务 |
| Guía personal toda la expedición | Personal guide throughout | 全程个人向导 |
| Logística completa (permisos, traslados) | Full logistics (permits, transfers) | 完整后勤（许可证、交通） |
| Equipo de campamento incluido | Camp equipment included | 含营地装备 |
| Alimentación en campamentos | Meals at camps | 营地餐食 |
| Seguro Global Rescue incluido | Global Rescue insurance included | 含Global Rescue保险 |
| Fotos y videos profesionales | Professional photos & videos | 专业照片和视频 |

**CTA:** `Reservar Expedición` / `Book Expedition` / `预订探险` — primary gold button

#### Card 3 — VIP Premium / VIP Premium / VIP高级服务
**Price:** USD $7,000

| Feature (es) | Feature (en) | Feature (zh) |
|---|---|---|
| Todo lo del plan Expedición Full | Everything in Full Expedition | 包含完整探险所有服务 |
| Guía exclusivo 1-a-1 (sin grupo) | Exclusive 1-on-1 guide (no group) | 专属1对1向导（无团体） |
| Itinerario personalizado y flexible | Personalized flexible itinerary | 个性化灵活行程 |
| Hotel premium en Mendoza (2 noches) | Premium hotel in Mendoza (2 nights) | 门多萨高级酒店（2晚） |
| Porteador extra para equipamiento | Extra porter for gear | 额外搬运工 |
| Soporte 24/7 pre y post expedición | 24/7 support pre & post expedition | 探险前后24/7支持 |

**CTA:** `Consultar Disponibilidad` / `Check Availability` / `查询可用性` — outline button

---

### Section 6: Testimonials

**Background:** `var(--alt-bg)`.

**Placeholders** until Julian provides real testimonials with client permission.

**Card structure:**
- Stars: ★★★★★ in `var(--accent)`
- Quote: italic, opening `"` in Playfair 3rem gold 30% opacity
- Avatar: 44px circle, gradient primary→accent, initials
- Name: Inter 600, dark
- Origin: Inter 400, secondary, xs

**Placeholder testimonials (replace with real ones):**

| # | Name | Origin | Quote stub |
|---|------|--------|------------|
| 1 | Marco Rossi | Italia | Aclimatación / llegué fuerte / cambió mi vida |
| 2 | Sarah Kim | Corea del Sur | Seguridad primero / decisión correcta / guía excepcional |
| 3 | James Walsh | Estados Unidos | Plan VIP / logística impecable / el mejor guía |

---

### Section 7: CTA (Consultation Booking)

**Background:** `linear-gradient(135deg, var(--dark), var(--primary))`.

**Calendly integration:**
- URL: `https://calendly.com/juliankusi/30min`
- Implementation: **popup widget** (not inline embed)

```html
<!-- In <head> of BaseLayout.astro -->
<link
  href="https://assets.calendly.com/assets/external/widget.css"
  rel="stylesheet"
  media="print"
  onload="this.media='all'"
/>
<script src="https://assets.calendly.com/assets/external/widget.js" async defer></script>
```

```html
<!-- CTA button -->
<button
  onclick="Calendly.initPopupWidget({url: 'https://calendly.com/juliankusi/30min'}); return false;"
  class="btn-primary btn-large"
  aria-label="Agendar asesoría en Calendly (abre ventana emergente)"
>
  Agendar Asesoría en Calendly →
</button>
```

The `media="print"` + `onload` trick defers the Calendly CSS without blocking render.

**Content:**

| Element | es | en | zh |
|---------|----|----|-----|
| Tag | PRIMER PASO | FIRST STEP | 开始您的旅程 |
| Heading | Planificá tu Expedición con una Asesoría Gratuita | Plan Your Expedition with a Free Consultation | 免费咨询，规划您的探险 |
| Body | Agendá una videollamada de 30 min... | Schedule a 30-min video call... | 预约30分钟视频通话... |
| Feature 1 | Sin compromiso | No commitment | 无需承诺 |
| Feature 2 | 30 minutos por video | 30 minutes by video | 30分钟视频通话 |
| Feature 3 | Plan personalizado | Personalized plan | 个性化计划 |
| Button | Agendar Asesoría en Calendly | Schedule Consultation on Calendly | 在Calendly上预约 |
| Fallback | O escribinos a julian@aconcagua.co | Or email julian@aconcagua.co | 或发送邮件至 julian@aconcagua.co |

**WhatsApp fallback link:** `https://wa.me/573146294318` (no spaces or dashes in wa.me URL).

---

### Section 8: Partners

**Background:** `var(--white)` — slim, compact strip.

**Layout:** Single horizontal flex row, centered, `gap: 64px`.

```
PARTNERS DE CONFIANZA  |  [GR]  Global Rescue · Evacuación y asistencia médica mundial  |  [PA]  Pire Aconcagua · Operador logístico oficial del parque
```

- Logo boxes: 48×48px, `border-radius: 10px`
  - Global Rescue: `background: #0b3d2e`, text `#4ade80`
  - Pire Aconcagua: teal gradient, white text
- Label, name, description translated per locale

---

### Section 9: Social / Community

**Background:** `var(--light-bg)`.

**Confirmed data:**

| Platform | Handle | URL | Count (es) | Count (en) | Count (zh) |
|----------|--------|-----|------------|------------|------------|
| YouTube | @JulianKusi | https://www.youtube.com/@JulianKusi | 9,600+ suscriptores | 9,600+ subscribers | 9,600+ 订阅 |
| Instagram | @julian_kusi | https://www.instagram.com/julian_kusi | 13,500+ seguidores | 13,500+ followers | 13,500+ 粉丝 |
| TikTok | @julian_kusi | https://www.tiktok.com/@julian_kusi | 3,600+ seguidores | 3,600+ followers | 3,600+ 粉丝 |

**Card CTA labels:**
- YouTube: `Suscribirse` / `Subscribe` / `订阅`
- Instagram: `Seguir` / `Follow` / `关注`
- TikTok: `Seguir` / `Follow` / `关注`

Icons: Use proper SVG logos (YouTube wordmark red, Instagram gradient, TikTok black). Not text abbreviations.

---

### Section 10: Footer

**Background:** `var(--dark)`.

**4-column grid (desktop):** `2fr 1fr 1fr 1.5fr`

```
Col 1: Brand logo + tagline (max-width 280px)
Col 2: Navegación / Navigation / 导航
Col 3: Expediciones / Expeditions / 探险套餐
Col 4: Contacto / Contact / 联系方式
```

**Contact column:**
- Email: `julian@aconcagua.co`
- WhatsApp: `+57 314 629 4318` → `href="https://wa.me/573146294318"`
- Location: `Mendoza, Argentina`

**Footer bottom bar:**
- Left: `© 2026 Aconcagua.co — Julian Kusi. Todos los derechos reservados.`
- Right: YT · IG · TK icon buttons (36×36px, hover → gold)

**Social icon `href` values:**
```
YouTube:   https://www.youtube.com/@JulianKusi
Instagram: https://www.instagram.com/julian_kusi
TikTok:    https://www.tiktok.com/@julian_kusi
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Desktop | >1024px | All multi-column layouts. Nav full. |
| Tablet | ≤1024px | About: 1-col. Pricing: 1-col (max 440px). Testimonials: 1-col. Footer: 2×2. |
| Mobile | ≤768px | Nav hamburger. Stats: 2×2 grid. Timeline: vertical. CTA features: vertical. Partners: vertical stack. Footer: 1-col. |
| Small | ≤480px | Hero buttons: full-width stacked. Stats: 1-col. |

All using `clamp()`, `min()`, CSS Grid `auto-fit` — minimize explicit breakpoints.

---

## 7. Performance Requirements

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 95 |
| Lighthouse SEO | ≥ 100 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Best Practices | ≥ 100 |
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 100ms |
| Total page weight | < 400KB gzipped |

### Techniques
- **Fonts:** Self-hosted `.woff2`, `font-display: swap`, `<link rel="preload" as="font">`
- **Hero image:** `fetchpriority="high"`, no lazy loading, WebP + JPEG fallback, `srcset` 400/800/1200/1920w
- **All other images:** `loading="lazy"`, WebP, responsive `srcset`
- **CSS:** Critical above-the-fold styles inlined; rest loaded in `<head>` (Astro bundles and hashes automatically)
- **JS:** Zero framework JS. Only vanilla:
  - Scroll reveal via `IntersectionObserver` (~1KB)
  - Hamburger menu toggle (~0.5KB)
  - Stat counter animation (~0.7KB)
  - Nav scroll state class toggle (~0.3KB)
- **Calendly:** Deferred CSS with `media="print"` trick; JS with `async defer`
- **Analytics:** None by default. If added, use Plausible (privacy-first, 1KB script)

---

## 8. Accessibility

- WCAG 2.1 AA minimum
- All text/bg combinations meet 4.5:1 contrast ratio
- Gold `#c88a3e` on `#0f1923` dark: 7.2:1 ✓
- `#1a1a1a` on `#ffffff`: 18.1:1 ✓
- White on `var(--dark)`: 14.4:1 ✓

### Requirements
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`
- One `<h1>` per page (hero). Sections: `<h2>`. Cards: `<h3>`.
- Skip link: first focusable element in body (`Saltar al contenido principal`)
- Focus rings: `outline: 2px solid var(--accent); outline-offset: 3px` on all interactive elements
- Images: descriptive `alt` translated per locale; decorative: `alt=""`
- Hamburger: `aria-expanded`, `aria-controls`, focus trap, Escape to close
- Calendly button text is descriptive (includes "abre ventana emergente" in `aria-label`)
- Pricing tier differentiation: never color alone — uses border + scale + badge + color
- Reduced motion: all animations conditional on `prefers-reduced-motion: no-preference`
- RTL: not required (es/en/zh are all LTR)

---

## 9. GitHub Pages Deployment

### `astro.config.mjs`
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aconcagua.co',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'zh'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-AR', en: 'en-US', zh: 'zh-CN' },
      },
    }),
  ],
});
```

### `.github/workflows/deploy.yml`
```yaml
name: Deploy Aconcagua to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Custom Domain
1. `public/CNAME` contains: `aconcagua.co`
2. GitHub repo → Settings → Pages → Custom domain → `aconcagua.co`
3. DNS at aconcagua.co registrar:
   - `A` record: `185.199.108.153` (and .109, .110, .111)
   - `CNAME www`: `juequinterore.github.io`
4. Enable "Enforce HTTPS" in GitHub Pages settings

---

## 10. i18n Translation Keys

All text in `src/i18n/es.ts`, `en.ts`, `zh.ts`. Keys are dot-notation strings.

```ts
// es.ts (partial — implement all keys)
export default {
  'nav.about':           'Sobre Mí',
  'nav.expeditions':     'Expediciones',
  'nav.testimonials':    'Testimonios',
  'nav.community':       'Comunidad',
  'nav.cta':             'Reservá tu Asesoría',
  'hero.tag':            'Guía de montaña certificado',
  'hero.headline1':      'Tu cumbre',
  'hero.headline2':      'comienza',
  'hero.headline_em':    'aquí',
  'hero.sub':            '17 cumbres exitosas y más de 10 años guiando expediciones en el Aconcagua. Tu seguridad y tu sueño son mi prioridad.',
  'hero.cta_primary':    'Reservá tu Asesoría',
  'hero.cta_secondary':  'Ver Expediciones',
  'hero.scroll':         'Explorá',
  'stats.summits':       'Cumbres Exitosas',
  'stats.years':         'Años de Experiencia',
  'stats.followers':     'Seguidores',
  'stats.season':        'Temporada Activa',
  'about.tag':           'Sobre Julian Kusi',
  'about.heading':       'De la cocina a la cumbre del Aconcagua',
  'about.body':          'Empecé en la cocina de los campamentos...',
  'about.photo_caption': 'Julian Kusi · Guía de Montaña',
  // pricing, testimonials, cta, partners, social, footer keys follow same pattern
  'cta.calendly_url':    'https://calendly.com/juliankusi/30min',
  'cta.whatsapp_url':    'https://wa.me/573146294318',
  'cta.email':           'julian@aconcagua.co',
  'footer.copyright':    '© 2026 Aconcagua.co — Julian Kusi. Todos los derechos reservados.',
};
```

---

## 11. Implementation Checklist

### Phase 1 — Foundation
- [ ] `npm create astro@latest` — empty project, TypeScript strict
- [ ] Configure `astro.config.mjs` with site, i18n, sitemap
- [ ] Set up GitHub Actions deploy workflow
- [ ] Confirm GitHub Pages enabled on repo
- [ ] Add `public/CNAME` with `aconcagua.co`
- [ ] Set up design tokens in `src/styles/global.css`
- [ ] Self-host Inter + Playfair Display (download woff2, add `@font-face`)
- [ ] Create `BaseLayout.astro` (SEO meta, hreflang, fonts, JSON-LD)
- [ ] Create i18n files `es.ts`, `en.ts`, `zh.ts` with all keys
- [ ] Create `useTranslations()` utility

### Phase 2 — Components (mobile-first)
- [ ] `Nav.astro` — transparent/scrolled states, hamburger, lang switcher
- [ ] `Hero.astro` — gradient, mountain silhouette, content, scroll indicator
- [ ] `Stats.astro` — dark bar, 4 stats, animated counter JS
- [ ] `About.astro` — 2-col, placeholder image, bio, timeline
- [ ] `Pricing.astro` + `PricingCard.astro` — 3-tier, featured center card
- [ ] `Testimonials.astro` — 3-col, placeholder testimonials
- [ ] `CTA.astro` — Calendly popup, WhatsApp fallback, feature chips
- [ ] `Partners.astro` — slim trust strip (Global Rescue + Pire Aconcagua)
- [ ] `Social.astro` — YouTube, Instagram, TikTok with real links + counts
- [ ] `Footer.astro` — 4-col, real contact info, real social links
- [ ] `LangSwitcher.astro` — locale toggle in nav + mobile menu

### Phase 3 — Pages
- [ ] `src/pages/index.astro` (Spanish)
- [ ] `src/pages/en/index.astro` (English)
- [ ] `src/pages/zh/index.astro` (Mandarin)

### Phase 4 — Interactions
- [ ] Scroll reveal (`IntersectionObserver`)
- [ ] Nav scroll state toggle
- [ ] Stat counter animation (respects reduced-motion)
- [ ] Hamburger open/close + focus trap + Escape key
- [ ] Calendly popup button wiring

### Phase 5 — SEO & Performance
- [ ] Image optimization (placeholder → Astro `<Image>` with srcset)
- [ ] Lighthouse audit all 3 locales ≥ 95
- [ ] JSON-LD schema verified in Rich Results Test
- [ ] sitemap.xml accessible and correct
- [ ] hreflang verified (use hreflang Testing Tool)
- [ ] OG image previews tested (opengraph.xyz)

### Phase 6 — Real Content (when Julian provides)
- [ ] Replace hero placeholder with real mountain photo
- [ ] Replace about placeholder with Julian's portrait
- [ ] Replace placeholder testimonials with real client quotes
- [ ] Update follower counts if changed at launch time
- [ ] Verify Calendly URL is live and bookable

### Phase 7 — Launch
- [ ] DNS records configured at aconcagua.co registrar
- [ ] HTTPS enforced in GitHub Pages
- [ ] Final cross-browser test (Chrome, Firefox, Safari, Edge)
- [ ] Final device test (iPhone Safari, Android Chrome, tablet)
- [ ] Google Search Console → add property → submit sitemap
- [ ] Bing Webmaster Tools → submit sitemap
- [ ] Baidu Webmaster Tools → submit sitemap (for zh SEO in China)
