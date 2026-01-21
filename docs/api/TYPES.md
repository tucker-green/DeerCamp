# TypeScript Types & Interfaces

This document provides a complete reference for all TypeScript types and interfaces used in DeerCamp.

## Table of Contents

- [Type Aliases](#type-aliases)
- [User & Authentication](#user--authentication)
- [Club & Membership](#club--membership)
- [Stands & Bookings](#stands--bookings)
- [Property & Map Features](#property--map-features)
- [Harvests](#harvests)
- [Social Features](#social-features)
- [Events](#events)

---

## Type Aliases

### User Roles
```typescript
type UserRole = 'owner' | 'manager' | 'member';
```
Defines the permission level within a club.

### Membership Classifications
```typescript
type MembershipTier = 'full' | 'family' | 'youth' | 'guest';
type MemberStatus = 'active' | 'inactive' | 'suspended';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type DuesStatus = 'paid' | 'unpaid' | 'overdue' | 'exempt';
type JoinRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
```

### Booking Types
```typescript
type BookingStatus = 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
type HuntType = 'morning' | 'evening' | 'all-day';
```

### Harvest Types
```typescript
type WeaponType = 'rifle' | 'bow' | 'crossbow' | 'muzzleloader' | 'shotgun' | 'handgun';
type ShotPlacement = 
  | 'heart' | 'lungs' | 'heart-lungs' 
  | 'shoulder' | 'neck' | 'head' 
  | 'gut' | 'quartering-away' | 'quartering-toward';
```

### Geographic Types
```typescript
type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
type AccessRouteType = 'road' | 'atv-trail' | 'walking-path' | 'quiet-approach';
type TerrainFeatureType = 
  | 'water-source' | 'bedding-area' | 'feeding-area' 
  | 'scrape' | 'rub-line' | 'funnel' 
  | 'saddle' | 'ridge' | 'creek-crossing';
```

### Social Types
```typescript
type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';
type PostType = 'text' | 'harvest' | 'announcement' | 'event';
type ReactionType = '👍' | '❤️' | '🔥' | '🦌' | '🎯' | '💯';
type RSVPStatus = 'going' | 'maybe' | 'not-going';
type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'other';
type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
```

---

## User & Authentication

### UserProfile
```typescript
interface UserProfile {
  // Core identification
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  
  // Multi-club support
  clubIds?: string[];           // Array of all club IDs user belongs to
  activeClubId?: string;        // Currently selected club
  clubId?: string;              // @deprecated - Use clubIds
  
  // Legacy role (deprecated)
  role?: UserRole;              // @deprecated - Use ClubMembership.role
  
  // Contact information
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  
  // Emergency contact
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Hunter safety
  hunterSafetyNumber?: string;
  hunterSafetyState?: string;
  hunterSafetyExpiration?: string;
  
  // Profile details
  bio?: string;
  huntingExperience?: string;
  preferredSpecies?: string[];
  preferredWeapons?: string[];
  
  // Audit fields
  createdAt: string;            // ISO 8601 timestamp
  updatedAt?: string;           // ISO 8601 timestamp
  lastLoginAt?: string;         // ISO 8601 timestamp
  
  // Admin flags
  isSuperAdmin?: boolean;       // Platform-wide admin access
}
```

---

## Club & Membership

### Club
```typescript
interface Club {
  // Identification
  id?: string;                  // Firestore document ID
  name: string;
  description?: string;
  
  // Ownership
  ownerId: string;              // User ID of club owner
  
  // Visibility
  isPublic: boolean;            // Discoverable in club directory
  requiresApproval?: boolean;   // Join requests need approval
  
  // Location
  location?: {
    city?: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Media
  coverImageUrl?: string;
  logoUrl?: string;
  
  // Capacity
  memberCount?: number;
  maxMembers?: number;
  
  // Classification
  tags?: string[];              // e.g., ['deer', 'turkey', 'bow-hunting']
  
  // Settings
  settings?: {
    allowGuestBookings?: boolean;
    requireCheckIn?: boolean;
    maxBookingsPerDay?: number;
    advanceBookingDays?: number;
  };
  
  // Rules
  rules?: string;               // Club rules and guidelines
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

### ClubMembership
```typescript
interface ClubMembership {
  // Junction identifiers
  id?: string;                  // Firestore document ID
  userId: string;
  clubId: string;
  
  // Role and permissions
  role: UserRole;               // 'owner' | 'manager' | 'member'
  
  // Status tracking
  membershipStatus: MemberStatus;
  approvalStatus: ApprovalStatus;
  
  // Membership tier
  membershipTier: MembershipTier;
  
  // Dues tracking
  duesStatus?: DuesStatus;
  duesPaidUntil?: string;       // ISO 8601 date
  duesAmount?: number;
  
  // Lifecycle
  joinedAt: string;             // ISO 8601 timestamp
  invitedBy?: string;           // User ID who sent invite
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

### MemberWithClubData
```typescript
interface MemberWithClubData extends UserProfile {
  // ClubMembership fields merged in
  role: UserRole;
  membershipStatus: MemberStatus;
  approvalStatus: ApprovalStatus;
  membershipTier: MembershipTier;
  duesStatus?: DuesStatus;
  duesPaidUntil?: string;
  joinedAt: string;
  
  // Computed fields
  profileCompleteness?: number;  // 0-100 percentage
}
```

### ClubJoinRequest
```typescript
interface ClubJoinRequest {
  id?: string;
  clubId: string;
  userId: string;
  
  // Request details
  message?: string;             // Optional message from requester
  status: JoinRequestStatus;
  
  // Review information
  reviewedBy?: string;          // User ID of reviewer
  reviewedAt?: string;
  rejectionReason?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

---

## Stands & Bookings

### Stand
```typescript
interface Stand {
  id?: string;
  clubId: string;
  
  // Basic info
  name: string;
  description?: string;
  type: 'ladder' | 'climber' | 'blind' | 'box';
  
  // Location
  location: {
    lat: number;
    lng: number;
  };
  
  // Status
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  
  // Map display
  markerColor?: string;
  elevation?: number;           // Feet above ground
  
  // Condition
  lastInspection?: string;      // ISO 8601 date
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Notes
  notes?: string;
  accessNotes?: string;         // How to get there
  windNotes?: string;           // Preferred wind directions
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}
```

### Booking
```typescript
interface Booking {
  id?: string;
  clubId: string;
  standId: string;
  userId: string;
  
  // Timing
  date: string;                 // ISO 8601 date (YYYY-MM-DD)
  startTime: string;            // ISO 8601 timestamp
  endTime: string;              // ISO 8601 timestamp
  huntType: HuntType;
  
  // Status
  status: BookingStatus;
  
  // Check-in tracking
  checkedInAt?: string;         // ISO 8601 timestamp
  checkedOutAt?: string;        // ISO 8601 timestamp
  
  // Cancellation
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  
  // Notes
  notes?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

---

## Property & Map Features

### PropertyBoundary
```typescript
interface PropertyBoundary {
  id?: string;
  clubId: string;
  
  // Boundary data
  name: string;
  coordinates: [number, number][];  // [lng, lat] pairs
  acres?: number;
  
  // Classification
  boundaryType?: 'owned' | 'leased' | 'neighboring' | 'hunting-area';
  ownerName?: string;
  
  // Display
  color?: string;               // Hex color
  
  // Notes
  notes?: string;
  
  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}
```

### FoodPlot
```typescript
interface FoodPlot {
  id?: string;
  clubId: string;
  
  // Plot data
  name: string;
  coordinates: [number, number][];  // Polygon [lng, lat] pairs
  acres?: number;
  
  // Planting info
  plantedWith?: string;         // e.g., 'Clover', 'Brassica'
  plantDate?: string;           // ISO 8601 date
  
  // Maintenance
  lastFertilized?: string;
  lastSprayed?: string;
  
  // Photos
  photoUrls?: string[];
  
  // Notes
  notes?: string;
  
  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}
```

### AccessRoute
```typescript
interface AccessRoute {
  id?: string;
  clubId: string;
  
  // Route data
  name: string;
  coordinates: [number, number][];  // Line [lng, lat] pairs
  type: AccessRouteType;
  lengthYards?: number;
  
  // Characteristics
  difficulty?: 'easy' | 'moderate' | 'difficult';
  seasonal?: boolean;
  seasonalNotes?: string;
  
  // Notes
  notes?: string;
  
  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}
```

### TerrainFeature
```typescript
interface TerrainFeature {
  id?: string;
  clubId: string;
  
  // Feature data
  name?: string;
  type: TerrainFeatureType;
  location: {
    lat: number;
    lng: number;
  };
  
  // Details
  description?: string;
  radius?: number;              // Size in yards
  seasonalActivity?: string;    // When active
  
  // Photos
  photoUrls?: string[];
  
  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}
```

### TrailCamera
```typescript
interface TrailCamera {
  id?: string;
  clubId: string;
  
  // Camera data
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  
  // Equipment info
  model?: string;
  installDate?: string;
  
  // Status
  batteryLevel?: number;        // 0-100 percentage
  sdCardStatus?: 'ok' | 'full' | 'missing';
  lastCheck?: string;           // ISO 8601 date
  photoCount?: number;
  
  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}
```

### ParcelBoundary
```typescript
interface ParcelBoundary {
  id?: string;
  parcelId: string;             // County parcel ID
  
  // Ownership
  owner: string;
  
  // Geometry
  coordinates: [number, number][][] | [number, number][][][];  // MultiPolygon
  centroid: [number, number];
  
  // Property details
  acres?: number;
  propertyAddress?: string;
  
  // Source
  source?: 'county-gis' | 'demo' | 'cached';
  
  // Audit
  fetchedAt?: string;
}
```

---

## Harvests

### Harvest
```typescript
interface Harvest {
  id?: string;
  clubId: string;
  userId: string;
  
  // Basic info
  species: 'whitetail' | 'mule-deer' | 'elk' | 'turkey' | 'hog' | 'other';
  sex?: 'buck' | 'doe' | 'tom' | 'hen' | 'boar' | 'sow' | 'unknown';
  date: string;                 // ISO 8601 date
  
  // Photos
  photoUrls?: string[];
  mainPhotoUrl?: string;
  
  // Location
  standId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  locationDescription?: string;
  
  // Hunt details
  huntType?: HuntType;
  weapon: WeaponType;
  weaponDetails?: string;       // Make/model/caliber
  shotDistance?: number;        // Yards
  shotPlacement?: ShotPlacement;
  trackingDistance?: number;    // Yards to recovery
  
  // Conditions
  temperature?: number;         // Fahrenheit
  windDirection?: WindDirection;
  windSpeed?: number;           // MPH
  moonPhase?: string;
  weatherConditions?: string;
  
  // Deer-specific measurements
  deerData?: {
    points?: number;            // Antler points
    insideSpread?: number;      // Inches
    mainBeamLength?: number;    // Inches (average)
    mass?: number;              // Circumference inches
    grossScore?: number;        // B&C gross
    netScore?: number;          // B&C net
    isTypical?: boolean;
    fieldDressedWeight?: number;
    liveWeight?: number;
    age?: number;               // Years
  };
  
  // Turkey-specific measurements
  turkeyData?: {
    beardLength?: number;       // Inches
    spurLength?: number;        // Inches (average)
    weight?: number;            // Pounds
  };
  
  // Hog-specific measurements
  hogData?: {
    weight?: number;            // Pounds
    tuskLength?: number;        // Inches
  };
  
  // Legal/compliance
  tagNumber?: string;
  licenseNumber?: string;
  landowner?: boolean;
  publicLand?: boolean;
  
  // Processing
  processing?: 'self' | 'processor' | 'donation';
  processorName?: string;
  mountPlanned?: boolean;
  mountType?: string;
  
  // Narrative
  story?: string;               // Hunt story
  notes?: string;
  
  // Records
  isClubRecord?: boolean;
  recordCategories?: string[];
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

---

## Social Features

### Post
```typescript
interface Post {
  id?: string;
  clubId: string;
  authorId: string;
  
  // Content
  type: PostType;
  content: string;
  
  // Media
  photoUrls?: string[];
  videoUrl?: string;
  
  // Links
  harvestId?: string;           // If type === 'harvest'
  eventId?: string;             // If type === 'event'
  
  // Announcement settings
  isPinned?: boolean;
  isAnnouncement?: boolean;
  announcementExpiresAt?: string;
  
  // Engagement
  reactionCount?: number;
  commentCount?: number;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

### Comment
```typescript
interface Comment {
  id?: string;
  postId: string;
  clubId: string;
  authorId: string;
  
  // Content
  content: string;
  
  // Threading
  parentCommentId?: string;     // For replies
  replyCount?: number;
  
  // Engagement
  reactionCount?: number;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

### Reaction
```typescript
interface Reaction {
  id?: string;
  
  // Target
  targetType: 'post' | 'comment';
  targetId: string;
  clubId: string;
  
  // Reaction
  userId: string;
  type: ReactionType;
  
  // Audit
  createdAt: string;
}
```

### Invite
```typescript
interface Invite {
  id?: string;
  clubId: string;
  
  // Invitation details
  email: string;
  role: UserRole;
  membershipTier: MembershipTier;
  message?: string;
  
  // Tracking
  invitedBy: string;            // User ID
  inviteCode: string;           // Unique code
  status: InviteStatus;
  
  // Lifecycle
  expiresAt: string;            // ISO 8601 timestamp
  acceptedAt?: string;
  acceptedBy?: string;          // User ID who accepted
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

### Report
```typescript
interface Report {
  id?: string;
  clubId: string;
  
  // Target
  targetType: 'post' | 'comment';
  targetId: string;
  targetUserId: string;
  targetUserName?: string;
  
  // Report details
  reporterId: string;
  reason: ReportReason;
  details?: string;
  
  // Resolution
  status: ReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

---

## Events

### Event
```typescript
interface Event {
  id?: string;
  clubId: string;
  
  // Event details
  title: string;
  description?: string;
  
  // Timing
  startDate: string;            // ISO 8601 timestamp
  endDate?: string;             // ISO 8601 timestamp
  allDay?: boolean;
  
  // Location
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // RSVP tracking
  rsvpEnabled?: boolean;
  goingCount?: number;
  maybeCount?: number;
  notGoingCount?: number;
  maxAttendees?: number;
  
  // Visibility
  isPublic?: boolean;           // Visible to non-members
  
  // Audit fields
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}
```

### EventRSVP
```typescript
interface EventRSVP {
  id?: string;
  eventId: string;
  clubId: string;
  userId: string;
  
  // Response
  status: RSVPStatus;
  note?: string;
  guestCount?: number;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}
```

---

## Usage Examples

### Type Guards
```typescript
// Check if user has manager+ permissions
function isManagerOrOwner(role: UserRole): boolean {
  return role === 'owner' || role === 'manager';
}

// Check if membership is active
function isActiveMember(membership: ClubMembership): boolean {
  return membership.membershipStatus === 'active' 
    && membership.approvalStatus === 'approved';
}
```

### Type Narrowing
```typescript
// Species-specific data access
if (harvest.species === 'whitetail' && harvest.deerData) {
  console.log(`Points: ${harvest.deerData.points}`);
  console.log(`Score: ${harvest.deerData.grossScore}`);
}
```

---

*Types documented from `src/types/index.ts`*
