# Deployment Guide

Instructions for deploying DeerCamp to Firebase Hosting.

## Prerequisites

- Firebase CLI installed and logged in
- Firebase project created and configured
- Environment variables set in `.env.local`

---

## Pre-Deployment Checklist

### 1. Verify Environment Variables

Ensure all required variables are set:

```bash
# Check .env.local exists and has values
cat .env.local
```

Required variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_MAPBOX_ACCESS_TOKEN`

### 2. Deploy Security Rules (CRITICAL)

**Always deploy rules before the first deployment or when rules change:**

```bash
npm run deploy:rules
```

This deploys:
- Firestore security rules (`firestore.rules`)
- Storage security rules (`storage.rules`)
- Firestore indexes (`firestore.indexes.json`)

### 3. Build the Application

```bash
npm run build
```

Verify no build errors. Check the `dist/` folder is created.

### 4. Test Locally

```bash
npm run preview
```

Open [http://localhost:4173](http://localhost:4173) and verify:
- Login works
- Pages load correctly
- No console errors

---

## Deployment Commands

### Full Deployment

Deploys hosting, rules, and functions:

```bash
npm run deploy
```

### Hosting Only (Faster)

For code-only changes:

```bash
npm run deploy:hosting
```

### Rules Only

For security rule updates:

```bash
npm run deploy:rules
```

### Functions Only

For Cloud Function changes:

```bash
firebase deploy --only functions
```

### Specific Components

```bash
# Firestore rules only
firebase deploy --only firestore:rules

# Storage rules only
firebase deploy --only storage

# Indexes only
firebase deploy --only firestore:indexes
```

---

## Deployment Process

### Step 1: Build

```bash
npm run build
```

Output:
```
vite v7.2.4 building for production...
✓ 1234 modules transformed.
dist/index.html                  1.23 kB │ gzip: 0.67 kB
dist/assets/index-abc123.js    775.42 kB │ gzip: 234.56 kB
dist/assets/index-abc123.css    45.67 kB │ gzip: 12.34 kB
✓ built in 5.67s
```

### Step 2: Deploy

```bash
firebase deploy
```

Output:
```
=== Deploying to 'deercamp-3b648'...

i  deploying firestore, storage, functions, hosting
i  firestore: reading indexes from firestore.indexes.json
✔  firestore: deployed rules
✔  firestore: deployed indexes
✔  storage: deployed rules
✔  functions: deployed functions
✔  hosting: deployed 15 files successfully

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/deercamp-3b648/overview
Hosting URL: https://deercamp-3b648.web.app
```

### Step 3: Verify

1. Open the Hosting URL
2. Test authentication
3. Test core features
4. Check browser console for errors

---

## Post-Deployment Verification

### Test Authentication

1. Log in with email/password
2. Log in with Google (if enabled)
3. Verify session persists after refresh

### Test Core Features

- [ ] Dashboard loads with stats
- [ ] Can create/view bookings
- [ ] Can log harvests
- [ ] Can view map
- [ ] Can switch clubs (if multiple)
- [ ] Photo upload works

### Check for Issues

1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Test on mobile device

---

## Rollback Procedures

### Hosting Rollback

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Hosting**
3. Click on **Release history**
4. Find previous working version
5. Click the three dots menu
6. Select **Rollback**

### Functions Rollback

Functions must be redeployed from a previous code version:

```bash
# Checkout previous commit
git checkout <commit-hash>

# Redeploy functions
firebase deploy --only functions

# Return to main branch
git checkout main
```

### Rules Rollback

Similar to functions - redeploy from previous code:

```bash
git checkout <commit-hash>
firebase deploy --only firestore:rules,storage
git checkout main
```

---

## Environment-Specific Deployments

### Development Environment

```bash
# Use development project
firebase use development

# Deploy
firebase deploy
```

### Staging Environment

```bash
firebase use staging
firebase deploy
```

### Production Environment

```bash
firebase use production
firebase deploy
```

### Switch Projects

```bash
# List configured projects
firebase projects:list

# Switch to a project
firebase use <project-id>

# Or use alias
firebase use production
```

---

## CI/CD Integration (Optional)

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
          VITE_MAPBOX_ACCESS_TOKEN: ${{ secrets.MAPBOX_ACCESS_TOKEN }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: deercamp-3b648
          channelId: live
```

---

## Monitoring

### Firebase Console

- **Analytics**: User engagement
- **Performance**: Load times, errors
- **Crashlytics**: Error tracking
- **Hosting**: Traffic, bandwidth

### Custom Monitoring

Consider adding:
- Sentry for error tracking
- Google Analytics events
- Custom logging to Firestore

---

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Failures

```bash
# Check Firebase status
firebase projects:list

# Verify authentication
firebase login --reauth

# Try with debug logging
firebase deploy --debug
```

### "Permission Denied" Errors

1. Verify security rules are deployed
2. Check user has correct membership
3. Review Firestore rules in console

### Hosting Not Updating

1. Clear browser cache (Ctrl+Shift+R)
2. Check deployment completed successfully
3. Verify correct project is selected

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Security rules deployed and tested
- [ ] Indexes deployed
- [ ] Cloud Functions deployed
- [ ] Build succeeds without errors
- [ ] Local preview works
- [ ] Authentication tested
- [ ] Core features tested
- [ ] Mobile responsiveness verified
- [ ] Error monitoring in place (optional)

---

*Deployment guide for DeerCamp*
