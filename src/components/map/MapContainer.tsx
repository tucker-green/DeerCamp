import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../hooks/useMapbox';
import { useStands } from '../../hooks/useStands';
import { usePropertyBoundaries } from '../../hooks/usePropertyBoundaries';
import { useFoodPlots } from '../../hooks/useFoodPlots';
import { createStandMarkerElement } from '../../utils/standMarkerHelpers';
import { boundaryToGeoJSON, foodPlotToGeoJSON } from '../../utils/boundaryDrawHelpers';
import PropertyBoundaryDrawer from './PropertyBoundaryDrawer';
import FoodPlotDrawer from './FoodPlotDrawer';
import type { Stand } from '../../types';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  clubId?: string;
  onStandClick?: (stand: Stand) => void;
  isDrawingBoundary?: boolean;
  onBoundaryDrawComplete?: () => void;
  onBoundaryDrawCancel?: () => void;
  isDrawingFoodPlot?: boolean;
  onFoodPlotDrawComplete?: () => void;
  onFoodPlotDrawCancel?: () => void;
}

const MapContainer = ({
  center,
  zoom,
  clubId,
  onStandClick,
  isDrawingBoundary = false,
  onBoundaryDrawComplete,
  onBoundaryDrawCancel,
  isDrawingFoodPlot = false,
  onFoodPlotDrawComplete,
  onFoodPlotDrawCancel,
}: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, error } = useMapbox(mapContainerRef, { center, zoom });
  const { stands, loading: standsLoading } = useStands();
  const { boundaries, loading: boundariesLoading } = usePropertyBoundaries(clubId);
  const { foodPlots, loading: foodPlotsLoading } = useFoodPlots(clubId);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Add stand markers to the map
  useEffect(() => {
    if (!map || !isLoaded || standsLoading) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

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
  }, [map, isLoaded, stands, standsLoading, onStandClick]);

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
  }, [map, isLoaded, boundaries, boundariesLoading]);

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
  }, [map, isLoaded, foodPlots, foodPlotsLoading]);

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
    </div>
  );
};

export default MapContainer;
