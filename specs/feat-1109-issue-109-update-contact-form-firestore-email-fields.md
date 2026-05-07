# Feature Specification: Update Contact Form Firestore Email Fields

> **TL;DR (≤2 sentences):** Extend the per-package pricing contact form's Firestore write so the resulting `contact_form/{doc}` document carries two new top-level fields — `to: 'julian@aconcagua.co'` and `message: { subject, html }` — populated from existing form data, while leaving every existing field untouched. This is a coordinated change across the client write (`PricingContactForm.astro`) and the security rules (`firestore.rules`), since the current rules use `hasOnly` and would reject any unknown keys.
> **Tier:** M · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/gXI8PunGS3UvJqbuVE5p`
**Git remote(s) (from `git remote -v`):** `origin → git@github.com:juequinterore/aconcagua.git (fetch & push)`
**Git status at planning time (summary):** on branch `chore/enhance_contact_form_email_data`; working tree clean except for one untracked file (`bitbucket-api.sh`) — unrelated to this plan.
**Remote vs `issue_json.git.repository`:** `not provided` — `issue_json` does not include a `git.repository` field; remote check is a no-op.

**Source files consulted:**
- `package.json` (Astro 5.17.3 + firebase 12.13.0 + @astrojs/check 0.9.7; scripts: `dev`, `build`, `preview`)
- `astro.config.mjs` (i18n, redirects, sitemap)
- `firebase.json`, `.firebaserc` (Firestore rules registered; project = `aconcagua-co` per `.firebaserc`)
- `firestore.rules` (`isValidContactForm` validator — uses `hasOnly` whitelist of 11 keys)
- `docs/PROJECT.md` (project conventions, validation gate, locale rules, prohibitions)
- `src/components/PricingContactForm.astro` (the only writer to `contact_form` collection — current `addDoc` payload at lines 409–421)
- `src/lib/firebase.ts` (Firebase init singleton — already in place)
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (existing `pricing.contact.*` translation surface — verified status messages live here, not in the rules contract)
- `specs/feat-1106-issue-106-package-pricing-contact-form.md` (precedent: same feature when first introduced — confirms `hasOnly` + `createdAt == request.time` invariant)

**Purpose:** Astro v5 static marketing site for Julián Kusi's guided Aconcagua expeditions. Multi-locale (`es` default, `en`, `zh`), SSG only, deployed to Firebase Hosting. The pricing section exposes a per-package contact dialog that writes inquiries to a `contact_form` Firestore collection.
**Project Type:** Single Astro package — static site (SSG, no SSR).
**Primary Stack:** Astro `^5.17.3`, TypeScript `^5.9.3` (strict via `astro/tsconfigs/strict`), `@astrojs/check` `^0.9.7`, `firebase` `^12.13.0`, `sharp` `^0.33.0`. No CSS framework, no test runner.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (runs Astro build + `@astrojs/check` type-check — primary gate)
- Test: `N/A` — no test suite exists (per `docs/PROJECT.md` — manual verification + build is the gate)
- Lint/Format: `N/A` — none configured

**Validation Gate (authoritative "is this working?" signal):** `npm run build` must complete with **0 errors and 0 `@astrojs/check` warnings**, plus manual verification of a real submission (dev server) confirming the document lands in Firestore with both the existing fields AND the new `to` / `message.subject` / `message.html` fields. The Firestore security rules will reject the write if the rules are not updated in lockstep — that rejection is itself a verification signal during dev.

**Directory Structure (relevant portions):**
```
aconcagua/
├── firebase.json                             # Firestore rules registered here
├── firestore.rules                           # MODIFY — extend isValidContactForm
└── src/
    ├── lib/firebase.ts                       # untouched — singleton init already in place
    └── components/
        └── PricingContactForm.astro          # MODIFY — extend the addDoc payload
```

**Exposure Model:** File-based routing (`prefixDefaultLocale: false`). The pricing section composes `PricingCard.astro`, which embeds `PricingContactForm.astro` once per card on every locale (`/`, `/en/`, `/zh/`). There is exactly one writer to the `contact_form` collection — the form's submit handler in `PricingContactForm.astro`. Modifying that one component automatically covers all three locales; no per-locale changes are required for this feature because the new fields' values are derived from existing per-card data already in the form.

**Locale / Multi-Surface Requirements:** **None for this feature.** The new fields are write-only Firestore data, not user-visible UI strings. The `subject` template (`"Contact from Aconcagua.co Pricing for package {packageName}"`) is fixed in English per the issue's literal requirement; the HTML body labels are likewise fixed in English (recipient is a single Argentinian-but-multilingual operator, and the subject already establishes English). User-supplied content (`name`, `email`) and existing per-locale `packageName` values flow through verbatim. No `pricing.contact.*` i18n keys are added.

**Conventions Observed:**
- Firestore writes: `addDoc(collection(db, 'contact_form'), {...})` from a dynamically-imported handler in the component's inline `<script>` — already established in `PricingContactForm.astro` lines 406–421. Continue to use the modular SDK (`firebase/firestore`).
- Firestore rules: a single `isValidContactForm(d)` function that lists all allowed keys via `hasOnly([...])`, lists required keys via `hasAll([...])`, and per-field validates types and length bounds. New keys MUST be added to `hasOnly` or the write will be rejected. (Verified at `firestore.rules` lines 5–24.)
- Component file naming: PascalCase `.astro`. Inline `<script>` block at the bottom of the component holds the client-side handler.
- TypeScript strict mode is enforced via `astro/tsconfigs/strict`; `@astrojs/check` runs as part of `npm run build` and warnings fail the gate.
- Prohibitions (per `docs/PROJECT.md`): no new dependencies without justification, no partial features, no TODO placeholders, no test framework adoption.

**Reserved Paths / Redirects / Route Collisions to avoid:** None — this feature touches no routes.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` and the precedent spec `specs/feat-1106-issue-106-package-pricing-contact-form.md`. Did NOT create a new `docs/PROJECT.md` (one already exists and is comprehensive).

**Change Tier:** M — 2 files modified, no new dependencies, no new routes, no new public API; but the change is a coordinated client-write + security-rules contract update (a config change), which lifts it above Tier S.

## 1. Design Analysis

**Target Scope:** Pricing layer's contact submission path. Specifically: the single `addDoc` call inside the inline `<script>` of `src/components/PricingContactForm.astro`, and the matching `isValidContactForm` validator in `firestore.rules`.
**Affected Layers:** Client write payload (UI/data), Firestore security rules (security/contract).
**Problem Statement:** The `contact_form/{doc}` document currently stores only inquiry metadata (`name`, `email`, `package*`, `lang`, `pageUrl`, `userAgent`, `referrer`, `createdAt`). Operationally, the team wants the same document to be ingestible by an email-delivery pipeline (the canonical Firebase "Trigger Email" extension expects exactly the `to` + `message.{subject,html}` shape declared in the issue). The fields must be **added** alongside, not replacing, the existing fields, so that current consumers of the document continue to work unchanged.
**Solution Strategy:**
1. **Client (`PricingContactForm.astro`):** In the existing submit handler — immediately after collecting form values and immediately before `addDoc(...)` — build a sanitized HTML email body that summarizes the user-provided info (`name`, `email`) plus the package context and request metadata that are also being persisted (`packageId`, `packageSlug`, `packageName`, `packagePrice`, `lang`, `pageUrl`, `userAgent`, `referrer`). Then extend the existing `addDoc` payload with three new top-level fields: `to: 'julian@aconcagua.co'`, and `message: { subject, html }`. Do not remove or alter any existing field. Keep `createdAt: serverTimestamp()` exactly as today (the rules require `d.createdAt == request.time`).
2. **Rules (`firestore.rules`):** Extend `isValidContactForm` to (a) add `to` and `message` to the `hasOnly` whitelist and to `hasAll`; (b) validate `to` is the literal string `'julian@aconcagua.co'`; (c) validate `message` is a map whose keys are exactly `['subject','html']`, with `subject` and `html` being bounded strings.

**Entry Point / Exposure:** This is a write-side data change; no new entry point. The user reaches it via the existing per-card "Or send us a message" trigger that opens the `<dialog>` and submits the form — a flow already wired into `src/components/PricingCard.astro` and rendered on `/`, `/en/`, `/zh/`. No new exposure surface to register.
**Locale / Surface Coverage:** N/A — write-only data, English-only literals per the issue's explicit text.
**User Story:** As the recipient (Julián), when an inquiry is submitted from any package card on any locale, I want the resulting Firestore document to contain — alongside its existing fields — a self-contained `to`/`subject`/`html` triple, so that an email-delivery pipeline can fan out a human-readable email without any further transformation of the document.

## 2. Architecture & Data

### Architecture
The pricing contact form is a single component (`src/components/PricingContactForm.astro`) that renders a `<dialog>` with a `<form>` and an inline `<script>` that hooks the form's `submit` event. On submit, the handler validates client-side, dynamically imports `src/lib/firebase.ts` and `firebase/firestore`, and calls `addDoc(collection(db, 'contact_form'), {...})`. The existing payload (lines 409–421) is augmented — not replaced — with the new fields. The handler must build the HTML body **after** validation and **before** `addDoc`, using the same locally-scoped variables already in scope (`nameVal`, `emailVal`, `packageId`, `packageSlug`, `packageName`, `packagePrice`, `lang`, plus `window.location.href`, `navigator.userAgent`, `document.referrer`).

The HTML body must be **safe**: every value that could contain user-controlled text (`name`, `email`, `packageName`, `pageUrl`, `userAgent`, `referrer`) MUST be HTML-escaped before interpolation. Use a small local `escapeHtml(v: string)` helper that maps `&`, `<`, `>`, `"`, `'` to their entity forms. The constant package-context strings (`packageId`, `packageSlug`, `packagePrice`, `lang`) are also escaped for uniformity. Use `currentTime = new Date().toISOString()` for a "submitted at" line in the body — note for the implementer: this is the client clock, distinct from the server-side `createdAt` field stored on the document; label it accordingly (e.g., "Submitted at (client time)").

The rules side mirrors the data shape: `hasOnly` keeps the document closed (no extra unknown fields), `hasAll` makes the new fields required so we never silently regress, and explicit literal validation on `to` (must equal `'julian@aconcagua.co'`) prevents the public `create` rule from being abused to send mail to an arbitrary address.

### Data Changes
- [ ] Translation / i18n keys added: **None** — the new fields are non-UI, English-only literals.
- [ ] Schema / migration changes: **Firestore document shape change** — adds top-level `to` (string, exact literal `'julian@aconcagua.co'`) and `message` (map with `subject: string`, `html: string`). No migration of existing documents is required — older docs without these fields remain read-side compatible (no reader is being changed).
- [ ] Config changes: `firestore.rules` updated to permit and validate the new fields. `firebase.json` is unchanged (it already references `firestore.rules`).
- [ ] Static assets added: **None.**
- [ ] New dependencies: **None.** `firebase/firestore` is already imported.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**
- `firestore.rules` (Modify — `isValidContactForm` function — extend `hasOnly` and `hasAll` lists to include `to` and `message`; add type/literal/length validation for the new fields)
- `src/components/PricingContactForm.astro` (Modify — `form.addEventListener('submit', ...)` handler block, specifically the `try { ... }` body where the `addDoc(collection(db, 'contact_form'), {...})` call lives — append `to`, `message.subject`, `message.html` to the payload object; add a local `escapeHtml` helper and a local `buildEmailHtml(...)` helper inside the same `<script>` block, scoped to the closure or the file-top of the script — the implementer chooses the placement that keeps the diff minimal and readable)

**No file is created. No file is deleted. No new directory is added.**

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Edit `firestore.rules` `isValidContactForm(d)`:
  - Extend the `hasOnly([...])` list from 11 keys to 13: append `'to'` and `'message'`.
  - Extend the `hasAll([...])` list from 8 keys to 10: append `'to'` and `'message'`.
  - Add: `&& d.to is string && d.to == 'julian@aconcagua.co'`
  - Add: `&& d.message is map`
  - Add: `&& d.message.keys().hasOnly(['subject','html']) && d.message.keys().hasAll(['subject','html'])`
  - Add: `&& d.message.subject is string && d.message.subject.size() >= 1 && d.message.subject.size() <= 256`
  - Add: `&& d.message.html is string && d.message.html.size() >= 1 && d.message.html.size() <= 16384`
  - Preserve every existing condition exactly as it stands today.
  - Preserve `&& d.createdAt == request.time` as the final clause (the rules engine requires the request-time clock equality and the test for `to`/`message` must not break it).

**Phase 2: Implementation**
- [ ] In `src/components/PricingContactForm.astro`, inside the `submit` handler's `try { ... }` block:
  - Before the `addDoc` call, after the existing `const lang = ...` line, build the new fields:
    1. Define a local `escapeHtml(v: string): string` helper that maps `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`. The implementer may place it as a module-scope `const` at the top of the inline `<script>` or as a closure inside the handler — whichever produces the smallest, clearest diff.
    2. Capture `pageUrl = window.location.href.slice(0, 2048)`, `userAgent = navigator.userAgent.slice(0, 512)`, `referrer = document.referrer.slice(0, 2048)` into named consts so the HTML body and the existing payload reference the **same** trimmed values (currently these are inlined in the `addDoc` literal — refactor to named consts so both the document fields and the email body stay in lockstep).
    3. Build `subject` = ``Contact from Aconcagua.co Pricing for package ${packageName}`` (no escaping in the subject — Firestore stores it as a plain string; if the email pipeline needs subject sanitization, that is the pipeline's concern, not ours).
    4. Build `html` via a small `buildEmailHtml({...})` helper that returns a single string. The implementer chooses the exact markup; the spec only fixes the **content contract** below.
  - Extend the `addDoc` payload by appending these three new properties at the end (after `createdAt`):
    - `to: 'julian@aconcagua.co'`,
    - `message: { subject, html }`
  - **Preserve every existing payload key in its current position and current form.** Do not rename `pageUrl`/`userAgent`/`referrer` even if they are now sourced from the named consts above.

- [ ] HTML body content contract (every item below MUST be present in the rendered HTML):
  - Heading: ``New inquiry from Aconcagua.co Pricing — {escapedPackageName}``
  - A "Contact" section listing: `Name` and `Email` (user-provided, escaped).
  - A "Package" section listing: `Package name`, `Package ID`, `Package slug`, `Package price`.
  - A "Request context" section listing: `Locale (lang)`, `Page URL`, `User agent`, `Referrer` (use a placeholder like `(none)` if `referrer` is the empty string — do NOT render an empty `<a>`).
  - A "Submitted at (client time)" line with `new Date().toISOString()`.
  - The structure must be readable as a plain email: prefer a single root container with `<h2>` / `<h3>` headings and `<table>` (with `border="0" cellpadding="6"`) or definition-list (`<dl>`/`<dt>`/`<dd>`) for label-value pairs. Inline-only styling (no `<style>` blocks, no external CSS — many email clients strip them). Use neutral, readable colors only if the implementer chooses to style at all; styling is OPTIONAL and unstyled markup is acceptable. Per `docs/PROJECT.md` no-hardcoded-hex rule, prefer no inline color at all over hardcoded hex; if the implementer adds styling, restrict to layout/spacing inline attributes.
  - Every interpolation of a user-controllable string MUST go through `escapeHtml(...)`. The non-user-controllable literal labels do not need escaping.
  - The resulting `html` string MUST be ≤ 16384 characters (the rules will reject larger payloads; the inputs are already length-bounded by the existing rules so this ceiling is comfortable).

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] No registration, import, route, or export changes required. The component is already wired into `PricingCard.astro` on all three locales via `<PricingContactForm ... />` and the rules file is already registered via `firebase.json`'s `"firestore": { "rules": "firestore.rules" }`.
- [ ] **Rules deployment ordering callout (informational — out of scope for the implementer's code change):** The updated `firestore.rules` MUST be deployed BEFORE (or atomically with) the client change, otherwise the new client payload will be rejected. Deployment is the operator's responsibility; this spec only ships the rules file content.

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` and confirm zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification per Section 5.

## 4. Automated Verification

### Verification Commands
```bash
npm run build
```

### Quality Gates
- [ ] `npm run build` exits 0 with no errors and no `@astrojs/check` warnings.
- [ ] No new dependencies added to `package.json`.
- [ ] No file is created or deleted; only the two listed files are modified.
- [ ] Every existing field on the `addDoc` payload is preserved verbatim.
- [ ] Every existing condition in `isValidContactForm` is preserved verbatim.
- [ ] No hardcoded hex colors in any new markup (per `docs/PROJECT.md` Prohibitions).
- [ ] The `escapeHtml` helper covers `&`, `<`, `>`, `"`, `'` (all five — incomplete escaping is a security regression).
- [ ] The `to` literal exactly matches `'julian@aconcagua.co'` on both client and rules side (one place each — easy to grep for parity).

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] A Firebase project (`aconcagua-co`) is reachable from the dev environment with `PUBLIC_FIREBASE_*` env vars set per `.env.example`.
- [ ] The updated `firestore.rules` is deployed to that project (or a staging project) before the client test, otherwise writes WILL be rejected. Verify deployment via `firebase deploy --only firestore:rules` (operator action; not part of the implementer's code change).
- [ ] `npm run dev` is running locally.

**Scenario (run once — covers all three locales because the data shape is locale-independent):**
1. [ ] Open `http://localhost:4321/`. Click any package card's "Or send us a message" trigger.
2. [ ] Enter a name (e.g., `Test User <inject>`) and a valid email (e.g., `qa@example.com`). The angle brackets in the name are intentional to verify HTML escaping in the stored `message.html`.
3. [ ] Submit. Confirm the inline status shows the success message and the form resets.
4. [ ] In the Firebase Console → Firestore → `contact_form` collection, open the newly created document and confirm:
   - All existing fields are present with correct values (`name`, `email`, `packageId`, `packageSlug`, `packageName`, `packagePrice`, `lang`, `pageUrl`, `userAgent`, `referrer`, `createdAt`).
   - `to` equals exactly `julian@aconcagua.co`.
   - `message.subject` equals exactly `Contact from Aconcagua.co Pricing for package <PACKAGE_NAME>` for the card you clicked.
   - `message.html` is a non-empty string containing the name (with `<inject>` rendered as escaped `&lt;inject&gt;`, NOT as literal angle brackets), the email, the package context, the locale, and the request metadata.
5. [ ] Repeat for `http://localhost:4321/en/` and `/zh/` to confirm `packageName` reflects the locale's translated name and that the subject string template still renders the localized name verbatim.
6. [ ] Negative test: temporarily edit `firestore.rules` locally to revert the `hasOnly` change, redeploy to a scratch project, and confirm the new client write is rejected with a `permission-denied` error in the browser console — proves the rules are load-bearing. Revert.

**Success Criteria:**
- ✅ The Firestore document for a real submission contains the original 11 fields PLUS `to` and `message.{subject,html}`, with the values described above.
- ✅ The `<inject>` substring in the user-supplied name appears in `message.html` as `&lt;inject&gt;` (escaped), confirming XSS-safety of the body.
- ✅ `npm run build` passes with zero errors and zero warnings.

## 6. Coverage Requirements

- [ ] No automated tests — the project has no test suite. The manual verification script above IS the coverage. State explicitly recorded per `docs/PROJECT.md`.
- [ ] Edge cases to consider:
  - Empty `referrer` (most common case for direct visits) — must render a `(none)` placeholder, not an empty `<a>` and not the literal string `undefined`.
  - User-supplied name containing HTML metacharacters (`<`, `>`, `&`, `"`, `'`) — must be escaped in `message.html`.
  - Very long `userAgent` / `pageUrl` strings — already truncated by the existing `slice(...)` limits; the same truncated values flow into both the document fields and the HTML body.
  - `packageName` containing non-ASCII characters (Chinese locale `zh.ts` will produce e.g. `基础`) — must round-trip cleanly through both the `subject` template and the `html` body.
  - Multiple submissions from the same card / same session — each produces a distinct `addDoc`; the new fields must be regenerated per submission (no cached `subject`/`html` strings).

## 7. Acceptance Criteria (Definition of Done)

- [ ] All implementation phases completed.
- [ ] Validation gate (`npm run build`) passes with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification script completed end-to-end on at least the default locale.
- [ ] `firestore.rules` updated such that:
  - The new fields are required (`hasAll`) and whitelisted (`hasOnly`).
  - `to` is constrained to the literal `'julian@aconcagua.co'`.
  - `message` is constrained to a map with exactly `subject` (string, 1–256 chars) and `html` (string, 1–16384 chars).
  - All previously existing constraints are preserved verbatim.
- [ ] `src/components/PricingContactForm.astro` updated such that:
  - Every existing `addDoc` payload key remains, in its current form.
  - The new `to` and `message` keys are appended.
  - User-controllable strings are HTML-escaped before being interpolated into `message.html`.
- [ ] No regressions in adjacent surfaces — pricing cards, dialog open/close, validation messages, success/error states, all three locales.
- [ ] No new dependencies, no new files, no deletions.
- [ ] Issue-to-implementation traceability:
  - Issue requirement "Always set `to` to 'julian@aconcagua.co'" → client const literal + rules `==` literal check.
  - Issue requirement "Always set `subject` to 'Contact from Aconcagua.co Pricing for package {packageName}'" → client template literal using existing `packageName` value.
  - Issue requirement "Generate an HTML message body that includes the user-provided information and the data recorded in the Firestore document" → `buildEmailHtml(...)` content contract in Phase 2.
  - Issue requirement "Store the following new schema in the Firestore document … `{ to, message: { subject, html } }`" → `addDoc` payload extension.
  - Issue requirement "Do not modify or remove any existing fields currently being stored; only add the new fields" → quality-gate item ("every existing payload key preserved verbatim") + acceptance-criterion preservation clauses on both files.
