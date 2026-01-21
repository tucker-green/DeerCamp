# Custom Hooks Reference

DeerCamp uses custom React hooks for data fetching, state management, and Firebase interactions. All hooks follow a consistent pattern with real-time updates.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Club Management](#club-management)
- [Stand & Booking Hooks](#stand--booking-hooks)
- [Member Management](#member-management)
- [Property & Map Hooks](#property--map-hooks)
- [Utility Hooks](#utility-hooks)
- [Common Patterns](#common-patterns)

---

## Overview

### Common Return Pattern

All data-fetching hooks return a consistent structure:

```typescript
interface HookReturn<T> {
  data: T;              // The fetched data
  loading: boolean;     // True while fetching
  error: string | null; // Error message if failed
  // ... CRUD operations
}
```

### Real-time Updates

Hooks use Firestore's `onSnapshot` for real-time data synchronization. Changes made by any user are immediately reflected in all connected clients.

---

## Authentication

### useAuth

The primary authentication hook, provided by `AuthContext`.

```typescript
import { useAuth } from '../context/AuthContext';

const {
  user,              // Firebase User object | null
  profile,           // UserProfile | null
  loading,           // boolean
  memberships,       // ClubMembership[]
  activeClubId,      // string | null
  activeMembership,  // ClubMembership | null
  activeClub,        // Club | null
  switchClub,        // (clubId: string) => Promise<void>
  refreshMemberships // () => Promise<void>
} = useAuth();
```

**Usage:**
```typescript
function MyComponent() {
  const { user, activeClubId, activeMembership } = useAuth();
  
  if (!user) return <LoginPrompt />;
  if (!activeClubId) return <NoClubSelected />;
  
  const isManager = activeMembership?.role === 'manager' 
    || activeMembership?.role === 'owner';
  
  return <Dashboard isManager={isManager} />;
}
```

---

## Club Management

### useClubs

Fetch and manage clubs.

```typescript
import { useClubs, useMyClubs, usePublicClubs } from '../hooks/useClubs';

// All clubs (with filters)
const { clubs, loading, error, createClub, updateClub, searchPublicClubs } = useClubs({
  userId?: string,
  isPublic?: boolean,
  limit?: number
});

// Convenience hooks
const { clubs } = useMyClubs();           // User's clubs
const { clubs } = usePublicClubs(20);     // Public clubs
```

**Methods:**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createClub` | `clubData` | `Promise<{success, clubId?, error?}>` | Creates a new club |
| `updateClub` | `clubId, updates` | `Promise<{success, error?}>` | Updates club settings |
| `searchPublicClubs` | `searchTerm` | `Promise<{success, clubs, error?}>` | Search public clubs |

---

### useClubJoinRequests

Manage club join requests.

```typescript
import { 
  useClubJoinRequests, 
  usePendingJoinRequests, 
  useMyJoinRequests 
} from '../hooks/useClubJoinRequests';

const { 
  requests, loading, error,
  submitJoinRequest,
  approveJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
  deleteJoinRequest
} = useClubJoinRequests({ clubId?, userId?, status? });

// Convenience hooks
const { requests } = usePendingJoinRequests(clubId);
const { requests } = useMyJoinRequests();
```

---

## Stand & Booking Hooks

### useStands

Manage hunting stands.

```typescript
import { useStands } from '../hooks/useStands';

const { 
  stands,           // Stand[]
  loading, 
  error,
  createStand,      // Create new stand
  updateStand,      // Update stand details
  deleteStand       // Remove stand
} = useStands();
```

**Stand Interface:**
```typescript
interface Stand {
  id: string;
  clubId: string;
  name: string;
  type: 'ladder' | 'climber' | 'blind' | 'box';
  location: { lat: number; lng: number };
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
}
```

---

### useBookings

Comprehensive booking management.

```typescript
import { 
  useBookings, 
  useBookingsByDate, 
  useMyBookings, 
  useStandBookings 
} from '../hooks/useBookings';

const {
  bookings,
  loading,
  error,
  createBooking,
  updateBooking,
  cancelBooking,
  checkIn,
  checkOut,
  deleteBooking
} = useBookings({ standId?, userId?, date?, status? });

// Convenience hooks
const { bookings } = useBookingsByDate(new Date());
const { bookings, checkIn, checkOut, cancelBooking } = useMyBookings(userId);
const { bookings } = useStandBookings(standId);
```

**Create Booking:**
```typescript
const result = await createBooking({
  standId: 'stand-123',
  date: '2026-01-25',
  startTime: new Date('2026-01-25T06:00:00'),
  endTime: new Date('2026-01-25T11:00:00'),
  huntType: 'morning',
  notes: 'Bow hunting'
});

if (result.success) {
  console.log('Booking ID:', result.bookingId);
} else {
  console.error('Error:', result.error);
}
```

---

## Member Management

### useMembers

Manage club members with full CRUD operations.

```typescript
import { 
  useMembers, 
  useAllMembers,
  useClubOwners,
  useClubManagers,
  useActiveMembers,
  useUnpaidMembers
} from '../hooks/useMembers';

const {
  members,          // MemberWithClubData[]
  loading,
  error,
  updateMemberRole,
  updateMemberStatus,
  updateMemberTier,
  updateDuesStatus,
  updateMemberProfile,
  deleteMember
} = useMembers({ clubId?, role?, status?, duesStatus? });

// Convenience hooks
const { members } = useAllMembers(clubId);
const { members } = useClubManagers(clubId);
const { members } = useUnpaidMembers(clubId);
```

**Update Member Role:**
```typescript
// Promote to manager
await updateMemberRole(userId, 'manager');

// Update dues status
await updateDuesStatus(userId, {
  duesStatus: 'paid',
  duesPaidUntil: '2027-01-01',
  duesAmount: 500
});
```

---

### useInvites

Manage member invitations.

```typescript
import { 
  useInvites, 
  usePendingInvites,
  getInviteByCode 
} from '../hooks/useInvites';

const {
  invites,
  loading,
  error,
  createInvite,
  cancelInvite,
  resendInvite,
  acceptInvite,
  deleteInvite
} = useInvites({ clubId?, status? });

// Get invite by code (for accepting)
const invite = await getInviteByCode('ABC12345');
```

**Create Invite:**
```typescript
const result = await createInvite({
  email: 'newmember@email.com',
  role: 'member',
  membershipTier: 'full',
  message: 'Welcome to the club!'
});

console.log('Invite code:', result.inviteCode);
// Share the link: /join?code=ABC12345
```

---

## Property & Map Hooks

### usePropertyBoundaries

Manage property boundary polygons.

```typescript
import { usePropertyBoundaries } from '../hooks/usePropertyBoundaries';

const {
  boundaries,       // PropertyBoundary[]
  loading,
  error,
  createBoundary,
  updateBoundary,
  deleteBoundary
} = usePropertyBoundaries(clubId?);
```

**Create Boundary:**
```typescript
await createBoundary({
  name: 'North Property',
  coordinates: [[lng1, lat1], [lng2, lat2], ...],
  boundaryType: 'owned',
  ownerName: 'John Smith',
  color: '#00ff00',
  notes: 'Main hunting area'
});
```

---

### useFoodPlots

Manage food plot polygons.

```typescript
import { useFoodPlots } from '../hooks/useFoodPlots';

const {
  foodPlots,
  loading,
  error,
  createFoodPlot,
  updateFoodPlot,
  deleteFoodPlot
} = useFoodPlots(clubId?);
```

---

### useAccessRoutes

Manage access routes (roads, trails, paths).

```typescript
import { useAccessRoutes } from '../hooks/useAccessRoutes';

const {
  routes,
  loading,
  error,
  createRoute,
  updateRoute,
  deleteRoute
} = useAccessRoutes(clubId?);
```

---

### useTerrainFeatures

Manage terrain feature markers.

```typescript
import { useTerrainFeatures } from '../hooks/useTerrainFeatures';

const {
  features,
  loading,
  error,
  createFeature,
  updateFeature,
  deleteFeature
} = useTerrainFeatures(clubId?);
```

---

### useTrailCameras

Manage trail camera locations.

```typescript
import { useTrailCameras } from '../hooks/useTrailCameras';

const {
  cameras,
  loading,
  error,
  createCamera,
  updateCamera,
  deleteCamera
} = useTrailCameras(clubId?);
```

---

### useParcelBoundaries

Fetch and display public parcel data (demo or external API).

```typescript
import { useParcelBoundaries } from '../hooks/useParcelBoundaries';

const {
  parcels,
  loading,
  error,
  isDemo,
  showParcels,
  setShowParcels,
  fetchParcelsForBounds,
  clearCache
} = useParcelBoundaries(clubId?, {
  enableDemo: true,
  demoCount: 25,
  cacheToFirestore: false
});

// Fetch parcels for map bounds
await fetchParcelsForBounds(
  { west: -90.5, south: 35.0, east: -90.0, north: 35.5 },
  [-90.25, 35.25]  // center point
);
```

---

## Utility Hooks

### useMapbox

Initialize and manage Mapbox map instance.

```typescript
import { useMapbox } from '../hooks/useMapbox';

const containerRef = useRef<HTMLDivElement>(null);

const {
  map,              // mapboxgl.Map | null
  isLoaded,         // boolean
  error             // string | null
} = useMapbox(containerRef, {
  center: [-90.0, 35.0],
  zoom: 15,
  style: 'mapbox://styles/mapbox/satellite-streets-v12'
});

// Use map when loaded
useEffect(() => {
  if (map && isLoaded) {
    map.addSource('stands', { ... });
  }
}, [map, isLoaded]);
```

---

### useWeather

Fetch weather data for a location.

```typescript
import { useWeather } from '../hooks/useWeather';

const {
  weather,          // WeatherData | null
  loading,
  error
} = useWeather(lat, lng);

// WeatherData structure
interface WeatherData {
  temp: number;               // Fahrenheit
  condition: string;          // "Clear sky", "Rain", etc.
  precipitationChance: number; // 0-100
  windSpeed: number;          // mph
  windDirection: string;      // N, NE, E, etc.
  isDay: boolean;
}
```

**Usage in Dashboard:**
```typescript
function WeatherWidget() {
  const { activeClub } = useAuth();
  const { weather, loading } = useWeather(
    activeClub?.location?.coordinates?.lat,
    activeClub?.location?.coordinates?.lng
  );
  
  if (loading) return <Spinner />;
  if (!weather) return <NoWeather />;
  
  return (
    <div>
      <span>{weather.temp}°F</span>
      <span>{weather.condition}</span>
      <span>Wind: {weather.windSpeed} mph {weather.windDirection}</span>
    </div>
  );
}
```

---

## Common Patterns

### Loading States

```typescript
function StandsList() {
  const { stands, loading, error } = useStands();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (stands.length === 0) {
    return <EmptyState message="No stands yet" />;
  }
  
  return (
    <ul>
      {stands.map(stand => (
        <StandCard key={stand.id} stand={stand} />
      ))}
    </ul>
  );
}
```

### Optimistic Updates

```typescript
async function handleDelete(standId: string) {
  // Show loading state
  setDeleting(standId);
  
  const result = await deleteStand(standId);
  
  if (!result.success) {
    // Show error toast
    toast.error(result.error);
  }
  // Success case: UI updates automatically via onSnapshot
  
  setDeleting(null);
}
```

### Conditional Data Fetching

```typescript
function ClubDashboard() {
  const { activeClubId } = useAuth();
  
  // Hooks only fetch when clubId is available
  const { stands } = useStands();  // Uses activeClubId internally
  const { members } = useAllMembers(activeClubId);
  const { bookings } = useBookingsByDate(new Date());
  
  // All hooks handle null clubId gracefully
  // and return empty arrays
}
```

### Cleanup on Unmount

All hooks automatically clean up their Firestore listeners when the component unmounts or when dependencies change:

```typescript
useEffect(() => {
  // ... setup listener
  
  return () => {
    // Unsubscribe automatically called
    unsubscribe();
  };
}, [clubId]);
```

---

## Error Handling

All CRUD operations return a consistent result object:

```typescript
interface OperationResult {
  success: boolean;
  error?: string;
  // Additional fields like id, data, etc.
}

// Usage
const result = await createStand(standData);

if (result.success) {
  toast.success('Stand created!');
  navigate(`/stands/${result.id}`);
} else {
  toast.error(result.error || 'Failed to create stand');
}
```

---

*Hooks documented from `src/hooks/`*
