# MITC Production App - Complete Feature Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [File Structure](#file-structure)
4. [Features Overview](#features-overview)
5. [Admin Dashboard](#admin-dashboard)
6. [User Features](#user-features)
7. [Public Features](#public-features)
8. [API & Data Structure](#api--data-structure)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**MITC (Mateen IT Corp)** is a production-ready Next.js web application for a professional laptop sales and technical services business.

### Key Features
- ✅ Professional public website
- ✅ User authentication (Email/Google OAuth)
- ✅ Contact lead generation with analytics
- ✅ Customer reviews and ratings system
- ✅ Admin dashboard with full management capabilities
- ✅ Site analytics and visit tracking
- ✅ Instagram gallery integration
- ✅ SEO optimized
- ✅ Firebase free-tier compliant
- ✅ Netlify deployment ready

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### Backend & Database
- **Firebase Authentication**
  - Email/Password
  - Google OAuth
- **Firestore** (Real-time database)

### Hosting & Deployment
- **Netlify** (Free tier)
- **Environment variables** via `.env.local`

### Libraries
- `firebase` - Authentication & database
- `react-hot-toast` - Notifications
- `recharts` - Analytics charts

---

## File Structure

```
src/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                   # Root layout
│   ├── provider.tsx                 # Auth & Toast providers
│   ├── globals.css                  # Tailwind + utilities
│   ├── middleware.ts                # Visit tracking
│   ├── page.tsx                     # Home page
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login page
│   │   └── signup/page.tsx          # Sign up page
│   ├── (public)/
│   │   ├── services/page.tsx        # Services listing
│   │   ├── about/page.tsx           # About company
│   │   ├── contact/page.tsx         # Contact form
│   │   └── ratings/page.tsx         # Reviews listing
│   ├── profile/page.tsx             # User profile
│   └── dashboard/                   # Admin section
│       ├── page.tsx                 # Dashboard home
│       ├── leads/page.tsx           # Lead management
│       ├── visits/page.tsx          # Analytics
│       ├── ratings/page.tsx         # Review moderation
│       ├── instagram/page.tsx       # Gallery management
│       ├── users/page.tsx           # User management
│       └── settings/page.tsx        # Global settings
│
├── components/                       # Reusable components
│   ├── Header.tsx                   # Navigation header
│   ├── Footer.tsx                   # Footer
│   ├── FloatingButtons.tsx          # WhatsApp & Call buttons
│   └── [other components]/
│
├── lib/                              # Utilities
│   ├── firebase.ts                  # Firebase config
│   ├── auth-context.tsx             # Auth state management
│   ├── image-utils.ts               # Image compression
│   └── [other utilities]/
│
├── hooks/                            # Custom React hooks
│   ├── useSettings.ts               # Global settings
│   ├── useVisitTracking.ts          # Analytics tracking
│   └── [other hooks]/
│
public/                              # Static files
├── favicon.ico
└── [images & assets]/

Configuration Files
├── next.config.ts                   # Next.js config
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies
├── firestore.rules                  # Firestore security rules
└── [documentation files]
```

---

## Features Overview

### 🌍 Public Pages

#### 1. Homepage (`/`)
- Hero section with CTA
- Services preview
- Why choose MITC section
- Latest reviews
- Call-to-action buttons

#### 2. Services (`/services`)
- Detailed service cards
- Service statistics
- Pricing info
- CTA to contact

#### 3. About (`/about`)
- Company history
- Mission & vision
- Core values
- Team information
- Contact details

#### 4. Ratings (`/ratings`)
- Average rating display
- All customer reviews
- Filter options
- CTA to login and leave review

#### 5. Contact (`/contact`)
- Contact form
- Business hours
- Location
- WhatsApp & Call buttons
- Lead generation

### 🔐 Authentication Pages

#### 1. Login (`/login`)
- Email & password login
- Google OAuth integration
- Forgot password
- Signup link

#### 2. Signup (`/signup`)
- Email & password registration
- Name & phone (optional)
- Google OAuth
- Terms acceptance
- Auto-redirect to profile

### 👤 User Features

#### 1. Profile (`/profile`)
- **Account Information**
  - Name, email, phone
  - Edit capabilities
  - Real-time sync with Firestore

- **Review Management**
  - Add new review (if not exists)
  - Edit existing review
  - Delete review
  - 5-star rating system

- **Password Management**
  - Change password modal
  - Current password verification
  - New password validation

### 👨‍💼 Admin Dashboard (`/dashboard`)

Full admin control with 6 main sections:

#### 1. Dashboard Overview
- **Key Metrics Cards**
  - Unread leads count
  - Site visits (last 24h)
  - Ratings (last 30d)
  - Total users
- **Quick navigation**
- **Onboarding guide**

#### 2. Leads Management (`/dashboard/leads`)
- **Search & Filter**
  - By name
  - By email
- **List View**
  - Unread leads highlighted
  - Latest first
  - Click to expand
- **Detail View**
  - Full message display
  - Sender info
  - WhatsApp integration
  - Direct call link
  - Email link
  - Mark as read
  - Phone number validation warning

#### 3. Analytics (`/dashboard/visits`)
- **Statistics Cards**
  - Total visits
  - Unique pages
  - Most popular page
- **Date Filtering**
  - From date
  - To date
  - Reset filters
- **Visit Log Table**
  - Timestamp
  - Page path
  - Sortable
  - Pagination (100 per page)

#### 4. Review Moderation (`/dashboard/ratings`)
- **Rating Statistics**
  - Average rating display
  - Star visualization
  - Total count
- **Reviews List**
  - User name
  - Star rating
  - Comment text
  - Date
  - Delete button with confirmation

#### 5. Instagram Gallery (`/dashboard/instagram`)
- **Add New Posts**
  - Embed URL input
  - Optional caption
  - Form validation
  - Success feedback
- **Posts List**
  - Grid view
  - Posted date
  - Caption preview
  - Delete button
  - Tab navigation

#### 6. User Management (`/dashboard/users`)
- **Statistics Cards**
  - Total users
  - Admin count
  - With phone count
- **Search & Filter**
  - By name
  - By email
- **User Table**
  - Name, email, phone
  - Role badge
  - Join date
  - WhatsApp & call links
  - Phone validation indicator

#### 7. Settings (`/dashboard/settings`)

**Tab 1: SEO Settings**
- Site title
- Meta description
- OG image URL
- Applied site-wide

**Tab 2: Business Details**
- Sales person name, email, phone
- WhatsApp link
- Social media URLs (Instagram, Facebook, Twitter, LinkedIn)

**Tab 3: Working Hours**
- Seasonal presets (Summer/Winter dates)
- Daily schedule (all 7 days)
- Time pickers

**Tab 4: Change Password**
- Secure password update
- Current password verification
- Confirmation matching

---

## User Roles & Access Control

### 1. Guest (Unauthenticated)
**Can Access:**
- Homepage
- Services
- About
- Ratings (view only)
- Contact form (blocked, shows login modal)

**Cannot Access:**
- User profile
- Contact submission
- Rating submission
- Admin dashboard

### 2. User (Authenticated)
**Can Access:**
- All guest features
- User profile
- Edit own info
- Submit 1 rating
- Submit contact forms
- View own reviews
- Edit/delete own reviews

**Cannot Access:**
- Admin dashboard
- Other user profiles
- Settings

### 3. Admin (role: "admin")
**Can Access:**
- Everything user can
- Admin dashboard
- All management sections
- Edit global settings
- View all users
- Moderate content

---

## API & Data Structure

### Firestore Collections

#### users
```typescript
{
  uid: string;                      // Firebase Auth UID
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;            // Data URL
  role: 'user' | 'admin';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

#### leads
```typescript
{
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}
```

#### reviews
```typescript
{
  userId: string;                   // Reference to users/{uid}
  userName: string;
  rating: number;                   // 1-5
  comment: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

#### instagramPosts
```typescript
{
  url: string;                      // Embed URL
  caption?: string;
  addedAt: Timestamp;
}
```

#### siteVisits
```typescript
{
  path: string;                     // Route path
  timestamp: Timestamp;
}
```

#### siteSettings
```typescript
{
  // SEO
  siteTitle: string;
  metaDescription: string;
  ogImageUrl: string;

  // Business
  salesPersonName: string;
  salesPersonEmail: string;
  salesPersonPhone: string;
  whatsappLink: string;

  // Social
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;

  // Seasons
  summerStart: string;              // YYYY-MM-DD
  summerEnd: string;
  winterStart: string;
  winterEnd: string;

  // Hours (all 7 days)
  mondayOpen: string;               // HH:MM
  mondayClose: string;
  // ... for other days
}
```

---

## Common Tasks

### 1. Add Your First Admin User
1. Sign up via `/signup`
2. Go to Firestore Console
3. Find `users/{your-uid}` document
4. Set `role` field to `"admin"`
5. Refresh page - dashboard now accessible

### 2. Configure Site Settings
1. Login as admin
2. Go to `/dashboard/settings`
3. Fill in:
   - SEO metadata
   - Business contact info
   - Social media links
   - Working hours
4. Click "Save"

### 3. Add Instagram Posts
1. Go to `/dashboard/instagram`
2. Click "Add New Post"
3. Paste Instagram post URL
4. (Optional) Add caption
5. Click "Add Post"

### 4. Respond to Leads
1. Go to `/dashboard/leads`
2. Click on any lead to view details
3. Use WhatsApp, call, or email buttons
4. Mark as read when responded

### 5. Monitor Analytics
1. Go to `/dashboard/visits`
2. View key metrics:
   - Total visits
   - Popular pages
   - Visitor trends
3. Filter by date range
4. Export data if needed

### 6. Manage Reviews
1. Go to `/dashboard/ratings`
2. See average rating
3. Delete inappropriate reviews
4. Monitor customer sentiment

---

## Troubleshooting

### "Admin access required" message
- Verify your user has `role: "admin"` in Firestore
- Check user document in `users` collection
- Try logging out and back in

### Leads not appearing
- Check if lead has `read: false` field
- Verify Firestore rules allow reads
- Check browser console for errors

### Images not uploading
- Max file size is 5 MB
- After compression, must be ≤ 700 KB
- Supported formats: JPEG, PNG, WebP, GIF
- Check browser console for errors

### Visit tracking not working
- Middleware may be skipping certain routes
- Check `/src/middleware.ts` for exclusions
- Verify Firestore writes are allowed
- Check quota in Firebase console

### Firestore quota exceeded
- Free tier has 50,000 reads/day
- Limit automated queries
- Add caching where possible
- Monitor usage in Firebase console

---

## Performance Optimization

### Free Tier Best Practices
1. **Limit real-time listeners** - Only where needed
2. **Batch writes** - Combine updates when possible
3. **Index carefully** - Create only required indexes
4. **Monitor quota** - Check Firebase console regularly
5. **Cache settings** - Use React context for global data

### SEO Optimization
1. Use proper `<meta>` tags
2. Ensure fast page load times
3. Mobile responsive design
4. Semantic HTML structure
5. Sitemap generation (add later)

---

## Future Enhancements

- [ ] PWA support (add later)
- [ ] Email notifications
- [ ] SMS integration
- [ ] Payment gateway (Cashfree)
- [ ] Advanced analytics
- [ ] API for third-party integrations
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app

---

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Netlify Deployment](https://docs.netlify.com)

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Status:** ✅ Production Ready
