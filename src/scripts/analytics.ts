/**
 * Analytics & Event Tracking for aconcagua.co
 *
 * GA4 Measurement ID:  G-6ZXZ206Z8T
 * Clarity Project ID:  CLARITY_ID (replace when available)
 */

// ---------------------------------------------------------------------------
// 1. GA4 (gtag.js)
// ---------------------------------------------------------------------------
const GA_ID = 'G-6ZXZ206Z8T';

const gtagScript = document.createElement('script');
gtagScript.async = true;
gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
document.head.appendChild(gtagScript);

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

window.dataLayer = window.dataLayer || [];
window.gtag = function gtag(...args: unknown[]) {
  window.dataLayer.push(args);
};
window.gtag('js', new Date());
window.gtag('config', GA_ID);

/** Helper — fire a GA4 event */
function trackEvent(name: string, params: Record<string, string | number | boolean> = {}) {
  window.gtag('event', name, params);
}

// ---------------------------------------------------------------------------
// 2. Microsoft Clarity
// ---------------------------------------------------------------------------
const CLARITY_ID = 'CLARITY_ID'; // REPLACE_ME with Julian's Clarity Project ID

(function (c: Window, l: Document, a: string, r: string, i: string) {
  (c as any)[a] =
    (c as any)[a] ||
    function (...args: unknown[]) {
      ((c as any)[a].q = (c as any)[a].q || []).push(args);
    };
  const t = l.createElement('script') as HTMLScriptElement;
  t.async = true;
  t.src = 'https://www.clarity.ms/tag/' + i;
  const s = l.getElementsByTagName('script')[0];
  s.parentNode?.insertBefore(t, s);
})(window, document, 'clarity', 'script', CLARITY_ID);

// ---------------------------------------------------------------------------
// 3. Page-level metadata
// ---------------------------------------------------------------------------
const pageLang = document.documentElement.lang || 'es';
trackEvent('page_metadata', {
  language: pageLang,
  page_path: window.location.pathname,
});

// ---------------------------------------------------------------------------
// 4. CTA click tracking
// ---------------------------------------------------------------------------

// 4a. Calendly buttons (Hero, Nav, CTA section, Pricing cards)
document.querySelectorAll<HTMLButtonElement>('button[onclick*="Calendly"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    // Determine which CTA location based on closest section/component
    let location = 'unknown';
    if (btn.closest('.hero')) location = 'hero';
    else if (btn.closest('.nav, .nav-overlay')) location = 'nav';
    else if (btn.closest('.cta-section')) location = 'cta_section';
    else if (btn.closest('.pricing-card')) {
      location = 'pricing';
      const cardName = btn.closest('.pricing-card')?.querySelector('.pricing-name')?.textContent?.trim() || '';
      trackEvent('calendly_open', {
        location,
        pricing_tier: cardName,
        language: pageLang,
      });
      return;
    }

    trackEvent('calendly_open', {
      location,
      language: pageLang,
    });
  });
});

// 4b. "View expeditions" secondary CTA in Hero
document.querySelectorAll<HTMLAnchorElement>('a.hero-btn-secondary').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('cta_click', {
      type: 'view_expeditions',
      location: 'hero',
      language: pageLang,
    });
  });
});

// ---------------------------------------------------------------------------
// 5. WhatsApp click tracking
// ---------------------------------------------------------------------------
document.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]').forEach((link) => {
  link.addEventListener('click', () => {
    let location = 'unknown';
    if (link.closest('.cta-section')) location = 'cta_section';
    else if (link.closest('.footer')) location = 'footer';

    trackEvent('whatsapp_click', {
      location,
      language: pageLang,
    });
  });
});

// ---------------------------------------------------------------------------
// 6. Email link tracking
// ---------------------------------------------------------------------------
document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]').forEach((link) => {
  link.addEventListener('click', () => {
    let location = 'unknown';
    if (link.closest('.cta-section')) location = 'cta_section';
    else if (link.closest('.footer')) location = 'footer';

    trackEvent('email_click', {
      location,
      language: pageLang,
    });
  });
});

// ---------------------------------------------------------------------------
// 7. Social media outbound link tracking
// ---------------------------------------------------------------------------
document.querySelectorAll<HTMLAnchorElement>('.social-card, .social-icon, .social-icon-small').forEach((link) => {
  link.addEventListener('click', () => {
    const platform = link.getAttribute('aria-label') || link.textContent?.trim() || 'unknown';
    let location = 'unknown';
    if (link.closest('.social-section')) location = 'social_section';
    else if (link.closest('.footer-main')) location = 'footer';
    else if (link.closest('.footer-bottom')) location = 'footer_bottom';

    trackEvent('social_click', {
      platform,
      location,
      language: pageLang,
    });
  });
});

// ---------------------------------------------------------------------------
// 8. Partner link tracking
// ---------------------------------------------------------------------------
document.querySelectorAll<HTMLAnchorElement>('.partner-card').forEach((link) => {
  link.addEventListener('click', () => {
    const partnerName = link.querySelector('.partner-name')?.textContent?.trim() || 'unknown';
    trackEvent('partner_click', {
      partner: partnerName,
      language: pageLang,
    });
  });
});

// ---------------------------------------------------------------------------
// 9. Language switcher tracking
// ---------------------------------------------------------------------------
document.querySelectorAll<HTMLAnchorElement>('.lang-link').forEach((link) => {
  link.addEventListener('click', () => {
    const targetLang = link.getAttribute('hreflang') || link.textContent?.trim() || 'unknown';
    trackEvent('language_switch', {
      from_language: pageLang,
      to_language: targetLang,
    });
  });
});

// ---------------------------------------------------------------------------
// 10. Navigation anchor tracking
// ---------------------------------------------------------------------------
document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"], .overlay-nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    const section = link.getAttribute('href') || 'unknown';
    const isMobile = link.classList.contains('overlay-nav-link');
    trackEvent('nav_click', {
      section,
      device_type: isMobile ? 'mobile' : 'desktop',
      language: pageLang,
    });
  });
});

// ---------------------------------------------------------------------------
// 11. Scroll depth tracking (25%, 50%, 75%, 100%)
// ---------------------------------------------------------------------------
const scrollThresholds = [25, 50, 75, 100];
const firedThresholds = new Set<number>();

window.addEventListener(
  'scroll',
  () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

    for (const threshold of scrollThresholds) {
      if (scrollPercent >= threshold && !firedThresholds.has(threshold)) {
        firedThresholds.add(threshold);
        trackEvent('scroll_depth', {
          depth: threshold,
          language: pageLang,
        });
      }
    }
  },
  { passive: true },
);

// ---------------------------------------------------------------------------
// 12. Section visibility tracking (which sections are actually seen)
// ---------------------------------------------------------------------------
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id || entry.target.getAttribute('aria-label') || 'unknown';
        trackEvent('section_view', {
          section: sectionId,
          language: pageLang,
        });
        sectionObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 },
);

document.querySelectorAll('section[id], section[aria-label]').forEach((section) => {
  sectionObserver.observe(section);
});

// ---------------------------------------------------------------------------
// 13. Calendly event completion tracking
// ---------------------------------------------------------------------------
function isCalendlyEvent(e: MessageEvent): boolean {
  return (
    typeof e.data === 'object' &&
    e.data !== null &&
    'event' in e.data &&
    typeof e.data.event === 'string' &&
    e.data.event.startsWith('calendly')
  );
}

window.addEventListener('message', (e: MessageEvent) => {
  if (!isCalendlyEvent(e)) return;

  if (e.data.event === 'calendly.event_scheduled') {
    trackEvent('calendly_booking_complete', {
      language: pageLang,
    });
  }
});
