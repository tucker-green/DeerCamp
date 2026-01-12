import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Layers } from 'lucide-react';

export interface LayerVisibility {
  stands: boolean;
  propertyBoundaries: boolean;
  foodPlots: boolean;
  accessRoutes: boolean;
  terrainFeatures: boolean;
  trailCameras: boolean;
  distanceRings: boolean;
}

interface LayerControlsProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: LayerVisibility;
  onVisibilityChange: (layer: keyof LayerVisibility, visible: boolean) => void;
}

const LAYER_LABELS: Record<keyof LayerVisibility, { label: string; icon: string; color: string }> = {
  stands: { label: 'Hunting Stands', icon: '🪜', color: '#3a6326' },
  propertyBoundaries: { label: 'Property Lines', icon: '📐', color: '#8b5e3c' },
  foodPlots: { label: 'Food Plots', icon: '🌱', color: '#52b788' },
  accessRoutes: { label: 'Access Routes', icon: '🛤️', color: '#d4a373' },
  terrainFeatures: { label: 'Terrain Intel', icon: '🗺️', color: '#4a9eff' },
  trailCameras: { label: 'Trail Cameras', icon: '📷', color: '#6b7280' },
  distanceRings: { label: 'Range Rings', icon: '🎯', color: '#e9c46a' },
};

const LayerControls = ({ isOpen, onClose, visibility, onVisibilityChange }: LayerControlsProps) => {
  const handleToggle = (layer: keyof LayerVisibility) => {
    onVisibilityChange(layer, !visibility[layer]);
  };

  const allLayersVisible = Object.values(visibility).every(v => v);
  const noLayersVisible = Object.values(visibility).every(v => !v);

  const handleShowAll = () => {
    Object.keys(visibility).forEach(key => {
      onVisibilityChange(key as keyof LayerVisibility, true);
    });
  };

  const handleHideAll = () => {
    Object.keys(visibility).forEach(key => {
      onVisibilityChange(key as keyof LayerVisibility, false);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-24 right-4 bottom-4 w-80 glass-panel-strong rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Layers size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white">Map Layers</h3>
                  <p className="text-xs text-gray-400">Toggle overlays</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={handleShowAll}
                  disabled={allLayersVisible}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  Show All
                </button>
                <button
                  onClick={handleHideAll}
                  disabled={noLayersVisible}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <EyeOff size={14} />
                  Hide All
                </button>
              </div>
            </div>

            {/* Layer List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(Object.keys(LAYER_LABELS) as Array<keyof LayerVisibility>).map(layer => (
                <motion.button
                  key={layer}
                  onClick={() => handleToggle(layer)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                    visibility[layer]
                      ? 'bg-white/5 border-white/20'
                      : 'bg-white/[0.02] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: visibility[layer]
                          ? `${LAYER_LABELS[layer].color}20`
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {LAYER_LABELS[layer].icon}
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                      {LAYER_LABELS[layer].label}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-11 h-6 rounded-full transition-all relative ${
                      visibility[layer] ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                      style={{
                        left: visibility[layer] ? '22px' : '2px',
                      }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                {Object.values(visibility).filter(v => v).length} of {Object.keys(visibility).length} layers visible
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LayerControls;
