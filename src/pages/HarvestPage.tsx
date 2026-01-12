import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Harvest } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Camera, Tag, X, Calendar, Scale, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HarvestPage = () => {
    const { profile, user } = useAuth();
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        species: 'deer',
        sex: 'male',
        weight: '',
        notes: '',
    });

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'harvests'),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Harvest));
            setHarvests(data);
        });

        return unsubscribe;
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            let photoUrl = '';
            if (imageFile) {
                const storageRef = ref(storage, `harvests/${user.uid}/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                photoUrl = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, 'harvests'), {
                userId: user.uid,
                userName: profile?.displayName || 'Hunter',
                date: new Date().toISOString(),
                species: formData.species,
                sex: formData.sex,
                weight: Number(formData.weight),
                notes: formData.notes,
                photoUrl,
            });

            setShowAddModal(false);
            setFormData({ species: 'deer', sex: 'male', weight: '', notes: '' });
            setImageFile(null);
        } catch (err) {
            console.error(err);
            alert('Error logging harvest');
        } finally {
            setLoading(false);
        }
    };

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
                        Harvest Log
                    </h2>
                    <p className="text-gray-400 text-lg flex items-center gap-2">
                        <Tag size={18} className="text-green-500" />
                        Track the club's success this season
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary shadow-xl shadow-green-900/40 px-6 py-3"
                >
                    <Plus size={20} />
                    Log New Harvest
                </motion.button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {harvests.map((harvest, i) => (
                        <motion.div
                            key={harvest.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative rounded-3xl overflow-hidden glass-panel-strong border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl cursor-pointer"
                        >
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-transparent transition-all duration-500 z-10 pointer-events-none" />

                            <div className="aspect-[4/3] bg-gradient-to-br from-[#0a0c08] to-[#141812] relative">
                                {harvest.photoUrl ? (
                                    <>
                                        <img
                                            src={harvest.photoUrl}
                                            alt={harvest.species}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gradient-to-br from-white/[0.02] to-white/[0.05]">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/10">
                                            <Camera size={28} className="opacity-40" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">No Photo</span>
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 z-10">
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-black/70 backdrop-blur-xl border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-2xl inline-flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        {harvest.species}
                                    </motion.span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white font-heading font-bold text-2xl capitalize flex items-center gap-3 mb-2">
                                                {harvest.sex}
                                                {harvest.weight && (
                                                    <span className="text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-700 px-3 py-1.5 rounded-full border border-green-500/30 shadow-lg">
                                                        {harvest.weight} lbs
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-gray-300 text-sm font-medium">By {harvest.userName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 relative">
                                <div className="flex items-center gap-4 text-xs font-medium mb-4 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <Calendar size={12} className="text-green-500" />
                                        </div>
                                        <span>{new Date(harvest.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Tag size={12} className="text-blue-400" />
                                        </div>
                                        <span>North Ridge</span>
                                    </div>
                                </div>

                                {harvest.notes ? (
                                    <p className="text-sm text-gray-400 italic line-clamp-2 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                        "{harvest.notes}"
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600 italic text-center py-2">No field notes recorded</p>
                                )}
                            </div>

                            {/* Bottom glow effect */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modern Add Harvest Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                            onClick={() => setShowAddModal(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="glass-panel-strong border border-white/20 w-full max-w-lg rounded-3xl overflow-hidden relative z-10 shadow-2xl"
                        >
                            {/* Decorative gradient blob */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/[0.03] to-transparent relative">
                                <div>
                                    <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <Tag size={16} className="text-green-500" />
                                        </div>
                                        Log Harvest
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Record your latest catch</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white border border-white/5 hover:border-white/10"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Species</label>
                                        <select
                                            value={formData.species}
                                            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 outline-none transition-all appearance-none"
                                        >
                                            <option value="deer">Whitetail Deer</option>
                                            <option value="pigs">Hog / Feral Pig</option>
                                            <option value="turkey">Turkey</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sex</label>
                                        <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                                            {['male', 'female'].map(option => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, sex: option as any })}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${formData.sex === option ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        Weight <Scale size={12} />
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 outline-none transition-all pl-4"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-4 top-3.5 text-gray-500 text-sm font-medium">lbs</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Evidence</label>
                                    <label className="flex items-center justify-center gap-3 bg-black/20 border-2 border-dashed border-white/10 rounded-xl p-8 cursor-pointer hover:bg-black/40 hover:border-green-500/30 transition-all group">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                                            <Camera size={20} className="text-gray-400 group-hover:text-green-500" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-300">{imageFile ? imageFile.name : 'Upload Photo'}</p>
                                            <p className="text-xs text-gray-500">Supports JPG, PNG</p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 outline-none resize-none text-sm leading-relaxed"
                                        placeholder="Describe the conditions..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn btn-primary py-4 rounded-xl text-lg shadow-xl shadow-green-900/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Processing...' : 'Confirm Harvest'}
                                        {!loading && <ChevronRight size={18} />}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HarvestPage;
