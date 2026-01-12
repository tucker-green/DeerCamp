# Member Management System - Implementation Plan

## Overview
Comprehensive member management system for hunting club administration, including member directory, role management, invite system, and member profiles.

---

## Database Schema

### 1. Extended UserProfile Type
```typescript
interface UserProfile {
  // Existing fields
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  clubId?: string;
  joinDate: string;

  // NEW: Membership Management
  membershipTier: MembershipTier;
  membershipStatus: MemberStatus;
  approvalStatus: ApprovalStatus;

  // NEW: Contact Information
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };

  // NEW: Emergency Contact
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  // NEW: Hunter Safety
  hunterSafetyCert?: {
    number: string;
    expirationDate: string;
    verified: boolean;
  };

  // NEW: Dues Tracking
  duesStatus: DuesStatus;
  duesPaidUntil?: string;
  lastDuesPayment?: string;

  // NEW: Profile Enhancements
  avatar?: string;
  bio?: string;

  // NEW: Audit Fields
  invitedBy?: string;
  approvedBy?: string;
  lastActive?: string;
  profileCompleteness: number; // 0-100%
}

type MembershipTier = 'full' | 'family' | 'youth' | 'guest';
type MemberStatus = 'active' | 'inactive' | 'suspended';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type DuesStatus = 'paid' | 'unpaid' | 'overdue' | 'exempt';
```

### 2. Invites Collection
```typescript
interface Invite {
  id: string;
  email: string;
  role: UserRole;
  membershipTier: MembershipTier;
  clubId: string;

  // Invitation Details
  invitedBy: string;        // uid
  invitedByName: string;    // cached
  message?: string;

  // Status & Lifecycle
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;        // 7 days from creation
  acceptedAt?: string;
  cancelledAt?: string;

  // Invite Code
  inviteCode: string;       // unique 8-char code
}

type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';
```

### 3. Firestore Indexes
```json
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "clubId", "order": "ASCENDING" },
    { "fieldPath": "role", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "clubId", "order": "ASCENDING" },
    { "fieldPath": "membershipStatus", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "clubId", "order": "ASCENDING" },
    { "fieldPath": "duesStatus", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "invites",
  "fields": [
    { "fieldPath": "clubId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### 4. Firestore Security Rules
```firestore
// Users Collection - Enhanced Rules
match /users/{userId} {
  // Read: All authenticated club members
  allow read: if request.auth != null && request.auth.uid != null;

  // Create: Only on signup
  allow create: if request.auth.uid == userId;

  // Update: Own profile OR managers can edit
  allow update: if request.auth.uid == userId
                || (isAuthenticated() && isOwnerOrManager());

  // Prevent: Role changes by non-owners
  allow update: if request.resource.data.role == resource.data.role
                || (isAuthenticated() && isOwner(request.auth.uid));

  // Delete: Owners only
  allow delete: if isAuthenticated() && isOwner(request.auth.uid);
}

// Invites Collection
match /invites/{inviteId} {
  // Read: Club managers+ and the invitee (by email)
  allow read: if isAuthenticated() &&
              (isOwnerOrManager() || resource.data.email == request.auth.token.email);

  // Create: Managers+ only
  allow create: if isAuthenticated() && isOwnerOrManager();

  // Update: Creator or managers
  allow update: if isAuthenticated() &&
                (resource.data.invitedBy == request.auth.uid || isOwnerOrManager());

  // Delete: Managers+ only
  allow delete: if isAuthenticated() && isOwnerOrManager();
}
```

---

## Implementation Files

### Phase 1: Type Definitions

**File:** `src/types/index.ts`
- Add new types: MembershipTier, MemberStatus, ApprovalStatus, DuesStatus
- Extend UserProfile interface
- Add Invite interface
- Add InviteStatus type

### Phase 2: Data Layer

**File:** `src/hooks/useMembers.ts`
```typescript
interface UseMembersOptions {
  clubId?: string;
  role?: UserRole;
  status?: MemberStatus;
  duesStatus?: DuesStatus;
}

export function useMembers(options: UseMembersOptions = {}) {
  // Real-time listener for members
  // Returns: members, loading, error

  const updateMemberRole = async (userId: string, newRole: UserRole) => {...}
  const updateMemberStatus = async (userId: string, newStatus: MemberStatus) => {...}
  const updateDuesStatus = async (userId: string, duesData: {...}) => {...}
  const deleteMember = async (userId: string) => {...}

  return { members, loading, error, updateMemberRole, updateMemberStatus, updateDuesStatus, deleteMember };
}

// Convenience hooks
export function useClubMembers(clubId: string) { return useMembers({ clubId }); }
export function useUnpaidMembers(clubId: string) { return useMembers({ clubId, duesStatus: 'unpaid' }); }
export function useInactiveMembers(clubId: string) { return useMembers({ clubId, status: 'inactive' }); }
```

**File:** `src/hooks/useInvites.ts`
```typescript
export function useInvites(clubId?: string) {
  // Real-time listener for invites
  // Returns: invites, loading, error

  const createInvite = async (inviteData: {...}) => {...}
  const cancelInvite = async (inviteId: string) => {...}
  const resendInvite = async (inviteId: string) => {...}
  const acceptInvite = async (inviteCode: string, userId: string) => {...}

  return { invites, loading, error, createInvite, cancelInvite, resendInvite, acceptInvite };
}

export function usePendingInvites(clubId: string) { ... }
```

**File:** `src/utils/memberHelpers.ts`
```typescript
// Validation
export function validateMemberData(data: Partial<UserProfile>): { valid: boolean; error?: string }
export function validatePhone(phone: string): boolean
export function validateEmail(email: string): boolean

// Permissions
export function canPromoteUser(member: UserProfile, currentUserRole: UserRole): boolean
export function canSuspendUser(member: UserProfile, currentUserRole: UserRole): boolean
export function canEditMember(member: UserProfile, currentUserId: string, currentUserRole: UserRole): boolean
export function canDeleteMember(member: UserProfile, currentUserRole: UserRole): boolean

// Formatting
export function formatMemberSince(joinDate: string): string
export function getMembershipBadge(tier: MembershipTier): { label: string; color: string }
export function getRoleBadge(role: UserRole): { label: string; color: string }
export function getDuesStatusBadge(status: DuesStatus): { label: string; color: string }

// Business Logic
export function checkDuesStatus(duesPaidUntil?: string): DuesStatus
export function calculateProfileCompleteness(profile: UserProfile): number
export function generateInviteCode(): string // 8-char alphanumeric
export function getInviteExpirationDate(): string // 7 days from now
```

### Phase 3: UI Pages

**File:** `src/pages/MembersPage.tsx`
**Purpose:** Main member directory
**Features:**
- Search bar (name, email)
- Filter tabs: All, Owners, Managers, Members, Inactive
- Stats cards: Total members, Active, Unpaid dues, By role
- Member grid (cards) or table view toggle
- Quick actions: View, Email, Promote/Demote
- Invite button (managers+)
- Export members list

**File:** `src/pages/MemberDetailsPage.tsx`
**Route:** `/members/:userId`
**Features:**
- Profile header (avatar, name, role, tier, status)
- Contact information section
- Emergency contact section
- Hunter safety certification
- Dues payment history
- Recent activity (bookings, harvests)
- Edit button (if permitted)
- Role management section (owners only)
- Suspend/Delete actions (owners only)

**File:** `src/pages/EditProfilePage.tsx`
**Route:** `/members/:userId/edit` or `/profile/edit`
**Features:**
- Personal info form (name, phone, address)
- Emergency contact form
- Hunter safety cert upload
- Avatar upload to Firebase Storage
- Bio/description textarea
- Save/Cancel buttons
- Validation on all fields

**File:** `src/pages/InviteMemberPage.tsx`
**Route:** `/members/invite`
**Features:**
- Email input with validation
- Role selection dropdown (restricted by inviter's role)
- Membership tier selection
- Personal message textarea
- Preview of invite details
- Generate invite link
- Copy link button
- Send button (future: email integration)

**File:** `src/pages/ManageInvitesPage.tsx`
**Route:** `/members/invites`
**Features:**
- List of all invites
- Filter tabs: Pending, Accepted, Expired, Cancelled
- Search by email
- Invite details: Email, Role, Invited by, Created date, Expires date
- Actions: Resend, Cancel, Copy link
- Acceptance rate stats

**File:** `src/pages/AcceptInvitePage.tsx`
**Route:** `/invite/:inviteCode` (public)
**Features:**
- Display invite details
- Check if already logged in
- If not: Prompt to sign up with invited email
- If yes: Confirm acceptance
- Update user profile with invite data
- Mark invite as accepted
- Redirect to dashboard

### Phase 4: UI Components

**File:** `src/components/MemberCard.tsx`
```typescript
interface MemberCardProps {
  member: UserProfile;
  onView?: () => void;
  onEdit?: () => void;
  onPromote?: () => void;
  showActions?: boolean;
}
```
**Features:**
- Avatar (placeholder with initials)
- Name, email
- Role badge, tier badge, status badge
- Dues status indicator
- Quick actions dropdown
- Hover animations

**File:** `src/components/RoleBadge.tsx`
```typescript
interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}
```
**Colors:**
- Owner: Gold gradient
- Manager: Silver/blue
- Member: Green

**File:** `src/components/MemberStats.tsx`
**Features:**
- Total members count
- Active vs Inactive
- Dues paid/unpaid breakdown
- By role breakdown
- By tier breakdown
- Animated counters

**File:** `src/components/MembershipTierBadge.tsx`
**Colors:**
- Full: Blue
- Family: Purple
- Youth: Green
- Guest: Gray

**File:** `src/components/DuesStatusBadge.tsx`
**Colors:**
- Paid: Green
- Unpaid: Yellow
- Overdue: Red
- Exempt: Gray

---

## User Stories Implementation

### "I want to invite my friend to join our club"
**Flow:**
1. User clicks "Invite Member" button on Members page
2. Navigates to `/members/invite`
3. Fills out: Email, Role (Member), Tier (Full)
4. Optional: Personal message
5. Clicks "Generate Invite"
6. System creates invite document in Firestore
7. Shows invite link to copy
8. User shares link with friend via email/text
9. Friend clicks link → `/invite/:code`
10. Friend signs up with matching email
11. Profile created with invited role/tier
12. Invite marked as accepted

### "I need to see all members who haven't paid dues"
**Flow:**
1. User navigates to `/members`
2. Component calls `useUnpaidMembers(clubId)`
3. Firestore query filters: `duesStatus == 'unpaid' || duesStatus == 'overdue'`
4. Displays filtered list
5. Each card shows dues status badge (red/yellow)
6. Optional: Click to email reminders

### "I want to promote John to manager role"
**Flow:**
1. Owner navigates to `/members/:johnId`
2. Views member details
3. Sees "Role Management" section (owners only)
4. Current role: Member
5. Dropdown to select: Manager
6. Clicks "Update Role"
7. Confirmation dialog: "Promote John to Manager?"
8. Calls `updateMemberRole(johnId, 'manager')`
9. Firestore rule checks current user is owner
10. Updates role in users collection
11. Success notification
12. John's profile updates in real-time

---

## MVP Scope (Phase 1)

### Must Have
✅ Members directory with search and filters
✅ Member detail page
✅ Edit own profile
✅ Role badges and status indicators
✅ Manual invite system (copy/paste link)
✅ Role promotion/demotion (owners only)
✅ Basic dues status tracking
✅ Firestore rules and indexes
✅ Member stats dashboard

### Should Have (Phase 2)
- Automated email invites via Firebase Functions
- Member approval workflow
- Advanced permissions system
- Dues payment integration (Stripe)
- Hunter safety cert file upload
- Avatar upload to Firebase Storage
- Activity logging
- Export members to CSV

### Could Have (Phase 3)
- Member badges/achievements
- Member directory privacy settings
- Bulk invite import
- Custom roles with granular permissions
- Member onboarding checklist
- Push notifications for invites
- Member anniversary notifications

---

## Implementation Order

1. **Database Schema** (30 min)
   - Update `src/types/index.ts`
   - Add new Firestore indexes to `firestore.indexes.json`
   - Update `firestore.rules`

2. **Data Layer** (2 hours)
   - Create `src/hooks/useMembers.ts`
   - Create `src/hooks/useInvites.ts`
   - Create `src/utils/memberHelpers.ts`

3. **Components** (1.5 hours)
   - Create `src/components/MemberCard.tsx`
   - Create `src/components/RoleBadge.tsx`
   - Create `src/components/MemberStats.tsx`
   - Create `src/components/MembershipTierBadge.tsx`
   - Create `src/components/DuesStatusBadge.tsx`

4. **Pages** (3-4 hours)
   - Create `src/pages/MembersPage.tsx` (directory)
   - Create `src/pages/MemberDetailsPage.tsx`
   - Create `src/pages/EditProfilePage.tsx`
   - Create `src/pages/InviteMemberPage.tsx`
   - Create `src/pages/ManageInvitesPage.tsx`

5. **Integration** (30 min)
   - Add routes to `src/App.tsx`
   - Update navigation (already has /members link)
   - Add role-based UI hiding
   - Test all flows

6. **Testing & Polish** (1 hour)
   - Test invite flow end-to-end
   - Test role permissions
   - Test member CRUD operations
   - Polish UI animations
   - Fix any bugs

**Total Estimated Time:** 8-10 hours for MVP

---

## Technical Considerations

### Role-Based Access Control
```typescript
// Utility function
function hasPermission(userRole: UserRole, action: string): boolean {
  const permissions = {
    owner: ['*'], // All permissions
    manager: ['view_members', 'invite_member', 'edit_member', 'approve_member'],
    member: ['view_directory', 'edit_own_profile']
  };

  if (userRole === 'owner') return true;
  return permissions[userRole]?.includes(action) || false;
}
```

### Profile Completeness Algorithm
```typescript
function calculateProfileCompleteness(profile: UserProfile): number {
  let score = 0;
  if (profile.displayName) score += 20;
  if (profile.phone) score += 15;
  if (profile.address) score += 15;
  if (profile.emergencyContact) score += 20;
  if (profile.hunterSafetyCert) score += 20;
  if (profile.avatar) score += 10;
  return score;
}
```

### Invite Code Generation
```typescript
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

---

## Success Metrics

- Directory loads < 1 second with 100+ members
- Real-time updates reflect within 500ms
- Invite acceptance rate > 80%
- Profile completeness average > 70%
- Zero unauthorized role changes
- Search returns results < 200ms

---

## Future Enhancements

1. **Email Integration**
   - Firebase Functions + SendGrid
   - Invite emails with branded template
   - Dues reminder emails
   - Welcome emails on acceptance

2. **Payment Integration**
   - Stripe for dues collection
   - Automatic status updates
   - Payment history tracking
   - Receipt generation

3. **Advanced Features**
   - Member directory privacy controls
   - Custom fields per club
   - Member groups/committees
   - Automatic member rankings
   - Anniversary/birthday notifications

---

## Design Mockup References

**Members Directory:**
```
[Search: 🔍 Search members...] [Invite Member 📧]

[All (24)] [Owners (2)] [Managers (4)] [Members (18)] [Inactive (3)]

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ [JD]             │ │ [MS]             │ │ [SW]             │
│ John Doe         │ │ Mike Smith       │ │ Sarah Wilson     │
│ john@email.com   │ │ mike@email.com   │ │ sarah@email.com  │
│ 🏅 Manager       │ │ 👤 Member        │ │ 👤 Member        │
│ 💎 Full Member   │ │ 💎 Full Member   │ │ 👨‍👩‍👦 Family      │
│ ✅ Dues Paid     │ │ ⚠️ Dues Unpaid   │ │ ✅ Dues Paid     │
│ [...] Actions    │ │ [...] Actions    │ │ [...] Actions    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Member Details:**
```
[← Back to Members]

┌─────────────────────────────────────────────┐
│          [JD]                               │
│      John Doe - Manager                     │
│      🏅 Manager  💎 Full  ✅ Active         │
│      Member since Jan 2024                  │
└─────────────────────────────────────────────┘

📧 Contact Information
├─ Email: john@email.com
├─ Phone: (555) 123-4567
└─ Address: 123 Main St, City, ST 12345

🚨 Emergency Contact
├─ Name: Jane Doe
├─ Phone: (555) 987-6543
└─ Relationship: Spouse

🎯 Hunter Safety
├─ Cert #: HS123456
├─ Expires: Dec 31, 2025
└─ Status: ✅ Verified

💰 Membership Dues
├─ Status: ✅ Paid
├─ Paid Until: Dec 31, 2024
└─ Last Payment: Jan 15, 2024

📊 Activity
├─ 12 Total Bookings
├─ 8 Total Harvests
└─ Last Active: 2 hours ago
```

This plan follows the established patterns from your booking system and provides a complete, production-ready member management solution.
