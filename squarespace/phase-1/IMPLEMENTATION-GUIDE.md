# Phase 1 — Implementation Guide
**Aconcagua.co Redesign | Squarespace 7.1**

Estimated time: ~90 minutes total. Follow this exact order.

---

## Section ID Reference Map

| Section ID | Content |
|---|---|
| `6992755ddfa2f468045141b7` | Hero ("Tu cumbre comienza aquí") |
| `6992755ddfa2f468045141d5` | About ("¿Quién es Julian Kusi?") |
| `6992755ddfa2f468045141cc` | Pricing ("Armemos tu plan...") |
| `6992755ddfa2f468045141be` | CTA / Calendly ("Despejá tus dudas en 30 minutos") |
| `6992755ddfa2f468045141ea` | Email contact ("¿Prefieres escribirme un correo?") |
| `699cf430670d92052ac147e8` | Partners — Global Rescue |
| `6996336f1da60d09c59885db` | Partners — Piré/Equipment |
| `6992755ddfa2f468045141e5` | Social ("Sígueme en mis redes sociales") |
| `6992755ddfa2f468045141f0` | Footer |

---

## STEP 1 — CSS (5 min)
*Do this first — it affects everything below.*

1. Go to **Settings > Advanced > Code Injection**
2. Click the **Header** tab
3. Scroll to the very end of the existing CSS block (inside the `<style>` tags)
4. Paste the entire contents of **`code-injection-additions.css`** right before the closing `</style>` tag
5. Click **Save**

---

## STEP 2 — Footer data (5 min)
*Quickest credibility fix.*

1. Go to **Settings > Business Information**
2. Update:
   - **Email**: `julian@aconcagua.co` (removes `correo@ejemplo.com`)
   - **Phone**: `+573146294318` (removes `(555) 555-5555`)
   - **Address**: Mendoza, Argentina
3. Save

Then in the page editor, find the footer and update the copyright text to:
`© 2026 Aconcagua.co — Julian Kusi. Todos los derechos reservados.`

---

## STEP 3 — Hero: Add tag + buttons (20 min)

1. Open the home page editor
2. Click into the **Hero section**
3. Add a **Text Block** ABOVE the existing H1:
   - Type: `GUÍA DE MONTAÑA CERTIFICADO`
   - Set paragraph style (not heading)
   - In the block settings or via CSS, it will be styled gold by the `.hero-tag` class
   - Add the class `hero-tag` to this block if Squarespace allows custom classes, OR it will apply via positional CSS
4. Add a **Button Block** BELOW the subtitle paragraph:
   - **Button 1** (Primary style):
     - Label: `Reservá tu Asesoría →`
     - Link: scroll to the CTA/Calendly section
   - **Button 2** (Secondary style):
     - Label: `Ver Expediciones`
     - Link: scroll to the Pricing section
5. The CSS in Step 1 handles all the gold/outline styles automatically for darkest sections.

**Visual check:** The hero should now show: gold tag → big headline → subtitle → two buttons.

---

## STEP 4 — Pricing: Replace with visual cards (35 min)

1. Open the home page editor
2. Navigate to the **Pricing section**
3. Delete all existing text blocks / content in this section
4. Add a **Code Block** (not an embed — a native Code Block)
5. Paste the entire contents of **`pricing-cards.html`** into the Code Block
6. Click **Apply** then **Save**
7. Set the section background to **White** (lightest theme) if not already

**Mobile check:** At 375px width, cards should stack vertically with "Asistencia Logística" (featured) appearing first.

> **Note:** The CTA buttons already link to `#6992755ddfa2f468045141be` (the Calendly section ID, confirmed from the live site). No changes needed.

---

## STEP 5 — Social: Replace QR codes (20 min)

1. Open the home page editor
2. Navigate to the **Social / Community section**
3. Delete the QR code images and any embed thumbnails
4. Add a **Code Block**
5. Paste the entire contents of **`social-cards.html`** into the Code Block
6. Click **Apply** then **Save**
7. Set section background to **Light** (warm `#f7f5f2` theme)

> **Important:** The social links use real URLs (`youtube.com/@julian_kusi`, `instagram.com/julian_kusi`, `tiktok.com/@julian_kusi`). Confirm these are the correct handles before publishing. If the handles are different, edit the `href` attributes in the HTML before pasting.

---

## Validation Checklist

After completing all steps, verify:

- [ ] **Hero**: Gold tag visible above headline
- [ ] **Hero**: Two buttons appear — gold primary + white outline secondary
- [ ] **Hero mobile (375px)**: Buttons stack vertically, not side by side
- [ ] **Footer**: `julian@aconcagua.co` visible (no `correo@ejemplo.com`)
- [ ] **Footer**: Real phone number (no `(555) 555-5555`)
- [ ] **Pricing**: 3 cards with borders and shadows visible
- [ ] **Pricing**: Center card ("Asistencia Logística") has gold border + "Más Popular" badge
- [ ] **Pricing**: Each card has a working CTA button
- [ ] **Pricing mobile (375px)**: Cards stack, featured card appears first
- [ ] **Social**: 3 cards with platform icons (YouTube, Instagram, TikTok)
- [ ] **Social**: NO QR codes visible anywhere
- [ ] **Social**: Clicking each card opens correct platform in new tab
- [ ] **Buttons (all sections)**: Primary buttons are gold `#c88a3e`

---

## Troubleshooting

**CSS not applying?**
- Make sure the CSS is inside `<style>` tags in Code Injection
- Try adding `!important` if Squarespace is overriding (already included in most rules)
- Clear browser cache and check in an incognito window

**Code block not rendering?**
- Make sure you added a **Code Block** (not a Markdown block or Embed block)
- The HTML should render directly, not show as raw code

**Pricing cards overlapping on desktop?**
- The featured card uses `scale(1.04)` — if this causes layout issues, change it to `transform: none` in the CSS inside the HTML file

**Social links open in same tab?**
- Confirm `target="_blank"` is present in each `<a>` tag in `social-cards.html`
