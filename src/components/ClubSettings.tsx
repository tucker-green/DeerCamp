import { useState, useEffect } from 'react';
import { Save, Globe, Lock, AlertCircle, Check, BookOpen } from 'lucide-react';
import { useClubs } from '../hooks/useClubs';
import type { Club } from '../types';

interface ClubSettingsProps {
    club: Club;
}

export default function ClubSettings({ club }: ClubSettingsProps) {
    const { updateClub } = useClubs();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        state: '',
        rules: '',
        isPublic: false,
        requiresApproval: false,
        maxMembers: ''
    });

    useEffect(() => {
        if (club) {
            setFormData({
                name: club.name || '',
                description: club.description || '',
                city: club.location?.city || '',
                state: club.location?.state || '',
                rules: club.rules || '',
                isPublic: club.isPublic || false,
                requiresApproval: club.requiresApproval || false,
                maxMembers: club.maxMembers?.toString() || ''
            });
        }
    }, [club]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const updates: any = {
                name: formData.name,
                description: formData.description,
                rules: formData.rules,
                isPublic: formData.isPublic,
                requiresApproval: formData.requiresApproval,
                location: {
                    ...club.location,
                    city: formData.city,
                    state: formData.state
                }
            };

            if (formData.maxMembers) {
                const max = parseInt(formData.maxMembers);
                if (!isNaN(max)) updates.maxMembers = max;
            } else {
                updates.maxMembers = null; // Remove limit if cleared
            }

            const result = await updateClub(club.id, updates);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            } else {
                setError(result.error || 'Failed to update club');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Club Settings</h2>
                    <p className="text-gray-400 text-sm">Update your club details, rules, and preferences</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-400" size={20} />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                    <Check className="text-green-400" size={20} />
                    <p className="text-green-400 text-sm">Club updated successfully!</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">General Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Club Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm font-medium text-gray-300">Location</label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Rules Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                        <BookOpen size={20} className="text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Club Rules</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Code of Conduct & Rules</label>
                        <p className="text-xs text-gray-500 mb-2">Define the rules, safety guidelines, and expectations for your club members.</p>
                        <textarea
                            rows={8}
                            value={formData.rules}
                            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                            placeholder="1. Safety first at all times...&#10;2. Respect property boundaries...&#10;3. Sign in before hunting..."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>
                </div>

                {/* Privacy & Membership */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Privacy & Membership</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl p-4 flex items-start justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Globe size={20} className={formData.isPublic ? "text-green-400" : "text-gray-400"} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Public Visibility</h3>
                                    <p className="text-gray-400 text-sm">Allow others to find this club in search</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 flex items-start justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Lock size={20} className={formData.requiresApproval ? "text-yellow-400" : "text-gray-400"} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Require Approval</h3>
                                    <p className="text-gray-400 text-sm">Admins must approve new members</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.requiresApproval}
                                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Max Members</label>
                        <input
                            type="number"
                            value={formData.maxMembers}
                            onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                            placeholder="Unlimited"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                        <p className="text-gray-500 text-xs mt-1">Leave empty for unlimited members.</p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary px-8 py-3 rounded-xl text-lg shadow-xl shadow-green-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Saving Changes...'
                        ) : (
                            <>
                                <Save size={20} />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
