# Business Portfolio System - Complete Guide

A dynamic, multi-tenant business portfolio system for POS/eCommerce businesses. Each business can create and customize their own professional portfolio.

## 🌟 Features

### For Businesses
- ✅ **Custom Business Profile** - Showcase your brand with logo, cover image, and description
- ✅ **Contact Information** - Display address, phone, email, WhatsApp
- ✅ **Business Hours** - Show when you're open
- ✅ **Photo Gallery** - Showcase your space, products, and team
- ✅ **Services & Products** - List what you offer with pricing
- ✅ **Team Members** - Introduce your staff
- ✅ **Customer Testimonials** - Build trust with reviews
- ✅ **Social Media Links** - Connect all your platforms
- ✅ **Statistics** - Show off your achievements
- ✅ **Custom Branding** - Match your brand colors

### Technical Features
- ✅ **Multi-tenant** - Each business has their own profile
- ✅ **Dynamic & Customizable** - Businesses control their own content
- ✅ **Static Data for Now** - Easy to connect API later
- ✅ **Clean Design** - Modern, professional look
- ✅ **Responsive** - Works on all devices
- ✅ **Type-safe** - Full TypeScript support

---

## 📁 Project Structure

```
src/
├── types/
│   └── business-profile.ts           # All TypeScript interfaces
├── data/
│   └── business-profile-template.ts  # Static data templates
├── app/
│   ├── (public)/
│   │   └── business-profile/
│   │       └── page.tsx              # Public view (customer-facing)
│   └── admin/
│       └── business-profile/
│           └── page.tsx              # Admin editor (business owner)
```

---

## 🚀 Quick Start

### 1. View the Demo

Visit these pages:
- **Public View**: `http://localhost:3000/business-profile`
- **Admin Editor**: `http://localhost:3000/admin/business-profile`

### 2. Use the Templates

```typescript
import {
  demoBusinessProfile,
  emptyBusinessProfile,
  restaurantTemplate,
  retailTemplate,
  serviceTemplate,
} from "@/data/business-profile-template";

// Use the demo profile
const myProfile = demoBusinessProfile;

// Or start with an empty template
const newProfile = emptyBusinessProfile;

// Or use a pre-configured template
const myRestaurant = { ...emptyBusinessProfile, ...restaurantTemplate };
```

---

## 📋 Data Structure

### Complete Profile Interface

```typescript
interface BusinessProfile {
  // Basic Info
  id: string;
  slug: string;                    // URL: /business/my-cafe
  businessName: string;
  tagline?: string;
  description: string;
  logo?: string;
  coverImage?: string;

  // Type & Industry
  businessType: BusinessType;      // CAFE, RESTAURANT, RETAIL, etc.
  industry: string;

  // Contact
  contact: ContactInfo;            // Address, phone, email, WhatsApp

  // Social Media
  socialMedia?: SocialMediaLinks;  // Facebook, Instagram, etc.

  // Operating Hours
  businessHours?: BusinessHours[]; // Mon-Sun with open/close times

  // Visual Content
  gallery?: GalleryItem[];         // Photos of your business

  // What You Offer
  features?: string[];             // "Free Wi-Fi", "Pet Friendly"
  services?: Service[];            // Services with pricing
  featuredProducts?: FeaturedProduct[]; // Showcase products

  // People
  team?: TeamMember[];             // Your staff
  testimonials?: Testimonial[];    // Customer reviews

  // Achievements
  stats?: BusinessStats;           // Years in business, customers served

  // Customization
  theme?: ThemeSettings;           // Brand colors, font, layout

  // Status
  isPublished: boolean;
}
```

---

## 🎨 Customization

### 1. Change Business Type

```typescript
export enum BusinessType {
  RESTAURANT = "RESTAURANT",
  CAFE = "CAFE",
  RETAIL = "RETAIL",
  ECOMMERCE = "ECOMMERCE",
  SERVICE = "SERVICE",
  POS = "POS",
  OTHER = "OTHER",
}
```

### 2. Add Your Own Data

Edit `/src/data/business-profile-template.ts`:

```typescript
export const myBusinessProfile: BusinessProfile = {
  id: "my-business-1",
  slug: "my-awesome-shop",
  businessName: "My Awesome Shop",
  tagline: "The Best Shop in Town",
  description: "We sell amazing products...",
  businessType: BusinessType.RETAIL,
  industry: "Retail",

  contact: {
    email: "hello@myshop.com",
    phone: "+1234567890",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA",
    },
  },

  // Add services
  services: [
    {
      id: "1",
      name: "Product Category 1",
      description: "Description here",
      price: 99.99,
      currency: "USD",
    },
  ],

  // Add gallery
  gallery: [
    {
      id: "1",
      url: "/images/photo1.jpg",
      title: "Our Store",
      order: 1,
    },
  ],

  // Add team
  team: [
    {
      id: "1",
      name: "John Doe",
      position: "Owner",
      bio: "Passionate about...",
    },
  ],

  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

### 3. Customize Theme Colors

```typescript
theme: {
  primaryColor: "#FF6B00",      // Your brand color
  secondaryColor: "#0066FF",    // Secondary color
  accentColor: "#FFD700",       // Accent color
  fontFamily: "Inter",          // Font name
  layout: "modern",             // modern | classic | minimal | bold
}
```

---

## 🔌 Connect to API (Future)

When you're ready to connect your API, you'll need these endpoints:

### API Endpoints Needed

```typescript
// Get business profile
GET /api/business-profile/:id
Response: BusinessProfile

// Update business profile
PUT /api/business-profile/:id
Body: BusinessProfile
Response: BusinessProfile

// Upload images
POST /api/business-profile/upload
Body: FormData (image file)
Response: { url: string }

// Get profile by slug (public)
GET /api/business-profile/slug/:slug
Response: BusinessProfile
```

### Example API Integration

```typescript
// In your Redux slice or API service

export const fetchBusinessProfile = async (id: string) => {
  const response = await fetch(`/api/business-profile/${id}`);
  return await response.json();
};

export const updateBusinessProfile = async (
  id: string,
  data: BusinessProfile
) => {
  const response = await fetch(`/api/business-profile/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
};
```

Then replace static data with API calls:

```typescript
// Before (static)
const [profile] = useState<BusinessProfile>(demoBusinessProfile);

// After (API)
const [profile, setProfile] = useState<BusinessProfile | null>(null);

useEffect(() => {
  fetchBusinessProfile("business-id").then(setProfile);
}, []);
```

---

## 📱 Pages Overview

### Public Page (`/business-profile`)

**What customers see:**
- Hero section with cover image and logo
- About section
- Services/products showcase
- Photo gallery
- Team members
- Customer testimonials
- Contact information
- Business hours
- Social media links
- Statistics/achievements

**Responsive Design:**
- Desktop: 3-column layout (content + sidebar)
- Tablet: 2-column layout
- Mobile: Single column, stacked

### Admin Page (`/admin/business-profile`)

**What business owners see:**
- Tabbed interface for easy editing:
  - **Basic Info**: Name, tagline, description, type
  - **Contact & Hours**: Address, phone, operating hours
  - **Images & Gallery**: Logo, cover, photo gallery
  - **Services**: Services and products list
  - **Team**: Team members and testimonials
  - **Social Media**: All social links

**Features:**
- Form validation
- Unsaved changes warning
- Live preview button
- Save/publish controls
- Drag-and-drop image upload (placeholder)

---

## 🎯 Use Cases

### 1. Restaurant/Café

```typescript
const cafeProfile: BusinessProfile = {
  businessType: BusinessType.CAFE,
  features: [
    "Free Wi-Fi",
    "Outdoor Seating",
    "Pet Friendly",
    "Vegan Options",
  ],
  services: [
    { name: "Specialty Coffee", price: 4.50 },
    { name: "Fresh Pastries", price: 3.50 },
    { name: "Brunch Menu", price: 12.00 },
  ],
  businessHours: [
    { day: "MONDAY", isOpen: true, openTime: "07:00", closeTime: "20:00" },
    // ...
  ],
};
```

### 2. Retail Store

```typescript
const retailProfile: BusinessProfile = {
  businessType: BusinessType.RETAIL,
  features: [
    "Online Shopping",
    "Free Shipping",
    "Returns & Exchanges",
  ],
  featuredProducts: [
    {
      name: "Product 1",
      price: 29.99,
      image: "/products/1.jpg",
    },
  ],
};
```

### 3. Service Business

```typescript
const serviceProfile: BusinessProfile = {
  businessType: BusinessType.SERVICE,
  features: [
    "Free Consultation",
    "24/7 Support",
    "Money-Back Guarantee",
  ],
  services: [
    { name: "Basic Package", price: 99 },
    { name: "Premium Package", price: 199 },
  ],
};
```

---

## 🛠️ Customization Guide

### Add New Section to Public Page

```typescript
// In src/app/(public)/business-profile/page.tsx

{/* Add after testimonials */}
{profile.customSection && (
  <Card>
    <CardContent className="pt-6">
      <h2 className="text-2xl font-bold mb-6">Custom Section</h2>
      {/* Your content here */}
    </CardContent>
  </Card>
)}
```

### Add New Field to Profile

1. **Update type** (`src/types/business-profile.ts`):
```typescript
export interface BusinessProfile {
  // ... existing fields
  customField?: string;
}
```

2. **Update template** (`src/data/business-profile-template.ts`):
```typescript
export const demoBusinessProfile: BusinessProfile = {
  // ... existing data
  customField: "Custom value",
};
```

3. **Update editor** (`src/app/admin/business-profile/page.tsx`):
```typescript
<div>
  <label>Custom Field</label>
  <Controller
    name="customField"
    control={control}
    render={({ field }) => <Input {...field} />}
  />
</div>
```

4. **Display in public view**:
```typescript
{profile.customField && (
  <p>{profile.customField}</p>
)}
```

---

## 🎨 Styling & Branding

### Current Colors
- Primary: Orange (#FF6B00)
- Background: Gray (#F9FAFB)
- Text: Gray scale

### Change Theme

Update in `/src/app/(public)/business-profile/page.tsx`:

```typescript
// Replace orange classes with your colors
className="bg-orange-600"  // Replace with bg-blue-600
className="text-orange-600" // Replace with text-blue-600
```

Or use CSS variables:

```css
:root {
  --primary-color: #FF6B00;
  --secondary-color: #0066FF;
}
```

---

## 📊 Performance Optimizations

All pages implement:
- ✅ Image optimization with Next.js Image component
- ✅ Lazy loading for images
- ✅ Responsive images (different sizes)
- ✅ Static data (fast initial load)
- ✅ Clean, semantic HTML
- ✅ Optimized bundle size

---

## 🔐 Multi-Tenant Setup

### Current Setup (Static)
Each business uses the demo profile. To make it multi-tenant:

### 1. Add Database

```sql
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  slug VARCHAR UNIQUE,
  business_name VARCHAR,
  data JSONB,  -- Store full profile as JSON
  is_published BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. Add User Association

```typescript
// When user logs in, fetch their business profile
const businessId = user.businessId;
const profile = await fetchBusinessProfile(businessId);
```

### 3. Update Routes

```typescript
// Public route with slug
/business-profile/[slug]  // e.g., /business-profile/my-cafe

// Admin route (authenticated)
/admin/business-profile   // Edit your own profile
```

---

## 🚀 Next Steps

1. **Add Image Upload**
   - Integrate with your existing image upload utility
   - Update logo, cover, and gallery upload handlers

2. **Connect API**
   - Create backend endpoints
   - Replace static data with API calls

3. **Add Analytics**
   - Track profile views
   - Track contact button clicks

4. **SEO Optimization**
   - Add meta tags for each business
   - Generate sitemap

5. **Advanced Features**
   - Online booking integration
   - Menu builder for restaurants
   - Product catalog for retail
   - Appointment scheduling

---

## 📖 Examples

### Complete Restaurant Example

```typescript
const restaurantProfile: BusinessProfile = {
  id: "rest-123",
  slug: "tasty-bistro",
  businessName: "Tasty Bistro",
  tagline: "Fine Dining Experience",
  description: "Welcome to Tasty Bistro...",
  logo: "/logo.jpg",
  coverImage: "/cover.jpg",
  businessType: BusinessType.RESTAURANT,
  industry: "Food & Beverage",

  contact: {
    email: "hello@tastybistro.com",
    phone: "+1234567890",
    whatsapp: "+1234567890",
    address: {
      street: "123 Food Street",
      city: "New York",
      state: "NY",
      country: "USA",
      postalCode: "10001",
    },
    mapLink: "https://maps.google.com/?q=address",
  },

  socialMedia: {
    facebook: "https://facebook.com/tastybistro",
    instagram: "https://instagram.com/tastybistro",
  },

  businessHours: [
    { day: DayOfWeek.MONDAY, isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { day: DayOfWeek.TUESDAY, isOpen: true, openTime: "11:00", closeTime: "22:00" },
    // ... rest of week
  ],

  features: [
    "Outdoor Seating",
    "Private Dining",
    "Catering",
    "Vegan Options",
  ],

  services: [
    {
      id: "1",
      name: "Lunch Special",
      description: "Daily changing lunch menu",
      price: 15,
      currency: "USD",
      icon: "🍽️",
    },
    {
      id: "2",
      name: "Dinner Menu",
      description: "Full dinner experience",
      price: 35,
      currency: "USD",
      icon: "🌙",
    },
  ],

  team: [
    {
      id: "1",
      name: "Chef Marco",
      position: "Head Chef",
      bio: "Award-winning chef with 20 years experience",
      photo: "/team/chef.jpg",
    },
  ],

  testimonials: [
    {
      id: "1",
      customerName: "Sarah J.",
      rating: 5,
      comment: "Best restaurant in town!",
      date: "2024-01-15",
    },
  ],

  stats: {
    yearsInBusiness: 10,
    customersServed: 100000,
  },

  isPublished: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-19T00:00:00Z",
};
```

---

## ✅ Summary

You now have a complete business portfolio system:

### What's Included
- ✅ Full TypeScript types and interfaces
- ✅ Static data templates (cafe, restaurant, retail, service)
- ✅ Public-facing portfolio page
- ✅ Admin editor for businesses
- ✅ Clean, modern design
- ✅ Fully responsive
- ✅ Ready for API integration

### What's Next
1. Replace static data with your API
2. Add image upload functionality
3. Customize colors and branding
4. Add more business types as needed
5. Deploy and test

### URLs
- **Public View**: `/business-profile`
- **Admin Editor**: `/admin/business-profile`

Your businesses can now create beautiful, professional portfolios! 🎉
