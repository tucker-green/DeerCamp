import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Copy, CheckCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInvites } from '../hooks/useInvites';
import { UserRole, MembershipTier } from '../types';
import { validateEmail } from '../utils/memberHelpers';

export default function InviteMemberPage() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { createInvite } = useInvites({ clubId: profile?.clubId });

    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('member');
    const [tier, setTier] = useState<MembershipTier>('full');
    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!user || !profile) {
            setError('You must be logged in to invite members');
            setLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        if (!profile.clubId) {
            setError('You must be a member of a club to invite others');
            setLoading(false);
            return;
        }

        try {
            const result = await createInvite({
                email,
                role,
                membershipTier: tier,
                clubId: profile.clubId,
                invitedBy: user.uid,
                invitedByName: profile.displayName,
                message: message || undefined
            });

            if (result.success && result.inviteCode) {
                setSuccess(true);
                setInviteCode(result.inviteCode);
            } else {
                setError(result.error || 'Failed to create invite');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getInviteLink = () => {
        if (!inviteCode) return '';
        return `${window.location.origin}/invite/${inviteCode}`;
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(getInviteLink());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (success && inviteCode) {
        return (
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-8 rounded-2xl text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                    >
                        <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-2">Invite Sent!</h2>
                    <p className="text-gray-400 mb-6">
                        An invitation has been created for {email}
                    </p>

                    <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-400 mb-2">Invite Link:</p>
                        <p className="text-white font-mono text-sm break-all mb-3">{getInviteLink()}</p>

                        <button
                            onClick={copyInviteLink}
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        Share this link with {email} to complete the invitation. The link expires in 7 days.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setInviteCode(null);
                                setEmail('');
                                setMessage('');
                            }}
                            className="btn-secondary flex-1"
                        >
                            Invite Another
                        </button>

                        <button onClick={() => navigate('/members')} className="btn-primary flex-1">
                            Back to Members
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/members')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={18} />
                Back to Members
            </button>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                    <UserPlus className="text-green-400" size={36} />
                    Invite Member
                </h1>
                <p className="text-gray-400">Invite someone to join your hunting club</p>
            </motion.div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="glass-panel p-8 rounded-2xl space-y-6"
            >
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="member@example.com"
                            required
                            className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        />
                    </div>
                </div>

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                        Role *
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    >
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                        {profile?.role === 'owner' && <option value="owner">Owner</option>}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                        {role === 'owner' && 'Full control over club settings and members'}
                        {role === 'manager' && 'Can manage members and club resources'}
                        {role === 'member' && 'Standard member access'}
                    </p>
                </div>

                {/* Tier Selection */}
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                        Membership Tier *
                    </label>
                    <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as MembershipTier)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    >
                        <option value="full">Full Member</option>
                        <option value="family">Family Member</option>
                        <option value="youth">Youth Member</option>
                        <option value="guest">Guest</option>
                    </select>
                </div>

                {/* Personal Message */}
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                        Personal Message (Optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal note to your invitation..."
                        rows={4}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/members')}
                        className="btn-secondary flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Send Invitation
                            </>
                        )}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
