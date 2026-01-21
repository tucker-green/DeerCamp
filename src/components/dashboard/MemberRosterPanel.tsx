import { motion } from 'framer-motion';
import type { MemberWithClubData } from '../../types';

interface MemberRosterPanelProps {
  members: MemberWithClubData[];
  loading?: boolean;
}

const MemberRosterPanel = ({ members, loading }: MemberRosterPanelProps) => {
  // Get role display label
  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      owner: 'PRESIDENT',
      manager: 'MANAGER',
      member: 'MEMBER'
    };
    return roleLabels[role] || 'MEMBER';
  };

  // Check if member was active recently (within last 24 hours)
  const isRecentlyActive = (lastActive?: string) => {
    if (!lastActive) return false;
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  // Sort members: owners first, then managers, then by name
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, manager: 1, member: 2 };
    const aOrder = roleOrder[a.role] ?? 2;
    const bOrder = roleOrder[b.role] ?? 2;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.displayName || '').localeCompare(b.displayName || '');
  });

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10"
      >
        <div className="h-6 w-36 bg-white/10 rounded animate-pulse mb-5" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-28 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-5">Member Roster</h3>

      {/* Member list */}
      <div className="space-y-3">
        {sortedMembers.length === 0 ? (
          <p className="text-gray-500 text-sm">No members found</p>
        ) : (
          sortedMembers.slice(0, 6).map((member, i) => {
            const isActive = isRecentlyActive(member.lastActive);
            
            return (
              <motion.div
                key={member.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 group"
              >
                {/* Avatar with status indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center overflow-hidden">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {member.displayName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  {/* Online indicator */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0c08] ${
                      isActive ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  />
                </div>

                {/* Name and role */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {member.displayName || 'Unknown Member'}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    member.role === 'owner' 
                      ? 'text-amber-400' 
                      : member.role === 'manager'
                      ? 'text-blue-400'
                      : 'text-emerald-400'
                  }`}>
                    {getRoleLabel(member.role)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Show more indicator if there are more members */}
      {members.length > 6 && (
        <p className="text-xs text-gray-500 text-center mt-4">
          +{members.length - 6} more members
        </p>
      )}
    </motion.div>
  );
};

export default MemberRosterPanel;
