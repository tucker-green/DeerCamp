import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '../config/mapboxConfig';

export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  style?: string;
}

export function useMapbox(
  containerRef: React.RefObject<HTMLDivElement>,
  options: MapOptions = {}
) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!MAPBOX_CONFIG.accessToken) {
      setError('Mapbox access token not configured. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env.local file.');
      return;
    }

    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

    try {
      const mapInstance = new mapboxgl.Map({
        container: containerRef.current,
        style: options.style || MAPBOX_CONFIG.defaultStyle,
        center: options.center || MAPBOX_CONFIG.defaultCenter,
        zoom: options.zoom || MAPBOX_CONFIG.defaultZoom,
        minZoom: MAPBOX_CONFIG.minZoom,
        maxZoom: MAPBOX_CONFIG.maxZoom,
        attributionControl: false,
      });

      // Add navigation controls (zoom, compass)
      mapInstance.addControl(
        new mapboxgl.NavigationControl({ showCompass: true }),
        'top-right'
      );

      // Add scale control (imperial units - yards/miles)
      mapInstance.addControl(
        new mapboxgl.ScaleControl({ unit: 'imperial' }),
        'bottom-right'
      );

      // Add attribution (required by Mapbox terms of service)
      mapInstance.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        'bottom-left'
      );

      mapInstance.on('load', () => {
        setIsLoaded(true);
      });

      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError(e.error?.message || 'Map error');
      });

      mapRef.current = mapInstance;
      setMap(mapInstance);

      // Cleanup on unmount
      return () => {
        mapInstance.remove();
        mapRef.current = null;
      };
    } catch (err: any) {
      console.error('Failed to initialize Mapbox:', err);
      setError(err.message);
    }
  }, [containerRef, options.center, options.zoom, options.style]);

  return { map, isLoaded, error };
}
