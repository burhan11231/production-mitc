# 🚀 Netlify Deployment - Quick Reference

**Time needed:** 10 minutes  
**Cost:** $0  
**Status:** ✅ Ready to deploy

---

## Step 1: Push to GitHub (2 min)

```bash
cd production-mitc
git add .
git commit -m "Netlify: Add deployment configuration"
git push origin main
```

---

## Step 2: Connect to Netlify (3 min)

1. Go to **[netlify.com](https://netlify.com)**
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub**
4. Choose **production-mitc** repository
5. Click **"Deploy site"** (Netlify auto-detects build settings)

**Wait for build to complete** (usually 2-3 minutes)

---

## Step 3: Add Firebase Credentials (3 min)

In Netlify, go to **Settings → Environment variables**

Add these 6 variables (get from Firebase Console → Project Settings):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Trigger redeploy:** Go to **Deploys → Trigger deploy → Clear cache and redeploy**

---

## Step 4: Configure Firebase OAuth (2 min)

In Firebase Console:

1. Go to **Authentication → Settings → Authorized domains**
2. Add your Netlify domain:
   - Example: `mitc-app.netlify.app`
3. **Save**

---

## Step 5: Test (2 min)

1. Visit your Netlify URL
2. Test:
   - ✅ Homepage loads
   - ✅ Navigation works
   - ✅ Login works
   - ✅ Google OAuth works
   - ✅ Form submission works

**Done! 🎆**

---

## Optional: Custom Domain

1. In Netlify: **Settings → Domain settings → Add custom domain**
2. Enter your domain (e.g., `mitc-store.com`)
3. Update DNS settings (Netlify provides nameservers)
4. In Firebase: Add custom domain to OAuth authorized domains
5. Wait 24 hours for DNS propagation

---

## Verify Deployment

**Check build succeeded:**
- Netlify shows ✍️ "Deploy succeeded"
- Build time < 5 minutes
- No build errors

**Check app works:**
- Homepage loads
- Can login/signup
- Can submit forms
- Admin dashboard works (if admin)

---

## Common Issues

### ✅ "Firebase config not found"
- Add environment variables in Netlify
- Redeploy
- Wait 2 minutes for variables to load

### ✅ "OAuth redirect failed"
- Add Netlify domain to Firebase OAuth domains
- Use exact domain (with https://)
- Wait 5 minutes for Firebase propagation

### ✅ "Build failed"
- Check build logs in Netlify
- Run `npm run build` locally to debug
- Ensure Node.js 18+ installed locally

### ✅ "404 on page refresh"
- netlify.toml should handle this
- Check if redirect rule exists
- Redeploy if needed

---

## Free Tier Details

| Feature | Limit | Status |
|---------|-------|--------|
| Monthly bandwidth | 100 GB | Plenty for small business |
| Build minutes | 300/month | ~1 per day, plenty |
| Deployments | Unlimited | Redeploy anytime |
| Custom domains | Unlimited | Add as many as needed |
| HTTPS | Automatic | Included |
| CDN | Global | Included |
| Cost | FREE | Forever 🎆 |

---

## Firebase Free Tier

| Feature | Daily Limit | Expected Usage | Safe? |
|---------|------------|-----------------|-------|
| Firestore reads | 50,000 | ~200 | ✅ Yes |
| Firestore writes | 10,000 | ~100 | ✅ Yes |
| Storage | 5 GB | Not used | ✅ Yes |
| Auth users | Unlimited | No limit | ✅ Yes |

---

## Post-Deployment Checklist

- [ ] App loads and displays
- [ ] Navigation works
- [ ] Login/signup works
- [ ] Google OAuth works
- [ ] Forms submit data
- [ ] Admin dashboard accessible
- [ ] Settings page works
- [ ] Mobile responsive

---

## Monitoring

### Watch These
1. **Netlify Dashboard** - Build status, deploys
2. **Firebase Console** - Firestore usage, auth logs
3. **Browser Console** - No JavaScript errors

### Set Alerts
1. In Firebase Console: Analytics → Budget alerts
2. Set alert at 80% of free tier quota
3. Won't block your app, just alerts you

---

## Support

- **Netlify Docs:** https://docs.netlify.com/
- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **This Repo:** See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

---

## What Happens Now

1. **Every GitHub push** → Auto-deploys to Netlify
2. **Build takes 2-3 min** → App goes live
3. **No downtime** → Always available
4. **HTTPS automatic** → Secure by default
5. **Free forever** → No credit card needed

---

**🚀 Ready? Push to GitHub and see your app live in 3 minutes!**

For more details, see [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
