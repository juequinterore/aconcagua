import { es } from './es';
import { en } from './en';
import { zh } from './zh';

export type Lang = 'es' | 'en' | 'zh';

const translations = { es, en, zh };

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    const dict = translations[lang] as Record<string, string>;
    if (key in dict) return dict[key];
    // Fallback to Spanish
    const fallback = translations['es'] as Record<string, string>;
    if (key in fallback) return fallback[key];
    return key;
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en' || lang === 'zh') return lang;
  return 'es';
}

export function getLocale(lang: Lang): string {
  const locales: Record<Lang, string> = {
    es: 'es-AR',
    en: 'en-US',
    zh: 'zh-CN',
  };
  return locales[lang];
}

export function getAlternateUrls(currentPath: string, lang: Lang): Record<Lang, string> {
  const base = 'https://aconcagua.co';
  // Strip existing lang prefix if any
  const cleanPath = currentPath.replace(/^\/(en|zh)/, '') || '/';
  return {
    es: `${base}${cleanPath}`,
    en: `${base}/en${cleanPath === '/' ? '' : cleanPath}`,
    zh: `${base}/zh${cleanPath === '/' ? '' : cleanPath}`,
  };
}
