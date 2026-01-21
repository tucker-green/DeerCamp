# Member Management Guide

Complete guide to managing club members in DeerCamp.

## Overview

DeerCamp provides comprehensive member management features including invitations, role management, dues tracking, and member profiles.

## Member Roles

### Owner

The highest permission level:
- Full control over club settings
- Can promote/demote any member
- Can delete the club
- Cannot be removed (except by super admin)
- Only one owner per club

### Manager

Administrative assistants:
- Can manage members (except owners)
- Can create/manage stands
- Can draw property features
- Can create announcements
- Can resolve reports

### Member

Standard club participants:
- Can book stands
- Can log harvests
- Can create posts
- Can view club content
- Limited to self-service actions

---

## Membership Tiers

Tiers categorize members for organizational purposes:

| Tier | Description | Typical Use |
|------|-------------|-------------|
| Full | Regular membership | Primary members |
| Family | Family member | Spouse, children |
| Youth | Junior member | Under 18 |
| Guest | Temporary access | Visitors, trials |

---

## Inviting Members

### Who Can Invite

- Owners: Can invite any role
- Managers: Can invite members only

### How to Invite

1. Go to **Club** > **Members** tab
2. Click "Invite Member"
3. Enter details:
   - Email address
   - Role (member, manager)
   - Membership tier
   - Personal message (optional)
4. Click "Send Invite"

### Invite Process

1. Invite is created with unique code
2. Code can be shared via link
3. New user signs up or existing user accepts
4. Membership is created automatically

### Invite Expiration

Invites expire after 7 days. Managers can resend expired invites.

---

## Join Requests

For public clubs, users can request to join.

### Reviewing Requests

1. Go to **Club** > **Members** tab
2. Look for pending requests section
3. Review requester's profile
4. Approve or reject with optional message

### Approval

When approved:
- Membership is created
- User's `clubIds` updated
- User can access club immediately

### Rejection

When rejected:
- Request marked as rejected
- Optional reason recorded
- User can submit new request later

---

## Member Directory

### Viewing Members

1. Go to **Club** > **Members** tab
2. See all club members
3. View counts by status

### Searching Members

Use the search bar to find members by:
- Name
- Email
- Any profile field

### Filtering Members

Filter by:
- **Role**: Owner, Manager, Member
- **Status**: Active, Inactive, Suspended
- **Dues**: Paid, Unpaid, Overdue

---

## Member Actions

### Viewing a Member

Click on a member card to see:
- Full profile information
- Contact details
- Emergency contact
- Hunter safety info
- Membership details

### Editing Member Profile

**Who can edit:**
- User can edit their own profile
- Managers can edit member profiles
- Owners can edit any profile

**Editable fields:**
- Display name
- Phone number
- Address
- Emergency contact
- Hunter safety info
- Bio

### Promoting a Member

**Who can promote:**
- Only owners

**Steps:**
1. Find member in directory
2. Click action menu (...)
3. Select "Promote to Manager"
4. Confirm action

### Demoting a Manager

**Who can demote:**
- Only owners

**Steps:**
1. Find manager in directory
2. Click action menu (...)
3. Select "Demote to Member"
4. Confirm action

### Suspending a Member

**Who can suspend:**
- Owners and managers

**What happens:**
- Member cannot access club
- Bookings may be cancelled
- Can be reinstated later

**Steps:**
1. Find member in directory
2. Click action menu (...)
3. Select "Suspend"
4. Confirm action

### Removing a Member

**Who can remove:**
- Owners and managers (not owners)

**Steps:**
1. Find member in directory
2. Click action menu (...)
3. Select "Remove"
4. Confirm action

---

## Dues Management

### Dues Statuses

| Status | Description | Color |
|--------|-------------|-------|
| Paid | Dues current | Green |
| Unpaid | Not yet paid | Yellow |
| Overdue | Past due date | Red |
| Exempt | No dues required | Gray |

### Updating Dues Status

1. Find member in directory
2. Click to view/edit
3. Update dues fields:
   - Status
   - Paid until date
   - Amount
4. Save changes

### Dues Tracking

The system automatically:
- Shows unpaid count on dashboard
- Highlights overdue members
- Filters by dues status

---

## Member Statistics

The Members page shows:

| Stat | Description |
|------|-------------|
| Total | All members |
| Active | Active members |
| Dues Unpaid | Need payment |
| Admins | Managers + Owner |

---

## Profile Completeness

DeerCamp calculates profile completeness based on:

| Field | Weight |
|-------|--------|
| Display name | Required |
| Email | Required |
| Phone | 10% |
| Address | 10% |
| Emergency contact | 20% |
| Hunter safety | 15% |
| Bio | 10% |
| Preferred species | 10% |
| Preferred weapons | 10% |

---

## Best Practices

### For Club Owners

1. **Screen join requests**: Review profiles before approving
2. **Assign managers wisely**: Choose trusted members
3. **Track dues regularly**: Keep finances current
4. **Maintain accurate counts**: Update member count
5. **Document club rules**: Set clear expectations

### For Managers

1. **Welcome new members**: Send welcome message
2. **Monitor activity**: Check for inactive members
3. **Update statuses**: Keep member info current
4. **Handle issues promptly**: Address conflicts early
5. **Communicate changes**: Notify about club updates

### For Members

1. **Complete your profile**: Add contact and safety info
2. **Keep info current**: Update phone/address changes
3. **Pay dues on time**: Support the club
4. **Participate**: Book stands, log harvests, post
5. **Follow club rules**: Respect club policies

---

## Troubleshooting

### "Cannot invite member"

- Verify you have manager/owner role
- Check email is valid format
- Ensure not already a member

### "Cannot view members"

- Verify club is selected
- Check membership is active
- Try refreshing page

### Invite not received

- Check spam folder
- Verify email address
- Share invite link directly

### Member cannot access club

- Check membership status is "active"
- Verify approval status is "approved"
- Check for suspension

---

*Member Management documentation for DeerCamp*
