import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Loader, Flag } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { ReportReason } from '../types';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetType: 'post' | 'comment';
    targetId: string;
    targetUserId: string;
    targetUserName: string;
    clubId: string;
}

const REASONS: { value: ReportReason; label: string; description: string }[] = [
    {
        value: 'spam',
        label: 'Spam',
        description: 'Irrelevant or repetitive content'
    },
    {
        value: 'harassment',
        label: 'Harassment',
        description: 'Targeted attacks or bullying'
    },
    {
        value: 'inappropriate',
        label: 'Inappropriate',
        description: 'Offensive language or imagery'
    },
    {
        value: 'other',
        label: 'Other',
        description: 'Something else not listed above'
    }
];

export default function ReportModal({
    isOpen,
    onClose,
    targetType,
    targetId,
    targetUserId,
    targetUserName,
    clubId
}: ReportModalProps) {
    const { user, profile } = useAuth();
    const [reason, setReason] = useState<ReportReason | null>(null);
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile || !reason) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'reports'), {
                clubId,
                reporterId: user.uid,
                reporterName: profile.displayName || 'Hunter',
                targetType,
                targetId,
                targetUserId,
                targetUserName,
                reason,
                details: details.trim(),
                status: 'pending',
                createdAt: new Date().toISOString()
            });

            setSubmitted(true);
            setTimeout(() => {
                onClose();
                // Reset state after closing
                setTimeout(() => {
                    setSubmitted(false);
                    setReason(null);
                    setDetails('');
                }, 300);
            }, 2000);
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[#1a1d1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                <Flag size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Report {targetType}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Report Received</h4>
                                <p className="text-gray-400">
                                    Thank you for helping keep our community safe.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Why are you reporting this {targetType} by <span className="text-white font-medium">{targetUserName}</span>?
                                    </p>

                                    <div className="space-y-2">
                                        {REASONS.map((r) => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => setReason(r.value)}
                                                className={`w-full p-3 text-left rounded-xl border transition-all ${reason === r.value
                                                        ? 'bg-red-500/10 border-red-500/50 text-white'
                                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="font-semibold text-sm">{r.label}</div>
                                                <div className="text-xs text-gray-500">{r.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Additional Details (optional)
                                    </label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder="Provide more context..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all resize-none h-24 text-sm"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!reason || loading}
                                        className="flex-[2] px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20"
                                    >
                                        {loading ? (
                                            <Loader size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Flag size={18} />
                                                Submit Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
