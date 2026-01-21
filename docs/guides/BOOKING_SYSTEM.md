# Booking System Guide

Comprehensive guide to the stand reservation system in DeerCamp.

## Overview

The booking system allows club members to reserve hunting stands in advance, preventing conflicts and ensuring fair access to club property.

## Key Features

- **Calendar views**: Daily/weekly/monthly availability
- **Conflict detection**: Prevents double-bookings
- **Time slots**: Morning, evening, or all-day options
- **Check-in/out tracking**: Safety monitoring
- **Who's Hunting dashboard**: Real-time active hunter display
- **Booking rules**: Configurable club policies

---

## Making a Booking

### From the Bookings Page

1. Navigate to **Bookings** in the navigation
2. Use the date selector to choose your date
3. View stand availability on the grid
4. Click on an available (green) time slot
5. Select time slot type:
   - **Morning**: Sunrise to noon
   - **Evening**: Noon to sunset
   - **All Day**: Sunrise to sunset
6. Add optional notes
7. Confirm booking

### From the New Booking Page

1. Navigate to **Bookings** > **New Booking**
2. Select a stand from the dropdown
3. Choose date using the date picker
4. Select time slot
5. Add notes (optional)
6. Review summary
7. Confirm booking

---

## Booking Rules

### Default Rules

| Rule | Default Value |
|------|---------------|
| Max days in advance | 30 days |
| Max consecutive days | 3 days |
| Minimum advance notice | 2 hours |
| Blackout dates | None |

### Club-Specific Rules

Club owners can configure:

- Maximum booking window
- Consecutive day limits
- Required advance notice
- Blackout dates (holidays, maintenance)
- Guest booking restrictions

---

## Booking Statuses

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **Confirmed** | Booking is scheduled | Check in, Cancel |
| **Checked-in** | Hunter is at stand | Check out |
| **Completed** | Hunt finished | View only |
| **Cancelled** | Booking was cancelled | View only |
| **No-show** | Didn't check in | View only |

---

## Check-in/Check-out System

### Why Check In?

- **Safety**: Club knows who's in the field
- **Accountability**: Track stand usage
- **Emergency response**: Locate hunters if needed

### How to Check In

1. Go to **Check-in** page (or My Bookings)
2. Find your confirmed booking for today
3. Click "Check In"
4. Confirm you're at the stand

### How to Check Out

1. Go to **Check-in** page
2. Find your checked-in booking
3. Click "Check Out"
4. Confirm you're leaving

### Who's Hunting Dashboard

The dashboard shows all currently checked-in hunters:
- Hunter name
- Stand location
- Check-in time
- Duration
- Overdue alerts (> 8 hours)

---

## Managing Your Bookings

### View Your Bookings

1. Go to **Bookings** > **My Bookings**
2. Use filters to view:
   - Upcoming bookings
   - Past bookings
   - Cancelled bookings

### Cancel a Booking

1. Find the booking in My Bookings
2. Click "Cancel"
3. Optionally provide a reason
4. Confirm cancellation

**Note:** Cancellation frees the slot for others.

### Modify a Booking

To change a booking:
1. Cancel the existing booking
2. Create a new booking with desired changes

---

## Manager Features

### Managing All Bookings

Managers can view and manage all club bookings:

1. View any member's bookings
2. Cancel bookings on behalf of members
3. Resolve booking conflicts

### Adding Stands

1. Go to **Bookings** page
2. Click "Add Stand" (top right)
3. Enter stand details:
   - Name
   - Type (ladder, climber, blind, box)
   - Description
4. Save

**Note:** Stand location must be set on the map.

---

## Booking Calendar Views

### Daily View

Shows all stands for a single day:
- Rows: Each stand
- Columns: AM and PM slots
- Color coding: Availability status

### Legend

| Color | Meaning |
|-------|---------|
| Green | Available |
| Blue | Your booking |
| Orange/Amber | Booked by others |
| Gray | Maintenance/Unavailable |

---

## Time Slot Details

### Morning Hunt

- **Start**: Typically 30 min before sunrise
- **End**: Noon
- **Best for**: Dawn hunting, deer movement

### Evening Hunt

- **Start**: Noon
- **End**: 30 min after sunset
- **Best for**: Afternoon/evening hunting

### All-Day Hunt

- **Start**: 30 min before sunrise
- **End**: 30 min after sunset
- **Best for**: Full-day sits, rut hunting

---

## Conflict Resolution

### Automatic Prevention

The system automatically prevents:
- Double-booking the same stand/time
- Overlapping bookings
- Booking past dates
- Exceeding advance limits

### Manual Resolution

If conflicts arise:
1. Contact the club manager
2. Manager can cancel conflicting bookings
3. Rebooking occurs as needed

---

## Best Practices

### For Members

1. **Book early**: Popular stands fill quickly
2. **Check in promptly**: Helps safety monitoring
3. **Check out when done**: Frees the stand
4. **Cancel if plans change**: Be courteous to others
5. **Add notes**: Share relevant info (gear, vehicle, etc.)

### For Managers

1. **Review bookings regularly**: Monitor usage patterns
2. **Set fair rules**: Balance access for all members
3. **Handle conflicts promptly**: Keep members happy
4. **Use blackout dates**: For maintenance, events
5. **Monitor no-shows**: Address recurring issues

---

## Integration with Other Features

### Map Integration

- View stand locations on map
- See distance rings (200/300/400 yards)
- Plan access routes

### Harvest Logging

- Link harvests to bookings
- Track success rates by stand
- Analyze hunting patterns

### Activity Feed

- Booking confirmations appear in feed
- Check-ins show in Who's Hunting
- Harvest posts link to booking location

---

## Troubleshooting

### "Stand not available"

- Check for existing bookings
- Verify date is within allowed range
- Check for blackout dates

### "Cannot book" errors

- Verify club membership is active
- Check you haven't exceeded limits
- Try refreshing the page

### Check-in not working

- Ensure booking is for today
- Verify booking status is "Confirmed"
- Check internet connection

---

*Booking System documentation for DeerCamp*
