import { motion } from 'framer-motion';
import { Users, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoClubSelectedProps {
  title?: string;
  message?: string;
  showActions?: boolean;
}

export default function NoClubSelected({
  title = "No Club Selected",
  message = "You need to be a member of a club to access this feature.",
  showActions = true
}: NoClubSelectedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10"
        >
          <Users size={40} className="text-gray-500" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-heading font-bold text-white mb-3"
        >
          {title}
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8 text-lg"
        >
          {message}
        </motion.p>

        {/* Actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/clubs/discover')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-500 hover:to-green-600 transition-all shadow-lg shadow-green-900/50"
            >
              <Users size={18} />
              Find a Club
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/clubs/create')}
              className="flex items-center justify-center gap-2 px-6 py-3 glass-panel-strong border border-white/10 text-white rounded-xl font-medium hover:bg-white/5 transition-all"
            >
              <Plus size={18} />
              Create a Club
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
