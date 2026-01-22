import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Pin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Post, PostType } from '../types';
import NoClubSelected from '../components/NoClubSelected';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

export default function FeedPage() {
  const { activeClubId } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<PostType | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch posts for active club
  useEffect(() => {
    if (!activeClubId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'posts'),
      where('clubId', '==', activeClubId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [activeClubId]);

  // Filter posts by type
  const filteredPosts = filterType === 'all'
    ? posts
    : posts.filter(p => p.type === filterType);

  // Separate pinned posts
  const pinnedPosts = filteredPosts.filter(p => p.isPinned && (!p.pinnedUntil || new Date(p.pinnedUntil) > new Date()));
  const regularPosts = filteredPosts.filter(p => !p.isPinned || (p.pinnedUntil && new Date(p.pinnedUntil) <= new Date()));

  // Check if user can create announcements (will be used in CreatePostModal)
  // const canCreateAnnouncement = activeMembership?.role === 'owner' || activeMembership?.role === 'manager';

  // Show empty state if no club selected
  if (!activeClubId) {
    return <NoClubSelected title="No Club Selected" message="Select or join a club to view the activity feed." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c08] pt-20 sm:pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c08] pt-20 sm:pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <MessageSquare className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Activity Feed</h1>
              <p className="text-gray-400 mt-1 text-xs sm:text-base">What's happening in your club</p>
            </div>
          </div>

          {/* Create Post Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(58, 99, 38, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="hidden sm:flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold shadow-xl shadow-green-900/30 transition-all border border-green-400/30 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Plus size={20} strokeWidth={3} />
            </div>
            <span className="tracking-tight">New Post</span>
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">

            <button
              onClick={() => setFilterType('all')}
              className={`w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${filterType === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              All
            </button>

            <button
              onClick={() => setFilterType('text')}
              className={`w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${filterType === 'text'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              Posts
            </button>

            <button
              onClick={() => setFilterType('harvest')}
              className={`w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${filterType === 'harvest'
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              🦌 Harvests
            </button>

            <button
              onClick={() => setFilterType('announcement')}
              className={`w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${filterType === 'announcement'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              📢 Announce
            </button>

            <button
              onClick={() => setFilterType('event')}
              className={`w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${filterType === 'event'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              📅 Events
            </button>
          </div>
        </div>

        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-yellow-400">
              <Pin size={18} />
              <span className="font-semibold">Pinned</span>
            </div>
            <AnimatePresence mode="popLayout">
              {pinnedPosts.map((post) => (
                <div key={post.id} className="mb-4">
                  <PostCard post={post} isPinned={true} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Regular Posts */}
        <AnimatePresence mode="popLayout">
          {regularPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 sm:p-12 text-center"
            >
              <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-6">
                {filterType === 'all'
                  ? 'Be the first to share something with your club'
                  : `No ${filterType} posts yet`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(58, 99, 38, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-sm sm:text-base font-bold shadow-lg transition-all border border-green-400/20"
              >
                Create First Post
              </motion.button>
            </motion.div>
          ) : (
            regularPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="mb-4"
              >
                <PostCard post={post} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 sm:hidden w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-2xl shadow-green-900/40 flex items-center justify-center z-40 border border-green-400/30"
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
