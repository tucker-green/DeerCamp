import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import { LogOut, LogIn, Home, ClipboardList, Users, Sparkles, Calendar, MessageSquare, Shield, Plus, Target, MapPin, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ClubSwitcher from './ClubSwitcher';
import CreatePostModal from './CreatePostModal';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, activeMembership } = useAuth();
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);

    const handleLogout = () => {
        auth.signOut();
        navigate('/');
    };

    const quickActions = [
        { icon: <MessageSquare size={18} />, label: 'New Post', action: () => setShowCreatePost(true) },
        { icon: <Target size={18} />, label: 'Record Harvest', path: '/harvest' },
        { icon: <Calendar size={18} />, label: 'Book Stand', path: '/bookings/new' },
        { icon: <MapPin size={18} />, label: 'Check In/Out', path: '/check-in' },
    ];

    const handleQuickAction = (item: typeof quickActions[0]) => {
        setShowQuickActions(false);
        if (item.action) {
            item.action();
        } else if (item.path) {
            navigate(item.path);
        }
    };

    const baseNavItems = [
        { icon: <Home size={16} />, label: 'Overview', path: '/' },
        { icon: <MessageSquare size={16} />, label: 'Feed', path: '/feed' },
        { icon: <Users size={16} />, label: 'Club', path: '/club' },
        { icon: <ClipboardList size={16} />, label: 'Harvests', path: '/harvests' },
        { icon: <Calendar size={16} />, label: 'Stand Board', path: '/bookings' },
        { icon: <LogIn size={16} />, label: 'Check In', path: '/check-in' },
    ];

    // Base navigation items plus conditional ones
    let navItems = [...baseNavItems];

    if (profile?.isSuperAdmin) {
        navItems.push({ icon: <Shield size={16} />, label: 'Admin', path: '/admin' });
    }

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0c08]/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0a0c08]/70"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

                <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between relative">
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
                        <motion.h1
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-xl sm:text-2xl font-bold font-heading tracking-tight flex items-center gap-2 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <Sparkles size={20} className="text-green-500 group-hover:rotate-12 transition-transform" />
                            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Deer</span>
                            <span className="text-white">Camp</span>
                        </motion.h1>

                        <ClubSwitcher />

                        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10 shadow-lg backdrop-blur-sm">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    onClick={() => navigate(item.path)}
                                    active={location.pathname === item.path}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Quick Actions Button */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowQuickActions(!showQuickActions)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                            >
                                <motion.div
                                    animate={{ rotate: showQuickActions ? 45 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {showQuickActions ? <X size={18} /> : <Plus size={18} />}
                                </motion.div>
                                <span className="hidden sm:inline">Quick Action</span>
                            </motion.button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showQuickActions && (
                                    <>
                                        {/* Backdrop */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowQuickActions(false)}
                                        />
                                        
                                        {/* Menu */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-[#0a0c08]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            {quickActions.map((item, index) => (
                                                <motion.button
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                                                    onClick={() => handleQuickAction(item)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="text-emerald-400">{item.icon}</span>
                                                    {item.label}
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-bold text-white leading-none mb-1.5">{profile?.displayName}</p>
                            <div className="flex items-center justify-end gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">{activeMembership?.role}</p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-300 border border-white/5 hover:border-red-500/30"
                            title="Log Out"
                        >
                            <LogOut size={18} />
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Create Post Modal */}
            {showCreatePost && (
                <CreatePostModal onClose={() => setShowCreatePost(false)} />
            )}
        </>
    );
};

const NavLink = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative ${active
            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-900/50'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full"
                transition={{ type: 'spring', duration: 0.6 }}
            />
        )}
        <span className="relative z-10">{icon}</span>
        <span className="relative z-10">{label}</span>
    </motion.button>
);

export default Navbar;
