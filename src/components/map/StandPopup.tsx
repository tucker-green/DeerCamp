import { motion } from 'framer-motion';
import { User, Wind, Ruler, Info, X, Target } from 'lucide-react';
import type { Stand } from '../../types';
import { getStatusColor, getTypeIcon, getStatusDisplayName, getTypeDisplayName } from '../../utils/standMarkerHelpers';

interface StandPopupProps {
  stand: Stand;
  onBook?: (stand: Stand) => void;
  onClose?: () => void;
  onShowRange?: (stand: Stand) => void;
  showingRange?: boolean;
}

const StandPopup = ({ stand, onBook, onClose, onShowRange, showingRange = false }: StandPopupProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 min-w-[280px] max-w-[320px]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-heading font-bold text-white mb-1">
            {stand.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wide text-gray-400 font-bold bg-white/5 px-2 py-0.5 rounded">
              {getTypeIcon(stand.type)} {getTypeDisplayName(stand.type)}
            </span>
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor(stand.status) }}
              />
              <span className="text-xs text-gray-400">{getStatusDisplayName(stand.status)}</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        {stand.description && (
          <p className="text-gray-300">{stand.description}</p>
        )}

        {stand.heightFeet && (
          <div className="flex items-center gap-2 text-gray-400">
            <Ruler size={14} />
            <span>{stand.heightFeet} ft high</span>
          </div>
        )}

        {stand.capacity && (
          <div className="flex items-center gap-2 text-gray-400">
            <User size={14} />
            <span>Capacity: {stand.capacity} {stand.capacity === 1 ? 'hunter' : 'hunters'}</span>
          </div>
        )}

        {stand.bestWindDirections && stand.bestWindDirections.length > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <Wind size={14} />
            <span>Best winds: {stand.bestWindDirections.join(', ')}</span>
          </div>
        )}

        {stand.condition && (
          <div className="flex items-center gap-2 text-gray-400">
            <Info size={14} />
            <span className="capitalize">Condition: {stand.condition.replace('-', ' ')}</span>
          </div>
        )}

        {stand.notes && (
          <div className="mt-2 p-2 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400">{stand.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {onShowRange && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onShowRange(stand)}
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              showingRange
                ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                : 'bg-white/5 border-2 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Target size={16} />
            {showingRange ? 'Hide Range Rings' : 'Show Range Rings'}
          </motion.button>
        )}

        {stand.status === 'available' && onBook && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBook(stand)}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-sm transition-all shadow-lg"
          >
            Book This Stand
          </motion.button>
        )}
      </div>

      {stand.status === 'reserved' && (
        <div className="text-center py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-500 text-sm font-medium">Currently Reserved</p>
        </div>
      )}

      {stand.status === 'occupied' && (
        <div className="text-center py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-500 text-sm font-medium">Currently Occupied</p>
        </div>
      )}

      {stand.status === 'maintenance' && (
        <div className="text-center py-2 px-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
          <p className="text-gray-500 text-sm font-medium">Under Maintenance</p>
        </div>
      )}
    </motion.div>
  );
};

export default StandPopup;
