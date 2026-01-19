/**
 * Business Profile Types
 * Multi-tenant business portfolio system
 */

export interface BusinessProfile {
  // Basic Information
  id: string;
  slug: string; // URL-friendly identifier (e.g., "my-coffee-shop")
  businessName: string;
  tagline?: string;
  description: string;
  logo?: string;
  coverImage?: string;

  // Business Type & Industry
  businessType: BusinessType;
  industry: string;

  // Contact Information
  contact: ContactInfo;

  // Social Media
  socialMedia?: SocialMediaLinks;

  // Business Hours
  businessHours?: BusinessHours[];

  // Gallery
  gallery?: GalleryItem[];

  // Features & Services
  features?: string[];
  services?: Service[];

  // Products Showcase (for eCommerce)
  featuredProducts?: FeaturedProduct[];

  // Team Members
  team?: TeamMember[];

  // Testimonials
  testimonials?: Testimonial[];

  // Stats/Achievements
  stats?: BusinessStats;

  // Theme & Customization
  theme?: ThemeSettings;

  // Visibility & Settings
  isPublished: boolean;
  customDomain?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export enum BusinessType {
  RESTAURANT = "RESTAURANT",
  CAFE = "CAFE",
  RETAIL = "RETAIL",
  ECOMMERCE = "ECOMMERCE",
  SERVICE = "SERVICE",
  POS = "POS",
  OTHER = "OTHER",
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address: Address;
  mapLink?: string; // Google Maps link
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface BusinessHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "18:00"
  is24Hours?: boolean;
}

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface GalleryItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  price?: number;
  currency?: string;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  link?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  photo?: string;
  email?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface Testimonial {
  id: string;
  customerName: string;
  customerPhoto?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  position?: string; // e.g., "CEO at Company"
}

export interface BusinessStats {
  yearsInBusiness?: number;
  customersServed?: number;
  projectsCompleted?: number;
  productsAvailable?: number;
  customStats?: CustomStat[];
}

export interface CustomStat {
  label: string;
  value: string | number;
  icon?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  layout?: "modern" | "classic" | "minimal" | "bold";
}

// Section Visibility Settings
export interface ProfileSectionSettings {
  showHero: boolean;
  showAbout: boolean;
  showServices: boolean;
  showProducts: boolean;
  showGallery: boolean;
  showTeam: boolean;
  showTestimonials: boolean;
  showStats: boolean;
  showContact: boolean;
  showBusinessHours: boolean;
}

// Form data for editing
export interface BusinessProfileFormData {
  businessName: string;
  tagline: string;
  description: string;
  businessType: BusinessType;
  industry: string;
  email: string;
  phone: string;
  whatsapp: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  website: string;
}
