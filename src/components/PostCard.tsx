import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MoreVertical, Edit2, Trash2, Pin, PinOff, Heart } from 'lucide-react';
import type { Post, ReactionType } from '../types';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';
import { Flag } from 'lucide-react';

interface PostCardProps {
  post: Post;
  isPinned?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const reactionIcons: Record<ReactionType, string> = {
  '👍': '👍',
  '❤️': '❤️',
  '🔥': '🔥',
  '🦌': '🦌',
  '🎯': '🎯',
  '💯': '💯'
};

export default function PostCard({ post, isPinned = false, onEdit, onDelete }: PostCardProps) {
  const { user, activeMembership } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const isOwnPost = user?.uid === post.userId;
  const canPin = activeMembership?.role === 'owner' || activeMembership?.role === 'manager';
  const canEdit = isOwnPost || canPin;
  const canDelete = isOwnPost || canPin;

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', post.id);

      if (userReaction === reactionType) {
        // Remove reaction
        await updateDoc(postRef, {
          [`reactions.${reactionType}`]: increment(-1)
        });
        setUserReaction(null);
      } else {
        // Add new reaction (remove old one if exists)
        const updates: any = {
          [`reactions.${reactionType}`]: increment(1)
        };

        if (userReaction) {
          updates[`reactions.${userReaction}`] = increment(-1);
        }

        await updateDoc(postRef, updates);
        setUserReaction(reactionType);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handlePin = async () => {
    if (!canPin) return;

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        isPinned: !post.isPinned,
        pinnedUntil: post.isPinned ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
      setShowActions(false);
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!canDelete || !confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', post.id));
      onDelete?.();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const totalReactions = Object.values(post.reactions).reduce((sum, count) => sum + count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-xl rounded-2xl border hover:border-white/20 transition-all p-6 ${isPinned ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10' : 'border-white/10'
        }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/10">
          {(post.userName?.[0] || 'U').toUpperCase()}
        </div>

        {/* User info and timestamp */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-white truncate">{post.userName.split(' ')[0]}</p>
            {post.editedAt && (
              <span className="text-xs text-gray-500 italic">(edited)</span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Post type badge */}
        {post.type !== 'text' && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${post.type === 'harvest' ? 'bg-amber-500/20 text-amber-400' :
            post.type === 'announcement' ? 'bg-red-500/20 text-red-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
            {post.type === 'harvest' ? '🦌 HARVEST' :
              post.type === 'announcement' ? '📢 ANNOUNCEMENT' :
                '📅 EVENT'}
          </span>
        )}

        {isPinned && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 flex-shrink-0">
            📌 PINNED
          </span>
        )}

        {/* Actions menu */}
        {(canEdit || canDelete || canPin) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <MoreVertical size={16} />
            </button>

            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-[#1a1d1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
              >
                {canPin && (
                  <button
                    onClick={handlePin}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    {post.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    {post.isPinned ? 'Unpin' : 'Pin Post'}
                  </button>
                )}

                {canEdit && (
                  <button
                    onClick={() => {
                      onEdit?.();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit2 size={14} />
                    Edit Post
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5"
                  >
                    <Trash2 size={14} />
                    Delete Post
                  </button>
                )}

                {!isOwnPost && (
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 border-t border-white/5"
                  >
                    <Flag size={14} />
                    Report Post
                  </button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-white mb-4 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {/* Photos & Videos */}
      {post.photos && post.photos.length > 0 && (
        <div className={`grid gap-2 mb-4 ${post.photos.length === 1 ? 'grid-cols-1' :
          post.photos.length === 2 ? 'grid-cols-2' :
            post.photos.length === 3 ? 'grid-cols-3' :
              'grid-cols-2'
          }`}>
          {post.photos.slice(0, 4).map((mediaUrl, idx) => {
            const isVideo = mediaUrl.includes('/posts/') && (
              mediaUrl.includes('.mp4') ||
              mediaUrl.includes('.mov') ||
              mediaUrl.includes('.webm') ||
              mediaUrl.includes('.avi')
            );

            return (
              <div key={idx} className="relative">
                {isVideo ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full h-48 object-cover rounded-xl bg-black"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={`Post media ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(mediaUrl, '_blank')}
                  />
                )}
                {idx === 3 && post.photos!.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center pointer-events-none">
                    <span className="text-white text-2xl font-bold">+{post.photos!.length - 4}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MessageSquare size={16} />
          <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
        </div>
        {totalReactions > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Heart size={16} />
            <span>{totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}</span>
          </div>
        )}
      </div>

      {/* Reaction buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(reactionIcons) as ReactionType[]).map((reactionType) => {
          const count = post.reactions[reactionType] || 0;
          const isActive = userReaction === reactionType;

          return (
            <motion.button
              key={reactionType}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReaction(reactionType)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${isActive
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
            >
              <span className="text-base">{reactionIcons[reactionType]}</span>
              {count > 0 && <span className="text-xs">{count}</span>}
            </motion.button>
          );
        })}

        <button
          onClick={() => setShowComments(!showComments)}
          className={`ml-auto px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${showComments
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
            }`}
        >
          <MessageSquare size={14} />
          {showComments ? 'Hide' : 'Comment'}
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection postId={post.id} clubId={post.clubId} />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
        targetUserId={post.userId}
        targetUserName={post.userName}
        clubId={post.clubId}
      />
    </motion.div>
  );
}
