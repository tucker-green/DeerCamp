import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, X, Trash2 } from 'lucide-react';
import type { Map as MapboxMap, MapMouseEvent } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';

interface MeasureToolProps {
  map: MapboxMap;
  isActive: boolean;
  onClose: () => void;
}

interface MeasurePoint {
  lng: number;
  lat: number;
}

const MeasureTool = ({ map, isActive, onClose }: MeasureToolProps) => {
  const [startPoint, setStartPoint] = useState<MeasurePoint | null>(null);
  const [endPoint, setEndPoint] = useState<MeasurePoint | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1: MeasurePoint, point2: MeasurePoint): number => {
    const R = 3958.8; // Earth radius in miles
    const lat1 = (point1.lat * Math.PI) / 180;
    const lat2 = (point2.lat * Math.PI) / 180;
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const miles = R * c;

    return Math.round(miles * 1760); // Convert to yards
  };

  // Format distance for display
  const formatDistance = (yards: number): string => {
    if (yards < 1760) {
      return `${yards} yd`;
    } else {
      const miles = (yards / 1760).toFixed(2);
      return `${miles} mi`;
    }
  };

  // Handle map clicks
  useEffect(() => {
    if (!map || !isActive) return;

    const handleMapClick = (e: MapMouseEvent) => {
      const point: MeasurePoint = { lng: e.lngLat.lng, lat: e.lngLat.lat };

      if (!startPoint) {
        // First click - set start point
        setStartPoint(point);
        setEndPoint(null);
        setDistance(null);
      } else {
        // Second click - set end point and calculate distance
        setEndPoint(point);
        const dist = calculateDistance(startPoint, point);
        setDistance(dist);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isActive, startPoint]);

  // Add markers and line to the map
  useEffect(() => {
    if (!map || !isActive) return;

    const MEASURE_SOURCE_ID = 'measure-line';
    const MEASURE_LAYER_ID = 'measure-line-layer';
    const MEASURE_POINTS_LAYER_ID = 'measure-points-layer';

    // Remove existing layers and sources
    if (map.getLayer(MEASURE_LAYER_ID)) {
      map.removeLayer(MEASURE_LAYER_ID);
    }
    if (map.getLayer(MEASURE_POINTS_LAYER_ID)) {
      map.removeLayer(MEASURE_POINTS_LAYER_ID);
    }
    if (map.getSource(MEASURE_SOURCE_ID)) {
      map.removeSource(MEASURE_SOURCE_ID);
    }

    // If we have both points, draw the line
    if (startPoint && endPoint) {
      const lineGeoJSON = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [startPoint.lng, startPoint.lat],
                [endPoint.lng, endPoint.lat],
              ],
            },
            properties: {},
          },
        ],
      };

      map.addSource(MEASURE_SOURCE_ID, {
        type: 'geojson',
        data: lineGeoJSON,
      });

      // Add line layer
      map.addLayer({
        id: MEASURE_LAYER_ID,
        type: 'line',
        source: MEASURE_SOURCE_ID,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });

      // Add points layer
      const pointsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [startPoint.lng, startPoint.lat],
            },
            properties: { type: 'start' },
          },
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [endPoint.lng, endPoint.lat],
            },
            properties: { type: 'end' },
          },
        ],
      };

      const pointsSourceId = 'measure-points';
      if (map.getSource(pointsSourceId)) {
        (map.getSource(pointsSourceId) as any).setData(pointsGeoJSON);
      } else {
        map.addSource(pointsSourceId, {
          type: 'geojson',
          data: pointsGeoJSON,
        });
      }

      map.addLayer({
        id: MEASURE_POINTS_LAYER_ID,
        type: 'circle',
        source: pointsSourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': '#3b82f6',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
    } else if (startPoint) {
      // Only start point - show single point
      const pointGeoJSON = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [startPoint.lng, startPoint.lat],
            },
            properties: {},
          },
        ],
      };

      const pointsSourceId = 'measure-points';
      if (map.getSource(pointsSourceId)) {
        (map.getSource(pointsSourceId) as any).setData(pointGeoJSON);
      } else {
        map.addSource(pointsSourceId, {
          type: 'geojson',
          data: pointGeoJSON,
        });
      }

      if (!map.getLayer(MEASURE_POINTS_LAYER_ID)) {
        map.addLayer({
          id: MEASURE_POINTS_LAYER_ID,
          type: 'circle',
          source: pointsSourceId,
          paint: {
            'circle-radius': 6,
            'circle-color': '#3b82f6',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
          },
        });
      }
    }

    // Cleanup on unmount or when tool is closed
    return () => {
      if (map.getLayer(MEASURE_LAYER_ID)) {
        map.removeLayer(MEASURE_LAYER_ID);
      }
      if (map.getLayer(MEASURE_POINTS_LAYER_ID)) {
        map.removeLayer(MEASURE_POINTS_LAYER_ID);
      }
      if (map.getSource(MEASURE_SOURCE_ID)) {
        map.removeSource(MEASURE_SOURCE_ID);
      }
      if (map.getSource('measure-points')) {
        map.removeSource('measure-points');
      }
    };
  }, [map, isActive, startPoint, endPoint]);

  // Clear measurement
  const handleClear = () => {
    setStartPoint(null);
    setEndPoint(null);
    setDistance(null);
  };

  // Change cursor when tool is active
  useEffect(() => {
    if (!map) return;

    if (isActive) {
      map.getCanvas().style.cursor = 'crosshair';
    } else {
      map.getCanvas().style.cursor = '';
    }

    return () => {
      if (map) {
        map.getCanvas().style.cursor = '';
      }
    };
  }, [map, isActive]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-28 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="glass-panel-strong rounded-2xl border border-white/10 shadow-2xl p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Ruler size={16} className="text-blue-400" />
              </div>
              <h3 className="font-heading font-bold text-white">Measure Distance</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-sm">
            {!startPoint && (
              <p className="text-gray-400">Click on the map to set the first point</p>
            )}
            {startPoint && !endPoint && (
              <p className="text-green-400">✓ First point set. Click again for second point</p>
            )}
            {startPoint && endPoint && distance !== null && (
              <div className="space-y-2">
                <p className="text-green-400">✓ Measurement complete</p>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {formatDistance(distance)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {distance} yards
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {(startPoint || endPoint) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              className="w-full mt-3 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Clear Measurement
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MeasureTool;
