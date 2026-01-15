/**
 * DeerCamp Emulator Seed Script
 *
 * This script populates the Firebase Emulator with realistic test data.
 * Run with: npx tsx scripts/seedEmulator.ts
 *
 * Prerequisites:
 * - Firebase Emulators must be running (npm run emulators)
 * - Run this in a separate terminal
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase config for emulator (minimal config works)
const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
  projectId: 'deercamp-3b648',
  storageBucket: 'deercamp-3b648.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
connectFirestoreEmulator(db, 'localhost', 8080);
connectStorageEmulator(storage, 'localhost', 9199);

console.log('🔧 Connected to Firebase Emulators\n');

// ============== TEST DATA DEFINITIONS ==============

const TEST_USERS = [
  {
    email: 'owner@deercamp.test',
    password: 'password123',
    displayName: 'John Hunter',
    role: 'owner' as const
  },
  {
    email: 'manager@deercamp.test',
    password: 'password123',
    displayName: 'Sarah Woods',
    role: 'manager' as const
  },
  {
    email: 'member1@deercamp.test',
    password: 'password123',
    displayName: 'Mike Thompson',
    role: 'member' as const
  },
  {
    email: 'member2@deercamp.test',
    password: 'password123',
    displayName: 'Emily Davis',
    role: 'member' as const
  },
  {
    email: 'member3@deercamp.test',
    password: 'password123',
    displayName: 'Robert Wilson',
    role: 'member' as const
  }
];

const CLUB_ID = 'test-club-north-ridge';

const TEST_CLUB = {
  id: CLUB_ID,
  name: 'North Ridge Hunting Club',
  description: 'A family-friendly hunting club in the heart of Tennessee. 500 acres of prime whitetail habitat with multiple stands and food plots.',
  isPublic: true,
  requiresApproval: true,
  location: {
    city: 'Nashville',
    state: 'Tennessee',
    lat: 36.1627,
    lng: -86.7816
  },
  memberCount: 5,
  maxMembers: 20,
  tags: ['whitetail', 'turkey', 'family-friendly', 'food-plots'],
  propertyAcres: 500,
  allowGuests: true,
  guestPolicy: 'Guests must be accompanied by a full member at all times.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const TEST_STANDS = [
  {
    id: 'stand-ridge-top',
    name: 'Ridge Top Tower',
    type: 'box' as const,
    lat: 36.1650,
    lng: -86.7850,
    status: 'available' as const,
    description: 'Enclosed box blind overlooking main food plot. Heater equipped.',
    heightFeet: 15,
    capacity: 2,
    bestWindDirections: ['N', 'NE', 'NW'],
    condition: 'excellent' as const,
    notes: 'Best morning spot. Deer typically approach from the south ridge.'
  },
  {
    id: 'stand-creek-bottom',
    name: 'Creek Bottom Ladder',
    type: 'ladder' as const,
    lat: 36.1580,
    lng: -86.7780,
    status: 'available' as const,
    description: 'Classic ladder stand overlooking creek crossing.',
    heightFeet: 20,
    capacity: 1,
    bestWindDirections: ['S', 'SW', 'SE'],
    condition: 'good' as const,
    notes: 'Excellent for evening hunts. Bring mosquito spray in early season.'
  },
  {
    id: 'stand-oak-hollow',
    name: 'Oak Hollow Climber',
    type: 'climber' as const,
    lat: 36.1620,
    lng: -86.7900,
    status: 'available' as const,
    description: 'Portable climber location in mature oak grove.',
    heightFeet: 25,
    capacity: 1,
    bestWindDirections: ['E', 'W'],
    condition: 'good' as const,
    notes: 'Great during acorn drop. Multiple large oaks to choose from.'
  },
  {
    id: 'stand-turkey-ridge',
    name: 'Turkey Ridge Blind',
    type: 'blind' as const,
    lat: 36.1700,
    lng: -86.7820,
    status: 'available' as const,
    description: 'Ground blind on ridge overlooking strut zone.',
    heightFeet: 0,
    capacity: 2,
    bestWindDirections: ['N', 'S', 'E', 'W'],
    condition: 'excellent' as const,
    notes: 'Primary turkey hunting spot. Gobblers roost on adjacent ridge.'
  },
  {
    id: 'stand-power-line',
    name: 'Power Line Stand',
    type: 'ladder' as const,
    lat: 36.1550,
    lng: -86.7750,
    status: 'maintenance' as const,
    description: 'Stand overlooking power line cut. Great visibility.',
    heightFeet: 18,
    capacity: 1,
    bestWindDirections: ['N', 'NE'],
    condition: 'needs-repair' as const,
    notes: 'UNDER MAINTENANCE: Steps need replacement. Do not use until repaired.'
  }
];

// Helper function to get future dates
const getFutureDate = (daysFromNow: number, hour: number = 6) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const getPastDate = (daysAgo: number, hour: number = 6) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

// ============== SEED FUNCTIONS ==============

async function createUsersAndLogin(): Promise<Map<string, string>> {
  console.log('👤 Creating test users...');
  const userIds = new Map<string, string>();

  for (const userData of TEST_USERS) {
    try {
      // Try to create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      });

      userIds.set(userData.email, userCredential.user.uid);
      console.log(`   ✅ Created: ${userData.displayName} (${userData.email})`);

      // Sign out after creating
      await signOut(auth);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // User exists, sign in to get UID
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
          );
          userIds.set(userData.email, userCredential.user.uid);
          console.log(`   ⏭️  Exists: ${userData.displayName} (${userData.email})`);
          await signOut(auth);
        } catch (signInError) {
          console.error(`   ❌ Failed to sign in: ${userData.email}`);
        }
      } else {
        console.error(`   ❌ Failed: ${userData.email}`, error.message);
      }
    }
  }

  return userIds;
}

async function setupOwnerAndClub(userIds: Map<string, string>): Promise<void> {
  const ownerData = TEST_USERS[0]; // Owner is first user
  const ownerUid = userIds.get(ownerData.email);

  if (!ownerUid) {
    throw new Error('Owner user not found');
  }

  // Sign in as owner
  console.log('\n🔑 Signing in as owner...');
  await signInWithEmailAndPassword(auth, ownerData.email, ownerData.password);
  console.log(`   ✅ Signed in as: ${ownerData.displayName}`);

  // Create owner's user profile
  console.log('\n📋 Creating owner profile...');
  const ownerProfile = {
    uid: ownerUid,
    email: ownerData.email,
    displayName: ownerData.displayName,
    clubIds: [CLUB_ID],
    activeClubId: CLUB_ID,
    role: 'owner',
    joinDate: getPastDate(365),
    phone: '(615) 555-1001',
    address: {
      street: '100 Hunter Lane',
      city: 'Nashville',
      state: 'Tennessee',
      zip: '37203'
    },
    emergencyContact: {
      name: 'Jane Hunter',
      phone: '(615) 555-0911',
      relationship: 'Spouse'
    },
    lastActive: new Date().toISOString(),
    profileCompleteness: 95,
    createdAt: getPastDate(365)
  };
  await setDoc(doc(db, 'users', ownerUid), ownerProfile);
  console.log(`   ✅ Profile created`);

  // Create club
  console.log('\n🏠 Creating club...');
  const clubData = {
    ...TEST_CLUB,
    ownerId: ownerUid
  };
  await setDoc(doc(db, 'clubs', CLUB_ID), clubData);
  console.log(`   ✅ Created: ${TEST_CLUB.name}`);

  // Create owner's membership
  console.log('\n🎫 Creating owner membership...');
  const ownerMembershipId = `${CLUB_ID}_${ownerUid}`;
  const ownerMembership = {
    id: ownerMembershipId,
    userId: ownerUid,
    clubId: CLUB_ID,
    role: 'owner',
    membershipTier: 'full',
    membershipStatus: 'active',
    approvalStatus: 'approved',
    duesStatus: 'paid',
    duesPaidUntil: getFutureDate(365),
    joinDate: getPastDate(365),
    createdAt: getPastDate(365),
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'clubMemberships', ownerMembershipId), ownerMembership);
  console.log(`   ✅ Owner membership created`);
}

async function createOtherMembersData(userIds: Map<string, string>): Promise<void> {
  const ownerData = TEST_USERS[0];

  // Make sure we're signed in as owner (has permission to add members)
  if (!auth.currentUser || auth.currentUser.email !== ownerData.email) {
    await signInWithEmailAndPassword(auth, ownerData.email, ownerData.password);
  }

  console.log('\n👥 Creating other member profiles and memberships...');

  // Create profiles and memberships for other users (owner adds them)
  for (let i = 1; i < TEST_USERS.length; i++) {
    const userData = TEST_USERS[i];
    const uid = userIds.get(userData.email);
    if (!uid) continue;

    // Create membership (owner can add members)
    const membershipId = `${CLUB_ID}_${uid}`;
    const membership = {
      id: membershipId,
      userId: uid,
      clubId: CLUB_ID,
      role: userData.role,
      membershipTier: 'full',
      membershipStatus: 'active',
      approvalStatus: 'approved',
      duesStatus: 'paid',
      duesPaidUntil: getFutureDate(365),
      joinDate: getPastDate(Math.floor(Math.random() * 300) + 30),
      invitedBy: userIds.get(ownerData.email),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'clubMemberships', membershipId), membership);
    console.log(`   ✅ Membership: ${userData.displayName} (${userData.role})`);
  }

  // Now each user signs in to create their own profile
  for (let i = 1; i < TEST_USERS.length; i++) {
    const userData = TEST_USERS[i];
    const uid = userIds.get(userData.email);
    if (!uid) continue;

    // Sign in as this user
    await signInWithEmailAndPassword(auth, userData.email, userData.password);

    // Create their profile
    const userProfile = {
      uid,
      email: userData.email,
      displayName: userData.displayName,
      clubIds: [CLUB_ID],
      activeClubId: CLUB_ID,
      role: userData.role,
      joinDate: getPastDate(Math.floor(Math.random() * 300) + 30),
      phone: `(615) 555-${Math.floor(1000 + Math.random() * 9000)}`,
      address: {
        street: `${Math.floor(100 + Math.random() * 9000)} Hunter Lane`,
        city: 'Nashville',
        state: 'Tennessee',
        zip: '37203'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '(615) 555-0911',
        relationship: 'Spouse'
      },
      lastActive: new Date().toISOString(),
      profileCompleteness: 85,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid), userProfile);
    console.log(`   ✅ Profile: ${userData.displayName}`);

    await signOut(auth);
  }
}

async function createStands(userIds: Map<string, string>): Promise<void> {
  const ownerData = TEST_USERS[0];
  const ownerUid = userIds.get(ownerData.email);

  // Sign in as owner (manager/owner can create stands)
  await signInWithEmailAndPassword(auth, ownerData.email, ownerData.password);

  console.log('\n🎯 Creating stands...');

  for (const stand of TEST_STANDS) {
    const standData = {
      ...stand,
      clubId: CLUB_ID,
      createdAt: getPastDate(180),
      createdBy: ownerUid,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'stands', stand.id), standData);
    console.log(`   ✅ Stand: ${stand.name} (${stand.type})`);
  }
}

async function createBookings(userIds: Map<string, string>): Promise<void> {
  console.log('\n📅 Creating bookings...');

  const bookings = [
    {
      id: 'booking-tomorrow-morning',
      standId: 'stand-ridge-top',
      standName: 'Ridge Top Tower',
      userEmail: 'member1@deercamp.test',
      startTime: getFutureDate(1, 5),
      endTime: getFutureDate(1, 11),
      status: 'confirmed' as const,
      huntType: 'morning' as const,
      notes: 'First hunt of the season!'
    },
    {
      id: 'booking-weekend',
      standId: 'stand-creek-bottom',
      standName: 'Creek Bottom Ladder',
      userEmail: 'member2@deercamp.test',
      startTime: getFutureDate(3, 14),
      endTime: getFutureDate(3, 19),
      status: 'confirmed' as const,
      huntType: 'evening' as const,
      notes: 'Evening sit'
    },
    {
      id: 'booking-next-week',
      standId: 'stand-oak-hollow',
      standName: 'Oak Hollow Climber',
      userEmail: 'manager@deercamp.test',
      startTime: getFutureDate(7, 5),
      endTime: getFutureDate(7, 19),
      status: 'confirmed' as const,
      huntType: 'all-day' as const,
      notes: 'All day sit during the rut'
    },
    {
      id: 'booking-checked-in',
      standId: 'stand-turkey-ridge',
      standName: 'Turkey Ridge Blind',
      userEmail: 'member3@deercamp.test',
      startTime: getFutureDate(0, 5),
      endTime: getFutureDate(0, 11),
      status: 'checked-in' as const,
      huntType: 'morning' as const,
      notes: 'Currently in the stand',
      checkInTime: new Date().toISOString()
    }
  ];

  for (const booking of bookings) {
    const userId = userIds.get(booking.userEmail);
    if (!userId) continue;

    const userName = TEST_USERS.find(u => u.email === booking.userEmail)?.displayName || 'Unknown';

    // Sign in as the user making the booking
    await signInWithEmailAndPassword(auth, booking.userEmail, 'password123');

    const bookingData: Record<string, any> = {
      id: booking.id,
      clubId: CLUB_ID,
      standId: booking.standId,
      standName: booking.standName,
      userId,
      userName,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      huntType: booking.huntType,
      createdAt: getPastDate(7),
      updatedAt: new Date().toISOString()
    };

    // Only add optional fields if they exist
    if (booking.notes) bookingData.notes = booking.notes;
    if (booking.checkInTime) bookingData.checkInTime = booking.checkInTime;

    await setDoc(doc(db, 'bookings', booking.id), bookingData);
    console.log(`   ✅ Booking: ${userName} → ${booking.standName}`);

    await signOut(auth);
  }
}

async function createHarvests(userIds: Map<string, string>): Promise<void> {
  console.log('\n🦌 Creating harvest records...');

  const harvests = [
    {
      id: 'harvest-big-buck',
      userEmail: 'owner@deercamp.test',
      date: getPastDate(14),
      species: 'deer' as const,
      sex: 'male' as const,
      weight: 185,
      dressedWeight: 142,
      standId: 'stand-ridge-top',
      standName: 'Ridge Top Tower',
      weaponType: 'rifle' as const,
      distance: 125,
      shotPlacement: 'double-lung' as const,
      timeOfDay: 'morning' as const,
      weather: {
        temp: 38,
        windSpeed: 5,
        windDirection: 'N',
        conditions: 'Clear'
      },
      deerData: {
        points: 10,
        spread: 18.5,
        mainBeamLength: 22,
        baseCircumference: 4.5,
        grossScore: 142,
        estimatedAge: 4.5
      },
      notes: 'Biggest buck taken on the property this season!',
      story: 'I\'d been watching this buck on camera for two years.',
      isClubRecord: true,
      recordCategory: 'Biggest Buck 2024'
    },
    {
      id: 'harvest-doe',
      userEmail: 'member1@deercamp.test',
      date: getPastDate(21),
      species: 'deer' as const,
      sex: 'female' as const,
      weight: 125,
      dressedWeight: 95,
      standId: 'stand-creek-bottom',
      standName: 'Creek Bottom Ladder',
      weaponType: 'bow' as const,
      distance: 22,
      shotPlacement: 'heart' as const,
      timeOfDay: 'evening' as const,
      weather: {
        temp: 52,
        windSpeed: 8,
        windDirection: 'SW',
        conditions: 'Partly Cloudy'
      },
      notes: 'Perfect heart shot at 22 yards.',
      harvestReported: true
    },
    {
      id: 'harvest-turkey',
      userEmail: 'manager@deercamp.test',
      date: getPastDate(180),
      species: 'turkey' as const,
      sex: 'male' as const,
      standId: 'stand-turkey-ridge',
      standName: 'Turkey Ridge Blind',
      weaponType: 'shotgun' as const,
      distance: 35,
      timeOfDay: 'morning' as const,
      turkeyData: {
        beardLength: 10.5,
        spurLength: 1.25,
        weight: 21,
        estimatedAge: 3
      },
      notes: 'Spring gobbler came in hot to decoys.',
      harvestReported: true
    },
    {
      id: 'harvest-hog',
      userEmail: 'member2@deercamp.test',
      date: getPastDate(45),
      species: 'hog' as const,
      sex: 'male' as const,
      weight: 220,
      standId: 'stand-power-line',
      standName: 'Power Line Stand',
      weaponType: 'rifle' as const,
      distance: 85,
      shotPlacement: 'shoulder' as const,
      timeOfDay: 'evening' as const,
      hogData: {
        tuskLength: 2.5,
        estimatedAge: 3
      },
      notes: 'Big boar tearing up the food plots.',
      processingNotes: 'Made into sausage'
    }
  ];

  for (const harvest of harvests) {
    const userId = userIds.get(harvest.userEmail);
    if (!userId) continue;

    const userName = TEST_USERS.find(u => u.email === harvest.userEmail)?.displayName || 'Unknown';

    // Sign in as the user who made the harvest
    await signInWithEmailAndPassword(auth, harvest.userEmail, 'password123');

    const harvestData = {
      ...harvest,
      clubId: CLUB_ID,
      userId,
      userName,
      createdAt: harvest.date,
      updatedAt: new Date().toISOString()
    };
    delete (harvestData as any).userEmail;

    await setDoc(doc(db, 'harvests', harvest.id), harvestData);
    console.log(`   ✅ Harvest: ${userName} - ${harvest.species}`);

    await signOut(auth);
  }
}

async function createPosts(userIds: Map<string, string>): Promise<void> {
  console.log('\n📝 Creating feed posts...');

  const posts = [
    {
      id: 'post-welcome',
      userEmail: 'owner@deercamp.test',
      type: 'announcement' as const,
      content: 'Welcome to North Ridge Hunting Club! We\'re excited to have everyone using our new DeerCamp app.',
      isPinned: true,
      pinnedUntil: getFutureDate(30),
      createdAt: getPastDate(30)
    },
    {
      id: 'post-harvest-buck',
      userEmail: 'owner@deercamp.test',
      type: 'harvest' as const,
      harvestId: 'harvest-big-buck',
      content: 'What a morning! Finally tagged the big 10-pointer I\'ve been chasing. New club record!',
      createdAt: getPastDate(14)
    },
    {
      id: 'post-food-plot',
      userEmail: 'manager@deercamp.test',
      type: 'text' as const,
      content: 'Just finished planting the new clover plot by Oak Hollow. Should be ready by late October.',
      createdAt: getPastDate(7)
    },
    {
      id: 'post-maintenance',
      userEmail: 'manager@deercamp.test',
      type: 'announcement' as const,
      content: 'Heads up: The Power Line Stand is under maintenance. Steps need replacement.',
      createdAt: getPastDate(3)
    },
    {
      id: 'post-trail-cam',
      userEmail: 'member1@deercamp.test',
      type: 'text' as const,
      content: 'Pulled the trail cam at Creek Bottom - lots of doe activity and nice bucks cruising!',
      createdAt: getPastDate(2)
    },
    {
      id: 'post-weather',
      userEmail: 'member3@deercamp.test',
      type: 'text' as const,
      content: 'Cold front moving in this weekend. High pressure Saturday morning looks perfect!',
      createdAt: getPastDate(1)
    }
  ];

  for (const post of posts) {
    const userId = userIds.get(post.userEmail);
    if (!userId) continue;

    const user = TEST_USERS.find(u => u.email === post.userEmail);

    // Sign in as the user making the post
    await signInWithEmailAndPassword(auth, post.userEmail, 'password123');

    const postData: Record<string, any> = {
      id: post.id,
      clubId: CLUB_ID,
      userId,
      userName: user?.displayName || 'Unknown',
      type: post.type,
      content: post.content,
      commentCount: 0,
      reactions: {
        '👍': Math.floor(Math.random() * 5),
        '❤️': Math.floor(Math.random() * 3),
        '🦌': post.type === 'harvest' ? Math.floor(Math.random() * 8) + 3 : 0,
        '🔥': Math.floor(Math.random() * 2)
      },
      createdAt: post.createdAt,
      updatedAt: new Date().toISOString()
    };

    // Only add optional fields if they exist
    if (post.isPinned) postData.isPinned = post.isPinned;
    if (post.pinnedUntil) postData.pinnedUntil = post.pinnedUntil;
    if (post.harvestId) postData.harvestId = post.harvestId;

    await setDoc(doc(db, 'posts', post.id), postData);
    console.log(`   ✅ Post: ${user?.displayName} - ${post.type}`);

    await signOut(auth);
  }
}

// ============== MAIN EXECUTION ==============

async function seedEmulator() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('          🦌 DeerCamp Emulator Seed Script 🦌          ');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Create users in Auth
    const userIds = await createUsersAndLogin();

    // Step 2: Setup owner profile, club, and owner membership
    await setupOwnerAndClub(userIds);

    // Step 3: Create other members (profiles and memberships)
    await createOtherMembersData(userIds);

    // Step 4: Create stands (as owner)
    await createStands(userIds);

    // Step 5: Create bookings (each user creates their own)
    await createBookings(userIds);

    // Step 6: Create harvests (each user creates their own)
    await createHarvests(userIds);

    // Step 7: Create posts (each user creates their own)
    await createPosts(userIds);

    // Sign out at the end
    await signOut(auth);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('              ✅ SEED COMPLETE!                        ');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • ${TEST_USERS.length} users created`);
    console.log(`   • 1 club created`);
    console.log(`   • ${TEST_USERS.length} memberships created`);
    console.log(`   • ${TEST_STANDS.length} stands created`);
    console.log(`   • 4 bookings created`);
    console.log(`   • 4 harvests created`);
    console.log(`   • 6 posts created`);
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Owner:   owner@deercamp.test / password123');
    console.log('   Manager: manager@deercamp.test / password123');
    console.log('   Member:  member1@deercamp.test / password123');
    console.log('\n🌐 Emulator UI: http://localhost:4000');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seed script
seedEmulator();
