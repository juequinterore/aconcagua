# Analytics Event Catalogue — aconcagua.co

> Catalogue of every Google Analytics 4 event fired from aconcagua.co.
> Audited and updated when the analytics surface changes.

---

## Setup

| Property | Value |
|---|---|
| GA4 Measurement ID | `G-6ZXZ206Z8T` |
| Microsoft Clarity | Loaded alongside GA4 after consent |
| Consent gate | Both GA4 and Clarity are loaded **only** after `localStorage.cookie_consent === 'granted'` — wired via `BaseLayout.astro` |
| Source of truth | `src/scripts/analytics.ts` — every `gtag('event', …)` call originates here |

GA4 and Clarity scripts are dynamically injected by `src/layouts/BaseLayout.astro` when the user accepts the cookie banner (or on any subsequent page load for a returning visitor). `analytics.ts` is always included in `BaseLayout`, so every locale page (`/`, `/en/`, `/zh/`, 404, privacy) is automatically instrumented.

---

## Conventions

- **Event names:** `snake_case` (e.g., `pricing_form_open`, `scroll_depth`).
- **Parameter keys:** `snake_case`; values must be `string | number | boolean` — no nested objects or arrays.
- **`language` parameter:** every event that is meaningful to segment by locale includes a `language` parameter read from `document.documentElement.lang` (defaults to `'es'`).
- **`analytics:` CustomEvent contract:** Components whose internal lifecycle is not directly observable from outside their `<script>` block dispatch bubbling `CustomEvent`s named `analytics:<snake_case_topic>` (e.g., `analytics:pricing_form_open`) on `document`. The `detail` payload is a flat `Record<string, string | number | boolean>`. `analytics.ts` listens for each and forwards them to `trackEvent()` — this keeps every `gtag` call in one file and avoids duplicating the consent gate.
- **Consent requirement:** All events are gated behind the `trackingInitialized` flag in `analytics.ts`; no data is sent before the user grants consent.

---

## Event Catalogue

### `page_metadata`

**Trigger:** Fires once per page load immediately after tracking is initialised (post-consent). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `language` | `string` | Locale of the current page | `"es"` |
| `page_path` | `string` | `window.location.pathname` | `"/en/"` |

**Why we track this:** Establishes a baseline session record that can be joined to other events; allows GA4 to see per-locale page-view counts without relying on `page_view` auto-collection.

---

### `consent_granted` *(new)*

**Trigger:** Fires once at the top of `setupTracking()`, immediately after `page_metadata`. Fires for both first-visit (user just clicked "Accept") and return visits (consent already stored). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `language` | `string` | Locale of the current page | `"zh"` |

**Why we track this:** Measures the size of the trackable audience; the ratio of `consent_granted` sessions to total GA4 sessions reveals cookie-acceptance rate.

---

### `cookie_manage_open` *(new)*

**Trigger:** Fires when a user clicks either "Manage Cookies" button in the footer — the footer column button (`#manage-cookies`) or the footer bottom row button (`#manage-cookies-bottom`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `location` | `string` | Which button was clicked: `"footer"` or `"footer_bottom"` | `"footer_bottom"` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Indicates how many users reconsider their consent decision; a spike may signal a UX issue with the banner or privacy policy.

---

### `mobile_menu_toggle` *(new)*

**Trigger:** Fires when the hamburger button (`#hamburger-btn`) is clicked, after the Nav's own handler has run (via `requestAnimationFrame`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `state` | `string` | `"open"` or `"close"` | `"open"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Reveals whether mobile users discover and use the navigation overlay, and whether they explore it or immediately close it.

---

### `theme_change` *(new)*

**Trigger:** Fires when the user clicks any `ThemeToggle` button (sun/moon icon). The toggle dispatches a `theme-changed` CustomEvent with `detail.from` and `detail.to`; `analytics.ts` listens on `document` and forwards it. Source: `ThemeToggle.astro` (publisher) + `analytics.ts` (subscriber).

| Parameter | Type | Description | Example |
|---|---|---|---|
| `from_theme` | `string` | Theme before the click | `"dark"` |
| `to_theme` | `string` | Theme after the click | `"light"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Determines whether users actively switch themes, which informs whether both themes need equal design attention.

---

### `language_switch`

**Trigger:** Fires when a user clicks a language-switcher link (`.lang-link`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `from_language` | `string` | The locale the user was on | `"es"` |
| `to_language` | `string` | The locale the user switched to | `"en"` |

**Why we track this:** Measures cross-locale navigation; reveals which languages drive interest from non-native speakers.

---

### `nav_click`

**Trigger:** Fires when a user clicks an in-page anchor link in the desktop nav (`.nav-links a[href^="#"]`) or a link in the mobile overlay nav (`.overlay-nav-link`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `section` | `string` | The `href` attribute value | `"#expediciones"` |
| `device_type` | `string` | `"mobile"` (overlay link) or `"desktop"` | `"desktop"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Shows which sections draw the most navigation intent; identifies which parts of the page users want to reach directly.

---

### `hero_scroll_indicator_click` *(new)*

**Trigger:** Fires when a user clicks the scroll-indicator arrow at the bottom of the hero section (`.scroll-indicator` — the `<a href="#sobre">` element). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `target` | `string` | The `href` value of the scroll indicator | `"#sobre"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Measures how many users use the explicit "scroll down" affordance vs. scrolling organically, informing hero layout decisions.

---

### `cta_click`

**Trigger:** Fires when a user clicks the "View expeditions" secondary CTA button in the Hero section (`a.hero-btn-secondary`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `type` | `string` | CTA type — currently always `"view_expeditions"` | `"view_expeditions"` |
| `location` | `string` | Section where the CTA lives | `"hero"` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Measures intent to explore expedition packages from the hero section; a leading indicator of booking funnel entry.

---

### `calendly_open`

**Trigger:** Fires when a user clicks any Calendly booking button (`button[onclick*="Calendly"]`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `location` | `string` | Where the button was: `"hero"`, `"nav"`, `"cta_section"`, `"pricing"`, `"unknown"` | `"pricing"` |
| `pricing_tier` | `string` | *(pricing buttons only)* Name of the pricing card | `"Aconcagua Standard"` |
| `language` | `string` | Locale of the current page | `"zh"` |

**Why we track this:** Measures entry to the primary booking funnel; `location` shows which surface drives the most Calendly opens.

---

### `calendly_booking_complete`

**Trigger:** Fires when Calendly's `postMessage` emits `calendly.event_scheduled`. Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Measures actual booking completions — the single most important conversion event on the site.

---

### `whatsapp_click`

**Trigger:** Fires when a user clicks any `<a href*="wa.me">` link. Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `location` | `string` | Where the link was: `"floating_widget"`, `"cta_section"`, `"footer"`, `"unknown"` | `"cta_section"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Measures WhatsApp contact intent by surface; `floating_widget` helps determine FAB effectiveness.

---

### `email_click`

**Trigger:** Fires when a user clicks a `mailto:` link. Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `location` | `string` | Where the link was: `"cta_section"`, `"footer"`, `"unknown"` | `"footer"` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Measures email contact intent; low numbers relative to WhatsApp may indicate a preference shift in the audience.

---

### `contact_float_click` *(new)*

**Trigger:** Fires when a user clicks the floating contact widget FAB (`#contact-float`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `destination` | `string` | `"whatsapp"`, `"xiaohongshu"`, or `"unknown"` | `"xiaohongshu"` |
| `language` | `string` | Locale of the current page | `"zh"` |

**Why we track this:** Measures FAB engagement directly; the `destination` dimension reveals which locale's widget variant is tapped more. On non-zh locales the existing `whatsapp_click` event also fires with `location=floating_widget`.

---

### `social_click`

**Trigger:** Fires when a user clicks a social media link (`.social-card`, `.social-icon`, `.social-icon-small`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `platform` | `string` | Platform name from `aria-label` or text content | `"Instagram"` |
| `location` | `string` | `"social_section"`, `"footer"`, `"footer_bottom"`, `"unknown"` | `"footer"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Reveals which social platforms drive outbound traffic and where on the page users engage with social links.

---

### `partner_click`

**Trigger:** Fires when a user clicks a partner card (`.partner-card`). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `partner` | `string` | Partner name from `.partner-name` text content | `"Global Rescue"` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Measures which partner affiliations resonate with visitors; informs partnership renewal decisions.

---

### `outbound_click` *(new — covers blog and any future external link)*

**Trigger:** Fires when a user clicks any `<a target="_blank">` link that is not already covered by `whatsapp_click`, `email_click`, `social_click`, or `partner_click`. Primarily covers the blog link (`blog.aconcagua.co`) in the Nav and Footer, but applies to any future external links too. Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `destination` | `string` | Hostname of the outbound URL | `"blog.aconcagua.co"` |
| `href` | `string` | Full href (truncated to 200 chars) | `"https://blog.aconcagua.co"` |
| `location` | `string` | `"nav"`, `"footer"`, `"cta_section"`, `"unknown"` | `"nav"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Shows how much traffic the site drives to the expedition blog, and reveals where on the page external links convert.

---

### `pricing_form_open` *(new)*

**Trigger:** Fires when a pricing card's "Consult Availability" / "Consultar Disponibilidad" button is clicked and the per-package contact dialog opens. Source: `PricingContactForm.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `dialog_id` | `string` | ID of the opened dialog element | `"pricing-dialog-card2"` |
| `package_id` | `string` | Hidden field `packageId` value | `"card2"` |
| `package_slug` | `string` | Hidden field `packageSlug` value | `"aconcagua-standard"` |
| `package_name` | `string` | Hidden field `packageName` value | `"Aconcagua Standard"` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Measures top-of-funnel interest in each pricing package; the highest-impact conversion signal after Calendly opens.

---

### `pricing_form_close` *(new)*

**Trigger:** Fires when the pricing contact dialog is closed — either via the × close button or by clicking the backdrop. Source: `PricingContactForm.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `dialog_id` | `string` | ID of the closed dialog | `"pricing-dialog-card1"` |
| `method` | `string` | `"close_button"` or `"backdrop"` | `"backdrop"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Combined with `pricing_form_open`, reveals the open-to-submit conversion rate and how users abandon the form.

---

### `pricing_form_validation_error` *(new)*

**Trigger:** Fires once per submit attempt when client-side validation fails (before the Firestore write is attempted). Source: `PricingContactForm.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `dialog_id` | `string` | ID of the dialog containing the form | `"pricing-dialog-card3"` |
| `package_id` | `string` | Package being inquired about | `"card3"` |
| `fields` | `string` | Comma-joined list of failed field names | `"name,email"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Identifies UX friction in the contact form; high `name,email` errors may indicate placeholder text is confusing users.

---

### `pricing_form_submit_attempt` *(new)*

**Trigger:** Fires immediately after the submit button is disabled and the "sending" state appears — i.e., validation passed and the Firestore write is about to begin. Source: `PricingContactForm.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `dialog_id` | `string` | ID of the dialog | `"pricing-dialog-card1"` |
| `package_id` | `string` | Package being inquired about | `"card1"` |
| `package_slug` | `string` | Package slug | `"aconcagua-express"` |
| `has_message` | `boolean` | Whether the optional message field was filled | `true` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Paired with `pricing_form_submit_success`, the gap between attempt and success reveals network-failure rates.

---

### `pricing_form_submit_success` *(new)*

**Trigger:** Fires after the Firestore `addDoc` call resolves successfully and the success message is shown. Source: `PricingContactForm.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `dialog_id` | `string` | ID of the dialog | `"pricing-dialog-card2"` |
| `package_id` | `string` | Package inquired about | `"card2"` |
| `package_slug` | `string` | Package slug | `"aconcagua-standard"` |
| `has_message` | `boolean` | Whether a message was included | `false` |
| `language` | `string` | Locale of the current page | `"zh"` |

**Why we track this:** Counts successful inquiry submissions per package — the primary pricing-funnel conversion metric.

---

### `pricing_form_submit_error` *(new)*

**Trigger:** Fires in the `catch` block if the Firestore write fails. Source: `PricingContactForm.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `dialog_id` | `string` | ID of the dialog | `"pricing-dialog-card4"` |
| `package_id` | `string` | Package being inquired about | `"card4"` |
| `package_slug` | `string` | Package slug | `"aconcagua-traverse"` |
| `error` | `string` | Error message (truncated to 200 chars) | `"FirebaseError: permission-denied"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Surfaces Firestore write failures in GA4; a spike indicates a Firebase rules or quota issue needing immediate attention.

---

### `gallery_image_open` *(new)*

**Trigger:** Fires when a user clicks a strip thumbnail and the lightbox opens. Source: `Gallery.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `index` | `number` | Zero-based index of the image in the gallery array | `4` |
| `alt` | `string` | Alt text of the opened image | `"Team of six climbers ascending…"` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Shows which images attract the most interest; informs photo selection for future expedition marketing.

---

### `gallery_navigate` *(new)*

**Trigger:** Fires when the user navigates to a different image inside the lightbox — via the `‹`/`›` buttons, arrow keys, or touch swipe. **Does NOT fire on initial open.** Source: `Gallery.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `direction` | `string` | `"prev"` or `"next"` | `"next"` |
| `via` | `string` | How the navigation was triggered: `"button"`, `"keyboard"`, or `"swipe"` | `"swipe"` |
| `index` | `number` | Zero-based index of the image now displayed | `7` |
| `language` | `string` | Locale of the current page | `"zh"` |

**Why we track this:** Reveals gallery engagement depth and input method preferences; high swipe counts confirm mobile-friendliness.

---

### `gallery_lightbox_close` *(new)*

**Trigger:** Fires when the lightbox is closed — via the × button, Escape key, or backdrop click. Source: `Gallery.astro` → `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `method` | `string` | `"button"`, `"keyboard"`, or `"backdrop"` | `"keyboard"` |
| `last_index` | `number` | Zero-based index of the image that was showing when the lightbox was closed | `11` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Shows how far users browse the gallery before leaving; `last_index` identifies the deepest image explored.

---

### `scroll_depth`

**Trigger:** Fires when the user scrolls past the 25%, 50%, 75%, and 100% thresholds of the page. Each threshold fires at most once per page load. Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `depth` | `number` | Percentage threshold crossed: `25`, `50`, `75`, or `100` | `50` |
| `language` | `string` | Locale of the current page | `"es"` |

**Why we track this:** Measures content engagement depth; low 50%/75% ratios indicate users are leaving before reaching key sections.

---

### `section_view`

**Trigger:** Fires once per `section[id]` or `section[aria-label]` element when it enters the viewport (≥30% visible). Source: `analytics.ts`.

| Parameter | Type | Description | Example |
|---|---|---|---|
| `section` | `string` | `id` or `aria-label` of the section | `"expediciones"` |
| `language` | `string` | Locale of the current page | `"en"` |

**Why we track this:** Shows which sections are actually seen (as opposed to merely scrolled past); complements `scroll_depth` with section-level granularity.

---

## Local Development Testing

1. Run `npm run dev` and open `http://localhost:4321/`.
2. **Skip the consent banner:** Open DevTools → Application → Local Storage → set `cookie_consent` = `granted`, then refresh. GA4 events will begin firing immediately.
3. **See live GA4 hits in real time:** DevTools → Network tab → filter to `collect?`. Each GA4 request shows `en=<event_name>` and its parameters in the query string.
4. **GA4 DebugView (recommended):** Install the [Google Analytics Debugger Chrome extension](https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna), enable it, and visit `https://analytics.google.com` → property `G-6ZXZ206Z8T` → DebugView. Events appear in near-real time with full parameter detail.
5. **Microsoft Clarity:** Visit `clarity.microsoft.com` after a session to review heatmaps and session recordings (only available after actual sessions; not testable on `localhost` without a tunnelling tool).

---

## PII and Consent

- GA4 and Microsoft Clarity are loaded **only** after `localStorage.cookie_consent === 'granted'`. No tracking data is collected for users who decline or have not interacted with the banner.
- **No PII is passed to `trackEvent`:** form fields (`name`, `email`, `userMessage`) are used only to build the Firestore document and the outbound email; they are never included in any GA4 event payload.
- The `error` parameter in `pricing_form_submit_error` contains the JavaScript `Error.message` string (truncated at 200 chars). This is a Firebase error code string, not user data.

---

## How to Add a New Event

1. **Decide on the hook type:**
   - **DOM-stable selector** (a button or link with a stable `id` / `class` / `data-*` attribute): add a `document.querySelectorAll(...)` block directly inside `setupTracking()` in `src/scripts/analytics.ts`.
   - **Component-internal lifecycle** (state or logic only visible inside a component's `<script>` block): dispatch `document.dispatchEvent(new CustomEvent('analytics:<event_name>', { detail: { … }, bubbles: true }))` from the component, then add a corresponding `document.addEventListener('analytics:<event_name>', …)` forwarder inside `setupTracking()` in `analytics.ts`.

2. **Follow the naming convention:** `snake_case` event name, `snake_case` parameter keys, `string | number | boolean` values only.

3. **Include `language`:** pass `language: pageLang` (already in scope inside `setupTracking()`) in every event payload.

4. **Document it here:** add an entry to this file in the same PR/release. Each entry needs the trigger description, parameters table, and a "why we track this" rationale.

5. **Verify in GA4 DebugView** before merging (see Local Development Testing above).
