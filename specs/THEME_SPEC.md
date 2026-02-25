# Light / Dark Theme Specification
**Project:** aconcagua.co
**Feature:** Adaptive Light/Dark Mode
**Date:** February 2026
**Version:** 1.0

---

## 1. Goal

Add light and dark theme support that:
- Respects the user's OS preference by default (`prefers-color-scheme`)
- Allows manual toggle, persisted in `localStorage`
- Maintains the brand's premium mountain aesthetic in both modes
- Keeps all text readable (WCAG AA minimum contrast)
- Introduces no layout shifts or flicker on load

---

## 2. Design Philosophy

The site already uses two distinct visual registers:
- **Dark register** — hero, nav, footer (`#0f1923` navy backgrounds, white text)
- **Light register** — content sections (warm beige `#f7f5f2`, dark text)

The goal is **not** to flip the entire page to black or white. Instead:

| Mode | Tone | Feeling |
|------|------|---------|
| **Dark** (default for many) | Deep navy + gold + white | Night sky, summit, prestige |
| **Light** | Warm cream + gold + charcoal | Glacier sun, clean, approachable |

The gold accent (`#c88a3e`) remains unchanged in both modes — it is the brand constant.

---

## 3. Color Token Specification

All colors live in CSS custom properties on `:root`. The dark theme is the default (matches current design). The light theme is applied via `[data-theme="light"]` on `<html>`.

### 3.1 Core Tokens

| Token | Dark (default) | Light |
|-------|---------------|-------|
| `--bg-base` | `#0f1923` | `#f7f5f2` |
| `--bg-section-alt` | `#111e2b` | `#eae6e1` |
| `--bg-card` | `rgba(255,255,255,0.05)` | `#ffffff` |
| `--bg-nav` | `rgba(15,25,35,0.96)` | `rgba(247,245,242,0.96)` |
| `--bg-footer` | `#0f1923` | `#1a1a1a` |
| `--text-primary` | `#ffffff` | `#1a1a1a` |
| `--text-secondary` | `rgba(255,255,255,0.70)` | `#5a6a72` |
| `--text-muted` | `rgba(255,255,255,0.45)` | `#8a9aa3` |
| `--border-subtle` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.08)` |
| `--border-card` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |
| `--accent` | `#c88a3e` | `#c88a3e` |
| `--accent-hover` | `#a06f2f` | `#a06f2f` |
| `--shadow-card` | `0 4px 20px rgba(0,0,0,0.25)` | `0 4px 20px rgba(0,0,0,0.06)` |
| `--shadow-hover` | `0 12px 40px rgba(0,0,0,0.40)` | `0 12px 40px rgba(0,0,0,0.10)` |
| `--shadow-gold` | `0 8px 24px rgba(200,138,62,0.35)` | `0 8px 24px rgba(200,138,62,0.30)` |
| `--shadow-photo` | `0 20px 60px rgba(0,0,0,0.45)` | `0 20px 60px rgba(0,0,0,0.14)` |

> **Keep unchanged in both modes:** `--accent`, `--accent-hover`, `--shadow-gold`, all border-radius tokens, all spacing tokens, all font-size tokens.

### 3.2 Hero Overlay

The hero always uses a dark overlay on the photo (dark or light mode). Only the intensity differs:

| Mode | Gradient |
|------|----------|
| Dark | `linear-gradient(to bottom, rgba(15,25,35,0.65) 0%, rgba(15,25,35,0.85) 100%)` |
| Light | `linear-gradient(to bottom, rgba(15,25,35,0.50) 0%, rgba(15,25,35,0.75) 100%)` |

Hero text remains white in both modes (white on photo overlay is always correct).

### 3.3 Navigation

| State | Dark | Light |
|-------|------|-------|
| Transparent (top) | links: `rgba(255,255,255,0.80)` | links: `rgba(255,255,255,0.90)` (still on photo) |
| Scrolled (background visible) | bg: `rgba(15,25,35,0.96)`, links: white | bg: `rgba(247,245,242,0.96)`, links: `#1a1a1a` |

Logo `.webp` is light-colored — in light scrolled state, add a subtle drop shadow or use the logo's dark variant if one exists.

### 3.4 Section Backgrounds

The current alternating pattern (dark → light beige → dark alt beige → dark → …) maps to:

| Section | Dark token | Light token |
|---------|-----------|-------------|
| Hero | `#0f1923` (always dark — photo bg) | same |
| About | `--light-bg` → `--bg-section-alt` | `--bg-base` (`#f7f5f2`) |
| Stats | `--dark` → `--bg-base` | `--bg-section-alt` |
| Pricing | `--alt-bg` → `--bg-section-alt` | `--bg-base` |
| Testimonials | `--light-bg` → `--bg-base` | `--bg-section-alt` |
| CTA | `--dark` → `--bg-base` | `--bg-base` (light photo overlay) |
| Partners | `--dark` → `--bg-base` | `--bg-section-alt` |
| Social | `--dark` → `--bg-base` | `--bg-section-alt` |
| Footer | `#0f1923` always | `#1a1a1a` (footer stays dark in both) |

> **Footer always stays dark.** Dark footer on light page is a common, elegant pattern — it grounds the page and avoids redesigning the footer's white-text links.

---

## 4. Component-Level Notes

### 4.1 Cards (Pricing, Testimonials)

**Dark mode:**
```
background: rgba(255,255,255,0.05)
border: 1.5px solid rgba(255,255,255,0.08)
```

**Light mode:**
```
background: #ffffff
border: 1.5px solid rgba(0,0,0,0.06)
box-shadow: var(--shadow-card)
```

Featured pricing card gold border stays identical in both modes.

### 4.2 Buttons

**`.btn-primary`** — identical in both modes (gold fill, white text). No change.

**`.btn-secondary`** (outlined, white text):
- Dark mode: `border: 1.5px solid rgba(255,255,255,0.40)` — unchanged
- Light mode (hero context): same — secondary button only appears on the hero photo overlay, so white stays correct

**`.btn-outline`** (gold border):
- Dark mode: `color: #c88a3e; border-color: #c88a3e` — unchanged
- Light mode: same — gold on light background is more vivid, which is fine

### 4.3 Tags / Eyebrow Labels

Gold color (`#c88a3e`) is unchanged. The decorative side-lines use `currentColor` — they inherit correctly.

### 4.4 Timeline (About section)

- Gold dots and connector line: unchanged
- Year text: `--accent` (gold) — unchanged
- Content text: switches via `--text-primary` / `--text-secondary`

### 4.5 Credential Badge

Gold background badge is unchanged. Always gold.

### 4.6 Dividers

Gold 3px line is unchanged in both modes.

### 4.7 Feature Lists (Pricing checkmarks)

Gold circle background: `rgba(200,138,62,0.12)` — unchanged. Works on both white cards (light) and translucent cards (dark).

### 4.8 Social icons / Footer links

Footer stays dark — all white text and icon colors remain unchanged.

### 4.9 Lang Switcher dropdown

| Element | Dark | Light |
|---------|------|-------|
| Dropdown bg | `#1a3a4a` | `#ffffff` |
| Dropdown border | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.10)` |
| Option text | white | `#1a1a1a` |
| Option hover bg | `rgba(200,138,62,0.15)` | `rgba(200,138,62,0.10)` |

---

## 5. Theme Toggle UI

### 5.1 Component

A small icon toggle button placed in the navigation bar between the language switcher and the CTA button.

**Appearance:**
- 36×36px circle button
- Sun icon (☀) for light mode trigger, Moon icon (☾) for dark mode trigger
- Use SVG icons inline (no external icon library required)
- Transition: `opacity 0.2s ease` on icon swap
- Tooltip: `aria-label="Switch to light mode"` / `"Switch to dark mode"`

**Dark nav state:**
```
background: rgba(255,255,255,0.08)
border: 1px solid rgba(255,255,255,0.12)
color: rgba(255,255,255,0.80)
hover: background rgba(255,255,255,0.14)
```

**Light nav state (scrolled):**
```
background: rgba(0,0,0,0.06)
border: 1px solid rgba(0,0,0,0.10)
color: #1a1a1a
hover: background rgba(0,0,0,0.10)
```

### 5.2 Placement

```
[Logo]  ·  [Nav Links]  ·  [Lang Switcher]  [Theme Toggle]  [CTA Button]
```

On mobile, the theme toggle appears inside the mobile menu overlay, above the CTA button.

### 5.3 No-JS / SSR Fallback

The toggle must not cause a flash of wrong theme (FOWT) on page load. Implement the blocking inline script pattern:

```html
<!-- In <head>, before any CSS loads -->
<script>
  (function() {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

Default (no JS): `prefers-color-scheme` media query via CSS is the fallback.

---

## 6. CSS Architecture

### 6.1 Variable Structure in `global.css`

```css
/* ── DARK (DEFAULT) ─────────────────────────────── */
:root {
  --bg-base:         #0f1923;
  --bg-section-alt:  #111e2b;
  --bg-card:         rgba(255,255,255,0.05);
  --bg-nav:          rgba(15,25,35,0.96);
  --text-primary:    #ffffff;
  --text-secondary:  rgba(255,255,255,0.70);
  --text-muted:      rgba(255,255,255,0.45);
  --border-subtle:   rgba(255,255,255,0.10);
  --border-card:     rgba(255,255,255,0.08);
  /* ... shadows ... */
}

/* ── LIGHT ──────────────────────────────────────── */
[data-theme="light"] {
  --bg-base:         #f7f5f2;
  --bg-section-alt:  #eae6e1;
  --bg-card:         #ffffff;
  --bg-nav:          rgba(247,245,242,0.96);
  --text-primary:    #1a1a1a;
  --text-secondary:  #5a6a72;
  --text-muted:      #8a9aa3;
  --border-subtle:   rgba(0,0,0,0.08);
  --border-card:     rgba(0,0,0,0.06);
  /* ... shadows ... */
}

/* ── OS FALLBACK (no JS) ─────────────────────────── */
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* same as [data-theme="light"] */
  }
}
```

### 6.2 Refactor Existing Hardcoded Colors

All hardcoded color values in component stylescopes must be replaced with tokens:

| Find | Replace with |
|------|-------------|
| `background: #0f1923` | `background: var(--bg-base)` |
| `background: #f7f5f2` | `background: var(--bg-base)` or `var(--bg-section-alt)` |
| `background: #eae6e1` | `background: var(--bg-section-alt)` |
| `color: #1a1a1a` | `color: var(--text-primary)` |
| `color: #5a6a72` | `color: var(--text-secondary)` |
| `color: white` / `color: #fff` | `color: var(--text-primary)` (context-aware) |
| `border: … rgba(255,255,255,0.10)` | `border-color: var(--border-subtle)` |
| `box-shadow: 0 4px 20px rgba(0,0,0,0.06)` | `box-shadow: var(--shadow-card)` |

> Exception: Colors hardcoded inside the Hero and Footer components remain as-is (hero always dark overlay; footer always dark background).

### 6.3 Transition

Add to `:root` for smooth theme switching:

```css
:root {
  --theme-transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

body, main, section, header, footer, nav, article, aside {
  transition: var(--theme-transition);
}
```

Apply `transition: none` when `prefers-reduced-motion: reduce` is active.

---

## 7. JavaScript Behavior (`ThemeToggle.astro`)

```
1. On mount: read localStorage('theme') → fall back to prefers-color-scheme
2. Set data-theme on <html>
3. On toggle click:
   a. Flip theme (dark ↔ light)
   b. Set data-theme on <html>
   c. Persist to localStorage('theme')
   d. Update aria-label and icon
4. Listen for OS preference change (window.matchMedia.addEventListener('change'))
   → Only update if user has not manually set a preference (no localStorage entry)
```

---

## 8. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Toggle has accessible name | `aria-label` updated on each state change |
| Focus visible on toggle | Custom `:focus-visible` ring using gold accent |
| Color contrast (WCAG AA) | All text tokens verified — see §9 |
| Reduced motion | `transition: none` inside `prefers-reduced-motion` block |
| No FOWT | Blocking inline `<script>` in `<head>` |
| Keyboard operable | Toggle is a `<button>`, activatable via Enter/Space |

---

## 9. Contrast Ratios (WCAG AA = 4.5:1 for normal text, 3:1 for large text)

| Pair | Dark mode | Light mode | Pass? |
|------|-----------|-----------|-------|
| `--text-primary` on `--bg-base` | white on `#0f1923` → ~17:1 | `#1a1a1a` on `#f7f5f2` → ~16:1 | ✅ |
| `--text-secondary` on `--bg-base` | `rgba(255,255,255,0.70)` on `#0f1923` → ~9:1 | `#5a6a72` on `#f7f5f2` → ~5.2:1 | ✅ |
| Gold (`#c88a3e`) on `--bg-base` | on `#0f1923` → ~5.1:1 | on `#f7f5f2` → ~3.1:1 (large text only) | ✅ (used for large text/headings) |
| White text on gold button | white on `#c88a3e` → ~3.0:1 | same | ✅ (large bold text) |
| Card text on `--bg-card` (light) | — | `#1a1a1a` on `#ffffff` → 21:1 | ✅ |

> Gold on light beige at 3.1:1 is borderline — restrict its use on `--bg-base` (light) to font sizes ≥18px or bold weight (which qualifies as large text under WCAG).

---

## 10. Files to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `src/styles/global.css` | Modify | Add `[data-theme="light"]` block, replace hardcoded colors with tokens |
| `src/components/ThemeToggle.astro` | Create | Toggle button with sun/moon icon, JS logic |
| `src/components/Nav.astro` | Modify | Import and place `ThemeToggle`, update nav color logic |
| `src/layouts/BaseLayout.astro` | Modify | Add blocking inline `<script>` in `<head>` for FOWT prevention |
| `src/styles/nav.css` | Modify | Update nav scrolled-state colors to use `--bg-nav`, `--text-primary` |
| `src/components/About.astro` | Modify | Replace `#f7f5f2` hardcoded bg with `--bg-section-alt` (context) |
| `src/components/Pricing.astro` | Modify | Replace `#eae6e1` hardcoded bg |
| `src/components/Testimonials.astro` | Modify | Replace hardcoded bg |
| `src/components/PricingCard.astro` | Modify | Replace hardcoded card bg / border |
| `src/components/TestimonialCard.astro` | Modify | Replace hardcoded card bg / border |
| `src/components/LangSwitcher.astro` | Modify | Update dropdown bg/text to tokens |

---

## 11. Out of Scope

- Dark/light variants of the hero image (`/hero.webp`) — the gradient overlay handles both
- Separate logo assets for each theme — CSS `filter: brightness()` can compensate if needed
- Custom themes beyond dark/light (e.g., high contrast)
- Automatic time-based theme switching

---

## 12. Acceptance Criteria

- [ ] OS dark preference → page loads dark with no flash
- [ ] OS light preference → page loads light with no flash
- [ ] Toggle switches theme instantly with smooth 0.25s transition
- [ ] Theme persists across page reloads and navigations
- [ ] All 3 language routes (`/`, `/en/`, `/zh/`) respect stored theme
- [ ] Gold accent remains identical in both modes
- [ ] Footer is dark in both modes
- [ ] Hero text is readable in both modes (white on dark overlay)
- [ ] All interactive elements have visible focus indicators in both modes
- [ ] No layout shift occurs on toggle
- [ ] Lighthouse accessibility score ≥ 95 maintained
- [ ] Works with JS disabled (OS preference via CSS media query)
