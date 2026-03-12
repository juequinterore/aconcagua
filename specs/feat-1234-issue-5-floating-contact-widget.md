# Feature Specification: Floating Contact Widget (WhatsApp & RedBook)

## 1. Design Analysis

**Target Scope:** `apps/visual_workflow` → **Actual project:** `aconcagua` — Astro 5 static multilingual website (`src/` directory)

**Affected Layers:**
- UI / Presentation: new `ContactFloat.astro` component
- Layout integration: `BaseLayout.astro` (replace existing `#wa-float` inline implementation)
- i18n: `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`

**Problem Statement:**
The site currently has a basic floating WhatsApp button (`#wa-float`) in `BaseLayout.astro` with critical limitations:
1. **Mobile-only** — hidden on all screens wider than 768 px via `display: none` default + `@media (max-width: 768px) { display: flex; }`.
2. **Scroll-gated** — only appears after 30 % of page scroll depth.
3. **No text label** — icon-only, reduces discoverability.
4. **Language-agnostic** — same WhatsApp URL for every locale; Chinese (ZH) visitors have no access to the preferred RedBook (小红书) contact channel.
5. **Inline in BaseLayout** — tightly coupled markup, style and script making it hard to maintain.

**Solution Strategy:**
Extract the floating contact button into a dedicated, self-contained `ContactFloat.astro` component that:
- Renders a **persistent** floating action button (FAB) visible on **all screen sizes** and **immediately on page load** (no scroll threshold).
- Shows a **WhatsApp** button (green) for `es` and `en` locales.
- Shows a **RedBook / 小红书** button (red) for the `zh` locale.
- Includes a **visible pill label** that expands on hover (CSS-only) for discoverability.
- Accepts a single `lang` prop and uses `useTranslations` internally.
- Replaces the existing `#wa-float` inline block in `BaseLayout.astro`.

**Entry Point / Exposure:**
- **UI Feature** — the button is fixed at the **bottom-right corner** of every page (`position: fixed; bottom: 28px; right: 24px; z-index: 900`), permanently visible, acting as a persistent contact chat-style widget identical in UX to the floating chat bubbles seen on support sites.
- Triggered by user clicking the button → opens WhatsApp web/app (`wa.me`) or RedBook link in a new tab.
- Rendered via `BaseLayout.astro` which is shared by all three locale pages (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`).

**User Story:**
> As a **prospective expedition client** visiting the website in English, Spanish, or Chinese, I want to see a **persistent, immediately accessible contact button** in the corner of every page, So that I can **instantly start a conversation** on my preferred messaging platform (WhatsApp or RedBook) without hunting through sections.

---

## 2. Architecture & Data

### Architecture

```
User visits any page (es / en / zh)
  └─► BaseLayout.astro (lang prop)
        └─► <ContactFloat lang={lang} />   ← NEW component
              ├─ useTranslations(lang) → t()
              ├─ lang === 'zh'  → RedBook FAB (xhslink.com/m/9PhDmNJh0DB)
              └─ lang !== 'zh' → WhatsApp FAB (wa.me/573146294318)
```

The component is purely presentational (no JS state, no Zustand, no API calls). All interactivity is a plain `<a href>` link opening in `_blank`.

### Data Changes
- [ ] DB Schema: **None**
- [ ] API Contracts: **None**
- [ ] State Models: **None**
- [ ] Shared Domain Types: **None — i18n key additions only**

### i18n Keys to Add

| Key | `es` | `en` | `zh` |
|-----|------|------|------|
| `contact.float.label_whatsapp` | `Escribinos por WhatsApp` | `Chat on WhatsApp` | *(not used)* |
| `contact.float.label_redbook` | *(not used)* | *(not used)* | `小红书联系` |
| `contact.float.aria_whatsapp` | `Contactar por WhatsApp` | `Contact via WhatsApp` | *(not used)* |
| `contact.float.aria_redbook` | *(not used)* | *(not used)* | `通过小红书联系我` |

> **Note:** `cta.whatsapp_url` (`https://wa.me/573146294318`) already exists in all three locales and is reused by this component; no new URL keys are needed.

---

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/i18n/es.ts` (Modify — add 2 keys at end of object, ~line 135)
- `src/i18n/en.ts` (Modify — add 2 keys at end of object, ~line 135)
- `src/i18n/zh.ts` (Modify — add 2 keys at end of object, ~line 135)
- `src/components/ContactFloat.astro` (Create — self-contained FAB component)
- `src/layouts/BaseLayout.astro` (Modify — import ContactFloat, replace `#wa-float` block ~lines 197–245)

---

### Execution Steps

#### Phase 1: i18n Keys (No tests — static data)

- [ ] **Add** to `src/i18n/es.ts` (before closing `};`):
  ```ts
  // Contact Float
  'contact.float.label_whatsapp': 'Escribinos por WhatsApp',
  'contact.float.aria_whatsapp': 'Contactar por WhatsApp',
  ```

- [ ] **Add** to `src/i18n/en.ts` (before closing `};`):
  ```ts
  // Contact Float
  'contact.float.label_whatsapp': 'Chat on WhatsApp',
  'contact.float.aria_whatsapp': 'Contact via WhatsApp',
  ```

- [ ] **Add** to `src/i18n/zh.ts` (before closing `};`):
  ```ts
  // Contact Float
  'contact.float.label_redbook': '小红书联系',
  'contact.float.aria_redbook': '通过小红书联系我',
  ```

#### Phase 2: Create `ContactFloat.astro` Component (TDD Recommended)

- [ ] **Create** `src/components/ContactFloat.astro`:

```astro
---
import { useTranslations } from '../i18n/utils';

interface Props {
  lang: 'es' | 'en' | 'zh';
}

const { lang } = Astro.props;
const t = useTranslations(lang);

const isZh = lang === 'zh';

const config = isZh
  ? {
      href: 'https://xhslink.com/m/9PhDmNJh0DB',
      ariaLabel: t('contact.float.aria_redbook'),
      label: t('contact.float.label_redbook'),
      bgColor: '#FF2442',
      bgHover: '#e0162e',
      shadowColor: 'rgba(255, 36, 66, 0.45)',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 6.5h-2v1h2v1h-2v1h2v1h-3.5V8h3.5v.5zM7 8h1.5l1 5H8l-.25-1.25h-1L6.5 13H5l1-5zm.75 2.5l-.25-1.25-.25 1.25h.5zM12 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0-4.5c-.828 0-1.5.672-1.5 1.5S11.172 13.5 12 13.5s1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"/>
      </svg>`,
    }
  : {
      href: t('cta.whatsapp_url'),
      ariaLabel: t('contact.float.aria_whatsapp'),
      label: t('contact.float.label_whatsapp'),
      bgColor: '#25D366',
      bgHover: '#1ebe59',
      shadowColor: 'rgba(37, 211, 102, 0.45)',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>`,
    };
---

<a
  id="contact-float"
  href={config.href}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={config.ariaLabel}
  style={`--fab-bg: ${config.bgColor}; --fab-hover: ${config.bgHover}; --fab-shadow: ${config.shadowColor};`}
>
  <span class="cf-icon" set:html={config.icon} />
  <span class="cf-label">{config.label}</span>
</a>

<style>
  #contact-float {
    position: fixed;
    bottom: 28px;
    right: 24px;
    z-index: 900;
    display: inline-flex;
    align-items: center;
    gap: 0;
    background: var(--fab-bg);
    color: #fff;
    border-radius: 50px;
    padding: 13px 13px;
    box-shadow: 0 4px 18px var(--fab-shadow);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    max-width: 52px; /* collapsed: icon-only */
    transition:
      max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.2s,
      box-shadow 0.2s,
      transform 0.2s;
  }

  #contact-float:hover,
  #contact-float:focus-visible {
    background: var(--fab-hover);
    box-shadow: 0 6px 24px var(--fab-shadow);
    max-width: 260px; /* expanded: icon + label */
    padding: 13px 20px 13px 13px;
    gap: 10px;
    transform: translateY(-2px);
  }

  #contact-float:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 2px;
  }

  .cf-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
  }

  .cf-label {
    opacity: 0;
    transform: translateX(-8px);
    transition:
      opacity 0.25s 0.05s ease,
      transform 0.25s 0.05s ease;
    pointer-events: none;
    color: #fff;
  }

  #contact-float:hover .cf-label,
  #contact-float:focus-visible .cf-label {
    opacity: 1;
    transform: translateX(0);
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    #contact-float,
    .cf-label {
      transition: background 0.2s, box-shadow 0.2s;
    }
    #contact-float:hover,
    #contact-float:focus-visible {
      max-width: 260px;
      padding: 13px 20px 13px 13px;
      gap: 10px;
      transform: none;
    }
    .cf-label {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Ensure it doesn't overlap the cookie banner (bottom-left) */
  @media (max-width: 480px) {
    #contact-float {
      bottom: 80px; /* lift above potential cookie banner */
      right: 16px;
    }
  }
</style>
```

#### Phase 3: Integrate ContactFloat into BaseLayout (The "Glue" — MANDATORY)

**CRITICAL: This phase makes the component visible on the website.**

- [ ] **REMOVE** the existing inline `#wa-float` block from `src/layouts/BaseLayout.astro`.
  This includes:
  - The `<a id="wa-float" ...>` element (~line 197)
  - The `<style>` block for `#wa-float` (~lines 205–239)
  - The `<script>` scroll-listener for `#wa-float` (~lines 241–253)

- [ ] **ADD** import at the top of the frontmatter section of `BaseLayout.astro`:
  ```astro
  ---
  // ...existing imports...
  import ContactFloat from '../components/ContactFloat.astro';
  ---
  ```
  Location: `src/layouts/BaseLayout.astro`, inside frontmatter block after existing variable declarations (~line 15).

- [ ] **RENDER** the component inside `<body>`, before the closing `</body>` tag (after the cookie banner and before the scripts section), replacing the removed `#wa-float` block:
  ```astro
  <ContactFloat lang={lang} />
  ```
  Location: `src/layouts/BaseLayout.astro`, ~line 197 (where `#wa-float` `<a>` element was).

#### Phase 4: Quality & Validation

- [ ] Run build: `npm run build` or `astro build`
- [ ] Run preview: `npm run preview` or `astro preview`
- [ ] Manual visual check across all 3 locale pages

---

## 4. Automated Verification

### Verification Commands

```bash
# Install dependencies (if needed)
npm install

# Build the project
npm run build

# Preview the production build
npm run preview

# Type-check (Astro uses tsc internally during build)
npx astro check
```

### Quality Gates
- [ ] `astro build` completes with zero errors and zero TypeScript errors
- [ ] `astro check` reports zero diagnostics
- [ ] No broken imports (ContactFloat correctly resolves `../i18n/utils`)
- [ ] All three locale pages (`/`, `/en/`, `/zh/`) build without errors

---

## 5. Manual Verification Script (MANDATORY)

**Pre-conditions:**
- [ ] `npm install` completed
- [ ] `.env` files in place (not required for this feature — no env vars used)

**Steps:**

1. [ ] Start dev server: `npm run dev` → open `http://localhost:4321`

2. [ ] **DISCOVERY TEST — Spanish (default):**
   - Open `http://localhost:4321/`
   - Confirm a **green circular button** is visible at the **bottom-right** of the viewport **without scrolling**
   - Hover over the button → confirm label **"Escribinos por WhatsApp"** slides in to the left of the icon
   - Click the button → confirm it opens `https://wa.me/573146294318` in a new tab

3. [ ] **DISCOVERY TEST — English:**
   - Open `http://localhost:4321/en/`
   - Confirm green WhatsApp FAB is visible at bottom-right immediately
   - Hover → label reads **"Chat on WhatsApp"**
   - Click → opens `https://wa.me/573146294318`

4. [ ] **DISCOVERY TEST — Chinese:**
   - Open `http://localhost:4321/zh/`
   - Confirm a **red circular button** (RedBook brand red `#FF2442`) is visible at bottom-right
   - Hover → label reads **"小红书联系"**
   - Click → opens `https://xhslink.com/m/9PhDmNJh0DB` in a new tab

5. [ ] **DESKTOP visibility test:**
   - Resize browser to 1280 px width → FAB must still be visible (not hidden)
   - Previous `#wa-float` was hidden on desktop; new component must be visible

6. [ ] **Immediate visibility test:**
   - Reload page (any locale) without scrolling → FAB must be visible immediately (no 30 % scroll threshold)

7. [ ] **Cookie banner overlap check:**
   - Decline cookies → cookie banner appears at bottom-left
   - Confirm FAB (bottom-right) does not overlap with banner

8. [ ] **Mobile test** (DevTools mobile emulation at 375 px width):
   - FAB must be visible at `bottom: 80px` on mobile (above cookie banner height)
   - Tap the button → navigates to correct link

9. [ ] **Accessibility check:**
   - Tab to the FAB → confirm focus ring is visible
   - Screen reader reports correct aria-label per locale

10. [ ] **No console errors** in any locale

**Success Criteria:**
- [ ] FAB visible immediately on all 3 locale pages without scrolling
- [ ] FAB visible on both desktop and mobile
- [ ] Correct platform per locale: WhatsApp (ES/EN), RedBook (ZH)
- [ ] Correct label text per locale on hover
- [ ] Opens correct link in new tab
- [ ] Zero console errors
- [ ] No visual overlap with cookie consent banner
- [ ] Old `#wa-float` element is gone from the DOM

---

## 6. Coverage Requirements

This feature is a **static Astro component** with no runtime logic beyond an `<a>` link. Testing strategy:

- [ ] Build-time type check (`astro check`) validates prop types and i18n key usage
- [ ] Manual visual regression test (Section 5) for all 3 locales
- [ ] No JavaScript unit tests required — the component has zero client-side JS
- [ ] If E2E tests exist (Playwright/Cypress): add a smoke test verifying `#contact-float` is visible on `load` event without scroll

---

## 7. Acceptance Criteria

**Definition of Done:**
- [ ] All implementation phases completed (i18n keys, component created, BaseLayout wired up)
- [ ] `astro build` succeeds with zero errors
- [ ] `astro check` reports zero TypeScript/Astro diagnostics
- [ ] Old `#wa-float` inline implementation fully removed from `BaseLayout.astro`
- [ ] `ContactFloat.astro` is imported and rendered in `BaseLayout.astro`
- [ ] FAB is visible on **all screen sizes** (desktop + tablet + mobile)
- [ ] FAB is visible **immediately on page load** (no scroll requirement)
- [ ] WhatsApp button shown for `es` and `en` locales
- [ ] RedBook button shown for `zh` locale
- [ ] Hover label animation works and shows correct locale text
- [ ] Correct `href` opens in `_blank` for each locale
- [ ] Accessibility: `aria-label` set correctly per locale; focus ring visible
- [ ] No regressions: existing cookie banner, analytics, and Calendly scripts unaffected
- [ ] Code follows Astro component conventions (frontmatter / template / style)
