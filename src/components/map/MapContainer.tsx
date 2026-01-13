import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../hooks/useMapbox';
import { useStands } from '../../hooks/useStands';
import { usePropertyBoundaries } from '../../hooks/usePropertyBoundaries';
import { useFoodPlots } from '../../hooks/useFoodPlots';
import { useAccessRoutes } from '../../hooks/useAccessRoutes';
import { useTerrainFeatures } from '../../hooks/useTerrainFeatures';
import { useTrailCameras } from '../../hooks/useTrailCameras';
import { createStandMarkerElement } from '../../utils/standMarkerHelpers';
import { createTerrainFeatureMarkerElement } from '../../utils/terrainFeatureHelpers';
import { boundaryToGeoJSON, foodPlotToGeoJSON, routeToGeoJSON, createCircle } from '../../utils/boundaryDrawHelpers';
import PropertyBoundaryDrawer from './PropertyBoundaryDrawer';
import FoodPlotDrawer from './FoodPlotDrawer';
import AccessRouteDrawer from './AccessRouteDrawer';
import MeasureTool from './MeasureTool';
import type { Stand } from '../../types';
import type { LayerVisibility } from './LayerControls';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  clubId?: string;
  onStandClick?: (stand: Stand) => void;
  selectedStandForRings?: string; // Stand ID to show distance rings around
  showDistanceRings?: boolean;
  layerVisibility?: LayerVisibility;
  isDrawingBoundary?: boolean;
  onBoundaryDrawComplete?: () => void;
  onBoundaryDrawCancel?: () => void;
  isDrawingFoodPlot?: boolean;
  onFoodPlotDrawComplete?: () => void;
  onFoodPlotDrawCancel?: () => void;
  isDrawingAccessRoute?: boolean;
  onAccessRouteDrawComplete?: () => void;
  onAccessRouteDrawCancel?: () => void;
  isMeasuring?: boolean;
  onMeasureClose?: () => void;
}

const MapContainer = ({
  center,
  zoom,
  clubId,
  onStandClick,
  selectedStandForRings,
  showDistanceRings = true,
  layerVisibility = {
    stands: true,
    propertyBoundaries: true,
    foodPlots: true,
    accessRoutes: true,
    terrainFeatures: true,
    trailCameras: true,
    distanceRings: true,
  },
  isDrawingBoundary = false,
  onBoundaryDrawComplete,
  onBoundaryDrawCancel,
  isDrawingFoodPlot = false,
  onFoodPlotDrawComplete,
  onFoodPlotDrawCancel,
  isDrawingAccessRoute = false,
  onAccessRouteDrawComplete,
  onAccessRouteDrawCancel,
  isMeasuring = false,
  onMeasureClose,
}: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, error } = useMapbox(mapContainerRef, { center, zoom });
  const { stands, loading: standsLoading } = useStands();
  const { boundaries, loading: boundariesLoading } = usePropertyBoundaries(clubId);
  const { foodPlots, loading: foodPlotsLoading } = useFoodPlots(clubId);
  const { routes, loading: routesLoading } = useAccessRoutes(clubId);
  const { features, loading: featuresLoading } = useTerrainFeatures(clubId);
  const { cameras, loading: camerasLoading } = useTrailCameras(clubId);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const featureMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const cameraMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Add stand markers to the map
  useEffect(() => {
    if (!map || !isLoaded || standsLoading) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Early return if stands layer is hidden
    if (!layerVisibility.stands) return;

    // Add new markers for each stand
    stands.forEach(stand => {
      const el = createStandMarkerElement(stand);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([stand.lng, stand.lat])
        .addTo(map);

      // Click handler for marker
      el.addEventListener('click', () => {
        onStandClick?.(stand);
      });

      markersRef.current.set(stand.id, marker);
    });

    // Fit bounds to show all stands
    if (stands.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      stands.forEach(stand => bounds.extend([stand.lng, stand.lat]));
      map.fitBounds(bounds, { padding: 100, maxZoom: 16 });
    }

    // Cleanup markers on unmount
    return () => {
      markersRef.current.forEach(marker => marker.remove());
    };
  }, [map, isLoaded, stands, standsLoading, onStandClick, layerVisibility.stands]);

  // Add property boundaries to the map
  useEffect(() => {
    if (!map || !isLoaded || boundariesLoading) return;

    const BOUNDARY_SOURCE_ID = 'property-boundaries';
    const BOUNDARY_LAYER_FILL_ID = 'property-boundaries-fill';
    const BOUNDARY_LAYER_LINE_ID = 'property-boundaries-line';

    // Remove existing source and layers if they exist
    if (map.getLayer(BOUNDARY_LAYER_FILL_ID)) {
      map.removeLayer(BOUNDARY_LAYER_FILL_ID);
    }
    if (map.getLayer(BOUNDARY_LAYER_LINE_ID)) {
      map.removeLayer(BOUNDARY_LAYER_LINE_ID);
    }
    if (map.getSource(BOUNDARY_SOURCE_ID)) {
      map.removeSource(BOUNDARY_SOURCE_ID);
    }

    // Early return if property boundaries layer is hidden
    if (!layerVisibility.propertyBoundaries) return;

    // Add source with boundary features
    const geojsonFeatures = boundaries.map(boundaryToGeoJSON);
    map.addSource(BOUNDARY_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geojsonFeatures,
      },
    });

    // Add fill layer
    map.addLayer({
      id: BOUNDARY_LAYER_FILL_ID,
      type: 'fill',
      source: BOUNDARY_SOURCE_ID,
      paint: {
        'fill-color': ['get', 'color', ['properties']],
        'fill-opacity': 0.2,
      },
    });

    // Add line layer
    map.addLayer({
      id: BOUNDARY_LAYER_LINE_ID,
      type: 'line',
      source: BOUNDARY_SOURCE_ID,
      paint: {
        'line-color': ['get', 'color', ['properties']],
        'line-width': 3,
      },
    });

    // Cleanup on unmount
    return () => {
      if (!map || !map.getStyle()) return;
      if (map.getLayer(BOUNDARY_LAYER_FILL_ID)) {
        map.removeLayer(BOUNDARY_LAYER_FILL_ID);
      }
      if (map.getLayer(BOUNDARY_LAYER_LINE_ID)) {
        map.removeLayer(BOUNDARY_LAYER_LINE_ID);
      }
      if (map.getSource(BOUNDARY_SOURCE_ID)) {
        map.removeSource(BOUNDARY_SOURCE_ID);
      }
    };
  }, [map, isLoaded, boundaries, boundariesLoading, layerVisibility.propertyBoundaries]);

  // Add food plots to the map
  useEffect(() => {
    if (!map || !isLoaded || foodPlotsLoading) return;

    const FOOD_PLOT_SOURCE_ID = 'food-plots';
    const FOOD_PLOT_LAYER_FILL_ID = 'food-plots-fill';
    const FOOD_PLOT_LAYER_LINE_ID = 'food-plots-line';

    // Remove existing source and layers if they exist
    if (map.getLayer(FOOD_PLOT_LAYER_FILL_ID)) {
      map.removeLayer(FOOD_PLOT_LAYER_FILL_ID);
    }
    if (map.getLayer(FOOD_PLOT_LAYER_LINE_ID)) {
      map.removeLayer(FOOD_PLOT_LAYER_LINE_ID);
    }
    if (map.getSource(FOOD_PLOT_SOURCE_ID)) {
      map.removeSource(FOOD_PLOT_SOURCE_ID);
    }

    // Early return if food plots layer is hidden
    if (!layerVisibility.foodPlots) return;

    // Add source with food plot features
    const geojsonFeatures = foodPlots.map(foodPlotToGeoJSON);
    map.addSource(FOOD_PLOT_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geojsonFeatures,
      },
    });

    // Add fill layer (bright green for food plots)
    map.addLayer({
      id: FOOD_PLOT_LAYER_FILL_ID,
      type: 'fill',
      source: FOOD_PLOT_SOURCE_ID,
      paint: {
        'fill-color': '#52b788',
        'fill-opacity': 0.3,
      },
    });

    // Add line layer
    map.addLayer({
      id: FOOD_PLOT_LAYER_LINE_ID,
      type: 'line',
      source: FOOD_PLOT_SOURCE_ID,
      paint: {
        'line-color': '#52b788',
        'line-width': 3,
      },
    });

    // Cleanup on unmount
    return () => {
      if (!map || !map.getStyle()) return;
      if (map.getLayer(FOOD_PLOT_LAYER_FILL_ID)) {
        map.removeLayer(FOOD_PLOT_LAYER_FILL_ID);
      }
      if (map.getLayer(FOOD_PLOT_LAYER_LINE_ID)) {
        map.removeLayer(FOOD_PLOT_LAYER_LINE_ID);
      }
      if (map.getSource(FOOD_PLOT_SOURCE_ID)) {
        map.removeSource(FOOD_PLOT_SOURCE_ID);
      }
    };
  }, [map, isLoaded, foodPlots, foodPlotsLoading, layerVisibility.foodPlots]);

  // Add access routes to the map
  useEffect(() => {
    if (!map || !isLoaded || routesLoading) return;

    const ROUTE_SOURCE_ID = 'access-routes';
    const ROUTE_LAYER_ID = 'access-routes-line';

    // Remove existing source and layers if they exist
    if (map.getLayer(ROUTE_LAYER_ID)) {
      map.removeLayer(ROUTE_LAYER_ID);
    }
    if (map.getSource(ROUTE_SOURCE_ID)) {
      map.removeSource(ROUTE_SOURCE_ID);
    }

    // Early return if access routes layer is hidden
    if (!layerVisibility.accessRoutes) return;

    // Add source with route features
    const geojsonFeatures = routes.map(routeToGeoJSON);
    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geojsonFeatures,
      },
    });

    // Color mapping for route types
    const routeColors: any = {
      'road': '#8b5e3c',
      'atv-trail': '#d4a373',
      'walking-path': '#e9c46a',
      'quiet-approach': '#6b7280',
    };

    // Add line layer with color based on route type
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      paint: {
        'line-color': [
          'match',
          ['get', 'type'],
          'road', routeColors['road'],
          'atv-trail', routeColors['atv-trail'],
          'walking-path', routeColors['walking-path'],
          'quiet-approach', routeColors['quiet-approach'],
          '#d4a373', // default
        ],
        'line-width': 4,
        'line-opacity': 0.8,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    });

    // Cleanup on unmount
    return () => {
      if (!map || !map.getStyle()) return;
      if (map.getLayer(ROUTE_LAYER_ID)) {
        map.removeLayer(ROUTE_LAYER_ID);
      }
      if (map.getSource(ROUTE_SOURCE_ID)) {
        map.removeSource(ROUTE_SOURCE_ID);
      }
    };
  }, [map, isLoaded, routes, routesLoading, layerVisibility.accessRoutes]);

  // Add terrain feature markers to the map
  useEffect(() => {
    if (!map || !isLoaded || featuresLoading) return;

    // Remove old markers
    featureMarkersRef.current.forEach(marker => marker.remove());
    featureMarkersRef.current.clear();

    // Early return if terrain features layer is hidden
    if (!layerVisibility.terrainFeatures) return;

    // Add new markers for each terrain feature
    features.forEach(feature => {
      const el = createTerrainFeatureMarkerElement(feature.type);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([feature.lng, feature.lat])
        .addTo(map);

      // Add radius circle if specified
      if (feature.radius && feature.radius > 0) {
        const CIRCLE_SOURCE_ID = `terrain-feature-circle-${feature.id}`;
        const CIRCLE_LAYER_ID = `terrain-feature-circle-layer-${feature.id}`;

        // Remove existing circle if it exists
        if (map.getLayer(CIRCLE_LAYER_ID)) {
          map.removeLayer(CIRCLE_LAYER_ID);
        }
        if (map.getSource(CIRCLE_SOURCE_ID)) {
          map.removeSource(CIRCLE_SOURCE_ID);
        }

        // Create circle
        const radiusInMeters = feature.radius * 0.9144; // Convert yards to meters
        const circleGeoJSON = createCircle([feature.lng, feature.lat], radiusInMeters);

        map.addSource(CIRCLE_SOURCE_ID, {
          type: 'geojson',
          data: circleGeoJSON,
        });

        map.addLayer({
          id: CIRCLE_LAYER_ID,
          type: 'fill',
          source: CIRCLE_SOURCE_ID,
          paint: {
            'fill-color': '#4a9eff',
            'fill-opacity': 0.15,
          },
        });

        map.addLayer({
          id: `${CIRCLE_LAYER_ID}-outline`,
          type: 'line',
          source: CIRCLE_SOURCE_ID,
          paint: {
            'line-color': '#4a9eff',
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        });
      }

      featureMarkersRef.current.set(feature.id, marker);
    });

    // Cleanup markers on unmount
    return () => {
      featureMarkersRef.current.forEach(marker => marker.remove());

      // Cleanup circles
      if (map && map.getStyle()) {
        features.forEach(feature => {
          if (feature.radius) {
            const CIRCLE_LAYER_ID = `terrain-feature-circle-layer-${feature.id}`;
            const CIRCLE_SOURCE_ID = `terrain-feature-circle-${feature.id}`;

            if (map.getLayer(`${CIRCLE_LAYER_ID}-outline`)) {
              map.removeLayer(`${CIRCLE_LAYER_ID}-outline`);
            }
            if (map.getLayer(CIRCLE_LAYER_ID)) {
              map.removeLayer(CIRCLE_LAYER_ID);
            }
            if (map.getSource(CIRCLE_SOURCE_ID)) {
              map.removeSource(CIRCLE_SOURCE_ID);
            }
          }
        });
      }
    };
  }, [map, isLoaded, features, featuresLoading, layerVisibility.terrainFeatures]);

  // Add trail camera markers to the map
  useEffect(() => {
    if (!map || !isLoaded || camerasLoading) return;

    // Remove old markers
    cameraMarkersRef.current.forEach(marker => marker.remove());
    cameraMarkersRef.current.clear();

    // Early return if trail cameras layer is hidden
    if (!layerVisibility.trailCameras) return;

    // Add new markers for each camera
    cameras.forEach(camera => {
      const el = document.createElement('div');
      el.className = 'trail-camera-marker';

      // Determine battery status color
      let batteryColor = '#22c55e'; // green
      if (camera.batteryLevel && camera.batteryLevel < 30) {
        batteryColor = '#e63946'; // red
      } else if (camera.batteryLevel && camera.batteryLevel < 60) {
        batteryColor = '#e9c46a'; // amber
      }

      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, #374151, #1f2937);
        border: 2px solid ${batteryColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      `;

      el.textContent = '📷';

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.boxShadow = `0 6px 20px ${batteryColor}80`;
        el.style.zIndex = '1000';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        el.style.zIndex = '';
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([camera.lng, camera.lat])
        .addTo(map);

      cameraMarkersRef.current.set(camera.id, marker);
    });

    // Cleanup markers on unmount
    return () => {
      cameraMarkersRef.current.forEach(marker => marker.remove());
    };
  }, [map, isLoaded, cameras, camerasLoading, layerVisibility.trailCameras]);

  // Add distance rings around selected stand
  useEffect(() => {
    if (!map || !isLoaded || !showDistanceRings) return;

    // Early return if distance rings layer is hidden
    if (!layerVisibility.distanceRings) return;

    const RING_SOURCE_PREFIX = 'distance-ring';
    const RING_LAYER_PREFIX = 'distance-ring-layer';

    // Remove existing rings
    [200, 300, 400].forEach(radius => {
      const layerId = `${RING_LAYER_PREFIX}-${radius}`;
      const sourceId = `${RING_SOURCE_PREFIX}-${radius}`;

      if (map.getLayer(`${layerId}-outline`)) {
        map.removeLayer(`${layerId}-outline`);
      }
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });

    // If no stand selected, return after cleanup
    if (!selectedStandForRings) return;

    // Find the selected stand
    const selectedStand = stands.find(s => s.id === selectedStandForRings);
    if (!selectedStand) return;

    // Distance rings: 200, 300, 400 yards
    const ringDistances = [
      { yards: 200, color: '#22c55e', opacity: 0.1 },
      { yards: 300, color: '#e9c46a', opacity: 0.08 },
      { yards: 400, color: '#ef4444', opacity: 0.06 },
    ];

    ringDistances.forEach(ring => {
      const radiusInMeters = ring.yards * 0.9144;
      const circleGeoJSON = createCircle([selectedStand.lng, selectedStand.lat], radiusInMeters);

      const sourceId = `${RING_SOURCE_PREFIX}-${ring.yards}`;
      const layerId = `${RING_LAYER_PREFIX}-${ring.yards}`;

      map.addSource(sourceId, {
        type: 'geojson',
        data: circleGeoJSON,
      });

      // Fill layer
      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': ring.color,
          'fill-opacity': ring.opacity,
        },
      });

      // Outline layer
      map.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': ring.color,
          'line-width': 2,
          'line-opacity': 0.6,
          'line-dasharray': [3, 3],
        },
      });
    });

    // Cleanup on unmount or when selection changes
    return () => {
      if (!map || !map.getStyle()) return;
      [200, 300, 400].forEach(radius => {
        const layerId = `${RING_LAYER_PREFIX}-${radius}`;
        const sourceId = `${RING_SOURCE_PREFIX}-${radius}`;

        if (map.getLayer(`${layerId}-outline`)) {
          map.removeLayer(`${layerId}-outline`);
        }
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });
    };
  }, [map, isLoaded, selectedStandForRings, showDistanceRings, stands, layerVisibility.distanceRings]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center glass-panel-strong p-8 rounded-2xl">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-2">Map Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-4">
            Make sure you've added your Mapbox token to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center glass-panel-strong">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Property Boundary Drawer */}
      {map && clubId && isDrawingBoundary && onBoundaryDrawComplete && onBoundaryDrawCancel && (
        <PropertyBoundaryDrawer
          map={map}
          clubId={clubId}
          isDrawing={isDrawingBoundary}
          onDrawingComplete={onBoundaryDrawComplete}
          onCancel={onBoundaryDrawCancel}
        />
      )}

      {/* Food Plot Drawer */}
      {map && clubId && isDrawingFoodPlot && onFoodPlotDrawComplete && onFoodPlotDrawCancel && (
        <FoodPlotDrawer
          map={map}
          clubId={clubId}
          isDrawing={isDrawingFoodPlot}
          onDrawingComplete={onFoodPlotDrawComplete}
          onCancel={onFoodPlotDrawCancel}
        />
      )}

      {/* Access Route Drawer */}
      {map && clubId && isDrawingAccessRoute && onAccessRouteDrawComplete && onAccessRouteDrawCancel && (
        <AccessRouteDrawer
          map={map}
          clubId={clubId}
          isDrawing={isDrawingAccessRoute}
          onDrawingComplete={onAccessRouteDrawComplete}
          onCancel={onAccessRouteDrawCancel}
        />
      )}

      {/* Measure Tool */}
      {map && isMeasuring && onMeasureClose && (
        <MeasureTool
          map={map}
          isActive={isMeasuring}
          onClose={onMeasureClose}
        />
      )}
    </div>
  );
};

export default MapContainer;
