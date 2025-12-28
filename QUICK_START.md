# 🚀 MITC App - Quick Start Checklist

Get your MITC application up and running in 15 minutes!

## Step 1: Clone & Install (2 min)

```bash
# Clone repository
git clone https://github.com/Burhan-sheikh/production-mitc.git
cd production-mitc

# Install dependencies
npm install
```

## Step 2: Configure Firebase (3 min)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project called "MITC"
3. Enable these services:
   - ✅ Authentication (Email/Password + Google)
   - ✅ Firestore Database
4. Copy your Firebase config

## Step 3: Setup Environment Variables (2 min)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

## Step 4: Create Admin User (3 min)

1. Start development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Click "Sign Up" and create your account:
   - Name: Your Name
   - Email: your@email.com
   - Password: strong_password
   - Accept terms

4. **Make yourself admin** (critical!):
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to **Firestore Database**
   - Find collection `users`
   - Find document with your email
   - Add/edit field: `role` = `admin`
   - Save

5. Refresh the app - you should see **"Dashboard"** in header!

## Step 5: Configure Firestore Security Rules (2 min)

1. In Firebase Console, go to **Firestore Database > Rules**
2. Copy content from `firestore.rules` in project root
3. Paste into Firebase Console
4. Publish rules

## Step 6: Configure Site Settings (3 min)

1. Login to app as admin
2. Click **"Dashboard"** in header
3. Click **"Settings"** card
4. Fill in:
   - **SEO:** Site title, description, OG image
   - **Business:** Your name, phone, email, WhatsApp link
   - **Social:** Instagram, Facebook, Twitter, LinkedIn URLs
   - **Hours:** Working hours for each day
5. Click **"Save"**

## ✅ You're Ready!

Your MITC app is now fully functional:

| Feature | Status | Link |
|---------|--------|------|
| Homepage | ✅ Live | `/` |
| Services | ✅ Live | `/services` |
| About | ✅ Live | `/about` |
| Contact Form | ✅ Live | `/contact` |
| Ratings | ✅ Live | `/ratings` |
| User Profile | ✅ Live | `/profile` |
| Admin Dashboard | ✅ Live | `/dashboard` |
| Leads Manager | ✅ Live | `/dashboard/leads` |
| Analytics | ✅ Live | `/dashboard/visits` |
| Review Moderation | ✅ Live | `/dashboard/ratings` |
| Instagram Gallery | ✅ Live | `/dashboard/instagram` |
| User Management | ✅ Live | `/dashboard/users` |
| Settings | ✅ Live | `/dashboard/settings` |

---

## 🔓 Security Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_SITE_URL` to your domain
- [ ] Enable Google OAuth (add authorized domains)
- [ ] Review and update Firestore security rules
- [ ] Setup email verification for new signups
- [ ] Enable password reset emails
- [ ] Add HTTPS certificate (Netlify does this automatically)
- [ ] Configure CSP headers
- [ ] Test with real Firebase project
- [ ] Setup backup strategy
- [ ] Monitor Firestore quota usage

---

## 🚁 Common Issues & Solutions

### Issue: "Firebase config not found"
- **Solution:** Make sure `.env.local` exists and has all Firebase values

### Issue: "Cannot access dashboard"
- **Solution:** Make sure your user has `role: "admin"` in Firestore

### Issue: "Leads form not submitting"
- **Solution:** Check if you have phone number in profile. Users need phone to submit leads.

### Issue: "Images not uploading"
- **Solution:** Image must be < 5 MB and will be compressed to < 700 KB

### Issue: "Firestore rules error"
- **Solution:** Make sure you've published the firestore.rules from the repo

---

## 📄 Next Steps

### Immediate (Today)
1. ✅ Configure settings (SEO, business info)
2. ✅ Add admin team members
3. ✅ Customize working hours
4. ✅ Add social media links

### Short Term (This Week)
1. Add Instagram posts to gallery
2. Test contact form
3. Test ratings system
4. Review analytics
5. Share with team

### Medium Term (This Month)
1. Deploy to Netlify
2. Setup custom domain
3. Monitor first 30 days of data
4. Optimize based on analytics
5. Add more Instagram content

### Long Term (Future)
1. Add PWA support
2. Integrate email notifications
3. Add SMS alerts
4. Setup payment gateway
5. Multi-language support

---

## 🛛️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type check
npm run type-check
```

---

## 📃 Important Files

| File | Purpose |
|------|----------|
| `.env.local` | Your Firebase credentials (don't share!) |
| `firestore.rules` | Database security rules |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind styling config |
| `src/lib/firebase.ts` | Firebase initialization |
| `src/lib/auth-context.tsx` | Authentication logic |

---

## 📾 Deployment to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your GitHub repo
5. Set build command: `npm run build`
6. Set publish directory: `.next`
7. Add environment variables from `.env.local`
8. Deploy!

Netlify will auto-deploy on every push to main.

---

## 🙋 Support

Need help? Check:
- [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md) - Full feature documentation
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - File structure explanation

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Status:** ✅ Ready to Use
