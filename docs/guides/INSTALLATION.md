# Installation Guide

Complete instructions for setting up DeerCamp for development.

## System Requirements

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or higher | JavaScript runtime |
| npm | 9.x or higher | Package manager |
| Firebase CLI | Latest | Firebase deployment |
| Git | Any | Version control |

### Optional Software

| Software | Purpose |
|----------|---------|
| VS Code | Recommended editor |
| Firebase Emulator Suite | Local development |
| Java 11+ | Required for Firestore emulator |

---

## Step-by-Step Installation

### 1. Install Node.js

Download from [nodejs.org](https://nodejs.org/) or use a version manager:

**Windows (with Chocolatey):**
```powershell
choco install nodejs-lts
```

**macOS (with Homebrew):**
```bash
brew install node@18
```

**Verify installation:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
```

**Login to Firebase:**
```bash
firebase login
```

**Verify installation:**
```bash
firebase --version
```

---

### 3. Clone the Repository

```bash
git clone <your-repo-url>
cd DeerCamp
```

---

### 4. Install Dependencies

**Root dependencies:**
```bash
npm install
```

**Cloud Functions dependencies:**
```bash
cd functions
npm install
cd ..
```

---

### 5. Firebase Project Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "deercamp-dev")
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (optional)
4. Save

#### Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select region (e.g., `us-central1`)
5. Click "Done"

#### Enable Storage

1. Go to **Storage**
2. Click "Get Started"
3. Accept security rules (we'll update them)
4. Select region
5. Click "Done"

#### Get Firebase Configuration

1. Go to **Project Settings** > **General**
2. Scroll to "Your apps"
3. Click the web icon (`</>`)
4. Register app with nickname (e.g., "DeerCamp Web")
5. Copy the configuration object

---

### 6. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Firebase Configuration (from step 5)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoi...

# Development Settings
VITE_USE_EMULATORS=false
```

---

### 7. Get Mapbox Token

1. Go to [Mapbox](https://account.mapbox.com/)
2. Create an account or sign in
3. Go to **Tokens**
4. Create a new token with:
   - `styles:read` scope
   - `fonts:read` scope
   - `geocoding:read` scope (optional, for search)
5. Copy the token to `VITE_MAPBOX_ACCESS_TOKEN`

---

### 8. Deploy Security Rules

**Deploy Firestore rules:**
```bash
firebase deploy --only firestore:rules
```

**Deploy Storage rules:**
```bash
firebase deploy --only storage
```

**Deploy indexes:**
```bash
firebase deploy --only firestore:indexes
```

Or all at once:
```bash
npm run deploy:rules
```

---

### 9. Deploy Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

---

### 10. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Firebase Emulator Setup (Recommended)

### Install Java (Required for Firestore Emulator)

**Windows:**
```powershell
choco install openjdk11
```

**macOS:**
```bash
brew install openjdk@11
```

### Start Emulators

```bash
npm run emulators
```

This starts:
- Auth Emulator: `localhost:9099`
- Firestore Emulator: `localhost:8080`
- Storage Emulator: `localhost:9199`
- Functions Emulator: `localhost:5001`
- Emulator UI: `localhost:4000`

### Configure App for Emulators

Set in `.env.local`:
```env
VITE_USE_EMULATORS=true
```

Or start with:
```bash
npm run dev:emulator
```

### Seed Test Data

```bash
npm run emulators:seed
```

---

## VS Code Setup (Recommended)

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Troubleshooting

### "Cannot find module" errors

```bash
rm -rf node_modules
npm install
```

### Firebase CLI not found

```bash
npm install -g firebase-tools
# or
npx firebase ...
```

### Emulator port conflicts

Check for processes using required ports:
```bash
# Windows
netstat -ano | findstr :8080

# macOS/Linux
lsof -i :8080
```

Kill the process or use different ports in `firebase.json`.

### TypeScript errors

```bash
npm run build
```

This will show all TypeScript errors. Fix them or check `tsconfig.json`.

### Mapbox not loading

1. Verify token is correct
2. Check token has required scopes
3. Look for CORS errors in browser console
4. Verify domain is allowed (for production tokens)

---

## Next Steps

- [Configuration Guide](./CONFIGURATION.md) - All environment variables
- [Local Development](./LOCAL_DEVELOPMENT.md) - Development workflow
- [Quick Start Guide](./QUICK_START.md) - Using the app

---

*Installation guide for DeerCamp*
