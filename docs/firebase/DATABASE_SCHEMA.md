# Database Schema

This document details the Firestore database schema used in DeerCamp.

## Overview

DeerCamp uses Cloud Firestore as its primary database. The schema is designed for:
- Multi-club support with data isolation
- Real-time updates
- Role-based access control
- Efficient querying with composite indexes

## Collections

### users

Stores user profiles and authentication data.

```
users/{userId}
├── uid: string                    # Firebase Auth UID
├── email: string                  # User's email
├── displayName: string            # Display name
├── photoURL?: string              # Avatar URL
│
├── clubIds?: string[]             # Array of club IDs user belongs to
├── activeClubId?: string          # Currently selected club
├── clubId?: string                # @deprecated - single club ID
├── role?: UserRole                # @deprecated - use ClubMembership
│
├── phone?: string
├── address?: {
│   ├── street?: string
│   ├── city?: string
│   ├── state?: string
│   └── zip?: string
│ }
│
├── emergencyContact?: {
│   ├── name: string
│   ├── phone: string
│   └── relationship: string
│ }
│
├── hunterSafetyNumber?: string
├── hunterSafetyState?: string
├── hunterSafetyExpiration?: string
│
├── bio?: string
├── huntingExperience?: string
├── preferredSpecies?: string[]
├── preferredWeapons?: string[]
│
├── isSuperAdmin?: boolean         # Platform admin flag
│
├── createdAt: string              # ISO timestamp
├── updatedAt?: string
└── lastLoginAt?: string
```

**Indexes:**
- Document ID (automatic)
- `clubId` + `role` (composite)

---

### clubs

Stores hunting club information.

```
clubs/{clubId}
├── name: string                   # Club name
├── description?: string
├── ownerId: string                # User ID of owner
│
├── isPublic: boolean              # Discoverable
├── requiresApproval?: boolean     # Join requests need approval
│
├── location?: {
│   ├── city?: string
│   ├── state?: string
│   └── coordinates?: {
│       ├── lat: number
│       └── lng: number
│   }
│ }
│
├── coverImageUrl?: string
├── logoUrl?: string
│
├── memberCount?: number
├── maxMembers?: number
│
├── tags?: string[]                # e.g., ['deer', 'turkey']
│
├── settings?: {
│   ├── allowGuestBookings?: boolean
│   ├── requireCheckIn?: boolean
│   ├── maxBookingsPerDay?: number
│   └── advanceBookingDays?: number
│ }
│
├── rules?: string                 # Club rules text
│
├── createdAt: string
└── updatedAt?: string
```

---

### clubMemberships

Junction table linking users to clubs.

```
clubMemberships/{membershipId}
├── userId: string                 # User ID
├── clubId: string                 # Club ID
│
├── role: UserRole                 # 'owner' | 'manager' | 'member'
├── membershipStatus: MemberStatus # 'active' | 'inactive' | 'suspended'
├── approvalStatus: ApprovalStatus # 'pending' | 'approved' | 'rejected'
├── membershipTier: MembershipTier # 'full' | 'family' | 'youth' | 'guest'
│
├── duesStatus?: DuesStatus        # 'paid' | 'unpaid' | 'overdue' | 'exempt'
├── duesPaidUntil?: string         # ISO date
├── duesAmount?: number
│
├── joinedAt: string               # ISO timestamp
├── invitedBy?: string             # User ID who invited
│
├── createdAt: string
└── updatedAt?: string
```

**Document ID Convention:** `{userId}_{clubId}`

**Indexes:**
- `userId` + `membershipStatus`
- `clubId` + `role`
- `clubId` + `membershipStatus` + `approvalStatus`

---

### clubJoinRequests

Stores requests to join public clubs.

```
clubJoinRequests/{requestId}
├── clubId: string
├── userId: string
│
├── message?: string               # Message from requester
├── status: JoinRequestStatus      # 'pending' | 'approved' | 'rejected' | 'cancelled'
│
├── reviewedBy?: string            # User ID of reviewer
├── reviewedAt?: string
├── rejectionReason?: string
│
├── createdAt: string
└── updatedAt?: string
```

---

### stands

Stores hunting stand information.

```
stands/{standId}
├── clubId: string                 # Indexed
├── name: string
├── description?: string
├── type: StandType                # 'ladder' | 'climber' | 'blind' | 'box'
│
├── location: {
│   ├── lat: number
│   └── lng: number
│ }
│
├── status: StandStatus            # 'available' | 'reserved' | 'occupied' | 'maintenance'
│
├── markerColor?: string
├── elevation?: number             # Feet above ground
│
├── lastInspection?: string        # ISO date
├── condition?: string             # 'excellent' | 'good' | 'fair' | 'poor'
│
├── notes?: string
├── accessNotes?: string
├── windNotes?: string
│
├── createdAt?: string
└── updatedAt?: string
```

**Indexes:**
- `clubId` (single)

---

### bookings

Stores stand reservations.

```
bookings/{bookingId}
├── clubId: string                 # Indexed
├── standId: string                # Indexed
├── userId: string                 # Indexed
│
├── date: string                   # ISO date (YYYY-MM-DD)
├── startTime: string              # ISO timestamp
├── endTime: string                # ISO timestamp
├── huntType: HuntType             # 'morning' | 'evening' | 'all-day'
│
├── status: BookingStatus          # 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show'
│
├── checkedInAt?: string           # ISO timestamp
├── checkedOutAt?: string
│
├── cancelledAt?: string
├── cancelledBy?: string
├── cancellationReason?: string
│
├── notes?: string
│
├── createdAt: string
└── updatedAt?: string
```

**Indexes:**
- `clubId` + `startTime`
- `standId` + `startTime`
- `userId` + `startTime`
- `clubId` + `status` + `startTime`
- `clubId` + `userId` + `startTime`

---

### harvests

Stores harvest records with measurements.

```
harvests/{harvestId}
├── clubId: string                 # Indexed
├── userId: string                 # Indexed
│
├── species: string                # 'whitetail' | 'mule-deer' | 'elk' | 'turkey' | 'hog' | 'other'
├── sex?: string
├── date: string                   # ISO date
│
├── photoUrls?: string[]
├── mainPhotoUrl?: string
│
├── standId?: string
├── location?: { lat, lng }
├── locationDescription?: string
│
├── huntType?: HuntType
├── weapon: WeaponType
├── weaponDetails?: string
├── shotDistance?: number
├── shotPlacement?: ShotPlacement
├── trackingDistance?: number
│
├── temperature?: number
├── windDirection?: WindDirection
├── windSpeed?: number
├── moonPhase?: string
├── weatherConditions?: string
│
├── deerData?: {                   # Deer-specific
│   ├── points?: number
│   ├── insideSpread?: number
│   ├── mainBeamLength?: number
│   ├── mass?: number
│   ├── grossScore?: number
│   ├── netScore?: number
│   ├── isTypical?: boolean
│   ├── fieldDressedWeight?: number
│   ├── liveWeight?: number
│   └── age?: number
│ }
│
├── turkeyData?: {                 # Turkey-specific
│   ├── beardLength?: number
│   ├── spurLength?: number
│   └── weight?: number
│ }
│
├── hogData?: {                    # Hog-specific
│   ├── weight?: number
│   └── tuskLength?: number
│ }
│
├── tagNumber?: string
├── licenseNumber?: string
├── landowner?: boolean
├── publicLand?: boolean
│
├── processing?: string
├── processorName?: string
├── mountPlanned?: boolean
├── mountType?: string
│
├── story?: string
├── notes?: string
│
├── isClubRecord?: boolean
├── recordCategories?: string[]
│
├── createdAt: string
└── updatedAt?: string
```

**Indexes:**
- `userId` + `date`
- `clubId` + `date`

---

### posts

Stores activity feed posts.

```
posts/{postId}
├── clubId: string                 # Indexed
├── authorId: string
│
├── type: PostType                 # 'text' | 'harvest' | 'announcement' | 'event'
├── content: string
│
├── photoUrls?: string[]
├── videoUrl?: string
│
├── harvestId?: string             # Link to harvest
├── eventId?: string               # Link to event
│
├── isPinned?: boolean
├── isAnnouncement?: boolean
├── announcementExpiresAt?: string
│
├── reactionCount?: number
├── commentCount?: number
│
├── createdAt: string
└── updatedAt?: string
```

**Indexes:**
- `clubId` + `createdAt`
- `clubId` + `isPinned` + `createdAt`

---

### comments

Stores post comments.

```
comments/{commentId}
├── postId: string                 # Indexed
├── clubId: string
├── authorId: string
│
├── content: string
│
├── parentCommentId?: string       # For replies
├── replyCount?: number
├── reactionCount?: number
│
├── createdAt: string
└── updatedAt?: string
```

**Indexes:**
- `postId` + `clubId` + `parentCommentId` + `createdAt`

---

### reactions

Stores reactions on posts/comments.

```
reactions/{reactionId}
├── targetType: string             # 'post' | 'comment'
├── targetId: string
├── clubId: string
│
├── userId: string
├── type: ReactionType             # '👍' | '❤️' | '🔥' | '🦌' | '🎯' | '💯'
│
└── createdAt: string
```

---

### invites

Stores member invitations.

```
invites/{inviteId}
├── clubId: string                 # Indexed
│
├── email: string
├── role: UserRole
├── membershipTier: MembershipTier
├── message?: string
│
├── invitedBy: string
├── inviteCode: string             # Unique code
├── status: InviteStatus           # 'pending' | 'accepted' | 'expired' | 'cancelled'
│
├── expiresAt: string
├── acceptedAt?: string
├── acceptedBy?: string
│
├── createdAt: string
└── updatedAt?: string
```

**Indexes:**
- `clubId` + `status` + `createdAt`
- `inviteCode` (for lookup)

---

### propertyBoundaries

Stores property boundary polygons.

```
propertyBoundaries/{boundaryId}
├── clubId: string                 # Indexed
│
├── name: string
├── coordinates: [number, number][]  # [lng, lat] pairs
├── acres?: number
│
├── boundaryType?: string          # 'owned' | 'leased' | 'neighboring' | 'hunting-area'
├── ownerName?: string
├── color?: string
├── notes?: string
│
├── createdBy: string
├── createdAt: string
└── updatedAt?: string
```

---

### foodPlots

Stores food plot polygons.

```
foodPlots/{plotId}
├── clubId: string                 # Indexed
│
├── name: string
├── coordinates: [number, number][]
├── acres?: number
│
├── plantedWith?: string
├── plantDate?: string
├── lastFertilized?: string
├── lastSprayed?: string
│
├── photoUrls?: string[]
├── notes?: string
│
├── createdBy: string
├── createdAt: string
└── updatedAt?: string
```

---

### accessRoutes

Stores access route lines.

```
accessRoutes/{routeId}
├── clubId: string                 # Indexed
│
├── name: string
├── coordinates: [number, number][]
├── type: AccessRouteType          # 'road' | 'atv-trail' | 'walking-path' | 'quiet-approach'
├── lengthYards?: number
│
├── difficulty?: string            # 'easy' | 'moderate' | 'difficult'
├── seasonal?: boolean
├── seasonalNotes?: string
├── notes?: string
│
├── createdBy: string
├── createdAt: string
└── updatedAt?: string
```

---

### terrainFeatures

Stores terrain feature point markers.

```
terrainFeatures/{featureId}
├── clubId: string                 # Indexed
│
├── name?: string
├── type: TerrainFeatureType
├── location: { lat, lng }
│
├── description?: string
├── radius?: number
├── seasonalActivity?: string
│
├── photoUrls?: string[]
│
├── createdBy: string
├── createdAt: string
└── updatedAt?: string
```

---

### trailCameras

Stores trail camera locations.

```
trailCameras/{cameraId}
├── clubId: string                 # Indexed
│
├── name: string
├── location: { lat, lng }
│
├── model?: string
├── installDate?: string
│
├── batteryLevel?: number
├── sdCardStatus?: string
├── lastCheck?: string
├── photoCount?: number
│
├── createdBy: string
├── createdAt: string
└── updatedAt?: string
```

---

### events

Stores club events.

```
events/{eventId}
├── clubId: string
│
├── title: string
├── description?: string
│
├── startDate: string
├── endDate?: string
├── allDay?: boolean
│
├── location?: string
├── coordinates?: { lat, lng }
│
├── rsvpEnabled?: boolean
├── goingCount?: number
├── maybeCount?: number
├── notGoingCount?: number
├── maxAttendees?: number
│
├── isPublic?: boolean
│
├── createdBy: string
├── createdAt: string
└── updatedAt?: string
```

---

### eventRSVPs

Stores event RSVPs.

```
eventRSVPs/{rsvpId}
├── eventId: string
├── clubId: string
├── userId: string
│
├── status: RSVPStatus             # 'going' | 'maybe' | 'not-going'
├── note?: string
├── guestCount?: number
│
├── createdAt: string
└── updatedAt?: string
```

---

### reports

Stores content moderation reports.

```
reports/{reportId}
├── clubId: string
│
├── targetType: string             # 'post' | 'comment'
├── targetId: string
├── targetUserId: string
├── targetUserName?: string
│
├── reporterId: string
├── reason: ReportReason           # 'spam' | 'harassment' | 'inappropriate' | 'other'
├── details?: string
│
├── status: ReportStatus           # 'pending' | 'reviewed' | 'resolved' | 'dismissed'
├── resolvedBy?: string
├── resolvedAt?: string
├── resolution?: string
│
├── createdAt: string
└── updatedAt?: string
```

---

## Index Configuration

Located in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "harvests",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "fields": [
        { "fieldPath": "standId", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "ASCENDING" }
      ]
    },
    // ... additional indexes
  ]
}
```

---

*Schema documented from Firestore collections*
