/**
 * Analytics & Event Tracking for aconcagua.co
 *
 * GA4 Measurement ID: G-6ZXZ206Z8T
 * GA4 + Clarity are loaded dynamically via cookie consent in BaseLayout.astro.
 * This file handles event tracking only — all calls are gated behind consent.
 */

// Initialize tracking once consent is granted — either at page load
// (return visit) or via the cookie:consent-granted event (first visit).
let trackingInitialized = false;

function initTracking() {
  if (trackingInitialized) return;
  trackingInitialized = true;
  setupTracking();
}

if (localStorage.getItem('cookie_consent') === 'granted') {
  initTracking();
} else {
  document.addEventListener('cookie:consent-granted', function onConsent() {
    document.removeEventListener('cookie:consent-granted', onConsent);
    initTracking();
  });
}

function setupTracking() {
  /** Helper — fire a GA4 event (safe even if gtag hasn't loaded yet) */
  function trackEvent(name: string, params: Record<string, string | number | boolean> = {}) {
    const w = window as Window & typeof globalThis & { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== 'function') return;
    w.gtag('event', name, params);
  }

  // ---------------------------------------------------------------------------
  // Page-level metadata
  // ---------------------------------------------------------------------------
  const pageLang = document.documentElement.lang || 'es';
  trackEvent('page_metadata', {
    language: pageLang,
    page_path: window.location.pathname,
  });

  // ---------------------------------------------------------------------------
  // 14. Consent granted ping (fires once per session that becomes trackable)
  // ---------------------------------------------------------------------------
  trackEvent('consent_granted', { language: pageLang });

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
      if (link.id === 'contact-float') location = 'floating_widget';
      else if (link.closest('.cta-section')) location = 'cta_section';
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

  // ---------------------------------------------------------------------------
  // 15. Manage-Cookies buttons (footer column + footer bottom row)
  // ---------------------------------------------------------------------------
  document.querySelectorAll<HTMLButtonElement>('#manage-cookies, #manage-cookies-bottom').forEach((btn) => {
    btn.addEventListener('click', () => {
      trackEvent('cookie_manage_open', {
        location: btn.id === 'manage-cookies-bottom' ? 'footer_bottom' : 'footer',
        language: pageLang,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 16. Mobile hamburger menu open/close
  // ---------------------------------------------------------------------------
  const hamburger = document.getElementById('hamburger-btn');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      requestAnimationFrame(() => {
        const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
        trackEvent('mobile_menu_toggle', { state: isOpen ? 'open' : 'close', language: pageLang });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 17. Theme change (forwards `theme-changed` CustomEvent from ThemeToggle.astro)
  // ---------------------------------------------------------------------------
  document.addEventListener('theme-changed', (e: Event) => {
    const detail = (e as CustomEvent<{ from?: string; to?: string }>).detail ?? {};
    trackEvent('theme_change', {
      from_theme: detail.from ?? 'unknown',
      to_theme: detail.to ?? 'unknown',
      language: pageLang,
    });
  });

  // ---------------------------------------------------------------------------
  // 18. Floating contact widget (FAB)
  // ---------------------------------------------------------------------------
  const fab = document.getElementById('contact-float');
  if (fab) {
    fab.addEventListener('click', () => {
      const href = fab.getAttribute('href') ?? '';
      let destination = 'unknown';
      if (href.includes('wa.me')) destination = 'whatsapp';
      else if (href.includes('xhslink.com') || href.includes('xiaohongshu')) destination = 'xiaohongshu';
      trackEvent('contact_float_click', { destination, language: pageLang });
    });
  }

  // ---------------------------------------------------------------------------
  // 19. Outbound external links (blog and any future target="_blank" anchor)
  // ---------------------------------------------------------------------------
  document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((link) => {
    if (
      link.matches('a[href*="wa.me"]') ||
      link.closest('.partner-card, .social-card, .social-icon, .social-icon-small') ||
      link.id === 'contact-float'
    ) return;
    const href = link.getAttribute('href') ?? '';
    if (!href || href.startsWith('mailto:')) return;
    let destination = 'other';
    try { destination = new URL(href, window.location.origin).hostname; } catch { /* keep 'other' */ }
    let location = 'unknown';
    if (link.closest('.nav, .nav-overlay')) location = 'nav';
    else if (link.closest('.footer')) location = 'footer';
    else if (link.closest('.cta-section')) location = 'cta_section';
    link.addEventListener('click', () => {
      trackEvent('outbound_click', { destination, href: href.slice(0, 200), location, language: pageLang });
    });
  });

  // ---------------------------------------------------------------------------
  // 20. Hero scroll-indicator click
  // ---------------------------------------------------------------------------
  document.querySelectorAll<HTMLAnchorElement>('.scroll-indicator').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('hero_scroll_indicator_click', { target: link.getAttribute('href') ?? '', language: pageLang });
    });
  });

  // ---------------------------------------------------------------------------
  // 21. Pricing-form lifecycle (CustomEvent forwarder from PricingContactForm.astro)
  // ---------------------------------------------------------------------------
  const PRICING_FORM_EVENTS = [
    'analytics:pricing_form_open',
    'analytics:pricing_form_close',
    'analytics:pricing_form_validation_error',
    'analytics:pricing_form_submit_attempt',
    'analytics:pricing_form_submit_success',
    'analytics:pricing_form_submit_error',
  ] as const;
  PRICING_FORM_EVENTS.forEach((evtName) => {
    document.addEventListener(evtName, (e: Event) => {
      const detail = (e as CustomEvent<Record<string, string | number | boolean>>).detail ?? {};
      trackEvent(evtName.replace('analytics:', ''), { ...detail, language: pageLang });
    });
  });

  // ---------------------------------------------------------------------------
  // 22. Gallery lifecycle (CustomEvent forwarder from Gallery.astro)
  // ---------------------------------------------------------------------------
  const GALLERY_EVENTS = [
    'analytics:gallery_image_open',
    'analytics:gallery_navigate',
    'analytics:gallery_lightbox_close',
  ] as const;
  GALLERY_EVENTS.forEach((evtName) => {
    document.addEventListener(evtName, (e: Event) => {
      const detail = (e as CustomEvent<Record<string, string | number | boolean>>).detail ?? {};
      trackEvent(evtName.replace('analytics:', ''), { ...detail, language: pageLang });
    });
  });
}
