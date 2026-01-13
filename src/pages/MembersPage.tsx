import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Search, UserPlus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAllMembers } from '../hooks/useMembers';
import MemberCard from '../components/MemberCard';
import { searchMembers, getMemberStats, canInviteMembers, canEditMemberProfile, canPromoteMember } from '../utils/memberHelpers';
import type { UserRole, MemberStatus, ClubMembership } from '../types';
import NoClubSelected from '../components/NoClubSelected';

export default function MembersPage() {
    const navigate = useNavigate();
    const { user, activeClubId, activeMembership } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');

    // Show empty state if no club selected
    if (!activeClubId) {
        return <NoClubSelected title="No Club Selected" message="Select or join a club to view and manage members." />;
    }

    // Fetch members
    const { members, loading, error } = useAllMembers(activeClubId);

    // Filter members
    let filteredMembers = members;

    // Apply search
    if (searchTerm) {
        filteredMembers = searchMembers(filteredMembers, searchTerm);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
        filteredMembers = filteredMembers.filter(m => m.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
        filteredMembers = filteredMembers.filter(m => m.membershipStatus === statusFilter);
    }

    // Get stats
    const stats = getMemberStats(members);

    // Check permissions
    const canInvite = activeMembership ? canInviteMembers(activeMembership.role) : false;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-lg">Loading members...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
                    Error loading members: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                        <UsersIcon className="text-green-400" size={36} />
                        Members
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your club members and invitations</p>
                </div>

                {canInvite && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/members/invite')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Invite Member
                    </motion.button>
                )}
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-sm text-gray-400">Total Members</div>
                </div>

                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                    <div className="text-sm text-gray-400">Active</div>
                </div>

                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400">{stats.duesUnpaid}</div>
                    <div className="text-sm text-gray-400">Dues Unpaid</div>
                </div>

                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-400">
                        {stats.byRole.owner + stats.byRole.manager}
                    </div>
                    <div className="text-sm text-gray-400">Admins</div>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 rounded-2xl space-y-4"
            >
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search members by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <Filter size={16} className="text-gray-500 flex-shrink-0" />

                    {/* Role Filters */}
                    <button
                        onClick={() => setRoleFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                            roleFilter === 'all'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        All ({stats.total})
                    </button>

                    <button
                        onClick={() => setRoleFilter('owner')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                            roleFilter === 'owner'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Owners ({stats.byRole.owner})
                    </button>

                    <button
                        onClick={() => setRoleFilter('manager')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                            roleFilter === 'manager'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Managers ({stats.byRole.manager})
                    </button>

                    <button
                        onClick={() => setRoleFilter('member')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                            roleFilter === 'member'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Members ({stats.byRole.member})
                    </button>

                    <div className="w-px h-8 bg-white/10 flex-shrink-0" />

                    {/* Status Filters */}
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                            statusFilter === 'active'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Active ({stats.active})
                    </button>

                    <button
                        onClick={() => setStatusFilter('inactive')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                            statusFilter === 'inactive'
                                ? 'bg-gray-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        Inactive ({stats.inactive})
                    </button>
                </div>
            </motion.div>

            {/* Members Grid */}
            {filteredMembers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-panel p-12 rounded-2xl text-center"
                >
                    <UsersIcon size={64} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No members found</h3>
                    <p className="text-gray-400">
                        {searchTerm
                            ? 'Try adjusting your search or filters'
                            : 'Invite members to get started'}
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {filteredMembers.map((member, index) => {
                        // Create ClubMembership object for permission checks
                        const membershipData: ClubMembership = {
                            id: '',
                            userId: member.uid,
                            clubId: activeClubId || '',
                            role: member.role,
                            membershipStatus: member.membershipStatus || 'active',
                            approvalStatus: member.approvalStatus || 'approved',
                            duesStatus: member.duesStatus || 'paid',
                            membershipTier: member.membershipTier || 'standard',
                            joinDate: member.joinDate || new Date().toISOString(),
                            createdAt: member.createdAt || new Date().toISOString()
                        };

                        return (
                            <motion.div
                                key={member.uid}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <MemberCard
                                    member={member}
                                    onView={() => navigate(`/members/${member.uid}`)}
                                    onEdit={() => navigate(`/members/${member.uid}/edit`)}
                                    canEdit={user && activeMembership ? canEditMemberProfile(member.uid, user.uid, activeMembership.role) : false}
                                    canPromote={activeMembership ? canPromoteMember(membershipData, activeMembership.role) : false}
                                    canSuspend={activeMembership ? (activeMembership.role === 'owner' || activeMembership.role === 'manager') && member.role !== 'owner' : false}
                                />
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
