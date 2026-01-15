import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, Plus, Search, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ClubSwitcher() {
    const { memberships, activeClubId, activeClub, switchClub } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSwitchClub = async (clubId: string) => {
        await switchClub(clubId);
        setIsOpen(false);
    };

    const handleCreateClub = () => {
        setIsOpen(false);
        navigate('/clubs/create');
    };

    const handleDiscoverClubs = () => {
        setIsOpen(false);
        navigate('/clubs/discover');
    };

    // If no memberships, show simplified UI
    if (!memberships || memberships.length === 0) {
        return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <button
                    onClick={handleCreateClub}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs sm:text-sm font-medium transition-all border border-green-500/20"
                >
                    <Plus size={16} />
                    <span>Create Club</span>
                </button>
                <button
                    onClick={handleDiscoverClubs}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs sm:text-sm font-medium transition-all border border-white/10"
                >
                    <Search size={16} />
                    <span>Discover</span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
            >
                <Users size={16} className="text-green-400" />
                <span className="text-xs sm:text-sm font-medium max-w-[120px] md:max-w-[200px] truncate">
                    {activeClub?.name || 'Select Club'}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[#0a0c08]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                Your Clubs
                            </div>

                            <div className="space-y-1">
                                {memberships.map((membership) => (
                                    <button
                                        key={membership.id}
                                        onClick={() => handleSwitchClub(membership.clubId)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                                            membership.clubId === activeClubId
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'hover:bg-white/5 text-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                                                {membership.clubId.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-medium truncate max-w-[150px]">
                                                    Club {membership.clubId.substring(0, 8)}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    {membership.role}
                                                </div>
                                            </div>
                                        </div>
                                        {membership.clubId === activeClubId && (
                                            <Check size={16} className="text-green-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-white/10 p-2 space-y-1">
                            <button
                                onClick={handleCreateClub}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-all"
                            >
                                <Plus size={16} className="text-green-400" />
                                <span>Create New Club</span>
                            </button>
                            <button
                                onClick={handleDiscoverClubs}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-all"
                            >
                                <Search size={16} className="text-blue-400" />
                                <span>Discover Clubs</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
