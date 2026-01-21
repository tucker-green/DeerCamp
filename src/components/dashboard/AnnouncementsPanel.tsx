import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, ChevronRight, Pin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePinnedAnnouncements } from '../../hooks/useAnnouncements';
import type { Post } from '../../types';

interface AnnouncementsPanelProps {
  maxAnnouncements?: number;
}

const AnnouncementItem = ({ 
  announcement, 
  onDismiss 
}: { 
  announcement: Post; 
  onDismiss: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const createdDate = new Date(announcement.createdAt);
  const isRecent = (Date.now() - createdDate.getTime()) < 24 * 60 * 60 * 1000; // Within 24 hours

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="relative overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 group">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Megaphone size={18} className="text-amber-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Pin size={12} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
              Pinned Announcement
            </span>
            {isRecent && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                New
              </span>
            )}
          </div>
          
          <p className="text-sm text-white line-clamp-2">
            {announcement.content}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500">
              By {announcement.userName}
            </span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">
              {createdDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <button
              onClick={() => navigate(`/feed?post=${announcement.id}`)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 ml-auto"
            >
              Read more
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(announcement.id)}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const AnnouncementsPanel = ({ maxAnnouncements = 3 }: AnnouncementsPanelProps) => {
  const { announcements, loading } = usePinnedAnnouncements(maxAnnouncements);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a.id));

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  // Don't render anything if loading or no announcements
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="h-24 bg-amber-500/5 rounded-xl animate-pulse border border-amber-500/10" />
      </motion.div>
    );
  }

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 mb-4"
    >
      <AnimatePresence mode="popLayout">
        {visibleAnnouncements.map((announcement) => (
          <AnnouncementItem
            key={announcement.id}
            announcement={announcement}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnnouncementsPanel;
