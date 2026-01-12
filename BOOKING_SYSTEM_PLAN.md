# 🗓️ Stand Booking System - Complete Implementation Plan

**Feature**: Digital Stand Board - Prevent conflicts, promote fairness, keep peace in camp

---

## 📋 Table of Contents

1. [The Hunter's Problem](#the-hunters-problem)
2. [Data Model & Schema](#data-model--schema)
3. [User Interface Design](#user-interface-design)
4. [Component Architecture](#component-architecture)
5. [Business Logic & Rules](#business-logic--rules)
6. [Implementation Phases](#implementation-phases)
7. [Code Structure](#code-structure)
8. [Testing Strategy](#testing-strategy)

---

## The Hunter's Problem

### **Real-World Scenarios We're Solving:**

**Scenario 1: The 4:30am Conflict**
> Jim and Bob both think they have Oak Stand on opening morning. Both drove 2 hours to camp. Both are walking to the stand in the dark. They run into each other halfway there. Argument ensues. Morning is ruined. Deer are spooked. Nobody shoots anything. Bad blood all season.

**Scenario 2: The Stand Hog**
> Steve books every good stand every weekend for 2 months straight. Other members can't get their turn. Resentment builds. Guys stop showing up. Club culture suffers.

**Scenario 3: The No-Show**
> Mike books South Ridge for Saturday morning. Never shows up. Stand sits empty. Another guy could've hunted it. Wasted opportunity.

**Scenario 4: The Maintenance Blackout**
> Nobody knows North Stand's ladder is broken. Someone books it. Shows up at 5am. Can't climb. Dangerous situation. Wasted hunt.

**Scenario 5: The Fair Rotation Question**
> "Who gets the honey holes on opening weekend?" Every club argues about this. Need a system that's transparent and fair.

### **What Hunters Actually Need:**

1. **See availability at a glance** - Visual calendar, color-coded
2. **Know who has what** - No secrets, full transparency
3. **Fair system** - Everyone gets their turn
4. **Prevent conflicts** - One stand, one hunter, one time slot
5. **Flexibility** - Cancel if weather sucks or you get sick
6. **Notifications** - Reminders so you don't forget
7. **Mobile-friendly** - Book from truck on the way to camp
8. **Works offline** - Cell service is trash in hunting country

---

## Data Model & Schema

### **Firestore Collections**

#### **1. `bookings` Collection**

```typescript
interface Booking {
  // IDs
  id: string;                    // Auto-generated doc ID
  standId: string;               // Reference to stand
  userId: string;                // Who booked it
  clubId: string;                // Which club (for multi-club support later)

  // Time
  startTime: Timestamp;          // Start of hunt (e.g., 2025-11-15 05:00:00)
  endTime: Timestamp;            // End of hunt (e.g., 2025-11-15 11:00:00)
  allDay: boolean;               // Full day booking flag

  // Status
  status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';

  // Check-in tracking
  checkInTime?: Timestamp;       // When they actually arrived
  checkOutTime?: Timestamp;      // When they actually left

  // Metadata
  createdAt: Timestamp;          // When booking was made
  updatedAt: Timestamp;          // Last modification
  createdBy: string;             // User who created (could be admin)

  // Notes
  notes?: string;                // Optional: "Bringing my son", "Testing new bow", etc.
  huntType?: 'morning' | 'evening' | 'all-day';

  // Recurrence (for recurring bookings)
  isRecurring: boolean;
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;            // Every X days/weeks
    endDate?: Timestamp;         // When recurrence stops
    daysOfWeek?: number[];       // [0=Sun, 1=Mon, ... 6=Sat]
  };
  parentBookingId?: string;      // If part of recurring series

  // Cancellation tracking
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  cancelledBy?: string;
}
```

**Firestore Indexes Needed:**
```json
{
  "collectionGroup": "bookings",
  "fields": [
    { "fieldPath": "clubId", "order": "ASCENDING" },
    { "fieldPath": "startTime", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "bookings",
  "fields": [
    { "fieldPath": "standId", "order": "ASCENDING" },
    { "fieldPath": "startTime", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "bookings",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "startTime", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "bookings",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "startTime", "order": "ASCENDING" }
  ]
}
```

---

#### **2. `booking_rules` Collection (Club Settings)**

```typescript
interface BookingRules {
  clubId: string;

  // Time restrictions
  advanceBookingDays: number;        // How far in advance (e.g., 14 days)
  minimumAdvanceHours: number;       // Minimum notice (e.g., 24 hours)
  maxConsecutiveDays: number;        // Max days in a row (e.g., 3)

  // Rotation & fairness
  enableFairRotation: boolean;
  rotationPeriod: 'week' | 'month' | 'season';
  prioritySystem: 'first-come' | 'rotation' | 'seniority' | 'lottery';

  // Time slot settings
  allowAllDayBookings: boolean;
  morningStartTime: string;          // "05:00"
  morningEndTime: string;            // "11:00"
  eveningStartTime: string;          // "15:00"
  eveningEndTime: string;            // "20:00"

  // Restrictions
  maxBookingsPerWeek: number;        // Per member (e.g., 2)
  maxActiveBookings: number;         // Concurrent future bookings (e.g., 5)
  allowRecurringBookings: boolean;

  // No-show policy
  enableNoShowTracking: boolean;
  noShowThreshold: number;           // How many before suspension (e.g., 2)
  noShowPenaltyDays: number;         // Suspension length (e.g., 30 days)

  // Special dates
  blackoutDates: Timestamp[];        // Work weekends, club events
  primeSeasonDates: {
    start: Timestamp;
    end: Timestamp;
    rule: 'lottery' | 'seniority' | 'first-come';
  }[];

  // Guest restrictions
  guestsCanBook: boolean;
  guestAdvanceNoticeDays: number;
  guestMaxDays: number;

  // Auto-release
  autoReleaseEnabled: boolean;
  autoReleaseHours: number;          // Release if no check-in (e.g., 2 hours after start)

  // Notifications
  reminderHoursBefore: number[];     // [48, 24, 2] = reminders at 48hr, 24hr, 2hr

  updatedAt: Timestamp;
  updatedBy: string;
}
```

---

#### **3. `stands` Collection (Enhancement)**

Add booking-related fields to existing stands:

```typescript
interface Stand {
  // ... existing fields ...

  // Booking settings
  bookable: boolean;                 // Can this stand be reserved?
  requiresApproval: boolean;         // Admin must approve bookings?
  maxCapacity: number;               // Usually 1, but some stands fit 2

  // Maintenance
  maintenanceMode: boolean;          // Blocked for repairs
  maintenanceStartDate?: Timestamp;
  maintenanceEndDate?: Timestamp;
  maintenanceNotes?: string;

  // Restrictions
  restrictedTo?: string[];           // User IDs who can book (VIP stands)
  minimumRole?: 'member' | 'manager' | 'owner';

  // Stats (for analytics later)
  totalBookings?: number;
  totalHarvests?: number;
  lastBookedDate?: Timestamp;
}
```

---

#### **4. `user_booking_stats` Collection (For Fair Rotation)**

Track member booking patterns for rotation fairness:

```typescript
interface UserBookingStats {
  userId: string;
  clubId: string;
  season: string;                    // "2025-fall", "2026-spring"

  // Rotation tracking
  lastBookedStands: {
    [standId: string]: Timestamp;    // When they last hunted each stand
  };

  totalBookingsThisSeason: number;
  totalBookingsThisWeek: number;
  totalBookingsThisMonth: number;

  // Prime stand tracking
  primeStandBookings: number;        // Count of "honey hole" bookings

  // No-show tracking
  noShowCount: number;
  lastNoShowDate?: Timestamp;
  suspendedUntil?: Timestamp;

  // Work day credits
  workDayCreditsEarned: number;
  workDayCreditsUsed: number;

  updatedAt: Timestamp;
}
```

---

## User Interface Design

### **Page 1: Booking Calendar View** (`/bookings`)

**Layout:**
```
+----------------------------------------------------------+
|  STAND BOARD - November 2025                             |
|  [Today] [Week] [Month] | Filter: [All Stands ▼]         |
+----------------------------------------------------------+
|                                                           |
|  DAILY VIEW (Selected: Saturday, Nov 15, 2025)           |
|                                                           |
|  Sunrise: 6:47am | Sunset: 5:23pm | Moon: Waning Cresc   |
|  Wind: NW 8mph | Temp: 28°F | Barometer: 30.12 (Rising)  |
|                                                           |
|  MORNING (5am - 11am)                                     |
|  +-------------------+  +-------------------+             |
|  | OAK STAND         |  | CREEK BOTTOM      |             |
|  | ✅ BOOKED         |  | 🟢 AVAILABLE      |             |
|  | Jim Parker        |  | [BOOK THIS]       |             |
|  | 5:00am - 11:00am  |  |                   |             |
|  +-------------------+  +-------------------+             |
|                                                           |
|  +-------------------+  +-------------------+             |
|  | SOUTH RIDGE       |  | NORTH STAND       |             |
|  | ✅ BOOKED         |  | 🟠 MAINTENANCE    |             |
|  | You (checked-in)  |  | Ladder repair     |             |
|  | 5:30am - 10:00am  |  | Until Nov 20      |             |
|  +-------------------+  +-------------------+             |
|                                                           |
|  EVENING (3pm - 8pm)                                      |
|  +-------------------+  +-------------------+             |
|  | OAK STAND         |  | CREEK BOTTOM      |             |
|  | 🟢 AVAILABLE      |  | 🟢 AVAILABLE      |             |
|  | [BOOK THIS]       |  | [BOOK THIS]       |             |
|  +-------------------+  +-------------------+             |
|                                                           |
|  [← Previous Day]  [Jump to Date ▼]  [Next Day →]        |
+----------------------------------------------------------+
```

**Weekly View:**
```
+-------------------------------------------------------------+
|  WEEK VIEW: Nov 11-17, 2025                                 |
+-------------------------------------------------------------+
|        | Mon | Tue | Wed | Thu | Fri | Sat | Sun            |
|--------|-----|-----|-----|-----|-----|-----|-----           |
| Oak    | Jim | 🟢  | Bob | 🟢  | Jim | You | Steve          |
| Stand  | AM  |     | AM  |     | AM  | AM  | AM             |
|--------|-----|-----|-----|-----|-----|-----|-----           |
| Creek  | 🟢  | Tom | 🟢  | 🟢  | 🟢  | 🟢  | Mike           |
| Bottom |     | PM  |     |     |     |     | AM+PM          |
|--------|-----|-----|-----|-----|-----|-----|-----           |
| South  | 🟢  | 🟢  | You | 🟢  | 🟢  | Jim | 🟢             |
| Ridge  |     |     | AM  |     |     | PM  |                |
+-------------------------------------------------------------+

Legend: 🟢 Available | ✅ Booked | 🟠 Maintenance | ❌ Blackout
```

**Monthly View:**
```
+----------------------------------------------------------+
|  NOVEMBER 2025                                            |
+----------------------------------------------------------+
|  Sun  Mon  Tue  Wed  Thu  Fri  Sat                        |
|   1    2    3    4    5    6    7                         |
|   •    •    •    🔴   🔴   •    •   (🔴 = Work Weekend)   |
|                                                           |
|   8    9   10   11   12   13   14                         |
|   •    •    •    •    •    •    ⭐  (⭐ = You have booking)|
|                                                           |
|  15   16   17   18   19   20   21                         |
|  ⭐    •    •    •    •    •    •                          |
|                                                           |
|  22   23   24   25   26   27   28                         |
|   •    •    •    🔴   🔴   🔴   🔴  (🔴 = Thanksgiving)    |
|                                                           |
|  29   30                                                  |
|   •    ⭐                                                  |
+----------------------------------------------------------+
| • = Available stands  | ⭐ = Your bookings                 |
| 🔴 = Blackout/Event   | 🟠 = Limited availability         |
+----------------------------------------------------------+
```

---

### **Page 2: Book a Stand** (`/bookings/new`)

**Step-by-Step Wizard:**

**Step 1: Choose Stand**
```
+----------------------------------------------------------+
|  BOOK A STAND                                             |
+----------------------------------------------------------+
|  Step 1 of 3: Select Stand                                |
|                                                           |
|  Choose your stand:                                       |
|                                                           |
|  [ Map View ] [ List View ] ← Toggle                      |
|                                                           |
|  🗺️ MAP VIEW:                                             |
|  [Interactive map with stand markers]                     |
|  - Click stand to select                                  |
|  - Green markers = available                              |
|  - Red markers = booked                                   |
|  - Orange markers = maintenance                           |
|  - Wind direction overlay                                 |
|                                                           |
|  OR                                                       |
|                                                           |
|  📋 LIST VIEW:                                            |
|  ⚪ Oak Stand (Ladder, 20ft)                              |
|     Last hunted by you: 2 weeks ago                       |
|     ✓ Good for NW wind                                    |
|                                                           |
|  ⚪ Creek Bottom (Box Blind)                              |
|     Last hunted by you: Never                             |
|     ✓ Good for W/NW wind                                  |
|                                                           |
|  ⚪ South Ridge (Ladder, 16ft)                            |
|     Last hunted by you: 4 days ago                        |
|     ⚠️ You've hunted this 3 times this month              |
|                                                           |
|  🚫 North Stand (Maintenance)                             |
|     Blocked until Nov 20 - Ladder repair                  |
|                                                           |
|  [Cancel]                            [Next: Choose Date →]|
+----------------------------------------------------------+
```

**Step 2: Choose Date & Time**
```
+----------------------------------------------------------+
|  BOOK A STAND                                             |
+----------------------------------------------------------+
|  Step 2 of 3: Select Date & Time                          |
|                                                           |
|  Selected Stand: OAK STAND                                |
|  [Change Stand]                                           |
|                                                           |
|  📅 Date:                                                 |
|  [Date Picker Calendar]                                   |
|  Selected: Saturday, November 15, 2025                    |
|                                                           |
|  Conditions that day:                                     |
|  🌅 Sunrise: 6:47am | 🌄 Sunset: 5:23pm                   |
|  🌙 Moon: Waning Crescent (34%)                           |
|  🌡️ Forecast: 28°F, NW wind 8mph                         |
|  📊 Barometer: Rising (good movement expected)            |
|                                                           |
|  ⏰ Time Slot:                                            |
|  ( ) Morning Hunt (5:00am - 11:00am)                      |
|  ( ) Evening Hunt (3:00pm - 8:00pm)                       |
|  ( ) All Day (5:00am - 8:00pm)                            |
|  ( ) Custom Time:  [__:__ AM] to [__:__ PM]               |
|                                                           |
|  🔁 Recurring Booking (Optional):                         |
|  [ ] Repeat this booking                                  |
|      ( ) Every week                                       |
|      ( ) Every 2 weeks                                    |
|      Until: [Date Picker]                                 |
|                                                           |
|  [← Back]                           [Next: Confirm →]     |
+----------------------------------------------------------+
```

**Step 3: Confirm & Notes**
```
+----------------------------------------------------------+
|  BOOK A STAND                                             |
+----------------------------------------------------------+
|  Step 3 of 3: Confirm Booking                             |
|                                                           |
|  📍 Stand: OAK STAND (Ladder, 20ft)                       |
|  📅 Date: Saturday, November 15, 2025                     |
|  ⏰ Time: 5:00am - 11:00am (Morning)                      |
|  🌅 Sunrise: 6:47am (legal shooting 30min before)         |
|                                                           |
|  ✅ Availability: Confirmed (No conflicts)                |
|                                                           |
|  📝 Optional Notes:                                       |
|  [_______________________________________________]         |
|  [_______________________________________________]         |
|  "Bringing my son for his first hunt"                     |
|                                                           |
|  📧 Notifications:                                        |
|  ☑️ Remind me 48 hours before                             |
|  ☑️ Remind me 24 hours before                             |
|  ☑️ Remind me 2 hours before                              |
|                                                           |
|  ⚠️ Reminders:                                            |
|  • Check weather forecast before your hunt                |
|  • Complete check-in when you arrive                      |
|  • Remember to check out after your hunt                  |
|  • Cancel if you can't make it (others can hunt)          |
|                                                           |
|  [← Back]                    [CONFIRM BOOKING]            |
+----------------------------------------------------------+
```

---

### **Page 3: My Bookings** (`/bookings/mine`)

```
+----------------------------------------------------------+
|  MY BOOKINGS                                              |
+----------------------------------------------------------+
|  [Upcoming] [Past] [Cancelled]                            |
|                                                           |
|  UPCOMING HUNTS (3)                                       |
|                                                           |
|  +------------------------------------------------------+ |
|  | Saturday, Nov 15, 2025 - Morning                     | |
|  | OAK STAND                                            | |
|  | 5:00am - 11:00am                                     | |
|  |                                                      | |
|  | 🌅 Sunrise: 6:47am | 🌙 Waning Crescent            | |
|  | 🌡️ 28°F, NW 8mph | 📊 Barometer Rising            | |
|  |                                                      | |
|  | Notes: Bringing my son for first hunt               | |
|  |                                                      | |
|  | [Check In] [Modify] [Cancel] [Get Directions]       | |
|  +------------------------------------------------------+ |
|                                                           |
|  +------------------------------------------------------+ |
|  | Sunday, Nov 16, 2025 - Evening                       | |
|  | CREEK BOTTOM                                         | |
|  | 3:00pm - 8:00pm                                      | |
|  |                                                      | |
|  | 🌄 Sunset: 5:22pm                                   | |
|  | 🌡️ 35°F, W 5mph | 📊 Barometer Stable             | |
|  |                                                      | |
|  | [Modify] [Cancel] [Get Directions]                  | |
|  +------------------------------------------------------+ |
|                                                           |
|  +------------------------------------------------------+ |
|  | Tuesday, Nov 18, 2025 - Morning                      | |
|  | SOUTH RIDGE                                          | |
|  | 5:30am - 10:00am                                     | |
|  |                                                      | |
|  | [Modify] [Cancel] [Get Directions]                  | |
|  +------------------------------------------------------+ |
|                                                           |
|  PAST HUNTS (15) - [View All]                             |
|                                                           |
|  Success Rate: 40% (6 harvests / 15 hunts)                |
|  Favorite Stand: Oak Stand (8 hunts, 4 harvests)          |
+----------------------------------------------------------+
```

---

### **Page 4: Who's Hunting** (`/bookings/live`)

Real-time dashboard of current and upcoming activity.

```
+----------------------------------------------------------+
|  WHO'S HUNTING                                            |
+----------------------------------------------------------+
|  🔴 CURRENTLY HUNTING (3 members checked in)              |
|                                                           |
|  +------------------------------------------------------+ |
|  | 🟢 Jim Parker - OAK STAND                           | |
|  | Checked in: 5:47am (2 hours ago)                     | |
|  | Expected return: 11:00am (in 3 hours)                | |
|  | [View on Map] [Send Message]                         | |
|  +------------------------------------------------------+ |
|                                                           |
|  +------------------------------------------------------+ |
|  | 🟢 Bob Smith - SOUTH RIDGE                          | |
|  | Checked in: 6:15am (1.5 hours ago)                   | |
|  | Expected return: 10:00am (in 2.5 hours)              | |
|  | [View on Map] [Send Message]                         | |
|  +------------------------------------------------------+ |
|                                                           |
|  +------------------------------------------------------+ |
|  | 🟢 Mike Johnson - NORTH FOOD PLOT                   | |
|  | Checked in: 6:30am (1 hour ago)                      | |
|  | Expected return: 11:30am (in 4 hours)                | |
|  | [View on Map] [Send Message]                         | |
|  +------------------------------------------------------+ |
|                                                           |
|  📍 MAP VIEW:                                             |
|  [Interactive map showing checked-in hunters]             |
|  - Green pins = Currently hunting                         |
|  - Safety radius circles (300 yards)                      |
|                                                           |
|  ⏱️ HUNTING LATER TODAY (2)                               |
|                                                           |
|  • Tom Davis - CREEK BOTTOM (3:00pm - 8:00pm)             |
|  • Sarah Lee - OAK STAND (3:30pm - 7:30pm)                |
|                                                           |
|  📅 UPCOMING THIS WEEK (12 bookings)                      |
|  [View Full Calendar]                                     |
+----------------------------------------------------------+
```

---

## Component Architecture

### **React Component Structure**

```
src/
├── pages/
│   ├── BookingsPage.tsx              # Main calendar view
│   ├── NewBookingPage.tsx            # Create booking wizard
│   ├── MyBookingsPage.tsx            # User's booking list
│   ├── LiveHuntersPage.tsx           # Who's hunting now
│   └── BookingDetailsPage.tsx        # Single booking view/edit
│
├── components/
│   ├── bookings/
│   │   ├── BookingCalendar/
│   │   │   ├── DailyView.tsx         # Daily calendar
│   │   │   ├── WeeklyView.tsx        # Weekly grid
│   │   │   ├── MonthlyView.tsx       # Monthly overview
│   │   │   ├── StandCard.tsx         # Stand availability card
│   │   │   └── BookingLegend.tsx     # Color legend
│   │   │
│   │   ├── BookingWizard/
│   │   │   ├── StandSelector.tsx     # Step 1: Choose stand
│   │   │   ├── DateTimeSelector.tsx  # Step 2: Choose when
│   │   │   ├── BookingConfirm.tsx    # Step 3: Confirm
│   │   │   └── WizardProgress.tsx    # Progress indicator
│   │   │
│   │   ├── BookingCard.tsx           # Single booking display
│   │   ├── BookingFilters.tsx        # Filter controls
│   │   ├── BookingConflictAlert.tsx  # Conflict warning
│   │   ├── RecurringBookingForm.tsx  # Recurring options
│   │   ├── CheckInButton.tsx         # Quick check-in
│   │   └── BookingWeatherInfo.tsx    # Weather overlay
│   │
│   └── shared/
│       ├── DatePicker.tsx            # Custom date picker
│       ├── TimePicker.tsx            # Time range selector
│       ├── StandMap.tsx              # Interactive map
│       └── ConfirmDialog.tsx         # Confirmation modals
│
├── hooks/
│   ├── useBookings.ts                # Booking CRUD operations
│   ├── useBookingRules.ts            # Club rules validation
│   ├── useBookingConflicts.ts        # Conflict detection
│   ├── useFairRotation.ts            # Rotation logic
│   └── useBookingNotifications.ts    # Notification triggers
│
├── utils/
│   ├── bookingValidation.ts          # Validation functions
│   ├── bookingConflicts.ts           # Conflict detection
│   ├── recurringBookings.ts          # Recurring logic
│   ├── fairRotation.ts               # Rotation algorithm
│   └── bookingHelpers.ts             # Utility functions
│
└── types/
    └── booking.ts                    # TypeScript interfaces
```

---

## Business Logic & Rules

### **Validation Rules**

#### **1. Conflict Detection**

```typescript
/**
 * Check if a proposed booking conflicts with existing bookings
 */
function hasConflict(
  standId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  // Query bookings for this stand that overlap the time range
  // Overlaps if:
  //   - existing.startTime < proposed.endTime
  //   - existing.endTime > proposed.startTime
  //   - existing.status !== 'cancelled'
}
```

#### **2. User Permission Check**

```typescript
/**
 * Can this user book this stand at this time?
 */
function canUserBook(
  user: User,
  stand: Stand,
  startTime: Date,
  rules: BookingRules
): { allowed: boolean; reason?: string } {

  // Check 1: Stand is bookable
  if (!stand.bookable) {
    return { allowed: false, reason: "Stand is not available for booking" };
  }

  // Check 2: Stand is in maintenance
  if (stand.maintenanceMode) {
    return { allowed: false, reason: "Stand is under maintenance" };
  }

  // Check 3: Advance booking window
  const hoursUntilHunt = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilHunt < rules.minimumAdvanceHours) {
    return {
      allowed: false,
      reason: `Must book at least ${rules.minimumAdvanceHours} hours in advance`
    };
  }

  const daysUntilHunt = hoursUntilHunt / 24;
  if (daysUntilHunt > rules.advanceBookingDays) {
    return {
      allowed: false,
      reason: `Cannot book more than ${rules.advanceBookingDays} days in advance`
    };
  }

  // Check 4: User has reached max bookings
  const userActiveBookings = await getUserActiveBookings(user.id);
  if (userActiveBookings.length >= rules.maxActiveBookings) {
    return {
      allowed: false,
      reason: `Maximum ${rules.maxActiveBookings} active bookings reached`
    };
  }

  // Check 5: Blackout dates
  if (isBlackoutDate(startTime, rules.blackoutDates)) {
    return { allowed: false, reason: "This date is blocked for club events" };
  }

  // Check 6: User role restrictions
  if (stand.minimumRole && user.role < stand.minimumRole) {
    return { allowed: false, reason: "You don't have permission for this stand" };
  }

  // Check 7: Stand-specific restrictions
  if (stand.restrictedTo && !stand.restrictedTo.includes(user.id)) {
    return { allowed: false, reason: "This stand is restricted to certain members" };
  }

  // Check 8: No-show suspension
  const userStats = await getUserBookingStats(user.id);
  if (userStats.suspendedUntil && userStats.suspendedUntil > new Date()) {
    return {
      allowed: false,
      reason: `Suspended until ${userStats.suspendedUntil.toLocaleDateString()} due to no-shows`
    };
  }

  // Check 9: Fair rotation (if enabled)
  if (rules.enableFairRotation) {
    const rotationCheck = await checkFairRotation(user.id, stand.id, startTime, rules);
    if (!rotationCheck.allowed) {
      return rotationCheck;
    }
  }

  return { allowed: true };
}
```

#### **3. Fair Rotation Logic**

```typescript
/**
 * Fair rotation algorithm - prevent same people hogging good stands
 */
async function checkFairRotation(
  userId: string,
  standId: string,
  startTime: Date,
  rules: BookingRules
): Promise<{ allowed: boolean; reason?: string; priority?: number }> {

  const userStats = await getUserBookingStats(userId);
  const allUsersStats = await getAllUserBookingStats();

  // Calculate user's booking frequency for this stand
  const lastBooked = userStats.lastBookedStands[standId];

  if (lastBooked) {
    const daysSinceLastBooked = (startTime.getTime() - lastBooked.getTime()) / (1000 * 60 * 60 * 24);

    // If they hunted this stand recently, lower priority
    if (daysSinceLastBooked < 7) {
      return {
        allowed: true,
        reason: "You hunted this stand recently - others may have priority",
        priority: 1
      };
    }
  }

  // Calculate priority based on:
  // 1. How long since they last hunted this stand
  // 2. How many total bookings they have vs. others
  // 3. Work day credits

  const avgBookingsPerUser = allUsersStats.reduce((sum, s) => sum + s.totalBookingsThisWeek, 0) / allUsersStats.length;

  const priority = calculatePriority({
    daysSinceLastBooked: lastBooked ? (startTime.getTime() - lastBooked.getTime()) / (1000 * 60 * 60 * 24) : 999,
    bookingsVsAverage: avgBookingsPerUser - userStats.totalBookingsThisWeek,
    workDayCredits: userStats.workDayCreditsEarned - userStats.workDayCreditsUsed,
    seniority: userStats.yearsInClub || 0
  });

  return { allowed: true, priority };
}
```

#### **4. Recurring Booking Generation**

```typescript
/**
 * Generate recurring booking instances
 */
async function createRecurringBookings(
  parentBooking: Booking,
  recurrenceRule: RecurrenceRule
): Promise<Booking[]> {

  const instances: Booking[] = [];
  let currentDate = new Date(parentBooking.startTime);
  const endDate = recurrenceRule.endDate || addMonths(currentDate, 3); // Max 3 months

  while (currentDate <= endDate) {
    // Apply frequency
    if (recurrenceRule.frequency === 'weekly') {
      currentDate = addWeeks(currentDate, recurrenceRule.interval);
    } else if (recurrenceRule.frequency === 'daily') {
      currentDate = addDays(currentDate, recurrenceRule.interval);
    }

    // Check day of week filter
    if (recurrenceRule.daysOfWeek && !recurrenceRule.daysOfWeek.includes(currentDate.getDay())) {
      continue;
    }

    // Check for conflicts
    const hasConflict = await checkBookingConflict(
      parentBooking.standId,
      currentDate,
      addHours(currentDate, differenceInHours(parentBooking.endTime, parentBooking.startTime))
    );

    if (!hasConflict) {
      instances.push({
        ...parentBooking,
        id: generateId(),
        startTime: currentDate,
        endTime: addHours(currentDate, differenceInHours(parentBooking.endTime, parentBooking.startTime)),
        parentBookingId: parentBooking.id,
        isRecurring: false  // Individual instances are not recurring
      });
    }
  }

  return instances;
}
```

---

## Implementation Phases

### **Phase 1: MVP (Week 1-2) - Core Booking**

**Goal**: Get basic booking working

**Features**:
- ✅ View calendar (daily view only)
- ✅ Create booking (stand + date/time)
- ✅ View my bookings
- ✅ Cancel booking
- ✅ Conflict detection
- ✅ Basic validation rules

**Database**:
- `bookings` collection
- `booking_rules` collection (minimal)

**UI**:
- Daily calendar view
- Simple booking form
- My bookings list

**Testing**:
- Can create booking
- Can't double-book
- Can cancel own booking
- Shows correct availability

---

### **Phase 2: Enhanced Views (Week 3)**

**Goal**: Better visualization

**Features**:
- ✅ Weekly calendar view
- ✅ Monthly calendar view
- ✅ Filter by stand
- ✅ "Who's hunting" page
- ✅ Booking details page

**UI**:
- Weekly grid
- Monthly overview
- Stand filter dropdown
- Live hunters dashboard

---

### **Phase 3: Advanced Features (Week 4-5)**

**Goal**: Fairness & automation

**Features**:
- ✅ Fair rotation system
- ✅ Booking rules configuration (admin)
- ✅ Recurring bookings
- ✅ Check-in / check-out integration
- ✅ Auto-release no-shows
- ✅ Maintenance mode for stands

**Database**:
- `user_booking_stats` collection
- Enhanced `booking_rules`

**Logic**:
- Fair rotation algorithm
- Recurring booking generation
- Auto-release job (Cloud Function)

---

### **Phase 4: Notifications & Polish (Week 6)**

**Goal**: User experience refinements

**Features**:
- ✅ Email notifications
- ✅ Push notifications (web push)
- ✅ Reminder notifications (48hr, 24hr, 2hr)
- ✅ Weather integration
- ✅ Mobile optimization
- ✅ Booking modification (edit time/date)

**Services**:
- Email service (SendGrid or Firebase Extensions)
- Web push notifications
- Weather API integration

---

### **Phase 5: Advanced Admin (Week 7+)**

**Goal**: Club management tools

**Features**:
- ✅ Admin can book for members
- ✅ Admin can cancel any booking
- ✅ Blackout date management
- ✅ Prime season lottery system
- ✅ Booking analytics dashboard
- ✅ Export booking reports

---

## Code Structure

### **Key Files to Create**

#### **1. Types** (`src/types/booking.ts`)

```typescript
import { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
export type HuntType = 'morning' | 'evening' | 'all-day';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface Booking {
  id: string;
  standId: string;
  userId: string;
  clubId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  allDay: boolean;
  status: BookingStatus;
  checkInTime?: Timestamp;
  checkOutTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  notes?: string;
  huntType?: HuntType;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  parentBookingId?: string;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  cancelledBy?: string;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: Timestamp;
  daysOfWeek?: number[];
}

export interface BookingRules {
  clubId: string;
  advanceBookingDays: number;
  minimumAdvanceHours: number;
  maxConsecutiveDays: number;
  enableFairRotation: boolean;
  rotationPeriod: 'week' | 'month' | 'season';
  prioritySystem: 'first-come' | 'rotation' | 'seniority' | 'lottery';
  allowAllDayBookings: boolean;
  morningStartTime: string;
  morningEndTime: string;
  eveningStartTime: string;
  eveningEndTime: string;
  maxBookingsPerWeek: number;
  maxActiveBookings: number;
  allowRecurringBookings: boolean;
  enableNoShowTracking: boolean;
  noShowThreshold: number;
  noShowPenaltyDays: number;
  blackoutDates: Timestamp[];
  autoReleaseEnabled: boolean;
  autoReleaseHours: number;
  reminderHoursBefore: number[];
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface UserBookingStats {
  userId: string;
  clubId: string;
  season: string;
  lastBookedStands: { [standId: string]: Timestamp };
  totalBookingsThisSeason: number;
  totalBookingsThisWeek: number;
  totalBookingsThisMonth: number;
  primeStandBookings: number;
  noShowCount: number;
  lastNoShowDate?: Timestamp;
  suspendedUntil?: Timestamp;
  workDayCreditsEarned: number;
  workDayCreditsUsed: number;
  updatedAt: Timestamp;
}

export interface BookingValidationResult {
  allowed: boolean;
  reason?: string;
  priority?: number;
}
```

---

#### **2. Custom Hook** (`src/hooks/useBookings.ts`)

```typescript
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Booking } from '../types/booking';

export function useBookings(clubId: string, filters?: {
  standId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;

    // Build query
    let q = query(
      collection(db, 'bookings'),
      where('clubId', '==', clubId),
      orderBy('startTime', 'asc')
    );

    // Apply filters
    if (filters?.standId) {
      q = query(q, where('standId', '==', filters.standId));
    }
    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));

        // Filter by date range if provided
        let filtered = bookingData;
        if (filters?.startDate) {
          filtered = filtered.filter(b =>
            b.startTime.toDate() >= filters.startDate!
          );
        }
        if (filters?.endDate) {
          filtered = filtered.filter(b =>
            b.startTime.toDate() <= filters.endDate!
          );
        }

        setBookings(filtered);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching bookings:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [clubId, filters]);

  // Create booking
  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      throw new Error(err.message);
    }
  };

  // Update booking
  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (err: any) {
      console.error('Error updating booking:', err);
      throw new Error(err.message);
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId: string, reason?: string, cancelledBy?: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        cancellationReason: reason,
        cancelledBy: cancelledBy,
        updatedAt: Timestamp.now()
      });
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      throw new Error(err.message);
    }
  };

  // Check in
  const checkIn = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'checked-in',
        checkInTime: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (err: any) {
      console.error('Error checking in:', err);
      throw new Error(err.message);
    }
  };

  // Check out
  const checkOut = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'completed',
        checkOutTime: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (err: any) {
      console.error('Error checking out:', err);
      throw new Error(err.message);
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    cancelBooking,
    checkIn,
    checkOut
  };
}
```

---

#### **3. Conflict Detection** (`src/utils/bookingConflicts.ts`)

```typescript
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Booking } from '../types/booking';

/**
 * Check if a booking time range conflicts with existing bookings
 */
export async function checkBookingConflict(
  standId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: Booking }> {

  const startTimestamp = Timestamp.fromDate(startTime);
  const endTimestamp = Timestamp.fromDate(endTime);

  // Query for bookings that might overlap
  const q = query(
    collection(db, 'bookings'),
    where('standId', '==', standId),
    where('status', 'in', ['confirmed', 'checked-in']),
    where('startTime', '<', endTimestamp)
  );

  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const booking = { id: docSnap.id, ...docSnap.data() } as Booking;

    // Skip if this is the booking we're modifying
    if (excludeBookingId && booking.id === excludeBookingId) {
      continue;
    }

    // Check for overlap
    // Overlap occurs if: existing.endTime > proposed.startTime
    if (booking.endTime.toDate() > startTime) {
      return {
        hasConflict: true,
        conflictingBooking: booking
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Get all bookings for a specific date range and stand
 */
export async function getBookingsForDateRange(
  standId: string,
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {

  const q = query(
    collection(db, 'bookings'),
    where('standId', '==', standId),
    where('startTime', '>=', Timestamp.fromDate(startDate)),
    where('startTime', '<=', Timestamp.fromDate(endDate)),
    where('status', 'in', ['confirmed', 'checked-in'])
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Booking));
}
```

---

This is a comprehensive foundation. **Want me to continue with the actual React components, or would you prefer to start implementing Phase 1 (MVP) first?**

Let me know and I'll provide the complete component code! 🦌