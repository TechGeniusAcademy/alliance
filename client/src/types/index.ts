// ==========================================
// ALLIANCE - Type Definitions
// ==========================================

// ---------- Languages ----------
export type Language = 'ru' | 'kk' | 'en';

// ---------- User & Auth ----------
export type UserRole = 'client' | 'master' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
}

// ---------- Master ----------
export interface Master {
  id: string;
  name: string;
  avatar?: string;
  specializations: string[];
  experience: number;
  city: string;
  rating: number;
  reviewsCount: number;
  ordersCount: number;
  description?: string;
  priceFrom?: number;
  isOnline?: boolean;
}

// ---------- Project ----------
export interface Project {
  id: string;
  title: string;
  description?: string;
  images: string[];
  category: string;
  master: {
    id: string;
    name: string;
    avatar?: string;
  };
  completedAt?: string;
  price?: number;
}

// ---------- Category ----------
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  projectsCount?: number;
}

// ---------- Blog ----------
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  category?: string;
  readTime?: number;
}

// ---------- Review (Simple) ----------
export interface SimpleReview {
  id: string;
  rating: number;
  comment: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default {};
