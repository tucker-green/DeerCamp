import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Save, X } from 'lucide-react';
import type { Map as MapboxMap } from 'mapbox-gl';
import {
  createDrawControl,
  drawLineToRoute,
  calculateLineYards,
} from '../../utils/boundaryDrawHelpers';
import { useAccessRoutes } from '../../hooks/useAccessRoutes';
import { useAuth } from '../../context/AuthContext';
import type { AccessRouteType } from '../../types';

interface AccessRouteDrawerProps {
  map: MapboxMap;
  clubId: string;
  isDrawing: boolean;
  onDrawingComplete: () => void;
  onCancel: () => void;
}

const AccessRouteDrawer = ({
  map,
  clubId,
  isDrawing,
  onDrawingComplete,
  onCancel,
}: AccessRouteDrawerProps) => {
  const { profile } = useAuth();
  const { createRoute } = useAccessRoutes(clubId);
  const drawRef = useRef<any>(null);
  const [drawnFeature, setDrawnFeature] = useState<any>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [routeName, setRouteName] = useState('');
  const [routeType, setRouteType] = useState<AccessRouteType>('walking-path');
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'difficult'>('easy');
  const [seasonal, setSeasonal] = useState(false);
  const [seasonalNotes, setSeasonalNotes] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!map || !isDrawing) return;

    // Add draw control to map
    const draw = createDrawControl();
    drawRef.current = draw;
    map.addControl(draw as any, 'top-left');

    // Start drawing line mode
    draw.changeMode('draw_line_string');

    // Listen for drawing completion
    const handleDrawCreate = (e: any) => {
      const feature = e.features[0];
      setDrawnFeature(feature);
      setShowSaveForm(true);
    };

    map.on('draw.create', handleDrawCreate);

    return () => {
      if (drawRef.current) {
        map.off('draw.create', handleDrawCreate);
        map.removeControl(drawRef.current);
        drawRef.current = null;
      }
    };
  }, [map, isDrawing]);

  const handleSave = async () => {
    if (!drawnFeature || !profile) return;

    setSaving(true);
    try {
      const coordinates = drawLineToRoute(drawnFeature);
      const lengthYards = calculateLineYards(coordinates);

      const result = await createRoute({
        clubId,
        name: routeName || 'Unnamed Route',
        type: routeType,
        coordinates,
        lengthYards,
        difficulty,
        seasonal: seasonal || undefined,
        seasonalNotes: seasonal && seasonalNotes ? seasonalNotes : undefined,
        notes: notes || undefined,
        createdBy: profile.uid,
      });

      if (result.success) {
        // Clean up
        if (drawRef.current) {
          drawRef.current.deleteAll();
        }
        setShowSaveForm(false);
        setDrawnFeature(null);
        setRouteName('');
        setRouteType('walking-path');
        setDifficulty('easy');
        setSeasonal(false);
        setSeasonalNotes('');
        setNotes('');
        onDrawingComplete();
      }
    } catch (error) {
      console.error('Error saving access route:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    setShowSaveForm(false);
    setDrawnFeature(null);
    setRouteName('');
    setNotes('');
    onCancel();
  };

  const handleDeleteDrawing = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    setShowSaveForm(false);
    setDrawnFeature(null);
  };

  const lengthYards = drawnFeature ? calculateLineYards(drawLineToRoute(drawnFeature)) : 0;
  const lengthMiles = (lengthYards / 1760).toFixed(2);

  return (
    <>
      {/* Drawing Instructions Overlay */}
      <AnimatePresence>
        {isDrawing && !showSaveForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="glass-panel-strong px-6 py-4 rounded-2xl border border-amber-500/30 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Route size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Draw Access Route</p>
                  <p className="text-gray-400 text-sm">Click to add points, double-click to finish</p>
                </div>
                <button
                  onClick={handleCancel}
                  className="ml-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Form Modal */}
      <AnimatePresence>
        {showSaveForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleCancel()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel-strong rounded-2xl border border-white/10 shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Route size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white">Save Access Route</h3>
                    <p className="text-gray-400 text-sm">{lengthYards} yards ({lengthMiles} mi)</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteDrawing}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                  disabled={saving}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Route Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Route Name
                  </label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g., Main Road, Back Trail"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    disabled={saving}
                  />
                </div>

                {/* Route Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Route Type
                  </label>
                  <select
                    value={routeType}
                    onChange={(e) => setRouteType(e.target.value as AccessRouteType)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    disabled={saving}
                  >
                    <option value="road">Road (Vehicle Access)</option>
                    <option value="atv-trail">ATV Trail</option>
                    <option value="walking-path">Walking Path</option>
                    <option value="quiet-approach">Quiet Approach</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <div className="flex gap-2">
                    {(['easy', 'moderate', 'difficult'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        disabled={saving}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                          difficulty === level
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seasonal */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seasonal}
                      onChange={(e) => setSeasonal(e.target.checked)}
                      disabled={saving}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <span className="text-sm text-gray-300">Seasonal route (not always passable)</span>
                  </label>
                </div>

                {/* Seasonal Notes */}
                {seasonal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Seasonal Notes
                    </label>
                    <input
                      type="text"
                      value={seasonalNotes}
                      onChange={(e) => setSeasonalNotes(e.target.value)}
                      placeholder="e.g., Creek crossing - summer only"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      disabled={saving}
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about surface, landmarks, etc..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    disabled={saving}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-all"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !routeName.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Route'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessRouteDrawer;
