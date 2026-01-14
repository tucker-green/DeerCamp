import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image, MessageSquare, Megaphone, Loader, Video, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { PostType } from '../types';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const { user, profile, activeClubId, activeMembership } = useAuth();
  const [postType, setPostType] = useState<PostType>('text');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const canCreateAnnouncement = activeMembership?.role === 'owner' || activeMembership?.role === 'manager';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const imageLimit = 10 * 1024 * 1024; // 10MB
      const videoLimit = 50 * 1024 * 1024; // 50MB

      if (!isImage && !isVideo) {
        alert(`${file.name} is not an image or video file`);
        return false;
      }

      if (isImage && file.size > imageLimit) {
        alert(`${file.name} exceeds 10MB limit for images`);
        return false;
      }

      if (isVideo && file.size > videoLimit) {
        alert(`${file.name} exceeds 50MB limit for videos`);
        return false;
      }

      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    const uploadPromises = selectedFiles.map(async (file, index) => {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `posts/${activeClubId}/${user!.uid}/${fileName}`);

      return new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(() => {
              const perFileProgress = 100 / selectedFiles.length;
              return (index * perFileProgress) + (progress / selectedFiles.length);
            });
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile || !activeClubId || !content.trim()) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload files and get URLs
      const uploadedUrls = await uploadFiles();

      const postData: any = {
        clubId: activeClubId,
        userId: user.uid,
        userName: profile.displayName,
        type: postType,
        content: content.trim(),
        isPinned: postType === 'announcement' && isPinned,
        commentCount: 0,
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

      // Only add optional fields if they have values
      if (profile.avatar) {
        postData.userAvatar = profile.avatar;
      }
      if (uploadedUrls.length > 0) {
        postData.photos = uploadedUrls;
      }
      if (postType === 'announcement' && isPinned) {
        postData.pinnedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      await addDoc(collection(db, 'posts'), postData);

      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1d1a] rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1d1a] border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Post</h2>
              <p className="text-sm text-gray-400">Share with your club</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Post Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Post Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPostType('text')}
                className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                  postType === 'text'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <MessageSquare size={20} />
                <div className="text-left">
                  <p className="font-semibold">Regular Post</p>
                  <p className="text-xs opacity-70">Share updates</p>
                </div>
              </button>

              {canCreateAnnouncement && (
                <button
                  type="button"
                  onClick={() => setPostType('announcement')}
                  className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                    postType === 'announcement'
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Megaphone size={20} />
                  <div className="text-left">
                    <p className="font-semibold">Announcement</p>
                    <p className="text-xs opacity-70">Important news</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Pin Announcement Option */}
          {postType === 'announcement' && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-yellow-500 focus:ring-yellow-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-400">Pin this announcement</p>
                  <p className="text-xs text-yellow-400/70">Keep at top of feed for 7 days</p>
                </div>
              </label>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              {postType === 'announcement' ? 'Announcement Message' : 'What\'s on your mind?'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'announcement'
                  ? 'Share important information with your club members...'
                  : 'Share what\'s happening, ask questions, or start a discussion...'
              }
              rows={6}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">{content.length} characters</p>
          </div>

          {/* Photos & Videos */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Upload size={16} />
              Photos & Videos (optional)
            </label>

            {/* File Input */}
            <label className="w-full px-6 py-4 bg-white/5 border-2 border-dashed border-white/20 hover:border-green-500/50 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 text-gray-400">
                <Image size={20} />
                <Video size={20} />
              </div>
              <p className="text-sm text-gray-400">Click to upload photos or videos</p>
              <p className="text-xs text-gray-500">Images up to 10MB • Videos up to 50MB</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <Video size={32} />
                          <p className="text-xs mt-2 px-2 text-center truncate w-full">{file.name}</p>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {content.trim() && profile && (
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs font-semibold text-gray-400 mb-2">PREVIEW</p>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold">
                  {profile.displayName[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{profile.displayName}</p>
                  <p className="text-xs text-gray-400">Just now</p>
                </div>
                {postType !== 'text' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    postType === 'announcement' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {postType === 'announcement' ? '📢 ANNOUNCEMENT' : '📅 EVENT'}
                  </span>
                )}
              </div>
              <p className="text-white whitespace-pre-wrap text-sm">{content}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
            >
              {loading ? (
                <>
                  <div className="flex items-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Posting...'}
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {postType === 'announcement' ? '📢 Post Announcement' : '✨ Create Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
