import type { UserProfile, UserRole, MembershipTier, DuesStatus, MemberStatus, ClubMembership } from '../types';

// ==================== VALIDATION ====================

export function validateMemberData(data: Partial<UserProfile>): { valid: boolean; error?: string } {
    if (data.email && !validateEmail(data.email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    if (data.phone && !validatePhone(data.phone)) {
        return { valid: false, error: 'Invalid phone number format. Use (XXX) XXX-XXXX' };
    }

    if (data.displayName && data.displayName.trim().length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }

    return { valid: true };
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
    // Accepts formats: (555) 123-4567, 555-123-4567, 5551234567
    const phoneRegex = /^(\(\d{3}\)\s?|\d{3}[-.]?)?\d{3}[-.]?\d{4}$/;
    return phoneRegex.test(phone);
}

// ==================== PERMISSIONS ====================

// ===== NEW: Multi-Club Membership-Based Helpers =====

export function canPromoteMember(membership: ClubMembership, currentUserRole: UserRole): boolean {
    // Only owners can promote users
    if (currentUserRole !== 'owner') return false;

    // Can't promote owners (already at top)
    if (membership.role === 'owner') return false;

    return true;
}

export function canDemoteMember(membership: ClubMembership, currentUserRole: UserRole): boolean {
    // Only owners can demote users
    if (currentUserRole !== 'owner') return false;

    // Can't demote other owners
    if (membership.role === 'owner') return false;

    return true;
}

export function canSuspendMember(membership: ClubMembership, currentUserRole: UserRole): boolean {
    // Owners and managers can suspend
    if (currentUserRole !== 'owner' && currentUserRole !== 'manager') return false;

    // Can't suspend owners
    if (membership.role === 'owner') return false;

    // Already suspended
    if (membership.membershipStatus === 'suspended') return false;

    return true;
}

export function canEditMemberProfile(
    userId: string,
    currentUserId: string,
    currentUserRole: UserRole
): boolean {
    // Can edit own profile
    if (userId === currentUserId) return true;

    // Owners and managers can edit members
    if (currentUserRole === 'owner' || currentUserRole === 'manager') return true;

    return false;
}

export function canRemoveMember(membership: ClubMembership, currentUserRole: UserRole): boolean {
    // Only owners can remove members
    if (currentUserRole !== 'owner') return false;

    // Can't remove owners
    if (membership.role === 'owner') return false;

    return true;
}

export function canInviteMembers(currentUserRole: UserRole): boolean {
    return currentUserRole === 'owner' || currentUserRole === 'manager';
}

// ===== DEPRECATED: Legacy UserProfile-Based Helpers =====
// These are kept for backward compatibility during migration
// Use the ClubMembership-based versions above for new code

/** @deprecated Use canPromoteMember(membership, currentUserRole) instead */
export function canPromoteUser(member: UserProfile, currentUserRole: UserRole): boolean {
    if (currentUserRole !== 'owner') return false;
    if (member.role === 'owner') return false;
    return true;
}

/** @deprecated Use canDemoteMember(membership, currentUserRole) instead */
export function canDemoteUser(member: UserProfile, currentUserRole: UserRole): boolean {
    if (currentUserRole !== 'owner') return false;
    if (member.role === 'owner') return false;
    return true;
}

/** @deprecated Use canSuspendMember(membership, currentUserRole) instead */
export function canSuspendUser(member: UserProfile, currentUserRole: UserRole): boolean {
    if (currentUserRole !== 'owner' && currentUserRole !== 'manager') return false;
    if (member.role === 'owner') return false;
    if (member.membershipStatus === 'suspended') return false;
    return true;
}

/** @deprecated Use canEditMemberProfile(userId, currentUserId, currentUserRole) instead */
export function canEditMember(
    member: UserProfile,
    currentUserId: string,
    currentUserRole: UserRole
): boolean {
    if (member.uid === currentUserId) return true;
    if (currentUserRole === 'owner' || currentUserRole === 'manager') return true;
    return false;
}

/** @deprecated Use canRemoveMember(membership, currentUserRole) instead */
export function canDeleteMember(member: UserProfile, currentUserRole: UserRole): boolean {
    if (currentUserRole !== 'owner') return false;
    if (member.role === 'owner') return false;
    return true;
}

// ==================== FORMATTING ====================

export function formatMemberSince(joinDate: string): string {
    const date = new Date(joinDate);
    const now = new Date();
    const monthsAgo = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

    if (monthsAgo < 1) return 'Less than a month';
    if (monthsAgo < 12) return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;

    const yearsAgo = Math.floor(monthsAgo / 12);
    return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
}

export function getMembershipBadge(tier: MembershipTier): { label: string; color: string; bgColor: string } {
    const badges = {
        full: {
            label: 'Full Member',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        },
        family: {
            label: 'Family Member',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20'
        },
        youth: {
            label: 'Youth Member',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        },
        guest: {
            label: 'Guest',
            color: 'text-gray-400',
            bgColor: 'bg-gray-500/20'
        }
    };

    return badges[tier];
}

export function getRoleBadge(role: UserRole): { label: string; color: string; bgColor: string; icon: string } {
    const badges = {
        owner: {
            label: 'Owner',
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/20',
            icon: '👑'
        },
        manager: {
            label: 'Manager',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20',
            icon: '🏅'
        },
        member: {
            label: 'Member',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20',
            icon: '👤'
        }
    };

    return badges[role];
}

export function getDuesStatusBadge(status: DuesStatus): { label: string; color: string; bgColor: string } {
    const badges = {
        paid: {
            label: 'Dues Paid',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        },
        unpaid: {
            label: 'Dues Unpaid',
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20'
        },
        overdue: {
            label: 'Overdue',
            color: 'text-red-400',
            bgColor: 'bg-red-500/20'
        },
        exempt: {
            label: 'Exempt',
            color: 'text-gray-400',
            bgColor: 'bg-gray-500/20'
        }
    };

    return badges[status];
}

export function getMemberStatusBadge(status: MemberStatus): { label: string; color: string; bgColor: string } {
    const badges = {
        active: {
            label: 'Active',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        },
        inactive: {
            label: 'Inactive',
            color: 'text-gray-400',
            bgColor: 'bg-gray-500/20'
        },
        suspended: {
            label: 'Suspended',
            color: 'text-red-400',
            bgColor: 'bg-red-500/20'
        }
    };

    return badges[status];
}

// ==================== BUSINESS LOGIC ====================

export function checkDuesStatus(duesPaidUntil?: string): DuesStatus {
    if (!duesPaidUntil) return 'unpaid';

    const paidUntilDate = new Date(duesPaidUntil);
    const now = new Date();

    // Dues are overdue if past the date
    if (paidUntilDate < now) return 'overdue';

    return 'paid';
}

export function calculateProfileCompleteness(profile: UserProfile): number {
    let score = 0;

    // Basic info (40 points)
    if (profile.displayName) score += 10;
    if (profile.email) score += 10;
    if (profile.phone) score += 10;
    if (profile.bio) score += 10;

    // Address (15 points)
    if (profile.address) score += 15;

    // Emergency contact (20 points)
    if (profile.emergencyContact) score += 20;

    // Hunter safety cert (20 points)
    if (profile.hunterSafetyCert) score += 20;

    // Avatar (5 points)
    if (profile.avatar) score += 5;

    return Math.min(score, 100);
}

export function generateInviteCode(): string {
    // Use uppercase letters and numbers, avoid confusing characters (0, O, I, 1)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';

    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

export function getInviteExpirationDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date.toISOString();
}

export function isInviteExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
}

export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return phone; // Return original if not 10 digits
}

// ==================== SEARCH & FILTER ====================

export function searchMembers(members: UserProfile[], searchTerm: string): UserProfile[] {
    if (!searchTerm.trim()) return members;

    const term = searchTerm.toLowerCase();

    return members.filter(member =>
        member.displayName.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        (member.phone && member.phone.includes(term))
    );
}

export function filterMembersByRole(members: UserProfile[], role?: UserRole): UserProfile[] {
    if (!role) return members;
    return members.filter(member => member.role === role);
}

export function filterMembersByStatus(members: UserProfile[], status?: MemberStatus): UserProfile[] {
    if (!status) return members;
    return members.filter(member => member.membershipStatus === status);
}

export function filterMembersByDuesStatus(members: UserProfile[], duesStatus?: DuesStatus): UserProfile[] {
    if (!duesStatus) return members;
    return members.filter(member => member.duesStatus === duesStatus);
}

// ==================== STATS ====================

export function getMemberStats(members: UserProfile[]): {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    duesPaid: number;
    duesUnpaid: number;
    byRole: Record<UserRole, number>;
    byTier: Record<MembershipTier, number>;
} {
    const stats = {
        total: members.length,
        active: 0,
        inactive: 0,
        suspended: 0,
        duesPaid: 0,
        duesUnpaid: 0,
        byRole: {
            owner: 0,
            manager: 0,
            member: 0
        } as Record<UserRole, number>,
        byTier: {
            full: 0,
            family: 0,
            youth: 0,
            guest: 0
        } as Record<MembershipTier, number>
    };

    members.forEach(member => {
        // Count by status
        if (member.membershipStatus === 'active') stats.active++;
        else if (member.membershipStatus === 'inactive') stats.inactive++;
        else if (member.membershipStatus === 'suspended') stats.suspended++;

        // Count by dues status
        if (member.duesStatus === 'paid') stats.duesPaid++;
        else stats.duesUnpaid++;

        // Count by role
        stats.byRole[member.role]++;

        // Count by tier
        if (member.membershipTier) {
            stats.byTier[member.membershipTier]++;
        }
    });

    return stats;
}
