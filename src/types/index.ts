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

export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface Stand {
    id: string;
    name: string;
    type: 'ladder' | 'climber' | 'blind' | 'box';
    lat: number;
    lng: number;
    status: 'available' | 'reserved' | 'occupied' | 'maintenance';

    // Map-specific fields
    description?: string;
    photos?: string[];
    heightFeet?: number;
    capacity?: number;
    bestWindDirections?: WindDirection[];
    condition?: 'excellent' | 'good' | 'fair' | 'needs-repair';
    notes?: string;
    updatedAt?: string;
}

// Property Boundary (polygon)
export interface PropertyBoundary {
    id: string;
    clubId: string;
    name: string;
    coordinates: [number, number][]; // Array of [lng, lat] pairs for polygon
    acres?: number;
    color?: string; // Hex color for map display
    strokeWidth?: number;
    fillOpacity?: number;
    boundaryType: 'property' | 'neighbor' | 'public-land' | 'buffer-zone';
    notes?: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

// Food Plot (polygon)
export interface FoodPlot {
    id: string;
    clubId: string;
    name: string;
    coordinates: [number, number][]; // Polygon coordinates
    acres: number;
    plantedWith?: string; // Crop type (clover, corn, beans, etc.)
    plantDate?: string;
    expectedMaturity?: string;
    lastMaintenance?: string;
    notes?: string;
    photos?: string[];
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

// Access Route (line/path)
export type AccessRouteType = 'road' | 'atv-trail' | 'walking-path' | 'quiet-approach';

export interface AccessRoute {
    id: string;
    clubId: string;
    name: string;
    type: AccessRouteType;
    coordinates: [number, number][]; // Line path
    lengthYards?: number;
    difficulty?: 'easy' | 'moderate' | 'difficult';
    seasonal?: boolean; // Only passable certain times of year
    seasonalNotes?: string; // "Creek crossing - summer only"
    notes?: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

// Terrain Feature (point marker)
export type TerrainFeatureType =
    | 'water-source'
    | 'bedding-area'
    | 'oak-grove'
    | 'thicket'
    | 'ridge-line'
    | 'funnel'
    | 'scrape-area'
    | 'rub-line'
    | 'kill-zone';

export interface TerrainFeature {
    id: string;
    clubId: string;
    name: string;
    type: TerrainFeatureType;
    lat: number;
    lng: number;
    description?: string;
    radius?: number; // For area features (in yards)
    season?: string; // When this is active/relevant
    photos?: string[];
    notes?: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

// Trail Camera
export interface TrailCamera {
    id: string;
    clubId: string;
    name: string;
    lat: number;
    lng: number;
    model?: string;
    installDate?: string;
    lastChecked?: string;
    batteryLevel?: number; // 0-100
    sdCardSpace?: number; // Percentage remaining
    photoCount?: number;
    notes?: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

// Map Layer Visibility Settings
export interface MapLayerSettings {
    userId: string;
    visibleLayers: {
        stands: boolean;
        propertyBoundaries: boolean;
        foodPlots: boolean;
        accessRoutes: boolean;
        terrainFeatures: boolean;
        trailCameras: boolean;
        distanceRings: boolean;
        topography: boolean;
        windOverlay: boolean;
    };
    distanceRingRadii: number[]; // e.g., [200, 300, 400] yards
    selectedStandForRings?: string; // Stand ID to show rings around
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
