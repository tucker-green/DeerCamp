# React Components Reference

This document provides comprehensive documentation for all React components in DeerCamp.

## Table of Contents

- [Overview](#overview)
- [Layout Components](#layout-components)
- [UI Components](#ui-components)
- [Form Components](#form-components)
- [Modal Components](#modal-components)
- [Map Components](#map-components)
- [Feed Components](#feed-components)
- [Member Components](#member-components)

---

## Overview

### Component Organization

```
src/components/
├── map/                    # Map-related components
│   ├── AccessRouteDrawer.tsx
│   ├── FoodPlotDrawer.tsx
│   ├── LayerControls.tsx
│   ├── MapContainer.tsx
│   ├── MapSearch.tsx
│   ├── MeasureTool.tsx
│   ├── PropertyBoundaryDrawer.tsx
│   ├── StandFilter.tsx
│   └── StandPopup.tsx
├── AddStandModal.tsx
├── BottomTabBar.tsx
├── ClubSettings.tsx
├── ClubSwitcher.tsx
├── CommentSection.tsx
├── CreatePostModal.tsx
├── DatePicker.tsx
├── ErrorBoundary.tsx
├── Footer.tsx
├── MemberBadges.tsx
├── MemberCard.tsx
├── Navbar.tsx
├── NoClubSelected.tsx
├── PostCard.tsx
├── ReportModal.tsx
└── WhosHuntingDashboard.tsx
```

### Common Patterns

All components follow these conventions:
- TypeScript with explicit prop interfaces
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Functional components with hooks

---

## Layout Components

### Navbar

Top navigation bar with club switching and user menu.

**Location:** `src/components/Navbar.tsx`

**Props:** None (uses context)

**Features:**
- Logo and branding
- Navigation links (Dashboard, Feed, Bookings, Club, Harvests)
- Club switcher dropdown
- Admin link (super admins only)
- Logout functionality
- Animated with Framer Motion

**Usage:**
```tsx
// Used in App.tsx layout
<Navbar />
```

---

### BottomTabBar

Mobile bottom navigation for touch-friendly access.

**Location:** `src/components/BottomTabBar.tsx`

**Props:** None (uses context and router)

**Features:**
- Fixed bottom position on mobile
- Icon-based navigation
- Active state highlighting
- Admin tab for super admins
- Profile tab for regular users

**Tabs:**
| Icon | Label | Route |
|------|-------|-------|
| Home | Home | `/dashboard` |
| Utensils | Feed | `/feed` |
| Calendar | Book | `/bookings` |
| Map | Map | `/club` |
| Shield | Admin | `/admin` (super admin) |
| User | Profile | `/profile` |

---

### Footer

Site footer with links and branding.

**Location:** `src/components/Footer.tsx`

**Props:** None

**Features:**
- Hidden on mobile (`hidden sm:block`)
- Three column layout
- Navigation links
- Legal links (Privacy, Terms, Cookies)
- Copyright notice
- Animated entrance

---

### ErrorBoundary

React error boundary for graceful error handling.

**Location:** `src/components/ErrorBoundary.tsx`

**Props:**
```typescript
interface Props {
  children: React.ReactNode;
}
```

**Features:**
- Catches JavaScript errors in child tree
- Displays fallback UI with error message
- "Try Again" and "Go Home" buttons
- Logs errors to console

**Usage:**
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### NoClubSelected

Empty state shown when no club is active.

**Location:** `src/components/NoClubSelected.tsx`

**Props:**
```typescript
interface Props {
  title?: string;
  message?: string;
  showActions?: boolean;  // Default: true
}
```

**Features:**
- Centered message with icon
- "Create Club" and "Discover Clubs" buttons
- Animated entrance
- Customizable messaging

---

## UI Components

### ClubSwitcher

Dropdown for switching between clubs.

**Location:** `src/components/ClubSwitcher.tsx`

**Props:** None (uses context)

**Features:**
- Shows current club name
- Lists all user's clubs
- Quick create/discover club actions
- Click-outside to close
- Animated dropdown

**Usage:**
```tsx
// Used in Navbar
<ClubSwitcher />
```

---

### DatePicker

Custom date picker with calendar view.

**Location:** `src/components/DatePicker.tsx`

**Props:**
```typescript
interface Props {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  label?: string;
  required?: boolean;
}
```

**Features:**
- Calendar grid view
- Month navigation
- Disabled dates (past/min date)
- Click-outside to close
- Timezone-safe date handling
- Animated dropdown

---

### MemberBadges

Collection of badge components for member attributes.

**Location:** `src/components/MemberBadges.tsx`

**Exported Components:**

#### RoleBadge
```typescript
interface Props {
  role: UserRole;
  size?: 'sm' | 'md';
}
```
Shows owner (gold), manager (blue), or member (gray) badge.

#### MembershipTierBadge
```typescript
interface Props {
  tier: MembershipTier;
  size?: 'sm' | 'md';
}
```
Shows full, family, youth, or guest tier.

#### DuesStatusBadge
```typescript
interface Props {
  status: DuesStatus;
  size?: 'sm' | 'md';
}
```
Shows paid (green), unpaid (yellow), overdue (red), or exempt.

#### MemberStatusBadge
```typescript
interface Props {
  status: MemberStatus;
  size?: 'sm' | 'md';
}
```
Shows active, inactive, or suspended status.

---

## Form Components

### ClubSettings

Form for editing club settings (owners only).

**Location:** `src/components/ClubSettings.tsx`

**Props:**
```typescript
interface Props {
  club: Club;
}
```

**Features:**
- Club name and description
- Location (city, state)
- Visibility settings (public/private)
- Approval requirements
- Max members limit
- Club rules text area
- Save with loading state
- Success/error feedback

---

### AddStandModal

Modal for creating new hunting stands.

**Location:** `src/components/AddStandModal.tsx`

**Props:**
```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
}
```

**Fields:**
- Stand name (required)
- Stand type (ladder, climber, blind, box)
- Description (optional)

**Note:** Creates stand with default coordinates (0, 0). Map placement disabled.

---

### CreatePostModal

Modal for creating feed posts.

**Location:** `src/components/CreatePostModal.tsx`

**Props:**
```typescript
interface Props {
  onClose: () => void;
  onPostCreated?: () => void;
}
```

**Features:**
- Post type selection (text, announcement)
- Content text area
- Image/video upload (10MB images, 50MB videos)
- Upload progress indicator
- Pin post option (managers+)
- File preview before upload

---

## Modal Components

### ReportModal

Modal for reporting inappropriate content.

**Location:** `src/components/ReportModal.tsx`

**Props:**
```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment';
  targetId: string;
  targetUserId: string;
  targetUserName?: string;
  clubId: string;
}
```

**Features:**
- Reason selection (spam, harassment, inappropriate, other)
- Additional details text area
- Submit creates report document
- Success confirmation with auto-close

---

## Map Components

### MapContainer

Main map component managing all layers and features.

**Location:** `src/components/map/MapContainer.tsx`

**Props:**
```typescript
interface Props {
  center?: [number, number];
  zoom?: number;
  clubId?: string;
  onMapReady?: (map: mapboxgl.Map) => void;
  onStandClick?: (stand: Stand) => void;
  layerVisibility?: LayerVisibility;
  isDrawingBoundary?: boolean;
  isDrawingFoodPlot?: boolean;
  isDrawingRoute?: boolean;
  onDrawingComplete?: (feature: any, type: string) => void;
  onDrawingCancel?: () => void;
  showDistanceRings?: boolean;
  selectedStandId?: string;
  hiddenOwners?: Set<string>;
}
```

**Managed Layers:**
- Stand markers with custom styling
- Property boundaries (fill + outline)
- Food plots (green fill)
- Access routes (color by type)
- Terrain features (point markers)
- Trail cameras (camera icons)
- Distance rings (200/300/400 yards)

**Child Components:**
- PropertyBoundaryDrawer
- FoodPlotDrawer
- AccessRouteDrawer
- MeasureTool

---

### MapSearch

Search input for locations and coordinates.

**Location:** `src/components/map/MapSearch.tsx`

**Props:**
```typescript
interface Props {
  onLocationSelect: (lng: number, lat: number) => void;
  className?: string;
}
```

**Features:**
- Address search via Mapbox Geocoding API
- Direct coordinate input (e.g., "35.5, -90.0")
- Autocomplete suggestions
- Keyboard navigation
- Loading state

---

### PropertyBoundaryDrawer

Draw tool for property boundaries.

**Location:** `src/components/map/PropertyBoundaryDrawer.tsx`

**Props:**
```typescript
interface Props {
  map: mapboxgl.Map;
  clubId: string;
  isDrawing: boolean;
  onDrawingComplete: () => void;
  onCancel: () => void;
}
```

**Form Fields:**
- Boundary name
- Boundary type (owned, leased, neighboring, hunting-area)
- Owner name
- Color picker
- Notes

**Features:**
- Polygon drawing with Mapbox Draw
- Auto-calculates acres
- Save form after drawing

---

### FoodPlotDrawer

Draw tool for food plots.

**Location:** `src/components/map/FoodPlotDrawer.tsx`

**Similar to PropertyBoundaryDrawer with:**
- Plot name
- Planted with (crop type)
- Plant date
- Notes
- Auto-calculates acres

---

### AccessRouteDrawer

Draw tool for access routes.

**Location:** `src/components/map/AccessRouteDrawer.tsx`

**Form Fields:**
- Route name
- Route type (road, atv-trail, walking-path, quiet-approach)
- Difficulty (easy, moderate, difficult)
- Seasonal checkbox
- Seasonal notes
- Notes

**Features:**
- Line drawing with Mapbox Draw
- Auto-calculates length (yards/miles)

---

### MeasureTool

Distance measurement tool.

**Location:** `src/components/map/MeasureTool.tsx`

**Props:**
```typescript
interface Props {
  map: mapboxgl.Map;
  isActive: boolean;
  onClose: () => void;
}
```

**Features:**
- Two-click measurement
- Draws line between points
- Displays distance (yards or miles)
- Clear and close actions

---

### LayerControls

Panel for toggling map layer visibility.

**Location:** `src/components/map/LayerControls.tsx`

**Props:**
```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
  visibility: LayerVisibility;
  onVisibilityChange: (visibility: LayerVisibility) => void;
  boundaries?: PropertyBoundary[];
  hiddenOwners?: Set<string>;
  onToggleOwner?: (owner: string) => void;
}
```

**Toggles:**
- Stands
- Property Boundaries
- Food Plots
- Access Routes
- Terrain Features
- Trail Cameras
- Distance Rings
- Public Parcels

---

### StandFilter

Filter panel for stands.

**Location:** `src/components/map/StandFilter.tsx`

**Props:**
```typescript
interface Props {
  onFilterChange: (filters: StandFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}
```

**Filters:**
- Type: ladder, climber, blind, box
- Status: available, reserved, occupied, maintenance

---

### StandPopup

Popup displaying stand details.

**Location:** `src/components/map/StandPopup.tsx`

**Props:**
```typescript
interface Props {
  stand: Stand;
  onBook?: () => void;
  onClose?: () => void;
  onShowRange?: () => void;
  showingRange?: boolean;
}
```

**Displays:**
- Stand name and type
- Status badge
- Description
- Book button
- Show/hide range ring toggle

---

## Feed Components

### PostCard

Displays a post in the activity feed.

**Location:** `src/components/PostCard.tsx`

**Props:**
```typescript
interface Props {
  post: Post;
  isPinned?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Features:**
- Author avatar and name
- Post content
- Media gallery (images/videos)
- Reaction buttons
- Comment toggle
- Report action
- Pin/unpin (managers+)
- Edit/delete (own posts or managers)

---

### CommentSection

Comments section for posts.

**Location:** `src/components/CommentSection.tsx`

**Props:**
```typescript
interface Props {
  postId: string;
  clubId: string;
}
```

**Features:**
- Real-time comment list
- Comment input form
- Delete own comments
- Report comments
- Updates post comment count

---

## Member Components

### MemberCard

Card displaying member information.

**Location:** `src/components/MemberCard.tsx`

**Props:**
```typescript
interface Props {
  member: MemberWithClubData;
  onView?: () => void;
  onEdit?: () => void;
  onPromote?: () => void;
  onDemote?: () => void;
  onSuspend?: () => void;
  canEdit?: boolean;
  canPromote?: boolean;
  canSuspend?: boolean;
}
```

**Displays:**
- Avatar and name
- Role badge
- Membership tier
- Dues status
- Member status
- Action menu (if permissions allow)

---

### WhosHuntingDashboard

Dashboard showing currently active hunters.

**Location:** `src/components/WhosHuntingDashboard.tsx`

**Props:** None (uses hooks)

**Features:**
- Lists checked-in hunters
- Shows stand name and check-in time
- Calculates hunt duration
- Overdue alerts (> 8 hours)
- Updates every minute

---

## Styling Guidelines

### Color Scheme
- Primary: `#16a34a` (green-600)
- Background: `#0a0f0a` (dark)
- Glass panels: `rgba(255, 255, 255, 0.05)`

### Common Classes
```css
.glass-panel       /* Glassmorphism card */
.btn-primary       /* Green primary button */
.btn-secondary     /* Outline button */
.gradient-text     /* Green gradient text */
```

### Animation Patterns
```tsx
// Entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

---

*Components documented from `src/components/`*
