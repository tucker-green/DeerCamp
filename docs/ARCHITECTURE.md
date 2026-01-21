# System Architecture

## Overview

DeerCamp follows a modern serverless architecture using Firebase services for the backend and React for the frontend. This document details the technical architecture, data flow, and design decisions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Application                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │   │
│  │  │  Pages  │ │Components│ │  Hooks  │ │ Context/State  │ │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └───────┬─────────┘ │   │
│  │       │           │           │              │            │   │
│  │       └───────────┴───────────┴──────────────┘            │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Firebase Layer                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │    Auth      │ │  Firestore   │ │   Storage    │             │
│  │              │ │              │ │              │             │
│  │ • Email/Pass │ │ • Real-time  │ │ • Photos     │             │
│  │ • Google     │ │ • Queries    │ │ • Media      │             │
│  │ • JWT Claims │ │ • Security   │ │ • Avatars    │             │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                   Cloud Functions                          │  │
│  │  • onMembershipCreated    • syncUserClubClaims            │  │
│  │  • onMembershipUpdated    • syncAllUserClubClaims         │  │
│  │  • onMembershipDeleted    • healthCheck                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                              │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │   Mapbox     │ │  Open-Meteo  │                              │
│  │              │ │              │                              │
│  │ • Maps SDK   │ │ • Weather    │                              │
│  │ • Geocoding  │ │ • Forecast   │                              │
│  │ • Satellite  │ │              │                              │
│  └──────────────┘ └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### React Application Structure

```
src/
├── main.tsx                 # Application entry point
├── App.tsx                  # Root component with routing
├── context/
│   └── AuthContext.tsx      # Authentication and club state
├── components/
│   ├── [UI Components]      # Reusable UI components
│   └── map/                 # Map-specific components
├── pages/
│   └── [Page Components]    # Route-level components
├── hooks/
│   └── [Custom Hooks]       # Data fetching and state
├── utils/
│   └── [Utilities]          # Helper functions
├── types/
│   └── index.ts             # TypeScript definitions
└── firebase/
    ├── config.ts            # Firebase initialization
    └── claimsFunctions.ts   # Claims API wrappers
```

### State Management

```
┌────────────────────────────────────────────────────────────┐
│                     AuthContext                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • user: Firebase User object                         │   │
│  │ • profile: UserProfile from Firestore                │   │
│  │ • memberships: ClubMembership[] for all clubs        │   │
│  │ • activeClubId: Currently selected club              │   │
│  │ • activeMembership: Current club membership          │   │
│  │ • activeClub: Current club details                   │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────────┐
│                    Custom Hooks                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ useStands    │ │ useBookings  │ │ useMembers   │        │
│  │              │ │              │ │              │        │
│  │ Real-time    │ │ Real-time    │ │ Real-time    │        │
│  │ Firestore    │ │ Firestore    │ │ Firestore    │        │
│  │ subscription │ │ subscription │ │ subscription │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
1. User enters credentials
   │
   ▼
2. Firebase Auth validates
   │
   ├─► Success: Get/Create UserProfile
   │   │
   │   ▼
   │   Load ClubMemberships
   │   │
   │   ▼
   │   Set activeClubId (from preference or first membership)
   │   │
   │   ▼
   │   Load activeClub details
   │
   └─► Failure: Show error message
```

### Real-time Data Flow

```
Component Mount
    │
    ▼
useHook(clubId)
    │
    ▼
onSnapshot Query ──────────────┐
    │                          │
    ▼                          │
Initial Data Load              │
    │                          │
    ▼                          │
Render Component               │
    │                          │
    ▼                          │
[Firestore Update] ◄───────────┘
    │
    ▼
Snapshot Callback
    │
    ▼
Update State
    │
    ▼
Re-render Component
```

### Booking Creation Flow

```
User Selects Stand + Date + Time
    │
    ▼
Frontend Validation
├── validateBookingTime()
├── validateBookingRules()
└── checkBookingConflict()
    │
    ▼
createBooking() API Call
    │
    ▼
Firestore Security Rules
├── Verify authentication
├── Verify club membership
└── Verify data integrity
    │
    ▼
Document Created
    │
    ▼
onSnapshot Triggers
    │
    ▼
UI Updates Automatically
```

## Database Architecture

### Collection Structure

```
Firestore Database
│
├── users/                    # User profiles
│   └── {userId}
│       ├── uid
│       ├── email
│       ├── displayName
│       ├── clubIds[]
│       ├── activeClubId
│       └── ...profile fields
│
├── clubs/                    # Club documents
│   └── {clubId}
│       ├── name
│       ├── description
│       ├── ownerId
│       ├── location
│       ├── isPublic
│       └── ...settings
│
├── clubMemberships/          # Junction table
│   └── {membershipId}
│       ├── userId
│       ├── clubId
│       ├── role
│       ├── membershipStatus
│       ├── approvalStatus
│       └── ...membership data
│
├── stands/                   # Hunting stands
│   └── {standId}
│       ├── clubId (indexed)
│       ├── name
│       ├── type
│       ├── location
│       └── status
│
├── bookings/                 # Stand reservations
│   └── {bookingId}
│       ├── clubId (indexed)
│       ├── standId (indexed)
│       ├── userId (indexed)
│       ├── startTime
│       ├── endTime
│       └── status
│
├── harvests/                 # Harvest records
│   └── {harvestId}
│       ├── clubId (indexed)
│       ├── userId (indexed)
│       ├── species
│       ├── date
│       └── ...measurements
│
├── posts/                    # Activity feed
│   └── {postId}
│       ├── clubId (indexed)
│       ├── authorId
│       ├── type
│       └── content
│
├── comments/                 # Post comments
│   └── {commentId}
│       ├── postId (indexed)
│       ├── clubId
│       └── content
│
├── propertyBoundaries/       # Property polygons
│   └── {boundaryId}
│       ├── clubId (indexed)
│       ├── coordinates[]
│       └── acres
│
├── foodPlots/                # Food plot polygons
│   └── {plotId}
│       ├── clubId (indexed)
│       ├── coordinates[]
│       └── plantedWith
│
├── accessRoutes/             # Route lines
│   └── {routeId}
│       ├── clubId (indexed)
│       ├── coordinates[]
│       └── type
│
├── terrainFeatures/          # Point features
│   └── {featureId}
│       ├── clubId (indexed)
│       ├── location
│       └── type
│
├── trailCameras/             # Camera locations
│   └── {cameraId}
│       ├── clubId (indexed)
│       └── location
│
├── invites/                  # Member invitations
│   └── {inviteId}
│       ├── clubId (indexed)
│       ├── inviteCode
│       └── status
│
├── clubJoinRequests/         # Join requests
│   └── {requestId}
│       ├── clubId (indexed)
│       ├── userId
│       └── status
│
└── reports/                  # Content reports
    └── {reportId}
        ├── clubId
        └── status
```

### Index Strategy

```
Primary Indexes (Automatic):
• Document ID for all collections

Composite Indexes (firestore.indexes.json):
• bookings: clubId + startTime
• bookings: standId + startTime
• bookings: userId + startTime
• harvests: userId + date
• invites: clubId + status + createdAt
• comments: postId + clubId + createdAt
```

## Security Architecture

### Authentication Layer

```
Firebase Auth
    │
    ├── Email/Password Provider
    │   └── Validated credentials
    │
    ├── Google OAuth Provider
    │   └── Social sign-in
    │
    └── Custom Claims
        └── clubIds[] array
            (Synced by Cloud Functions)
```

### Authorization Matrix

| Resource | Owner | Manager | Member | Guest |
|----------|-------|---------|--------|-------|
| View stands | ✓ | ✓ | ✓ | ✗ |
| Book stands | ✓ | ✓ | ✓ | ✗ |
| Manage stands | ✓ | ✓ | ✗ | ✗ |
| View members | ✓ | ✓ | ✓ | ✗ |
| Manage members | ✓ | ✓ | ✗ | ✗ |
| Club settings | ✓ | ✗ | ✗ | ✗ |
| Property drawing | ✓ | ✓ | ✗ | ✗ |
| Delete club | ✓ | ✗ | ✗ | ✗ |

### Security Rule Pattern

```javascript
// Standard club member check
function isMember(clubId) {
  return isAuthenticated() &&
    exists(/databases/$(database)/documents/clubMemberships/$(
      request.auth.uid + '_' + clubId
    )) &&
    get(/databases/$(database)/documents/clubMemberships/$(
      request.auth.uid + '_' + clubId
    )).data.membershipStatus == 'active' &&
    get(/databases/$(database)/documents/clubMemberships/$(
      request.auth.uid + '_' + clubId
    )).data.approvalStatus == 'approved';
}
```

## Cloud Functions Architecture

### Claims Synchronization

```
┌──────────────────┐
│  Membership      │
│  Document        │
│  Change          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Firestore       │
│  Trigger         │
│  Functions       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Query Active    │
│  Memberships     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Update Custom   │
│  Claims          │
│  (clubIds[])     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  User Token      │
│  Contains        │
│  Club Access     │
└──────────────────┘
```

## External Service Integration

### Mapbox Integration

```
┌─────────────────────────────────────────────────────────┐
│                    MapContainer                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                   Mapbox GL JS                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │ │
│  │  │ Satellite│ │ Custom   │ │ Drawing  │           │ │
│  │  │ Tiles    │ │ Markers  │ │ Tools    │           │ │
│  │  └──────────┘ └──────────┘ └──────────┘           │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌───────────────────────┴───────────────────────────┐  │
│  │              GeoJSON Layers                        │  │
│  │  • Property Boundaries    • Access Routes          │  │
│  │  • Food Plots             • Terrain Features       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Weather Integration

```
useWeather(lat, lng)
    │
    ▼
Open-Meteo API Request
https://api.open-meteo.com/v1/forecast
    │
    ▼
Parse Response
├── Temperature (°F conversion)
├── Condition (WMO code mapping)
├── Wind speed/direction
├── Precipitation chance
└── Day/night indicator
    │
    ▼
Return WeatherData object
    │
    ▼
30-minute auto-refresh
```

## Performance Considerations

### Caching Strategy

```
PWA Service Worker (vite-plugin-pwa)
│
├── Static Assets: CacheFirst
│   └── JS, CSS, HTML, Images
│
├── Mapbox Tiles: CacheFirst (30 days, 50 entries)
│   └── Reduce tile requests
│
├── Firebase Storage: CacheFirst (7 days, 100 entries)
│   └── User photos and avatars
│
└── Firestore: NetworkFirst (5 min, 10s timeout)
    └── Fallback for offline access
```

### Bundle Optimization

```
Current Bundle: ~2.7 MB (775 KB gzipped)

Optimization Opportunities:
├── Route-based code splitting
├── Lazy load Mapbox (heavy)
├── Firebase tree shaking
└── Image optimization
```

## Error Handling

### Error Boundary Structure

```
<ErrorBoundary>           ← Catches rendering errors
  <AuthProvider>          ← Handles auth errors
    <BrowserRouter>
      <App />             ← Route-level error handling
    </BrowserRouter>
  </AuthProvider>
</ErrorBoundary>
```

### Hook Error Pattern

```typescript
const useHook = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  try {
    // Operations
  } catch (err) {
    setError(err.message);
    console.error('Hook error:', err);
  }
  
  return { data, loading, error };
};
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Firebase Hosting                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    CDN Edge                       │  │
│  │           (Global Distribution)                   │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│  ┌──────────────────────┴───────────────────────────┐  │
│  │                  dist/ folder                     │  │
│  │  ├── index.html (SPA entry)                      │  │
│  │  ├── assets/     (hashed JS/CSS)                 │  │
│  │  └── icons/      (PWA icons)                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Rewrite Rules: /* → /index.html                       │
│  Cache Headers: 1 year for assets, no-cache for HTML   │
└────────────────────────────────────────────────────────┘
```

---

*Architecture documented for DeerCamp v0.0.0*
