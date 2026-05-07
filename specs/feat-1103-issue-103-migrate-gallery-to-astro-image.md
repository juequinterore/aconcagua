# Feature Specification: Migrate Gallery to Astro `<Image>`

> **TL;DR (≤2 sentences):** Replace the 20 plain `<img>` tags in `src/components/Gallery.astro` with Astro's built-in `<Image>` component from `astro:assets`, generating a responsive `srcset` at widths 320, 640, 1024, and 1600. Move the 20 referenced gallery photos from `public/gallery/` into `src/assets/gallery/` so they enter Astro's image pipeline (sharp is already a dependency), and use `getImage()` server-side to feed pre-resolved largest-width URLs to the lightbox script.
> **Tier:** L · **Validation gate:** `npm run build`

## 0. Project Context (Discovered)

**Workspace root (from `pwd`):** `/Users/me/var/agent-workspaces/VsmX09ZWyD3WmbUk708G`
**Git remote(s) (from `git remote -v`):** `origin → git@github.com:juequinterore/aconcagua.git` (fetch + push)
**Git status at planning time (summary):** On branch `chore/migrate_gallery_to_astro_image`; one untracked file `bitbucket-api.sh` (unrelated to this feature); no staged or modified files.
**Remote vs `issue_json.git.repository`:** not provided — no remote constraint to verify.

**Source files consulted:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `docs/PROJECT.md`, `src/pages/index.astro`, `src/components/Gallery.astro`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/zh.ts`, `public/gallery/` listing, `src/` directory tree.

**Purpose:** Static Astro marketing site for Julián Kusi's guided Aconcagua expeditions. Single Astro v5 package output as a static site, deployed to Firebase Hosting.

**Project Type:** Single Astro package (not a monorepo), SSG-only.
**Primary Stack:** Astro `^5.17.3`, TypeScript `^5.9.3` (strict, `astro/tsconfigs/strict`), `sharp ^0.33.0`, `@astrojs/sitemap ^3.7.0`, `@astrojs/check ^0.9.7`. No Tailwind, no UI framework — pure `.astro` components with scoped CSS.

**Install / Dev / Build / Test / Lint commands:**
- Install: `npm install`
- Dev: `npm run dev` (`astro dev`)
- Build: `npm run build` (`astro build` — runs `@astrojs/check` for type/diagnostic gate)
- Test: N/A — no test suite exists (per `docs/PROJECT.md`); validation is via `npm run build` plus manual browser verification.
- Lint/Format: N/A — none configured.

**Validation Gate (authoritative "is this working?" signal):** `npm run build` exits 0 with zero errors and zero `@astrojs/check` warnings; `dist/` contains the optimized gallery image variants under `dist/_astro/`.

**Directory Structure (relevant portions):**
```
aconcagua/
├── astro.config.mjs              # Astro config: i18n (es/en/zh), redirects, sitemap
├── package.json                  # sharp + astro already present
├── public/
│   └── gallery/                  # 45 Web*.webp files (only 20 referenced by Gallery.astro)
└── src/
    ├── assets/                   # NEW directory — created by this feature
    │   └── gallery/              # 20 Web*.webp files moved from public/gallery/
    ├── components/
    │   └── Gallery.astro         # SOLE source-file modification
    ├── i18n/
    │   ├── es.ts / en.ts / zh.ts # gallery.* keys exist; no changes required
    │   └── utils.ts
    └── pages/
        ├── index.astro           # imports + renders <Gallery lang t />
        ├── en/index.astro
        └── zh/index.astro
```

**Exposure Model:** File-based routing. The Gallery section is already exposed by all three locale entry pages — no new route or navigation entry is needed. `<Gallery lang={lang} t={t} />` is rendered inside `<main>` between `Certifications` and `Pricing` in each of `src/pages/index.astro`, `src/pages/en/index.astro`, and `src/pages/zh/index.astro`. Anchor `#galeria` already exists. **This issue does not introduce a new exposure surface.**

**Locale / Multi-Surface Requirements:** No new translation keys required (existing `gallery.tag`, `gallery.title`, `gallery.subtitle`, `gallery.lightbox_label`, `gallery.close`, `gallery.prev`, `gallery.next` are reused unchanged across `es`, `en`, `zh`). The migration is locale-agnostic — the `images` array contents are inside `Gallery.astro` and the alt text on these specific photos is currently English-only in the existing component (pre-existing behavior; not in scope to change).

**Conventions Observed:**
- Component file naming: PascalCase `.astro` — example: `src/components/Gallery.astro`.
- Module/component pattern: each component receives `{ lang: 'es'|'en'|'zh', t: (key: string) => string }` and exposes a single section. The script for client interactivity lives in a `<script>` block at the bottom of the same `.astro` file (TypeScript). Pattern visible in `Gallery.astro` lines 1–7 (frontmatter Props) and 355–458 (client script).
- Styling approach: scoped `<style>` blocks consuming CSS custom properties from `src/styles/global.css` (e.g., `--bg-section-alt`, `--accent`, `--shadow-card`, `--radius-md`). No hardcoded colors.
- i18n approach: dot-namespaced keys (`gallery.title`, `nav.about`) in `src/i18n/{es,en,zh}.ts`; lookup via `useTranslations(lang)` → `t(key)`.
- Image conventions (per `docs/PROJECT.md`): "In `public/` → referenced with absolute paths (e.g., `/logo.webp`); In `src/assets/` → imported and go through Astro's image pipeline; Prefer `.webp`/`.avif`; include `width`/`height` for layout stability." This issue moves 20 files from the first bucket to the second — a documented pattern, not a new convention.

**Reserved Paths / Redirects / Route Collisions to avoid:** `astro.config.mjs` declares redirects for `/globalrescue`, `/pire`, `/en/pire`. Not relevant to this issue (no new routes).

**Documentation Action Taken:** Used existing docs at `docs/PROJECT.md` (already comprehensive — covers stack, commands, conventions, image rules). No `docs/PROJECT.md` creation needed.

**Change Tier:** L — File count exceeds 15 because 20 image files are moved (`public/gallery/Web*.webp` → `src/assets/gallery/Web*.webp`) in addition to one source-file modification. Architecturally the change is contained to a single component, no new dependencies, no schema, no routes, no i18n changes — but file count alone places it in Tier L per Section 2.5.

## 1. Design Analysis

**Target Scope:** Single component (`src/components/Gallery.astro`) plus a one-time relocation of 20 static image assets from `public/gallery/` to a new `src/assets/gallery/` directory.

**Affected Layers:**
- UI component (Gallery section)
- Static asset pipeline (Astro's built-in image optimization via sharp)
- Client script that drives the lightbox (must consume processed URLs instead of the old `/gallery/*` paths)

**Problem Statement (from `issue_json`):**
> Migrate the gallery from plain `<img>` tags to Astro's built-in `<Image>` component. Ensure the implementation generates a responsive srcset with widths 320, 640, 1024, and 1600.

**Solution Strategy:**
1. Move the 20 referenced images into `src/assets/gallery/` so Astro's pipeline (sharp) can produce optimized variants at build time.
2. In `Gallery.astro` frontmatter, eagerly glob-import all `src/assets/gallery/*.webp` as `ImageMetadata` and build the `images` array using those imports paired with the existing alt text.
3. Render strip thumbnails with `<Image>` from `astro:assets`, passing `widths={[320, 640, 1024, 1600]}` and a `sizes` attribute that matches the existing strip-item dimensions (200px desktop / 160px ≤768px / 140px ≤480px) and the lightbox display size (≤860px or 90vw).
4. For the lightbox (which previously consumed the raw `/gallery/Web*.webp` URL via JS), call `getImage({ src: meta, width: 1600, format: 'webp' })` in the frontmatter for each image to obtain a processed URL, then serialize that array (URL + alt) as JSON inside a `<script type="application/json" id="gallery-lb-data">` element. Replace the static `images` constant in the client `<script>` with `JSON.parse(...)` of that element's text. This keeps the lightbox decoupled from raw asset paths while still using Astro-optimized images.

**Entry Point / Exposure:** Already exposed via `src/pages/index.astro` line 43, `src/pages/en/index.astro`, `src/pages/zh/index.astro` — each renders `<Gallery lang={lang} t={t} />`. No exposure work needed.

**Locale / Surface Coverage:** N/A — Gallery is locale-aware via existing `t('gallery.*')` calls; no string changes are required by this issue. The migration is purely a rendering/pipeline change.

**User Story:** As a visitor on any device and connection, I want the gallery photos to download at a size appropriate for my viewport and pixel density, so that the page loads faster and consumes less bandwidth without visible quality loss.

## 2. Architecture & Data

### Architecture

**Pattern reused:** Astro's built-in image optimization. Per `docs/PROJECT.md` ("Conventions / Images"), assets in `src/assets/` are intended to flow through Astro's image pipeline. This is the first component to actually exercise that pattern (a Grep for `astro:assets` and `import.meta.glob` returned no source-file hits), so this feature also serves as the canonical example of the pattern in this codebase.

**Data flow:**
```
Frontmatter (build-time):
  import.meta.glob('/src/assets/gallery/*.webp', { eager: true, import: 'default' })
    → Record<path, ImageMetadata>
  images = [{ key: 'Web45', alt: '...' }, ...]
  resolved = images.map(({ key, alt }) => ({ meta: glob[`/src/assets/gallery/${key}.webp`], alt }))
  lbData = await Promise.all(resolved.map(async ({ meta, alt }) => ({
    src: (await getImage({ src: meta, width: 1600, format: 'webp' })).src,
    alt,
  })))

Render:
  Strip:    {resolved.map((img, i) => <button …><Image src={img.meta} widths={[320,640,1024,1600]} sizes="…" alt={img.alt} loading={i<5?'eager':'lazy'} decoding="async" /></button>)}
  Lightbox: <script type="application/json" id="gallery-lb-data">{JSON.stringify(lbData)}</script>

Client (script):
  const data = JSON.parse(document.getElementById('gallery-lb-data').textContent);
  // data[i].src is the optimized 1600w URL; lbImg.src = data[current].src
```

**Sizes attribute (matches existing CSS in `Gallery.astro`):**
- Desktop default: `.strip-item { width: 200px }` → `200px`
- `@media (max-width: 768px)`: `width: 160px` → `160px`
- `@media (max-width: 480px)`: `width: 140px` → `140px`
- Final value: `sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, 200px"`

The `widths={[320, 640, 1024, 1600]}` list spans the strip-item DPR2 case (≈400px max) up through the lightbox display at retina (≈1720px target on a wide viewport, served by the 1600w variant).

**Format:** Per project convention (`.webp` source files), let Astro emit `.webp` variants. Do not introduce AVIF in this issue — out of scope and would add a different format than the source. Astro v5's `<Image>` defaults preserve the source format unless `format` is set; we will set `format="webp"` explicitly for determinism.

### Data Changes
- Translation / i18n keys added: **None.** All `gallery.*` keys already exist in `es.ts`, `en.ts`, `zh.ts` and are reused unchanged.
- Schema / migration changes: **None.**
- Config changes: **None.** `astro.config.mjs` does not need an `image` block — Astro's defaults plus the existing `sharp` dependency are sufficient for local-asset optimization (the default service is sharp).
- Static assets added: **None new.** 20 existing files move from `public/gallery/Web*.webp` to `src/assets/gallery/Web*.webp` (the same file content; just relocated).
- New dependencies (with justification): **None.** `astro:assets` and the `<Image>` component ship with Astro; sharp is already in `package.json`.

## 3. Implementation Plan

### Affected Files (MUST BE COMPLETE)

**Files to Change:**

- `src/components/Gallery.astro` (Modify — frontmatter `images` constant + strip-item render block + lightbox client `<script>` `images` constant — replace plain `<img>` with `<Image>` from `astro:assets`, add `widths={[320, 640, 1024, 1600]}` and `sizes`, glob-import from `src/assets/gallery/`, use `getImage()` for lightbox URL resolution, and replace the duplicated client-side `images` array with a `JSON.parse(...)` read of a build-time-emitted `<script type="application/json" id="gallery-lb-data">`)

- `src/assets/gallery/Web2.webp` (Create — moved from `public/gallery/Web2.webp`)
- `src/assets/gallery/Web4.webp` (Create — moved from `public/gallery/Web4.webp`)
- `src/assets/gallery/Web5.webp` (Create — moved from `public/gallery/Web5.webp`)
- `src/assets/gallery/Web7.webp` (Create — moved from `public/gallery/Web7.webp`)
- `src/assets/gallery/Web9.webp` (Create — moved from `public/gallery/Web9.webp`)
- `src/assets/gallery/Web10.webp` (Create — moved from `public/gallery/Web10.webp`)
- `src/assets/gallery/Web12.webp` (Create — moved from `public/gallery/Web12.webp`)
- `src/assets/gallery/Web13.webp` (Create — moved from `public/gallery/Web13.webp`)
- `src/assets/gallery/Web17.webp` (Create — moved from `public/gallery/Web17.webp`)
- `src/assets/gallery/Web19.webp` (Create — moved from `public/gallery/Web19.webp`)
- `src/assets/gallery/Web20.webp` (Create — moved from `public/gallery/Web20.webp`)
- `src/assets/gallery/Web27.webp` (Create — moved from `public/gallery/Web27.webp`)
- `src/assets/gallery/Web28.webp` (Create — moved from `public/gallery/Web28.webp`)
- `src/assets/gallery/Web31.webp` (Create — moved from `public/gallery/Web31.webp`)
- `src/assets/gallery/Web34.webp` (Create — moved from `public/gallery/Web34.webp`)
- `src/assets/gallery/Web35.webp` (Create — moved from `public/gallery/Web35.webp`)
- `src/assets/gallery/Web38.webp` (Create — moved from `public/gallery/Web38.webp`)
- `src/assets/gallery/Web39.webp` (Create — moved from `public/gallery/Web39.webp`)
- `src/assets/gallery/Web42.webp` (Create — moved from `public/gallery/Web42.webp`)
- `src/assets/gallery/Web45.webp` (Create — moved from `public/gallery/Web45.webp`)

- `public/gallery/Web2.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web4.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web5.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web7.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web9.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web10.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web12.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web13.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web17.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web19.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web20.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web27.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web28.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web31.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web34.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web35.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web38.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web39.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web42.webp` (Delete — moved to `src/assets/gallery/`)
- `public/gallery/Web45.webp` (Delete — moved to `src/assets/gallery/`)

**Out of scope (do NOT touch):**
- The 25 unreferenced files in `public/gallery/` (Web1, Web3, Web6, Web8, Web11, Web14, Web15, Web16, Web18, Web21, Web22, Web23, Web24, Web25, Web26, Web29, Web30, Web32, Web33, Web36, Web37, Web40, Web41, Web43, Web44). These are orphans pre-dating this issue — cleanup is a separate concern.
- `astro.config.mjs` — no image-service config change needed.
- `i18n/*.ts` — no key changes.
- Any other component, page, or layout.

### Execution Steps

**Phase 1: Asset Relocation**
- [ ] Create directory `src/assets/gallery/` (Astro/Vite picks it up automatically; no config change required).
- [ ] Move (`git mv`) each of the 20 referenced files listed above from `public/gallery/` to `src/assets/gallery/`. Use `git mv` so history is preserved. Do NOT copy — leaving duplicates in `public/gallery/` would ship the originals unoptimized and double the deployed bytes.

**Phase 2: Component Migration (`src/components/Gallery.astro` frontmatter)**
- [ ] Add to frontmatter (top of the file, before `interface Props`):
  - `import { Image, getImage } from 'astro:assets';`
  - `const galleryAssets = import.meta.glob<{ default: ImageMetadata }>('/src/assets/gallery/*.webp', { eager: true });` and a helper `function asset(name: string): ImageMetadata { return galleryAssets[\`/src/assets/gallery/\${name}.webp\`].default; }` (or equivalent — the implementer chooses idiom; the constraint is a build-time eager glob, not dynamic).
- [ ] Replace the existing `images` constant (currently `[{ src: '/gallery/Web45.webp', alt: '…' }, …]`) with one keyed by filename stem and resolved through `asset()`:
  ```ts
  const images: { meta: ImageMetadata; alt: string }[] = [
    { meta: asset('Web45'), alt: 'Crystal clear river with Aconcagua in the background — the start of the approach' },
    { meta: asset('Web9'),  alt: 'Aconcagua from the Horcones valley — classic full mountain view' },
    // …preserve the existing 20 entries in the existing order with their existing alt text…
  ];
  ```
  Order MUST match the existing array exactly (Web45, Web9, Web39, Web10, Web7, Web38, Web34, Web35, Web31, Web2, Web4, Web13, Web42, Web28, Web17, Web5, Web27, Web12, Web20, Web19) so the lightbox indices remain stable for any user that has the page open across the deploy boundary.
- [ ] Compute lightbox data at build time:
  ```ts
  const lbData = await Promise.all(images.map(async ({ meta, alt }) => {
    const optimized = await getImage({ src: meta, width: 1600, format: 'webp' });
    return { src: optimized.src, alt };
  }));
  ```

**Phase 3: Component Migration (`src/components/Gallery.astro` template)**
- [ ] Replace the `<img>` inside `.strip-item` with `<Image>`:
  ```astro
  <Image
    src={img.meta}
    widths={[320, 640, 1024, 1600]}
    sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, 200px"
    alt={img.alt}
    format="webp"
    loading={i < 5 ? 'eager' : 'lazy'}
    decoding="async"
  />
  ```
  - The `widths` array is fixed by `issue_json` and MUST be `[320, 640, 1024, 1600]` exactly.
  - Keep the iteration variable name (`img`) consistent with the new `images` shape (`img.meta`, `img.alt`).
- [ ] Embed lightbox data immediately after the `<div id="gallery-lightbox">` block (or anywhere outside `<style>` and before the existing `<script>` block):
  ```astro
  <script type="application/json" id="gallery-lb-data" set:html={JSON.stringify(lbData)} />
  ```
  Use `set:html` with a server-side `JSON.stringify` rather than interpolation to avoid Astro escaping issues inside a `<script>` element.
- [ ] Inside the `<img id="lb-img">` element, leave `src=""` and `alt=""` placeholders as today — they are populated by the client script.

**Phase 4: Component Migration (`src/components/Gallery.astro` client script)**
- [ ] At the top of the existing `<script>` block (lines 355–458), replace the duplicated `const images = [...]` literal with:
  ```ts
  const dataNode = document.getElementById('gallery-lb-data') as HTMLScriptElement;
  const images = JSON.parse(dataNode.textContent ?? '[]') as { src: string; alt: string }[];
  ```
- [ ] Leave the rest of the script (`updateArrows`, `showImage`, `openLightbox`, `closeLightbox`, keyboard/touch handlers, `document.querySelectorAll('.strip-item')` wiring) unchanged in behavior. The `img.src` reads now point at Astro-optimized URLs (e.g., `/_astro/Web45.<hash>.webp?w=1600&...`) instead of `/gallery/Web45.webp`.

**Phase 5: Validation**
- [ ] Run the validation gate from Section 0: `npm run build`. Confirm zero errors and zero `@astrojs/check` warnings.
- [ ] Confirm `dist/_astro/` contains four-width variants for each of the 20 source images (manifest-style — exact filenames are hashed).
- [ ] Run the manual verification script (Section 5).

## 4. Automated Verification

### Verification Commands
```bash
# Authoritative gate — type-check (@astrojs/check) + Astro build + image optimization
npm run build

# Smoke-check the build output: every gallery image emitted multiple variants
ls dist/_astro/Web*.webp 2>/dev/null | wc -l   # expect: ≥ 80 (20 images × 4 widths, possibly + display fallback)

# Confirm no orphan public references remain in the built HTML for moved images
grep -RhoE '/gallery/Web(2|4|5|7|9|10|12|13|17|19|20|27|28|31|34|35|38|39|42|45)\.webp' dist/ 2>/dev/null | head
# expect: no matches (the 20 moved images should appear only as /_astro/<hashed>.webp URLs)
```

### Quality Gates
- [ ] `npm run build` exits 0 with zero errors / zero warnings.
- [ ] Each rendered strip `<img>` (the HTML emitted by `<Image>`) carries a `srcset` containing four `Xw` candidates whose widths are exactly 320, 640, 1024, 1600.
- [ ] Each rendered strip `<img>` carries the expected `sizes` attribute `(max-width: 480px) 140px, (max-width: 768px) 160px, 200px`.
- [ ] The lightbox `<img>`'s `src` (after a click) is an `/_astro/...` URL (Astro-pipeline-optimized), not `/gallery/...`.
- [ ] No new dependencies in `package.json`.
- [ ] No hardcoded hex colors introduced.
- [ ] No translation key changes (Spanish, English, Chinese unchanged).
- [ ] First five strip images have `loading="eager"`; the rest have `loading="lazy"` (parity with pre-migration behavior).

## 5. Manual Verification Script

**Pre-conditions:**
- [ ] `npm install` succeeds (no new deps; lockfile unchanged is fine).
- [ ] `npm run build && npm run preview` runs cleanly.

**Scenario A — Strip rendering and srcset (all three locales):**
1. [ ] In a fresh browser tab, visit `http://localhost:4321/` (Spanish), then `/en/`, then `/zh/`.
2. [ ] Scroll to `#galeria`. Confirm 20 thumbnail tiles render with no broken-image icons.
3. [ ] Open DevTools → Elements; pick any `.strip-item img`. Confirm:
   - The `srcset` attribute contains four entries with widths `320w`, `640w`, `1024w`, `1600w` (URLs end in `.webp`).
   - The `sizes` attribute equals `(max-width: 480px) 140px, (max-width: 768px) 160px, 200px`.
   - The `src` attribute is an `/_astro/...webp` URL, not `/gallery/...webp`.
4. [ ] Throttle to "Fast 3G" in DevTools → Network and reload. Confirm the strip thumbnails request the smaller variants (320w / 640w) for the visible thumbnails and not the 1600w variant.
5. [ ] Resize the viewport below 480px and reload. Confirm the browser picks the 320w (or 640w on DPR2) candidate.

**Scenario B — Lightbox:**
1. [ ] Click any strip thumbnail. The lightbox opens; the displayed image is sharp at full screen (served by the 1600w variant).
2. [ ] In DevTools → Network filter "Img", confirm the lightbox request URL is `/_astro/...webp` (not `/gallery/...webp`).
3. [ ] Use ← / → arrow keys, the prev/next buttons, and a touch swipe (in mobile emulation) to navigate. Each step shows the next image with no layout flash and the same `/_astro/...webp` pattern.
4. [ ] Press `Esc`. Lightbox closes; focus returns to the originating thumbnail.
5. [ ] Repeat steps 1–4 on `/en/` and `/zh/` to confirm locale-independence.

**Scenario C — Theme parity:**
1. [ ] Toggle dark ↔ light theme via the existing ThemeToggle. The gallery section should look identical to pre-migration in both themes (no layout shift, identical strip-item dimensions).

**Scenario D — Build artifacts:**
1. [ ] Inspect `dist/_astro/`. Confirm multiple hashed `.webp` variants per source image (sharp output).
2. [ ] Confirm `dist/gallery/` does NOT contain the 20 moved files (it may still contain the 25 unreferenced orphans — that is intentional out-of-scope).

**Success Criteria:**
- ✅ Every rendered strip thumbnail has a `srcset` with widths exactly `320, 640, 1024, 1600`.
- ✅ Every gallery image (strip + lightbox) is served from `/_astro/...webp` (Astro pipeline output), confirming `<Image>` is in use rather than the previous plain `<img>`.
- ✅ `npm run build` passes with zero errors / zero warnings.
- ✅ Lightbox open / close / nav / keyboard / touch behave identically to pre-migration.
- ✅ All three locales render and function identically.

## 6. Coverage Requirements

- [ ] **No automated test suite exists in this repo (per `docs/PROJECT.md`).** The manual verification script in Section 5 IS the coverage for this change.
- [ ] **Edge cases to consider:**
  - Browser without DPR information (very old) — should still pick a candidate from `srcset` based on `sizes`.
  - Slow network — lazy-loaded thumbnails (index ≥ 5) should not block first paint.
  - Very narrow viewports (<480px) — 140px strip-item should pull the 320w variant; lightbox must still display correctly within `min(90vw, 860px)`.
  - User opens the page across a deploy boundary while the lightbox is open — lightbox indices remain stable because the `images` order is preserved.
  - 25 orphan files left in `public/gallery/` — out of scope for this issue; do not let their continued presence cause confusion (they are not referenced anywhere in source).

## 7. Acceptance Criteria (Definition of Done)

- [ ] All five execution phases completed.
- [ ] `npm run build` passes with zero errors and zero `@astrojs/check` warnings.
- [ ] Manual verification script (Sections A–D) completed in Spanish, English, and Chinese locales.
- [ ] Strip `<img>` elements emitted by `<Image>` carry a `srcset` with widths exactly `320, 640, 1024, 1600` and the documented `sizes` attribute.
- [ ] Lightbox image URLs are Astro-pipeline-optimized (`/_astro/...webp`), not raw `/gallery/...webp`.
- [ ] No new dependencies. No translation key changes. No new routes. No CSS-token violations.
- [ ] All 20 moved files are removed from `public/gallery/` and present in `src/assets/gallery/` (verified with `git status` showing 20 renames).
- [ ] Every requirement in `issue_json` ("migrate to `<Image>`" + "responsive srcset with widths 320, 640, 1024, 1600") is mapped to concrete steps in Phases 2–4.
