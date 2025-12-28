# MITC - Deployment Guide (Netlify)

## Deployment Overview

This guide covers deploying the MITC application to **Netlify** with **Firebase** backend.

**Estimated time:** 10-15 minutes

---

## Prerequisites

- [ ] GitHub account with repository pushed
- [ ] Netlify account (free tier)
- [ ] Firebase project with all configs ready
- [ ] All environment variables configured

---

## Step 1: Prepare GitHub Repository

### 1.1 Ensure Repository is Public

```bash
# Push all code to GitHub
git add .
git commit -m "Initial commit: Production-ready MITC app"
git push origin main
```

### 1.2 Verify `.gitignore`

Make sure these are in `.gitignore` (already configured):
```
node_modules/
.env
.env.local
.next/
build/
```

---

## Step 2: Create Netlify Account & Connect Repository

### 2.1 Sign Up / Log In to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in with GitHub
3. Authorize Netlify to access your GitHub account

### 2.2 Create New Site

1. Click **Add new site** or **New site from Git**
2. Choose **GitHub** as Git provider
3. Search for and select `production-mitc` repository
4. Click **Connect**

---

## Step 3: Configure Build Settings

### 3.1 Basic Configuration

Netlify should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node version | 18 (or higher) |

### 3.2 Environment Variables

1. In **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add all variables from your `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_ADMIN_EMAIL = your_admin_email@example.com
NEXT_PUBLIC_SITE_URL = https://your-domain.netlify.app
```

**Note:** Use your actual Netlify domain or custom domain for `NEXT_PUBLIC_SITE_URL`

### 3.3 Deploy Settings

1. Go to **Deploys**
2. Verify auto-deployment is enabled
3. Deploy branch should be `main`

---

## Step 4: Configure Firebase Authorized Domains

Firebase needs to authorize your Netlify domain:

### 4.1 Get Your Netlify Domain

After first deploy:
1. Go to **Site settings**
2. Your domain will be like: `mitc-app.netlify.app`

### 4.2 Add to Firebase

1. Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add your domains:
   - `your-domain.netlify.app` (Netlify domain)
   - `yourdomain.com` (if using custom domain)
   - `localhost:3000` (for local development)

---

## Step 5: Deploy

### 5.1 First Deployment

1. After saving build settings, Netlify auto-deploys
2. Wait for build to complete (~3-5 minutes)
3. View live site from **Deploys**

### 5.2 Monitor Build

```
Build started
✓ Clone repository
✓ Install dependencies
✓ Build site
✓ Optimize for production
✓ Deploy complete
```

---

## Step 6: Custom Domain (Optional)

### 6.1 Connect Custom Domain

1. **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `mitc.com`)
4. Follow DNS setup instructions

### 6.2 Update Firebase

Add your custom domain to Firebase Authorized domains (see Step 4.2)

---

## Step 7: Verify Deployment

### 7.1 Test Public Pages

- [ ] Visit homepage
- [ ] Visit `/services`
- [ ] Visit `/about`
- [ ] Visit `/contact`
- [ ] Visit `/ratings`

### 7.2 Test Authentication

- [ ] Sign up at `/signup`
- [ ] Test Google login
- [ ] Test email/password login
- [ ] Visit `/profile`

### 7.3 Test Admin

- [ ] Make your user admin in Firebase
- [ ] Visit `/dashboard`
- [ ] Test dashboard tabs

### 7.4 Check Performance

1. Use [GTmetrix](https://gtmetrix.com)
2. Check [PageSpeed Insights](https://pagespeed.web.dev)
3. Aim for **Green** ratings

---

## Continuous Deployment

Netlify automatically deploys when you push to `main` branch:

```bash
# Make changes locally
echo "// new feature" >> src/app/page.tsx

# Push to GitHub
git add .
git commit -m "Feature: Add new section"
git push origin main

# Netlify auto-deploys (2-5 minutes)
# Check Deploys tab to monitor
```

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Netlify Dashboard → **Deploys**
2. Click failed deploy
3. Scroll to see error messages

**Common fixes:**
```bash
# Clear build cache
# In Netlify: Deploys > Trigger deploy > Deploy site (clears cache)

# Or manually:
git commit --allow-empty -m "Rebuild"
git push origin main
```

### Authentication Not Working

**Check Firebase:**
1. Firebase Console → **Authentication**
2. Verify Google provider is enabled
3. Check Authorized domains (see Step 4)

### Environment Variables Not Loading

**Verify in Netlify:**
1. **Site settings** → **Build & deploy** → **Environment**
2. Variables must start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after adding variables

### Domain Not Working

**Check DNS:**
1. Netlify → **Domain management**
2. Check nameserver setup
3. DNS propagation can take 24-48 hours
4. Verify with `nslookup yourdomain.com`

---

## Performance Optimization

### Enable Caching

**Cache headers** (automatic on Netlify):
- Static files: 365 days
- HTML: 0 days (always fresh)

### Monitor Bandwidth

1. **Site settings** → **Billing**
2. Netlify free tier includes 100GB/month
3. Monitor usage in **Analytics**

### Enable Gzip Compression

Automatic on Netlify for:
- HTML
- CSS
- JavaScript
- JSON

---

## Rolling Back Deployment

If something breaks:

1. Netlify → **Deploys**
2. Find previous working deployment
3. Click **...** → **Publish this deploy**
4. Site rolls back instantly

---

## Monitoring & Logging

### Function Logs

View edge function logs:
1. **Netlify** → **Functions** → **Logs**
2. Real-time debugging

### Analytics

1. **Site settings** → **Analytics**
2. Track:
   - Page views
   - Unique visitors
   - Bounce rate
   - Top pages

---

## Security Checklist

- [ ] All environment variables are set
- [ ] Firebase keys are public (`NEXT_PUBLIC_*`)
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS is enabled (automatic on Netlify)
- [ ] Authorized domains configured in Firebase
- [ ] Firestore security rules deployed
- [ ] Admin email properly set

---

## Maintenance

### Regular Tasks

```bash
# Weekly: Update dependencies
npm update
npm audit

# Monthly: Review logs and analytics
# Check Netlify Dashboard for usage and errors

# Quarterly: Review security rules
# Update Firebase Firestore rules if needed
```

### Scheduled Builds

Optional: Trigger daily builds:

1. **Site settings** → **Build & deploy** → **Build hooks**
2. Click **Add build hook**
3. Create webhook URL
4. Use with cron job (e.g., AWS Lambda) to trigger

---

## Rollback Production

If emergency rollback needed:

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or specify previous commit
git revert <commit-hash>
git push origin main

# Netlify auto-deploys the revert
```

---

## Contact & Support

- **Netlify Support:** support.netlify.com
- **Firebase Support:** firebase.google.com/support
- **Documentation:** See README.md and SETUP_GUIDE.md

---

## Deployment Checklist

Before going live:

- [ ] All pages load without errors
- [ ] Authentication works
- [ ] Contact form submits successfully
- [ ] Admin dashboard is accessible
- [ ] Images load correctly
- [ ] Mobile responsive
- [ ] Performance is acceptable
- [ ] SEO meta tags are present
- [ ] Analytics configured
- [ ] Error pages configured

---

**Last Updated:** December 2024

**Built with ❤️ for MITC**
