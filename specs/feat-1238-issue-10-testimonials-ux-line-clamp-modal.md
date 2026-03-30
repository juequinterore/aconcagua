# Feature Specification: Testimonials UX — Line Clamp + Read More Modal

## 1. Design Analysis

**Target Scope:** `aconcagua` — Astro 5 static multilingual website (`src/`)

**Affected Layers:**
- UI / Presentation: `TestimonialCard.astro`, `Testimonials.astro`
- i18n: Add `testimonials.readMore` and `testimonials.close` keys to all three locale files

**Problem Statement:**
Some testimonials contain very long text (e.g., Marcelo Simionato's and Catalina Caicedo's testimonials are several hundred characters). In the current carousel layout, cards with long text create inconsistent card heights and overwhelm the user visually. The full text is valuable social proof, but needs to be presented progressively.

**Solution Strategy:**
1. **Line Clamp** — Truncate `.testimonial-text p` to 4 lines via CSS `line-clamp: 4` (with `-webkit-` prefix). Only show the "Read more" button when the text actually overflows.
2. **Read More Button** — A styled "Read more" link/button appears below truncated text; detected at runtime via `scrollHeight > clientHeight`.
3. **Modal / Dialog** — A native `<dialog>` element shows the full testimonial quote (stars, full text, author info) when "Read more" is clicked. Closes on backdrop click, Escape key, or close button.

**Entry Point:**
`TestimonialCard.astro` — every card in the carousel.

**User Story:**
> As a prospective expedition client, I want to see a concise preview of each testimonial with the option to read the full text, so that the page stays clean while all social proof remains accessible.

---

## 2. Architecture & Data

### Architecture

```
TestimonialCard.astro
  ├─ .stars
  ├─ blockquote.testimonial-text          (line-clamped, max 4 lines)
  │   └─ p                                (full text in DOM)
  ├─ button.read-more                     (conditionally visible via JS)
  ├─ footer.testimonial-author
  └─ dialog.testimonial-modal             (full testimonial)
      ├─ button.modal-close               (× close button)
      ├─ .stars
      ├─ blockquote                       (full text)
      └─ footer                           (author info)
```

### Data Changes
- [ ] DB Schema: **None**
- [ ] API Contracts: **None**
- [ ] State Models: **None**
- [ ] i18n Keys: Add `testimonials.readMore` and `testimonials.close` to `es.ts`, `en.ts`, `zh.ts`

---

## 3. Implementation Plan

### Affected Files

- `src/i18n/es.ts` — Add `testimonials.readMore` and `testimonials.close` keys
- `src/i18n/en.ts` — Add `testimonials.readMore` and `testimonials.close` keys
- `src/i18n/zh.ts` — Add `testimonials.readMore` and `testimonials.close` keys
- `src/components/Testimonials.astro` — Pass `readMoreLabel` and `closeLabel` props to each `TestimonialCard`
- `src/components/TestimonialCard.astro` — Add line-clamp, read-more button, and modal dialog

---

### Execution Steps

#### Phase 1: i18n Keys

Add to each locale file:

| Key | es | en | zh |
|---|---|---|---|
| `testimonials.readMore` | `Leer más` | `Read more` | `阅读更多` |
| `testimonials.close` | `Cerrar` | `Close` | `关闭` |

#### Phase 2: Update `Testimonials.astro`

- Pass `readMoreLabel={t('testimonials.readMore')}` and `closeLabel={t('testimonials.close')}` to each `<TestimonialCard>`.

#### Phase 3: Update `TestimonialCard.astro`

**Props additions:**
```ts
readMoreLabel?: string;
closeLabel?: string;
```

**Template additions:**
1. Add `data-card-text` attribute to the `<p>` element containing the testimonial text.
2. After `</blockquote>`, add a `<button class="read-more" aria-haspopup="dialog" hidden>` with the `readMoreLabel` text.
3. Add a `<dialog class="testimonial-modal" aria-modal="true">` containing:
   - A close `<button class="modal-close">` with `closeLabel`
   - `.stars` (repeated)
   - `<blockquote>` with the full text
   - `<footer>` with author info

**CSS additions:**
- `.testimonial-text p`: `display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;`
- `.read-more`: subtle gold link-style button, no background, underlined text
- `dialog.testimonial-modal`: centered overlay using `::backdrop`, max-width 600px, padding, border-radius
- `.modal-close`: top-right absolute button

**JavaScript (inline `<script>`):**
- On `DOMContentLoaded`, for each `.testimonial-card`:
  - Check if `p[data-card-text].scrollHeight > p[data-card-text].clientHeight`; if yes, show `.read-more` button (remove `hidden`)
  - `.read-more` click → `dialog.showModal()`
  - `dialog` click on backdrop → `dialog.close()`
  - `.modal-close` click → `dialog.close()`
  - Escape key is handled natively by `<dialog>`

#### Phase 4: Build Validation

- Run `npm run build`
- Run `npx astro check`

---

## 4. Quality Gates

- [ ] `astro build` passes with zero errors
- [ ] `astro check` reports zero diagnostics
- [ ] Short testimonials show no "Read more" button
- [ ] Long testimonials show "Read more" button; full text visible in modal
- [ ] Modal closes on × button, Escape key, and backdrop click
- [ ] All three locale pages build without errors
- [ ] Focus is managed correctly (modal traps focus)

---

## 5. Acceptance Criteria

- [ ] `TestimonialCard.astro` clamps testimonial text to 4 lines
- [ ] "Read more" button only appears when text is actually clamped
- [ ] Clicking "Read more" opens a `<dialog>` with the full testimonial
- [ ] Modal has a close button and supports Escape + backdrop click to close
- [ ] i18n keys added for `readMore` and `close` in all three locales
- [ ] No regressions to existing carousel or card layout
- [ ] Builds successfully on all 3 locales
