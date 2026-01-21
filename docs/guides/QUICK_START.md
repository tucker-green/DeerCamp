# Quick Start Guide

Get DeerCamp running on your local machine in minutes.

## Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git** (optional, for cloning)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd DeerCamp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and Mapbox credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Development
VITE_USE_EMULATORS=false
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## First Steps

### Create an Account

1. Click "Get Started" on the landing page
2. Enter your email and password
3. Click "Sign Up"

### Create Your First Club

1. After login, you'll see a prompt to create or join a club
2. Click "Create Club"
3. Fill in:
   - Club name
   - Description
   - Location (city, state)
   - Visibility (public or private)
4. Click "Create Club"

### Add a Stand

1. Go to **Club** > **Property** tab (or via Bookings page)
2. Click "Add Stand"
3. Enter stand details:
   - Name (e.g., "North Ridge Ladder")
   - Type (ladder, climber, blind, box)
   - Description
4. Click "Save"

### Make a Booking

1. Go to **Bookings** page
2. Select a date
3. Click on an available stand
4. Choose time slot (Morning, Evening, All Day)
5. Confirm booking

### Log a Harvest

1. Go to **Harvests** page
2. Click "Log New Harvest"
3. Fill in details:
   - Species
   - Date
   - Weapon
   - Upload photo (optional)
4. Click "Save"

---

## Using Firebase Emulators (Recommended for Development)

The Firebase Emulator Suite provides a local development environment without using production resources.

### Start Emulators

```bash
npm run emulators
```

### Seed Test Data

In a new terminal:

```bash
npm run emulators:seed
```

### Start App with Emulators

```bash
npm run dev:emulator
```

### Test Accounts (with seeded data)

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@deercamp.test | password123 |
| Manager | manager@deercamp.test | password123 |
| Member | member1@deercamp.test | password123 |

### Emulator UI

Access the Firebase Emulator UI at [http://localhost:4000](http://localhost:4000) to:
- View/edit Firestore data
- Manage Auth users
- View Storage files
- Test Cloud Functions

---

## Project Structure Overview

```
DeerCamp/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level page components
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context providers
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript definitions
│   └── firebase/       # Firebase configuration
├── functions/          # Cloud Functions
├── docs/               # Documentation
└── public/             # Static assets
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:emulator` | Start with Firebase emulators |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run emulators` | Start Firebase emulators |
| `npm run emulators:seed` | Seed emulator with test data |
| `npm run deploy` | Build and deploy to Firebase |

---

## Common Issues

### "Missing Firebase configuration"

Ensure your `.env.local` file exists and has all required variables. Restart the dev server after changes.

### "Mapbox map not loading"

1. Check your Mapbox access token is correct
2. Ensure your token has the required scopes
3. Check browser console for specific errors

### "Permission denied" errors

1. Make sure you're logged in
2. Verify you have an active club selected
3. Check that your membership is approved

### Emulator issues

1. Ensure Firebase CLI is installed: `firebase --version`
2. Check no other services are using ports 4000, 8080, 9099, 9199, 5001
3. Try `firebase emulators:start --clear` to reset data

---

## Next Steps

- **[Installation Guide](./INSTALLATION.md)** - Detailed setup instructions
- **[Configuration Guide](./CONFIGURATION.md)** - Environment variables reference
- **[Local Development](./LOCAL_DEVELOPMENT.md)** - Development workflow
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production

---

## Getting Help

- Check the [FAQ](./FAQ.md)
- Review [existing issues](https://github.com/your-repo/issues)
- Contact the development team

---

*Happy Hunting!*
