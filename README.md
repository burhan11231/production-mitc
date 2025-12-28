# MITC - Mateen IT Corp Web Application

**Kashmir's Tech Authority Since 2013**

![Production Ready](https://img.shields.io/badge/status-production--ready-green)
![Next.js 15](https://img.shields.io/badge/Next.js-15.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Free%20Tier-orange)
![Deployed on Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7)

---

## 📋 Overview

This is a professional, SEO-optimized Next.js web application for MITC (Mateen IT Corp), a laptop sales and technical services business based in Srinagar, Jammu & Kashmir.

### Features

✅ **Public Pages**
- Homepage with hero section
- Services listing
- About page
- Ratings/Reviews system
- Contact form
- Gallery (Instagram embed)

✅ **Authentication**
- Email & Password login/signup
- Google OAuth
- Secure password reset
- Phone verification optional

✅ **User Dashboard**
- Profile management
- Review submission (1 per user)
- Rating edit/delete
- Password management

✅ **Admin Dashboard**
- Lead management
- Site visit analytics
- Review moderation
- Instagram gallery management
- User management
- Global settings (SEO, hours, contact)

✅ **Security**
- Firebase Authentication
- Firestore Security Rules
- Environment variable protection
- No sensitive data in client code

✅ **Performance**
- Next.js optimizations
- Image lazy loading
- SEO meta tags
- Mobile responsive
- Free tier compliant

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account (free tier)
- Netlify account (optional, for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Burhan-sheikh/production-mitc.git
   cd production-mitc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password + Google)
   - Create Firestore database (free tier)
   - Get your Firebase config

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   ├── login/               # Authentication pages
│   ├── signup/
│   ├── services/
│   ├── about/
│   ├── ratings/
│   ├── contact/
│   ├── profile/             # User dashboard
│   ├── dashboard/           # Admin dashboard
│   ├── globals.css          # Global styles
│   └── provider.tsx         # Context provider
├── components/              # Reusable components
│   ├── Header.tsx
│   ├── FloatingButtons.tsx
│   └── ...
├── lib/                     # Utilities & config
│   ├── firebase.ts          # Firebase init
│   ├── auth-context.tsx     # Auth provider
│   └── ...
└── hooks/                   # Custom React hooks
    └── useSettings.ts
```

---

## 🔥 Firestore Collections

### `users`
```typescript
{
  uid: string,
  name: string,
  email: string,
  phone?: string,
  photoURL?: string,
  role: 'user' | 'admin',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `leads`
```typescript
{
  id: auto,
  name: string,
  email: string,
  phone?: string,
  message: string,
  createdAt: timestamp,
  read: boolean
}
```

### `reviews`
```typescript
{
  id: auto,
  userId: string,
  userName: string,
  rating: 1-5,
  comment: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `siteVisits`
```typescript
{
  id: auto,
  timestamp: timestamp,
  path: string,
  referrer?: string
}
```

### `instagramPosts`
```typescript
{
  id: auto,
  url: string,
  caption?: string,
  addedAt: timestamp
}
```

### `siteSettings`
```typescript
{
  siteTitle: string,
  metaDescription: string,
  ogImageUrl: string,
  salespersonName: string,
  email: string,
  phone: string,
  whatsappLink: string,
  instagram: string,
  facebook: string,
  twitter: string,
  linkedin: string,
  workingHours: {
    summer: Record<string, {open, close}>,
    winter: Record<string, {open, close}>
  }
}
```

---

## 🔐 Firestore Security Rules

See `firestore.rules` for complete security configuration.

Key rules:
- Users can read/write only their own documents
- Admin-only write access to dashboard collections
- Public read access to reviews and settings
- Leads require authentication to create

---

## 🚢 Deployment to Netlify

### Automatic Deployment

1. Push code to GitHub
2. Connect repo to Netlify
3. Set environment variables in Netlify dashboard
4. Auto-deploy on push

### Manual Deployment

```bash
# Build
npm run build

# Deploy
npm install -g netlify-cli
netlify deploy --prod
```

### Environment Variables on Netlify

Add all `NEXT_PUBLIC_*` variables to Netlify Site Settings > Build & deploy > Environment

---

## 📱 Pages & Routes

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Public | ❌ | Homepage |
| `/services` | Public | ❌ | Services listing |
| `/about` | Public | ❌ | About page |
| `/ratings` | Public | ❌ | Reviews/ratings |
| `/contact` | Public | ❌ | Contact form |
| `/login` | Public | ❌ | Login page |
| `/signup` | Public | ❌ | Signup page |
| `/profile` | Protected | ✅ | User profile |
| `/dashboard` | Protected | ✅ Admin | Admin overview |
| `/dashboard/leads` | Protected | ✅ Admin | Lead management |
| `/dashboard/visits` | Protected | ✅ Admin | Analytics |
| `/dashboard/ratings` | Protected | ✅ Admin | Review moderation |
| `/dashboard/instagram` | Protected | ✅ Admin | Gallery management |
| `/dashboard/users` | Protected | ✅ Admin | User management |
| `/dashboard/settings` | Protected | ✅ Admin | Global settings |

---

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Style

- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **Firebase SDK** for backend
- **Next.js best practices**

---

## 📊 Analytics & Tracking

Site visits are automatically logged to `siteVisits` collection on page load.

Admin dashboard displays:
- Total visits (last 24h)
- Visits graph
- Breakdown by page

---

## 🔒 Security Checklist

- [x] Firebase keys in environment variables only
- [x] No hardcoded secrets
- [x] HTTPS enforced (Netlify default)
- [x] CORS properly configured
- [x] XSS protection via React
- [x] SQL injection N/A (Firestore)
- [x] Rate limiting at Netlify edge
- [x] Admin role verification server-side

---

## 🚀 Performance Tips

1. **Image Optimization**
   - Use Next.js `Image` component
   - Lazy load below the fold
   - Compress before upload

2. **Bundle Size**
   - Dynamic imports for heavy components
   - Tree-shake unused code
   - Check bundle with `next/bundle-analyzer`

3. **Database**
   - Index frequently queried fields
   - Limit real-time listeners
   - Batch reads when possible

4. **SEO**
   - Dynamic meta tags per page
   - Structured data (JSON-LD)
   - Sitemap generation
   - Open Graph tags

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Open a new issue with details
3. Contact: your-email@example.com

---

## 📄 License

MIT License - See LICENSE file

---

## ✨ Credits

Built with ❤️ for MITC by Burhan

Tech Stack:
- Next.js 15
- React 18
- Firebase 10
- Tailwind CSS 3
- TypeScript 5

---

**Last Updated:** December 2024
