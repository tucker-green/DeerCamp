import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Save, X, MapPin } from 'lucide-react';
import type { Map as MapboxMap } from 'mapbox-gl';
import {
  createDrawControl,
  drawPolygonToBoundary,
  calculatePolygonAcres,
} from '../../utils/boundaryDrawHelpers';
import { usePropertyBoundaries } from '../../hooks/usePropertyBoundaries';
import { useAuth } from '../../context/AuthContext';
import type { PropertyBoundary } from '../../types';

interface PropertyBoundaryDrawerProps {
  map: MapboxMap;
  clubId: string;
  isDrawing: boolean;
  onDrawingComplete: () => void;
  onCancel: () => void;
}

const PropertyBoundaryDrawer = ({
  map,
  clubId,
  isDrawing,
  onDrawingComplete,
  onCancel,
}: PropertyBoundaryDrawerProps) => {
  const { profile } = useAuth();
  const { createBoundary } = usePropertyBoundaries(clubId);
  const drawRef = useRef<any>(null);
  const [drawnFeature, setDrawnFeature] = useState<any>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [boundaryName, setBoundaryName] = useState('');
  const [boundaryType, setBoundaryType] = useState<PropertyBoundary['boundaryType']>('property');
  const [ownerName, setOwnerName] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#3a6326');

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

      const result = await createBoundary({
        clubId,
        name: boundaryName || 'Unnamed Boundary',
        coordinates,
        acres,
        ownerName: ownerName.trim() || undefined,
        color,
        strokeWidth: 3,
        fillOpacity: 0.2,
        boundaryType,
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
        setBoundaryName('');
        setOwnerName('');
        setNotes('');
        onDrawingComplete();
      }
    } catch (error) {
      console.error('Error saving boundary:', error);
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
    setBoundaryName('');
    setOwnerName('');
    setNotes('');
    onCancel();
  };

  const handleDeleteDrawing = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    setShowSaveForm(false);
    setDrawnFeature(null);
    setBoundaryName('');
    setOwnerName('');
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
                  <p className="text-white font-medium">Draw Property Boundary</p>
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
              className="glass-panel-strong rounded-2xl border border-white/10 shadow-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <MapPin size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white">Save Boundary</h3>
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
                {/* Boundary Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Boundary Name
                  </label>
                  <input
                    type="text"
                    value={boundaryName}
                    onChange={(e) => setBoundaryName(e.target.value)}
                    placeholder="e.g., Main Property, North 40"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    disabled={saving}
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Property Owner (OnX Style)
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g., John Smith, State of Texas"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    disabled={saving}
                  />
                </div>

                {/* Boundary Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={boundaryType}
                    onChange={(e) => setBoundaryType(e.target.value as PropertyBoundary['boundaryType'])}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
                    disabled={saving}
                  >
                    <option value="property">Your Property</option>
                    <option value="neighbor">Neighbor Property</option>
                    <option value="public-land">Public Land</option>
                    <option value="buffer-zone">Buffer Zone</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {['#3a6326', '#8b5e3c', '#4a9eff', '#e63946', '#6b7280'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-white/20'
                          }`}
                        style={{ backgroundColor: c }}
                        disabled={saving}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this boundary..."
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
                    disabled={saving || !boundaryName.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Boundary'}
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

export default PropertyBoundaryDrawer;
