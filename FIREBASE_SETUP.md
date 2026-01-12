# 🔥 Firebase Console Setup Guide

Complete this checklist in the Firebase Console to finish setting up your DeerCamp application.

**Project**: `deercamp-3b648`
**Console URL**: https://console.firebase.google.com/project/deercamp-3b648

---

## ✅ Setup Checklist

### 1. Authentication Setup ✅

#### A. Enable Email/Password Authentication

1. Go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Toggle **Enable** switch ON
4. Click **Save**

#### B. Enable Google OAuth

1. In **Sign-in method**, click **Add new provider**
2. Select **Google**
3. Toggle **Enable** switch ON
4. Select your **Support email** from dropdown
5. Click **Save**
6. **Note your Web Client ID** (you'll need this for advanced features)

#### C. Configure Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Default domains already added:
   - `localhost` ✅
   - `deercamp-3b648.web.app` ✅
   - `deercamp-3b648.firebaseapp.com` ✅
3. **Add your custom domain** (if you have one):
   - Click **Add domain**
   - Enter your domain (e.g., `www.deercamp.com`)
   - Follow DNS verification steps

---

### 2. Cloud Firestore Setup ✅

#### A. Create Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we have security rules ready!)
4. Choose location: **us-central1** (or closest to your users)
5. Click **Create**

#### B. Deploy Security Rules

From your terminal:
```bash
firebase deploy --only firestore:rules
```

Or manually in Console:
1. Go to **Firestore Database** → **Rules**
2. Copy contents from `firestore.rules` file
3. Click **Publish**

#### C. Create Initial Collections (Optional)

You can create seed data for testing:

**Stands Collection**:
1. Go to **Firestore Database** → **Data**
2. Click **Start collection**
3. Collection ID: `stands`
4. Add first stand document:
   ```json
   {
     "name": "Oak Tree Stand",
     "type": "ladder",
     "lat": 34.0522,
     "lng": -118.2437,
     "status": "available"
   }
   ```

---

### 3. Firebase Storage Setup ✅

#### A. Create Storage Bucket

1. Go to **Storage**
2. Click **Get started**
3. Select **Start in production mode** (we have security rules!)
4. Use default location
5. Click **Done**

#### B. Deploy Storage Rules

From your terminal:
```bash
firebase deploy --only storage:rules
```

Or manually:
1. Go to **Storage** → **Rules**
2. Copy contents from `storage.rules` file
3. Click **Publish**

---

### 4. Firebase Hosting Setup ✅

#### A. Initialize Hosting

Hosting is configured in `firebase.json`. Deploy with:

```bash
npm run deploy:hosting
```

#### B. Configure Custom Domain (Optional)

1. Go to **Hosting** → **Custom domains**
2. Click **Add custom domain**
3. Enter your domain (e.g., `deercamp.com`)
4. Follow DNS configuration steps:
   - Add **A records** to your DNS provider
   - Wait for propagation (up to 24 hours)
   - Firebase auto-provisions SSL certificate

---

### 5. Google OAuth Advanced Setup 🔧

#### A. Configure OAuth Consent Screen

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select project: `deercamp-3b648`
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure:
   - **App name**: DeerCamp
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **Authorized domains**: `deercamp-3b648.web.app`
   - **Developer contact**: Your email
5. Click **Save and Continue**
6. **Scopes**: Leave default (email, profile)
7. **Test users**: Add yourself for testing
8. Click **Save and Continue**

#### B. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `DeerCamp Web Client`
5. **Authorized JavaScript origins**:
   - `http://localhost:5173` (Vite dev server)
   - `https://deercamp-3b648.web.app`
   - `https://deercamp-3b648.firebaseapp.com`
6. **Authorized redirect URIs**:
   - `https://deercamp-3b648.firebaseapp.com/__/auth/handler`
7. Click **Create**
8. **Save your Client ID and Client Secret** (keep secure!)

---

### 6. Firestore Indexes ✅

Indexes are auto-created on first query. To create manually:

```bash
firebase deploy --only firestore:indexes
```

Or create in Console:
1. Go to **Firestore Database** → **Indexes**
2. Click **Create index**
3. Collection: `harvests`
4. Fields:
   - `userId` - Ascending
   - `date` - Descending
5. Query scope: **Collection**
6. Click **Create**

---

### 7. Firebase App Check (Recommended) 🛡️

Protects your backend from abuse and unauthorized access.

#### A. Register Your App

1. Go to **App Check**
2. Click **Get started**
3. Select your web app: `DeerCamp`
4. Choose provider: **reCAPTCHA v3** (recommended)

#### B. Get reCAPTCHA Keys

1. Go to: https://www.google.com/recaptcha/admin
2. Click **+** to create new site
3. Configure:
   - **Label**: DeerCamp
   - **reCAPTCHA type**: v3
   - **Domains**:
     - `localhost`
     - `deercamp-3b648.web.app`
     - Your custom domain (if any)
4. Click **Submit**
5. **Copy your Site Key**

#### C. Update Firebase Config

Add to `src/firebase/config.ts`:

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// After initializing app
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

#### D. Update Environment Variables

Add to `.env.local`:
```
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

Update config:
```typescript
provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
```

#### E. Enable Enforcement

1. Return to **App Check** in Firebase Console
2. Select **Firestore**
3. Click **Enforce** (start with **Metrics only** for testing)
4. Repeat for **Storage** and **Authentication**

---

### 8. Analytics & Performance Monitoring 📊

#### A. Enable Google Analytics

1. Go to **Analytics** → **Dashboard**
2. Click **Enable Google Analytics**
3. Select existing Analytics account or create new
4. Click **Enable Analytics**

#### B. Performance Monitoring (Optional)

Add to your `package.json`:
```bash
npm install firebase-performance
```

Add to `src/firebase/config.ts`:
```typescript
import { getPerformance } from "firebase/performance";

const perf = getPerformance(app);
```

---

### 9. Billing & Quotas 💰

#### A. Upgrade to Blaze Plan (Pay-as-you-go)

**Required for**:
- Production-level traffic
- Cloud Functions (future)
- Higher quotas

1. Go to **⚙️ Settings** → **Usage and billing**
2. Click **Modify plan**
3. Select **Blaze Plan**
4. Add payment method
5. **Set budget alerts!**

#### B. Set Budget Alerts

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Navigate to **Billing** → **Budgets & alerts**
3. Click **Create budget**
4. Configure:
   - **Name**: DeerCamp Monthly Budget
   - **Amount**: Your limit (e.g., $25/month)
   - **Threshold alerts**: 50%, 90%, 100%
   - **Email notifications**: Your email
5. Click **Finish**

#### C. Spark Plan (Free Tier) Limits

If staying on free tier, monitor:
- **Firestore**: 50k reads/day, 20k writes/day, 1GB storage
- **Storage**: 5GB, 1GB downloads/day
- **Hosting**: 10GB bandwidth/month
- **Authentication**: Unlimited

---

### 10. Security Best Practices 🔐

#### A. Test Security Rules

Use Firebase Emulator:
```bash
npm install -g firebase-tools
firebase emulators:start
```

Or use **Rules Playground** in Console:
1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground**
3. Test read/write operations

#### B. Set Up Backups

1. Go to **Firestore Database** → **Backups** (Blaze plan only)
2. Click **Create backup schedule**
3. Configure daily backups

#### C. Enable Email Verification (Recommended)

In `src/pages/LoginPage.tsx`, after user registration, add:

```typescript
import { sendEmailVerification } from "firebase/auth";

// After createUserWithEmailAndPassword
await sendEmailVerification(userCredential.user);
```

Update security rules to require verification:
```javascript
allow write: if request.auth != null && request.auth.token.email_verified;
```

---

## 🎯 Quick Verification Checklist

After completing setup, verify:

- [ ] ✅ Can register new user with email/password
- [ ] ✅ Can login with Google OAuth
- [ ] ✅ Can create harvest with photo upload
- [ ] ✅ Can view stands (real-time updates)
- [ ] ✅ Security rules block unauthorized access
- [ ] ✅ Storage rules prevent unauthorized uploads
- [ ] ✅ App deployed to Firebase Hosting
- [ ] ✅ Custom domain configured (if applicable)
- [ ] ✅ Budget alerts set up
- [ ] ✅ Analytics tracking user activity

---

## 🐛 Common Issues

### "Permission Denied" Errors

- Verify security rules are deployed
- Check user authentication status
- Test in Rules Playground

### Google OAuth Not Working

- Verify authorized domains in Firebase Console
- Check OAuth consent screen configuration
- Ensure redirect URIs match exactly

### Photo Uploads Failing

- Check Storage rules deployed
- Verify file size under 5MB
- Check file type is image/*
- Inspect browser console for errors

### App Not Loading After Deploy

- Clear browser cache
- Check Hosting deploy status: `firebase hosting:channel:list`
- Verify `dist/` folder built correctly
- Check browser console for errors

---

## 📞 Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Status**: https://status.firebase.google.com
- **Community Forums**: https://firebase.google.com/community
- **Stack Overflow**: Tag with `firebase`

---

**Setup completed by**: _______________
**Date**: _______________
**Project Status**: ☐ Development ☐ Staging ☐ Production

---

**Last Updated**: 2026-01-08
**DeerCamp Version**: 1.0
**Firebase Project**: deercamp-3b648
