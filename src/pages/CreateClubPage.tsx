import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MapPin, Tag, ArrowLeft, Check, Globe, Lock } from 'lucide-react';
import { useClubs } from '../hooks/useClubs';

export default function CreateClubPage() {
    const navigate = useNavigate();
    const { createClub } = useClubs();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: true,
        requiresApproval: true,
        city: '',
        state: '',
        propertyAcres: '',
        tags: '',
        allowGuests: false,
        guestPolicy: '',
        maxMembers: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await createClub({
                name: formData.name,
                description: formData.description || undefined,
                isPublic: formData.isPublic,
                requiresApproval: formData.requiresApproval,
                location: formData.city || formData.state ? {
                    city: formData.city || undefined,
                    state: formData.state || undefined
                } : undefined,
                propertyAcres: formData.propertyAcres ? parseInt(formData.propertyAcres) : undefined,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                allowGuests: formData.allowGuests,
                guestPolicy: formData.guestPolicy || undefined,
                maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : undefined
            });

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Failed to create club');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c08] pt-28 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Users className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Create Your Club</h1>
                            <p className="text-gray-400 text-sm mt-1">Set up a new hunting club</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white">Basic Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Club Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="e.g., Pine Ridge Hunting Club"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                                    placeholder="Describe your club, hunting style, and what makes it unique..."
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <MapPin size={20} className="text-green-400" />
                                Location
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Property Size (acres)
                                </label>
                                <input
                                    type="number"
                                    value={formData.propertyAcres}
                                    onChange={(e) => setFormData({ ...formData, propertyAcres: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="e.g., 500"
                                />
                            </div>
                        </div>

                        {/* Visibility & Access */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white">Visibility & Access</h2>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-green-500 focus:ring-2 focus:ring-green-500"
                                    />
                                    <div className="flex items-center gap-2 flex-1">
                                        <Globe size={18} className={formData.isPublic ? 'text-green-400' : 'text-gray-400'} />
                                        <div>
                                            <div className="text-white font-medium">Public Club</div>
                                            <div className="text-gray-400 text-xs">Allow others to discover and request to join</div>
                                        </div>
                                    </div>
                                </label>

                                {formData.isPublic && (
                                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.requiresApproval}
                                            onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                                            className="w-5 h-5 rounded bg-white/10 border-white/20 text-green-500 focus:ring-2 focus:ring-green-500"
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            <Lock size={18} className={formData.requiresApproval ? 'text-yellow-400' : 'text-gray-400'} />
                                            <div>
                                                <div className="text-white font-medium">Require Approval</div>
                                                <div className="text-gray-400 text-xs">Manually approve join requests</div>
                                            </div>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Tag size={18} className="text-green-400" />
                                Tags
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="e.g., whitetail, turkey, family-friendly (comma-separated)"
                            />
                        </div>

                        {/* Additional Settings */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white">Additional Settings</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Maximum Members
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxMembers}
                                    onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.allowGuests}
                                    onChange={(e) => setFormData({ ...formData, allowGuests: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-green-500 focus:ring-2 focus:ring-green-500"
                                />
                                <div>
                                    <div className="text-white font-medium">Allow Guests</div>
                                    <div className="text-gray-400 text-xs">Members can bring guests</div>
                                </div>
                            </label>

                            {formData.allowGuests && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Guest Policy
                                    </label>
                                    <textarea
                                        value={formData.guestPolicy}
                                        onChange={(e) => setFormData({ ...formData, guestPolicy: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                                        placeholder="Describe guest rules and restrictions..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    'Creating...'
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Create Club
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
