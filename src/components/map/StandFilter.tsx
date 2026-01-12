import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import type { Stand } from '../../types';

interface StandFilterProps {
  onFilterChange: (filters: StandFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface StandFilters {
  types: Stand['type'][];
  statuses: Stand['status'][];
}

const StandFilter = ({ onFilterChange, isOpen, onClose }: StandFilterProps) => {
  const [filters, setFilters] = useState<StandFilters>({
    types: [],
    statuses: [],
  });

  const toggleType = (type: Stand['type']) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    const newFilters = { ...filters, types: newTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStatus = (status: Stand['status']) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    const newFilters = { ...filters, statuses: newStatuses };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: StandFilters = {
      types: [],
      statuses: [],
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed left-4 top-24 z-40 glass-panel-strong rounded-2xl border border-white/10 p-6 w-80 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <Filter size={20} />
              Filter Stands
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Stand Type Filters */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-400 mb-2">Stand Type</p>
            <div className="flex flex-wrap gap-2">
              {(['ladder', 'climber', 'blind', 'box'] as Stand['type'][]).map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    filters.types.includes(type)
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-400 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {(['available', 'reserved', 'occupied', 'maintenance'] as Stand['status'][]).map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    filters.statuses.includes(status)
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-medium border border-white/10 transition-colors"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StandFilter;
