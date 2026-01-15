import { useState } from 'react';
import { X, MapPin, Save } from 'lucide-react';
import { useStands } from '../hooks/useStands';

interface AddStandModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddStandModal({ isOpen, onClose }: AddStandModalProps) {
    const { createStand } = useStands();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'ladder' as const,
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createStand({
            name: formData.name,
            type: formData.type,
            description: formData.description,
            // Default coordinates since map is disabled
            lat: 0,
            lng: 0,
            status: 'available'
        });

        setLoading(false);
        if (result.success) {
            setFormData({ name: '', type: 'ladder', description: '' });
            onClose();
        } else {
            alert('Failed to create stand: ' + result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1d16] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MapPin size={20} className="text-green-500" />
                        Add New Stand
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Stand Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. North Ridge Ladder"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['ladder', 'climber', 'blind', 'box'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type as any })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize border transition-all ${formData.type === type
                                            ? 'bg-green-500/20 border-green-500 text-green-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (Optional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Notes about location, access, etc."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <Save size={18} />
                                    Create Stand
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
