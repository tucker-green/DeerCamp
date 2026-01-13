import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClubRecords, getHarvestStats, type ClubRecord } from '../utils/trophyRecords';
import NoClubSelected from '../components/NoClubSelected';

export default function TrophyBookPage() {
  const { activeClubId } = useAuth();
  const [records, setRecords] = useState<ClubRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  useEffect(() => {
    if (!activeClubId) {
      setLoading(false);
      return;
    }

    loadData();
  }, [activeClubId, selectedSeason]);

  async function loadData() {
    setLoading(true);
    try {
      const [recordsData, statsData] = await Promise.all([
        getClubRecords(activeClubId!),
        getHarvestStats(activeClubId!, selectedSeason === 'all' ? undefined : selectedSeason)
      ]);

      setRecords(recordsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading trophy data:', err);
    } finally {
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const seasons = ['all', currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];

  // Show empty state if no club selected
  if (!activeClubId) {
    return <NoClubSelected title="No Club Selected" message="Select or join a club to view trophy records and club leaderboards." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c08] pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c08] pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Trophy className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Trophy Book</h1>
              <p className="text-gray-400 mt-1">Club records and harvest statistics</p>
            </div>
          </div>

          {/* Season Filter */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
            {seasons.map(season => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedSeason === season
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {season === 'all' ? 'All Time' : season}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-400" size={20} />
                <span className="text-sm text-gray-400">Total Harvests</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🦌</span>
                <span className="text-sm text-gray-400">Deer</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.bySpecies.deer}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.bySex.male} Bucks • {stats.bySex.female} Does
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🦃</span>
                <span className="text-sm text-gray-400">Turkey</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.bySpecies.turkey}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🐗</span>
                <span className="text-sm text-gray-400">Hogs</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.bySpecies.hog}</p>
            </motion.div>
          </div>
        )}

        {/* Club Records */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-yellow-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Club Records</h2>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto text-gray-600 mb-4" size={64} />
              <p className="text-gray-400 text-lg">No club records yet</p>
              <p className="text-gray-500 text-sm mt-2">Records will appear as harvests are logged with measurements</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((record, index) => (
                <motion.div
                  key={record.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 relative overflow-hidden"
                >
                  {/* Trophy Icon */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <Trophy size={48} className="text-yellow-400" />
                  </div>

                  {/* Record Title */}
                  <h3 className="text-lg font-bold text-white mb-1">{record.title}</h3>
                  <p className="text-xs text-gray-400 mb-4">{record.description}</p>

                  {/* Record Value */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-yellow-400">
                      {record.value}
                    </span>
                    <span className="text-lg text-gray-400">{record.unit}</span>
                  </div>

                  {/* Hunter Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    {record.harvest.photos && record.harvest.photos.length > 0 ? (
                      <img
                        src={record.harvest.photos[0]}
                        alt={record.harvest.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400 font-semibold">
                          {record.harvest.userName[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{record.harvest.userName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(record.harvest.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Top Hunters */}
        {stats && stats.topHunters && stats.topHunters.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-green-400" size={24} />
              <h2 className="text-2xl font-bold text-white">Top Hunters</h2>
            </div>

            <div className="space-y-3">
              {stats.topHunters.map((hunter: any, index: number) => (
                <motion.div
                  key={hunter.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${index === 0 ? 'bg-yellow-500 text-white' : ''}
                    ${index === 1 ? 'bg-gray-400 text-white' : ''}
                    ${index === 2 ? 'bg-orange-600 text-white' : ''}
                    ${index > 2 ? 'bg-white/10 text-gray-400' : ''}
                  `}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-white">{hunter.userName}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{hunter.count}</p>
                    <p className="text-xs text-gray-400">harvests</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
