import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Filter, Pin } from 'lucide-react';
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
      <div className="min-h-screen bg-[#0a0c08] pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c08] pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <MessageSquare className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Activity Feed</h1>
              <p className="text-gray-400 mt-1">What's happening in your club</p>
            </div>
          </div>

          {/* Create Post Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Post
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={16} className="text-gray-500 flex-shrink-0" />

          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
              filterType === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Posts
          </button>

          <button
            onClick={() => setFilterType('text')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
              filterType === 'text'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Posts
          </button>

          <button
            onClick={() => setFilterType('harvest')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
              filterType === 'harvest'
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            🦌 Harvests
          </button>

          <button
            onClick={() => setFilterType('announcement')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
              filterType === 'announcement'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📢 Announcements
          </button>

          <button
            onClick={() => setFilterType('event')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
              filterType === 'event'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📅 Events
          </button>
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
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
            >
              <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-6">
                {filterType === 'all'
                  ? 'Be the first to share something with your club'
                  : `No ${filterType} posts yet`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
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
