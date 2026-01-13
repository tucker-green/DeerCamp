# 🧠 ULTRATHINK: Multi-Club Deployment + Trophy Book Implementation

**Date:** 2026-01-12
**Author:** Claude Sonnet 4.5
**Status:** Deep Analysis & Implementation Plan

---

## 📋 PART 1: DEPLOY & TEST MULTI-CLUB (Critical)

### Current Status Assessment

✅ **COMPLETED:**
- Multi-club data model with ClubMembership junction table
- Updated AuthContext with club switching
- All hooks filter by activeClubId
- Firestore security rules written
- All components migrated from deprecated fields
- Zero code-level issues remaining

🔴 **NOT YET DONE:**
- Firestore rules not deployed to Firebase
- No data migration run (if existing data exists)
- Multi-club functionality not tested end-to-end
- Production deployment not verified

### Security Rules Analysis

**File:** `firestore.rules`

**✅ STRENGTHS:**
1. **Comprehensive permission model** - Every collection has proper access control
2. **Per-club role checking** - Uses ClubMembership for authorization, not global roles
3. **Data isolation enforced** - Users can only access clubs they're members of
4. **Join request workflow** - Proper approval process for public clubs
5. **Default deny** - Explicit deny-all at end prevents accidental exposure

**⚠️ POTENTIAL ISSUES IDENTIFIED:**

1. **ClubMembership ID Pattern Dependency** (Line 15, 20, 27, etc.)
   ```javascript
   clubMemberships/$(clubId + '_' + request.auth.uid)
   ```
   - **Issue**: This assumes document IDs follow exact pattern `{clubId}_{userId}`
   - **Risk**: If any ClubMembership created with different ID, security breaks
   - **Verification Needed**: Check all ClubMembership creation code uses this exact pattern
   - **Files to Audit**:
     - `src/hooks/useClubs.ts` (createClub function)
     - `src/hooks/useClubJoinRequests.ts` (approveRequest function)
     - `src/hooks/useInvites.ts` (acceptInvite function)

2. **Public Club Visibility** (Line 67)
   ```javascript
   allow read: if resource.data.isPublic == true || isMember(clubId);
   ```
   - **Safe**: Public clubs readable by all, but only members see details via isMember()
   - ✅ No issue - this is correct for discovery

3. **Harvest Collection** (Line 152-165)
   - Members can create their own harvests ✅
   - Members can only update/delete their own harvests ✅
   - **Missing**: Managers cannot edit member harvests
   - **Decision**: Is this intentional? (Probably yes - harvest data is personal)

### Deployment Checklist

#### Step 1: Verify ClubMembership ID Pattern Consistency

**Action:** Search codebase for all ClubMembership creation

```bash
# Search for ClubMembership document creation
grep -r "setDoc.*clubMemberships" src/
grep -r "addDoc.*clubMemberships" src/
grep -r "doc(db, 'clubMemberships'" src/
```

**Expected Pattern Everywhere:**
```typescript
const membershipId = `${clubId}_${userId}`;
await setDoc(doc(db, 'clubMemberships', membershipId), { ... });
```

**Critical Files to Check:**
1. `src/hooks/useClubs.ts` - createClub function (creates owner membership)
2. `src/hooks/useClubJoinRequests.ts` - approveRequest (creates membership)
3. `src/hooks/useInvites.ts` - acceptInvite (creates membership)
4. `src/pages/CreateClubPage.tsx` - if it creates membership directly

#### Step 2: Deploy Firestore Rules

```bash
cd D:\Projects\DeerCamp
firebase deploy --only firestore:rules
```

**Expected Output:**
```
=== Deploying to 'your-project-id'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

**If Errors:**
- Check firestore.rules syntax
- Verify Firebase project is initialized (`firebase projects:list`)
- Check Firebase CLI authentication (`firebase login`)

#### Step 3: Data Migration (If Needed)

**Check if migration is needed:**
```bash
# Check if users have old clubId field
# Check Firebase Console -> Firestore -> users collection
```

**Signs you need migration:**
- Users have `clubId` field (singular, deprecated)
- Users missing `clubIds` array or `activeClubId`
- No documents in `clubMemberships` collection
- Existing stands/bookings/harvests have no `clubId` field

**If migration needed, create migration script:**

**File:** `src/scripts/migrateToMultiClub.ts`

```typescript
import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

async function migrateToMultiClub() {
  console.log('🚀 Starting multi-club migration...');

  const batch = writeBatch(db);
  let usersMigrated = 0;
  let clubsMigrated = 0;
  let membershipsCreated = 0;

  try {
    // 1. Migrate Users
    console.log('\n📝 Migrating users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      // Skip if already migrated
      if (userData.clubIds && userData.activeClubId) {
        console.log(`  ⏭️  User ${userDoc.id} already migrated`);
        continue;
      }

      if (userData.clubId) {
        // Create ClubMembership
        const membershipId = `${userData.clubId}_${userDoc.id}`;
        const membershipRef = doc(db, 'clubMemberships', membershipId);

        batch.set(membershipRef, {
          userId: userDoc.id,
          clubId: userData.clubId,
          role: userData.role || 'member',
          membershipTier: userData.membershipTier || 'full',
          membershipStatus: 'active',
          approvalStatus: 'approved',
          duesStatus: userData.duesStatus || 'paid',
          joinDate: userData.joinDate || userData.createdAt || new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        membershipsCreated++;

        // Update user
        const userRef = doc(db, 'users', userDoc.id);
        batch.update(userRef, {
          clubIds: [userData.clubId],
          activeClubId: userData.clubId
        });
        usersMigrated++;

        console.log(`  ✅ Migrated user: ${userDoc.id} -> club: ${userData.clubId}`);
      }
    }

    // 2. Migrate Clubs
    console.log('\n📝 Migrating clubs...');
    const clubsSnapshot = await getDocs(collection(db, 'clubs'));

    for (const clubDoc of clubsSnapshot.docs) {
      const clubData = clubDoc.data();

      // Skip if already has new fields
      if (clubData.hasOwnProperty('isPublic')) {
        console.log(`  ⏭️  Club ${clubDoc.id} already migrated`);
        continue;
      }

      const clubRef = doc(db, 'clubs', clubDoc.id);
      batch.update(clubRef, {
        isPublic: false,  // Make existing clubs private by default
        requiresApproval: true,
        allowGuests: false,
        memberLimit: null,
        tags: [],
        createdAt: clubData.createdAt || new Date().toISOString()
      });
      clubsMigrated++;

      console.log(`  ✅ Migrated club: ${clubDoc.id}`);
    }

    // 3. Add clubId to old stands/bookings/harvests if missing
    console.log('\n📝 Checking stands, bookings, harvests for clubId...');

    const collections = ['stands', 'bookings', 'harvests'];
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      let updated = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (!data.clubId && data.userId) {
          // Try to find user's clubId
          const userDoc = await getDocs(collection(db, 'users'));
          const user = userDoc.docs.find(u => u.id === data.userId);

          if (user && user.data().clubId) {
            const docRef = doc(db, collectionName, docSnap.id);
            batch.update(docRef, { clubId: user.data().clubId });
            updated++;
          }
        }
      }

      if (updated > 0) {
        console.log(`  ✅ Updated ${updated} ${collectionName} documents with clubId`);
      }
    }

    // Commit batch
    await batch.commit();

    console.log('\n✅ Migration complete!');
    console.log(`   Users migrated: ${usersMigrated}`);
    console.log(`   Clubs migrated: ${clubsMigrated}`);
    console.log(`   Memberships created: ${membershipsCreated}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateToMultiClub()
  .then(() => {
    console.log('\n🎉 All done! Multi-club migration successful.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
```

**To run migration:**
```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run migration
npx ts-node src/scripts/migrateToMultiClub.ts
```

#### Step 4: Testing Plan

**Test Suite: Multi-Club Functionality**

**Test Environment Setup:**
1. Create 2 test clubs in Firebase Console
2. Create 2 test users
3. Create ClubMemberships for different scenarios

**Test Case 1: Club Switching**
- [ ] Log in as User A
- [ ] Verify ClubSwitcher shows all user's clubs
- [ ] Switch to Club 1
- [ ] Verify all data (stands, bookings, members) from Club 1
- [ ] Switch to Club 2
- [ ] Verify all data changes to Club 2's data
- [ ] Verify activeClubId persists after page refresh

**Test Case 2: Data Isolation**
- [ ] Log in as User A (member of Club 1 only)
- [ ] Attempt to view Club 2's data via URL manipulation
- [ ] Verify permission denied / no data shown
- [ ] Verify cannot book stands from Club 2
- [ ] Verify cannot see Club 2's members

**Test Case 3: Join Request Workflow**
- [ ] Create public club as User A
- [ ] Log out, log in as User B (not a member)
- [ ] Navigate to Club Discovery
- [ ] Find public club
- [ ] Submit join request
- [ ] Log back in as User A (owner)
- [ ] See pending join request
- [ ] Approve request
- [ ] Verify User B now has access to club

**Test Case 4: Invite System**
- [ ] Log in as Club Owner
- [ ] Navigate to Members -> Invite Member
- [ ] Send invite to test email
- [ ] Log in as invited user
- [ ] Accept invite
- [ ] Verify ClubMembership created with correct role
- [ ] Verify user added to club's member list

**Test Case 5: Permission Checks**
- [ ] Log in as regular member (not owner/manager)
- [ ] Verify cannot create stands
- [ ] Verify cannot delete stands
- [ ] Verify can create own bookings
- [ ] Verify cannot delete others' bookings
- [ ] Log in as manager
- [ ] Verify can manage stands
- [ ] Verify can manage all bookings

**Test Case 6: Club Creation**
- [ ] Create new club
- [ ] Verify creator assigned as owner
- [ ] Verify ClubMembership created automatically
- [ ] Verify club appears in ClubSwitcher
- [ ] Verify club is active by default

**Automated Testing Script:**

**File:** `src/scripts/testMultiClub.ts`

```typescript
import { db, auth } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

async function testMultiClub() {
  console.log('🧪 Testing multi-club functionality...\n');

  // Test 1: Check ClubMembership creation pattern
  console.log('Test 1: Verifying ClubMembership ID pattern...');
  const membershipsSnapshot = await getDocs(collection(db, 'clubMemberships'));
  let correctPattern = 0;
  let incorrectPattern = 0;

  membershipsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const expectedId = `${data.clubId}_${data.userId}`;

    if (doc.id === expectedId) {
      correctPattern++;
    } else {
      incorrectPattern++;
      console.error(`  ❌ Incorrect ID pattern: ${doc.id}`);
      console.error(`     Expected: ${expectedId}`);
    }
  });

  console.log(`  ✅ Correct: ${correctPattern}`);
  if (incorrectPattern > 0) {
    console.error(`  ❌ Incorrect: ${incorrectPattern}`);
    throw new Error('ClubMembership IDs do not match security rules pattern!');
  }

  // Test 2: Check all users have clubIds and activeClubId
  console.log('\nTest 2: Verifying user migration...');
  const usersSnapshot = await getDocs(collection(db, 'users'));
  let migratedUsers = 0;
  let unmigrated = 0;

  usersSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.clubIds && data.activeClubId) {
      migratedUsers++;
    } else {
      unmigrated++;
      console.warn(`  ⚠️  User ${doc.id} not migrated`);
    }
  });

  console.log(`  ✅ Migrated users: ${migratedUsers}`);
  if (unmigrated > 0) {
    console.warn(`  ⚠️  Unmigrated users: ${unmigrated}`);
  }

  // Test 3: Check all clubs have new fields
  console.log('\nTest 3: Verifying club migration...');
  const clubsSnapshot = await getDocs(collection(db, 'clubs'));
  let migratedClubs = 0;
  let unmigratedClubs = 0;

  clubsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.hasOwnProperty('isPublic')) {
      migratedClubs++;
    } else {
      unmigratedClubs++;
      console.warn(`  ⚠️  Club ${doc.id} not migrated`);
    }
  });

  console.log(`  ✅ Migrated clubs: ${migratedClubs}`);
  if (unmigratedClubs > 0) {
    console.warn(`  ⚠️  Unmigrated clubs: ${unmigratedClubs}`);
  }

  // Test 4: Check all stands/bookings/harvests have clubId
  console.log('\nTest 4: Verifying club-scoped collections...');
  const collectionsToCheck = ['stands', 'bookings', 'harvests'];

  for (const collectionName of collectionsToCheck) {
    const snapshot = await getDocs(collection(db, collectionName));
    let withClubId = 0;
    let withoutClubId = 0;

    snapshot.docs.forEach(doc => {
      if (doc.data().clubId) {
        withClubId++;
      } else {
        withoutClubId++;
        console.warn(`  ⚠️  ${collectionName}/${doc.id} missing clubId`);
      }
    });

    console.log(`  ${collectionName}: ${withClubId} with clubId, ${withoutClubId} without`);
  }

  console.log('\n✅ All tests complete!');
}

testMultiClub()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  });
```

**Run tests:**
```bash
npx ts-node src/scripts/testMultiClub.ts
```

### Deployment Timeline

**Day 1 - Morning:**
1. ✅ Verify ClubMembership ID pattern in code (30 min)
2. 🔥 Deploy Firestore rules (5 min)
3. ✅ Test basic app functionality (15 min)

**Day 1 - Afternoon:**
4. 📊 Check if data migration needed (15 min)
5. 🔄 Run migration script if needed (30 min)
6. ✅ Run automated tests (15 min)

**Day 2:**
7. 🧪 Manual testing of all test cases (2-3 hours)
8. 🐛 Fix any bugs discovered
9. ✅ Final verification

---

## 📋 PART 2: TROPHY BOOK IMPLEMENTATION

### Vision & Philosophy

**Core Principle:** Every harvest tells a story. The Trophy Book isn't just a database—it's a living record of memories, learning, and brotherhood.

**Design Goals:**
1. **Respect the harvest** - Tasteful, educational, not gratuitous
2. **Tell the full story** - Context matters more than just the final photo
3. **Build wisdom** - Track patterns, learn from experience
4. **Honor achievement** - Recognize records and milestones
5. **Legal compliance** - Track tags, permits, reporting requirements

### Current State Analysis

**Existing Harvest Interface** (`src/types/index.ts:291-304`):

```typescript
export interface Harvest {
    id: string;
    clubId: string;
    userId: string;
    userName: string;
    date: string;
    species: 'deer' | 'turkey' | 'pigs' | 'other';
    sex?: 'male' | 'female';
    weight?: number;
    photoUrl?: string;
    standId?: string;
    notes?: string;
    createdAt?: string;
}
```

**Gap Analysis:**
- ❌ No multi-photo support (only single photoUrl)
- ❌ No detailed measurements (points, score, spread, etc.)
- ❌ No hunt story (time, weather, shot details)
- ❌ No species-specific fields (beard length, antler config, etc.)
- ❌ No tag/permit tracking
- ❌ No harvest analytics support
- ❌ No image storage configuration

### Enhanced Harvest Data Model

**New Comprehensive Interface:**

```typescript
// ===== SPECIES-SPECIFIC TYPES =====

export type DeerSpecies = 'whitetail' | 'mule-deer' | 'blacktail' | 'other-deer';
export type TurkeySubspecies = 'eastern' | 'merriam' | 'rio-grande' | 'osceola' | 'hybrid';
export type AntlerConfiguration = 'typical' | 'non-typical';
export type HarvestMethod = 'rifle' | 'bow' | 'crossbow' | 'muzzleloader' | 'shotgun' | 'handgun';
export type ScoringSystem = 'boone-crockett' | 'pope-young' | 'sci' | 'none';

// Deer-specific measurements
export interface DeerMeasurements {
    species: DeerSpecies;
    points: number;                    // Total antler points
    mainBeamLength: number;            // Inches
    insideSpread: number;              // Inches
    antlerConfiguration: AntlerConfiguration;
    scoringSystem: ScoringSystem;
    grossScore?: number;
    netScore?: number;
    estimatedAge?: number;             // Years
    girth?: number;                    // Chest girth in inches
    bodyLength?: number;               // Inches
    dressedWeight?: number;            // Pounds
    liveWeight?: number;               // Pounds (estimated)
    antlerMass?: 'light' | 'medium' | 'heavy';
    hasDropTine?: boolean;
    hasStickers?: boolean;
    uniqueCharacteristics?: string;     // Scars, broken tines, etc.
}

// Turkey-specific measurements
export interface TurkeyMeasurements {
    subspecies: TurkeySubspecies;
    beardLength: number;                // Inches
    hasMultipleBeards?: boolean;
    beardCount?: number;
    longestSpurLength: number;          // Inches
    shortestSpurLength?: number;        // Inches
    weight: number;                     // Pounds
    calledIn?: boolean;                 // Did you call it in?
    callSequence?: string;              // What calls worked
    gobblingActivity?: 'heavy' | 'moderate' | 'light' | 'silent';
}

// Hog-specific measurements
export interface HogMeasurements {
    weight: number;                     // Pounds
    tuskLength?: number;                // Inches
    estimatedAge?: number;
    sounderSize?: number;               // How many total in group
    damageControl?: boolean;            // Was this for crop damage control?
    notes?: string;
}

// ===== HUNT DETAILS =====

export interface HuntDetails {
    standId?: string;
    standName?: string;                 // Cached for display
    timeOfDay: string;                  // ISO timestamp
    temperature?: number;               // Fahrenheit
    windDirection?: string;             // N, NE, E, SE, S, SW, W, NW
    windSpeed?: number;                 // MPH
    barometricPressure?: number;        // inHg
    moonPhase?: string;                 // new, waxing-crescent, first-quarter, etc.
    weatherCondition?: string;          // clear, cloudy, rain, snow, etc.

    // Shot details
    shotDistance?: number;              // Yards
    shotPlacement?: string;             // "Double lung", "Heart", "Neck", etc.
    numberOfShots?: number;

    // Recovery details
    bloodTrailLength?: number;          // Yards
    bloodTrailQuality?: 'excellent' | 'good' | 'poor' | 'none';
    timeToRecovery?: number;            // Minutes from shot to recovery
    distanceRan?: number;               // Yards from shot location
    assistedBy?: string[];              // User IDs who helped

    // The story
    huntStory?: string;                 // Full narrative
    lessonLearned?: string;             // What did you learn?
    whatWorked?: string;                // Tactics that succeeded
    whatDidntWork?: string;             // What to do differently
}

// ===== TAG & PERMIT TRACKING =====

export interface TagInfo {
    tagNumber?: string;
    tagType?: string;                   // "Buck tag", "Doe tag", "Either-sex", etc.
    permitNumber?: string;
    huntingLicense?: string;
    stateReported?: boolean;            // Reported to state wildlife agency?
    reportedDate?: string;
    reportConfirmation?: string;        // Confirmation number from state
}

// ===== PHOTOS =====

export interface HarvestPhoto {
    url: string;
    caption?: string;
    type: 'field' | 'antler-closeup' | 'full-body' | 'unique-features' | 'butcher' | 'other';
    order: number;                      // For sorting
    uploadedAt: string;
}

// ===== MAIN HARVEST INTERFACE =====

export interface Harvest {
    id: string;
    clubId: string;
    userId: string;
    userName: string;                   // Cached for display

    // Basic info
    date: string;                       // ISO date string
    species: 'deer' | 'turkey' | 'hog' | 'waterfowl' | 'predator' | 'other';
    sex?: 'male' | 'female';
    harvestMethod: HarvestMethod;

    // Species-specific measurements
    deerData?: DeerMeasurements;
    turkeyData?: TurkeyMeasurements;
    hogData?: HogMeasurements;

    // Hunt details
    huntDetails?: HuntDetails;

    // Tags & permits
    tagInfo?: TagInfo;

    // Photos
    photos: HarvestPhoto[];
    primaryPhotoUrl?: string;           // Featured photo URL

    // Records & recognition
    isClubRecord?: boolean;
    recordCategory?: string;            // "Biggest buck", "Longest beard", etc.
    achievementBadges?: string[];       // Badge IDs earned from this harvest

    // General
    notes?: string;
    isPublic?: boolean;                 // Show in public feed?

    // Metadata
    createdAt: string;
    updatedAt: string;
}
```

### Firebase Storage Structure

**Photo Storage Pattern:**
```
harvests/
  {clubId}/
    {harvestId}/
      primary.jpg
      field-1.jpg
      antler-closeup-1.jpg
      full-body-1.jpg
      butcher-1.jpg
```

**Storage Rules (storage.rules):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Harvest photos
    match /harvests/{clubId}/{harvestId}/{filename} {
      allow read: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/clubMemberships/$(clubId + '_' + request.auth.uid));

      allow write: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/clubMemberships/$(clubId + '_' + request.auth.uid)) &&
        request.resource.size < 10 * 1024 * 1024 &&  // Max 10MB
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

### UI/UX Design

**Pages & Routes:**

1. **Harvest Log Page** (`/harvests`)
   - Gallery view of all club harvests
   - Filter by species, member, date, method
   - Sort by date, score, weight
   - Search functionality

2. **Log Harvest Page** (`/harvests/new`)
   - Multi-step form
   - Photo upload (drag & drop, camera, gallery)
   - Species-specific measurement forms
   - Hunt story editor
   - Tag info entry

3. **Harvest Detail Page** (`/harvests/:id`)
   - Full harvest display
   - All photos in gallery
   - Complete measurements
   - Hunt story
   - Comments from members
   - Share buttons

4. **Trophy Room** (`/trophy-room`)
   - Club records leaderboard
   - Hall of fame
   - Achievement showcase
   - Statistical visualizations

5. **My Harvests** (`/harvests/me`)
   - Personal harvest history
   - Personal statistics
   - Personal records

### Component Architecture

```
src/pages/
  HarvestsPage.tsx           - Main harvest log gallery
  LogHarvestPage.tsx         - Multi-step harvest entry form
  HarvestDetailPage.tsx      - Individual harvest view
  TrophyRoomPage.tsx         - Records and achievements

src/components/harvest/
  HarvestCard.tsx            - Thumbnail card for gallery
  HarvestPhotoGallery.tsx    - Photo viewer with zoom
  HarvestMeasurements.tsx    - Display measurements
  HarvestStory.tsx           - Hunt narrative display
  HarvestRecords.tsx         - Record badges display

  // Form components
  SpeciesSelector.tsx        - Species and sex selection
  PhotoUploader.tsx          - Multi-photo upload
  DeerMeasurementsForm.tsx   - Deer-specific fields
  TurkeyMeasurementsForm.tsx - Turkey-specific fields
  HogMeasurementsForm.tsx    - Hog-specific fields
  HuntDetailsForm.tsx        - Hunt conditions & story
  TagInfoForm.tsx            - Tag and permit entry

  // Analytics
  HarvestStats.tsx           - Personal statistics
  ClubRecords.tsx            - Club leaderboards
  AchievementBadges.tsx      - Badge display
```

### Data Hooks

**File:** `src/hooks/useHarvests.ts`

```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Harvest, HarvestPhoto } from '../types';

export function useHarvests(options: {
  clubId?: string;
  userId?: string;
  species?: string;
  limit?: number;
} = {}) {
  const { activeClubId } = useAuth();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetClubId = options.clubId || activeClubId;

  useEffect(() => {
    if (!targetClubId) {
      setHarvests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let q = query(
        collection(db, 'harvests'),
        where('clubId', '==', targetClubId),
        orderBy('date', 'desc')
      );

      if (options.userId) {
        q = query(q, where('userId', '==', options.userId));
      }

      if (options.species) {
        q = query(q, where('species', '==', options.species));
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const harvestData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Harvest));

          setHarvests(harvestData);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching harvests:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.error('Error setting up harvests listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [targetClubId, options.userId, options.species]);

  // Upload photos to Firebase Storage
  const uploadPhotos = async (harvestId: string, files: File[]): Promise<HarvestPhoto[]> => {
    if (!targetClubId) throw new Error('No active club');

    const uploadedPhotos: HarvestPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = `photo-${Date.now()}-${i}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `harvests/${targetClubId}/${harvestId}/${filename}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      uploadedPhotos.push({
        url,
        type: i === 0 ? 'field' : 'other',
        order: i,
        uploadedAt: new Date().toISOString()
      });
    }

    return uploadedPhotos;
  };

  // Create harvest
  const createHarvest = async (harvestData: Omit<Harvest, 'id' | 'createdAt' | 'updatedAt'>, photoFiles?: File[]): Promise<{ success: boolean; harvestId?: string; error?: string }> => {
    try {
      if (!targetClubId) {
        return { success: false, error: 'No active club selected' };
      }

      // Create harvest document
      const harvestRef = await addDoc(collection(db, 'harvests'), {
        ...harvestData,
        clubId: targetClubId,
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Upload photos if provided
      if (photoFiles && photoFiles.length > 0) {
        const uploadedPhotos = await uploadPhotos(harvestRef.id, photoFiles);

        // Update harvest with photo URLs
        await updateDoc(doc(db, 'harvests', harvestRef.id), {
          photos: uploadedPhotos,
          primaryPhotoUrl: uploadedPhotos[0]?.url,
          updatedAt: new Date().toISOString()
        });
      }

      return { success: true, harvestId: harvestRef.id };
    } catch (err: any) {
      console.error('Error creating harvest:', err);
      return { success: false, error: err.message };
    }
  };

  // Update harvest
  const updateHarvest = async (harvestId: string, updates: Partial<Harvest>): Promise<{ success: boolean; error?: string }> => {
    try {
      await updateDoc(doc(db, 'harvests', harvestId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error updating harvest:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete harvest
  const deleteHarvest = async (harvestId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // TODO: Delete photos from storage
      await deleteDoc(doc(db, 'harvests', harvestId));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting harvest:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    harvests,
    loading,
    error,
    createHarvest,
    updateHarvest,
    deleteHarvest
  };
}

// Convenience hooks
export function useMyHarvests() {
  const { user, activeClubId } = useAuth();
  return useHarvests({ clubId: activeClubId, userId: user?.uid });
}

export function useClubRecords(clubId?: string) {
  const { activeClubId } = useAuth();
  const { harvests, loading, error } = useHarvests({ clubId: clubId || activeClubId });

  // Calculate records
  const records = {
    biggestBuck: harvests
      .filter(h => h.species === 'deer' && h.deerData?.netScore)
      .sort((a, b) => (b.deerData?.netScore || 0) - (a.deerData?.netScore || 0))[0],

    heaviestDeer: harvests
      .filter(h => h.species === 'deer' && h.deerData?.liveWeight)
      .sort((a, b) => (b.deerData?.liveWeight || 0) - (a.deerData?.liveWeight || 0))[0],

    longestBeard: harvests
      .filter(h => h.species === 'turkey' && h.turkeyData?.beardLength)
      .sort((a, b) => (b.turkeyData?.beardLength || 0) - (a.turkeyData?.beardLength || 0))[0],

    longestShot: harvests
      .filter(h => h.huntDetails?.shotDistance)
      .sort((a, b) => (b.huntDetails?.shotDistance || 0) - (a.huntDetails?.shotDistance || 0))[0]
  };

  return { records, loading, error };
}
```

### Implementation Phases

**Phase 1: Core Harvest Logging (Week 1)**
- [ ] Update Harvest type with enhanced fields
- [ ] Create useHarvests hook
- [ ] Build LogHarvestPage with multi-step form
- [ ] Implement photo upload
- [ ] Basic harvest display (list view)

**Phase 2: Species-Specific Forms (Week 2)**
- [ ] DeerMeasurementsForm component
- [ ] TurkeyMeasurementsForm component
- [ ] HogMeasurementsForm component
- [ ] Hunt Details form
- [ ] Tag tracking form

**Phase 3: Display & Gallery (Week 2-3)**
- [ ] HarvestDetailPage with full display
- [ ] Photo gallery with lightbox
- [ ] Harvest story display
- [ ] Social features (comments, likes)

**Phase 4: Trophy Room & Records (Week 3)**
- [ ] Club records calculation
- [ ] TrophyRoomPage with leaderboards
- [ ] Achievement badge system
- [ ] Statistical visualizations

**Phase 5: Analytics & Insights (Week 4)**
- [ ] Personal harvest stats
- [ ] Club harvest analytics
- [ ] Success rate tracking
- [ ] Pattern recognition (time, weather, etc.)

### Success Metrics

**For Multi-Club Deployment:**
- ✅ Zero permission denied errors in production
- ✅ All users can switch clubs smoothly
- ✅ Data isolation verified (no cross-club data leaks)
- ✅ Join requests and invites working end-to-end

**For Trophy Book:**
- 🎯 80%+ of harvests logged within 24 hours
- 🎯 Average 3+ photos per harvest
- 🎯 50%+ of members viewing Trophy Room weekly
- 🎯 Club records automatically updated
- 🎯 Zero data loss or corruption

---

## 🎯 RECOMMENDED EXECUTION ORDER

**This Week (Days 1-2):**
1. ✅ Deploy Firestore rules
2. ✅ Run migration (if needed)
3. ✅ Complete testing

**Next Week (Days 3-7):**
1. 📋 Update Harvest type
2. 🎣 Create useHarvests hook
3. 📸 Build LogHarvestPage
4. 🖼️ Implement photo upload
5. 📱 Basic harvest list view

**Week 2:**
1. 🦌 Species-specific forms
2. 🎨 Harvest detail page
3. 🏆 Records calculation

**Week 3:**
1. 🏅 Trophy Room page
2. 📊 Analytics dashboard

---

**Total Estimated Time:**
- Multi-Club Deployment: 1-2 days
- Trophy Book MVP: 2-3 weeks

**Let's do this! 🚀**
