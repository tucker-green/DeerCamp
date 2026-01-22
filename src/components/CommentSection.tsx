import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Comment } from '../types';
import ReportModal from './ReportModal';
import { Flag } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  clubId: string;
}

export default function CommentSection({ postId, clubId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [reportingComment, setReportingComment] = useState<Comment | null>(null);

  // Fetch comments
  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      where('clubId', '==', clubId),
      where('parentCommentId', '==', null)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setComments(commentsData);
    });

    return unsubscribe;
  }, [postId, clubId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = newComment.trim();
    if (!user || !profile || !content) return;

    setNewComment('');
    setLoading(true);

    try {
      // Add comment
      const commentData: any = {
        postId,
        clubId,
        userId: user.uid,
        userName: profile.displayName || 'Hunter',
        content,
        parentCommentId: null,
        replyCount: 0,
        reactions: {
          '👍': 0,
          '❤️': 0,
          '🔥': 0,
          '🦌': 0,
          '🎯': 0,
          '💯': 0
        },
        createdAt: new Date().toISOString()
      };

      if (profile.avatar) {
        commentData.userAvatar = profile.avatar;
      }

      await addDoc(collection(db, 'comments'), commentData);

      // Increment post comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1)
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));

      // Decrement post comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(-1)
      });

      setShowActions(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {/* Comments list */}
      <AnimatePresence>
        {comments.length > 0 && (
          <div className="space-y-4 mb-4">
            {comments.map((comment) => {
              const isOwnComment = user?.uid === comment.userId;

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(comment.userName?.[0] || 'U').toUpperCase()}
                  </div>

                  {/* Comment content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white/5 rounded-xl p-3 relative">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white text-sm">{comment.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                        {comment.editedAt && (
                          <span className="text-xs text-gray-500 italic">(edited)</span>
                        )}
                      </div>
                      <p className="text-gray-200 text-sm whitespace-pre-wrap">{comment.content}</p>

                      {/* Actions */}
                      {isOwnComment && (
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => setShowActions(showActions === comment.id ? null : comment.id)}
                            className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                          >
                            <MoreVertical size={12} />
                          </button>

                          {showActions === comment.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-0 mt-1 w-36 bg-[#1a1d1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
                            >
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Not Own Comment Actions */}
                      {!isOwnComment && (
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => setShowActions(showActions === comment.id ? null : comment.id)}
                            className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                          >
                            <MoreVertical size={12} />
                          </button>

                          {showActions === comment.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-0 mt-1 w-36 bg-[#1a1d1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
                            >
                              <button
                                onClick={() => {
                                  setReportingComment(comment);
                                  setShowActions(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-orange-400 hover:bg-orange-500/10 flex items-center gap-2"
                              >
                                <Flag size={12} />
                                Report
                              </button>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(profile?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>

          <div className="flex-1 flex items-end gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={1}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <button
              type="submit"
              disabled={!newComment.trim() || loading}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {loading ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </form>
      )}

      {/* Report Modal */}
      {reportingComment && (
        <ReportModal
          isOpen={!!reportingComment}
          onClose={() => setReportingComment(null)}
          targetType="comment"
          targetId={reportingComment.id}
          targetUserId={reportingComment.userId}
          targetUserName={reportingComment.userName || 'Unknown User'}
          clubId={clubId}
        />
      )}
    </div>
  );
}
