import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Users, Building2, Wind, Settings2, AlertTriangle } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useStands } from '../hooks/useStands';
import { useBookings } from '../hooks/useBookings';
import { useMembers } from '../hooks/useMembers';
import { useRecentHarvests, useSeasonHarvests } from '../hooks/useHarvests';
import { useNavigate } from 'react-router-dom';
import {
    StatsCard,
    TacticalInsightCard,
    HuntingActivityChart,
    LiveMapActivity,
    RecentActivityFeed,
    MemberRosterPanel,
    SunMoonWidget,
    UpcomingEventsCard,
    AnnouncementsPanel,
    MyBookingsPreview,
    ClubLeaderboard
} from '../components/dashboard';

const Dashboard = () => {
    const { activeClubId, activeClub } = useAuth();
    const navigate = useNavigate();

    // Weather data
    const { weather, loading: weatherLoading } = useWeather(
        activeClub?.location?.lat,
        activeClub?.location?.lng
    );

    // Stands data
    const { stands, loading: standsLoading } = useStands();

    // Bookings data (checked-in hunters)
    const { bookings: activeBookings, loading: bookingsLoading } = useBookings({ status: 'checked-in' });

    // Members data
    const { members, loading: membersLoading } = useMembers();

    // Harvest data
    const { harvests: recentHarvests, loading: harvestsLoading } = useRecentHarvests(5);
    const { stats: seasonStats } = useSeasonHarvests();

    // Loading state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeClubId) {
            const timer = setTimeout(() => setLoading(false), 1000);
            return () => clearTimeout(timer);
        } else {
            setLoading(false);
        }
    }, [activeClubId]);

    // Calculate stats
    const inFieldCount = activeBookings.length;
    const availableStands = stands.filter(s => s.status === 'available').length;
    const totalStands = stands.length;

    // Get previous season comparison (mock for now - would need historical data)
    const previousYearTotal = Math.floor(seasonStats.totalCount * 0.88); // Mock: current is 12% higher
    const percentChange = previousYearTotal > 0 
        ? Math.round(((seasonStats.totalCount - previousYearTotal) / previousYearTotal) * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4 pb-24 sm:pb-8">
            {/* Header Section */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                {/* Club info */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {activeClub?.name || 'Your Club'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Club Member Dashboard {activeClub?.createdAt && `• Est. ${new Date(activeClub.createdAt).getFullYear()}`}
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/check-in')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        Sign In to Field
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                    >
                        <AlertTriangle size={16} />
                        Emergency Alert
                    </motion.button>
                </div>
            </motion.header>

            {/* Pinned Announcements */}
            <AnnouncementsPanel />

            {/* AI Tactical Insight */}
            <TacticalInsightCard weather={weather} loading={weatherLoading} />

            {/* Sun/Moon Widget */}
            <SunMoonWidget
                lat={activeClub?.location?.lat}
                lng={activeClub?.location?.lng}
            />

            {/* Stats Grid - 2x2 on mobile, 4 columns on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <StatsCard
                    icon={<Users size={18} />}
                    label="In the Field"
                    value={inFieldCount.toString()}
                    trend={`+${inFieldCount} since 6:00 AM`}
                    trendColor="green"
                />
                <StatsCard
                    icon={<Building2 size={18} />}
                    label="Active Stands"
                    value={`${availableStands}/${totalStands}`}
                    onClick={() => navigate('/bookings')}
                />
                <StatsCard
                    icon={<Wind size={18} />}
                    label="Wind"
                    value={weather ? `${weather.windSpeed} mph` : '--'}
                    subValue=""
                    trend={weather ? `From ${weather.windDirection}` : 'No data'}
                    trendColor="green"
                />
                <StatsCard
                    icon={<Settings2 size={18} />}
                    label="Season Harvest"
                    value={seasonStats.totalCount.toString()}
                    trend={percentChange > 0 ? `${percentChange}% vs last year` : 'First season'}
                    trendColor={percentChange > 0 ? 'green' : 'gray'}
                    onClick={() => navigate('/harvests')}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Hunting Activity (wider) */}
                <div className="lg:col-span-2">
                    <HuntingActivityChart />
                </div>

                {/* Right Column - Live Map Activity */}
                <div>
                    <LiveMapActivity
                        stands={stands}
                        bookings={activeBookings}
                        loading={standsLoading || bookingsLoading}
                    />
                </div>
            </div>

            {/* My Bookings & Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* My Upcoming Bookings */}
                <MyBookingsPreview />

                {/* Upcoming Events */}
                <UpcomingEventsCard />
            </div>

            {/* Bottom Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Leaderboard */}
                <ClubLeaderboard />

                {/* Recent Activity */}
                <RecentActivityFeed
                    harvests={recentHarvests}
                    loading={harvestsLoading}
                />

                {/* Member Roster */}
                <MemberRosterPanel
                    members={members}
                    loading={membersLoading}
                />
            </div>
        </div>
    );
};

export default Dashboard;
