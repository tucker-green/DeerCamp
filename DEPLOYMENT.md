# 🚀 DeerCamp Deployment Guide

This guide covers deploying your DeerCamp hunting club management application to Firebase.

## Prerequisites

1. **Node.js** installed (v18 or higher recommended)
2. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```
3. **Firebase project** created: `deercamp-3b648`

---

## 🔧 Initial Setup (One-Time)

### 1. Login to Firebase

```bash
firebase login
```

This will open a browser window to authenticate with your Google account.

### 2. Verify Project Configuration

Check that you're connected to the correct project:

```bash
firebase projects:list
firebase use default
```

Should show: `deercamp-3b648`

---

## 🔐 Deploy Security Rules

**IMPORTANT**: Deploy security rules BEFORE deploying your app to production!

```bash
npm run deploy:rules
```

Or manually:
```bash
firebase deploy --only firestore:rules,storage:rules
```

This deploys:
- **Firestore Rules** (`firestore.rules`) - Secures your database
- **Storage Rules** (`storage.rules`) - Secures harvest photo uploads

### Verify Rules Deployment

1. Go to Firebase Console: https://console.firebase.google.com/project/deercamp-3b648
2. **Firestore**: Database → Rules tab
3. **Storage**: Storage → Rules tab

---

## 🌐 Deploy to Firebase Hosting

### Full Deployment (Hosting + Rules)

```bash
npm run deploy
```

This will:
1. Run TypeScript compiler
2. Build Vite production bundle
3. Deploy to Firebase Hosting
4. Deploy Firestore rules, Storage rules, and indexes

### Hosting Only (Faster)

```bash
npm run deploy:hosting
```

### Manual Deployment

```bash
# Build the app
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore
firebase deploy --only storage
```

---

## 🔍 Deployment Verification

### 1. Check Deployment Status

```bash
firebase hosting:channel:list
```

### 2. Access Your Live App

After deployment, your app will be available at:
- **Production URL**: https://deercamp-3b648.web.app
- **Alternative URL**: https://deercamp-3b648.firebaseapp.com

### 3. Test Critical Functionality

- ✅ User registration (email/password)
- ✅ User login (email/password)
- ✅ Google OAuth sign-in
- ✅ Create harvest with photo upload
- ✅ View stands (real-time updates)
- ✅ Reserve/release stands

---

## 🌍 Environment Variables for Production

### Local Development (.env.local)

Already configured with your Firebase credentials. This file is gitignored.

### CI/CD / Team Setup

Team members should:
1. Copy `.env.example` to `.env.local`
2. Add Firebase credentials (get from project owner)

### Production Environment

Firebase Hosting automatically uses your Firebase project configuration. No additional environment variables needed!

---

## 📊 Firestore Indexes

Indexes are automatically created when you deploy. Manual creation:

```bash
firebase deploy --only firestore:indexes
```

Required indexes are defined in `firestore.indexes.json`:
- **harvests**: `userId` (ASC) + `date` (DESC)

---

## 🔄 Continuous Deployment (Optional)

### GitHub Actions Setup

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: deercamp-3b648
```

---

## 🛡️ Security Checklist

Before going live, ensure:

- ✅ **Firestore Rules** deployed (not in test mode!)
- ✅ **Storage Rules** deployed (not in test mode!)
- ✅ **Authentication** enabled (Email/Password + Google OAuth)
- ✅ **Authorized domains** added to Firebase Console
- ✅ **App Check** enabled (optional but recommended)
- ✅ **Billing alerts** configured in Google Cloud Console
- ✅ **HTTPS** enabled (automatic with Firebase Hosting)

---

## 📈 Monitoring

### Firebase Console

Monitor your app at: https://console.firebase.google.com/project/deercamp-3b648

Key metrics to watch:
- **Authentication**: User signups/logins
- **Firestore**: Read/write operations
- **Storage**: Upload bandwidth
- **Hosting**: Traffic and bandwidth

### Set Budget Alerts

1. Go to Google Cloud Console
2. Billing → Budgets & alerts
3. Set monthly budget alerts

**Free tier limits**:
- Firestore: 50k reads/day, 20k writes/day
- Storage: 5GB, 1GB downloads/day
- Hosting: 10GB bandwidth/month

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Fails

```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

### Rules Not Working

```bash
# Force redeploy rules
firebase deploy --only firestore:rules --force
firebase deploy --only storage:rules --force
```

### Environment Variables Not Loading

- Ensure `.env.local` exists
- Restart Vite dev server: `npm run dev`
- Verify variable names start with `VITE_`

---

## 🔧 Rollback Deployment

### Hosting Rollback

```bash
# View deployment history
firebase hosting:clone

# Rollback to previous version
firebase hosting:rollback
```

---

## 📝 Deployment Logs

View deployment logs:

```bash
firebase hosting:channel:list
firebase hosting:channel:open <channel-id>
```

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server

# Build
npm run build                  # Build for production
npm run preview                # Preview production build

# Deploy
npm run deploy                 # Full deployment
npm run deploy:hosting         # Hosting only
npm run deploy:rules           # Security rules only

# Firebase CLI
firebase login                 # Login to Firebase
firebase logout                # Logout
firebase projects:list         # List projects
firebase use default           # Use deercamp-3b648
firebase serve                 # Test locally with Firebase
```

---

## 📞 Support

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Status: https://status.firebase.google.com
- Community Support: https://firebase.google.com/support

---

**Last Updated**: 2026-01-08
**Project**: DeerCamp v1.0
**Firebase Project**: deercamp-3b648
