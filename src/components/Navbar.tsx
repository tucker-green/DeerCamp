import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import { LogOut, Home, Map as MapIcon, ClipboardList, Users, Menu, X, Sparkles, Calendar, Globe, Settings, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ClubSwitcher from './ClubSwitcher';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, activeMembership } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const baseNavItems = [
        { icon: <Home size={16} />, label: 'Overview', path: '/' },
        { icon: <MapIcon size={16} />, label: 'Stands', path: '/stands' },
        { icon: <Globe size={16} />, label: 'Map', path: '/map' },
        { icon: <Calendar size={16} />, label: 'Stand Board', path: '/bookings' },
        { icon: <ClipboardList size={16} />, label: 'Harvests', path: '/harvests' },
        { icon: <Trophy size={16} />, label: 'Trophy Book', path: '/trophy-book' },
        { icon: <Users size={16} />, label: 'Members', path: '/members' },
    ];

    // Add Property Management link for owners and managers
    const navItems = activeMembership?.role === 'owner' || activeMembership?.role === 'manager'
        ? [...baseNavItems, { icon: <Settings size={16} />, label: 'Property Mgmt', path: '/property-management' }]
        : baseNavItems;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0c08]/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0a0c08]/70"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

                <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative">
                    <div className="flex items-center gap-6 lg:gap-10">
                        <motion.h1
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-2xl font-bold font-heading tracking-tight flex items-center gap-2 cursor-pointer group"
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

                    <div className="flex items-center gap-3 sm:gap-6">
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

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-20 right-0 bottom-0 w-80 bg-[#141812]/95 backdrop-blur-2xl border-l border-white/10 z-50 md:hidden shadow-2xl"
                        >
                            <div className="p-6 space-y-6">
                                {/* User Profile */}
                                <div className="glass-panel p-5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {profile?.displayName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{profile?.displayName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                <p className="text-xs text-green-400 font-semibold uppercase">{activeMembership?.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Links */}
                                <div className="space-y-2">
                                    {navItems.map((item, index) => (
                                        <motion.button
                                            key={item.path}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => {
                                                navigate(item.path);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left font-medium transition-all duration-300 ${
                                                location.pathname === item.path
                                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-900/40'
                                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <span className={location.pathname === item.path ? 'text-white' : 'text-gray-500'}>
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Logout Button */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-all border border-red-500/20"
                                >
                                    <LogOut size={16} />
                                    <span>Log Out</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const NavLink = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative ${
            active
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
