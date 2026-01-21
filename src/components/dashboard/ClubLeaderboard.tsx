import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClubLeaderboard } from '../../hooks/useHarvests';

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown size={16} className="text-amber-400" />;
    case 2:
      return <Medal size={16} className="text-gray-300" />;
    case 3:
      return <Award size={16} className="text-amber-600" />;
    default:
      return <span className="text-xs text-gray-500 w-4 text-center">{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-amber-500/10 border-amber-500/20';
    case 2:
      return 'bg-gray-500/10 border-gray-500/20';
    case 3:
      return 'bg-amber-700/10 border-amber-700/20';
    default:
      return 'bg-white/5 border-white/10';
  }
};

const ClubLeaderboard = () => {
  const { leaderboard, records, loading } = useClubLeaderboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 rounded-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          <h3 className="text-lg font-bold text-white">Season Leaders</h3>
        </div>
        <button
          onClick={() => navigate('/trophy-book')}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1"
        >
          Trophy Book
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-6">
          <Target size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No harvests recorded yet</p>
          <p className="text-gray-600 text-xs mt-1">Be the first on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Top harvesters */}
          <div className="space-y-2 mb-4">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: index * 0.1 } }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${getRankStyle(index + 1)}`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  {getRankIcon(index + 1)}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {entry.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.totalWeight > 0 && `${entry.totalWeight} lbs total`}
                  </p>
                </div>

                {/* Count */}
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{entry.harvestCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase">harvests</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Club Records */}
          {records.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Season Records
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {records.slice(0, 2).map((record, index) => (
                  <motion.div
                    key={record.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + index * 0.1 } }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                  >
                    <Trophy size={14} className="text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase">{record.label}</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {record.value}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        by {record.harvest.userName}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ClubLeaderboard;
