# Frequently Asked Questions

Common questions and answers about DeerCamp.

## General Questions

### What is DeerCamp?

DeerCamp is a hunting club management platform that helps clubs manage stands, bookings, members, harvests, and property maps. It's built as a Progressive Web App (PWA) that works on desktop and mobile devices.

### Is DeerCamp free?

DeerCamp is currently in development. Pricing will be determined before public release.

### What browsers are supported?

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome for Android)

### Can I use DeerCamp offline?

Offline support is planned but not yet fully implemented. Currently, an internet connection is required.

---

## Account & Authentication

### How do I create an account?

1. Go to the login page
2. Click "Sign Up"
3. Enter your email and password
4. Click "Create Account"

### Can I sign in with Google?

Yes, click "Sign in with Google" on the login page.

### How do I reset my password?

Currently, password reset must be done through Firebase. Contact your club administrator or support.

### Can I change my email address?

Email changes require Firebase Admin access. Contact support for assistance.

---

## Clubs

### How do I create a club?

1. Log in to DeerCamp
2. Click "Create Club" on the dashboard or discovery page
3. Fill in club details (name, description, location)
4. Click "Create Club"

### How do I join an existing club?

1. Go to "Discover Clubs"
2. Find a public club
3. Click "Request to Join"
4. Wait for approval from a manager/owner

### Can I be in multiple clubs?

Yes, DeerCamp supports multi-club membership. Use the club switcher in the navigation bar to switch between clubs.

### How do I leave a club?

Contact a club manager or owner to have your membership removed.

### Who can change club settings?

Only club owners can modify club settings like name, description, and visibility.

---

## Bookings

### How do I book a stand?

1. Go to "Bookings" page
2. Select a date
3. Click on an available stand (green)
4. Choose time slot (Morning, Evening, All Day)
5. Confirm booking

### Can I book multiple days in advance?

Yes, depending on club settings. Most clubs allow booking up to 30 days in advance.

### How do I cancel a booking?

1. Go to "My Bookings"
2. Find the booking
3. Click "Cancel"
4. Confirm cancellation

### What do the booking colors mean?

- **Green**: Available
- **Blue**: Your booking
- **Orange/Amber**: Booked by another member

### What is check-in/check-out?

Check-in marks when you arrive at your stand. Check-out marks when you leave. This helps track active hunters for safety.

---

## Harvests

### How do I log a harvest?

1. Go to "Harvests" page
2. Click "Log New Harvest"
3. Fill in details (species, date, weapon, etc.)
4. Upload photos (optional)
5. Click "Save"

### What measurements should I record?

For deer:
- Points (antler tines)
- Inside spread
- Weight (field dressed or live)
- Gross/Net score (if scored)

For turkey:
- Beard length
- Spur length
- Weight

### How do I become a club record holder?

Records are automatically calculated based on harvest data. The Trophy Book page shows current records and your ranking.

---

## Maps

### Why isn't the map loading?

1. Check your internet connection
2. Verify Mapbox token is configured
3. Clear browser cache
4. Try a different browser

### How do I add property boundaries?

1. Go to the Map page
2. Click "Draw Boundary" in toolbar
3. Click points on map to draw polygon
4. Complete the shape by clicking first point
5. Fill in boundary details
6. Click "Save"

**Note:** Only managers and owners can draw boundaries.

### How do I add food plots?

Same process as boundaries, but use "Draw Food Plot" tool.

### How do I add access routes?

1. Click "Draw Route" in toolbar
2. Click points to draw the path
3. Double-click to finish
4. Fill in route details
5. Click "Save"

### What do the different route colors mean?

- **Gray**: Road
- **Orange**: ATV Trail
- **Yellow**: Walking Path
- **Purple**: Quiet Approach

---

## Members

### How do I invite a new member?

1. Go to "Club" > "Members" tab
2. Click "Invite Member"
3. Enter their email address
4. Select role and membership tier
5. Send invite

**Note:** Only managers and owners can invite members.

### What are the different member roles?

- **Owner**: Full control, can change club settings
- **Manager**: Can manage members, stands, bookings
- **Member**: Can book stands, log harvests, post

### What are membership tiers?

Tiers help categorize members:
- **Full**: Regular members
- **Family**: Family member accounts
- **Youth**: Junior members
- **Guest**: Temporary/guest members

### How do I change someone's role?

Only owners can promote members to manager or demote managers.

---

## Troubleshooting

### The app is loading slowly

1. Check internet connection
2. Try refreshing the page
3. Clear browser cache
4. Close other browser tabs

### I can't see any data

1. Make sure you have a club selected
2. Check club membership is active
3. Try logging out and back in

### Photos aren't uploading

1. Check file size (max 10MB for images, 50MB for videos)
2. Verify file format (JPEG, PNG, GIF, WEBP for images)
3. Check internet connection
4. Try a smaller file

### I'm getting "Permission Denied" errors

1. Verify you're logged in
2. Check you have an active club selected
3. Verify your membership is approved
4. Contact club manager if issues persist

### The map shows the wrong location

1. Check club location settings
2. Managers can update club coordinates in settings
3. Use Map Search to navigate to correct location

---

## Mobile App

### Is there a mobile app?

DeerCamp is a Progressive Web App (PWA) that can be installed on mobile devices:

**iOS:**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

**Android:**
1. Open in Chrome
2. Tap menu (three dots)
3. Select "Add to Home Screen"

### Why don't push notifications work?

Push notifications are planned for a future release.

---

## Data & Privacy

### Is my data secure?

Yes, DeerCamp uses Firebase security rules to protect data. Only club members can access club data.

### Can I export my data?

Data export is not currently available but is planned for future releases.

### How do I delete my account?

Contact support for account deletion requests.

---

## Technical Issues

### What do I do if the app crashes?

1. Refresh the page
2. Clear browser cache and cookies
3. Try a different browser
4. Report the issue with details

### How do I report a bug?

1. Note the exact steps to reproduce
2. Take a screenshot if possible
3. Check browser console for errors (F12)
4. Create an issue on GitHub or contact support

### Where can I get more help?

- Check this FAQ
- Review the documentation
- Contact your club administrator
- Reach out to support

---

*FAQ for DeerCamp*
