import { motion } from 'framer-motion';
import type { Harvest } from '../../types';

interface RecentActivityFeedProps {
  harvests: Harvest[];
  loading?: boolean;
}

const RecentActivityFeed = ({ harvests, loading }: RecentActivityFeedProps) => {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  // Get species display name
  const getSpeciesDisplay = (species: string, sex?: string) => {
    const speciesNames: Record<string, string> = {
      deer: sex === 'male' ? 'Whitetail Buck' : sex === 'female' ? 'Whitetail Doe' : 'Whitetail Deer',
      turkey: 'Turkey',
      hog: 'Wild Hog',
      bear: 'Black Bear',
      elk: 'Elk',
      other: 'Other'
    };
    return speciesNames[species] || species;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10"
      >
        <div className="h-6 w-36 bg-white/10 rounded animate-pulse mb-5" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-28 bg-white/10 rounded animate-pulse mb-2" />
                <div className="h-3 w-36 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
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
      <h3 className="text-lg sm:text-xl font-bold text-white mb-5">Recent Activity</h3>

      {/* Harvest list */}
      <div className="space-y-3">
        {harvests.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent harvests recorded</p>
        ) : (
          harvests.slice(0, 5).map((harvest, i) => (
            <motion.div
              key={harvest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600/30 to-emerald-800/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {harvest.photos && harvest.photos[0] ? (
                  <img 
                    src={harvest.photos[0]} 
                    alt={getSpeciesDisplay(harvest.species, harvest.sex)}
                    className="w-full h-full object-cover"
                  />
                ) : harvest.photoUrl ? (
                  <img 
                    src={harvest.photoUrl} 
                    alt={getSpeciesDisplay(harvest.species, harvest.sex)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">
                    {harvest.species === 'deer' ? '🦌' : 
                     harvest.species === 'turkey' ? '🦃' : 
                     harvest.species === 'hog' ? '🐗' : '🎯'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {getSpeciesDisplay(harvest.species, harvest.sex)}
                </p>
                <p className="text-xs text-emerald-400 truncate">
                  {harvest.userName} &bull; {formatDate(harvest.date)}
                </p>
              </div>

              {/* Weight and points */}
              <div className="text-right flex-shrink-0">
                {harvest.weight && (
                  <p className="text-sm font-bold text-emerald-400">{harvest.weight} lbs</p>
                )}
                {harvest.species === 'deer' && harvest.deerData?.points && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {harvest.deerData.points} point rack
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivityFeed;
