# Feature Specification: Package Pricing Contact Form

> **TL;DR (≤2 sentences):** Add a per-pricing-card "Send inquiry" contact form (name + email) that submits to a new `contact_form` Firestore collection along with package metadata, by integrating the Firebase modular Web SDK behind a single shared init module. Firebase config is read from `PUBLIC_FIREBASE_*` Astro env vars, the form is implemented as a `<dialog>` (matching the `TestimonialCard.astro` pattern), and a hardened `firestore.rules` file is added that allows public `create` only with strict schema validation and denies `read/update/delete`.
> **Tier:** L · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/k3BbhiRCzdkLhXoNyU2J`
**Git remote(s) (from `git remote -v`):** `origin → git@github.com:juequinterore/aconcagua.git (fetch & push)`
**Git status at planning time (summary):** on branch `chore/add_contact_form_firestore`; working tree clean except for one untracked file (`bitbucket-api.sh`) — no in-flight modifications relevant to this plan.
**Remote vs `issue_json.git.repository`:** `not provided` (no `git.repository` field present in `issue_json`; remote check is a no-op).

**Source files consulted:**
- `package.json`, `package-lock.json` (dependency check — confirms `firebase` SDK is **not** installed)
- `astro.config.mjs` (i18n config, redirects, vite config)
- `tsconfig.json` (path alias `@/* → src/*`, `astro/tsconfigs/strict`)
- `firebase.json`, `.firebaserc` (Firebase Hosting wiring; project id = `aconcagua-co` — matches `issue_json.firebaseConfig.projectId`)
- `.gitignore` (`.env`, `.env.local`, `.env.*.local` are already ignored)
- `.github/workflows/deploy.yml` (CI builds with `npm ci && npm run build`; node 20)
- `docs/PROJECT.md` (authoritative project conventions, design tokens, i18n rules, prohibitions)
- `src/components/Pricing.astro` (renders 4 `PricingCard`s; `id="expediciones"` anchor)
- `src/components/PricingCard.astro` (current `Calendly.initPopupWidget` button pattern)
- `src/components/Nav.astro` (nav pattern, `navLinks` array, dialog/escape/focus-trap pattern)
- `src/components/Testimonials.astro`, `src/components/TestimonialCard.astro` (canonical `<dialog>` modal pattern with per-card unique `dialogId`)
- `src/components/CTA.astro` (button styles `btn btn-primary`, `cta.email`, `cta.whatsapp_url` keys)
- `src/layouts/BaseLayout.astro` (head wiring, JSON-LD, cookie/analytics scripts)
- `src/pages/index.astro` (composition for `es`)
- `src/i18n/utils.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (translation contract; ES is fallback; key parity required)
- `src/styles/global.css` (design tokens — `--bg-card`, `--border-card`, `--accent`, `--text-primary`, `--text-secondary`, `--shadow-*`, `--radius-*`)
- `src/env.d.ts` (Astro types reference — currently does NOT declare `PUBLIC_*` env vars; will be extended)

**Purpose:** Astro v5 static marketing site for Julián Kusi's guided Aconcagua expeditions. Multi-locale (es default, en, zh), SSG only, deployed to Firebase Hosting. Component-driven; no client-side framework (pure Astro components).

**Project Type:** Single Astro package — static site (SSG, no SSR).
**Primary Stack:** Astro `^5.17.3`, TypeScript `^5.9.3` (strict), `@astrojs/check` `^0.9.7`, `@astrojs/sitemap` `^3.7.0`, `sharp` `^0.33.0`. No Tailwind/CSS-in-JS. No test framework.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (runs Astro build + `@astrojs/check` type-check — primary gate)
- Test: `N/A` — no test suite exists
- Lint/Format: `N/A` — none configured

**Validation Gate (authoritative "is this working?" signal):** `npm run build` must complete with **0 errors and 0 `@astrojs/check` warnings**, plus manual verification across `/`, `/en/`, `/zh/` in dev (light + dark theme, desktop + mobile).

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs                    # i18n, redirects
├── firebase.json                       # Hosting config (will be extended with firestore.rules)
├── firestore.rules                     # NEW — Firestore security rules
├── .firebaserc                         # project: aconcagua-co
├── .env.example                        # NEW — documents required PUBLIC_FIREBASE_* vars
├── package.json                        # +firebase dep, no new scripts
├── tsconfig.json                       # untouched
└── src/
    ├── env.d.ts                        # +ImportMetaEnv typings for PUBLIC_FIREBASE_*
    ├── lib/                            # NEW — first non-component shared module dir
    │   └── firebase.ts                 # NEW — singleton Firebase + Firestore init
    ├── components/
    │   ├── Pricing.astro               # passes packageId/slug to PricingCard
    │   ├── PricingCard.astro           # +secondary "Send inquiry" button + per-card <dialog>
    │   └── PricingContactForm.astro    # NEW — form markup + client script for one card's modal
    ├── i18n/
    │   ├── es.ts / en.ts / zh.ts       # +pricing.contact.* keys (parity required)
    │   └── utils.ts                    # untouched
    ├── layouts/BaseLayout.astro        # untouched
    └── pages/                          # untouched (Pricing already wired in all three locales)
```

**Exposure Model:** File-based routing (`prefixDefaultLocale: false` → `es` at `/`, `en` at `/en/`, `zh` at `/zh/`). The Pricing section is already mounted in `src/pages/index.astro`, `src/pages/en/index.astro`, and `src/pages/zh/index.astro` as `<Pricing lang={lang} t={t} />`. Adding the contact form INSIDE `PricingCard.astro` automatically exposes it on all three locales — no page-file changes required.

**Locale / Multi-Surface Requirements:** All three locales (`es`, `en`, `zh`) must receive parity for every new translation key (`pricing.contact.*`). Spanish is the silent fallback for missing keys (per `useTranslations` in `src/i18n/utils.ts`) — this would mask bugs, so all three dictionaries MUST be updated together.

**Conventions Observed:**
- File naming: PascalCase `.astro` for components (e.g., `Pricing.astro`, `TestimonialCard.astro`); lowercase for pages, styles, and i18n dicts.
- Component contract: every translated component receives `lang: 'es'|'en'|'zh'` and `t: (key: string) => string`.
- Modal pattern: native `<dialog>` element with unique `dialogId` per card (see `src/components/TestimonialCard.astro` lines 32–115); `aria-haspopup="dialog"`, `aria-controls={dialogId}`, `aria-modal="true"`. Open via `dialog.showModal()`, close via close button + `Escape` (built-in for `<dialog>`).
- Buttons: `btn btn-primary` (filled accent) and `btn btn-outline` (outlined) — see `PricingCard.astro` lines 30–43 and `CTA.astro` line 35.
- Styling: component-scoped `<style>` blocks; consume CSS custom properties from `src/styles/global.css` (`--bg-card`, `--border-card`, `--accent`, `--text-primary`, `--text-secondary`, `--shadow-card`, `--shadow-hover`, `--radius-lg`, `--card-pad`). **No hardcoded hex colors** in new components (per `docs/PROJECT.md` Prohibitions; intentional exceptions: Hero/CTA/Footer gradients only).
- i18n keys: dot-namespaced (e.g., `pricing.card1.name`, `cta.whatsapp_url`); fallback is silent → ES is canonical.
- Client scripts: inline `<script>` (or `is:inline`) inside the `.astro` component file is the convention (see `Nav.astro` lines 106–182, `BaseLayout.astro` cookie banner). No bundler-magic ES module imports from `<script>` blocks unless using Astro's documented mechanism.
- TypeScript strict mode is enforced via `astro/tsconfigs/strict`; **`@astrojs/check` runs as part of `npm run build`** and warnings fail the gate per project policy.

**Reserved Paths / Redirects / Route Collisions to avoid:** `astro.config.mjs` declares redirects for `/globalrescue`, `/pire`, `/en/pire`. This feature touches no top-level routes — no collision risk.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` and `README` material baked into project files. No new `docs/PROJECT.md` was created — existing documentation is comprehensive and accurate (verified against actual source).

**Change Tier:** L — adds a new external runtime dependency (`firebase`), introduces a brand-new top-level shared module directory (`src/lib/`), adds a security-rules surface (`firestore.rules`) plus `firebase.json` extension, adds `.env.example` plus `src/env.d.ts` typings, modifies the only canonical pricing component on three locales (10–13 files in total).

## 1. Design Analysis

**Target Scope:** Pricing layer (`src/components/Pricing.astro`, `src/components/PricingCard.astro`), a new shared lib (`src/lib/firebase.ts`), a new pricing-scoped form component (`src/components/PricingContactForm.astro`), all three i18n dictionaries, Astro env typings, and project-root Firebase wiring (`.env.example`, `firebase.json`, `firestore.rules`, `package.json`).
**Affected Layers:** UI components, shared lib, build/runtime config (env vars, firebase config), security (Firestore rules), localization.
**Problem Statement:** The pricing section currently exposes only a Calendly popup CTA per package. The site needs an alternative low-friction contact path: a per-package contact form that captures name + email and sends them, together with the originating package's metadata, to a Firestore collection (`contact_form`). Firebase + Firestore are not yet integrated in the project (no SDK dependency, no init module, no rules).

**Solution Strategy:**
1. Add `firebase` as a runtime dependency and create a single, lazy-initialized Firebase + Firestore module (`src/lib/firebase.ts`) using the modular Web SDK (`firebase/app`, `firebase/firestore`). Read all config values from `PUBLIC_FIREBASE_*` Astro env vars (`import.meta.env.PUBLIC_FIREBASE_*`). Use `getApps().length ? getApp() : initializeApp(config)` to avoid duplicate initialization across HMR / multiple imports.
2. Add a new `PricingContactForm.astro` component that renders a per-card `<dialog>` with a name field, email field, hidden package-context fields (id, slug, name, price), submit button, and inline status region. Inline `<script>` performs validation, calls `addDoc(collection(db, 'contact_form'), {...})`, manages loading/error/success states.
3. Modify `PricingCard.astro` to render a secondary "Send inquiry"-style button (text link or `btn btn-outline` style — preserve the existing primary Calendly CTA) and to embed `<PricingContactForm />` with the package metadata. Modify `Pricing.astro` to pass `packageId` (`card1`/`card2`/`card3`/`card4`), `packageSlug` (matches the existing `plan-${i+1}` anchor — derive from card key), `packageName`, `packagePrice` props down to each card.
4. Add `pricing.contact.*` translation keys to `es.ts`, `en.ts`, `zh.ts`.
5. Add `.env.example` documenting all `PUBLIC_FIREBASE_*` variables. Extend `src/env.d.ts` with an `ImportMetaEnv` interface that types these variables (string, optional documentation comments).
6. Add `firestore.rules` enforcing: anyone can `create` a doc in `contact_form` only if the document body matches an allow-list (required `name`/`email` strings within length bounds, presence of `packageId`/`createdAt`, no extra arbitrary fields beyond a fixed schema), and `read`/`update`/`delete` are denied. Extend `firebase.json` so `firebase deploy --only firestore:rules` knows where the rules live.

**Entry Point / Exposure:** Each of the four `<PricingCard>` instances rendered inside `Pricing.astro`'s `cards.map` loop — this section is mounted on `src/pages/index.astro` (line 44), `src/pages/en/index.astro`, and `src/pages/zh/index.astro` (verified pages composition follows the same pattern). The new "Send inquiry" button appears beneath the existing Calendly CTA in each pricing card on all three locales, automatically.

**Locale / Surface Coverage:** `es` (`/`), `en` (`/en/`), `zh` (`/zh/`). Same pricing markup is mounted on all three; new i18n keys must be added to all three dictionaries.

**User Story:** As a prospective Aconcagua climber browsing the pricing section, I want to send my name and email to the guide directly from a specific package card so that I can express interest in that package without scheduling a Calendly call, and so the guide receives my inquiry alongside the package context I was looking at.

## 2. Architecture & Data

### Architecture

**Composition (data flow, top-down):**

```
src/pages/{,en/,zh/}index.astro
  └─ <Pricing lang={lang} t={t} />                        (existing)
       └─ cards.map((card, i) => …)                        (existing)
            └─ <PricingCard
                 name, price, features, cta, featured, badge, calendlyUrl,
                 lang, t,
                 packageId,        // NEW — e.g. "card3"
                 packageSlug,      // NEW — anchor-aligned slug, e.g. "plan-3"
               />
                 ├─ existing Calendly button (unchanged)
                 └─ <PricingContactForm
                      lang, t,
                      packageId, packageSlug, packageName, packagePrice,
                    />
                      ├─ "Send inquiry" trigger button
                      └─ <dialog id={uniqueDialogId}>
                           ├─ <form>
                           │    ├─ name input (required, minlength=2, maxlength=120)
                           │    ├─ email input (type=email, required, maxlength=254)
                           │    ├─ hidden package fields (rendered as <input type="hidden">)
                           │    └─ submit button
                           └─ status region (loading / success / error)

Client script (per form, scoped via dialogId / form id):
  - validates inputs
  - dynamically imports src/lib/firebase.ts on first submit
  - calls addDoc(collection(db, 'contact_form'), payload)
  - updates UI status
```

**Patterns reused (with file citations):**
- Native `<dialog>` modal with unique `dialogId`: `src/components/TestimonialCard.astro` lines 32–34, 76–115. We mirror this exactly: `Math.random()`-based `uid`, `aria-haspopup="dialog"`, `aria-controls={dialogId}`, `<dialog id={dialogId} aria-modal="true">`, close button with chevron-X SVG.
- `Calendly.initPopupWidget` button styling: `src/components/PricingCard.astro` lines 29–43 — shows the `btn btn-primary` / `btn btn-outline` pattern we keep alongside.
- Component-scoped `<style>` consuming design tokens: `src/components/TestimonialCard.astro` lines 118+, `src/components/PricingCard.astro` lines 46+.
- Inline `<script>` for client behavior: `src/components/Nav.astro` lines 106–182 (focus trap, escape, ARIA toggling) — applicable patterns we adapt for the form.
- i18n contract: `src/i18n/utils.ts` lines 9–18; same `t(key)` interface with ES fallback.

**Firebase initialization design (`src/lib/firebase.ts`):**
- Uses `firebase/app` (`initializeApp`, `getApps`, `getApp`) and `firebase/firestore` (`getFirestore`).
- Reads config from `import.meta.env.PUBLIC_FIREBASE_API_KEY`, `…AUTH_DOMAIN`, `…PROJECT_ID`, `…STORAGE_BUCKET`, `…MESSAGING_SENDER_ID`, `…APP_ID`, `…MEASUREMENT_ID` (last is optional).
- Throws a clear, single error at module-evaluation time if any of the required vars are missing.
- Exports two singletons: `app` (FirebaseApp) and `db` (Firestore). No analytics/auth imports — Firestore only — to keep bundle size minimal.
- Module is dynamically imported by the form's submit handler (`await import('@/lib/firebase')` or relative path) so that no Firebase code is shipped on initial page load — only when a user actually submits.

### Data Changes

- [x] Translation / i18n keys added — in `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (parity REQUIRED across all three):
  - `pricing.contact.cta` — secondary button label on the pricing card (e.g., ES: "O envianos un mensaje", EN: "Or send us a message", ZH: "或给我们发送消息")
  - `pricing.contact.modal_title` — modal heading (e.g., "Consulta sobre {paquete}" / "Inquiry about {package}" / "关于{套餐}的咨询") — implementer interpolates `packageName` client-side or via component prop
  - `pricing.contact.intro` — short helper paragraph
  - `pricing.contact.field_name` — name field label
  - `pricing.contact.field_name_placeholder`
  - `pricing.contact.field_email` — email field label
  - `pricing.contact.field_email_placeholder`
  - `pricing.contact.submit` — submit button label
  - `pricing.contact.sending` — loading state label
  - `pricing.contact.success` — success message
  - `pricing.contact.error` — generic error message
  - `pricing.contact.error_required_name` — validation message (name required)
  - `pricing.contact.error_required_email` — validation message (email required)
  - `pricing.contact.error_invalid_email` — validation message (email format)
  - `pricing.contact.close` — close button aria-label
  - `pricing.contact.privacy_note` — short note ("We only use this to reply to your inquiry.") with link to `/privacidad` (es), `/en/privacy` (en), `/zh/privacy` (zh) — link target chosen at render time from `lang` prop (existing pages, do not 404)
- [x] Schema / migration changes — Firestore document schema (enforced by `firestore.rules`):
  ```
  contact_form/{auto-id} = {
    name: string (2..120 chars),
    email: string (5..254 chars, basic email-shape regex enforced in rules),
    packageId: string ("card1" | "card2" | "card3" | "card4"),
    packageSlug: string (≤64 chars),
    packageName: string (≤200 chars),
    packagePrice: string (≤64 chars),
    lang: string ("es" | "en" | "zh"),
    pageUrl: string (≤2048 chars),     // window.location.href at submit time
    userAgent: string (≤512 chars),    // navigator.userAgent (truncated)
    referrer: string (≤2048 chars),    // document.referrer (may be empty)
    createdAt: timestamp (must equal request.time, enforced by rules)
  }
  ```
  No client-mutable timestamp; rules will require `request.resource.data.createdAt == request.time` and reject any extra keys.
- [x] Config changes (list files):
  - `firebase.json` — add `"firestore": { "rules": "firestore.rules" }` block alongside the existing `hosting` block.
  - `.env.example` (NEW at workspace root) — documents `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_STORAGE_BUCKET`, `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `PUBLIC_FIREBASE_APP_ID`, `PUBLIC_FIREBASE_MEASUREMENT_ID`. Values from `issue_json.firebaseConfig` are used as the example/default baseline.
  - `src/env.d.ts` — extend with `interface ImportMetaEnv` declaring the seven `PUBLIC_FIREBASE_*` vars (six required, `MEASUREMENT_ID` optional).
- [x] Static assets added: None.
- [x] New dependencies (with justification):
  - `firebase` (latest stable in the `^11` line, e.g. `^11.0.0` — implementer picks the current latest minor at install time and pins via `package-lock.json`). **Justification:** required by `issue_json` to implement Firestore writes; not currently installed; no equivalent already in the dependency tree. Modular SDK keeps bundle small (only `firebase/app` + `firebase/firestore` are imported).

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `package.json` (Modify — `dependencies` block — add `"firebase": "^11.x"` (latest at install time); no script changes)
- `package-lock.json` (Modify — auto-regenerated by `npm install firebase`)
- `.env.example` (Create — documents required `PUBLIC_FIREBASE_*` env vars with the values from `issue_json.firebaseConfig` as defaults)
- `src/env.d.ts` (Modify — top of file — add `interface ImportMetaEnv` and `interface ImportMeta { readonly env: ImportMetaEnv }` typings for the seven `PUBLIC_FIREBASE_*` keys)
- `src/lib/firebase.ts` (Create — exports `app` and `db` singletons via `getApps().length ? getApp() : initializeApp(config)`; uses `getFirestore(app)`; reads config from `import.meta.env.PUBLIC_FIREBASE_*`; throws if any required var is missing)
- `src/components/PricingContactForm.astro` (Create — per-card `<dialog>` with name/email form, hidden package-context fields, status region; inline client `<script>` handles validation + dynamic import of `@/lib/firebase` + `addDoc`)
- `src/components/PricingCard.astro` (Modify — `interface Props` + render block — add `packageId`, `packageSlug`, `packageName`, `packagePrice`, `lang`, `t` props; render `<PricingContactForm …/>` after the existing Calendly button)
- `src/components/Pricing.astro` (Modify — `cards` array literal + `cards.map` JSX inside `<section id="expediciones">` — augment each card object with `id` (e.g., `'card1'`) and pass `packageId`, `packageSlug={`plan-${i+1}`}`, `packageName={card.name}`, `packagePrice={card.price}`, `lang={lang}`, `t={t}` to `<PricingCard>`)
- `src/i18n/es.ts` (Modify — add `pricing.contact.*` block in the Pricing section, after `pricing.card4.cta`)
- `src/i18n/en.ts` (Modify — same `pricing.contact.*` block, English copy)
- `src/i18n/zh.ts` (Modify — same `pricing.contact.*` block, Chinese copy)
- `firestore.rules` (Create at workspace root — public `create` allowed only on `/contact_form/{doc}` with strict schema validation; deny all `read`, `update`, `delete`)
- `firebase.json` (Modify — top-level JSON object — add a `"firestore": { "rules": "firestore.rules" }` block alongside the existing `"hosting"` block)

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Install dependency: `npm install firebase` (only after the implementer is in implementation phase — planner does NOT run this).
- [ ] Define the Firestore document schema (the bullet list under §2 "Data Changes"). This schema is the source of truth for both `firestore.rules` and the form payload constructor in `PricingContactForm.astro`'s submit handler.
- [ ] Author `firestore.rules` enforcing the schema. Reference rule sketch (implementer adapts to current Firebase rules version idioms):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      function isValidContactForm(d) {
        return d.keys().hasOnly(
                 ['name','email','packageId','packageSlug','packageName',
                  'packagePrice','lang','pageUrl','userAgent','referrer','createdAt'])
            && d.keys().hasAll(
                 ['name','email','packageId','packageSlug','packageName',
                  'packagePrice','lang','createdAt'])
            && d.name is string && d.name.size() >= 2 && d.name.size() <= 120
            && d.email is string && d.email.size() >= 5 && d.email.size() <= 254
            && d.email.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')
            && d.packageId in ['card1','card2','card3','card4']
            && d.packageSlug is string && d.packageSlug.size() <= 64
            && d.packageName is string && d.packageName.size() <= 200
            && d.packagePrice is string && d.packagePrice.size() <= 64
            && d.lang in ['es','en','zh']
            && (!('pageUrl' in d.keys()) || (d.pageUrl is string && d.pageUrl.size() <= 2048))
            && (!('userAgent' in d.keys()) || (d.userAgent is string && d.userAgent.size() <= 512))
            && (!('referrer' in d.keys()) || (d.referrer is string && d.referrer.size() <= 2048))
            && d.createdAt == request.time;
      }

      match /contact_form/{doc} {
        allow create: if isValidContactForm(request.resource.data);
        allow read, update, delete: if false;
      }

      match /{document=**} {
        allow read, write: if false;
      }
    }
  }
  ```
- [ ] Update `firebase.json` to register the rules:
  ```json
  {
    "hosting": { "public": "dist", "ignore": ["firebase.json","**/.*","**/node_modules/**"] },
    "firestore": { "rules": "firestore.rules" }
  }
  ```
- [ ] Add `.env.example` at workspace root with all seven `PUBLIC_FIREBASE_*` keys and the values from `issue_json.firebaseConfig` as concrete examples (not placeholders — these are public web config and the deployer can override per-environment via `.env.local`).
- [ ] Extend `src/env.d.ts`:
  ```ts
  /// <reference path="../.astro/types.d.ts" />

  interface ImportMetaEnv {
    readonly PUBLIC_FIREBASE_API_KEY: string;
    readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    readonly PUBLIC_FIREBASE_PROJECT_ID: string;
    readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly PUBLIC_FIREBASE_APP_ID: string;
    readonly PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
  }
  interface ImportMeta { readonly env: ImportMetaEnv; }
  ```

**Phase 2: Implementation**
- [ ] Create `src/lib/firebase.ts`:
  - Imports: `import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';` and `import { getFirestore, type Firestore } from 'firebase/firestore';`
  - Reads `import.meta.env.PUBLIC_FIREBASE_*` into a `firebaseConfig` const. Validates each required var is a non-empty string; throws `new Error('Missing PUBLIC_FIREBASE_* environment variable: <name>')` on the first missing var.
  - `const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);`
  - `const db: Firestore = getFirestore(app);`
  - `export { app, db };`
  - No top-level side effects beyond `initializeApp` (which itself is the deduped singleton).
- [ ] Create `src/components/PricingContactForm.astro`:
  - Props interface: `{ lang: 'es'|'en'|'zh'; t: (k: string) => string; packageId: 'card1'|'card2'|'card3'|'card4'; packageSlug: string; packageName: string; packagePrice: string }`.
  - Generate a unique `uid` (same `Math.random()` pattern as `TestimonialCard.astro` line 32) so multiple cards on the same page each get their own `dialogId`/form id.
  - Render: trigger button (`type="button"`, `aria-haspopup="dialog"`, `aria-controls={dialogId}`, label = `t('pricing.contact.cta')`); native `<dialog id={dialogId} aria-modal="true" aria-label={…}>` containing close button (X SVG, `t('pricing.contact.close')`), heading interpolating `packageName`, intro text, `<form id={formId} novalidate>`, name+email inputs (with `id`/`for` pairs, `autocomplete="name"` / `autocomplete="email"`, `required`), submit button, `<p id={statusId} role="status" aria-live="polite">` for status messages, and a privacy note link to the right per-locale privacy page (`/privacidad`, `/en/privacy`, `/zh/privacy` — chosen via `lang`).
  - Hidden inputs (`type="hidden"`) for `packageId`, `packageSlug`, `packageName`, `packagePrice`, `lang` so the submit handler reads them off the form instead of relying on closures.
  - `<script>` block (Astro inline script — TypeScript permitted): on submit `event.preventDefault()`, run client-side validation (name length, email regex matching the same pattern the rules use), set status to "sending" and disable the submit button, dynamic-import `@/lib/firebase` (or relative `../lib/firebase`), import `addDoc`, `collection`, `serverTimestamp` from `firebase/firestore`, build the payload (include `pageUrl: window.location.href`, `userAgent: navigator.userAgent.slice(0,512)`, `referrer: document.referrer.slice(0,2048)`, `createdAt: serverTimestamp()`), call `await addDoc(collection(db, 'contact_form'), payload)`, on success show `t('pricing.contact.success')`, reset the form, and keep the dialog open until the user closes it; on failure show `t('pricing.contact.error')` and re-enable the submit button. Errors are also `console.error`'d for debuggability but no PII is logged. Scope all DOM lookups to the unique `formId`/`dialogId` so multiple forms on the same page do not collide.
  - Component-scoped `<style>` block: consume `--bg-card`, `--border-card`, `--accent`, `--text-primary`, `--text-secondary`, `--shadow-card`, `--radius-lg`, `--card-pad`, `::backdrop` styling matches `TestimonialCard.astro` modal backdrop (lines 271+). No hardcoded hex colors. Inputs use `var(--border-card)` borders and `var(--bg-base)` backgrounds; focus rings use `var(--accent)`.
- [ ] Modify `src/components/PricingCard.astro`:
  - Extend the `Props` interface with `packageId`, `packageSlug`, `packageName`, `packagePrice`, `lang`, `t`.
  - Import `PricingContactForm` at the top of the frontmatter.
  - After the existing Calendly `<button>` (the conditional block at lines 29–43), render `<PricingContactForm lang={lang} t={t} packageId={packageId} packageSlug={packageSlug} packageName={name} packagePrice={price} />` — the form component itself owns its trigger button, so the layout shows: Calendly primary CTA → small secondary "Or send us a message" link/button. Implementer chooses between `btn btn-outline` (subdued button) and a plain underlined link, matching the project's existing button family — no new style tokens.
- [ ] Modify `src/components/Pricing.astro`:
  - Annotate each `cards` array entry with `id: 'card1' | 'card2' | 'card3' | 'card4'` (matches the existing i18n key pattern, e.g., `pricing.card1.name` → `id: 'card1'`).
  - In the `cards.map((card, i) => …)` JSX, pass to `<PricingCard …>`: `packageId={card.id}`, `packageSlug={`plan-${i + 1}`}` (matches the existing wrapping `id={`plan-${i+1}`}` anchor at line 81), `lang={lang}`, `t={t}`. (`packageName` and `packagePrice` flow through as `name` / `price` props the card already receives.)

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] No page-file edits are needed: `<Pricing lang={lang} t={t} />` is already mounted on `src/pages/index.astro` (line 44), `src/pages/en/index.astro`, and `src/pages/zh/index.astro` — verified during discovery. Adding `PricingContactForm` inside `PricingCard` exposes the form on all three locales automatically.
- [ ] No `Nav.astro` edit is needed — the form is reached only from within pricing cards, not from primary navigation. (If the issue's "accessible from a package pricing item" later expands to a top-level menu link, that would be a separate change.)
- [ ] All three i18n dictionaries (`es.ts`, `en.ts`, `zh.ts`) updated together — required because `useTranslations` falls back silently to ES (`src/i18n/utils.ts` line 13), and `docs/PROJECT.md` flags missing-key fallback as a bug, not a feature.
- [ ] `firebase.json` extended so `firebase deploy --only firestore:rules` knows where the rules file is. Implementer documents in the PR description (or a deployment runbook) the exact deploy command:
  ```
  firebase deploy --only firestore:rules --project aconcagua-co
  ```
  Rules deployment is OUT OF SCOPE for the build/CI gate (it requires Firebase auth) and is a manual step performed by the project owner.

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` (the validation gate). Confirm: zero errors and zero `@astrojs/check` warnings.
- [ ] Run `npm run dev` and complete the full Manual Verification Script in §5 across all three locales, both themes, desktop + mobile widths.
- [ ] Confirm bundle output in `dist/` does not include Firebase code on page load (search a built JS chunk or use `ls -la dist/_astro/` and inspect the chunk that owns `firebase` — it should be a separate code-split chunk loaded on submit, not on page-init). If Astro emits Firebase into the main chunk, swap the static `import` in the form's `<script>` for `await import(...)` to enforce code-splitting.
- [ ] Manually confirm in the Firebase Console that test submissions appear in the `contact_form` collection with the expected schema and that an attempt to submit a payload with extra fields or missing required fields is rejected by the rules (use the Firestore Rules Playground in the Console).

## 4. Automated Verification

### Verification Commands
```bash
# 1. Install the new dependency exactly once (skip if already installed)
npm install firebase

# 2. Provide local env vars (one-time per developer machine; .env.local is gitignored)
cp .env.example .env.local

# 3. Authoritative gate — must exit 0 with no errors and no @astrojs/check warnings
npm run build

# 4. Local preview of the production bundle (used for manual verification step §5)
npm run preview
```

### Quality Gates
- [ ] `npm run build` exits 0 with **zero errors and zero `@astrojs/check` warnings** — this is the only automated gate the project has.
- [ ] No new TypeScript `any` introduced (project uses `astro/tsconfigs/strict`).
- [ ] No hardcoded hex colors anywhere in `PricingContactForm.astro`, `PricingCard.astro`, or `Pricing.astro` — every color, shadow, and radius consumed via the `--*` tokens declared in `src/styles/global.css` (per `docs/PROJECT.md` Prohibitions).
- [ ] No new top-level routes; no shadowing of `astro.config.mjs` redirects (`/globalrescue`, `/pire`, `/en/pire`).
- [ ] All new translation keys present in **all three** of `es.ts`, `en.ts`, `zh.ts` (parity check — at least visual via a side-by-side review).
- [ ] No new dependency beyond `firebase`, which is justified in §2.
- [ ] Firebase initialization happens via `getApps().length ? getApp() : initializeApp(...)` — duplicate-init guarded (verifiable by reading `src/lib/firebase.ts`).
- [ ] Firestore rules in `firestore.rules` deny `read`/`update`/`delete` on `contact_form` and require schema validation on `create`.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` has been run (so `firebase` is in `node_modules`).
- [ ] `.env.local` exists at the workspace root with all seven `PUBLIC_FIREBASE_*` values populated (copy from `.env.example` for local dev).
- [ ] `firebase deploy --only firestore:rules --project aconcagua-co` has been run at least once so the production rules match this spec (one-time, by the project owner).
- [ ] `npm run dev` is running at `http://localhost:4321/`.

**Scenario A — happy path, repeat per locale (`/`, `/en/`, `/zh/`):**
1. [ ] Navigate to `http://localhost:4321/` (then `/en/`, then `/zh/`). Scroll to the Expeditions / Pricing section (`#expediciones`).
2. [ ] On each of the four pricing cards, confirm the existing primary CTA (Calendly button) still shows and still opens the Calendly popup (no regression).
3. [ ] On each card, click the new secondary "Send inquiry" trigger — the per-card `<dialog>` opens, shows the package name in the heading, and focus moves into the form.
4. [ ] Press `Escape` — the dialog closes (native `<dialog>` behavior). Re-open it and click the close button (X) — it closes.
5. [ ] Submit empty fields → inline validation messages appear (name required, email required) and no Firestore write happens.
6. [ ] Submit `name=Test User`, `email=not-an-email` → email-format validation message appears, no Firestore write.
7. [ ] Submit `name=Test User`, `email=test@example.com` → status switches to `pricing.contact.sending`, submit button is disabled, then status switches to `pricing.contact.success` and the form is reset (button re-enabled). Open the Firebase Console → Firestore → `contact_form` collection: a new document is present with `name`, `email`, `packageId` (e.g., `card3`), `packageSlug` (e.g., `plan-3`), `packageName`, `packagePrice`, `lang` (`es`/`en`/`zh`), `pageUrl`, `userAgent`, `referrer`, and a server-set `createdAt` timestamp.

**Scenario B — theme + viewport parity:**
8. [ ] Toggle to light theme via the existing `ThemeToggle`. Reopen the contact form on any card → backgrounds, borders, text colors, focus rings, and `::backdrop` all switch correctly via design tokens (no hardcoded colors visible).
9. [ ] Resize the browser to ≤480px (mobile). Open the form → modal is responsive (no horizontal scroll), inputs are full-width, submit button is full-width, close button still reachable, focus trap behaves.

**Scenario C — security rules sanity (manual via Firebase Console Rules Playground):**
10. [ ] In the Rules Playground, simulate `create` on `/contact_form/abc` with a valid payload → ALLOW.
11. [ ] Simulate `create` with `email = "not-an-email"` → DENY.
12. [ ] Simulate `create` with an extra field, e.g., `evilField: "x"` → DENY.
13. [ ] Simulate `read` on `/contact_form/abc` (any auth state) → DENY.
14. [ ] Simulate `update` and `delete` on `/contact_form/abc` (any auth state) → DENY.

**Success Criteria:**
- ✅ All three locales show the new "Send inquiry" trigger on every pricing card.
- ✅ Submitting valid data on any card creates a Firestore doc with the exact schema described in §2 (verified via Firebase Console).
- ✅ Empty / invalid submissions never reach Firestore.
- ✅ Firestore rules deny `read`, `update`, `delete`, and any malformed `create`.
- ✅ Existing Calendly CTAs remain functional on all four cards across all three locales.
- ✅ Validation gate (`npm run build`) passes with zero errors and zero `@astrojs/check` warnings.

## 6. Coverage Requirements

- [ ] **No automated test suite exists in this project** (per `docs/PROJECT.md` and `package.json` — there is no `test` script and no test framework is installed). Per the project's documented validation strategy, the Manual Verification Script in §5 IS the coverage. This is consistent with prior planner outputs in `specs/feat-1100-…` through `specs/feat-1103-…` and with the `docs/PROJECT.md` "No test suite exists" rule.
- [ ] Edge cases to consider (must be exercised in §5):
  - Multiple pricing cards on the same page each have their own `<dialog>` instance — clicking trigger N must open dialog N (not dialog 1). Verifiable because each form uses a unique `uid`/`dialogId` derived from `Math.random()` (same pattern as `TestimonialCard.astro`).
  - Submitting once, closing the dialog, and submitting again on the SAME card must work (form state must reset, button must re-enable on success).
  - Submitting on card A and immediately on card B must not cross-wire: each form's submit handler reads its OWN hidden inputs.
  - Network failure / Firestore unreachable → `error` state shown, button re-enabled, no UI lockup.
  - Slow network → `sending` state visible long enough to be perceivable; submit button disabled to prevent duplicate writes.
  - Bundle code-splitting verified: navigating to `/` and only viewing the page (no submit) does NOT load the firebase chunk (open DevTools Network panel, filter by `firebase`, expect 0 requests until the first submit).
  - Privacy note link in the modal must point to the correct locale's privacy page (`/privacidad` for `es`, `/en/privacy` for `en`, `/zh/privacy` for `zh`) — these pages already exist in `src/pages/` (verified in discovery).

## 7. Acceptance Criteria (Definition of Done)

- [ ] All four implementation phases (§3) completed.
- [ ] `npm run build` passes with **zero errors and zero `@astrojs/check` warnings**.
- [ ] Manual verification script (§5) completed across all three locales, both themes, desktop + mobile widths.
- [ ] All four pricing cards on `/`, `/en/`, `/zh/` show the new "Send inquiry" secondary CTA in addition to the existing Calendly primary CTA.
- [ ] Submitting the form writes a document to the `contact_form` Firestore collection containing: `name`, `email`, `packageId`, `packageSlug`, `packageName`, `packagePrice`, `lang`, `pageUrl`, `userAgent`, `referrer`, server-stamped `createdAt`.
- [ ] `firestore.rules` is committed at the workspace root, `firebase.json` references it, and the rules have been deployed to project `aconcagua-co` via `firebase deploy --only firestore:rules`.
- [ ] `firebase` is the only new dependency in `package.json`; no other packages added.
- [ ] All `pricing.contact.*` keys exist in `es.ts` AND `en.ts` AND `zh.ts` (no silent fallback bugs).
- [ ] `src/lib/firebase.ts` initializes Firebase exactly once (`getApps().length` guard) and exports `app` + `db` singletons.
- [ ] `src/env.d.ts` declares `ImportMetaEnv` for the `PUBLIC_FIREBASE_*` keys; `.env.example` is committed (no `.env.local` is committed — `.gitignore` already excludes it).
- [ ] No regression: existing Calendly CTAs on all four cards still function; existing nav/anchors still resolve; existing redirects in `astro.config.mjs` still apply.
- [ ] No hardcoded hex colors introduced in any new component (project Prohibition).

### Traceability Table

| `issue_json` requirement | Where addressed |
| --- | --- |
| Form accessible from a "package pricing item" gathering name + email | §3 Phase 2 — `PricingContactForm.astro` rendered inside each `PricingCard.astro` |
| Send/store info about which package the user is interested in | §2 Data Changes — `packageId`, `packageSlug`, `packageName`, `packagePrice` fields in document |
| Integrate Firebase + Firestore (not currently integrated) using the supplied `firebaseConfig` | §3 Phase 1 (`.env.example` carries the supplied values) + Phase 2 (`src/lib/firebase.ts` initializes from those env vars) |
| Persist submissions to Firestore collection `contact_form` | §3 Phase 2 — `addDoc(collection(db, 'contact_form'), payload)` |
| Prefer storing Firebase config in environment variables | §3 Phase 1 — `PUBLIC_FIREBASE_*` env vars in `.env.example` + `src/env.d.ts` typings |
| Validate / sanitize inputs (required name/email, email format), handle loading/error/success | §3 Phase 2 form-script behavior + §5 Scenario A steps 5–7 |
| Include package metadata in the stored document | §2 Data Changes — schema includes `packageId`/`packageSlug`/`packageName`/`packagePrice` |
| Add timestamps and any useful context fields | §2 Data Changes — `createdAt: serverTimestamp()` (rules-enforced `request.time`), plus `lang`/`pageUrl`/`userAgent`/`referrer` |
| Provide guidance / implementation for secure Firestore usage (rules, least privilege) | §3 Phase 1 — `firestore.rules` with `create`-only public access, schema validation, deny-all for `read`/`update`/`delete`; §5 Scenario C verifies |
| Avoid duplicate initialization; modular code; follow project conventions | §3 Phase 2 — `src/lib/firebase.ts` `getApps().length` guard; component conventions inherited from `TestimonialCard.astro` `<dialog>` pattern; design tokens consumed; tri-locale i18n parity preserved |
