# MITC Web Application - Complete Setup Guide

## Prerequisites

- **Node.js 18+** and npm/yarn
- **Git** for version control
- **Firebase account** (free tier) - [Sign up here](https://firebase.google.com/)
- **Netlify account** (optional, for deployment) - [Sign up here](https://netlify.com/)
- **Text editor** - VS Code recommended

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/Burhan-sheikh/production-mitc.git
cd production-mitc
```

---

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

---

## Step 3: Set Up Firebase

### 3.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a new project**
3. Enter project name: `mitc-webapp`
4. Skip Google Analytics (optional)
5. Click **Create project**

### 3.2 Register a Web App

1. In Firebase Console, click **Add app**
2. Select **Web** (</>)
3. Register app name: `MITC Web`
4. Copy the Firebase config (you'll need this)

### 3.3 Enable Authentication

1. Go to **Authentication** in left sidebar
2. Click **Get started**
3. Enable **Email/Password** provider
4. Enable **Google** provider
   - You'll need Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)

### 3.4 Create Firestore Database

1. Go to **Firestore Database** in left sidebar
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Choose region closest to you
5. Click **Create**

### 3.5 Set Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace all content with the rules from `firestore.rules` file in project root
3. Click **Publish**

---

## Step 4: Configure Environment Variables

### 4.1 Copy Environment Template

```bash
cp .env.example .env.local
```

### 4.2 Fill in Firebase Credentials

Open `.env.local` and fill in your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Get these values from:**
1. Firebase Console → Project Settings → General tab
2. Scroll down to "Your apps" section
3. Click on Web app configuration
4. Copy all values into `.env.local`

---

## Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 6: Initialize Firestore Collections

When you first access the app, Firestore collections will be created automatically as data is written.

To manually initialize collections:

1. Go to **Firestore Database**
2. Create collections with these names:
   - `users`
   - `leads`
   - `reviews`
   - `siteVisits`
   - `instagramPosts`
   - `siteSettings`

Add a sample document to `siteSettings` with key `global`:

```json
{
  "siteTitle": "MITC - Mateen IT Corp",
  "metaDescription": "Kashmir's Tech Authority Since 2013",
  "ogImageUrl": "",
  "salespersonName": "Team MITC",
  "email": "your_email@example.com",
  "phone": "+91 98765 43210",
  "whatsappLink": "https://wa.me/919876543210",
  "instagram": "https://instagram.com/mitc",
  "facebook": "",
  "twitter": "",
  "linkedin": ""
}
```

---

## Step 7: Create Admin User

1. Sign up a new user in the app
2. Go to **Firestore Database** → **users** collection
3. Find your user document
4. Edit the `role` field and change it from `user` to `admin`
5. Click **Save**

Now you have admin access to the dashboard!

---

## Step 8: Verify Setup

### Test Homepage
- [ ] Visit [http://localhost:3000](http://localhost:3000)
- [ ] See hero section and services

### Test Authentication
- [ ] Sign up new account at `/signup`
- [ ] Try Google login
- [ ] Try email/password login at `/login`

### Test User Features
- [ ] Visit `/profile` - should see user profile
- [ ] Visit `/contact` - should be able to submit form
- [ ] Visit `/ratings` - should see reviews list

### Test Admin Features
- [ ] Make yourself admin (see Step 7)
- [ ] Visit `/dashboard` - should see metrics
- [ ] Try `/dashboard/leads` - should see contact forms
- [ ] Try other dashboard tabs

---

## Troubleshooting

### "Firebase config missing" error

**Solution:** Make sure all environment variables are set correctly in `.env.local`

```bash
# Check your .env.local file
cat .env.local
```

### "Permission denied" on Firestore

**Solution:** Your Firestore security rules may be incorrect

1. Go to Firestore Database → Rules
2. Copy content from `firestore.rules` file
3. Paste and publish

### "Google Sign-in not working"

**Solution:** Enable Google OAuth in Firebase

1. Go to Authentication → Google provider
2. Make sure it's **Enabled**
3. Add your app domain to authorized domains

### "Admin dashboard not accessible"

**Solution:** User account must have `role: 'admin'` in Firestore

1. Go to Firestore Database → users collection
2. Find your user document
3. Add field `role` with value `admin`
4. Refresh the app

### Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001
```

---

## Database Seeding (Optional)

To add sample data:

```bash
# Create sample reviews
# Go to Firestore → reviews collection → Add document

# Sample review:
{
  "userId": "user_uid",
  "userName": "John Doe",
  "rating": 5,
  "comment": "Great service! Highly recommend.",
  "createdAt": Timestamp
}
```

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## File Structure Overview

```
production-mitc/
├── src/
│   ├── app/                  # Next.js pages
│   │   ├── page.tsx          # Homepage
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── services/         # Services page
│   │   ├── about/            # About page
│   │   ├── contact/          # Contact page
│   │   ├── ratings/          # Ratings page
│   │   ├── profile/          # User profile
│   │   ├── dashboard/        # Admin dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── Header.tsx
│   │   ├── FloatingButtons.tsx
│   │   └── ...
│   ├── lib/                  # Utilities & config
│   │   ├── firebase.ts       # Firebase init
│   │   ├── auth-context.tsx  # Auth provider
│   │   └── ...
│   ├── hooks/                # Custom hooks
│   │   └── useSettings.ts
│   └── provider.tsx          # Providers
├── firestore.rules           # Security rules
├── package.json              # Dependencies
├── tsconfig.json             # TS config
├── tailwind.config.ts        # Tailwind config
├── next.config.ts            # Next.js config
├── .env.example              # Environment template
├── .env.local                # Local environment (gitignored)
├── README.md                 # Project docs
└── SETUP_GUIDE.md            # This file
```

---

## Next Steps

### 1. Customize Branding
- Update logo/favicon
- Change colors in `tailwind.config.ts`
- Update company info in admin settings

### 2. Add More Features
- Product catalog
- Service booking
- Payment integration
- Email notifications

### 3. Deploy to Netlify
- See deployment section in README.md
- Set environment variables in Netlify dashboard
- Enable auto-deployment from GitHub

### 4. Set Up Analytics
- Add Google Analytics in `next.config.ts`
- Monitor user behavior in dashboard
- Track conversion metrics

### 5. Optimize Performance
- Add image optimization
- Implement caching strategies
- Monitor bundle size

---

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

---

## Support

If you encounter issues:

1. Check this setup guide
2. Review README.md
3. Check Firebase Console for errors
4. Check browser console (F12) for errors
5. Open a GitHub issue with details

---

## Security Notes

⚠️ **Important:**

- Never commit `.env.local` to GitHub (it's in .gitignore)
- Never share your Firebase API keys publicly
- Always use HTTPS in production
- Regularly review Firestore security rules
- Keep dependencies updated

```bash
# Check for security vulnerabilities
npm audit
npm update
```

---

**Last Updated:** December 2024

**Built with ❤️ for MITC**
