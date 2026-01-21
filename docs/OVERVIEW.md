# DeerCamp Project Overview

## Introduction

DeerCamp is a comprehensive hunting club management platform designed to modernize how hunting clubs operate while preserving the traditions and camaraderie that make the hunting community special.

## Mission

To provide hunting clubs with modern digital tools for managing stands, bookings, members, harvests, and property - all while connecting hunters and supporting conservation efforts.

## Core Features

### 1. Stand Reservation System
A complete booking system for hunting stands with:
- **Calendar Views**: Daily, weekly, and monthly availability displays
- **Conflict Detection**: Prevents double-bookings automatically
- **Booking Rules Engine**: Configurable advance notice, maximum days, blackout dates
- **Check-in/Check-out**: Track active hunters in real-time
- **"Who's Hunting" Dashboard**: Safety feature showing all active hunters

### 2. Member Management
Full-featured membership administration:
- **Member Directory**: Searchable member list with filters
- **Role-Based Permissions**: Owner, Manager, and Member roles
- **Membership Tiers**: Full, Family, Youth, and Guest classifications
- **Invite System**: Unique invite codes with expiration
- **Dues Tracking**: Payment status monitoring with reminders
- **Safety Profiles**: Emergency contacts and hunter safety certifications

### 3. Multi-Club Support
Users can participate in multiple clubs:
- **Club Creation**: Create and manage multiple clubs
- **Club Switching**: Seamlessly switch between active clubs
- **Data Isolation**: Each club's data is completely separate
- **Club Discovery**: Find and request to join public clubs

### 4. Interactive Property Maps
Powerful mapping capabilities using Mapbox:
- **Satellite Imagery**: High-resolution aerial views
- **Stand Markers**: Custom markers showing availability and type
- **Property Boundaries**: Draw and manage property lines
- **Food Plots**: Track planted areas with crop types
- **Access Routes**: Color-coded roads, ATV trails, and walking paths
- **Terrain Features**: Mark water sources, bedding areas, etc.
- **Trail Cameras**: Track camera locations and status
- **Distance Rings**: 200/300/400 yard range visualization
- **Drawing Tools**: Create boundaries, plots, and routes on the map

### 5. Harvest Logging & Trophy Book
Comprehensive harvest tracking:
- **Extended Data Capture**: 80+ fields for detailed records
- **Multi-Photo Support**: Upload multiple photos per harvest
- **Species-Specific Fields**: Custom measurements for deer, turkey, and hogs
- **Trophy Records**: Automatic record tracking (biggest buck, heaviest deer, etc.)
- **Club Leaderboards**: Top hunters by season
- **Hunt Stories**: Narrative descriptions with conditions

### 6. Activity Feed
Social features for club engagement:
- **Post Creation**: Text posts, announcements, and events
- **Harvest Auto-Posts**: Automatic posts when harvests are logged
- **Comments & Reactions**: Engage with club content
- **Pinned Posts**: Important announcements stay visible
- **Real-Time Updates**: Live feed refreshes

### 7. Club Dashboard
At-a-glance club statistics:
- **Harvest Count**: Season totals by species
- **Booking Activity**: Upcoming and recent reservations
- **Member Stats**: Active member count and status
- **Weather Integration**: Current conditions and forecast
- **Quick Actions**: One-click access to common tasks

## User Roles

### Owner
- Full control over club settings
- Can promote/demote all members
- Manages property and boundaries
- Cannot be removed except by super admin

### Manager
- Can manage members and bookings
- Draws property features on map
- Creates announcements
- Cannot modify owners or other managers

### Member
- Books stands and logs harvests
- Creates posts and comments
- Views club map and property
- Limited to self-service actions

## Technical Architecture

### Frontend
- **React 19.2**: Latest React with concurrent features
- **TypeScript 5.9**: Full type safety
- **Vite 7.2**: Fast development and optimized builds
- **Tailwind CSS 3.4**: Utility-first styling
- **Framer Motion**: Smooth animations

### Backend
- **Firebase Authentication**: Email/password and Google OAuth
- **Cloud Firestore**: Real-time NoSQL database
- **Firebase Storage**: Photo and media uploads
- **Cloud Functions**: Server-side logic for claims sync

### Maps
- **Mapbox GL JS**: Professional mapping library
- **Satellite Imagery**: High-resolution aerial photography
- **Custom Styling**: Dark theme map markers and popups

### PWA Support
- **Service Worker**: Offline capability (planned)
- **App Manifest**: Install to home screen
- **Push Notifications**: Booking reminders (planned)

## Security Model

### Authentication
- Firebase Authentication with multiple providers
- JWT tokens with custom claims for club membership
- Session persistence across browser sessions

### Authorization
- Role-based access control (RBAC)
- Club-scoped permissions
- Custom claims for storage access

### Data Protection
- Firestore security rules enforce access
- Storage rules verify club membership
- All data queries are server-validated

## Mobile Experience

### Responsive Design
- Mobile-first CSS approach
- Touch-friendly interactions (44px minimum targets)
- Swipe navigation where appropriate

### PWA Features
- Installable on iOS and Android
- App-like experience
- Optimized for slow connections

## Integration Points

### Weather
- Open-Meteo API for forecasts
- Current conditions display
- Hunting-relevant data (wind, precipitation)

### Geocoding
- Mapbox Geocoding API
- Address search on maps
- Coordinate input support

## Deployment

### Hosting
- Firebase Hosting with global CDN
- Automatic SSL certificates
- Custom domain support

### CI/CD
- Manual deployment via Firebase CLI
- Build optimization with Vite
- Rule deployment commands

## Future Roadmap

### Short-term
- Email notifications for bookings
- Online payment processing
- Mobile app (React Native)

### Medium-term
- AI trail camera analysis
- Harvest prediction engine
- Enhanced social features

### Long-term
- Marketplace for gear exchange
- Conservation project tracking
- Educational content library

## Getting Help

- Review the [Quick Start Guide](./guides/QUICK_START.md)
- Check the [FAQ](./guides/FAQ.md)
- Contact support through the Help page

---

*DeerCamp - Connecting Hunters, Preserving Traditions*
