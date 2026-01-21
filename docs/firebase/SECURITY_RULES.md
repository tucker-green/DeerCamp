# Security Rules

This document details the Firestore and Storage security rules for DeerCamp.

## Overview

DeerCamp uses Firebase Security Rules to enforce:
- Authentication requirements
- Role-based access control
- Club-scoped data isolation
- Data validation

## Firestore Security Rules

Located in `firestore.rules`

### Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check if user is a super admin
function isSuperAdmin() {
  return isAuthenticated() && 
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isSuperAdmin == true;
}

// Check if user is an active, approved member of a club
function isMember(clubId) {
  return isAuthenticated() &&
    exists(/databases/$(database)/documents/clubMemberships/$(request.auth.uid + '_' + clubId)) &&
    get(/databases/$(database)/documents/clubMemberships/$(request.auth.uid + '_' + clubId)).data.membershipStatus == 'active' &&
    get(/databases/$(database)/documents/clubMemberships/$(request.auth.uid + '_' + clubId)).data.approvalStatus == 'approved';
}

// Check if user is a manager or owner of a club
function isManagerOrOwner(clubId) {
  return isMember(clubId) &&
    get(/databases/$(database)/documents/clubMemberships/$(request.auth.uid + '_' + clubId)).data.role in ['owner', 'manager'];
}

// Check if user is the owner of a club
function isClubOwner(clubId) {
  return isMember(clubId) &&
    get(/databases/$(database)/documents/clubMemberships/$(request.auth.uid + '_' + clubId)).data.role == 'owner';
}
```

### Collection Rules

#### Users Collection

```javascript
match /users/{userId} {
  // Anyone authenticated can read user profiles
  allow read: if isAuthenticated();
  
  // Users can only create their own profile
  allow create: if isAuthenticated() && request.auth.uid == userId;
  
  // Users can update their own profile, super admins can update any
  allow update: if isAuthenticated() && 
    (request.auth.uid == userId || isSuperAdmin());
  
  // Only super admins can delete users
  allow delete: if isSuperAdmin();
}
```

#### Clubs Collection

```javascript
match /clubs/{clubId} {
  // Public clubs readable by all, private clubs by members only
  allow read: if isAuthenticated() && 
    (resource.data.isPublic == true || isMember(clubId));
  
  // Any authenticated user can create a club (becomes owner)
  allow create: if isAuthenticated();
  
  // Only owner or super admin can update/delete
  allow update, delete: if isClubOwner(clubId) || isSuperAdmin();
}
```

#### Club Memberships Collection

```javascript
match /clubMemberships/{membershipId} {
  // Read own membership or if member of same club
  allow read: if isAuthenticated() && (
    resource.data.userId == request.auth.uid ||
    isMember(resource.data.clubId)
  );
  
  // Create rules:
  // 1. Own membership (joining)
  // 2. Manager adding a member
  // 3. Owner creating the club
  allow create: if isAuthenticated() && (
    request.resource.data.userId == request.auth.uid ||
    isManagerOrOwner(request.resource.data.clubId)
  );
  
  // Update rules:
  // 1. Managers/owners can update most fields
  // 2. Members can update only specific self-service fields
  allow update: if isAuthenticated() && (
    isManagerOrOwner(resource.data.clubId) ||
    (resource.data.userId == request.auth.uid && 
     onlyUpdatingFields(['duesStatus', 'updatedAt']))
  );
  
  // Only managers/owners can delete memberships
  allow delete: if isManagerOrOwner(resource.data.clubId);
}
```

#### Club Join Requests Collection

```javascript
match /clubJoinRequests/{requestId} {
  // Users can read their own requests, managers can read club requests
  allow read: if isAuthenticated() && (
    resource.data.userId == request.auth.uid ||
    isManagerOrOwner(resource.data.clubId)
  );
  
  // Any authenticated user can create a request
  allow create: if isAuthenticated() && 
    request.resource.data.userId == request.auth.uid;
  
  // Managers can approve/reject, users can cancel their own
  allow update: if isAuthenticated() && (
    isManagerOrOwner(resource.data.clubId) ||
    (resource.data.userId == request.auth.uid && 
     request.resource.data.status == 'cancelled')
  );
  
  // Only managers can delete requests
  allow delete: if isManagerOrOwner(resource.data.clubId);
}
```

#### Stands Collection

```javascript
match /stands/{standId} {
  // Club members can read stands
  allow read: if isMember(resource.data.clubId);
  
  // Only managers/owners can create, update, delete stands
  allow create: if isManagerOrOwner(request.resource.data.clubId);
  allow update, delete: if isManagerOrOwner(resource.data.clubId);
}
```

#### Bookings Collection

```javascript
match /bookings/{bookingId} {
  // Club members can read all bookings
  allow read: if isMember(resource.data.clubId);
  
  // Members can create their own bookings
  allow create: if isMember(request.resource.data.clubId) && 
    request.resource.data.userId == request.auth.uid;
  
  // Users can update/delete their own, managers can manage all
  allow update, delete: if isAuthenticated() && (
    resource.data.userId == request.auth.uid ||
    isManagerOrOwner(resource.data.clubId)
  );
}
```

#### Harvests Collection

```javascript
match /harvests/{harvestId} {
  // Club members can read all harvests
  allow read: if isMember(resource.data.clubId);
  
  // Members can create their own harvests
  allow create: if isMember(request.resource.data.clubId) && 
    request.resource.data.userId == request.auth.uid;
  
  // Users can update their own harvests
  allow update: if isAuthenticated() && 
    resource.data.userId == request.auth.uid;
  
  // Users can delete their own, managers can delete any
  allow delete: if isAuthenticated() && (
    resource.data.userId == request.auth.uid ||
    isManagerOrOwner(resource.data.clubId)
  );
}
```

#### Posts Collection

```javascript
match /posts/{postId} {
  // Club members can read posts
  allow read: if isMember(resource.data.clubId);
  
  // Members can create posts (announcements require manager+)
  allow create: if isMember(request.resource.data.clubId) && (
    request.resource.data.type != 'announcement' ||
    isManagerOrOwner(request.resource.data.clubId)
  );
  
  // Update rules:
  // 1. Author can update own posts
  // 2. Managers can update any
  // 3. Members can update engagement fields (commentCount, reactionCount)
  allow update: if isAuthenticated() && (
    resource.data.authorId == request.auth.uid ||
    isManagerOrOwner(resource.data.clubId) ||
    onlyUpdatingFields(['commentCount', 'reactionCount', 'updatedAt'])
  );
  
  // Author or managers can delete
  allow delete: if isAuthenticated() && (
    resource.data.authorId == request.auth.uid ||
    isManagerOrOwner(resource.data.clubId)
  );
}
```

#### Comments Collection

```javascript
match /comments/{commentId} {
  // Club members can read comments
  allow read: if isMember(resource.data.clubId);
  
  // Members can create comments
  allow create: if isMember(request.resource.data.clubId);
  
  // Authors can update their own comments
  allow update: if isAuthenticated() && 
    resource.data.authorId == request.auth.uid;
  
  // Authors or managers can delete
  allow delete: if isAuthenticated() && (
    resource.data.authorId == request.auth.uid ||
    isManagerOrOwner(resource.data.clubId)
  );
}
```

#### Property/Map Data Collections

These collections follow the same pattern:

```javascript
// propertyBoundaries, foodPlots, accessRoutes, terrainFeatures, trailCameras
match /propertyBoundaries/{docId} {
  // Club members can read
  allow read: if isMember(resource.data.clubId);
  
  // Only managers/owners can create, update, delete
  allow create: if isManagerOrOwner(request.resource.data.clubId);
  allow update, delete: if isManagerOrOwner(resource.data.clubId);
}
```

#### Reports Collection

```javascript
match /reports/{reportId} {
  // Managers, owners, and super admins can read reports
  allow read: if isManagerOrOwner(resource.data.clubId) || isSuperAdmin();
  
  // Members or super admins can create reports
  allow create: if isMember(request.resource.data.clubId) || isSuperAdmin();
  
  // Managers, owners, and super admins can update reports
  allow update: if isManagerOrOwner(resource.data.clubId) || isSuperAdmin();
  
  // Only super admins can delete reports
  allow delete: if isSuperAdmin();
}
```

---

## Storage Security Rules

Located in `storage.rules`

### Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check content type is an image
function isImage() {
  return request.resource.contentType.matches('image/.*');
}

// Check content type is a video
function isVideo() {
  return request.resource.contentType.matches('video/.*');
}

// Check file size is under 5MB
function isUnder5MB() {
  return request.resource.size < 5 * 1024 * 1024;
}

// Check valid post file sizes (10MB images, 50MB videos)
function isValidPostFileSize() {
  return (isImage() && request.resource.size < 10 * 1024 * 1024) ||
         (isVideo() && request.resource.size < 50 * 1024 * 1024);
}

// Check if user has club in their custom claims
function hasClubClaim(clubId) {
  return request.auth.token.clubIds != null && 
         clubId in request.auth.token.clubIds;
}

// Club member check with fallback for missing claims
function isClubMemberOrFallback(clubId) {
  return isAuthenticated() && (
    hasClubClaim(clubId) || 
    request.auth != null  // Fallback: allow any authenticated user
  );
}
```

### Path Rules

#### Harvests Path

```javascript
match /harvests/{userId}/{fileName} {
  // Any authenticated user can read harvest photos
  allow read: if isAuthenticated();
  
  // Users can upload to their own folder
  // Must be image, under 5MB
  allow create: if isAuthenticated() && 
    request.auth.uid == userId && 
    isImage() && 
    isUnder5MB();
  
  // Users can delete their own files
  allow delete: if isAuthenticated() && request.auth.uid == userId;
}
```

#### Posts Path

```javascript
match /posts/{clubId}/{userId}/{fileName} {
  // Club members can read post media
  allow read: if isClubMemberOrFallback(clubId);
  
  // Club members can upload to their own folder
  // Must be image or video with valid size
  allow create: if isClubMemberOrFallback(clubId) && 
    request.auth.uid == userId && 
    isValidPostFileSize();
  
  // Users can delete their own files
  allow delete: if isAuthenticated() && request.auth.uid == userId;
}
```

#### Avatars Path

```javascript
match /avatars/{userId}/{fileName} {
  // Any authenticated user can read avatars
  allow read: if isAuthenticated();
  
  // Users can upload their own avatar
  // Must be image, under 5MB
  allow create: if isAuthenticated() && 
    request.auth.uid == userId && 
    isImage() && 
    isUnder5MB();
  
  // Users can delete their own avatar
  allow delete: if isAuthenticated() && request.auth.uid == userId;
}
```

#### Clubs Path

```javascript
match /clubs/{clubId}/{fileName} {
  // Club members can read club media
  allow read: if isClubMemberOrFallback(clubId);
  
  // Club members can upload club media
  // Must be image, under 10MB
  allow create: if isClubMemberOrFallback(clubId) && 
    isImage() && 
    request.resource.size < 10 * 1024 * 1024;
  
  // Club members can delete club media
  allow delete: if isClubMemberOrFallback(clubId);
}
```

---

## Custom Claims

DeerCamp uses Firebase custom claims to store club membership for Storage rules.

### Claim Structure

```javascript
{
  clubIds: ['club-123', 'club-456', ...]
}
```

### Claim Synchronization

Claims are synchronized by Cloud Functions when:
- Membership is created (`onMembershipCreated`)
- Membership is updated (`onMembershipUpdated`)
- Membership is deleted (`onMembershipDeleted`)

### Manual Sync

```javascript
// Sync current user's claims
await syncMyClubClaims();

// Admin: Sync specific user's claims
await syncUserClubClaims(userId);

// Admin: Sync all users' claims
await syncAllUsersClubClaims();
```

---

## Permission Matrix

### Firestore Permissions

| Resource | Owner | Manager | Member | Guest |
|----------|-------|---------|--------|-------|
| Read users | ✓ | ✓ | ✓ | ✗ |
| Read clubs | ✓ | ✓ | ✓ | Public only |
| Update club | ✓ | ✗ | ✗ | ✗ |
| Read stands | ✓ | ✓ | ✓ | ✗ |
| Manage stands | ✓ | ✓ | ✗ | ✗ |
| Read bookings | ✓ | ✓ | ✓ | ✗ |
| Create booking | ✓ | ✓ | ✓ | ✗ |
| Cancel any booking | ✓ | ✓ | Own only | ✗ |
| Read harvests | ✓ | ✓ | ✓ | ✗ |
| Log harvest | ✓ | ✓ | ✓ | ✗ |
| Delete any harvest | ✓ | ✓ | Own only | ✗ |
| Read posts | ✓ | ✓ | ✓ | ✗ |
| Create post | ✓ | ✓ | ✓ | ✗ |
| Create announcement | ✓ | ✓ | ✗ | ✗ |
| Delete any post | ✓ | ✓ | Own only | ✗ |
| Manage property | ✓ | ✓ | ✗ | ✗ |
| Manage members | ✓ | ✓ | ✗ | ✗ |
| View reports | ✓ | ✓ | ✗ | ✗ |

### Storage Permissions

| Path | Read | Write | Delete |
|------|------|-------|--------|
| `/harvests/{userId}/*` | Authenticated | Own folder | Own files |
| `/posts/{clubId}/{userId}/*` | Club members | Own folder | Own files |
| `/avatars/{userId}/*` | Authenticated | Own folder | Own files |
| `/clubs/{clubId}/*` | Club members | Club members | Club members |

---

## Deploying Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy both
npm run deploy:rules
```

---

## Testing Rules

Use the Firebase Emulator Suite to test rules:

```bash
npm run emulators
```

Access the Emulator UI at `http://localhost:4000` to test rules with different auth contexts.

---

*Security rules documented from `firestore.rules` and `storage.rules`*
