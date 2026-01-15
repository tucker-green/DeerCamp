import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import { LogOut, LogIn, Home, Map as MapIcon, ClipboardList, Users, Menu, X, Sparkles, Calendar, Globe, Settings, Trophy, MessageSquare } from 'lucide-react';
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
        { icon: <MessageSquare size={16} />, label: 'Feed', path: '/feed' },
        { icon: <MapIcon size={16} />, label: 'Stands', path: '/stands' },
        { icon: <Globe size={16} />, label: 'Map', path: '/map' },
        { icon: <Calendar size={16} />, label: 'Stand Board', path: '/bookings' },
        { icon: <LogIn size={16} />, label: 'Check In', path: '/check-in' },
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] md:hidden h-screen w-screen overflow-hidden"
                    >
                        {/* Immersive Background */}
                        <div className="absolute inset-0 bg-[#0a0c08]/98 backdrop-blur-3xl" />

                        {/* Decorative Topographical/Nature Accents */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-900/30 rounded-full blur-[120px]" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay opacity-10" />
                        </div>

                        <div className="relative h-full flex flex-col pt-24 pb-10 px-6 overflow-y-auto">
                            {/* Close Button Top Right */}
                            <motion.button
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white"
                            >
                                <X size={24} />
                            </motion.button>

                            {/* User Profile Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-10"
                            >
                                <div className="flex items-center gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-2xl shadow-2xl overflow-hidden">
                                        {profile?.displayName?.charAt(0) || 'U'}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-white truncate">{profile?.displayName}</h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">{activeMembership?.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Staggered Navigation */}
                            <nav className="flex-1 space-y-2 mb-10">
                                {navItems.map((item, index) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <motion.button
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + index * 0.05 }}
                                            onClick={() => {
                                                navigate(item.path);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 relative group overflow-hidden ${isActive
                                                    ? 'text-white'
                                                    : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="mobileActiveItem"
                                                    className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-900/20 border border-green-500/30 rounded-2xl"
                                                />
                                            )}
                                            <div className={`relative z-10 p-2.5 rounded-xl transition-colors ${isActive ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white'
                                                }`}>
                                                {item.icon}
                                            </div>
                                            <span className="relative z-10 font-bold text-lg tracking-tight">{item.label}</span>
                                            {!isActive && (
                                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Sparkles size={14} className="text-green-500" />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </nav>

                            {/* Logout at bottom */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-auto pt-6 border-t border-white/5"
                            >
                                <button
                                    onClick={handleLogout}
                                    className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 hover:border-red-500/30 font-bold tracking-wide transition-all duration-300"
                                >
                                    <LogOut size={20} />
                                    <span>Disconnect</span>
                                </button>
                                <p className="text-center mt-6 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-medium">DeerCamp v2.0</p>
                            </motion.div>
                        </div>
                    </motion.div>
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
