import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Users, ArrowLeft, Globe, Lock, Tag, Plus } from 'lucide-react';
import { usePublicClubs } from '../hooks/useClubs';
import { useClubJoinRequests } from '../hooks/useClubJoinRequests';
import type { Club } from '../types';

export default function ClubDiscoveryPage() {
    const navigate = useNavigate();
    const { clubs, loading, searchPublicClubs } = usePublicClubs(20);
    const { submitJoinRequest } = useClubJoinRequests();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Club[]>([]);
    const [searching, setSearching] = useState(false);
    const [joiningClub, setJoiningClub] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        const result = await searchPublicClubs(searchTerm);
        if (result.success) {
            setSearchResults(result.clubs);
        }
        setSearching(false);
    };

    const handleJoinClub = async (club: Club) => {
        setJoiningClub(club.id);
        const result = await submitJoinRequest(club.id);

        if (result.success) {
            alert(`Join request submitted to ${club.name}!`);
        } else {
            alert(result.error || 'Failed to submit join request');
        }

        setJoiningClub(null);
    };

    const displayClubs = searchTerm && searchResults.length > 0 ? searchResults : clubs;

    return (
        <div className="min-h-screen bg-[#0a0c08] pt-28 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Discover Clubs</h1>
                        <p className="text-gray-400">Find and join hunting clubs in your area</p>
                    </div>

                    <button
                        onClick={() => navigate('/clubs/create')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all shadow-lg shadow-green-500/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create Club</span>
                    </button>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search clubs by name, description, or tags..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10 disabled:opacity-50"
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* Clubs Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 mt-4">Loading clubs...</p>
                    </div>
                ) : displayClubs.length === 0 ? (
                    <div className="text-center py-12">
                        <Globe size={48} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">
                            {searchTerm ? 'No clubs found matching your search' : 'No public clubs available yet'}
                        </p>
                        <button
                            onClick={() => navigate('/clubs/create')}
                            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all shadow-lg shadow-green-500/20"
                        >
                            Create the First Club
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayClubs.map((club) => (
                            <motion.div
                                key={club.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                                        {club.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {club.isPublic ? (
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                                                <Globe size={12} />
                                                <span>Public</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs">
                                                <Lock size={12} />
                                                <span>Private</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Club Info */}
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{club.name}</h3>

                                {club.description && (
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{club.description}</p>
                                )}

                                {/* Location */}
                                {(club.location?.city || club.location?.state) && (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                                        <MapPin size={16} className="text-green-400" />
                                        <span>
                                            {[club.location.city, club.location.state].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                        <Users size={16} />
                                        <span>{club.memberCount} members</span>
                                    </div>
                                    {club.propertyAcres && (
                                        <div className="text-gray-400 text-sm">
                                            {club.propertyAcres} acres
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                {club.tags && club.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {club.tags.slice(0, 3).map((tag) => (
                                            <div
                                                key={tag}
                                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-gray-300 text-xs"
                                            >
                                                <Tag size={10} />
                                                <span>{tag}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Join Button */}
                                <button
                                    onClick={() => handleJoinClub(club)}
                                    disabled={joiningClub === club.id}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {joiningClub === club.id ? 'Requesting...' : club.requiresApproval ? 'Request to Join' : 'Join Club'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
