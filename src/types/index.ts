export type UserRole = 'owner' | 'manager' | 'member';
export type MembershipTier = 'full' | 'family' | 'youth' | 'guest';
export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type DuesStatus = 'paid' | 'unpaid' | 'overdue' | 'exempt';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    clubId?: string;
    joinDate: string;

    // Member Management
    membershipTier?: MembershipTier;
    membershipStatus?: MemberStatus;
    approvalStatus?: ApprovalStatus;

    // Contact Information
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };

    // Emergency Contact
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };

    // Hunter Safety
    hunterSafetyCert?: {
        number: string;
        expirationDate: string;
        verified: boolean;
    };

    // Dues Tracking
    duesStatus?: DuesStatus;
    duesPaidUntil?: string;
    lastDuesPayment?: string;

    // Profile Enhancements
    avatar?: string;
    bio?: string;

    // Audit Fields
    invitedBy?: string;
    approvedBy?: string;
    lastActive?: string;
    profileCompleteness?: number; // 0-100%
}

export interface Club {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    location: {
        lat: number;
        lng: number;
        address: string;
    };
}

export interface Stand {
    id: string;
    name: string;
    type: 'ladder' | 'climber' | 'blind' | 'box';
    lat: number;
    lng: number;
    status: 'available' | 'reserved' | 'occupied' | 'maintenance';
}

export interface Harvest {
    id: string;
    userId: string;
    userName: string;
    date: string;
    species: 'deer' | 'turkey' | 'pigs' | 'other';
    sex?: 'male' | 'female';
    weight?: number;
    photoUrl?: string;
    standId?: string;
    notes?: string;
}

export type BookingStatus = 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
export type HuntType = 'morning' | 'evening' | 'all-day';

export interface Booking {
    id: string;
    standId: string;
    userId: string;
    userName: string;          // Cached for display
    standName: string;         // Cached for display
    startTime: string;         // ISO string
    endTime: string;           // ISO string
    status: BookingStatus;
    huntType?: HuntType;
    notes?: string;
    checkInTime?: string;
    checkOutTime?: string;
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string;
    cancellationReason?: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface Invite {
    id: string;
    email: string;
    role: UserRole;
    membershipTier: MembershipTier;
    clubId: string;

    // Invitation Details
    invitedBy: string;         // uid
    invitedByName: string;     // cached
    message?: string;

    // Status & Lifecycle
    status: InviteStatus;
    createdAt: string;
    expiresAt: string;         // 7 days from creation
    acceptedAt?: string;
    cancelledAt?: string;

    // Invite Code
    inviteCode: string;        // unique 8-char code
}
