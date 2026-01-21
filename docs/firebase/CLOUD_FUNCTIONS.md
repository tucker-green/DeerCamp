# Cloud Functions

This document details the Firebase Cloud Functions used in DeerCamp.

## Overview

DeerCamp uses Cloud Functions for server-side operations that require elevated privileges, primarily for managing custom claims that enable Storage security rules.

## Function Configuration

**Location:** `functions/src/index.ts`

**Runtime:**
- Node.js 18
- TypeScript
- Firebase Functions v5

## Functions Reference

### Firestore Triggers

#### onMembershipCreated

Triggered when a new club membership document is created.

```typescript
exports.onMembershipCreated = onDocumentCreated(
  'clubMemberships/{membershipId}',
  async (event) => { ... }
)
```

**Purpose:** Updates user's custom claims when they join a club.

**Logic:**
1. Extracts `userId`, `clubId`, `membershipStatus`, `approvalStatus` from document
2. Only updates claims if status is `active` AND approval is `approved`
3. Calls `updateUserClubClaims()` to sync claims

**Example Trigger:**
```javascript
// When this document is created:
{
  userId: 'user-123',
  clubId: 'club-456',
  membershipStatus: 'active',
  approvalStatus: 'approved',
  role: 'member'
}
// → User's token updated with clubIds: ['club-456']
```

---

#### onMembershipUpdated

Triggered when a club membership document is updated.

```typescript
exports.onMembershipUpdated = onDocumentUpdated(
  'clubMemberships/{membershipId}',
  async (event) => { ... }
)
```

**Purpose:** Updates user's custom claims when membership status changes.

**Logic:**
1. Compares `before` and `after` document snapshots
2. Only updates if `membershipStatus` or `approvalStatus` changed
3. Calls `updateUserClubClaims()` to recalculate all active clubs

**Example Trigger:**
```javascript
// Before: { membershipStatus: 'pending', ... }
// After:  { membershipStatus: 'active', approvalStatus: 'approved', ... }
// → Claims updated to include this club
```

---

#### onMembershipDeleted

Triggered when a club membership document is deleted.

```typescript
exports.onMembershipDeleted = onDocumentDeleted(
  'clubMemberships/{membershipId}',
  async (event) => { ... }
)
```

**Purpose:** Removes club from user's custom claims when membership is deleted.

**Logic:**
1. Extracts `userId` and `clubId` from deleted document
2. Calls `updateUserClubClaims()` to recalculate remaining clubs

---

### Callable Functions

#### syncUserClubClaims

Manually sync custom claims for a specific user.

```typescript
exports.syncUserClubClaims = onCall(
  async (request) => { ... }
)
```

**Parameters:**
```typescript
interface Request {
  userId?: string;  // Optional - defaults to caller's UID
}
```

**Returns:**
```typescript
interface Response {
  success: boolean;
  userId: string;
  clubCount: number;
  message: string;
}
```

**Authorization:**
- Users can sync their own claims (when `userId` is omitted or matches caller)
- Super admins can sync any user's claims

**Errors:**
- `unauthenticated` - No authenticated user
- `permission-denied` - Non-admin trying to sync another user

**Usage (Client):**
```typescript
import { syncMyClubClaims, syncUserClubClaims } from '../firebase/claimsFunctions';

// Sync own claims
const result = await syncMyClubClaims();
console.log(`Synced ${result.clubCount} clubs`);

// Admin: Sync another user's claims
const result = await syncUserClubClaims('user-123');
```

---

#### syncAllUserClubClaims

Bulk sync custom claims for all users.

```typescript
exports.syncAllUserClubClaims = onCall(
  async (request) => { ... }
)
```

**Parameters:** None

**Returns:**
```typescript
interface Response {
  success: boolean;
  totalUsers: number;
  successCount: number;
  errorCount: number;
  message: string;
  results: Array<{
    userId: string;
    clubCount: number;
    error?: string;
  }>;
}
```

**Authorization:**
- Requires super admin (`isSuperAdmin: true` in users collection)

**Errors:**
- `unauthenticated` - No authenticated user
- `permission-denied` - Not a super admin

**Usage:**
```typescript
// Admin-only: Sync all users (e.g., after migration)
const result = await syncAllUsersClubClaims();
console.log(`Synced ${result.successCount}/${result.totalUsers} users`);
```

---

### HTTP Functions

#### healthCheck

Simple health check endpoint.

```typescript
exports.healthCheck = onRequest(
  async (req, res) => { ... }
)
```

**URL:** `https://<region>-<project>.cloudfunctions.net/healthCheck`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-20T12:00:00.000Z",
  "service": "deercamp-functions"
}
```

**Usage:**
- Monitoring and uptime checks
- Verify functions deployment

---

## Helper Functions

### getActiveClubIds

Retrieves all active, approved club IDs for a user.

```typescript
async function getActiveClubIds(userId: string): Promise<string[]>
```

**Query:**
```javascript
db.collection('clubMemberships')
  .where('userId', '==', userId)
  .where('membershipStatus', '==', 'active')
  .where('approvalStatus', '==', 'approved')
```

**Returns:** Array of club IDs

---

### updateUserClubClaims

Updates Firebase Auth custom claims for a user.

```typescript
async function updateUserClubClaims(userId: string): Promise<void>
```

**Logic:**
1. Calls `getActiveClubIds()` to get current active clubs
2. Gets existing custom claims via `auth.getUser()`
3. Merges new `clubIds` array with existing claims
4. Sets updated claims via `auth.setCustomUserClaims()`

**Error Handling:**
- Catches `auth/user-not-found` and logs warning (user may have been deleted)
- Re-throws other errors

**Custom Claims Format:**
```javascript
{
  ...existingClaims,
  clubIds: ['club-123', 'club-456']
}
```

---

## Client-Side Wrappers

Located in `src/firebase/claimsFunctions.ts`

### syncMyClubClaims

```typescript
async function syncMyClubClaims(): Promise<SyncClaimsResult>
```

Calls the `syncUserClubClaims` function without a userId parameter.

---

### syncAndRefreshClaims

```typescript
async function syncAndRefreshClaims(): Promise<string[]>
```

Syncs claims AND forces token refresh to immediately apply changes.

---

### refreshTokenWithClaims

```typescript
async function refreshTokenWithClaims(): Promise<string | null>
```

Forces a token refresh to get updated claims without syncing.

---

### getMyClubIdsFromClaims

```typescript
async function getMyClubIdsFromClaims(): Promise<string[]>
```

Reads `clubIds` from the current user's token claims.

---

## Deployment

### Deploy Functions

```bash
# Build and deploy
cd functions
npm run build
firebase deploy --only functions

# Or from root
firebase deploy --only functions
```

### Environment Variables

Functions use Firebase Admin SDK credentials automatically. No additional environment variables required.

---

## Monitoring

### Logs

View function logs in Firebase Console or CLI:

```bash
firebase functions:log
firebase functions:log --only onMembershipCreated
```

### Metrics

Monitor in Firebase Console:
- Invocation count
- Execution time
- Error rate
- Memory usage

---

## Architecture Notes

### Why Custom Claims?

Storage security rules cannot query Firestore directly. Custom claims allow:
1. Membership data to be embedded in user tokens
2. Storage rules to verify club membership
3. Fast authorization without database reads

### Claim Size Limits

Firebase custom claims have a 1000-byte limit. With typical club IDs (~20 chars each), this supports approximately 40-50 club memberships per user.

### Token Refresh

Custom claims changes take effect on next token refresh:
- Automatic: Within 1 hour
- Manual: Call `refreshTokenWithClaims()`

### Idempotency

All functions are idempotent - running multiple times produces the same result. This handles:
- Retry scenarios
- Duplicate triggers
- Manual re-sync requests

---

*Cloud Functions documented from `functions/src/index.ts`*
