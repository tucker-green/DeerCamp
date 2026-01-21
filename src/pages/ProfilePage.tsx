import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';

const ProfilePage = () => {
  const { profile, activeMembership, activeClub } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-[60vh] space-y-6 pt-4 sm:pt-6">
      <div className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {profile?.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">Profile</h1>
            <p className="text-sm text-gray-400">Account details and club role</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3 text-gray-300">
          <UserIcon size={18} className="text-green-400" />
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-base font-semibold text-white">{profile?.displayName || 'Hunter'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <UserIcon size={18} className="text-green-400" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-semibold text-white">{profile?.email || 'Not set'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <UserIcon size={18} className="text-green-400" />
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-base font-semibold text-white capitalize">
              {activeMembership?.role || 'member'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-300">
          <UserIcon size={18} className="text-green-400" />
          <div>
            <p className="text-sm text-gray-500">Active Club</p>
            <p className="text-base font-semibold text-white">{activeClub?.name || 'None selected'}</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full btn btn-secondary flex items-center justify-center gap-2 text-red-300 border-red-500/30 hover:text-red-200"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
};

export default ProfilePage;
