import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, ClipboardList, Calendar, LogIn, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type TabItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeMembership } = useAuth();

  // Check if user is owner or manager (admin roles)
  const isAdmin = activeMembership?.role === 'owner' || activeMembership?.role === 'manager';

  // Bottom tabs with Feed in center: Overview | Check In | Harvests | Feed | Stand Board | Admin/Profile
  const tabs: TabItem[] = [
    { label: 'Overview', path: '/', icon: <Home size={18} /> },
    { label: 'Check In', path: '/check-in', icon: <LogIn size={18} /> },
    { label: 'Harvests', path: '/harvests', icon: <ClipboardList size={18} /> },
    { label: 'Feed', path: '/feed', icon: <MessageSquare size={18} /> },
    { label: 'Stand Board', path: '/bookings', icon: <Calendar size={18} /> },
    // Show Admin for owners/managers, Profile for regular members
    isAdmin 
      ? { label: 'Admin', path: '/club', icon: <Shield size={18} /> }
      : { label: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      <div className="border-t border-white/10 bg-[#0a0c08]/95 backdrop-blur-2xl">
        <div className="flex items-center justify-around px-1 py-2 pb-safe">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-[9px] font-semibold transition-colors min-w-0 ${
                  active
                    ? 'text-emerald-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={active ? 'text-emerald-400' : 'text-gray-400'}>{tab.icon}</span>
                <span className="leading-none truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
