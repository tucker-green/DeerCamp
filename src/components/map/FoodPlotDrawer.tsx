import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Save, X, Sprout } from 'lucide-react';
import type { Map as MapboxMap } from 'mapbox-gl';
import {
  createDrawControl,
  drawPolygonToBoundary,
  calculatePolygonAcres,
} from '../../utils/boundaryDrawHelpers';
import { useFoodPlots } from '../../hooks/useFoodPlots';
import { useAuth } from '../../context/AuthContext';

interface FoodPlotDrawerProps {
  map: MapboxMap;
  clubId: string;
  isDrawing: boolean;
  onDrawingComplete: () => void;
  onCancel: () => void;
}

const CROP_OPTIONS = [
  'Clover',
  'Corn',
  'Soybeans',
  'Brassicas',
  'Oats',
  'Winter Wheat',
  'Turnips',
  'Radishes',
  'Alfalfa',
  'Chicory',
  'Mixed Plot',
  'Other',
];

const FoodPlotDrawer = ({
  map,
  clubId,
  isDrawing,
  onDrawingComplete,
  onCancel,
}: FoodPlotDrawerProps) => {
  const { profile } = useAuth();
  const { createFoodPlot } = useFoodPlots(clubId);
  const drawRef = useRef<any>(null);
  const [drawnFeature, setDrawnFeature] = useState<any>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [plotName, setPlotName] = useState('');
  const [plantedWith, setPlantedWith] = useState('Clover');
  const [plantDate, setPlantDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!map || !isDrawing) return;

    // Add draw control to map
    const draw = createDrawControl();
    drawRef.current = draw;
    map.addControl(draw as any, 'top-left');

    // Start drawing polygon mode
    draw.changeMode('draw_polygon');

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
      const coordinates = drawPolygonToBoundary(drawnFeature);
      const acres = calculatePolygonAcres(coordinates);

      const result = await createFoodPlot({
        clubId,
        name: plotName || 'Unnamed Food Plot',
        coordinates,
        acres,
        plantedWith,
        plantDate: plantDate || undefined,
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
        setPlotName('');
        setPlantedWith('Clover');
        setPlantDate('');
        setNotes('');
        onDrawingComplete();
      }
    } catch (error) {
      console.error('Error saving food plot:', error);
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
    setPlotName('');
    setPlantDate('');
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

  const acres = drawnFeature ? calculatePolygonAcres(drawPolygonToBoundary(drawnFeature)) : 0;

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
            <div className="glass-panel-strong px-6 py-4 rounded-2xl border border-green-500/30 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Pencil size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Draw Food Plot</p>
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
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Sprout size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white">Save Food Plot</h3>
                    <p className="text-gray-400 text-sm">{acres} acres</p>
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
                {/* Plot Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plot Name
                  </label>
                  <input
                    type="text"
                    value={plotName}
                    onChange={(e) => setPlotName(e.target.value)}
                    placeholder="e.g., North Field, Big Plot"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    disabled={saving}
                  />
                </div>

                {/* Planted With */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Crop Type
                  </label>
                  <select
                    value={plantedWith}
                    onChange={(e) => setPlantedWith(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    disabled={saving}
                  >
                    {CROP_OPTIONS.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plant Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plant Date (optional)
                  </label>
                  <input
                    type="date"
                    value={plantDate}
                    onChange={(e) => setPlantDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    disabled={saving}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about fertilizer, seed rate, etc..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
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
                    disabled={saving || !plotName.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Plot'}
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

export default FoodPlotDrawer;
