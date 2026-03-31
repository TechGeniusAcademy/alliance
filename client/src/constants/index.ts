// ==========================================
// ALLIANCE - Constants
// ==========================================

// ---------- Routes ----------
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  HOW_IT_WORKS: '/how-it-works',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/:slug',
  MASTERS: '/masters',
  MASTER_PROFILE: '/masters/:id',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  PRICING: '/pricing',
  BLOG: '/blog',
  BLOG_ARTICLE: '/blog/:slug',
  CONTACT: '/contact',
  FAQ: '/faq',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

// ---------- Languages ----------
export type Language = 'ru' | 'kk' | 'en';

export const LANGUAGES: Array<{ code: Language; name: string; nativeName: string }> = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

// ---------- API Configuration ----------
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
} as const;

// ---------- UI Constants ----------
export const UI = {
  HEADER_HEIGHT: 80,
  MOBILE_MENU_BREAKPOINT: 768,
  MAX_CONTAINER_WIDTH: 1400,
} as const;

export default {
  ROUTES,
  LANGUAGES,
  API_CONFIG,
  UI,
};
