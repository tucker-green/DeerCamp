# Local Development Guide

This guide explains how to set up and use the Firebase Emulator for local DeerCamp development.

## Why Use the Emulator?

- **Isolated Environment**: Test without affecting production data
- **Free**: No Firebase usage charges during development
- **Fast**: No network latency, instant data operations
- **Safe**: Experiment freely, data resets between sessions
- **Offline**: Works without internet connection

---

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Install new dev dependencies (tsx, cross-env)
npm install
```

### 2. Start the Emulators

Open **Terminal 1**:
```bash
npm run emulators
```

This starts:
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### 3. Seed Test Data

Open **Terminal 2**:
```bash
npm run emulators:seed
```

This creates:
- 5 test users (owner, manager, 3 members)
- 1 hunting club ("North Ridge Hunting Club")
- 5 stands (various types)
- 4 bookings (upcoming)
- 4 harvests (including a club record buck!)
- 6 feed posts (announcements, harvests, updates)

### 4. Start Development Server

Open **Terminal 3**:
```bash
npm run dev:emulator
```

### 5. Log In and Test

Open http://localhost:5175 and log in with:

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Owner   | owner@deercamp.test      | password123  |
| Manager | manager@deercamp.test    | password123  |
| Member  | member1@deercamp.test    | password123  |
| Member  | member2@deercamp.test    | password123  |
| Member  | member3@deercamp.test    | password123  |

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run emulators` | Start Firebase Emulators |
| `npm run emulators:seed` | Populate emulators with test data |
| `npm run emulators:export` | Save emulator data to `./emulator-data/` |
| `npm run emulators:import` | Start emulators with saved data |
| `npm run dev:emulator` | Start Vite connected to emulators |
| `npm run dev` | Start Vite connected to **production** |

---

## Detailed Setup

### Prerequisites

1. **Node.js** 18+ installed
2. **Java** 11+ installed (required for Firestore Emulator)
   - Check: `java -version`
   - Install: https://adoptium.net/
3. **Firebase CLI** installed globally
   - Check: `firebase --version`
   - Install: `npm install -g firebase-tools`

### Verifying Java Installation

The Firestore Emulator requires Java. If you see errors about Java:

**Windows:**
```bash
# Check if Java is installed
java -version

# If not installed, use Chocolatey
choco install temurin17
```

**macOS:**
```bash
# Check if Java is installed
java -version

# If not installed, use Homebrew
brew install openjdk@17
```

**Linux:**
```bash
# Check if Java is installed
java -version

# If not installed
sudo apt install openjdk-17-jdk  # Debian/Ubuntu
sudo dnf install java-17-openjdk # Fedora
```

---

## Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Browser                              │
│                    http://localhost:5175                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Vite Dev Server                              │
│              VITE_USE_EMULATORS=true                             │
└─────────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│   Auth Emulator   │ │Firestore Emulator │ │ Storage Emulator  │
│   localhost:9099  │ │  localhost:8080   │ │  localhost:9199   │
└───────────────────┘ └───────────────────┘ └───────────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
                    ┌───────────────────┐
                    │   Emulator UI     │
                    │  localhost:4000   │
                    └───────────────────┘
```

### File Structure

```
DeerCamp/
├── firebase.json              # Emulator port configuration
├── .env.example               # Environment variable template
├── .env.local                 # Your local config (gitignored)
├── scripts/
│   └── seedEmulator.ts        # Test data generation script
├── emulator-data/             # Exported emulator data (gitignored)
└── src/
    └── firebase/
        └── config.ts          # Emulator connection logic
```

---

## Test Data Overview

### Users

| Name           | Email                    | Role    | Notes                    |
|----------------|--------------------------|---------|--------------------------|
| John Hunter    | owner@deercamp.test      | Owner   | Club owner, tagged buck  |
| Sarah Woods    | manager@deercamp.test    | Manager | Manages property         |
| Mike Thompson  | member1@deercamp.test    | Member  | Has upcoming booking     |
| Emily Davis    | member2@deercamp.test    | Member  | Tagged a hog             |
| Robert Wilson  | member3@deercamp.test    | Member  | Currently checked-in     |

### Stands

| Name               | Type    | Status      | Notes                          |
|--------------------|---------|-------------|--------------------------------|
| Ridge Top Tower    | Box     | Available   | Best morning spot, heated      |
| Creek Bottom Ladder| Ladder  | Available   | Great for evening hunts        |
| Oak Hollow Climber | Climber | Available   | Portable, mature oaks          |
| Turkey Ridge Blind | Blind   | Available   | Primary turkey hunting spot    |
| Power Line Stand   | Ladder  | Maintenance | Steps need replacement         |

### Bookings

| Hunter          | Stand              | When           | Status     |
|-----------------|-------------------|----------------|------------|
| Mike Thompson   | Ridge Top Tower   | Tomorrow AM    | Confirmed  |
| Emily Davis     | Creek Bottom      | This Weekend   | Confirmed  |
| Sarah Woods     | Oak Hollow        | Next Week      | Confirmed  |
| Robert Wilson   | Turkey Ridge      | Today          | Checked-In |

### Harvests

| Hunter       | Species | Details                    | Notes              |
|--------------|---------|----------------------------|-------------------|
| John Hunter  | Deer    | 10pt buck, 185 lbs, 18.5"  | Club Record!      |
| Mike Thompson| Deer    | Doe, 125 lbs, bow kill     | Heart shot        |
| Sarah Woods  | Turkey  | Gobbler, 10.5" beard       | Spring season     |
| Emily Davis  | Hog     | Boar, 220 lbs              | Made into sausage |

---

## Emulator UI

Access the Emulator UI at **http://localhost:4000** to:

- **View Data**: Browse Firestore collections
- **Edit Data**: Modify documents directly
- **Manage Auth**: Create/delete users, reset passwords
- **View Logs**: See emulator activity
- **Clear Data**: Reset specific collections

### Firestore Tab

Navigate to: http://localhost:4000/firestore

Browse collections:
- `users` - User profiles
- `clubs` - Hunting clubs
- `clubMemberships` - User-club relationships
- `stands` - Hunting stands
- `bookings` - Stand reservations
- `harvests` - Game harvests
- `posts` - Activity feed

### Auth Tab

Navigate to: http://localhost:4000/auth

- View all test users
- Copy user UIDs
- Sign out specific users
- Delete users

---

## Persisting Data

By default, emulator data is lost when you stop the emulators.

### Save Your Data

```bash
# Export current emulator state
npm run emulators:export
```

This saves to `./emulator-data/` (gitignored).

### Load Saved Data

```bash
# Start emulators with saved data
npm run emulators:import
```

### Workflow

1. Start fresh: `npm run emulators`
2. Seed data: `npm run emulators:seed`
3. Make changes in the app
4. Save state: `npm run emulators:export`
5. Next session: `npm run emulators:import`

---

## Switching Between Emulator and Production

### Use Emulator (Local Testing)

```bash
# Terminal 1: Start emulators
npm run emulators

# Terminal 2: Start app connected to emulators
npm run dev:emulator
```

Console will show:
```
🔧 Connecting to Firebase Emulators...
  ✅ Auth Emulator connected (port 9099)
  ✅ Firestore Emulator connected (port 8080)
  ✅ Storage Emulator connected (port 9199)
🎉 Firebase Emulators ready! UI at http://localhost:4000
```

### Use Production (Real Data)

```bash
# Just start the regular dev server
npm run dev
```

No emulator messages will appear.

### Manual Toggle

You can also manually set the environment variable:

```bash
# Windows CMD
set VITE_USE_EMULATORS=true && npm run dev

# Windows PowerShell
$env:VITE_USE_EMULATORS="true"; npm run dev

# macOS/Linux
VITE_USE_EMULATORS=true npm run dev
```

Or edit `.env.local`:
```env
VITE_USE_EMULATORS=true
```

---

## Troubleshooting

### "Port already in use"

Another process is using an emulator port.

```bash
# Find process using port 8080 (Firestore)
# Windows
netstat -ano | findstr :8080

# macOS/Linux
lsof -i :8080

# Kill the process or use different ports in firebase.json
```

### "Java not found"

The Firestore Emulator requires Java 11+.

```bash
# Verify Java installation
java -version

# Should show: openjdk version "17.0.x" or similar
```

### "Cannot connect to emulators"

1. Ensure emulators are running (`npm run emulators`)
2. Ensure you're using `npm run dev:emulator` (not `npm run dev`)
3. Check browser console for connection messages

### "Authentication failed"

In emulator mode, use the test credentials:
- `owner@deercamp.test` / `password123`
- `manager@deercamp.test` / `password123`
- `member1@deercamp.test` / `password123`

Your production Google account won't work with the Auth Emulator.

### "No data showing"

Run the seed script after starting emulators:
```bash
npm run emulators:seed
```

### "Seed script fails"

Ensure:
1. Emulators are running first
2. You have the required dependencies: `npm install`
3. Check for TypeScript errors in the console

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_EMULATORS` | `false` | Connect to local emulators |
| `VITE_FIREBASE_API_KEY` | - | Firebase API key (still needed) |
| `VITE_FIREBASE_PROJECT_ID` | - | Firebase project ID |

Note: Even with emulators, you need valid Firebase config in `.env.local` for the SDK to initialize properly. The emulator connection overrides where data is actually stored.

---

## Best Practices

### Do

- ✅ Use emulators for all local development
- ✅ Seed data after starting fresh emulators
- ✅ Export data before stopping if you want to keep it
- ✅ Test security rules locally before deploying
- ✅ Use consistent test credentials across team

### Don't

- ❌ Don't commit `.env.local` (contains real credentials)
- ❌ Don't commit `emulator-data/` (local state)
- ❌ Don't use production credentials in emulator mode
- ❌ Don't forget to restart emulators after config changes

---

## Security Rules Testing

Test your Firestore security rules locally:

```bash
# Emulators apply rules from firestore.rules
# Any rule violations will show in the Emulator UI logs
```

### Viewing Rule Evaluations

1. Open Emulator UI: http://localhost:4000
2. Go to Firestore tab
3. Click "Requests" to see all operations
4. Failed operations show which rule blocked them

---

## CI/CD Integration

For automated testing, you can run emulators in CI:

```yaml
# GitHub Actions example
- name: Start Firebase Emulators
  run: |
    npm install -g firebase-tools
    firebase emulators:exec --only firestore,auth "npm test"
```

---

## Additional Resources

- [Firebase Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite)
- [Connect App to Emulators](https://firebase.google.com/docs/emulator-suite/connect_and_prototype)
- [Security Rules Testing](https://firebase.google.com/docs/rules/emulator-setup)

---

## Summary

| Step | Command | What It Does |
|------|---------|--------------|
| 1 | `npm install` | Install dependencies |
| 2 | `npm run emulators` | Start local Firebase |
| 3 | `npm run emulators:seed` | Add test data |
| 4 | `npm run dev:emulator` | Start app |
| 5 | Login with test account | `owner@deercamp.test` / `password123` |

**Emulator UI**: http://localhost:4000
**App**: http://localhost:5175

Happy hunting! 🦌
