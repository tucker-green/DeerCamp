import { UserRole, MembershipTier, DuesStatus, MemberStatus } from '../types';
import { getRoleBadge, getMembershipBadge, getDuesStatusBadge, getMemberStatusBadge } from '../utils/memberHelpers';

interface RoleBadgeProps {
    role: UserRole;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

export function RoleBadge({ role, size = 'md', showIcon = true }: RoleBadgeProps) {
    const badge = getRoleBadge(role);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full ${badge.bgColor} ${badge.color} font-bold ${sizeClasses[size]} border border-white/10`}
        >
            {showIcon && <span>{badge.icon}</span>}
            <span>{badge.label}</span>
        </span>
    );
}

interface MembershipTierBadgeProps {
    tier: MembershipTier;
    size?: 'sm' | 'md' | 'lg';
}

export function MembershipTierBadge({ tier, size = 'md' }: MembershipTierBadgeProps) {
    const badge = getMembershipBadge(tier);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full ${badge.bgColor} ${badge.color} font-semibold ${sizeClasses[size]} border border-white/10`}
        >
            {badge.label}
        </span>
    );
}

interface DuesStatusBadgeProps {
    status: DuesStatus;
    size?: 'sm' | 'md' | 'lg';
}

export function DuesStatusBadge({ status, size = 'md' }: DuesStatusBadgeProps) {
    const badge = getDuesStatusBadge(status);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full ${badge.bgColor} ${badge.color} font-semibold ${sizeClasses[size]} border border-white/10`}
        >
            {badge.label}
        </span>
    );
}

interface MemberStatusBadgeProps {
    status: MemberStatus;
    size?: 'sm' | 'md' | 'lg';
}

export function MemberStatusBadge({ status, size = 'md' }: MemberStatusBadgeProps) {
    const badge = getMemberStatusBadge(status);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full ${badge.bgColor} ${badge.color} font-semibold ${sizeClasses[size]} border border-white/10`}
        >
            {badge.label}
        </span>
    );
}
