# MITC Project Structure

## Directory Tree

```
production-mitc/
├── src/                           # Source code
│   ├── app/                       # Next.js App Router (Pages)
│   │   ├── (auth)/
│   │   │   └── logout/
│   │   │       └── page.tsx          # Logout handler
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx          # Admin overview
│   │   │   ├── leads/
│   │   │   │   └── page.tsx      # Lead management
│   │   │   ├── visits/
│   │   │   │   └── page.tsx      # Site analytics
│   │   │   ├── ratings/
│   │   │   │   └── page.tsx      # Rating moderation
│   │   │   ├── instagram/
│   │   │   │   └── page.tsx      # Gallery management
│   │   │   ├── users/
│   │   │   │   └── page.tsx      # User management
│   │   │   └── settings/
│   │   │       └── page.tsx      # Global settings
│   │   ├── about/
│   │   │   └── page.tsx          # About page
│   │   ├── contact/
│   │   │   └── page.tsx          # Contact form
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── profile/
│   │   │   └── page.tsx          # User profile
│   │   ├── ratings/
│   │   │   └── page.tsx          # Ratings listing
│   │   ├── services/
│   │   │   └── page.tsx          # Services page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   ├── page.tsx               # Homepage
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles
│   │   └── provider.tsx            # Context providers
│   ├── components/              # Reusable React components
│   │   ├── Header.tsx             # Navigation header
│   │   ├── FloatingButtons.tsx    # WhatsApp & Call buttons
│   │   └── ...                   # Other components
│   ├── lib/                    # Utilities & configuration
│   │   ├── firebase.ts           # Firebase initialization
│   │   └── auth-context.tsx      # Authentication context
│   ├── hooks/                 # Custom React hooks
│   │   └── useSettings.ts       # Global settings hook
│   └── types/                 # TypeScript type definitions
│       └── (optional)
├── public/                     # Static assets
│   ├── favicon.ico
│   └── ...
├── firestore.rules             # Firebase security rules
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── package.json                # Dependencies & scripts
├── package-lock.json           # Dependency lock file
├── README.md                   # Project documentation
├── SETUP_GUIDE.md              # Setup instructions
├── DEPLOYMENT.md               # Deployment guide
└── PROJECT_STRUCTURE.md        # This file
```

---

## File Descriptions

### Core Application Files

#### `src/app/layout.tsx`
- **Purpose:** Root layout for entire application
- **Contains:** HTML structure, header, footer, providers
- **Exports:** RootLayout component

#### `src/app/page.tsx`
- **Purpose:** Homepage
- **Contains:** Hero section, services preview, CTA sections
- **Route:** `/`

#### `src/app/provider.tsx`
- **Purpose:** Centralized provider setup
- **Contains:** AuthProvider, Toaster
- **Used by:** layout.tsx

---

### Authentication Files

#### `src/lib/firebase.ts`
- **Purpose:** Firebase initialization
- **Exports:** auth, db, app
- **Usage:** Used by all Firebase operations

#### `src/lib/auth-context.tsx`
- **Purpose:** Authentication state management
- **Exports:** AuthProvider component, useAuth hook
- **Features:** User state, logout functionality, role management

#### `src/app/login/page.tsx`
- **Route:** `/login`
- **Features:** Email/password login, Google OAuth
- **Redirects:** To homepage after successful login

#### `src/app/signup/page.tsx`
- **Route:** `/signup`
- **Features:** Email/password signup, Google OAuth, validation
- **Creates:** User document in Firestore

#### `src/app/auth/logout/page.tsx`
- **Route:** `/auth/logout`
- **Purpose:** Handles logout and redirect

---

### Public Pages

#### `src/app/page.tsx` (Homepage)
- Services preview
- Why choose MITC section
- Call-to-action

#### `src/app/services/page.tsx`
- **Route:** `/services`
- Lists all 6 services with details
- Benefits section

#### `src/app/about/page.tsx`
- **Route:** `/about`
- Company history and mission
- Core values
- Team information

#### `src/app/contact/page.tsx`
- **Route:** `/contact`
- Contact form (leads collection)
- Business hours and location
- Quick contact buttons

#### `src/app/ratings/page.tsx`
- **Route:** `/ratings`
- Displays all reviews
- Average rating calculation
- CTA to submit review

---

### User Pages

#### `src/app/profile/page.tsx`
- **Route:** `/profile`
- **Protected:** Requires authentication
- **Features:**
  - Edit profile information
  - View/edit/delete personal review
  - Member since date

---

### Admin Pages

#### `src/app/dashboard/page.tsx`
- **Route:** `/dashboard`
- **Protected:** Admin only
- **Contains:** Overview metrics
  - Unread leads count
  - Site visits (24h)
  - Ratings (30d)
- **Quick actions:** Links to admin pages

#### `src/app/dashboard/leads/page.tsx`
- **Route:** `/dashboard/leads`
- Lead/contact form management
- Search functionality
- WhatsApp/Call buttons

#### `src/app/dashboard/visits/page.tsx`
- **Route:** `/dashboard/visits`
- Site visit analytics
- Date range filtering
- Visualizations

#### `src/app/dashboard/ratings/page.tsx`
- **Route:** `/dashboard/ratings`
- Review management
- Delete functionality with confirmation

#### `src/app/dashboard/instagram/page.tsx`
- **Route:** `/dashboard/instagram`
- Add Instagram posts
- Manage gallery
- Date filtering

#### `src/app/dashboard/users/page.tsx`
- **Route:** `/dashboard/users`
- View all users
- Search functionality
- Contact options

#### `src/app/dashboard/settings/page.tsx`
- **Route:** `/dashboard/settings`
- SEO settings
- Business details
- Working hours
- Social links
- Password change

---

### Components

#### `src/components/Header.tsx`
- Navigation header
- Conditional menu based on auth state
- Mobile responsive
- Admin dashboard link (if admin)

#### `src/components/FloatingButtons.tsx`
- Fixed WhatsApp button
- Fixed Call button
- Fetches phone from settings

---

### Hooks

#### `src/hooks/useSettings.ts`
- Fetches global site settings from Firestore
- Provides updateSettings function
- Caches settings in state

---

### Styling

#### `src/app/globals.css`
- Global styles
- Tailwind imports
- Custom component classes
- Animations

#### `tailwind.config.ts`
- Tailwind configuration
- Custom colors (primary, mitc)
- Font families
- Theme extensions

---

### Configuration Files

#### `next.config.ts`
- Next.js configuration
- Image optimization
- Security headers
- Build optimization

#### `tsconfig.json`
- TypeScript configuration
- Path aliases (@/*)
- Compiler options
- Strict mode enabled

#### `tailwind.config.ts`
- Tailwind CSS theming
- Custom colors
- Responsive utilities

#### `package.json`
- Dependencies
- Build scripts
- Project metadata

#### `.env.example`
- Environment variables template
- Firebase configuration keys
- Admin email
- Site URL

#### `firestore.rules`
- Firebase security rules
- Role-based access control
- Read/write permissions
- Collections protection

---

## Data Flow Architecture

```
Client (React Components)
         ↑↓
    AuthContext
         ↑↓
    Firebase Auth
         ↑↓
    Google OAuth / Email Auth
         ↑↓
   Firestore Database
         ↑↓
  Security Rules
```

---

## Firestore Collections

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
  userId?: string,
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
  updatedAt?: timestamp
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
  businessName: string,
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

## Authentication Flow

```
1. User visits /login or /signup
2. Enters credentials
3. Firebase authenticates
4. User document created in Firestore
5. AuthContext updates
6. User redirected to profile/home
7. Header shows logged-in state
8. Admin pages visible if role === 'admin'
```

---

## Component Hierarchy

```
RootLayout (layout.tsx)
├── Provider (provider.tsx)
│   ├── AuthProvider
│   └── Toaster
├── Header
├── Main Content (children)
│   ├── Public Pages
│   ├── Protected Pages (if authenticated)
│   └── Admin Pages (if admin role)
├── FloatingButtons
└── Footer
```

---

## Key Technologies

| Technology | Purpose |
|------------|----------|
| **Next.js 15** | Framework, SSR, API routes |
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Firebase Auth** | Authentication |
| **Firestore** | Database |
| **React Hot Toast** | Notifications |
| **Zustand** | State management (if needed) |

---

## Development Workflow

```
1. Clone repository
2. npm install
3. Set up .env.local
4. npm run dev
5. Edit files in src/
6. Hot reload on save
7. Test features
8. Commit to GitHub
9. Auto-deploy to Netlify
```

---

## Adding New Pages

1. Create new folder in `src/app/`
2. Add `page.tsx` inside
3. Export default component
4. Route automatically created

```typescript
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}
// Access at /new-page
```

---

## Adding New Components

1. Create in `src/components/`
2. Use in pages or other components
3. Keep reusable and focused

```typescript
// src/components/NewComponent.tsx
export function NewComponent() {
  return <div>Component</div>
}
```

---

## Environment Variables

- All `NEXT_PUBLIC_*` variables are accessible on client
- Private variables (none currently) won't be exposed
- `.env.local` overrides `.env.example`
- Never commit `.env.local`

---

## Performance Considerations

- **Images:** Use Next.js Image component
- **Code splitting:** Automatic by Next.js
- **Caching:** Firestore queries cached in component state
- **Bundle size:** Tree-shaking enabled

---

## Security Considerations

- **Firebase rules:** Protect collections from unauthorized access
- **Env variables:** Public keys only exposed
- **HTTPS:** Enforced on Netlify
- **Auth state:** Verified on every page load

---

## Future Scalability

This structure supports:
- Adding more admin pages
- New user features
- PWA implementation
- Backend API routes
- Additional authentication methods

---

**Last Updated:** December 2024

**Structure follows Next.js 15 best practices**
