import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Home, MessageSquare, Shield, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type TabItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const isSuperAdmin = Boolean(profile?.isSuperAdmin);

  const baseTabs: TabItem[] = [
    { label: 'Overview', path: '/', icon: <Home size={18} /> },
    { label: 'Stand Board', path: '/bookings', icon: <Calendar size={18} /> },
    { label: 'Feed', path: '/feed', icon: <MessageSquare size={18} /> },
    { label: 'Club', path: '/club', icon: <Users size={18} /> },
  ];

  const tabs: TabItem[] = isSuperAdmin
    ? [...baseTabs, { label: 'Admin', path: '/admin', icon: <Shield size={18} /> }]
    : [...baseTabs, { label: 'Profile', path: '/profile', icon: <User size={18} /> }];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden safe-bottom">
      <div className="mx-auto w-full max-w-7xl px-3">
        <div className="mb-3 rounded-2xl border border-white/10 bg-[#0a0c08]/95 backdrop-blur-2xl shadow-lg">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {tabs.map((tab) => {
              const active = isActive(tab.path);
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors ${
                    active
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={active ? 'text-green-400' : 'text-gray-400'}>{tab.icon}</span>
                  <span className="leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
