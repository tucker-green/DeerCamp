export type UserRole = 'owner' | 'manager' | 'member';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    clubId?: string;
    joinDate: string;
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
