export type UserRole = 'owner' | 'manager' | 'member';
export type MembershipTier = 'full' | 'family' | 'youth' | 'guest';
export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type DuesStatus = 'paid' | 'unpaid' | 'overdue' | 'exempt';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;

    // Multi-Club Support
    clubIds: string[];           // Array of all clubs user belongs to
    activeClubId?: string;       // Currently selected club
    clubId?: string;             // DEPRECATED: Keep for backward compatibility during migration

    // Legacy role field - role is now per-club in ClubMembership
    role?: UserRole;             // DEPRECATED: Keep for backward compatibility
    joinDate: string;

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

    // Profile Enhancements
    avatar?: string;
    bio?: string;

    // Audit Fields
    lastActive?: string;
    profileCompleteness?: number; // 0-100%
    createdAt?: string;
    isSuperAdmin?: boolean;      // System-wide admin access
    isBanned?: boolean;          // Banned from platform
}

export interface Club {
    id: string;
    name: string;
    description?: string;
    ownerId: string;

    // Visibility & Discovery
    isPublic: boolean;           // Can be discovered by non-members
    requiresApproval: boolean;   // Join requests need approval

    // Location
    location?: {
        city?: string;
        state?: string;
        lat?: number;
        lng?: number;
    };

    // Media
    coverPhoto?: string;
    photos?: string[];

    // Capacity
    memberCount: number;
    maxMembers?: number;

    // Classification
    tags?: string[];             // e.g., ["whitetail", "turkey", "family-friendly"]
    propertyAcres?: number;

    // Settings
    allowGuests: boolean;
    guestPolicy?: string;

    // Rules
    rules?: string;

    // Audit
    createdAt: string;
    updatedAt?: string;

    // DEPRECATED: Keep for backward compatibility
    members?: string[];
}

// Club Membership (junction table for user-club relationships)
export interface ClubMembership {
    id: string;
    userId: string;
    clubId: string;

    // Role & Status
    role: UserRole;              // owner, manager, member
    membershipTier: MembershipTier;
    membershipStatus: MemberStatus;
    approvalStatus: ApprovalStatus;

    // Dues Tracking (per-club)
    duesStatus?: DuesStatus;
    duesPaidUntil?: string;
    lastDuesPayment?: string;

    // Lifecycle
    joinDate: string;
    invitedBy?: string;          // uid
    approvedBy?: string;         // uid
    lastActive?: string;

    // Audit
    createdAt: string;
    updatedAt?: string;
}

// Member with club-specific data (for display in member lists)
// This combines UserProfile with ClubMembership properties for convenience
export interface MemberWithClubData extends UserProfile {
    role: UserRole;
    membershipTier: MembershipTier;
    membershipStatus: MemberStatus;
    approvalStatus: ApprovalStatus;
    duesStatus?: DuesStatus;
    duesPaidUntil?: string;
    lastDuesPayment?: string;
    invitedBy?: string;
    approvedBy?: string;
}

// Club Join Request (for public clubs requiring approval)
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ClubJoinRequest {
    id: string;
    userId: string;
    userName: string;            // Cached for display
    userEmail: string;           // Cached for display
    clubId: string;
    clubName: string;            // Cached for display

    // Request Details
    message?: string;            // Why they want to join
    status: JoinRequestStatus;

    // Lifecycle
    createdAt: string;
    reviewedBy?: string;         // uid
    reviewedByName?: string;     // Cached for display
    reviewedAt?: string;
    rejectionReason?: string;
}

export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface Stand {
    id: string;
    clubId: string;                // Club this stand belongs to
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
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
}

// Property Boundary (polygon)
export interface PropertyBoundary {
    id: string;
    clubId: string;
    name: string;
    coordinates: [number, number][]; // Array of [lng, lat] pairs for polygon
    acres?: number;
    ownerName?: string; // Name of the property owner
    color?: string; // Hex color for map display
    strokeWidth?: number;
    fillOpacity?: number;
    boundaryType: 'property' | 'neighbor' | 'public-land' | 'buffer-zone';
    notes?: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

// Public Parcel Boundary (from county records - like OnX Maps)
export interface ParcelBoundary {
    id: string;
    parcelId: string;             // County parcel ID/APN
    owner: string;                // Property owner name(s)
    ownerAddress?: string;        // Owner mailing address
    coordinates: [number, number][][]; // MultiPolygon coordinates
    centroid: [number, number];   // Center point for label placement
    acres: number;
    county: string;
    state: string;
    legalDescription?: string;
    assessedValue?: number;
    lastSaleDate?: string;
    lastSalePrice?: number;
    zoning?: string;
    landUse?: string;
    source: 'county-gis' | 'regrid' | 'manual';
    fetchedAt: string;            // When data was retrieved
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

export type WeaponType = 'rifle' | 'bow' | 'crossbow' | 'muzzleloader' | 'shotgun' | 'handgun';
export type ShotPlacement = 'heart' | 'lungs' | 'double-lung' | 'liver' | 'gut' | 'neck' | 'head' | 'shoulder' | 'quartering';

export interface Harvest {
    id: string;
    clubId: string;            // Club where harvest occurred
    userId: string;
    userName: string;
    date: string;
    species: 'deer' | 'turkey' | 'hog' | 'bear' | 'elk' | 'other';
    sex?: 'male' | 'female';

    // Basic Weight Data
    weight?: number;           // Live weight (lbs)
    dressedWeight?: number;    // Field dressed weight (lbs)

    // Photos
    photoUrl?: string;         // DEPRECATED: Use photos array
    photos?: string[];         // Multiple photos

    // Location
    standId?: string;
    standName?: string;        // Cached for display
    lat?: number;
    lng?: number;              // GPS coordinates

    // Hunt Details
    weaponType?: WeaponType;
    distance?: number;         // Shot distance in yards
    shotPlacement?: ShotPlacement;
    timeOfDay?: 'morning' | 'midday' | 'evening' | 'night';
    weather?: {
        temp?: number;         // Fahrenheit
        windSpeed?: number;    // mph
        windDirection?: WindDirection;
        conditions?: string;   // Sunny, cloudy, rainy, etc.
    };

    // Deer-Specific Measurements
    deerData?: {
        points?: number;       // Antler points
        spread?: number;       // Inside spread (inches)
        mainBeamLength?: number;  // Longest main beam (inches)
        baseCircumference?: number; // Base circumference (inches)
        grossScore?: number;   // Gross B&C or P&Y score
        netScore?: number;     // Net score after deductions
        estimatedAge?: number; // Age in years (from teeth/body)
        antlerPhoto?: string;  // Close-up of antlers
    };

    // Turkey-Specific Measurements
    turkeyData?: {
        beardLength?: number;  // Beard length (inches)
        spurLength?: number;   // Longest spur (inches)
        weight?: number;       // Weight (lbs)
        estimatedAge?: number; // Age in years
    };

    // Hog-Specific Measurements
    hogData?: {
        tuskLength?: number;   // Longest tusk (inches)
        estimatedAge?: number;
    };

    // Legal/Compliance
    tagNumber?: string;        // Hunting tag/permit number
    harvestReported?: boolean; // Reported to state wildlife agency
    reportDate?: string;

    // Processing
    processingNotes?: string;  // Butchering notes
    mountType?: 'shoulder' | 'european' | 'full-body' | 'none';
    taxidermist?: string;

    // General Notes
    notes?: string;
    story?: string;            // Detailed hunt story

    // Audit
    createdAt?: string;
    updatedAt?: string;

    // Club Records
    isClubRecord?: boolean;    // Flagged as club record
    recordCategory?: string;   // "Biggest Buck", "Heaviest Deer", etc.
}

export type BookingStatus = 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
export type HuntType = 'morning' | 'evening' | 'all-day';

export interface Booking {
    id: string;
    clubId: string;            // Club this booking belongs to
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

// ==================== PHASE 5: ACTIVITY FEED & COMMUNICATION ====================

export type PostType = 'text' | 'harvest' | 'announcement' | 'event';
export type ReactionType = '👍' | '❤️' | '🔥' | '🦌' | '🎯' | '💯';
export type RSVPStatus = 'going' | 'maybe' | 'not-going';

// Post (feed item)
export interface Post {
    id: string;
    clubId: string;
    userId: string;
    userName: string;          // Cached for display
    userAvatar?: string;       // Cached for display
    type: PostType;

    // Content
    content: string;
    photos?: string[];

    // Links to other entities
    harvestId?: string;        // If type === 'harvest'
    eventId?: string;          // If type === 'event'

    // Announcement-specific
    isPinned?: boolean;        // Only for announcements
    pinnedUntil?: string;      // Auto-unpin after date

    // Engagement
    commentCount: number;
    reactions: Record<ReactionType, number>; // Count of each reaction type

    // Audit
    createdAt: string;
    updatedAt?: string;
    editedAt?: string;         // Show "edited" badge if present
}

// Comment on a post
export interface Comment {
    id: string;
    postId: string;
    clubId: string;
    userId: string;
    userName: string;          // Cached for display
    userAvatar?: string;       // Cached for display

    // Content
    content: string;

    // Replies (nested comments)
    parentCommentId?: string;  // If replying to another comment
    replyCount: number;

    // Engagement
    reactions: Record<ReactionType, number>;

    // Audit
    createdAt: string;
    updatedAt?: string;
    editedAt?: string;
}

// Reports for moderation
export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
    id: string;
    clubId: string;
    reporterId: string;
    reporterName: string;
    targetType: 'post' | 'comment';
    targetId: string;
    targetUserId: string;
    targetUserName: string;
    reason: ReportReason;
    details?: string;
    status: ReportStatus;
    createdAt: string;
    updatedAt?: string;
    resolvedBy?: string;
    resolvedByName?: string;
}

// Reaction to a post or comment
export interface Reaction {
    id: string;
    targetType: 'post' | 'comment';
    targetId: string;          // postId or commentId
    clubId: string;
    userId: string;
    userName: string;          // Cached for display
    reactionType: ReactionType;
    createdAt: string;
}

// Event (club gathering, work day, etc.)
export interface Event {
    id: string;
    clubId: string;

    // Created by
    createdBy: string;         // userId
    createdByName: string;     // Cached for display

    // Event details
    title: string;
    description?: string;
    location?: string;

    // Timing
    startTime: string;         // ISO string
    endTime: string;           // ISO string
    allDay: boolean;

    // RSVP tracking
    rsvpEnabled: boolean;
    maxAttendees?: number;     // Capacity limit
    goingCount: number;
    maybeCount: number;
    notGoingCount: number;

    // Visibility
    isPublic: boolean;         // Visible to non-members?

    // Audit
    createdAt: string;
    updatedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
}

// RSVP to an event
export interface EventRSVP {
    id: string;
    eventId: string;
    clubId: string;
    userId: string;
    userName: string;          // Cached for display
    status: RSVPStatus;
    note?: string;             // Optional message with RSVP
    createdAt: string;
    updatedAt?: string;
}
