import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map as MapIcon, Filter, Pencil } from 'lucide-react';
import MapContainer from '../components/map/MapContainer';
import StandPopup from '../components/map/StandPopup';
import StandFilter from '../components/map/StandFilter';
import { useAuth } from '../context/AuthContext';
import type { Stand } from '../types';
import type { StandFilters } from '../components/map/StandFilter';

const MapPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StandFilters>({ types: [], statuses: [] });
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);

  const handleStandClick = useCallback((stand: Stand) => {
    setSelectedStand(stand);
  }, []);

  const handleBookStand = useCallback((stand: Stand) => {
    // Navigate to booking page with pre-selected stand
    navigate(`/bookings/new?standId=${stand.id}`);
  }, [navigate]);

  const handleFilterChange = useCallback((newFilters: StandFilters) => {
    setFilters(newFilters);
    // Filter implementation would go here
    // For MVP, we're just storing the filters
    console.log('Filters updated:', newFilters);
  }, []);

  const handleStartDrawing = useCallback(() => {
    setIsDrawingBoundary(true);
    setShowFilters(false);
    setSelectedStand(null);
  }, []);

  const handleDrawingComplete = useCallback(() => {
    setIsDrawingBoundary(false);
  }, []);

  const handleDrawingCancel = useCallback(() => {
    setIsDrawingBoundary(false);
  }, []);

  // Check if user has permission to draw boundaries (owner or manager)
  const canDrawBoundaries = profile?.role === 'owner' || profile?.role === 'manager';

  return (
    <div className="h-screen flex flex-col pt-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6 px-4"
      >
        <div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            The Compound Map
          </h2>
          <p className="text-gray-400 text-lg flex items-center gap-2 mt-2">
            <MapIcon size={18} className="text-green-500" />
            Satellite view of your hunting property
          </p>
        </div>

        <div className="flex gap-2">
          {canDrawBoundaries && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartDrawing}
              disabled={isDrawingBoundary}
              className={`glass-panel-strong px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                isDrawingBoundary
                  ? 'border-green-500/30 bg-green-500/10 opacity-50 cursor-not-allowed'
                  : 'border-white/10 hover:border-green-500/30 hover:bg-green-500/10'
              }`}
            >
              <Pencil size={18} className={isDrawingBoundary ? 'text-green-400' : 'text-gray-300'} />
              <span className="text-sm font-medium text-gray-300 hidden sm:inline">Draw Boundary</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            disabled={isDrawingBoundary}
            className={`glass-panel-strong p-3 rounded-xl border transition-all ${
              showFilters
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-white/10 hover:border-white/20'
            } ${isDrawingBoundary ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Filter size={20} className={showFilters ? 'text-green-400' : 'text-gray-300'} />
          </motion.button>
        </div>
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 px-4"
      >
        <MapContainer
          clubId={profile?.clubId}
          onStandClick={handleStandClick}
          isDrawingBoundary={isDrawingBoundary}
          onBoundaryDrawComplete={handleDrawingComplete}
          onBoundaryDrawCancel={handleDrawingCancel}
        />
      </motion.div>

      {/* Stand Filter Panel */}
      <StandFilter
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onFilterChange={handleFilterChange}
      />

      {/* Stand Popup Overlay */}
      {selectedStand && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStand(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-md w-full"
          >
            <StandPopup
              stand={selectedStand}
              onBook={handleBookStand}
              onClose={() => setSelectedStand(null)}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MapPage;
