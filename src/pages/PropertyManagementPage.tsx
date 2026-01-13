import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapIcon, Trash2, Edit3, Eye,
  ChevronDown, ChevronRight, AlertCircle,
  Users, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePropertyBoundaries } from '../hooks/usePropertyBoundaries';
import { useFoodPlots } from '../hooks/useFoodPlots';
import { useAccessRoutes } from '../hooks/useAccessRoutes';
import { useTerrainFeatures } from '../hooks/useTerrainFeatures';
import { useTrailCameras } from '../hooks/useTrailCameras';

const PropertyManagementPage = () => {
  const { activeClubId, activeMembership } = useAuth();
  const { boundaries, loading: boundariesLoading, deleteBoundary } = usePropertyBoundaries(activeClubId);
  const { foodPlots, loading: foodPlotsLoading, deleteFoodPlot } = useFoodPlots(activeClubId);
  const { routes, loading: routesLoading, deleteRoute } = useAccessRoutes(activeClubId);
  const { features, loading: featuresLoading, deleteFeature } = useTerrainFeatures(activeClubId);
  const { cameras, loading: camerasLoading, deleteCamera } = useTrailCameras(activeClubId);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['boundaries']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Check permissions
  const canManage = activeMembership?.role === 'owner' || activeMembership?.role === 'manager';

  if (!canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel-strong p-8 rounded-2xl border border-red-500/20 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={24} />
            <h2 className="text-xl font-heading font-bold text-white">Access Denied</h2>
          </div>
          <p className="text-gray-400">
            Only owners and managers can access the Property Management page.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = boundariesLoading || foodPlotsLoading || routesLoading || featuresLoading || camerasLoading;

  // Calculate statistics
  const totalAcres = boundaries.reduce((sum, b) => sum + (b.acres || 0), 0) +
    foodPlots.reduce((sum, p) => sum + (p.acres || 0), 0);
  const totalFeatures = boundaries.length + foodPlots.length + routes.length + features.length + cameras.length;

  return (
    <div className="min-h-screen pt-6 pb-20 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Property Management
        </h2>
        <p className="text-gray-400 text-lg flex items-center gap-2 mt-2">
          <MapIcon size={18} className="text-blue-500" />
          Manage all property features and overlays
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel-strong p-4 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <MapIcon size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Acreage</p>
              <p className="text-2xl font-bold text-white">{totalAcres.toFixed(1)} ac</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-panel-strong p-4 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Features</p>
              <p className="text-2xl font-bold text-white">{totalFeatures}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel-strong p-4 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Boundaries</p>
              <p className="text-2xl font-bold text-white">{boundaries.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading property data...</p>
          </div>
        </div>
      )}

      {/* Property Boundaries Section */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          {/* Boundaries */}
          <div className="glass-panel-strong rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('boundaries')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('boundaries') ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400" />
                )}
                <span className="text-lg font-heading font-bold text-white">
                  Property Boundaries ({boundaries.length})
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {boundaries.reduce((sum, b) => sum + (b.acres || 0), 0).toFixed(1)} acres
              </span>
            </button>

            {expandedSections.has('boundaries') && (
              <div className="border-t border-white/10">
                {boundaries.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No property boundaries defined yet
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {boundaries.map(boundary => (
                      <div key={boundary.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: boundary.color || '#3a6326' }}
                              />
                              <h4 className="font-medium text-white">{boundary.name}</h4>
                              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400 capitalize">
                                {boundary.boundaryType.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              {boundary.acres && <span>{boundary.acres.toFixed(1)} acres</span>}
                              <span>{boundary.coordinates.length} points</span>
                            </div>
                            {boundary.notes && (
                              <p className="text-sm text-gray-500 mt-1">{boundary.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteBoundary(boundary.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                              title="Delete boundary"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Food Plots */}
          <div className="glass-panel-strong rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('foodPlots')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('foodPlots') ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400" />
                )}
                <span className="text-lg font-heading font-bold text-white">
                  Food Plots ({foodPlots.length})
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {foodPlots.reduce((sum, p) => sum + p.acres, 0).toFixed(1)} acres
              </span>
            </button>

            {expandedSections.has('foodPlots') && (
              <div className="border-t border-white/10">
                {foodPlots.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No food plots defined yet
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {foodPlots.map(plot => (
                      <div key={plot.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{plot.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              <span>{plot.acres.toFixed(1)} acres</span>
                              {plot.plantedWith && <span>🌱 {plot.plantedWith}</span>}
                              {plot.plantDate && <span>Planted {new Date(plot.plantDate).toLocaleDateString()}</span>}
                            </div>
                            {plot.notes && (
                              <p className="text-sm text-gray-500 mt-1">{plot.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteFoodPlot(plot.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                              title="Delete food plot"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Access Routes */}
          <div className="glass-panel-strong rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('routes')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('routes') ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400" />
                )}
                <span className="text-lg font-heading font-bold text-white">
                  Access Routes ({routes.length})
                </span>
              </div>
            </button>

            {expandedSections.has('routes') && (
              <div className="border-t border-white/10">
                {routes.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No access routes defined yet
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {routes.map(route => (
                      <div key={route.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{route.name}</h4>
                              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400 capitalize">
                                {route.type.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              {route.lengthYards && <span>{route.lengthYards} yards</span>}
                              {route.difficulty && <span className="capitalize">{route.difficulty}</span>}
                            </div>
                            {route.notes && (
                              <p className="text-sm text-gray-500 mt-1">{route.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteRoute(route.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                              title="Delete route"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Terrain Features */}
          <div className="glass-panel-strong rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('features')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('features') ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400" />
                )}
                <span className="text-lg font-heading font-bold text-white">
                  Terrain Features ({features.length})
                </span>
              </div>
            </button>

            {expandedSections.has('features') && (
              <div className="border-t border-white/10">
                {features.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No terrain features defined yet
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {features.map(feature => (
                      <div key={feature.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{feature.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              <span className="capitalize">{feature.type.replace('-', ' ')}</span>
                              {feature.radius && <span>{feature.radius} yard radius</span>}
                            </div>
                            {feature.description && (
                              <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteFeature(feature.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                              title="Delete feature"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trail Cameras */}
          <div className="glass-panel-strong rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection('cameras')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has('cameras') ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400" />
                )}
                <span className="text-lg font-heading font-bold text-white">
                  Trail Cameras ({cameras.length})
                </span>
              </div>
            </button>

            {expandedSections.has('cameras') && (
              <div className="border-t border-white/10">
                {cameras.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No trail cameras defined yet
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {cameras.map(camera => (
                      <div key={camera.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{camera.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              {camera.model && <span>{camera.model}</span>}
                              {camera.batteryLevel !== undefined && (
                                <span className={
                                  camera.batteryLevel < 30 ? 'text-red-400' :
                                  camera.batteryLevel < 60 ? 'text-amber-400' :
                                  'text-green-400'
                                }>
                                  🔋 {camera.batteryLevel}%
                                </span>
                              )}
                              {camera.lastChecked && (
                                <span>Checked {new Date(camera.lastChecked).toLocaleDateString()}</span>
                              )}
                            </div>
                            {camera.notes && (
                              <p className="text-sm text-gray-500 mt-1">{camera.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteCamera(camera.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                              title="Delete camera"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PropertyManagementPage;
