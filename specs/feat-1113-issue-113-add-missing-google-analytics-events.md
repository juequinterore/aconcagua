# Feature Specification: Add Missing Google Analytics Events

> **TL;DR (≤2 sentences):** Audit `src/scripts/analytics.ts` against the recently shipped features (pricing contact form, floating contact widget, gallery lightbox, theme toggle, cookie consent, mobile menu, blog outbound link) and close every gap by (a) extending `analytics.ts` with new listeners, (b) emitting a small set of `CustomEvent`s from the components whose internal lifecycle is otherwise opaque (PricingContactForm, Gallery, ThemeToggle), and (c) creating `docs/ANALYTICS.md` to document every event, its parameters, and when it fires.
> **Tier:** M · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/ymc3sHXFIdhwAlQYQNDx`
**Git remote(s) (from `git remote -v`):** `origin git@github.com:juequinterore/aconcagua.git (fetch & push)`
**Git status at planning time (summary):** On branch `chore/add_google_analytics_events`; one untracked file (`bitbucket-api.sh`) — unrelated, leave alone.
**Remote vs `issue_json.git.repository`:** `not provided` — `issue_json` does not include a `git.repository` field. No mismatch possible.

**Source files consulted:**
- `docs/PROJECT.md` (authoritative project context)
- `package.json`, `astro.config.mjs`, `tsconfig.json`, `firebase.json`
- `src/scripts/analytics.ts` (existing GA4 instrumentation)
- `src/layouts/BaseLayout.astro` (gtag bootstrap + cookie consent banner)
- `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/Hero.astro`, `src/components/CTA.astro`
- `src/components/Pricing.astro`, `src/components/PricingCard.astro`, `src/components/PricingContactForm.astro` (latest feature, feat-1106 / feat-1107)
- `src/components/ContactFloat.astro` (floating chat FAB, feat-1234)
- `src/components/Gallery.astro` (Astro-Image lightbox, feat-1103)
- `src/components/ThemeToggle.astro`
- `src/i18n/es.ts` (sample of translation key shape — confirms analytics events are NOT user-visible strings and therefore not subject to i18n)
- `.github/workflows/deploy.yml` (CI = `npm run build`, no test step)
- Recent specs in `specs/` (1100, 1103, 1106, 1107, 1234) to identify "latest features" for the audit

**Purpose:** Static Astro marketing site for Julián Kusi's guided Aconcagua expeditions. Multi-locale (es / en / zh), deployed via Firebase Hosting, instrumented with GA4 (`G-6ZXZ206Z8T`) + Microsoft Clarity loaded only after explicit cookie consent.
**Project Type:** Single Astro package (not a monorepo), static SSG output.
**Primary Stack:** Astro 5.17.3, TypeScript (strict), plain CSS with design tokens, sharp image pipeline, Firebase (Firestore + "Trigger Email" extension via `contact_form` collection), Calendly popup.

**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (Astro + `@astrojs/check` type-check)
- Test: `N/A — no test suite exists` (per `docs/PROJECT.md`)
- Lint/Format: `N/A — none configured`

**Validation Gate (authoritative "is this working?" signal):** `npm run build` — must exit 0 with zero `@astrojs/check` errors/warnings. This is also what CI runs in `.github/workflows/deploy.yml`.

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs
├── docs/
│   └── PROJECT.md                # existing project doc — do NOT recreate
│   └── ANALYTICS.md              # NEW — created by this feature
├── src/
│   ├── layouts/BaseLayout.astro  # gtag bootstrap + cookie consent banner
│   ├── scripts/analytics.ts      # central event tracking (this is the main file)
│   └── components/
│       ├── Nav.astro             # hamburger #hamburger-btn, blog external link
│       ├── Footer.astro          # #manage-cookies, #manage-cookies-bottom, blog external link
│       ├── Hero.astro            # already-tracked
│       ├── ContactFloat.astro    # #contact-float floating FAB
│       ├── Gallery.astro         # .strip-item, #gallery-lightbox, #lb-close/#lb-prev/#lb-next
│       ├── PricingCard.astro     # [data-pricing-cta-trigger]
│       ├── PricingContactForm.astro  # contact dialog & form
│       └── ThemeToggle.astro     # already dispatches `theme-changed` CustomEvent
```

**Exposure Model:** All event tracking is centralised in `src/scripts/analytics.ts`, included from `src/layouts/BaseLayout.astro` line 398: `<script src="../scripts/analytics.ts"></script>`. The `BaseLayout` is rendered by every locale page (`src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`, `src/pages/404.astro`, `src/pages/privacidad.astro`, etc.), so any listener installed by `analytics.ts` is automatically wired up across all surfaces — no per-page exposure work is needed.

**Locale / Multi-Surface Requirements:** The site has three locales (`es`, `en`, `zh`). Analytics **event names and parameter keys are not user-visible**, therefore they do not require i18n entries. Every event payload, however, MUST include `language` (read from `document.documentElement.lang || 'es'`, matching the existing `pageLang` pattern in `analytics.ts`) so that GA4 reports can segment by locale.

**Conventions Observed:**
- File naming: PascalCase `.astro` for components (e.g., `PricingContactForm.astro`); lowercase `.ts` for scripts.
- Component pattern: every UI component receives `lang: 'es' | 'en' | 'zh'` and `t: (key: string) => string`.
- Styling: design-token-only — no hardcoded hex colours in component `<style>` blocks (`docs/PROJECT.md` § "Prohibitions").
- Analytics pattern (existing in `analytics.ts`): a single `trackEvent(name, params)` helper that null-checks `window.gtag`; tracking is gated behind `cookie_consent === 'granted'` via the `cookie:consent-granted` CustomEvent + an init flag (`trackingInitialized`). Listeners are registered once at module scope via `document.querySelectorAll(...).forEach`.
- Event naming: existing events use `snake_case` names (`calendly_open`, `nav_click`, `social_click`, `scroll_depth`, `section_view`, `language_switch`, `partner_click`, `email_click`, `whatsapp_click`, `cta_click`, `page_metadata`, `calendly_booking_complete`). New events MUST follow the same convention.
- Parameter keys: `snake_case`, primitives only (`string | number | boolean`) per the `trackEvent` signature in `analytics.ts` line 30.
- CustomEvent precedent: `ThemeToggle.astro` already dispatches `theme-changed` (bubbling); `BaseLayout.astro` dispatches `cookie:consent-granted` after the user accepts. New CustomEvents added by this feature follow the same convention and bubble to `document`.
- Test pattern: N/A — there is no test suite. Manual verification + `npm run build` is the gate.

**Reserved Paths / Redirects / Route Collisions to avoid:** This feature adds no routes. Redirects in `astro.config.mjs` (`/globalrescue`, `/pire`, `/en/pire`) are unaffected.

**Documentation Action Taken:** Used existing project docs at `docs/PROJECT.md`. This feature ADDS a new dedicated `docs/ANALYTICS.md` (the issue explicitly requires "properly documented" events) — `PROJECT.md` is unchanged.

**Change Tier:** **M** — 4 files modified (`analytics.ts`, `PricingContactForm.astro`, `Gallery.astro`, `ThemeToggle.astro`), 1 file created (`docs/ANALYTICS.md`), no schema/migration changes, no new dependencies, no new routes.

## 1. Design Analysis

**Target Scope:** Client-side instrumentation layer (`src/scripts/analytics.ts`) plus three components that need to expose lifecycle events that are otherwise unobservable to a script outside their `<script>` block.

**Affected Layers:**
- Analytics script (centralised — primary change site)
- Components emitting CustomEvents (PricingContactForm, Gallery, ThemeToggle)
- Documentation (`docs/ANALYTICS.md`)

**Problem Statement (from `issue_json`):** "Analyze the current status of Google Analytics events and the latest features added. Find missing relevant Google Analytics events that help understand how users interact with the website and gather relevant information. Add these events and implement them in the website, properly documented."

**Audit — what `analytics.ts` currently tracks (lines 36–248):**

| # | Event name | Trigger | Notes |
|---|---|---|---|
| 1 | `page_metadata` | every page load (post-consent) | language + page_path |
| 2 | `calendly_open` | `button[onclick*="Calendly"]` click | location, language, optional pricing_tier |
| 3 | `cta_click` (type=`view_expeditions`) | `a.hero-btn-secondary` click | only one type used |
| 4 | `whatsapp_click` | `a[href*="wa.me"]` click | location, language |
| 5 | `email_click` | `a[href^="mailto:"]` click | location, language |
| 6 | `social_click` | `.social-card`, `.social-icon`, `.social-icon-small` click | platform, location, language |
| 7 | `partner_click` | `.partner-card` click | partner, language |
| 8 | `language_switch` | `.lang-link` click | from_language, to_language |
| 9 | `nav_click` | `.nav-links a[href^="#"]`, `.overlay-nav-link` click | section, device_type, language |
| 10 | `scroll_depth` | scroll listener (25/50/75/100) | depth, language |
| 11 | `section_view` | IntersectionObserver on `section[id]`/`section[aria-label]` | section, language |
| 12 | `calendly_booking_complete` | postMessage `calendly.event_scheduled` | language |

**Audit — gaps vs. recently shipped features:**

| Recent feature (spec) | Gap |
|---|---|
| feat-1106 / feat-1107 — Pricing contact form (per-package modal, optional message field, Firestore submission) | **No tracking at all** — no open / submit / validation-error / success / failure / close events. This is the highest-traffic conversion path on the site after Calendly. |
| feat-1234 — Floating contact widget (`#contact-float` FAB) | **No direct event** — clicks on the FAB go to `wa.me/...` (zh: xiaohongshu), so the existing `whatsapp_click` listener catches the WA case but (a) gives `location='unknown'` because the FAB is in neither `.cta-section` nor `.footer`, and (b) misses the zh xiaohongshu case entirely. |
| feat-1103 — Astro-Image gallery + lightbox | **No tracking** — opens, navigations, closes, swipes, keyboard nav are invisible. |
| feat-1100 — Blog external link in Nav + Footer (`https://blog.aconcagua.co`) | The Nav's blog link is matched by the existing `nav_click` listener selector `.nav-links a[href^="#"]` — but the blog link's `href` does NOT start with `#`, so it is silently dropped. The Footer blog link is also untracked. |
| Theme toggle (existed before recent work, but never instrumented) | No event — we have no signal whether users actually use light/dark. |
| Cookie consent banner (BaseLayout) | No event for the consent decision itself. We can track `consent_granted` (because gtag is loaded right after) but not `consent_denied` (no gtag). We can also track the "Manage Cookies" buttons in the footer. |
| Mobile hamburger menu (`#hamburger-btn`) | No event for mobile menu open/close — we miss the mobile-vs-desktop discoverability signal beyond `nav_click.device_type`. |

**Solution Strategy:**
1. **Centralise all new tracking in `src/scripts/analytics.ts`.** Every new listener goes inside `setupTracking()` so it inherits the existing consent gate. Reuse the existing `trackEvent` helper.
2. **For component-internal lifecycles** (form open/submit/error, lightbox open/navigate/close, theme switch *with* theme detail) — have the component dispatch a bubbling `CustomEvent` whose `name` starts with `analytics:` and whose `detail` carries the parameter object. `analytics.ts` listens on `document` and forwards each one to `trackEvent`. This keeps every `gtag` call in one file and avoids duplicating the consent gate.
3. **For DOM elements with stable selectors** (FAB, hamburger, Manage-Cookies buttons, blog external link, Nav/Footer blog link) — hook directly via `document.querySelectorAll(...)` in `analytics.ts`, matching the established style.
4. **Document every event** — both pre-existing and new — in `docs/ANALYTICS.md`.

**Entry Point / Exposure:** `analytics.ts` is loaded once per page from `BaseLayout.astro:398`. Every locale page goes through `BaseLayout`, so installing listeners in `analytics.ts` automatically exposes them across all locales and routes (es `/`, en `/en/`, zh `/zh/`, plus 404 and privacy pages). No per-page wiring is required.

**Locale / Surface Coverage:** All three locales are exercised by the same script — `language` is read from `document.documentElement.lang` per page. No i18n keys to add.

**User Story:** As the site owner, I want analytics events on every meaningful interaction added by recent features (pricing inquiry, gallery, FAB, theme, cookie consent, mobile menu, blog clicks) so that I can understand where users engage, where they drop off, and which expedition packages drive the most inquiries.

## 2. Architecture & Data

### Architecture

**Two complementary tracking surfaces inside `analytics.ts`** (this is the existing pattern, just extended):

```
                      ┌──────────────────────────────────────────┐
   user click         │                analytics.ts              │
       │              │                                          │
       ├──→ DOM event─┼──→ direct querySelectorAll listener ─────┼──→ trackEvent('xxx', params) ──→ gtag('event', ...)
       │              │       (FAB, hamburger, manage-cookies,   │
       │              │        blog link, existing CTAs)         │
       │              │                                          │
       └──→ component──┼──→ component <script> dispatches ────────┼──→ trackEvent('xxx', e.detail)
            internal  │       CustomEvent('analytics:foo', …)    │
            state     │       on document (bubbles)              │
                      │                                          │
                      └──────────────────────────────────────────┘
```

This mirrors how `calendly_booking_complete` is already implemented (an external system — Calendly — emits postMessage; `analytics.ts` listens and forwards). The new CustomEvent pattern is the in-house equivalent.

**`analytics:`-prefixed CustomEvent contract** (new, established by this feature):
- Event name: `analytics:<snake_case_topic>` (e.g., `analytics:pricing_form_open`).
- Always bubbles. Always dispatched on `document`.
- `detail` is a flat `Record<string, string | number | boolean>` — same shape `trackEvent` accepts.
- `analytics.ts` translates each one into a GA4 event whose name DROPS the `analytics:` prefix.

### Data Changes
- [ ] Translation / i18n keys added: **None.** Analytics events are not user-visible strings.
- [ ] Schema / migration changes: **None.** No Firestore changes; no GA4 property changes (events appear automatically in GA4 once fired).
- [ ] Config changes: **None.** GA4 measurement ID `G-6ZXZ206Z8T` already configured in `BaseLayout.astro:310`.
- [ ] Static assets added: **None.**
- [ ] New dependencies: **None.**

## 3. Implementation Plan

### Affected Files

**Files to Change:**

- `src/scripts/analytics.ts` (Modify — `setupTracking()` function — append new tracking blocks for: blog/external outbound link, mobile menu toggle, theme change, cookie-consent decisions, manage-cookies, contact-float FAB, gallery lifecycle CustomEvents, pricing-form lifecycle CustomEvents, hero-scroll-indicator click. Also add a `consent_granted` event fired exactly once at the top of `setupTracking()`.)
- `src/components/PricingContactForm.astro` (Modify — `<script>` block, the `document.addEventListener('click', ...)` delegated open handler AND the `form.addEventListener('submit', ...)` handler — dispatch six CustomEvents: `analytics:pricing_form_open`, `analytics:pricing_form_close`, `analytics:pricing_form_validation_error`, `analytics:pricing_form_submit_attempt`, `analytics:pricing_form_submit_success`, `analytics:pricing_form_submit_error`.)
- `src/components/Gallery.astro` (Modify — `<script>` block, inside `openLightbox`, `closeLightbox`, and `showImage` functions — dispatch three CustomEvents: `analytics:gallery_image_open`, `analytics:gallery_navigate`, `analytics:gallery_lightbox_close`. Also dispatch close-method context — `button` / `keyboard` / `backdrop`.)
- `src/components/ThemeToggle.astro` (Modify — the click handler dispatching `theme-changed` — extend the CustomEvent's `detail` to include `{ from: current, to: next }`. Backward compatible: existing `Nav.astro` listener for `theme-changed` does not read `detail`.)
- `docs/ANALYTICS.md` (Create — comprehensive event catalogue: every existing + new event with name, when-fired, parameters, and example.)

**Files NOT changed (verified):**
- `src/components/ContactFloat.astro` — element has stable `id="contact-float"`; `analytics.ts` hooks it directly. No edits needed.
- `src/components/Nav.astro` — `#hamburger-btn`, `.nav-links a[href]:not([href^="#"])` (blog) — stable selectors; `analytics.ts` hooks directly.
- `src/components/Footer.astro` — `#manage-cookies`, `#manage-cookies-bottom`, footer blog link via existing `link.external`-rendered `target="_blank"` anchor in `.footer-links` — stable selectors.
- `src/layouts/BaseLayout.astro` — the `cookie:consent-granted` event already exists and is the trigger for `setupTracking()`. We fire `consent_granted` from inside `setupTracking()`, so no edit to BaseLayout is needed.
- `src/i18n/{es,en,zh}.ts` — analytics events are not user-visible strings.
- `src/components/Hero.astro`, `src/components/CTA.astro`, `src/components/Pricing.astro`, `src/components/PricingCard.astro` — no internal-lifecycle events to expose; existing selectors (`a.hero-btn-secondary`, `button[onclick*="Calendly"]`, `[data-pricing-cta-trigger]`) are sufficient.

### Execution Steps

**Phase 1: Component-side CustomEvents (publishers)**

Each component change is additive — no behavioural changes, only new event dispatches. Use a small local helper to avoid repetition.

- [ ] **`src/components/PricingContactForm.astro`** — inside the existing `<script>` block:
    - Add a top-level helper near the top of the script:
      ```ts
      function fire(name: string, detail: Record<string, string | number | boolean> = {}): void {
        document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
      }
      ```
    - In the delegated open handler (currently `document.addEventListener('click', (e) => { … dlg.showModal(); … })`), AFTER `dlg.showModal()`, fire:
      ```ts
      fire('analytics:pricing_form_open', {
        dialog_id: id,
        package_id: dlg.querySelector<HTMLInputElement>('input[name="packageId"]')?.value ?? '',
        package_slug: dlg.querySelector<HTMLInputElement>('input[name="packageSlug"]')?.value ?? '',
        package_name: dlg.querySelector<HTMLInputElement>('input[name="packageName"]')?.value ?? '',
      });
      ```
    - In the per-wrapper loop, on `closeBtn.addEventListener('click', …)` AND inside the click-outside-dialog branch, fire:
      ```ts
      fire('analytics:pricing_form_close', { dialog_id: dialog.id, method: <'close_button' | 'backdrop'> });
      ```
    - In the form submit handler:
        - When validation fails (`hasError === true`), fire ONCE per submit attempt:
          ```ts
          fire('analytics:pricing_form_validation_error', {
            dialog_id: dialog.id,
            package_id: packageIdValue,
            fields: failedFieldNames.join(','), // e.g. "name,email"
          });
          ```
          (Build `failedFieldNames: string[]` alongside the existing `hasError` accumulation.)
        - Right after `submitBtn.disabled = true; statusEl.textContent = msgSending;` fire:
          ```ts
          fire('analytics:pricing_form_submit_attempt', {
            dialog_id: dialog.id,
            package_id: packageId,
            package_slug: packageSlug,
            has_message: userMessageVal.length > 0,
          });
          ```
        - On successful `addDoc` (after `statusEl.textContent = msgSuccess`) fire:
          ```ts
          fire('analytics:pricing_form_submit_success', {
            dialog_id: dialog.id,
            package_id: packageId,
            package_slug: packageSlug,
            has_message: userMessageVal.length > 0,
          });
          ```
        - In the `catch (err)` block, after the existing `console.error`/status update, fire:
          ```ts
          fire('analytics:pricing_form_submit_error', {
            dialog_id: dialog.id,
            package_id: packageId,
            package_slug: packageSlug,
            error: (err as Error)?.message?.slice(0, 200) ?? 'unknown',
          });
          ```

- [ ] **`src/components/Gallery.astro`** — inside the existing `<script>` block:
    - Add the same `fire(name, detail)` helper.
    - In `openLightbox(index)`, AFTER `lightbox.hidden = false`, fire:
      ```ts
      fire('analytics:gallery_image_open', { index, alt: images[index]?.alt ?? '' });
      ```
    - In `showImage(index)`, AT THE END (after computing `current`), fire — but ONLY when called from a navigation action, not from initial open. Implement by adding an internal `function navigate(direction: 'prev' | 'next', via: 'button' | 'keyboard' | 'swipe')` that calls `showImage` and then `fire('analytics:gallery_navigate', { direction, via, index: current })`. Update the existing `lbPrev`, `lbNext`, keydown ArrowLeft/ArrowRight, and touchend swipe handlers to call `navigate(...)` instead of `showImage(current ± 1)` directly. Keep `showImage` itself untracked so the initial `openLightbox → showImage(index)` does not double-fire.
    - In `closeLightbox(method?: 'button' | 'keyboard' | 'backdrop')`, BEFORE `lightbox.hidden = true`, fire:
      ```ts
      fire('analytics:gallery_lightbox_close', { method: method ?? 'button', last_index: current });
      ```
      Update callers:
        - `lbClose.addEventListener('click', closeLightbox)` → `closeLightbox('button')`
        - Backdrop click `if (e.target === lightbox) closeLightbox()` → `closeLightbox('backdrop')`
        - Escape key `if (e.key === 'Escape') closeLightbox()` → `closeLightbox('keyboard')`

- [ ] **`src/components/ThemeToggle.astro`** — inside the existing click handler, change:
    ```ts
    btn.dispatchEvent(new CustomEvent('theme-changed', { bubbles: true }));
    ```
    to:
    ```ts
    btn.dispatchEvent(new CustomEvent('theme-changed', { bubbles: true, detail: { from: current, to: next } }));
    ```
    No other change. The existing `Nav.astro` listener (`overlay.addEventListener('theme-changed', closeMenu)`) ignores `detail`, so this is backward-compatible.

**Phase 2: `analytics.ts` listeners (subscribers)**

Append the following blocks INSIDE `setupTracking()` in `src/scripts/analytics.ts` (after section 13, before the closing brace). Use the existing `trackEvent` helper. All blocks already inherit the consent gate.

- [ ] **Block 14 — Consent granted ping.** Fire once at the very top of `setupTracking()` (just after `trackEvent('page_metadata', …)`):
    ```ts
    trackEvent('consent_granted', { language: pageLang });
    ```
    This captures the moment a session first becomes trackable; it covers both first-visit (consent just granted) and return-visit (already granted) cases.

- [ ] **Block 15 — Manage-Cookies buttons.** Hook `#manage-cookies` (footer column) and `#manage-cookies-bottom` (footer bottom row):
    ```ts
    document.querySelectorAll<HTMLButtonElement>('#manage-cookies, #manage-cookies-bottom').forEach((btn) => {
      btn.addEventListener('click', () => {
        trackEvent('cookie_manage_open', {
          location: btn.id === 'manage-cookies-bottom' ? 'footer_bottom' : 'footer',
          language: pageLang,
        });
      });
    });
    ```

- [ ] **Block 16 — Mobile menu open/close.** Hook `#hamburger-btn`. Read `aria-expanded` AFTER click — but the Nav's existing handler runs first (script order is fine since `analytics.ts` is loaded after Nav's component script, but to be safe, schedule with `requestAnimationFrame`):
    ```ts
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        requestAnimationFrame(() => {
          const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
          trackEvent('mobile_menu_toggle', { state: isOpen ? 'open' : 'close', language: pageLang });
        });
      });
    }
    ```

- [ ] **Block 17 — Theme change.** Listen on `document` for the existing `theme-changed` CustomEvent (now carrying `detail.from` / `detail.to`):
    ```ts
    document.addEventListener('theme-changed', (e: Event) => {
      const detail = (e as CustomEvent<{ from?: string; to?: string }>).detail ?? {};
      trackEvent('theme_change', {
        from_theme: detail.from ?? 'unknown',
        to_theme: detail.to ?? 'unknown',
        language: pageLang,
      });
    });
    ```

- [ ] **Block 18 — Floating contact widget.** Hook `#contact-float`:
    ```ts
    const fab = document.getElementById('contact-float');
    if (fab) {
      fab.addEventListener('click', () => {
        const href = fab.getAttribute('href') ?? '';
        let destination = 'unknown';
        if (href.includes('wa.me')) destination = 'whatsapp';
        else if (href.includes('xhslink.com') || href.includes('xiaohongshu')) destination = 'xiaohongshu';
        trackEvent('contact_float_click', { destination, language: pageLang });
      });
    }
    ```
    Note: the existing `whatsapp_click` listener will ALSO fire for the FAB when `destination === 'whatsapp'`. That is acceptable — the two events answer different questions ("how often is the FAB tapped" vs. "how often is any WA link tapped") — but to keep `whatsapp_click.location` accurate, also extend the existing block 5 to detect the FAB:
    ```ts
    if (link.id === 'contact-float') location = 'floating_widget';
    ```
    (Insert into the existing `else if` chain in section 5.)

- [ ] **Block 19 — Outbound external links (blog).** The Nav and Footer render the blog link with `target="_blank"`. Track every external `<a target="_blank">` click that is NOT already covered by `whatsapp_click` / `email_click` / `social_click` / `partner_click`:
    ```ts
    document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((link) => {
      if (
        link.matches('a[href*="wa.me"]') ||
        link.closest('.partner-card, .social-card, .social-icon, .social-icon-small') ||
        link.id === 'contact-float'
      ) return;
      const href = link.getAttribute('href') ?? '';
      if (!href || href.startsWith('mailto:')) return;
      let destination = 'other';
      try { destination = new URL(href, window.location.origin).hostname; } catch { /* keep 'other' */ }
      let location = 'unknown';
      if (link.closest('.nav, .nav-overlay')) location = 'nav';
      else if (link.closest('.footer')) location = 'footer';
      else if (link.closest('.cta-section')) location = 'cta_section';
      link.addEventListener('click', () => {
        trackEvent('outbound_click', { destination, href: href.slice(0, 200), location, language: pageLang });
      });
    });
    ```
    This catches the blog link in both Nav and Footer, and any future external links, without needing per-link instrumentation.

- [ ] **Block 20 — Hero scroll-indicator click.** The `<a href="#sobre" class="scroll-indicator">` in `Hero.astro` is currently NOT covered by `nav_click` (its selector is `.nav-links a[href^="#"]`, not `.scroll-indicator`):
    ```ts
    document.querySelectorAll<HTMLAnchorElement>('.scroll-indicator').forEach((link) => {
      link.addEventListener('click', () => {
        trackEvent('hero_scroll_indicator_click', { target: link.getAttribute('href') ?? '', language: pageLang });
      });
    });
    ```

- [ ] **Block 21 — Pricing-form lifecycle (CustomEvent forwarder).** Single forwarder for all six events:
    ```ts
    const PRICING_FORM_EVENTS = [
      'analytics:pricing_form_open',
      'analytics:pricing_form_close',
      'analytics:pricing_form_validation_error',
      'analytics:pricing_form_submit_attempt',
      'analytics:pricing_form_submit_success',
      'analytics:pricing_form_submit_error',
    ] as const;
    PRICING_FORM_EVENTS.forEach((evtName) => {
      document.addEventListener(evtName, (e: Event) => {
        const detail = (e as CustomEvent<Record<string, string | number | boolean>>).detail ?? {};
        trackEvent(evtName.replace('analytics:', ''), { ...detail, language: pageLang });
      });
    });
    ```

- [ ] **Block 22 — Gallery lifecycle (CustomEvent forwarder).** Same pattern:
    ```ts
    const GALLERY_EVENTS = [
      'analytics:gallery_image_open',
      'analytics:gallery_navigate',
      'analytics:gallery_lightbox_close',
    ] as const;
    GALLERY_EVENTS.forEach((evtName) => {
      document.addEventListener(evtName, (e: Event) => {
        const detail = (e as CustomEvent<Record<string, string | number | boolean>>).detail ?? {};
        trackEvent(evtName.replace('analytics:', ''), { ...detail, language: pageLang });
      });
    });
    ```

**Phase 3: Integration & Exposure (MANDATORY)**

- [ ] No new component imports / no new page imports / no `Nav.astro` `navLinks` change — all wiring lives inside `BaseLayout.astro`'s already-included `analytics.ts`. Confirmed by reading `BaseLayout.astro` line 398.
- [ ] No locale-specific work — analytics events are not strings; `language` is read at runtime from `<html lang>`.

**Phase 4: Documentation (`docs/ANALYTICS.md`)**

Create `docs/ANALYTICS.md` with the following structure (the implementer fills in the prose; the structure below is binding):

1. **Header** — purpose: "Catalogue of every Google Analytics 4 event fired from aconcagua.co. Audited and updated when the analytics surface changes."
2. **Setup section** — restate from `BaseLayout.astro`: GA4 measurement ID `G-6ZXZ206Z8T`, loaded after cookie consent, plus Microsoft Clarity. Reference `src/scripts/analytics.ts` as the authoritative source.
3. **Conventions section** — event-naming convention (`snake_case`), parameter keys (`snake_case`), every event includes `language` where meaningful, parameter values must be `string | number | boolean` (no nested objects), the in-house `analytics:`-prefixed CustomEvent contract.
4. **Event catalogue** — one subsection per event, in the order they appear in `analytics.ts`. Each subsection MUST include:
    - Event name (heading)
    - Trigger description (one sentence + the source location, e.g., "fires when a user clicks `[data-pricing-cta-trigger]` and the dialog opens — `PricingContactForm.astro`")
    - Parameters table: `name | type | description | example`
    - "Why we track this" — one-line rationale tying the event to a question the owner can answer in GA4.
5. **List of events to document (must be complete)** — pre-existing AND new, in this order:
    - `page_metadata`
    - `consent_granted` *(new)*
    - `cookie_manage_open` *(new)*
    - `mobile_menu_toggle` *(new)*
    - `theme_change` *(new)*
    - `language_switch`
    - `nav_click`
    - `hero_scroll_indicator_click` *(new)*
    - `cta_click`
    - `calendly_open`
    - `calendly_booking_complete`
    - `whatsapp_click`
    - `email_click`
    - `contact_float_click` *(new)*
    - `social_click`
    - `partner_click`
    - `outbound_click` *(new — covers blog and any future external link)*
    - `pricing_form_open` *(new)*
    - `pricing_form_close` *(new)*
    - `pricing_form_validation_error` *(new)*
    - `pricing_form_submit_attempt` *(new)*
    - `pricing_form_submit_success` *(new)*
    - `pricing_form_submit_error` *(new)*
    - `gallery_image_open` *(new)*
    - `gallery_navigate` *(new)*
    - `gallery_lightbox_close` *(new)*
    - `scroll_depth`
    - `section_view`
6. **Local development testing section** — instructions: open DevTools → Network → filter `collect?` to see live GA4 hits; Application → LocalStorage → set `cookie_consent=granted` to skip the banner; or use the GA4 DebugView with the [GA Debugger Chrome extension](https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna).
7. **PII / consent section** — GA4 + Clarity load only after `localStorage.cookie_consent === 'granted'`; no event sends PII (form `name`/`email` are NEVER passed to `trackEvent`).
8. **How to add a new event** — checklist:
    - Decide whether it's a DOM-stable hook (add a `document.querySelectorAll` block in `analytics.ts`) or a component-internal lifecycle (dispatch `analytics:foo` CustomEvent + add a forwarder in `analytics.ts`).
    - Add an entry to `docs/ANALYTICS.md` in the same release.
    - Verify in GA4 DebugView before merging.

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero `@astrojs/check` errors and zero warnings.
- [ ] All new TypeScript in `analytics.ts` and component `<script>` blocks type-checks under `astro/tsconfigs/strict`.
- [ ] No hardcoded hex colours introduced (this feature adds zero CSS).
- [ ] No new dependencies (`package.json` and `package-lock.json` unchanged).
- [ ] No new translation keys added; `src/i18n/{es,en,zh}.ts` are byte-identical to `main` for this feature.
- [ ] No new routes / no `astro.config.mjs` change.
- [ ] Existing `theme-changed` consumer in `Nav.astro` (`overlay.addEventListener('theme-changed', closeMenu)`) still works — verified by reading the listener (it does not access `detail`).
- [ ] Existing `cookie:consent-granted` flow in `BaseLayout.astro` still works — no edits to that file.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` (only if `node_modules` missing)
- [ ] `npm run dev`
- [ ] Open `http://localhost:4321/` in a browser with DevTools open (Network tab filtered to `collect?`).
- [ ] In the cookie banner, click "Accept" — confirm GA4 collect requests start firing.
- [ ] Open the GA4 DebugView for property `G-6ZXZ206Z8T` (recommended) OR rely on Network → `collect?v=2&...&en=<event_name>` parameters to verify event names and params.

**Scenario (run on each of `/`, `/en/`, `/zh/` — desktop AND mobile viewports):**
1. [ ] Land on the page → expect `page_metadata` AND `consent_granted` events with correct `language`.
2. [ ] Click the nav blog link → expect `outbound_click` with `destination=blog.aconcagua.co`, `location=nav`.
3. [ ] Open the mobile hamburger menu → expect `mobile_menu_toggle` `state=open`. Close it → `state=close`.
4. [ ] Toggle theme (sun/moon) → expect `theme_change` with `from_theme` and `to_theme`.
5. [ ] Click the floating contact widget (right-bottom). On `/`, `/en/` → expect `contact_float_click` `destination=whatsapp` AND the existing `whatsapp_click` `location=floating_widget`. On `/zh/` → expect `contact_float_click` `destination=xiaohongshu` (no `whatsapp_click`).
6. [ ] Click "Manage Cookies" in the footer → expect `cookie_manage_open` `location=footer`. Click the inline one in the bottom row → `location=footer_bottom`.
7. [ ] Click the hero "View expeditions" secondary CTA → existing `cta_click` still fires (regression check).
8. [ ] Click the hero scroll indicator (the small arrow at the bottom of the hero) → expect `hero_scroll_indicator_click` `target=#sobre`.
9. [ ] Open a gallery image → expect `gallery_image_open` with `index` and `alt`. Click the `›` button → expect `gallery_navigate` `direction=next via=button`. Press `→` key → `via=keyboard`. Swipe on touch → `via=swipe`. Close via × → `gallery_lightbox_close` `method=button`. Re-open and press `Esc` → `method=keyboard`. Re-open and click the dark backdrop → `method=backdrop`.
10. [ ] Open a pricing card's "Consultar Disponibilidad" / "Consult Availability" / "查询可用性" → expect `pricing_form_open` with `package_id` and `package_slug`.
11. [ ] Submit the form WITHOUT filling required fields → expect `pricing_form_validation_error` with `fields=name,email` (or whichever failed). The form does NOT submit (regression check).
12. [ ] Fill name + email, leave message empty, submit → expect `pricing_form_submit_attempt` `has_message=false`, then `pricing_form_submit_success` `has_message=false` after Firestore write.
13. [ ] Fill name + email + a long message, submit → expect both events with `has_message=true`.
14. [ ] (Force a Firestore failure — disable network in DevTools) → expect `pricing_form_submit_error` with `error` (truncated).
15. [ ] Close the dialog via × → expect `pricing_form_close` `method=close_button`. Close by clicking outside → `method=backdrop`.
16. [ ] Existing regressions (must still work): scroll to ~50% → `scroll_depth depth=50`; see About section → `section_view section=sobre`; click a Calendly button → `calendly_open`; book a meeting → `calendly_booking_complete`; click a social card → `social_click`; click a partner card → `partner_click`; click the language switcher → `language_switch`; click an in-page anchor in nav → `nav_click`.

**Success Criteria:**
- ✅ Every new event in steps 1–15 appears with the documented parameter shape.
- ✅ No regressions in steps 16 (all pre-existing events still fire).
- ✅ No PII (no `name`, `email`, `userMessage`, `userAgent`, `referrer`) appears in any GA4 payload.
- ✅ `npm run build` passes with zero errors / zero warnings.
- ✅ `docs/ANALYTICS.md` lists every event from the catalogue in Phase 4 step 5.

## 6. Coverage Requirements

- [ ] **Tests:** the project has no test suite (per `docs/PROJECT.md` § Commands). The Manual Verification Script above IS the coverage. State this explicitly in the PR description.
- [ ] **Edge cases to consider** (must all be exercised in manual verification):
    - First-visit vs. return-visit consent (`consent_granted` fires in both — the listener wakes up either at module load or on the `cookie:consent-granted` event).
    - Cookie consent declined → no events should fire at all (verify in Network tab: zero `collect?` requests, zero `clarity` requests).
    - zh-only floating widget (xiaohongshu) → `contact_float_click destination=xiaohongshu`, no `whatsapp_click`.
    - Pricing form with optional message empty vs. filled → `has_message` boolean correct.
    - Pricing form validation (multiple fields failing in one submit) → exactly ONE `pricing_form_validation_error` with comma-joined fields.
    - Gallery initial open does NOT fire `gallery_navigate` (only `gallery_image_open`).
    - Theme toggle from inside the mobile overlay (which also closes the menu via `theme-changed`) — both `theme_change` AND `mobile_menu_toggle state=close` fire.
    - Mobile menu toggle: `aria-expanded` is read inside `requestAnimationFrame` so the Nav handler has flipped it first.

## 7. Acceptance Criteria (Definition of Done)

- [ ] All four phases above completed; all five "Files to Change" actually modified/created exactly as specified.
- [ ] `npm run build` passes with zero errors and zero warnings.
- [ ] Manual verification script (Section 5) completed across all three locales on desktop AND mobile viewports.
- [ ] `docs/ANALYTICS.md` exists at the project root under `docs/` and documents every event listed in Phase 4 step 5.
- [ ] No regressions in pre-existing events (Section 5 step 16).
- [ ] No PII reaches GA4 (Section 5 success criterion).
- [ ] No new dependencies, no new routes, no schema/migration changes, no i18n key changes — confirmed via `git diff` summary.
- [ ] All requirements in `issue_json` mapped: "analyze the current status" → Section 0 + Section 1 audit table; "find missing relevant Google Analytics events" → Section 1 gaps table; "Add these events and implement them in the website" → Phases 1–3; "properly documented" → Phase 4 (`docs/ANALYTICS.md`).
