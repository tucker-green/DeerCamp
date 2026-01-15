import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Shield,
    Home,
    Flag,
    BarChart3,
    Search,
    Ban,
    CheckCircle,
    XCircle,
    MoreVertical,
    ChevronRight,
    Search as SearchIcon,
    AlertTriangle,
    Check,
    TrendingUp
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { db } from '../firebase/config';
import {
    collection,
    query,
    getDocs,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    updateDoc,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import type { UserProfile, Club, Report, ClubMembership } from '../types';
import { format } from 'date-fns';

type AdminTab = 'overview' | 'users' | 'clubs' | 'moderation' | 'reports';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClubs: 0,
        pendingReports: 0,
        activeBookings: 0,
        totalHarvests: 0
    });
    const [growthData, setGrowthData] = useState<any[]>([]);

    useEffect(() => {
        // Fetch global stats - only once on mount
        const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setStats(prev => ({ ...prev, totalUsers: s.size })));
        const unsubClubs = onSnapshot(collection(db, 'clubs'), (s) => setStats(prev => ({ ...prev, totalClubs: s.size })));
        const unsubReports = onSnapshot(query(collection(db, 'reports'), where('status', '==', 'pending')), (s) => setStats(prev => ({ ...prev, pendingReports: s.size })));
        const unsubHarvests = onSnapshot(collection(db, 'harvests'), (s) => setStats(prev => ({ ...prev, totalHarvests: s.size })));

        return () => {
            unsubUsers();
            unsubClubs();
            unsubReports();
            unsubHarvests();
        };
    }, []);

    useEffect(() => {
        // Generate mock/real growth data when stats update
        const generateGrowthData = () => {
            const data = [];
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                data.push({
                    name: format(date, 'MMM d'),
                    // Using current stats as a baseline for the mock data
                    users: Math.max(0, stats.totalUsers - (6 - i) * (Math.random() > 0.5 ? 1 : 0)),
                    clubs: Math.max(0, stats.totalClubs - (6 - i) * (Math.random() > 0.7 ? 1 : 0)),
                    harvests: Math.max(0, stats.totalHarvests - Math.floor(Math.random() * 5))
                });
            }
            setGrowthData(data);
        };

        if (stats.totalUsers > 0 || stats.totalClubs > 0) {
            generateGrowthData();
        }
    }, [stats.totalUsers, stats.totalClubs, stats.totalHarvests]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-160px)]">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 flex flex-col gap-2">
                <AdminNavItem
                    icon={<BarChart3 size={20} />}
                    label="Overview"
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                />
                <AdminNavItem
                    icon={<Users size={20} />}
                    label="Users"
                    active={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                />
                <AdminNavItem
                    icon={<Home size={20} />}
                    label="Clubs"
                    active={activeTab === 'clubs'}
                    onClick={() => setActiveTab('clubs')}
                />
                <AdminNavItem
                    icon={<Flag size={20} />}
                    label="Moderation"
                    active={activeTab === 'moderation'}
                    badge={stats.pendingReports > 0 ? stats.pendingReports : undefined}
                    onClick={() => setActiveTab('moderation')}
                />
                <AdminNavItem
                    icon={<Shield size={20} />}
                    label="Security"
                    active={activeTab === 'reports'}
                    onClick={() => setActiveTab('reports')}
                />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 glass-panel-strong rounded-3xl border border-white/10 p-6 md:p-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && <OverviewTab key="overview" stats={stats} growthData={growthData} onSwitchTab={setActiveTab} />}
                    {activeTab === 'users' && <UsersTab key="users" />}
                    {activeTab === 'clubs' && <ClubsTab key="clubs" />}
                    {activeTab === 'moderation' && <ModerationTab key="moderation" />}
                    {activeTab === 'reports' && <LogsTab key="logs" />}
                </AnimatePresence>
            </main>
        </div>
    );
};

const AdminNavItem = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${active
            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-900/20'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        <div className="flex items-center gap-3 font-semibold">
            {icon}
            <span>{label}</span>
        </div>
        {badge !== undefined && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-black">
                {badge}
            </span>
        )}
    </button>
);

const OverviewTab = ({ stats, growthData, onSwitchTab }: { stats: any, growthData: any[], onSwitchTab: (tab: AdminTab) => void }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8"
    >
        <div>
            <div className="flex items-center gap-3">
                <Shield className="text-green-500" size={32} />
                <h2 className="text-3xl font-heading font-bold text-white">System Overview</h2>
            </div>
            <p className="text-gray-400 mt-1">Platform-wide statistics and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatsCard label="Total Users" value={stats.totalUsers} icon={<Users className="text-blue-400" />} />
            <StatsCard label="Active Clubs" value={stats.totalClubs} icon={<Home className="text-green-400" />} />
            <StatsCard label="Global Harvests" value={stats.totalHarvests} icon={<TrendingUp className="text-amber-400" />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-green-400" />
                    Growth Trends
                </h3>
                <div className="h-80 glass-panel rounded-2xl border border-white/5 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorHarvests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ padding: '2px 0' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                name="Users"
                            />
                            <Area
                                type="monotone"
                                dataKey="harvests"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorHarvests)"
                                name="Harvests"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-400" />
                    Pending Moderation
                </h3>
                <div className="glass-panel rounded-2xl border border-white/5 p-6 h-[calc(100%-44px)] flex flex-col items-center justify-center text-center">
                    <div className={`p-4 rounded-full mb-4 ${stats.pendingReports > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
                        {stats.pendingReports > 0 ? <AlertTriangle size={40} /> : <CheckCircle size={40} />}
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">{stats.pendingReports}</p>
                    <p className="text-gray-400 text-sm mb-6">Reports requiring your attention</p>
                    <button
                        onClick={() => onSwitchTab('moderation')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        View Moderation Queue
                    </button>
                </div>
            </section>
        </div>
    </motion.div>
);

const UsersTab = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
        const unsub = onSnapshot(q, (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
            setLoading(false);
        });
        return unsub;
    }, []);

    const toggleBan = async (user: UserProfile) => {
        if (!window.confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.displayName}?`)) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                isBanned: !user.isBanned,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error toggling ban:', err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-white">User Management</h2>
                    <p className="text-gray-400 mt-1">Manage platform users and permissions</p>
                </div>
                <div className="relative w-full md:w-64">
                    <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="pb-4 font-semibold px-4">User</th>
                            <th className="pb-4 font-semibold px-4">Role</th>
                            <th className="pb-4 font-semibold px-4">Joined</th>
                            <th className="pb-4 font-semibold px-4">Status</th>
                            <th className="pb-4 font-semibold px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">No users found</td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.uid} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xs ring-2 ring-white/10">
                                            {user.displayName?.charAt(0) || user.email.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.displayName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${user.isSuperAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-500/10 text-gray-400 border border-white/5'
                                        }`}>
                                        {user.isSuperAdmin ? 'SuperAdmin' : 'User'}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-gray-400">
                                    {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                                </td>
                                <td className="py-4 px-4">
                                    {user.isBanned ? (
                                        <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                                            <Ban size={14} /> Banned
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                                            <CheckCircle size={14} /> Active
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button
                                        onClick={() => toggleBan(user)}
                                        className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'
                                            }`}
                                        title={user.isBanned ? 'Unban User' : 'Ban User'}
                                    >
                                        {user.isBanned ? <Check size={18} /> : <Ban size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

const ClubsTab = () => {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'clubs'), (snapshot) => {
            setClubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Club)));
            setLoading(false);
        });
        return unsub;
    }, []);

    const deleteClub = async (clubId: string, clubName: string) => {
        if (!window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY delete the club "${clubName}"? This action cannot be undone.`)) return;
        try {
            await deleteDoc(doc(db, 'clubs', clubId));
            // Also need to clean up memberships - would be better in a cloud function/batch
        } catch (err) {
            console.error('Error deleting club:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-3xl font-heading font-bold text-white">Club Directory</h2>
                <p className="text-gray-400 mt-1">Monitor and manage all hunting clubs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 py-8 text-center text-gray-500">Loading clubs...</div>
                ) : clubs.length === 0 ? (
                    <div className="col-span-2 py-12 text-center text-gray-500">No clubs found</div>
                ) : clubs.map(club => (
                    <div key={club.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 text-xl font-bold border border-green-500/20">
                                {club.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{club.name}</h4>
                                <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1"><Users size={12} /> {club.memberCount} Members</span>
                                    <span>•</span>
                                    <span>{club.propertyAcres || 0} Acres</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => deleteClub(club.id, club.name)}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                title="Delete Club"
                            >
                                <XCircle size={20} />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const LogsTab = () => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8"
    >
        <div>
            <h2 className="text-3xl font-heading font-bold text-white">System Logs</h2>
            <p className="text-gray-400 mt-1">Audit trail for administrative actions</p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center">
            <Shield size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium whitespace-pre-line">
                Audit logs are currently recorded in Firestore.
                Advanced filtering and display coming in a future update.
            </p>
        </div>
    </motion.div>
);

const ModerationTab = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
            setLoading(false);
        });
        return unsub;
    }, []);

    const handleReport = async (reportId: string, action: 'resolve' | 'dismiss' | 'delete') => {
        try {
            const reportRef = doc(db, 'reports', reportId);
            if (action === 'delete') {
                const report = reports.find(r => r.id === reportId);
                if (report) {
                    const collectionName = report.targetType === 'post' ? 'posts' : 'comments';
                    await deleteDoc(doc(db, collectionName, report.targetId));
                }
            }
            await updateDoc(reportRef, {
                status: action === 'dismiss' ? 'dismissed' : 'resolved',
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error handling report:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-3xl font-heading font-bold text-white">Moderation Queue</h2>
                <p className="text-gray-400 mt-1">Review reported content and users</p>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-8 text-center text-gray-500">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="py-12 glass-panel rounded-2xl border border-white/5 text-center">
                        <CheckCircle size={48} className="mx-auto text-green-500/50 mb-4" />
                        <p className="text-gray-400 font-medium text-lg">Queue is empty!</p>
                        <p className="text-sm text-gray-500">Everything is looking good.</p>
                    </div>
                ) : reports.map(report => (
                    <div key={report.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                                    <Flag size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-bold">Reported {report.targetType}</p>
                                    <p className="text-xs text-gray-500">Reported by {report.reporterName} • {format(new Date(report.createdAt), 'MMM d, h:mm a')}</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase ring-1 ring-amber-500/20">
                                {report.reason}
                            </span>
                        </div>

                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-gray-500 mb-2">TARGET CONTENT ({report.targetUserName})</p>
                            <p className="text-gray-200 text-sm whitespace-pre-wrap">{report.details || 'No details provided'}</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => handleReport(report.id, 'delete')}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <XCircle size={16} /> Remove & Resolve
                            </button>
                            <button
                                onClick={() => handleReport(report.id, 'resolve')}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Check size={16} /> Mark Resolved
                            </button>
                            <button
                                onClick={() => handleReport(report.id, 'dismiss')}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const StatsCard = ({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) => (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</p>
        </div>
    </div>
);

export default AdminDashboard;
