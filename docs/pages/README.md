# Pages Reference

This document provides comprehensive documentation for all page components in DeerCamp.

## Table of Contents

- [Overview](#overview)
- [Public Pages](#public-pages)
- [Dashboard & Feed](#dashboard--feed)
- [Booking Pages](#booking-pages)
- [Club Management](#club-management)
- [Harvest Pages](#harvest-pages)
- [Member Pages](#member-pages)
- [Informational Pages](#informational-pages)
- [Admin Pages](#admin-pages)

---

## Overview

### Route Structure

```
/                     → LandingPage (public)
/login                → LoginPage (public)
/dashboard            → Dashboard (protected)
/feed                 → FeedPage (protected)
/bookings             → BookingsPage (protected)
/bookings/new         → NewBookingPage (protected)
/bookings/mine        → MyBookingsPage (protected)
/check-in             → CheckInOutPage (protected)
/club                 → ClubPage (protected)
/harvests             → HarvestsPage (protected)
/profile              → ProfilePage (protected)
/members/invite       → InviteMemberPage (protected)
/clubs/create         → CreateClubPage (protected)
/clubs/discover       → ClubDiscoveryPage (protected)
/features             → FeaturesPage (protected)
/help                 → HelpPage (protected)
/safety               → SafetyPage (protected)
/conservation         → ConservationPage (protected)
/community            → CommunityPage (protected)
/privacy              → PrivacyPage (protected)
/terms                → TermsPage (protected)
/cookies              → CookiesPage (protected)
/admin/*              → AdminDashboard (admin only)
```

### Route Protection

| Type | Description |
|------|-------------|
| Public | No authentication required |
| Protected | Requires authenticated user |
| Admin | Requires `isSuperAdmin` claim |

---

## Public Pages

### LandingPage

Marketing landing page for unauthenticated users.

**Route:** `/`

**Features:**
- Hero section with parallax scrolling
- Feature highlights (4 main features)
- Testimonial section
- Call-to-action buttons
- Responsive navigation
- Animated with Framer Motion

**Redirects:** Authenticated users → `/dashboard`

---

### LoginPage

User authentication page.

**Route:** `/login`

**Features:**
- Email/password login
- Email/password registration
- Google OAuth sign-in
- Toggle between login/signup modes
- Error display
- Animated transitions

**After Login:** Redirects to `/dashboard`

---

## Dashboard & Feed

### Dashboard

Main dashboard with statistics and overview.

**Route:** `/dashboard`

**Requires:** `activeClubId`

**Data Sources:**
- `useWeather()` - Weather for club location
- Real-time queries for harvests, bookings, stands, members, posts

**Sections:**
- Hero with greeting and weather widget
- Stats cards (Harvests, Bookings, Stands, Members)
- Live Activity Feed (recent posts)
- Weather forecast
- Quick action buttons

---

### FeedPage

Club activity feed with posts.

**Route:** `/feed`

**Requires:** `activeClubId`

**Features:**
- Filter tabs (All, Posts, Harvests, Announcements, Events)
- Pinned posts section
- New post button
- Create post modal
- Real-time updates via `onSnapshot`
- Mobile floating action button

---

## Booking Pages

### BookingsPage

Stand board showing daily availability.

**Route:** `/bookings`

**Requires:** `activeClubId`

**Data Sources:**
- `useBookingsByDate()` - Bookings for selected date
- `useStands()` - All club stands

**Features:**
- Date navigator (previous/next/today)
- Sunrise/sunset times
- Stands grid with AM/PM availability
- Color-coded booking status
- Add Stand button (managers+)
- Book a Stand button
- Legend

---

### NewBookingPage

Create new stand booking form.

**Route:** `/bookings/new`

**Requires:** `activeClubId`

**Form Fields:**
- Stand selection dropdown
- Date picker
- Time slot (Morning, Evening, All Day)
- Notes (optional)

**Features:**
- Booking summary before confirmation
- Confirmation modal
- Validation (conflicts, rules)
- Success redirect to `/bookings/mine`

---

### MyBookingsPage

User's personal bookings.

**Route:** `/bookings/mine`

**Data Sources:**
- `useMyBookings()` - User's bookings with actions

**Features:**
- Filter tabs (Upcoming, Past, Cancelled)
- Booking cards with status badges
- Check-in/check-out buttons
- Cancel booking modal
- New booking button

---

### CheckInOutPage

Check-in/out for active hunts.

**Route:** `/check-in`

**Features:**
- Check In section (confirmed bookings for today)
- Check Out section (checked-in bookings with duration)
- Who's Hunting Dashboard
- Safety reminder card

---

## Club Management

### ClubPage

Club management hub with tabs.

**Route:** `/club`

**Requires:** `activeClubId`

**Tabs:**
- Members - Member directory
- Property - Property management (managers+)
- Settings - Club settings (managers+)

---

### CreateClubPage

Create new hunting club form.

**Route:** `/clubs/create`

**Form Sections:**
- Basic Info (name, description)
- Location (city, state)
- Visibility & Access (public, approval required)
- Tags (hunting types)
- Additional Settings (max members, rules)

**After Create:** Sets as active club, redirects to `/dashboard`

---

### ClubDiscoveryPage

Discover and join public clubs.

**Route:** `/clubs/discover`

**Data Sources:**
- `usePublicClubs()` - Public clubs list
- `searchPublicClubs()` - Search function

**Features:**
- Search bar
- Clubs grid with cards
- Public/private badges
- Join request buttons
- Create club link

---

### PropertyManagementPage

Manage property features (within ClubPage).

**Requires:** Manager or Owner role

**Sections (collapsible):**
- Property Boundaries (list with delete)
- Food Plots (list with delete)
- Access Routes (list with delete)
- Terrain Features (list with delete)
- Trail Cameras (list with delete)

**Stats:**
- Total acreage
- Total features
- Boundary count

---

### MapPage

Interactive property map.

**Requires:** `activeClubId`

**Features:**
- Full-screen map view
- Drawing tools toolbar (Boundary, Food Plot, Route, Measure)
- Map search
- Stand filter panel
- Layer controls panel
- Stand popup overlay

---

## Harvest Pages

### HarvestsPage

Tabbed interface for harvests.

**Route:** `/harvests`

**Requires:** `activeClubId`

**Tabs:**
- Harvest Log - Recent harvests
- Trophy Book - Records and leaderboards

---

### HarvestPage

Harvest logging and viewing (within HarvestsPage).

**Features:**
- Harvest cards grid with photos
- Log New Harvest button
- Add Harvest Modal with form:
  - Species, Sex, Date
  - Weight, Photo upload
  - Weapon, Notes

---

### TrophyBookPage

Trophy records and statistics (within HarvestsPage).

**Data Sources:**
- `getClubRecords()` - Trophy records
- `getHarvestStats()` - Statistics

**Features:**
- Season filter dropdown
- Statistics cards (Total, Deer, Turkey, Hogs)
- Club Records grid
- Top Hunters leaderboard

---

## Member Pages

### MembersPage

Member directory (within ClubPage).

**Data Sources:**
- `useAllMembers()` - All club members

**Features:**
- Search bar
- Role filter tabs
- Status filter tabs
- Stats cards (Total, Active, Dues Unpaid, Admins)
- Members grid with MemberCards
- Invite Member button (if permitted)

---

### InviteMemberPage

Invite new members to club.

**Route:** `/members/invite`

**Requires:** `activeClubId`, Manager or Owner role

**Form Fields:**
- Email address
- Role (member, manager)
- Membership Tier
- Personal message

**Success:**
- Shows invite link with code
- Copy to clipboard button

---

### ProfilePage

User profile display.

**Route:** `/profile`

**Displays:**
- Avatar
- Display name
- Email
- Role in active club
- Active club name
- Logout button

---

## Informational Pages

### FeaturesPage

Platform features showcase.

**Route:** `/features`

**Sections:**
- Hero section
- Main features (4 cards)
- Additional features (8 items)
- Weather integration callout

---

### HelpPage

Help center with FAQs.

**Route:** `/help`

**Features:**
- Search bar
- Category grid (6 categories)
- Expandable FAQ items
- Contact support section

---

### SafetyPage

Safety guidelines and procedures.

**Route:** `/safety`

**Sections:**
- Safety alert banner
- Core safety rules (4 rules)
- Check-in system benefits
- "Know Before You Go" section
- Emergency procedures
- Emergency contact

---

### ConservationPage

Conservation education.

**Route:** `/conservation`

**Sections:**
- Conservation quote header
- Conservation pillars (4 areas)
- "How You Can Help" section
- Conservation organizations

---

### CommunityPage

Community features overview.

**Route:** `/community`

**Sections:**
- Community stats
- Features grid (Feed, Photos, Trophy Book, Events)
- Community values (4 values)
- Testimonials
- CTA section

---

### PrivacyPage

Privacy policy.

**Route:** `/privacy`

Static content covering data collection, usage, sharing, security, and user rights.

---

### TermsPage

Terms of service.

**Route:** `/terms`

Static content with 9 sections covering account terms, user conduct, etc.

---

### CookiesPage

Cookie policy.

**Route:** `/cookies`

Covers cookie types (essential, functional, analytics), third-party services, and management.

---

## Admin Pages

### AdminDashboard

Platform-wide admin dashboard.

**Route:** `/admin/*`

**Requires:** `isSuperAdmin` claim

**Tabs:**
- **Overview**: Stats cards, growth charts, moderation queue
- **Users**: User management table with search, ban/unban
- **Clubs**: Club directory grid, delete clubs
- **Moderation**: Pending reports queue, resolve reports
- **Logs**: Audit trail (placeholder)

**Data Sources:**
- Real-time subscriptions to users, clubs, reports, harvests

---

## Page Patterns

### Loading State

```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
    </div>
  );
}
```

### No Club Selected

```tsx
if (!activeClubId) {
  return <NoClubSelected />;
}
```

### Error Handling

```tsx
if (error) {
  return (
    <div className="text-center py-12">
      <p className="text-red-400">{error}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  );
}
```

---

*Pages documented from `src/pages/`*
