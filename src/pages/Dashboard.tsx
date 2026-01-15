import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Target, Calendar, MapPin, TrendingUp, Sun, Wind, ArrowUpRight, Thermometer, Droplets } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit as firestoreLimit, onSnapshot } from 'firebase/firestore';
import type { Booking, Post } from '../types';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { profile, user, activeClubId, activeClub } = useAuth();
    const navigate = useNavigate();
    const firstName = profile?.displayName?.split(' ')[0] || 'Hunter';

    const { weather, loading: weatherLoading } = useWeather(activeClub?.location?.lat, activeClub?.location?.lng);

    // Real-time data state
    const [harvestCount, setHarvestCount] = useState(0);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [activeStandsCount, setActiveStandsCount] = useState(0);
    const [activeMembersCount, setActiveMembersCount] = useState(0);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // Hide loading screen after initial data fetch
    useEffect(() => {
        // If we have an active club ID, wait a bit for data to potentially load
        if (activeClubId) {
            const timer = setTimeout(() => setLoading(false), 1500);
            return () => clearTimeout(timer);
        } else {
            // If no active club (e.g. new user), stop loading immediately
            setLoading(false);
        }
    }, [activeClubId]);

    // Fetch harvest count
    useEffect(() => {
        if (!activeClubId) return;

        const q = query(
            collection(db, 'harvests'),
            where('clubId', '==', activeClubId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHarvestCount(snapshot.size);
        });

        return unsubscribe;
    }, [activeClubId]);

    // Fetch upcoming bookings
    useEffect(() => {
        if (!user || !activeClubId) return;

        const now = new Date().toISOString();
        const q = query(
            collection(db, 'bookings'),
            where('clubId', '==', activeClubId),
            where('userId', '==', user.uid),
            where('status', 'in', ['confirmed', 'checked-in']),
            orderBy('startTime', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
                .filter(b => b.startTime >= now);
            setUpcomingBookings(bookings);
        });

        return unsubscribe;
    }, [user, activeClubId]);

    // Fetch active stands count
    useEffect(() => {
        if (!activeClubId) return;

        const q = query(
            collection(db, 'stands'),
            where('clubId', '==', activeClubId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setActiveStandsCount(snapshot.size);
        });

        return unsubscribe;
    }, [activeClubId]);

    // Fetch active members count
    useEffect(() => {
        if (!activeClubId) return;

        const q = query(
            collection(db, 'clubMemberships'),
            where('clubId', '==', activeClubId),
            where('status', '==', 'active')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setActiveMembersCount(snapshot.size);
        });

        return unsubscribe;
    }, [activeClubId]);

    // Fetch recent posts
    useEffect(() => {
        if (!activeClubId) return;

        const q = query(
            collection(db, 'posts'),
            where('clubId', '==', activeClubId),
            orderBy('createdAt', 'desc'),
            firestoreLimit(3)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
            setRecentPosts(posts);
        });

        return unsubscribe;
    }, [activeClubId]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formatRelativeTime = (timestamp: string) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    const nextBooking = upcomingBookings[0];
    const nextBookingText = nextBooking
        ? `Next: ${new Date(nextBooking.startTime).toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}`
        : 'No bookings';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-6 pb-20">
            {/* Hero Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
            >
                <div className="space-y-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-heading font-bold">
                            <span className="text-gray-500 font-light text-3xl md:text-4xl block mb-2">{getGreeting()},</span>
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
                                {firstName}
                            </span>
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-400 text-lg flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Conditions are prime for the North Ridge stands today
                    </motion.p>
                </div>

                {/* Weather Mini-Widget */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-panel-strong p-6 rounded-2xl border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group hover-lift"
                >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative flex items-center gap-6">
                        {weather ? (
                            <>
                                <div className="text-center">
                                    <div className="flex items-start justify-center gap-1">
                                        <Thermometer size={20} className="text-green-400 mt-1" />
                                        <div className="text-5xl font-bold font-heading bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{weather.temp}°</div>
                                    </div>
                                    <div className="text-xs text-green-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1 justify-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        {weather.condition}
                                    </div>
                                </div>
                                <div className="h-14 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Droplets size={14} className="text-blue-400" />
                                        <span className="font-medium">{weather.precipitationChance}% Precip</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Wind size={14} className="text-gray-400" />
                                        <span className="font-medium">{weather.windDirection} {weather.windSpeed}mph</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full py-2">
                                {weatherLoading ? (
                                    <div className="text-gray-400 text-sm">Loading weather...</div>
                                ) : (
                                    <div className="text-gray-400 text-sm flex flex-col items-center">
                                        <span>No location set</span>
                                        <span className="text-xs text-gray-500">Add club location</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Target />}
                    color="text-green-500"
                    bg="bg-green-500/10"
                    label="Total Harvests"
                    value={harvestCount.toString()}
                    trend={`Club season total`}
                    onClick={() => navigate('/harvests')}
                />
                <StatCard
                    icon={<Calendar />}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                    label="My Bookings"
                    value={upcomingBookings.length.toString()}
                    trend={nextBookingText}
                    onClick={() => navigate('/bookings')}
                />
                <StatCard
                    icon={<MapPin />}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                    label="Active Stands"
                    value={activeStandsCount.toString()}
                    trend="Available to book"
                    onClick={() => navigate('/bookings')}
                />
                <StatCard
                    icon={<TrendingUp />}
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                    label="Club Members"
                    value={activeMembersCount.toString()}
                    trend="Active hunters"
                    onClick={() => navigate('/members')}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8"
            >
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Live Activity Feed
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Recent club updates</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, x: 3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/feed')}
                                className="text-sm text-green-400 hover:text-green-300 font-semibold transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-green-500/10"
                            >
                                View All
                                <ArrowUpRight size={14} />
                            </motion.button>
                        </div>

                        <div className="space-y-3">
                            {recentPosts.length === 0 ? (
                                <div className="glass-panel-strong p-8 rounded-2xl border border-white/10 text-center">
                                    <p className="text-gray-400">No recent activity</p>
                                    <p className="text-sm text-gray-500 mt-1">Be the first to post or log a harvest!</p>
                                </div>
                            ) : (
                                recentPosts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        whileHover={{ x: 4 }}
                                        onClick={() => navigate('/feed')}
                                        className="glass-panel-strong p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between group relative overflow-hidden cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-transparent transition-all duration-300" />

                                        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-white/10 group-hover:ring-green-500/30 transition-all flex-shrink-0">
                                                {post.userName?.charAt(0) || 'U'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-200">
                                                    <span className="font-bold text-white">{post.userName?.split(' ')[0] || 'Hunter'}</span>
                                                    {post.type === 'harvest' && <span className="text-green-400 font-semibold"> logged a harvest</span>}
                                                    {post.type === 'announcement' && <span className="text-blue-400 font-semibold"> made an announcement</span>}
                                                    {post.type === 'text' && <span> posted</span>}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 truncate">
                                                    {post.content.split('\n')[0].slice(0, 80)}
                                                    {post.content.length > 80 ? '...' : ''}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatRelativeTime(post.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {post.type === 'harvest' && (
                                            <div className="relative z-10 px-3 py-1.5 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 text-xs font-bold text-green-400 transition-all shadow-lg flex-shrink-0 ml-2">
                                                🦌
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="glass-panel-strong p-6 rounded-2xl border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:scale-150 transition-transform duration-700" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-heading font-bold mb-5 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                    <Sun size={16} className="text-amber-400" />
                                </div>
                                <span>Forecast</span>
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                    <span className="text-gray-400 font-medium">Tonight</span>
                                    <span className="font-bold text-white">38°F <span className="text-gray-500 font-normal">/ Clear</span></span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                    <span className="text-gray-400 font-medium">Tomorrow AM</span>
                                    <span className="font-bold text-white">35°F <span className="text-gray-500 font-normal">/ Mist</span></span>
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="mt-4 text-xs text-blue-200 bg-gradient-to-br from-blue-500/15 to-blue-500/5 p-4 rounded-xl border border-blue-500/30 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-xl" />
                                    <p className="relative z-10 font-medium leading-relaxed">
                                        <span className="font-bold text-blue-300">Peak movement</span> predicted at <span className="font-bold">06:45 AM</span>
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="glass-panel-strong p-6 rounded-2xl border border-white/10"
                    >
                        <h3 className="text-xl font-heading font-bold mb-5">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <ActionButton label="Book Stand" onClick={() => navigate('/bookings/new')} />
                            <ActionButton label="Log Harvest" onClick={() => navigate('/harvests')} />
                            <ActionButton label="Check In" onClick={() => navigate('/check-in')} />
                            <ActionButton label="View Map" onClick={() => navigate('/map')} />
                        </div>
                    </motion.section>
                </div>
            </motion.div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, color, bg, onClick }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string, bg: string, onClick?: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className="glass-panel-strong p-6 rounded-2xl border border-white/10 relative overflow-hidden group cursor-pointer"
    >
        <div className={`absolute -top-12 -right-12 w-32 h-32 ${bg} rounded-full blur-3xl opacity-30 group-hover:opacity-60 group-hover:scale-125 transition-all duration-500`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4 border border-white/10 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {icon}
            </div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-2 mt-2">
                <h4 className="text-4xl font-heading font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{value}</h4>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    <ArrowUpRight size={12} />
                    <span>{trend}</span>
                </div>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
);

const ActionButton = ({ label, onClick }: { label: string, onClick?: () => void }) => (
    <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="p-4 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-sm font-semibold text-gray-300 hover:text-white shadow-lg hover:shadow-xl relative overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-transparent transition-all duration-300" />
        <span className="relative z-10">{label}</span>
    </motion.button>
);

export default Dashboard;
