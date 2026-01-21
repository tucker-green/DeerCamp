import { Ban, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const BannedPage = () => {
    const { banReason, profile } = useAuth();

    const handleSignOut = async () => {
        await signOut(auth);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="max-w-md w-full glass-panel-strong rounded-3xl p-8 text-center border border-red-500/30">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                    <Ban className="w-10 h-10 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-heading font-bold text-white mb-3">
                    Account Suspended
                </h1>

                {/* Description */}
                <p className="text-gray-400 mb-6">
                    Your account has been suspended from using DeerCamp.
                    {profile?.bannedAt && (
                        <span className="block text-sm mt-2 text-gray-500">
                            Suspended on: {new Date(profile.bannedAt).toLocaleDateString()}
                        </span>
                    )}
                </p>

                {/* Ban Reason */}
                {banReason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-400 mb-1">Reason:</p>
                        <p className="text-white">{banReason}</p>
                    </div>
                )}

                {/* Info */}
                <p className="text-sm text-gray-500 mb-6">
                    If you believe this is a mistake, please contact support at{' '}
                    <a href="mailto:support@deercamp.app" className="text-green-400 hover:underline">
                        support@deercamp.app
                    </a>
                </p>

                {/* Auto Sign Out Notice */}
                <p className="text-xs text-gray-600 mb-6">
                    You will be automatically signed out in a few seconds.
                </p>

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={18} />
                    Sign Out Now
                </button>
            </div>
        </div>
    );
};

export default BannedPage;
