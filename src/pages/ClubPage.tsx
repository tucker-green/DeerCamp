import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Map as MapIcon, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MembersPage from './MembersPage';
import PropertyManagementPage from './PropertyManagementPage';
import ClubSettings from '../components/ClubSettings';
import NoClubSelected from '../components/NoClubSelected';

type Tab = 'members' | 'property' | 'settings';

export default function ClubPage() {
    const { activeClubId, activeMembership, activeClub } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('members');

    // Check permissions
    const isManager = activeMembership?.role === 'owner' || activeMembership?.role === 'manager';

    if (!activeClubId) {
        return (
            <NoClubSelected
                title="No Club Selected"
                message="You aren't in a club yet. Check out the public feed to see what's happening."
            />
        );
    }

    const tabs = [
        { id: 'members', label: 'Members', icon: Users },
        ...(isManager ? [
            { id: 'property', label: 'Property', icon: MapIcon },
            { id: 'settings', label: 'Settings', icon: Settings }
        ] : [])
    ];

    return (
        <div className="pt-6 pb-20 space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Club Management
                    </h1>
                    <p className="text-gray-400 text-lg mt-2">
                        Manage members, property, and club settings
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${isActive
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-900/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'members' && (
                            <div className="bg-[#0a0c08]">
                                <MembersPage />
                            </div>
                        )}

                        {activeTab === 'property' && isManager && (
                            <div className="bg-[#0a0c08]">
                                <PropertyManagementPage />
                            </div>
                        )}

                        {activeTab === 'settings' && isManager && activeClub && (
                            <div className="bg-[#0a0c08]">
                                <ClubSettings club={activeClub} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
