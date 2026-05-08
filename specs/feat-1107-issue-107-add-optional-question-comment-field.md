# Feature Specification: Add optional question/comment field to pricing contact form

> **TL;DR (≤2 sentences):** Add a single optional `message` textarea below the existing name + email fields in `PricingContactForm.astro`, wired through trim/maxlength sanitization on the client and an explicit per-field validator in `firestore.rules` so the Firestore `contact_form` schema continues to be enforced server-side. The field is fully translated across `es` / `en` / `zh`, omitted from the Firestore payload when empty (so the existing `hasOnly` + `hasAll` rule contract continues to pass on submissions without a message), and adds zero new dependencies.
> **Tier:** M · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/QqStS44b4FCiqaZvskkK`
**Git remote(s) (from `git remote -v`):** `origin → git@github.com:juequinterore/aconcagua.git (fetch & push)`
**Git status at planning time (summary):** on branch `chore/update_pricing_contact_form_field`; working tree clean except for one untracked file (`bitbucket-api.sh`) — unrelated to this plan.
**Remote vs `issue_json.git.repository`:** `not provided` (no `git.repository` field in `issue_json` — remote check is a no-op).

**Source files consulted:**
- `docs/PROJECT.md` (authoritative project conventions, design tokens, i18n rules, prohibitions, feature workflow)
- `package.json` (no test script; build = `astro build`)
- `astro.config.mjs` (i18n: `es` default, `en`, `zh`; `prefixDefaultLocale: false`)
- `firestore.rules` (existing `contact_form` schema — `hasOnly` enumerates allowed keys; `hasAll` enumerates required keys)
- `src/components/PricingContactForm.astro` (the file being modified — already implements modal, validation, Firestore submit)
- `src/components/PricingCard.astro` (parent of the form; passes `lang`, `t`, package metadata)
- `src/components/Pricing.astro` (parent of cards; renders the four packages)
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts` (existing `pricing.contact.*` keys — parity required)
- `specs/feat-1106-issue-106-package-pricing-contact-form.md` (previous spec that introduced the form — referenced for context only, not as authority for new conventions)

**Purpose:** Astro v5 static marketing site for Julián Kusi's guided Aconcagua expeditions. Multi-locale (es default, en, zh), SSG only, deployed to Firebase Hosting. Component-driven; no client-side framework (pure Astro).

**Project Type:** Single Astro package — static site (SSG, no SSR).
**Primary Stack:** Astro `^5.17.3`, TypeScript `^5.9.3` (strict, `astro/tsconfigs/strict`), `@astrojs/check` `^0.9.7`, `@astrojs/sitemap` `^3.7.0`, `firebase` `^12.13.0`, `sharp` `^0.33.0`. No Tailwind, no CSS-in-JS, no test framework.
**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (Astro build + `@astrojs/check` type-check — primary gate)
- Test: `N/A` — no test suite exists (per `docs/PROJECT.md`)
- Lint/Format: `N/A` — none configured (per `docs/PROJECT.md`)

**Validation Gate (authoritative "is this working?" signal):** `npm run build` must complete with **0 errors and 0 `@astrojs/check` warnings**, plus manual verification of the modal in `/`, `/en/`, `/zh/` (light + dark, desktop + mobile) — submitting (a) without a message and (b) with a message.

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs
├── firestore.rules                       # MODIFY — extend contact_form schema with optional `message`
├── package.json                          # untouched
└── src/
    ├── components/
    │   ├── Pricing.astro                 # untouched
    │   ├── PricingCard.astro             # untouched
    │   └── PricingContactForm.astro      # MODIFY — add textarea + sanitization + payload conditional
    ├── i18n/
    │   ├── es.ts                         # MODIFY — add pricing.contact.field_message* + error key
    │   ├── en.ts                         # MODIFY — same parity
    │   └── zh.ts                         # MODIFY — same parity
    └── pages/                            # untouched (form is auto-rendered through PricingCard in all 3 locales)
```

**Exposure Model:** File-based routing (`prefixDefaultLocale: false` → `es` at `/`, `en` at `/en/`, `zh` at `/zh/`). The Pricing section is already mounted in `src/pages/index.astro`, `src/pages/en/index.astro`, and `src/pages/zh/index.astro` via `<Pricing lang={lang} t={t} />`. Because the form lives inside `PricingCard.astro` which is composed by `Pricing.astro`, **modifying `PricingContactForm.astro` automatically exposes the new field on all three locales — no page-file or nav changes are required.**

**Locale / Multi-Surface Requirements:** All three locales (`es`, `en`, `zh`) must receive parity for every new translation key. Spanish is the silent fallback for missing keys (per `useTranslations` in `src/i18n/utils.ts`) — this would mask bugs, so all three dictionaries MUST be updated together.

**Conventions Observed:**
- File naming: PascalCase `.astro` for components; lowercase for pages, styles, and i18n dicts. (Evidence: `src/components/PricingContactForm.astro` vs. `src/pages/index.astro`.)
- Component contract: every translated component receives `lang: 'es'|'en'|'zh'` and `t: (key: string) => string`. (Evidence: `PricingContactForm.astro` lines 2–11.)
- Form-field pattern: a `<div class="form-field">` containing a `<label for>`, the input control with `id`, `name`, `maxlength`, and a `<span class="field-error" aria-live="polite">` sibling. (Evidence: `PricingContactForm.astro` lines 70–99.)
- Validation pattern: client-side trims `inputEl.value.trim()`, sets `nextElementSibling.textContent` to a translated error string, and short-circuits with `hasError = true`. (Evidence: `PricingContactForm.astro` lines 372–391.)
- Status / a11y: `aria-live="polite"`, `aria-required` for required inputs, `<dialog>` modal with `aria-modal="true"`. (Evidence: `PricingContactForm.astro` lines 46–106.)
- Firestore submit: builds object literal, calls `addDoc(collection(db, 'contact_form'), {...})`. Hidden context fields (packageId/Slug/Name/Price/lang) plus context metadata (pageUrl/userAgent/referrer) plus `serverTimestamp()`. (Evidence: `PricingContactForm.astro` lines 397–421.)
- Firestore security: `hasOnly()` whitelists allowed keys and `hasAll()` whitelists required keys; per-field type and length checks are explicit. Optional fields use `(!('field' in d.keys()) || (... checks ...))`. (Evidence: `firestore.rules` lines 6–24.)
- i18n keys: dot-namespaced; existing keys use the `pricing.contact.field_<name>` / `pricing.contact.field_<name>_placeholder` / `pricing.contact.error_required_<name>` shape. (Evidence: `src/i18n/es.ts` lines 92–102.)
- Styling: component-scoped `<style>` blocks; consume CSS custom properties from `src/styles/global.css` (`--bg-card`, `--border-card`, `--accent`, `--text-primary`, `--text-secondary`, `--radius-lg`, `--fs-small`, `--fs-xs`). **No hardcoded hex colors** in new code (per `docs/PROJECT.md` Prohibitions). The existing form already wires this in lines 239–263 — the textarea must reuse the same selectors/tokens.

**Reserved Paths / Redirects / Route Collisions to avoid:** `astro.config.mjs` declares `/globalrescue`, `/pire`, `/en/pire` redirects — none touched by this change.

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md`. Adequate project documentation exists; **no `docs/PROJECT.md` creation/update needed** for this feature.

**Change Tier:** **M** — 5 files modified (1 component, 1 security-rules file, 3 i18n dicts), zero files created, zero files deleted, no new dependencies, no new routes, no new top-level module. The Firestore-rules edit is a contract change but it's a straightforward additive optional-field validation alongside an existing schema, not a migration.

## 1. Design Analysis

**Target Scope:** Pricing-card contact form (`src/components/PricingContactForm.astro`) and its server-side persistence contract (`firestore.rules`). The form is rendered identically in all four pricing cards across all three locales — a single component change covers all surfaces.

**Affected Layers:**
- Presentation: `PricingContactForm.astro` (new textarea + label + error span + scoped CSS).
- Client logic: same file's inline `<script>` (sanitization + conditional payload key).
- i18n: all three locale dictionaries (new keys for label, placeholder, optional indicator, and length-error).
- Persistence contract: `firestore.rules` (extend `hasOnly` + add an optional `message` validator).

**Problem Statement (from `issue_json`):** Update the contact form in the pricing items to include a new optional field where users can add a specific question or comment, in addition to the existing fields. The implementation must follow best practices and security guidelines: proper input validation and sanitization, secure handling of user-provided data, and maintained existing functionality.

**Solution Strategy:**
1. Add an optional `<textarea name="message">` to the form, marked optional in the label, with `maxlength` enforced by the browser and mirrored server-side.
2. Trim the value client-side before submission. If the trimmed value is empty, **omit the `message` key from the Firestore payload entirely** so existing submissions (without a message) continue to satisfy the `hasOnly()` rule with the same key set as before — no schema break for cards where the user leaves it blank.
3. Add a graceful client-side length check (in case the user pastes more than `maxlength` — defensive even though browsers enforce `maxlength`).
4. Update `firestore.rules` so `hasOnly()` permits `message`, with a strict optional validator: `(!('message' in d.keys()) || (d.message is string && d.message.size() <= 2000))`. Do NOT add `message` to `hasAll()` (it remains optional).
5. Add three i18n keys per locale: `pricing.contact.field_message`, `pricing.contact.field_message_placeholder`, `pricing.contact.field_message_optional` (the visual "(optional)" suffix in the locale's idiom), and `pricing.contact.error_message_too_long` (used only on the defensive length check).
6. Reuse the existing `.form-field` / `.field-error` markup pattern; reuse the existing input border / focus / placeholder selectors by extending them to `textarea` so styles stay token-driven.

**Entry Point / Exposure:** The new field is reachable through every existing pricing-card "Or send us a message" trigger button, which already renders inside `<PricingCard>` for all four packages on `/`, `/en/`, and `/zh/`. **No new exposure surface is introduced** — `PricingContactForm.astro` is the only render site, and it is composed by `PricingCard.astro` → `Pricing.astro` → each locale's `index.astro`.

**Locale / Surface Coverage:**
- `src/pages/index.astro` (es, `/`)
- `src/pages/en/index.astro` (en, `/en/`)
- `src/pages/zh/index.astro` (zh, `/zh/`)

(All three already render `<Pricing>` — no edits required to these page files.)

**User Story:** As a prospective climber browsing the Aconcagua expedition packages, I want to optionally include a specific question or comment alongside my name and email when I submit a package inquiry, so that Julián's team can respond with context-relevant information on the first reply.

## 2. Architecture & Data

### Architecture

The form's existing data flow is preserved end-to-end:

```
User opens pricing card → clicks "Or send us a message" → <dialog> opens
  → fills name + email + (optional) message
  → client validates trimmed values
  → if message non-empty after trim: include `message` key in addDoc payload
  → Firestore rules validate: hasOnly (incl. message), hasAll (excl. message),
     plus optional-field length check
  → success / error message rendered into .form-status
```

Reused patterns (cited above in Section 0 "Conventions Observed"):
- `<div class="form-field">` shell with `<label for>` + input + `<span class="field-error" aria-live="polite">` (existing lines 70–99 of `PricingContactForm.astro`).
- Trim-and-validate idiom from the same file's submit handler.
- Optional-key Firestore rule shape from `firestore.rules` lines 20–22 (`pageUrl`, `userAgent`, `referrer`).

### Data Changes
- [ ] Translation / i18n keys added: `pricing.contact.field_message`, `pricing.contact.field_message_placeholder`, `pricing.contact.field_message_optional`, `pricing.contact.error_message_too_long` — added to `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`.
- [ ] Schema / migration changes: `firestore.rules` — extend `isValidContactForm()` to permit and validate optional `message`. Cap at 2000 characters server-side.
- [ ] Config changes: None.
- [ ] Static assets added: None.
- [ ] New dependencies: None — reuses Firestore SDK already pulled in by the existing form.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/components/PricingContactForm.astro` (Modify — `<form id={formId}>` markup block AND inline submit-handler `<script>`)
  - Markup: insert a new `<div class="form-field">` containing a `<label for={messageId}>` + `<textarea>` + `<span class="field-error">`, placed AFTER the existing email field block and BEFORE the submit button.
  - Frontmatter: declare `const messageId = \`${uid}-message\`;` next to the existing `nameId` / `emailId` declarations (line ~17–18).
  - Wrapper data attributes: add `data-err-message-too-long={t('pricing.contact.error_message_too_long')}` next to the existing `data-err-*` attributes (lines ~30–33).
  - `<style>` block: extend the existing `.form-field input[type="text"], .form-field input[type="email"]` selectors to also cover `.form-field textarea` (and the matching `:focus` + `::placeholder` rules) so the textarea inherits border, padding, focus ring, and placeholder treatment from the same design tokens. Add a small textarea-only rule for `min-height` and `resize: vertical`.
  - Script: read `wrapper.dataset.errMessageTooLong` next to the existing `errName` / `errEmail` reads. Read the textarea via `form.querySelector<HTMLTextAreaElement>('textarea[name="message"]')`. After trimming, defensively guard the length (e.g., `> 2000`) and surface the translated error if exceeded. After validation passes, build a payload object and **only assign `message` if the trimmed value is non-empty**; pass that object to `addDoc(...)`.
- `firestore.rules` (Modify — `isValidContactForm(d)` function body)
  - Add `'message'` to the `hasOnly` array (alongside `pageUrl`, `userAgent`, `referrer`, etc.). Do NOT add it to `hasAll` (it remains optional).
  - Append the optional-field validator: `(!('message' in d.keys()) || (d.message is string && d.message.size() <= 2000))` matching the same pattern used for `pageUrl` / `userAgent` / `referrer` on lines 20–22.
- `src/i18n/es.ts` (Modify — `pricing.contact.*` block, the existing keys are around lines 88–104)
  - Add (Spanish):
    - `'pricing.contact.field_message': 'Pregunta o comentario'`
    - `'pricing.contact.field_message_optional': '(opcional)'`
    - `'pricing.contact.field_message_placeholder': 'Contanos qué te gustaría saber sobre esta expedición.'`
    - `'pricing.contact.error_message_too_long': 'El mensaje no puede superar los 2000 caracteres.'`
- `src/i18n/en.ts` (Modify — `pricing.contact.*` block, around lines 88–104)
  - Add (English):
    - `'pricing.contact.field_message': 'Question or comment'`
    - `'pricing.contact.field_message_optional': '(optional)'`
    - `'pricing.contact.field_message_placeholder': 'Tell us what you would like to know about this expedition.'`
    - `'pricing.contact.error_message_too_long': 'Your message cannot exceed 2000 characters.'`
- `src/i18n/zh.ts` (Modify — `pricing.contact.*` block, around lines 88–104)
  - Add (Chinese):
    - `'pricing.contact.field_message': '问题或评论'`
    - `'pricing.contact.field_message_optional': '（选填）'`
    - `'pricing.contact.field_message_placeholder': '告诉我们您想了解关于这次探险的哪些信息。'`
    - `'pricing.contact.error_message_too_long': '您的留言不能超过2000个字符。'`

> Translator note for the implementer: the four phrases above are the planner's first-pass translations grounded in the surrounding ES/EN/ZH copy in each dictionary. They are **convention-correct** (informal `vos` in es-AR, neutral en-US, simplified Chinese matching the existing dictionary tone). The implementer MAY adjust wording to match the project's voice; do **not** introduce hardcoded HTML or punctuation that diverges from the rest of the `pricing.contact.*` group.

### Execution Steps

**Phase 1: Data / Model / Contract**
- [ ] Update `firestore.rules` `isValidContactForm()` to add `'message'` to `hasOnly()` and append the optional-field validator (`d.message is string && d.message.size() <= 2000`). Do NOT modify `hasAll`. Confirm by reading the file that the validator follows the same shape as the existing `pageUrl` / `userAgent` / `referrer` clauses.
- [ ] **Deploy note (out of scope for this implementation, but call it out in the PR description):** the deployed Firestore rules must be re-pushed via `firebase deploy --only firestore:rules --project aconcagua-co` (per `.env.example` line 7) BEFORE the form change reaches production, otherwise legitimate submissions that include `message` will be rejected by the live rules' `hasOnly()` check. The implementer SHOULD note this in the PR description; the actual deploy is the project owner's responsibility.

**Phase 2: Implementation**
- [ ] Add `messageId` constant in the frontmatter of `PricingContactForm.astro` next to `nameId` / `emailId`.
- [ ] Add `data-err-message-too-long={t('pricing.contact.error_message_too_long')}` to the wrapper `<div data-pricing-contact-form>` data-attribute block.
- [ ] Insert the new `<div class="form-field">` block (label + textarea + `<span class="field-error" aria-live="polite">`) AFTER the email `<div class="form-field">` and BEFORE the `<button type="submit">`.
  - The `<label>` MUST display the field name AND the optional indicator — e.g., `{t('pricing.contact.field_message')} <span class="optional-tag">{t('pricing.contact.field_message_optional')}</span>` — so the user clearly understands the field is not required.
  - The `<textarea>` attributes: `id={messageId}`, `name="message"`, `rows={4}`, `maxlength="2000"`, `placeholder={t('pricing.contact.field_message_placeholder')}`. Do NOT set `required` and do NOT set `aria-required="true"`.
- [ ] Add textarea CSS:
  - Extend the existing `.form-field input[type="text"], .form-field input[type="email"]` selectors (and their `:focus` and `::placeholder` variants) to also include `.form-field textarea`, so the textarea inherits border, padding, radius, focus ring, and placeholder treatment from the same design tokens — no new color values.
  - Add a small textarea-only rule: `min-height: 96px; resize: vertical; font-family: inherit; line-height: 1.5;` (token-free choices that stay consistent with the project's "no hardcoded colors" rule; line-height/min-height are layout, not color).
  - Add a small `.optional-tag` selector that styles the optional indicator with `color: var(--text-secondary); font-weight: 400; font-size: var(--fs-xs); margin-left: 4px;` — reuses existing tokens.
- [ ] Update the inline `<script>`:
  - Read `errMessageTooLong` from `wrapper.dataset.errMessageTooLong`.
  - In the submit handler, locate the textarea: `const messageInput = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');` — note this MAY return null in TypeScript strict mode, but it will exist; use the non-null assertion the same way the existing code uses it for the email/name inputs (line 370–371).
  - Compute `const messageVal = messageInput.value.trim();`.
  - After the existing name/email validation, add a defensive length check: if `messageVal.length > 2000`, set `messageInput.nextElementSibling.textContent = errMessageTooLong;` and `hasError = true`.
  - Build the Firestore payload as a `Record<string, unknown>` (or equivalent typed object) holding the existing keys, then `if (messageVal) payload.message = messageVal;` BEFORE calling `addDoc(collection(db, 'contact_form'), payload)`. This guarantees the `hasOnly` clause continues to be satisfied for empty-message submissions (no `message` key transmitted), and the new optional rule activates only when a value is present.
- [ ] Add the four i18n keys to each of `src/i18n/es.ts`, `src/i18n/en.ts`, and `src/i18n/zh.ts`. Place them inside the existing `// Pricing — Contact Form` group, immediately after `'pricing.contact.field_email_placeholder'` (so the order in the dictionary mirrors the visual order of the form fields).

**Phase 3: Integration & Exposure (MANDATORY)**
- [ ] Verify (read-only check) that no edits to `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/zh/index.astro`, `src/components/Pricing.astro`, or `src/components/PricingCard.astro` are needed — the form is composed in via `PricingContactForm.astro` and inherits the `lang` + `t` props from its parent. No changes required to these files.
- [ ] Verify (read-only check) that no `Nav.astro` `navLinks` change is required — this feature does not introduce a new top-level page or anchor.
- [ ] Confirm parity across the three i18n dictionaries: every new key MUST exist in `es.ts`, `en.ts`, AND `zh.ts` (per `docs/PROJECT.md` i18n Rules — Spanish is a silent fallback, missing keys would be invisible bugs).

**Phase 4: Validation & Quality**
- [ ] Run `npm run build` — must complete with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification (Section 5).

## 4. Automated Verification

### Verification Commands
```bash
# Primary gate: Astro build + @astrojs/check type-check.
npm run build
```

(There is no test/lint command in this project — `docs/PROJECT.md` records this explicitly. Build is the only automated gate.)

### Quality Gates
- [ ] `npm run build` exits 0 with no errors and no `@astrojs/check` warnings.
- [ ] `firestore.rules` parses (Firebase CLI is not available in CI for this project, so this is verified by inspection: `hasOnly` array contains `'message'`; `isValidContactForm` includes the new optional clause; `hasAll` is unchanged).
- [ ] All four new translation keys exist in **all three** of `es.ts`, `en.ts`, `zh.ts` (no key in only one or two — per `docs/PROJECT.md` Prohibitions).
- [ ] No hardcoded hex colors introduced — the textarea reuses `--border-card`, `--accent`, `--text-primary`, `--text-secondary`, `--radius-lg`, `--fs-small`, `--fs-xs`, `--bg-base`/`--bg-card` (the same tokens already in use by the surrounding inputs).
- [ ] No new dependencies added to `package.json`.
- [ ] No new routes; no new files; no `navLinks` change.
- [ ] No mass refactor of `PricingContactForm.astro` outside the additions above.

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` (if not already done) and `npm run dev`. Open `http://localhost:4321/`.
- [ ] **Firestore rules deployment:** the updated `firestore.rules` must be deployed to the live Firebase project (`firebase deploy --only firestore:rules --project aconcagua-co`) before the "successful submit with message" path can be verified end-to-end. Without it, the live rules will reject any payload containing `message`. If the deploy is not yet done, the implementer can verify the empty-message path against production and the with-message path against the Firestore emulator (or a staging project).

**Scenario A — Empty message (regression check, all three locales):**
1. [ ] Navigate to `/`, scroll to the Expediciones section, click "O envianos un mensaje" on any pricing card.
2. [ ] Enter a valid name and email, **leave the message field empty**, and submit.
3. [ ] Confirm the success status message appears (`pricing.contact.success`) and the form resets.
4. [ ] In Firebase console (or emulator), confirm the resulting `contact_form` document does **NOT** contain a `message` key.
5. [ ] Repeat at `/en/` and `/zh/` — confirm labels for the new optional field render in the correct locale.

**Scenario B — With message (happy path, all three locales):**
1. [ ] Open the same modal, fill name + email, type a short question into the new textarea (e.g., "¿Cuándo es la próxima salida?").
2. [ ] Submit. Confirm the success status appears and the form resets.
3. [ ] Confirm the resulting `contact_form` document contains `message: "<the typed text>"` with no leading/trailing whitespace (was trimmed).
4. [ ] Repeat at `/en/` and `/zh/`.

**Scenario C — Defensive length check:**
1. [ ] Try to type / paste more than 2000 characters into the textarea. Confirm the browser's `maxlength="2000"` truncates the input.
2. [ ] (Optional, devtools) Use devtools to remove the `maxlength` attribute, paste >2000 chars, and submit. Confirm the client-side error renders the `pricing.contact.error_message_too_long` translation and submission is blocked.

**Scenario D — Existing functionality (regression):**
1. [ ] Confirm the name + email validation still triggers correctly on empty/invalid values (no regression in the existing field-error spans).
2. [ ] Confirm the modal still opens via the trigger button, closes on the close button, closes on backdrop click, and closes on `Escape`.
3. [ ] Confirm Calendly button (existing primary CTA in `PricingCard.astro`) is unaffected.

**Scenario E — Theming and responsive (per `docs/PROJECT.md` Manual verification):**
1. [ ] Toggle theme to light. Confirm the textarea border, focus ring, placeholder, and "(optional)" tag all read with adequate contrast (no hardcoded color leakage).
2. [ ] Resize to ≤480px. Confirm the textarea fills the modal width and the modal padding follows the existing `@media (max-width: 480px)` rule.

**Success Criteria:**
- ✅ Submitting without a message produces a Firestore document **without** a `message` key (existing behaviour preserved bit-for-bit).
- ✅ Submitting with a message produces a Firestore document **with** the trimmed message under the `message` key, ≤2000 characters.
- ✅ Server-side rules reject payloads where `message` is non-string or >2000 characters (verified by attempting a malformed call from the Firestore emulator if available, or by inspection).
- ✅ All four new translation keys render in all three locales.
- ✅ No regression in existing name + email validation, modal behaviour, or Calendly CTA.
- ✅ `npm run build` passes with zero errors / zero warnings.

## 6. Coverage Requirements

- [ ] No automated tests exist in this project (per `docs/PROJECT.md`). The Manual Verification Script in Section 5 IS the coverage.
- [ ] Edge cases to consider:
  - Empty input after trim (whitespace-only) → must NOT include `message` in the Firestore payload (treat as absent).
  - Pasting >2000 chars into a textarea where `maxlength` was tampered with → defensive client-side error.
  - Multilingual content in the message (emoji, Chinese, Spanish accents) → Firestore stores UTF-8 strings; `size()` in security rules counts UTF-8 bytes, not characters, so the 2000 cap is a byte cap. Document this in the i18n strings as "characters" for user-friendliness; the byte cap is intentionally lenient enough that 2000 multi-byte characters will not be rejected (a 4-byte-per-char emoji message at 2000 chars = 8000 bytes, which would be rejected — acceptable trade-off; the 2000-byte limit comfortably covers any realistic question).
  - Malicious script injection in the message → not rendered anywhere on the public site (Firestore document is read/update/delete-denied for everyone; only Julián's team views it via authenticated Firebase console). XSS surface is therefore zero on the public site. Length cap + string type-check in the Firestore rules covers the injection vector for the persistence layer.
  - Form submitted multiple times in quick succession → existing `submitBtn.disabled = true` during send already covers this; no change needed.

## 7. Acceptance Criteria (Definition of Done)

- [ ] All four implementation phases (Sections 3.1–3.4) completed.
- [ ] `npm run build` passes with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification scenarios A–E completed across `/`, `/en/`, `/zh/` in light + dark theme, desktop + mobile.
- [ ] `firestore.rules` updated and (separately) deployed to `aconcagua-co` Firebase project.
- [ ] All four new translation keys (`pricing.contact.field_message`, `pricing.contact.field_message_optional`, `pricing.contact.field_message_placeholder`, `pricing.contact.error_message_too_long`) exist in **all three** locale dictionaries.
- [ ] Existing form behaviour (name + email validation, modal open/close/backdrop/Escape, Calendly CTA, hidden context fields, success/error/sending status messages) is unchanged.
- [ ] No new dependencies added.
- [ ] No `navLinks`, route, or page-file changes.
- [ ] No hardcoded hex colors introduced; the textarea consumes only existing design tokens.
- [ ] All requirements in `issue_json` map to implementation steps:
  | `issue_json` requirement | Mapped to |
  | --- | --- |
  | "include a new optional field where users can add a specific question or comment" | Phase 2 — textarea insert; not added to `hasAll` so it stays optional. |
  | "in addition to the existing fields" | Phase 2 — placed AFTER email field, BEFORE submit; existing fields untouched. |
  | "proper input validation" | Phase 2 — client-side trim + length check; Phase 1 — `firestore.rules` `is string` + `size() <= 2000`. |
  | "input sanitization" | Phase 2 — `trim()` before submission; conditional payload key when empty; `maxlength` enforced both client-side and server-side. |
  | "secure handling of user-provided data" | Phase 1 — `read/update/delete` remain `false` on `contact_form`; only `create` allowed and only when schema validates. |
  | "maintaining existing functionality" | Manual Verification Scenario D + Scenario A (empty-message regression) + payload-conditional design ensures the existing wire format is byte-identical when no message is sent. |
