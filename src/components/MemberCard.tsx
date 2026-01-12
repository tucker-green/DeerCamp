import { motion } from 'framer-motion';
import { Mail, Phone, MoreVertical, Eye, Edit, UserMinus, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import type { UserProfile } from '../types';
import { RoleBadge, MembershipTierBadge, DuesStatusBadge, MemberStatusBadge } from './MemberBadges';
import { formatMemberSince } from '../utils/memberHelpers';

interface MemberCardProps {
    member: UserProfile;
    onView?: () => void;
    onEdit?: () => void;
    onPromote?: () => void;
    onDemote?: () => void;
    onSuspend?: () => void;
    canEdit?: boolean;
    canPromote?: boolean;
    canSuspend?: boolean;
}

export default function MemberCard({
    member,
    onView,
    onEdit,
    onPromote,
    onDemote,
    onSuspend,
    canEdit = false,
    canPromote = false,
    canSuspend = false
}: MemberCardProps) {
    const [showActions, setShowActions] = useState(false);

    // Get initials for avatar
    const initials = member.displayName
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all relative group"
        >
            {/* Actions Menu */}
            {(canEdit || canPromote || canSuspend) && (
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showActions && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute right-0 mt-2 w-48 bg-[#1a1d1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
                        >
                            {onView && (
                                <button
                                    onClick={() => {
                                        onView();
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                >
                                    <Eye size={14} />
                                    View Details
                                </button>
                            )}

                            {canEdit && onEdit && (
                                <button
                                    onClick={() => {
                                        onEdit();
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                >
                                    <Edit size={14} />
                                    Edit Profile
                                </button>
                            )}

                            {canPromote && onPromote && member.role !== 'owner' && (
                                <button
                                    onClick={() => {
                                        onPromote();
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-500/10 flex items-center gap-2"
                                >
                                    <TrendingUp size={14} />
                                    Promote
                                </button>
                            )}

                            {canPromote && onDemote && member.role !== 'member' && (
                                <button
                                    onClick={() => {
                                        onDemote();
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2"
                                >
                                    <TrendingDown size={14} />
                                    Demote
                                </button>
                            )}

                            {canSuspend && onSuspend && (
                                <button
                                    onClick={() => {
                                        onSuspend();
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5"
                                >
                                    <UserMinus size={14} />
                                    Suspend Member
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            )}

            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10">
                    {initials}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{member.displayName}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <RoleBadge role={member.role} size="sm" />
                        {member.membershipTier && (
                            <MembershipTierBadge tier={member.membershipTier} size="sm" />
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={14} className="text-gray-500" />
                    <span className="truncate">{member.email}</span>
                </div>

                {member.phone && (
                    <div className="flex items-center gap-2 text-gray-300">
                        <Phone size={14} className="text-gray-500" />
                        <span>{member.phone}</span>
                    </div>
                )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {member.membershipStatus && (
                    <MemberStatusBadge status={member.membershipStatus} size="sm" />
                )}
                {member.duesStatus && <DuesStatusBadge status={member.duesStatus} size="sm" />}
            </div>

            {/* Footer Info */}
            <div className="pt-4 border-t border-white/5 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                    <span>Member {formatMemberSince(member.joinDate)}</span>
                    {member.profileCompleteness !== undefined && (
                        <span className={`font-semibold ${
                            member.profileCompleteness >= 80 ? 'text-green-400' :
                            member.profileCompleteness >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                        }`}>
                            {member.profileCompleteness}% Complete
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
