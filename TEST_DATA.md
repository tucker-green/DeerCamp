# Adding Test Data to DeerCamp

This guide explains how to add test data to your DeerCamp instance for testing and demonstration purposes.

## Prerequisites

- Firebase Console access
- Owner or Manager role in your club
- Active club membership

## Method 1: Firebase Console (Recommended)

### 1. Add Test Stands

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to: **Firestore Database** → **stands** collection
3. Click **"Add Document"**
4. Use auto-generated ID, then add fields:

```json
{
  "clubId": "your-club-id",
  "name": "North Ridge Tower",
  "type": "tower",
  "description": "Elevated tower stand overlooking food plot",
  "capacity": 2,
  "accessibility": "moderate",
  "createdAt": "2026-01-14T12:00:00.000Z",
  "updatedAt": "2026-01-14T12:00:00.000Z"
}
```

**Recommended Test Stands:**
- North Ridge Tower (tower, capacity: 2)
- River Bottom Blind (ground-blind, capacity: 1)
- Oak Grove Climber (ladder, capacity: 1)
- Pine Ridge Platform (platform, capacity: 2)
- Creek Crossing Box (box-blind, capacity: 3)

### 2. Add Test Bookings

1. Navigate to: **Firestore Database** → **bookings** collection
2. Click **"Add Document"**
3. Add fields:

```json
{
  "clubId": "your-club-id",
  "standId": "stand-doc-id",
  "standName": "North Ridge Tower",
  "userId": "your-user-id",
  "userName": "Your Name",
  "startTime": "2026-01-15T06:00:00.000Z",
  "endTime": "2026-01-15T10:00:00.000Z",
  "status": "confirmed",
  "huntType": "morning",
  "notes": "Expecting good deer movement",
  "createdAt": "2026-01-14T12:00:00.000Z",
  "updatedAt": "2026-01-14T12:00:00.000Z"
}
```

**Booking Statuses:**
- `confirmed` - Future booking
- `checked-in` - Currently hunting (shows in Who's Hunting)
- `completed` - Past hunt
- `cancelled` - Cancelled booking

### 3. Add Test Harvests

1. Navigate to: **Firestore Database** → **harvests** collection
2. Click **"Add Document"**
3. Add fields:

```json
{
  "clubId": "your-club-id",
  "userId": "your-user-id",
  "userName": "Your Name",
  "species": "deer",
  "sex": "male",
  "weight": 185,
  "date": "2026-01-07T08:00:00.000Z",
  "notes": "8-point buck from North Ridge",
  "photoUrl": "",
  "createdAt": "2026-01-07T08:00:00.000Z"
}
```

**Species Options:**
- `deer` (male/female)
- `turkey` (male/female)
- `hog` (male/female)

### 4. Add Test Feed Posts

Harvests automatically create feed posts. To add manual posts:

1. Navigate to: **Firestore Database** → **posts** collection
2. Click **"Add Document"**
3. Add fields:

```json
{
  "clubId": "your-club-id",
  "userId": "your-user-id",
  "userName": "Your Name",
  "type": "general",
  "content": "Testing the Phase 6 PWA features! The mobile optimization is looking great.",
  "isPinned": false,
  "commentCount": 0,
  "reactions": {
    "👍": 0,
    "❤️": 0,
    "🔥": 0,
    "🦌": 0,
    "🎯": 0
  },
  "createdAt": "2026-01-14T14:00:00.000Z",
  "updatedAt": "2026-01-14T14:00:00.000Z"
}
```

**Post Types:**
- `general` - Regular post
- `harvest` - Harvest announcement (requires `harvestId`)
- `announcement` - Club announcement
- `event` - Event post

## Method 2: Using the App UI

### Add Harvests
1. Navigate to **Harvests** page
2. Click **"Log New Harvest"**
3. Fill in the form and submit
4. This automatically creates a harvest record AND a feed post

### Add Posts
1. Navigate to **Feed** page
2. Click **"New Post"**
3. Write your post and submit

### Add Bookings
1. Navigate to **Stand Board** page
2. Click on a stand (if stands exist)
3. Fill in booking details and submit

## Finding Your IDs

### Find Your Club ID
1. Go to Firebase Console → **Firestore Database**
2. Click **clubs** collection
3. Find your club document
4. Copy the document ID

### Find Your User ID
1. Go to Firebase Console → **Authentication**
2. Find your email
3. Copy the **User UID**

### Find Stand IDs
1. Go to Firebase Console → **Firestore Database**
2. Click **stands** collection
3. Find the stand you want to reference
4. Copy the document ID

## Quick Test Data Set

For a quick demonstration, add:
- **3-5 stands** (various types)
- **2-3 bookings** (at least one upcoming)
- **2-3 harvests** (different species)
- **2-3 posts** (mix of types)

This will populate the Dashboard with meaningful data and allow full feature testing.

## Automated Seeding (Future)

A seed script is available at `scripts/seedTestData.js` but requires:
- Firebase Admin SDK setup
- Environment variables configured
- Node.js ES modules support

Run with: `node scripts/seedTestData.js`

(Note: This is not yet fully implemented)

## Verifying Test Data

After adding test data, verify it appears correctly:

1. **Dashboard** - Check stats cards show correct counts
2. **Feed** - See your posts and harvest announcements
3. **Stands** - View all stands on the stands page
4. **Map** - Stands appear as markers (if coordinates added)
5. **Trophy Book** - Harvests show in club records
6. **Stand Board** - See upcoming bookings

## Cleaning Up Test Data

To remove test data:
1. Go to Firebase Console → **Firestore Database**
2. Navigate to the collection (stands, bookings, harvests, posts)
3. Select documents to delete
4. Click **Delete**

**Warning:** Deletions are permanent!
