// Test Data Seeding Script for DeerCamp
// Run with: node scripts/seedTestData.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';

// Firebase configuration (from .env.local)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getActiveClub() {
  // Get the first club (assuming North Ridge Hunting Club)
  const clubsQuery = query(collection(db, 'clubs'), limit(1));
  const clubsSnapshot = await getDocs(clubsQuery);

  if (clubsSnapshot.empty) {
    console.error('No clubs found! Please create a club first.');
    process.exit(1);
  }

  const club = clubsSnapshot.docs[0];
  return { id: club.id, ...club.data() };
}

async function getUserId() {
  // Get the first user (current logged in user)
  const usersQuery = query(collection(db, 'users'), limit(1));
  const usersSnapshot = await getDocs(usersQuery);

  if (usersSnapshot.empty) {
    console.error('No users found! Please log in first.');
    process.exit(1);
  }

  const user = usersSnapshot.docs[0];
  return { id: user.id, ...user.data() };
}

async function seedStands(clubId) {
  console.log('\n🎯 Creating sample stands...');

  const stands = [
    {
      clubId,
      name: 'North Ridge Tower',
      type: 'tower',
      description: 'Elevated tower stand overlooking food plot',
      capacity: 2,
      accessibility: 'moderate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      clubId,
      name: 'River Bottom Blind',
      type: 'ground-blind',
      description: 'Ground blind near river crossing',
      capacity: 1,
      accessibility: 'easy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      clubId,
      name: 'Oak Grove Climber',
      type: 'ladder',
      description: 'Ladder stand in oak grove',
      capacity: 1,
      accessibility: 'difficult',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      clubId,
      name: 'Pine Ridge Platform',
      type: 'platform',
      description: 'Platform stand on ridge line',
      capacity: 2,
      accessibility: 'moderate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      clubId,
      name: 'Creek Crossing Box',
      type: 'box-blind',
      description: 'Box blind near creek',
      capacity: 3,
      accessibility: 'easy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const stand of stands) {
    await addDoc(collection(db, 'stands'), stand);
    console.log(`  ✅ Created: ${stand.name}`);
  }

  console.log(`✅ Created ${stands.length} stands`);
  return stands;
}

async function seedBookings(clubId, userId, userName) {
  console.log('\n📅 Creating sample bookings...');

  // Get stands
  const standsQuery = query(collection(db, 'stands'), where('clubId', '==', clubId));
  const standsSnapshot = await getDocs(standsQuery);
  const stands = standsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (stands.length === 0) {
    console.log('⚠️  No stands found, skipping bookings');
    return [];
  }

  const bookings = [];
  const today = new Date();

  // Create a booking for tomorrow morning
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(10, 0, 0, 0);

  bookings.push({
    clubId,
    standId: stands[0].id,
    standName: stands[0].name,
    userId,
    userName,
    startTime: tomorrow.toISOString(),
    endTime: tomorrowEnd.toISOString(),
    status: 'confirmed',
    huntType: 'morning',
    notes: 'Expecting good deer movement',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Create a booking for next weekend
  const nextWeekend = new Date(today);
  nextWeekend.setDate(nextWeekend.getDate() + 7);
  nextWeekend.setHours(15, 30, 0, 0);
  const nextWeekendEnd = new Date(nextWeekend);
  nextWeekendEnd.setHours(19, 0, 0, 0);

  bookings.push({
    clubId,
    standId: stands[1].id,
    standName: stands[1].name,
    userId,
    userName,
    startTime: nextWeekend.toISOString(),
    endTime: nextWeekendEnd.toISOString(),
    status: 'confirmed',
    huntType: 'evening',
    notes: 'Prime time for afternoon hunt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  for (const booking of bookings) {
    await addDoc(collection(db, 'bookings'), booking);
    console.log(`  ✅ Created booking: ${booking.standName} on ${new Date(booking.startTime).toLocaleDateString()}`);
  }

  console.log(`✅ Created ${bookings.length} bookings`);
  return bookings;
}

async function seedHarvests(clubId, userId, userName) {
  console.log('\n🦌 Creating sample harvests...');

  const harvests = [
    {
      clubId,
      userId,
      userName,
      species: 'deer',
      sex: 'male',
      weight: 185,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      notes: '8-point buck from North Ridge',
      photoUrl: '',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      clubId,
      userId,
      userName,
      species: 'deer',
      sex: 'female',
      weight: 120,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      notes: 'Doe harvested from Oak Grove stand',
      photoUrl: '',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      clubId,
      userId,
      userName,
      species: 'turkey',
      sex: 'male',
      weight: 22,
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
      notes: 'Tom turkey near food plot',
      photoUrl: '',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const harvest of harvests) {
    const harvestDoc = await addDoc(collection(db, 'harvests'), harvest);
    console.log(`  ✅ Created harvest: ${harvest.species} (${harvest.sex}), ${harvest.weight} lbs`);

    // Create corresponding feed post
    const speciesEmoji = harvest.species === 'deer' ? '🦌' : harvest.species === 'turkey' ? '🦃' : '🎯';
    const postContent = `${speciesEmoji} Just logged a ${harvest.sex} ${harvest.species}!\nWeight: ${harvest.weight} lbs\n\n${harvest.notes}`;

    await addDoc(collection(db, 'posts'), {
      clubId,
      userId,
      userName,
      type: 'harvest',
      content: postContent,
      harvestId: harvestDoc.id,
      isPinned: false,
      commentCount: 0,
      reactions: {
        '👍': 0,
        '❤️': 0,
        '🔥': 0,
        '🦌': 0,
        '🎯': 0
      },
      createdAt: harvest.createdAt,
      updatedAt: harvest.createdAt
    });
    console.log(`  ✅ Created feed post for harvest`);
  }

  console.log(`✅ Created ${harvests.length} harvests with feed posts`);
  return harvests;
}

async function main() {
  try {
    console.log('🌱 DeerCamp Test Data Seeder\n');
    console.log('================================\n');

    // Get active club and user
    const club = await getActiveClub();
    console.log(`📍 Club: ${club.name} (${club.id})`);

    const user = await getUserId();
    console.log(`👤 User: ${user.displayName} (${user.id})\n`);

    // Seed data
    await seedStands(club.id);
    await seedBookings(club.id, user.id, user.displayName);
    await seedHarvests(club.id, user.id, user.displayName);

    console.log('\n================================');
    console.log('✅ Test data seeding complete!\n');
    console.log('You can now test the app with real data.');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

main();
