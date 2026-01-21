# Utility Functions Reference

This document provides comprehensive documentation for all utility functions in DeerCamp.

## Table of Contents

- [Overview](#overview)
- [Booking Utilities](#booking-utilities)
- [Member Utilities](#member-utilities)
- [Map & Geo Utilities](#map--geo-utilities)
- [Trophy & Records](#trophy--records)

---

## Overview

### File Organization

```
src/utils/
├── bookingHelpers.ts       # Booking validation and formatting
├── bookingRules.ts         # Club booking rules engine
├── boundaryDrawHelpers.ts  # Mapbox Draw utilities
├── geoUtils.ts             # Geographic calculations
├── memberHelpers.ts        # Member validation and permissions
├── parcelHelpers.ts        # Public parcel utilities
├── standMarkerHelpers.ts   # Stand marker creation
├── terrainFeatureHelpers.ts # Terrain feature markers
└── trophyRecords.ts        # Trophy records and stats
```

---

## Booking Utilities

### bookingHelpers.ts

#### checkBookingConflict

Checks for overlapping bookings on a stand.

```typescript
async function checkBookingConflict(
  standId: string,
  startTime: Date,
  endTime: Date,
  clubId?: string,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: Booking }>
```

**Usage:**
```typescript
const { hasConflict, conflictingBooking } = await checkBookingConflict(
  'stand-123',
  new Date('2026-01-25T06:00:00'),
  new Date('2026-01-25T11:00:00'),
  'club-456'
);

if (hasConflict) {
  console.log('Conflict with:', conflictingBooking);
}
```

---

#### validateBookingTime

Validates booking start and end times.

```typescript
function validateBookingTime(
  startTime: Date,
  endTime: Date
): { valid: boolean; error?: string }
```

**Validations:**
- Start time not in past
- End time after start time
- Duration between 1-12 hours

---

#### formatBookingDate

Formats a date string for display.

```typescript
function formatBookingDate(dateString: string): string
// Returns: "Today", "Tomorrow", or formatted date
```

---

#### formatTimeRange

Formats a time range for display.

```typescript
function formatTimeRange(startTime: string, endTime: string): string
// Returns: "6:00 AM - 10:00 AM"
```

---

#### getHuntType

Determines hunt type from start time.

```typescript
function getHuntType(startTime: Date): 'morning' | 'evening' | 'all-day'
// Morning: 4-11 AM, Evening: 2-8 PM, All-day: otherwise
```

---

#### getSunTimes

Returns approximate sunrise/sunset times.

```typescript
function getSunTimes(date: Date): { sunrise: string; sunset: string }
// Returns hardcoded approximations
```

---

#### canModifyBooking

Checks if user can modify/cancel a booking.

```typescript
function canModifyBooking(booking: Booking, userId: string): boolean
```

---

### bookingRules.ts

#### BookingRulesConfig

Configuration interface for club booking rules.

```typescript
interface BookingRulesConfig {
  maxDaysInAdvance?: number;      // Max days ahead to book
  maxConsecutiveDays?: number;    // Max consecutive days
  minAdvanceHours?: number;       // Minimum hours notice
  blackoutDates?: Date[];         // Blocked dates
  guestBookingRestrictions?: {
    allowGuests: boolean;
    requiresApproval: boolean;
    maxGuestDays?: number;
  };
}
```

---

#### validateBookingRules

Validates booking against club rules.

```typescript
async function validateBookingRules(
  bookingData: {
    userId: string;
    standId: string;
    startTime: Date;
    endTime: Date;
    clubId: string;
    isGuest?: boolean;
  },
  rulesConfig?: BookingRulesConfig
): Promise<{ valid: boolean; error?: string }>
```

---

#### getNextAvailableDate

Finds next available booking date for a stand.

```typescript
async function getNextAvailableDate(
  standId: string,
  clubId: string,
  startDate?: Date
): Promise<Date>
// Searches up to 30 days ahead
```

---

## Member Utilities

### memberHelpers.ts

#### Validation Functions

```typescript
function validateMemberData(data: Partial<UserProfile>): { valid: boolean; error?: string }
function validateEmail(email: string): boolean
function validatePhone(phone: string): boolean
```

---

#### Permission Functions

Check what actions a user can perform on members.

```typescript
// Check if user can promote a member
function canPromoteMember(
  membership: ClubMembership,
  currentUserRole: UserRole
): boolean

// Check if user can demote a member
function canDemoteMember(
  membership: ClubMembership,
  currentUserRole: UserRole
): boolean

// Check if user can suspend a member
function canSuspendMember(
  membership: ClubMembership,
  currentUserRole: UserRole
): boolean

// Check if user can edit member profile
function canEditMemberProfile(
  userId: string,
  currentUserId: string,
  currentUserRole: UserRole
): boolean

// Check if user can remove a member
function canRemoveMember(
  membership: ClubMembership,
  currentUserRole: UserRole
): boolean

// Check if user can invite members
function canInviteMembers(currentUserRole: UserRole): boolean
```

**Permission Matrix:**
| Action | Owner | Manager | Member |
|--------|-------|---------|--------|
| Promote to Manager | ✓ | ✗ | ✗ |
| Demote Manager | ✓ | ✗ | ✗ |
| Suspend Member | ✓ | ✓ | ✗ |
| Edit Others | ✓ | ✓ | ✗ |
| Remove Member | ✓ | ✓ | ✗ |
| Invite | ✓ | ✓ | ✗ |

---

#### Badge Formatting

```typescript
function getMembershipBadge(tier: MembershipTier): {
  label: string;
  color: string;
  bgColor: string;
}

function getRoleBadge(role: UserRole): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

function getDuesStatusBadge(status: DuesStatus): {
  label: string;
  color: string;
  bgColor: string;
}

function getMemberStatusBadge(status: MemberStatus): {
  label: string;
  color: string;
  bgColor: string;
}
```

---

#### Business Logic

```typescript
// Check dues status from expiration date
function checkDuesStatus(duesPaidUntil?: string): DuesStatus

// Calculate profile completeness (0-100)
function calculateProfileCompleteness(profile: UserProfile): number

// Generate unique invite code (8 chars)
function generateInviteCode(): string

// Get invite expiration (7 days from now)
function getInviteExpirationDate(): string

// Check if invite is expired
function isInviteExpired(expiresAt: string): boolean

// Format phone number
function formatPhoneNumber(phone: string): string

// Format join date
function formatMemberSince(joinDate: string): string
```

---

#### Search & Filter

```typescript
function searchMembers(
  members: MemberWithClubData[],
  searchTerm: string
): MemberWithClubData[]

function filterMembersByRole(
  members: MemberWithClubData[],
  role?: UserRole
): MemberWithClubData[]

function filterMembersByStatus(
  members: MemberWithClubData[],
  status?: MemberStatus
): MemberWithClubData[]

function filterMembersByDuesStatus(
  members: MemberWithClubData[],
  duesStatus?: DuesStatus
): MemberWithClubData[]
```

---

#### Statistics

```typescript
function getMemberStats(members: MemberWithClubData[]): {
  total: number;
  byRole: { owner: number; manager: number; member: number };
  byTier: { full: number; family: number; youth: number; guest: number };
  byStatus: { active: number; inactive: number; suspended: number };
  byDuesStatus: { paid: number; unpaid: number; overdue: number; exempt: number };
}
```

---

## Map & Geo Utilities

### geoUtils.ts

#### calculateDistance

Calculates distance between two coordinates using Haversine formula.

```typescript
function calculateDistance(
  coord1: [number, number],  // [lng, lat]
  coord2: [number, number]
): number  // Returns yards
```

---

#### calculateBearing

Calculates bearing between two coordinates.

```typescript
function calculateBearing(
  coord1: [number, number],
  coord2: [number, number]
): number  // Returns degrees (0-360)
```

---

#### getCardinalDirection

Converts bearing to cardinal direction.

```typescript
function getCardinalDirection(bearing: number): string
// Returns: 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
```

---

#### calculateCenter

Calculates center point of coordinates.

```typescript
function calculateCenter(coords: [number, number][]): [number, number]
```

---

#### formatDistance

Formats distance for display.

```typescript
function formatDistance(yards: number): string
// Returns: "150 yd" or "0.5 mi"
```

---

### boundaryDrawHelpers.ts

#### createCircle

Creates a circle polygon (for distance rings).

```typescript
function createCircle(
  center: [number, number],
  radiusInMeters: number,
  points?: number
): GeoJSON.FeatureCollection
```

---

#### DRAW_STYLES

Mapbox Draw style configuration array for polygons, lines, and vertices.

---

#### createDrawControl

Creates configured Mapbox Draw instance.

```typescript
function createDrawControl(): MapboxDraw
```

---

#### Coordinate Conversion

```typescript
// Convert Mapbox Draw polygon to coordinates
function drawPolygonToBoundary(feature: any): [number, number][]

// Convert Mapbox Draw line to coordinates
function drawLineToRoute(feature: any): [number, number][]
```

---

#### Area/Length Calculations

```typescript
// Calculate polygon area in acres (Shoelace formula)
function calculatePolygonAcres(coordinates: [number, number][]): number

// Calculate line length in yards (Haversine)
function calculateLineYards(coordinates: [number, number][]): number
```

---

#### GeoJSON Conversion

```typescript
function boundaryToGeoJSON(boundary: PropertyBoundary): GeoJSON.Feature
function foodPlotToGeoJSON(plot: FoodPlot): GeoJSON.Feature
function routeToGeoJSON(route: AccessRoute): GeoJSON.Feature
```

---

### parcelHelpers.ts

#### parcelToGeoJSON

Converts parcel to GeoJSON feature.

```typescript
function parcelToGeoJSON(parcel: ParcelBoundary): GeoJSON.Feature
```

---

#### generateDemoParcels

Generates demo parcel data for testing.

```typescript
function generateDemoParcels(
  centerLng: number,
  centerLat: number,
  count?: number
): ParcelBoundary[]
```

---

#### filterParcelsByBounds

Filters parcels to those within map bounds.

```typescript
function filterParcelsByBounds(
  parcels: ParcelBoundary[],
  bounds: { west: number; south: number; east: number; north: number }
): ParcelBoundary[]
```

---

### standMarkerHelpers.ts

#### createStandMarkerElement

Creates custom HTML marker element for stands.

```typescript
function createStandMarkerElement(stand: Stand): HTMLDivElement
```

Features:
- Color-coded by status
- Icon by type
- Hover effects
- Tooltip

---

#### Status/Type Helpers

```typescript
function getStatusColor(status: Stand['status']): string
function getTypeIcon(type: Stand['type']): string  // Emoji
function getStatusDisplayName(status: Stand['status']): string
function getTypeDisplayName(type: Stand['type']): string
```

---

### terrainFeatureHelpers.ts

#### Constants

```typescript
const TERRAIN_FEATURE_ICONS: Record<TerrainFeatureType, string>
const TERRAIN_FEATURE_COLORS: Record<TerrainFeatureType, string>
const TERRAIN_FEATURE_LABELS: Record<TerrainFeatureType, string>
```

---

#### createTerrainFeatureMarkerElement

Creates custom marker for terrain features.

```typescript
function createTerrainFeatureMarkerElement(
  type: TerrainFeatureType
): HTMLDivElement
```

---

## Trophy & Records

### trophyRecords.ts

#### RecordCategory

All trophy record categories.

```typescript
type RecordCategory =
  | 'biggest-buck-score'
  | 'biggest-buck-points'
  | 'biggest-buck-spread'
  | 'heaviest-deer'
  | 'heaviest-buck'
  | 'heaviest-doe'
  | 'biggest-turkey-beard'
  | 'biggest-turkey-spurs'
  | 'heaviest-turkey'
  | 'biggest-hog'
  | 'first-harvest'
  | 'most-harvests-season';
```

---

#### getClubRecords

Fetches all club trophy records.

```typescript
async function getClubRecords(clubId: string): Promise<ClubRecord[]>
```

**ClubRecord Interface:**
```typescript
interface ClubRecord {
  category: RecordCategory;
  title: string;
  description: string;
  harvest: Harvest;
  value: number;
  unit: string;
}
```

---

#### getLeaderboard

Gets leaderboard for specific category.

```typescript
async function getLeaderboard(
  clubId: string,
  category: RecordCategory,
  limitCount?: number
): Promise<Array<{
  harvest: Harvest;
  value: number;
  unit: string;
  rank: number;
}>>
```

---

#### getHarvestStats

Calculates harvest statistics.

```typescript
async function getHarvestStats(
  clubId: string,
  season?: string
): Promise<{
  total: number;
  bySpecies: Record<string, number>;
  bySex: Record<string, number>;
  byWeapon: Record<string, number>;
  averageWeight: number;
  topHunters: Array<{ userId: string; count: number }>;
  byMonth: Record<string, number>;
}>
```

---

#### checkForNewRecord

Checks if a harvest sets a new club record.

```typescript
async function checkForNewRecord(
  clubId: string,
  harvest: Harvest
): Promise<{
  isRecord: boolean;
  categories: RecordCategory[];
}>
```

---

*Utilities documented from `src/utils/`*
