import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../hooks/useMapbox';
import { useStands } from '../../hooks/useStands';
import { createStandMarkerElement } from '../../utils/standMarkerHelpers';
import type { Stand } from '../../types';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  onStandClick?: (stand: Stand) => void;
}

const MapContainer = ({ center, zoom, onStandClick }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, error } = useMapbox(mapContainerRef, { center, zoom });
  const { stands, loading: standsLoading } = useStands();
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
    </div>
  );
};

export default MapContainer;
