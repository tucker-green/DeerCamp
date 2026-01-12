import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { PropertyBoundary, FoodPlot, AccessRoute } from '../types';

// Helper function to create a circle GeoJSON for radius display
export function createCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };

  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [ret],
        },
        properties: {},
      },
    ],
  };
}

// Custom Mapbox Draw styles for property boundaries
export const DRAW_STYLES = [
  // Polygon fill
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': '#3a6326',
      'fill-outline-color': '#3a6326',
      'fill-opacity': 0.2,
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#52b788',
      'fill-outline-color': '#52b788',
      'fill-opacity': 0.3,
    },
  },
  // Polygon outline stroke
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3a6326',
      'line-width': 3,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#52b788',
      'line-width': 3,
    },
  },
  // Line (for access routes)
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#d4a373',
      'line-width': 3,
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#e9c46a',
      'line-width': 4,
    },
  },
  // Vertex points
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#ffffff',
      'circle-stroke-color': '#3a6326',
      'circle-stroke-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['==', 'active', 'true']],
    paint: {
      'circle-radius': 6,
      'circle-color': '#52b788',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
    },
  },
];

// Create Mapbox Draw instance with custom styles
export function createDrawControl() {
  return new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      line_string: true,
      trash: true,
    },
    styles: DRAW_STYLES,
  });
}

// Convert Mapbox Draw polygon to PropertyBoundary coordinates
export function drawPolygonToBoundary(feature: any): [number, number][] {
  if (feature.geometry.type !== 'Polygon') {
    throw new Error('Feature must be a Polygon');
  }
  // Return the outer ring coordinates (first array in coordinates)
  return feature.geometry.coordinates[0] as [number, number][];
}

// Convert Mapbox Draw line to AccessRoute coordinates
export function drawLineToRoute(feature: any): [number, number][] {
  if (feature.geometry.type !== 'LineString') {
    throw new Error('Feature must be a LineString');
  }
  return feature.geometry.coordinates as [number, number][];
}

// Calculate polygon area in acres using Turf-like algorithm
export function calculatePolygonAcres(coordinates: [number, number][]): number {
  if (coordinates.length < 3) return 0;

  // Close the polygon if not already closed
  const coords = coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
    coordinates[0][1] === coordinates[coordinates.length - 1][1]
    ? coordinates
    : [...coordinates, coordinates[0]];

  // Calculate area using Shoelace formula (for lat/lng this is approximate)
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[i + 1];
    area += lng1 * lat2 - lng2 * lat1;
  }
  area = Math.abs(area / 2);

  // Convert to acres (very rough approximation, good enough for display)
  // 1 degree lat/lng ≈ 69 miles at equator, but this varies by latitude
  // For hunting properties in US, this approximation is acceptable
  const sqMiles = area * 69 * 69;
  const acres = sqMiles * 640; // 640 acres per square mile

  return Math.round(acres * 10) / 10; // Round to 1 decimal
}

// Calculate line length in yards
export function calculateLineYards(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];

    // Haversine formula for distance
    const R = 3958.8; // Earth radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const miles = R * c;
    totalDistance += miles;
  }

  return Math.round(totalDistance * 1760); // Convert to yards
}

// Convert PropertyBoundary to GeoJSON feature for display
export function boundaryToGeoJSON(boundary: PropertyBoundary) {
  return {
    type: 'Feature' as const,
    id: boundary.id,
    properties: {
      id: boundary.id,
      name: boundary.name,
      boundaryType: boundary.boundaryType,
      acres: boundary.acres,
      color: boundary.color || '#3a6326',
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [boundary.coordinates],
    },
  };
}

// Convert FoodPlot to GeoJSON feature for display
export function foodPlotToGeoJSON(plot: FoodPlot) {
  return {
    type: 'Feature' as const,
    id: plot.id,
    properties: {
      id: plot.id,
      name: plot.name,
      plantedWith: plot.plantedWith,
      acres: plot.acres,
      color: '#52b788', // Bright green for food plots
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [plot.coordinates],
    },
  };
}

// Convert AccessRoute to GeoJSON feature for display
export function routeToGeoJSON(route: AccessRoute) {
  // Color mapping for route types
  const routeColors: Record<string, string> = {
    'road': '#8b5e3c',
    'atv-trail': '#d4a373',
    'walking-path': '#e9c46a',
    'quiet-approach': '#6b7280',
  };

  return {
    type: 'Feature' as const,
    id: route.id,
    properties: {
      id: route.id,
      name: route.name,
      type: route.type,
      lengthYards: route.lengthYards,
      color: routeColors[route.type] || '#d4a373',
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: route.coordinates,
    },
  };
}
