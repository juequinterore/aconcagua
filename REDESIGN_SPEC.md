# Aconcagua.co — Redesign Specification & Task List
**Última actualización:** Febrero 2026
**Plataforma:** Squarespace 7.1 (Fluid Engine)
**Site:** walrus-flounder-4hld.squarespace.com → aconcagua.co

---

## Paleta de colores objetivo

| Token | Hex | Uso |
|-------|-----|-----|
| `--jk-dark` | `#0f1923` | Hero, footer, nav, stats bar, darkest sections |
| `--jk-primary` | `#1a3a4a` | Dark sections, CTA section |
| `--jk-accent` | `#c88a3e` | Botones, highlights, números stats, h2 en secciones oscuras |
| `--jk-light` | `#f7f5f2` | Fondo cálido (about, contact) |
| `--jk-alt` | `#eae6e1` | Fondo alternado (equipment, social) |

**Tipografía:**
- Headings: `Playfair Display` (weight 600-700)
- Body/nav/UI: `Inter` (weight 300-600)

---

## Estado actual vs. objetivo

### Lo que YA está implementado ✅
- Fonts: Playfair Display (headings) + Inter (body)
- Nav oscuro con efecto blur (`rgba(15,25,35,0.96)`)
- Nav links en uppercase Inter con color accent hover
- Custom CSS inyectado via Code Injection (header)
- Color themes por sección (lightest/light/dark/darkest)
- Hero con foto de fondo y texto básico

### Lo que FALTA o está MAL ❌

| # | Problema | Severidad | Sección afectada |
|---|----------|-----------|-----------------|
| 1 | Sin CTA buttons en el hero | CRÍTICO | Hero |
| 2 | Sin tag/badge sobre el título del hero | MAYOR | Hero |
| 3 | Stats bar completamente ausente | CRÍTICO | Entre Hero y About |
| 4 | About tiene grid de fotos en lugar de portrait único + timeline | MAYOR | About |
| 5 | Pricing cards son texto plano sin estructura visual de cards | CRÍTICO | Pricing |
| 6 | Pricing no tiene features list con checkmarks por tier | CRÍTICO | Pricing |
| 7 | Pricing no tiene CTA button en cada card | CRÍTICO | Pricing |
| 8 | Pricing no tiene featured card destacada ("Más Popular") | MAYOR | Pricing |
| 9 | Testimonios completamente ausentes | CRÍTICO | Faltante |
| 10 | Sección CTA divide Calendly en embed (no popup) + email form por separado | MAYOR | CTA/Contacto |
| 11 | Global Rescue ocupa sección enorme como banner publicitario | MAYOR | Partners |
| 12 | Equipment (Piré) ocupa sección enorme como banner publicitario | MAYOR | Partners |
| 13 | Sección Social muestra QR codes en lugar de cards clicables | CRÍTICO | Social |
| 14 | Footer tiene placeholder data: correo@ejemplo.com, (555) 555-5555 | CRÍTICO | Footer |
| 15 | Footer no tiene estructura multi-columna con navegación | MAYOR | Footer |
| 16 | Sin nota de disclaimer de precios bien formateada | MENOR | Pricing |
| 17 | Mobile: pricing cards se amontonan sin orden correcto | CRÍTICO | Pricing (mobile) |
| 18 | Mobile: Calendly iframe no se adapta | MAYOR | CTA (mobile) |
| 19 | Mobile: sin hamburger menu visible con buen contraste | MAYOR | Nav (mobile) |
| 20 | Padding vertical inconsistente en varias secciones | MAYOR | Global |

---

## Orden de implementación por secciones (top → bottom)

---

### SECCIÓN 1: HERO — Agregar tag + dos botones CTA

**Estado actual:** Solo tiene imagen de fondo, título y subtítulo. Sin botones.

**Objetivo:**
```
[GUÍA DE MONTAÑA CERTIFICADO]    ← gold tag/badge
Tu cumbre comienza aquí          ← Playfair Display, grande
17 cumbres exitosas y más de 10 años...  ← subtítulo Inter
[Reservá tu Asesoría →]  [Ver Expediciones]  ← botones
```

**Implementación en Squarespace:**
1. Abrir el editor de la página de inicio
2. En el hero section, agregar un bloque de texto encima del H1 existente con el texto "GUÍA DE MONTAÑA CERTIFICADO" — darle estilo en la CSS como tag dorado
3. Agregar 2 Button blocks debajo del subtítulo:
   - Botón 1: "Reservá tu Asesoría" → link a la sección de Calendly → estilo Primary (dorado)
   - Botón 2: "Ver Expediciones" → link a la sección de pricing → estilo Secondary (outline blanco)
4. En la CSS, agregar estilos para los botones en el hero:

```css
/* Hero tag badge */
.mock-hero-tag, .hero-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #c88a3e;
  margin-bottom: 24px;
}

/* Hero section button layout */
[data-section-theme="darkest"] .sqs-block-button-element--primary {
  background: #c88a3e !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 14px 32px !important;
  font-size: 1rem !important;
}

[data-section-theme="darkest"] .sqs-block-button-element--secondary {
  background: transparent !important;
  border: 1px solid rgba(255,255,255,0.4) !important;
  color: #fff !important;
  border-radius: 8px !important;
}
```

**Notas:**
- El hero section ya tiene el fondo oscuro (darkest theme)
- El texto del tag puede ser un Paragraph block con la CSS aplicada via class o selector posicional

---

### SECCIÓN 2: STATS BAR — Crear nueva sección debajo del hero

**Estado actual:** No existe. Las estadísticas están enterradas en el texto del bio.

**Objetivo:** Barra oscura horizontal con 4 columnas:
```
      17            |    10+      |    20K+     |    2026
 Cumbres Exitosas   | Años de Exp | Seguidores  | Temporada
```

**Implementación en Squarespace:**
1. Agregar una nueva sección DEBAJO del hero, ANTES de "¿Quién es Julian Kusi?"
2. Ponerle color theme: **Darkest 1** (`#0f1923`)
3. Usar un layout de 4 columnas con Column Blocks
4. En cada columna:
   - Texto grande (H2 o styled para verse grande): el número con color dorado
   - Texto pequeño (P): la etiqueta en uppercase
5. Poner separadores verticales sutiles entre columnas via CSS

```css
/* Stats bar styling */
[data-section-theme="darkest"] .stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(200,138,62,0.15);
  border-bottom: 1px solid rgba(200,138,62,0.15);
}

/* Stats numbers - dorado y grande */
[data-section-theme="darkest"] h2 {
  font-family: 'Playfair Display', serif !important;
  color: #c88a3e !important;
  font-size: clamp(1.75rem, 3vw, 2.5rem) !important;
  line-height: 1 !important;
  margin-bottom: 8px !important;
}

/* Stats labels */
[data-section-theme="darkest"] p {
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.12em !important;
  color: rgba(255,255,255,0.5) !important;
  font-weight: 500 !important;
}
```

**Contenido de los 4 stats:**
- `17` / Cumbres Exitosas
- `10+` / Años de Experiencia
- `20K+` / Seguidores
- `2026` / Temporada Activa

---

### SECCIÓN 3: ABOUT — Restructurar a 2 columnas con timeline

**Estado actual:** Grid de múltiples fotos (parece Instagram dump) + texto.

**Objetivo:** Layout 2 columnas:
- Columna izquierda: UNA foto grande portrait (aspect ratio 3:4), bordes redondeados, sombra
- Columna derecha: Tag "Sobre Julian Kusi" + H2 + párrafo bio + timeline horizontal de 4 hitos

**Timeline de la columna derecha:**
```
2013 | 2016 | 2018 | 2024
Cocinero | Porteador | Guía | 17 Cumbres
Campamentos | Carga y logística | Certificación | Elite
```

**Implementación:**
1. Editar la sección "¿Quién es Julian Kusi?"
2. Eliminar el grid de fotos múltiples → dejar una sola foto vertical/portrait
3. Ajustar el layout a 2 columnas (Image block + Text blocks)
4. El texto debe incluir:
   - Tag: "SOBRE JULIAN KUSI" (uppercase, gold, pequeño)
   - H2: "De la cocina a la cumbre del Aconcagua"
   - Párrafo bio condensado
   - 4 columnas de timeline con año, rol y descripción

```css
/* About section layout */
[data-section-theme="lightest"] .about-photo img {
  border-radius: 16px !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important;
  aspect-ratio: 3/4 !important;
  object-fit: cover !important;
}

/* About section tag */
[data-section-theme="lightest"] .about-tag {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.15em !important;
  color: #c88a3e !important;
  margin-bottom: 16px !important;
  display: block !important;
}
```

---

### SECCIÓN 4: PRICING — Reconstruir como cards visuales

**Estado actual:** Tres bloques de texto plano apilados sin estructura visual de cards. Crítico.

**Objetivo:** 3 columnas de pricing cards con:
- Borde, fondo blanco, sombra suave
- Nombre del tier + descripción + precio grande
- Lista de features con checkmarks ✓
- Botón CTA en cada card
- Card central ("Expedición Full") destacada con borde dorado + badge "Más Popular" + escala ligeramente mayor

**Los 3 tiers** (basado en contenido actual del site):

**Tier 1: Autónomo** (Desde USD 2,000)
- Permiso de acceso al Parque Aconcagua
- Seguro de evacuación en helicóptero
- Plan de aclimatación personalizado (asesoría)
- Recomendaciones de equipo y logística
- Soporte por WhatsApp pre-expedición
→ Button: "Consultar Disponibilidad" (outline)

**Tier 2: Asistencia Logística** — FEATURED (Desde USD 3,500)
- Todo lo del plan Autónomo
- Logística completa hasta campo base
- Traslados coordinados desde Mendoza
- Equipamiento de campamento incluido
- Asesoría técnica de equipo (Piré Aconcagua)
- Soporte Global Rescue Partner
→ Button: "Reservar Expedición" (gold primary) + Badge: "Más Popular"

**Tier 3: Expedición Full** (Desde USD 7,000)
- Todo lo del plan Logística
- Guía personal exclusivo durante toda la expedición
- Alimentación en campamentos
- Itinerario flexible personalizado
- Soporte 24/7 pre y post expedición
→ Button: "Consultar Disponibilidad" (outline)

**Nota de precios** (texto pequeño debajo de los cards):
> *Los precios son estimativos. El costo final se confirma cuando el Parque publica los permisos oficiales (habitualmente octubre) y los operadores actualizan sus tarifas de temporada.*

**CSS para pricing cards:**
```css
/* Pricing section - card layout */
.pricing-cards-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  align-items: start;
}

/* Base card styling */
.pricing-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

/* Featured card */
.pricing-card.featured {
  border: 2px solid #c88a3e;
  transform: scale(1.04);
  box-shadow: 0 16px 48px rgba(200,138,62,0.15);
  position: relative;
  z-index: 2;
}

/* "Más Popular" badge */
.pricing-badge {
  background: #c88a3e;
  color: #fff;
  text-align: center;
  padding: 6px 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Precio grande */
.pricing-value {
  font-family: 'Playfair Display', serif !important;
  font-size: 3rem !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  color: #1a1a1a !important;
}

.pricing-card.featured .pricing-value {
  color: #c88a3e !important;
}

/* Feature checkmark list */
.pricing-features li::before {
  content: '✓';
  color: #2d6a4f;
  font-weight: 700;
  margin-right: 10px;
}

.pricing-card.featured .pricing-features li::before {
  color: #c88a3e;
}

/* Pricing CTA buttons */
.pricing-btn-primary {
  background: #c88a3e !important;
  color: #fff !important;
  width: 100%;
  display: block;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}

.pricing-btn-outline {
  background: transparent !important;
  border: 2px solid #d0d8dc !important;
  color: #1a3a4a !important;
  width: 100%;
  display: block;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}

/* Mobile: stack cards, featured first */
@media (max-width: 768px) {
  .pricing-cards-wrapper {
    grid-template-columns: 1fr;
    max-width: 440px;
  }
  .pricing-card.featured {
    transform: none;
    order: -1;
  }
}
```

**Implementación Squarespace:**
- Dado que Squarespace no tiene un "Pricing block" nativo para esto, usar el **Code Block** con HTML embebido para las 3 cards, o usar **Summary Blocks** si hay productos creados.
- Alternativa: usar el Code Injection para inyectar el HTML completo de la sección pricing como bloque embebido.

---

### SECCIÓN 5: TESTIMONIOS — Crear sección nueva

**Estado actual:** No existe. Es la ausencia más grave para un servicio de $2,000-$7,000.

**Objetivo:** Sección con fondo `#eae6e1` (alt-bg / Light 2), 3 cards de testimonios en columnas.

**Contenido de testimonios** (placeholder hasta tener reales de clientes):

> **Marco Rossi** — Italia ⭐⭐⭐⭐⭐
> "Julian no solo es un guía increíblemente experimentado, sino que su pasión por la montaña es contagiosa. Gracias a su plan de aclimatación llegué a la cumbre sintiéndome fuerte."

> **Sarah Kim** — Corea del Sur ⭐⭐⭐⭐⭐
> "La seguridad siempre fue prioridad. En un momento difícil del ascenso, Julian tomó la decisión correcta. Esa experiencia es lo que marca la diferencia."

> **James Walsh** — Estados Unidos ⭐⭐⭐⭐⭐
> "Contraté el plan completo y valió cada centavo. La logística impecable y la atención personalizada fueron de otro nivel. El mejor guía del Aconcagua."

**Implementación:**
1. Agregar nueva sección entre Pricing y CTA
2. Asignar color theme: **Light 2** (fondo `#eae6e1`)
3. Layout 3 columnas con Quote Blocks o Text blocks estilizados
4. Cada card: estrellas (★★★★★ en dorado) + cita en itálica + nombre + origen

```css
/* Testimonial cards */
[data-section-theme="light"] .testimonial-card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.testimonial-stars {
  color: #c88a3e;
  letter-spacing: 2px;
  font-size: 1rem;
  margin-bottom: 16px;
}

.testimonial-quote {
  font-style: italic;
  line-height: 1.8;
  color: #444;
  margin-bottom: 20px;
}

.testimonial-author-name {
  font-weight: 600;
  color: #1a1a1a;
}

.testimonial-author-origin {
  font-size: 0.8125rem;
  color: #5a6a72;
}
```

---

### SECCIÓN 6: CTA CONSULTATION — Unificar en un solo punto de conversión

**Estado actual:** Calendly embed (grande, roto en mobile) + sección de email form separada abajo.

**Objetivo:** UNA sección CTA dark con:
- Headline convincente: "Planificá tu Expedición con una Asesoría Gratuita"
- 3 bullet features: Sin compromiso / 30 minutos por video / Plan personalizado
- UN solo botón grande: "Agendar Asesoría en Calendly" → abre Calendly en nueva tab (no embed)
- Texto secundario: "O escribinos a **julian@aconcagua.co**"
- Eliminar el embed de Calendly (reemplazar por botón externo)
- Mantener el form de email SOLO como opción secundaria visible más abajo

**Implementación:**
1. Editar la sección "Despejá tus dudas en 30 minutos"
2. Reemplazar el iframe embed de Calendly con un Button block que enlace a la URL de Calendly directamente (nueva tab)
3. Eliminar la sección separada de "¿Prefieres escribirme un correo?" o fusionarla como texto secundario
4. La sección contacto (form) puede quedar como respaldo, pero no competir como alternativa principal

---

### SECCIÓN 7: PARTNERS STRIP — Reducir a franja compacta

**Estado actual:** Global Rescue y Piré/Equipment cada uno ocupa secciones enormes con foto de fondo, headline grande, lista de bullets y botón — se ven como banners publicitarios.

**Objetivo:** Franja compacta de ~80-100px de alto con logos lado a lado:
```
PARTNERS DE CONFIANZA   [GR] Global Rescue    |    [PA] Piré Aconcagua
                        Evacuación médica mundial | Operador logístico oficial
```

**Implementación:**
1. Reducir ambas secciones a una sola franja horizontal blanca
2. Logo pequeño (48x48px) + nombre en bold + descripción en 1 línea
3. Separador vertical entre partners
4. NO más de 2-3 líneas de texto por partner
5. Eliminar las fotos de fondo y los bullets extensos

```css
/* Partners strip */
.partners-strip {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  padding: 40px 0;
}

.partners-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #5a6a72;
}

.partner-logo-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
}

.partner-logo-gr { background: #0b3d2e; color: #4ade80; }
.partner-logo-pa { background: linear-gradient(135deg, #2a5a6a, #4a8a9a); color: #fff; }
```

---

### SECCIÓN 8: SOCIAL — Reemplazar QR codes con cards clicables

**Estado actual:** Muestra un thumbnail de YouTube y un código QR de Instagram. Los QR son para medios impresos, no para sitios web.

**Objetivo:** 3 cards limpias (YouTube, Instagram, TikTok) con:
- Ícono de plataforma (fondo de color de la plataforma)
- Nombre de la plataforma
- Conteo de seguidores
- Botón "Seguir" / "Suscribirse" que enlaza directamente al perfil

**Contenido:**
- **YouTube**: 10,000+ suscriptores → `youtube.com/@julian_kusi` → "Suscribirse"
- **Instagram**: 8,000+ seguidores → `instagram.com/julian_kusi` → "Seguir"
- **TikTok**: 2,000+ seguidores → `tiktok.com/@julian_kusi` → "Seguir"

**Implementación:**
1. Eliminar el thumbnail de YouTube y los QR codes
2. Reemplazar con 3 Button blocks (uno por plataforma) o un Code Block con las 3 cards
3. Los links deben abrir en nueva tab

```css
/* Social cards */
.social-card {
  background: #fff;
  border-radius: 12px;
  padding: 28px 36px;
  border: 1px solid #e8e8e8;
  text-align: center;
  min-width: 180px;
}

.social-icon-youtube { background: #FF0000; border-radius: 12px; }
.social-icon-instagram {
  background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  border-radius: 12px;
}
.social-icon-tiktok { background: #010101; border-radius: 12px; }

.social-follow-btn {
  display: inline-block;
  border: 1px solid #c88a3e;
  color: #c88a3e;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.social-follow-btn:hover {
  background: #c88a3e;
  color: #fff;
}
```

---

### SECCIÓN 9: FOOTER — Actualizar datos y estructura

**Estado actual:** Datos de placeholder: "correo@ejemplo.com" y "(555) 555-5555". Layout básico sin navegación.

**Objetivo:** Footer oscuro (`#0f1923`) con estructura de 4 columnas:
1. **Brand**: Logo + tagline + breve descripción
2. **Navegación**: Links rápidos (Inicio, Sobre Mí, Expediciones, Testimonios, Contacto)
3. **Expediciones**: Links por tier (Autónomo, Asistencia Logística, Expedición Full)
4. **Contacto**: Email real + WhatsApp + Mendoza, Argentina + iconos sociales

**Datos reales a actualizar:**
- Email: `julian@aconcagua.co` (reemplazar correo@ejemplo.com)
- Teléfono: número real de WhatsApp (reemplazar (555) 555-5555)
- Ubicación: Mendoza, Argentina
- Copyright: © 2026 Aconcagua.co — Julian Kusi

**Dónde actualizar en Squarespace:** Settings > Business Information > Contact Information

---

## CSS Consolidado a Agregar al Code Injection

El CSS actual en Code Injection (Header) tiene 4051 chars. Necesita las siguientes adiciones:

```css
/* ===== PRICING CARDS ===== */
/* Squarespace pricing block custom styling */
.sqs-block-summary-v2 .summary-item {
  background: #fff !important;
  border-radius: 16px !important;
  border: 1px solid #e8e8e8 !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
  overflow: hidden !important;
  transition: transform 0.3s, box-shadow 0.3s !important;
}

/* ===== SECTION PADDING ===== */
.page-section {
  padding: 100px 0 !important;
}

/* Stats bar section - tighter padding */
.page-section.stats-section {
  padding: 0 !important;
}

/* ===== TESTIMONIALS ===== */
blockquote {
  border-left: 4px solid #c88a3e !important;
  padding-left: 1.5rem !important;
  font-family: 'Playfair Display', serif !important;
  font-style: italic !important;
  color: #444 !important;
  margin: 1rem 0 !important;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 768px) {
  /* Stack pricing columns */
  .sqs-col-4 {
    width: 100% !important;
    margin-bottom: 24px !important;
  }

  /* Reduce section padding on mobile */
  .page-section {
    padding: 60px 0 !important;
  }

  /* Hero buttons stack */
  [data-section-theme="darkest"] .sqs-block-button-container {
    flex-direction: column !important;
    align-items: center !important;
    gap: 12px !important;
  }

  /* Stats grid: 2 columns on mobile */
  [data-section-theme="darkest"] .sqs-layout .sqs-col-3 {
    width: 50% !important;
    float: left !important;
  }

  /* Reduce heading sizes on mobile */
  h1 { font-size: clamp(2rem, 8vw, 4.5rem) !important; }
  h2 { font-size: clamp(1.5rem, 5vw, 2.5rem) !important; }

  /* Partner strip: stack vertically */
  .partners-strip .sqs-col-4 {
    width: 100% !important;
    text-align: center !important;
    padding: 12px 0 !important;
  }
}

@media (max-width: 480px) {
  .page-section { padding: 48px 0 !important; }

  /* Social cards: single column */
  .social-cards-grid {
    flex-direction: column !important;
    align-items: center !important;
  }
}

/* ===== BUTTON STYLES ACROSS SECTIONS ===== */
/* All primary buttons */
.sqs-block-button-element--primary {
  background: #c88a3e !important;
  border-color: #c88a3e !important;
  color: #fff !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
  border-radius: 8px !important;
  transition: background 0.25s, transform 0.25s !important;
}

.sqs-block-button-element--primary:hover {
  background: #a06f2f !important;
  transform: translateY(-2px) !important;
}

/* All secondary/outline buttons */
.sqs-block-button-element--secondary {
  background: transparent !important;
  border: 1px solid rgba(255,255,255,0.4) !important;
  color: #fff !important;
  border-radius: 8px !important;
}

/* Secondary on light sections */
[data-section-theme="lightest"] .sqs-block-button-element--secondary,
[data-section-theme="light"] .sqs-block-button-element--secondary {
  border-color: #c88a3e !important;
  color: #c88a3e !important;
}

/* ===== FOOTER ===== */
footer.Footer, .footer-sections {
  background: #0f1923 !important;
}

footer .footer-title {
  font-family: 'Playfair Display', serif !important;
  color: #c88a3e !important;
  font-size: 1.5rem !important;
}

footer p, footer a, footer li {
  color: rgba(255,255,255,0.6) !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.875rem !important;
}

footer a:hover { color: #c88a3e !important; }

footer h2, footer h3, footer h4 {
  color: #fff !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  font-weight: 600 !important;
}
```

---

## Orden de prioridad de implementación

### Fase 1: CRÍTICO (hacer primero — máximo impacto visual + conversión)
1. **Footer**: Actualizar datos placeholder en Settings > Business Information
2. **Social section**: Eliminar QR codes, agregar 3 social cards clicables con links reales
3. **Pricing**: Reconstruir con estructura de cards visuales + features list + CTA buttons
4. **Hero**: Agregar tag + 2 botones CTA

### Fase 2: IMPORTANTE (alto impacto en conversión)
5. **Stats bar**: Agregar sección nueva debajo del hero con los 4 números
6. **Testimonios**: Agregar sección nueva con 3 testimonios (placeholder hasta tener reales)
7. **CTA section**: Unificar Calendly + email, reemplazar embed con botón externo

### Fase 3: REFINAMIENTO (mejor experiencia)
8. **About section**: Restructurar a single portrait + timeline
9. **Partners**: Reducir Global Rescue y Piré a franja compacta
10. **CSS global**: Actualizar Code Injection con CSS consolidado de responsive + spacing

### Fase 4: MOBILE QA
11. Verificar hero en móvil (375px)
12. Verificar pricing cards en móvil (stack correcto, featured primero)
13. Verificar stats bar en móvil (2x2 grid)
14. Verificar nav hamburger funcional y visible
15. Verificar CTA section en móvil (botón Calendly externo, no embed)

---

## Checklist de validación final

- [ ] Hero: Tag dorado + título + subtítulo + 2 botones funcionales
- [ ] Stats bar: 4 números en fondo oscuro, dorado, legibles
- [ ] About: Una foto portrait + bio + timeline de 4 hitos
- [ ] Pricing: 3 cards bien diferenciadas, featured highlighted, CTAs funcionando
- [ ] Testimonios: 3 cards con estrellas, citas y autores
- [ ] CTA: Un solo punto de conversión, Calendly en botón externo
- [ ] Partners: Franja compacta, NO secciones enormes tipo banner
- [ ] Social: 3 cards con links reales, SIN QR codes
- [ ] Footer: Datos reales (email, tel, ubicación), estructura 4 columnas
- [ ] Mobile 375px: Todo funcional, sin overflow horizontal
- [ ] Mobile 768px: Pricing en 1 col, stats en 2x2, nav hamburger
- [ ] Desktop: Pricing en 3 cols, stats en 4, footer en 4 cols
- [ ] Botones: Todos gold primary / outline correctamente aplicados
- [ ] Colores: Alternancia correcta de temas por sección
- [ ] Fonts: Playfair Display en headings, Inter en body, en todas las secciones

---

## Notas técnicas Squarespace 7.1

- **Code Injection** (header): CSS global + fonts Google
- **Code Injection** (footer): No usar para CSS — solo scripts JS si se necesitan
- **Code Blocks**: Para HTML personalizado dentro de secciones (pricing cards, social cards)
- **Section color themes**: Se setean en el editor vía hover → "Open Section Settings" → Colors tab
- **Column layouts**: Via el Fluid Engine drag-and-drop del editor de página
- **Calendly**: Cambiar de embed iframe a link externo que abra en nueva tab
- **Mobile preview**: Disponible en el editor con el botón de viewport toggle
- **Image aspect ratio**: Controlable en Image Block settings o via CSS `aspect-ratio`

---

*Documento generado: 2026-02-24*
*Próxima revisión: después de implementar Fase 1*
