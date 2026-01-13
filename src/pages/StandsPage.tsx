import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { Stand } from '../types';
import { Map as MapIcon, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NoClubSelected from '../components/NoClubSelected';

const StandsPage = () => {
    const { activeClubId } = useAuth();
    const [stands, setStands] = useState<Stand[]>([]);
    const [, setSelectedStand] = useState<Stand | null>(null);

    useEffect(() => {
        if (!activeClubId) {
            setStands([]);
            return;
        }

        const q = query(
            collection(db, 'stands'),
            where('clubId', '==', activeClubId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stand));
            setStands(data);
        });
        return unsubscribe;
    }, [activeClubId]);

    const toggleStatus = async (standId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'available' ? 'reserved' : 'available';
        try {
            await updateDoc(doc(db, 'stands', standId), { status: nextStatus });
        } catch (err) {
            console.error(err);
        }
    };

    // Show empty state if no club selected
    if (!activeClubId) {
        return <NoClubSelected title="No Club Selected" message="Select or join a club to view and manage hunting stands." />;
    }

    return (
        <div className="space-y-8 pt-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8"
            >
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Stands & Blinds
                    </h2>
                    <p className="text-gray-400 text-lg flex items-center gap-2">
                        <MapIcon size={18} className="text-green-500" />
                        View real-time availability and secure your spot
                    </p>
                </div>

                {/* Legend */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-4 glass-panel-strong p-3 rounded-full border border-white/10 px-5 shadow-lg"
                >
                    <div className="flex items-center gap-2.5 text-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-lg"></span>
                        </span>
                        <span className="text-gray-200 font-medium">Available</span>
                    </div>
                    <div className="w-px h-5 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                    <div className="flex items-center gap-2.5 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg"></span>
                        <span className="text-gray-200 font-medium">Reserved</span>
                    </div>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stands.length === 0 && (
                    <div className="lg:col-span-4 py-32 text-center rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02]">
                        <MapIcon size={48} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No stands configured</p>
                        <p className="text-sm text-gray-600 mt-1">Contact your club admin to map locations</p>
                    </div>
                )}

                <AnimatePresence>
                    {stands.map((stand, index) => (
                        <motion.div
                            layout
                            key={stand.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className={`relative overflow-hidden rounded-2xl border transition-all duration-500 group cursor-pointer ${
                                stand.status === 'available'
                                    ? 'glass-panel-strong border-white/10 hover:border-green-500/50 hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)]'
                                    : 'bg-[#0f110c]/80 border-white/5 opacity-70'
                            }`}
                            onClick={() => setSelectedStand(stand)}
                        >
                            {/* Animated gradient blob */}
                            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-700 ${
                                stand.status === 'available'
                                    ? 'bg-green-500/20 group-hover:bg-green-500/30 group-hover:scale-150'
                                    : 'bg-amber-500/10'
                            }`} />

                            {/* Status Bar with Gradient */}
                            <div className={`h-1.5 w-full ${
                                stand.status === 'available'
                                    ? 'bg-gradient-to-r from-green-600 via-green-500 to-green-600'
                                    : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600'
                            }`}>
                                {stand.status === 'available' && (
                                    <div className="h-full w-1/3 bg-white/30 animate-shimmer"></div>
                                )}
                            </div>

                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-heading font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                                            {stand.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 font-bold tracking-widest uppercase bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                                {stand.type}
                                            </span>
                                        </div>
                                    </div>

                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg ${
                                            stand.status === 'available'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}
                                    >
                                        {stand.status === 'available' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                    </motion.div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2.5 text-sm text-gray-300 bg-black/30 py-3 px-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                        <MapIcon size={16} className="text-green-500" />
                                        <span className="font-medium">North Ridge Zone</span>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStatus(stand.id, stand.status);
                                        }}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                                            stand.status === 'available'
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-900/30'
                                                : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        {stand.status === 'available' && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        )}
                                        <span className="relative z-10">
                                            {stand.status === 'available' ? 'Reserve Now' : 'Join Waitlist'}
                                        </span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Hover effect border glow */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StandsPage;
