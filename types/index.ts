export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  status: string;
  location?: string | null;
  year?: string | null;
  client?: string | null;
  coverImage?: string | null;
  images: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon?: string | null;
  image?: string | null;
  features: string;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  company?: string | null;
  role?: string | null;
  text: string;
  rating: number;
  avatar?: string | null;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
  label?: string | null;
  updatedAt: Date;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  message: string;
  read: boolean;
  createdAt: Date;
}

export type ContentMap = Record<string, string>;

export const PROJECT_CATEGORIES = [
  "Residential",
  "Duplex",
  "Knockdown Rebuild",
  "Granny Flat",
  "Renovation",
  "Multi-Dwelling",
  "Commercial",
];

export const PROJECT_STATUSES = ["completed", "ongoing", "upcoming"];

export const SERVICE_ICONS = [
  "home",
  "building",
  "hammer",
  "layout",
  "paintbrush",
  "buildings",
  "wrench",
  "ruler",
  "hard-hat",
  "zap",
];
