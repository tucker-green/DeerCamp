# Local Development Guide

Best practices and workflows for developing DeerCamp locally.

## Development Setup

### Using Firebase Emulators (Recommended)

The Firebase Emulator Suite provides a complete local development environment.

**Start emulators:**
```bash
npm run emulators
```

**Start app with emulators:**
```bash
npm run dev:emulator
```

**Seed test data:**
```bash
npm run emulators:seed
```

### Using Production Firebase (Alternative)

For quick testing against real data:

```bash
npm run dev
```

**Note:** Changes affect production data. Use with caution.

---

## Emulator Details

### Services and Ports

| Service | Port | Access |
|---------|------|--------|
| Auth Emulator | 9099 | Automatic |
| Firestore Emulator | 8080 | Automatic |
| Storage Emulator | 9199 | Automatic |
| Functions Emulator | 5001 | Automatic |
| Emulator UI | 4000 | [localhost:4000](http://localhost:4000) |

### Emulator UI Features

Access at [http://localhost:4000](http://localhost:4000):

- **Authentication**: Create/edit users, view tokens
- **Firestore**: Browse/edit collections, run queries
- **Storage**: View uploaded files
- **Functions**: View logs, trigger functions
- **Requests**: See all Firebase requests

---

## Test Data

### Seeded Test Accounts

After running `npm run emulators:seed`:

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@deercamp.test | password123 |
| Manager | manager@deercamp.test | password123 |
| Member | member1@deercamp.test | password123 |
| Member | member2@deercamp.test | password123 |

### Seeded Data

- **Club**: "Test Hunting Club" with location in Mississippi
- **Stands**: 5 stands of various types
- **Bookings**: Sample bookings for testing
- **Harvests**: Sample harvest records
- **Posts**: Sample feed posts

### Custom Test Data

Create your own seed script in `scripts/`:

```typescript
// scripts/customSeed.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize with emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

initializeApp({ projectId: 'demo-deercamp' });

const db = getFirestore();
const auth = getAuth();

async function seed() {
  // Create users
  await auth.createUser({
    uid: 'test-user-1',
    email: 'test@example.com',
    password: 'testpass123'
  });
  
  // Create documents
  await db.collection('clubs').doc('test-club').set({
    name: 'Test Club',
    ownerId: 'test-user-1',
    // ...
  });
}

seed().then(() => console.log('Done!'));
```

Run with:
```bash
npx tsx scripts/customSeed.ts
```

---

## Development Workflow

### Feature Development

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Start development environment**
   ```bash
   npm run emulators  # Terminal 1
   npm run dev:emulator  # Terminal 2
   ```

3. **Make changes**
   - Edit components/pages/hooks
   - Hot reload updates automatically

4. **Test changes**
   - Verify in browser
   - Check emulator UI for data changes
   - Test different user roles

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

### Bug Fixes

1. **Reproduce the bug**
   - Set up test data in emulator
   - Document steps to reproduce

2. **Fix the issue**
   - Make minimal changes
   - Add error handling if needed

3. **Verify fix**
   - Test the fix
   - Test that nothing else broke

4. **Commit**
   ```bash
   git commit -m "fix: resolve issue with X"
   ```

---

## Debugging

### Browser DevTools

- **Console**: JavaScript errors, logs
- **Network**: API requests, responses
- **Application**: Storage, cookies, service workers
- **React DevTools**: Component hierarchy, props, state

### Firestore Debugging

Add logging to hooks:

```typescript
const { stands, loading, error } = useStands();

useEffect(() => {
  console.log('Stands:', stands);
  console.log('Loading:', loading);
  console.log('Error:', error);
}, [stands, loading, error]);
```

### Auth Debugging

Check auth state:

```typescript
const { user, profile, loading } = useAuth();

useEffect(() => {
  console.log('User:', user);
  console.log('Profile:', profile);
  console.log('Token:', user?.getIdTokenResult());
}, [user, profile]);
```

### Cloud Function Debugging

View function logs in Emulator UI or:

```bash
firebase functions:log
```

---

## Hot Reload Notes

### What Hot Reloads

- Component changes
- Style changes (CSS/Tailwind)
- Hook logic changes

### What Requires Refresh

- Context provider changes
- Route changes
- Environment variable changes
- Firebase configuration changes

### What Requires Restart

- `vite.config.js` changes
- `package.json` changes
- New dependencies

---

## Common Development Tasks

### Add a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link if needed

### Add a New Component

1. Create component in `src/components/`
2. Export from component or use directly
3. Document props with TypeScript interface

### Add a New Hook

1. Create hook in `src/hooks/`
2. Follow existing patterns (loading, error states)
3. Export from hook file

### Add a New Type

1. Add to `src/types/index.ts`
2. Export from types file
3. Use in components/hooks

### Add a New Collection

1. Define type in `src/types/index.ts`
2. Create hook in `src/hooks/`
3. Add security rules in `firestore.rules`
4. Add indexes if needed in `firestore.indexes.json`
5. Deploy rules: `npm run deploy:rules`

---

## Performance Tips

### Development Mode

- React strict mode causes double renders (normal)
- Hot reload may cause temporary state issues
- Emulator may be slower than production

### Optimization Testing

Use production build to test performance:

```bash
npm run build
npm run preview
```

### Profiling

Use React DevTools Profiler:
1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Perform actions
5. Stop recording
6. Analyze render times

---

## Emulator Data Persistence

### Export Data

```bash
npm run emulators:export
```

Saves to `./emulator-data/`

### Import Data

```bash
npm run emulators:import
```

Loads from `./emulator-data/`

### Reset Data

```bash
firebase emulators:start --clear
```

---

## Troubleshooting

### "Port already in use"

```bash
# Find process using port
npx kill-port 5173 8080 9099 4000

# Or specify different ports
PORT=3000 npm run dev
```

### "Cannot connect to emulator"

1. Ensure emulators are running
2. Check `VITE_USE_EMULATORS=true`
3. Verify ports match in `firebase.json`

### Hot reload not working

1. Check for syntax errors
2. Try hard refresh (Ctrl+Shift+R)
3. Restart dev server

### Authentication issues

1. Clear browser storage
2. Check emulator Auth tab
3. Verify user exists and is active

---

*Local development guide for DeerCamp*
