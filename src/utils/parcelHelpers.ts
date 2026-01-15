/**
 * Parcel Boundary Utilities
 * Helper functions for working with public parcel data (like OnX Maps)
 */

import type { ParcelBoundary } from '../types';

/**
 * Convert a ParcelBoundary to a GeoJSON Feature for map rendering
 */
export function parcelToGeoJSON(parcel: ParcelBoundary): GeoJSON.Feature {
  // Handle both single polygon and multipolygon coordinates
  const isMultiPolygon = parcel.coordinates.length > 0 &&
    Array.isArray(parcel.coordinates[0]) &&
    Array.isArray(parcel.coordinates[0][0]) &&
    Array.isArray(parcel.coordinates[0][0][0]);

  return {
    type: 'Feature',
    properties: {
      id: parcel.id,
      parcelId: parcel.parcelId,
      owner: parcel.owner,
      acres: parcel.acres,
      county: parcel.county,
      state: parcel.state,
      // Color based on source or could be customized
      color: getParcelColor(parcel),
    },
    geometry: isMultiPolygon ? {
      type: 'MultiPolygon',
      coordinates: parcel.coordinates as [number, number][][][],
    } : {
      type: 'Polygon',
      coordinates: parcel.coordinates as [number, number][][],
    },
  };
}

/**
 * Generate a label feature for a parcel (for owner name display)
 */
export function parcelToLabelFeature(parcel: ParcelBoundary): GeoJSON.Feature {
  return {
    type: 'Feature',
    properties: {
      id: parcel.id,
      owner: formatOwnerName(parcel.owner),
      acres: parcel.acres,
    },
    geometry: {
      type: 'Point',
      coordinates: parcel.centroid,
    },
  };
}

/**
 * Format owner name for display (shorten if too long)
 */
export function formatOwnerName(owner: string): string {
  // If owner name is very long, abbreviate
  if (owner.length > 30) {
    // Try to keep first and last names, abbreviate middle parts
    const parts = owner.split(' ');
    if (parts.length > 3) {
      // Keep first two and last parts
      return `${parts[0]} ${parts[1]} ... ${parts[parts.length - 1]}`;
    }
  }
  return owner.toUpperCase();
}

/**
 * Get color for parcel based on source or type
 */
export function getParcelColor(parcel: ParcelBoundary): string {
  // OnX-style coloring: orange/red for private property
  const colors = {
    'county-gis': '#e07020',  // Orange - main parcel color
    'regrid': '#d4442e',       // Red-orange
    'manual': '#c9630c',       // Darker orange
  };
  return colors[parcel.source] || '#e07020';
}

/**
 * Calculate centroid of a polygon (simple average method)
 */
export function calculateCentroid(coordinates: [number, number][]): [number, number] {
  if (coordinates.length === 0) return [0, 0];

  let sumLng = 0;
  let sumLat = 0;

  // Exclude the closing point (same as first point) if present
  const points = coordinates[coordinates.length - 1][0] === coordinates[0][0] &&
                 coordinates[coordinates.length - 1][1] === coordinates[0][1]
    ? coordinates.slice(0, -1)
    : coordinates;

  points.forEach(([lng, lat]) => {
    sumLng += lng;
    sumLat += lat;
  });

  return [sumLng / points.length, sumLat / points.length];
}

/**
 * Calculate polygon area in acres using the Shoelace formula
 * Note: This is an approximation that works well for small areas
 */
export function calculateParcelAcres(coordinates: [number, number][]): number {
  if (coordinates.length < 3) return 0;

  // Shoelace formula for polygon area in square degrees
  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n; i++) {
    const [x1, y1] = coordinates[i];
    const [x2, y2] = coordinates[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }

  area = Math.abs(area) / 2;

  // Convert square degrees to acres
  // At ~35 latitude: 1 degree lng ≈ 54.6 miles, 1 degree lat ≈ 69 miles
  // 1 square mile = 640 acres
  const avgLat = coordinates.reduce((sum, [, lat]) => sum + lat, 0) / coordinates.length;
  const milesPerDegreeLng = 69.172 * Math.cos(avgLat * Math.PI / 180);
  const milesPerDegreeLat = 69.172;

  const sqMiles = area * milesPerDegreeLng * milesPerDegreeLat;
  return Math.round(sqMiles * 640 * 10) / 10; // Round to 1 decimal
}

/**
 * Generate demo parcel data for a given area
 * This creates realistic-looking parcel boundaries for demonstration
 */
export function generateDemoParcels(
  centerLng: number,
  centerLat: number,
  count: number = 20
): ParcelBoundary[] {
  const parcels: ParcelBoundary[] = [];

  // Sample Tennessee family names for demo
  const lastNames = [
    'SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'DAVIS', 'MILLER',
    'WILSON', 'MOORE', 'TAYLOR', 'ANDERSON', 'THOMAS', 'JACKSON', 'WHITE',
    'HARRIS', 'MARTIN', 'THOMPSON', 'GARCIA', 'MARTINEZ', 'ROBINSON',
    'WALKER', 'HALL', 'ALLEN', 'YOUNG', 'KING', 'WRIGHT', 'HILL', 'GREEN'
  ];

  const firstNames = [
    'JOHN', 'JAMES', 'ROBERT', 'MICHAEL', 'WILLIAM', 'DAVID', 'RICHARD',
    'JOSEPH', 'THOMAS', 'CHARLES', 'MARY', 'PATRICIA', 'JENNIFER', 'LINDA',
    'ELIZABETH', 'BARBARA', 'SUSAN', 'JESSICA', 'SARAH', 'KAREN'
  ];

  // Generate a grid of parcels with some variation
  const gridSize = Math.ceil(Math.sqrt(count));
  const cellSize = 0.008; // About 0.5 miles in degrees

  for (let row = 0; row < gridSize && parcels.length < count; row++) {
    for (let col = 0; col < gridSize && parcels.length < count; col++) {
      // Add some randomness to parcel positions and sizes
      const offsetX = (col - gridSize / 2) * cellSize + (Math.random() - 0.5) * cellSize * 0.3;
      const offsetY = (row - gridSize / 2) * cellSize + (Math.random() - 0.5) * cellSize * 0.3;

      const parcelCenterLng = centerLng + offsetX;
      const parcelCenterLat = centerLat + offsetY;

      // Create irregular polygon (4-6 sides)
      const sides = 4 + Math.floor(Math.random() * 3);
      const coordinates = generateIrregularPolygon(
        parcelCenterLng,
        parcelCenterLat,
        cellSize * 0.4 + Math.random() * cellSize * 0.2,
        sides
      );

      // Generate owner name
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const hasSpouse = Math.random() > 0.4;
      const spouseFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];

      const owner = hasSpouse
        ? `${lastName}\n${firstName} &\n${spouseFirstName}`
        : `${lastName}\n${firstName}`;

      const acres = calculateParcelAcres(coordinates);
      const centroid = calculateCentroid(coordinates);

      parcels.push({
        id: `demo-parcel-${row}-${col}`,
        parcelId: `${100 + row}${String(col).padStart(2, '0')}`,
        owner,
        coordinates: [coordinates], // Wrap in array for Polygon type
        centroid,
        acres,
        county: 'Demo County',
        state: 'Tennessee',
        source: 'manual',
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  return parcels;
}

/**
 * Generate an irregular polygon with specified number of sides
 */
function generateIrregularPolygon(
  centerLng: number,
  centerLat: number,
  radius: number,
  sides: number
): [number, number][] {
  const points: [number, number][] = [];
  const angleStep = (2 * Math.PI) / sides;

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep + (Math.random() - 0.5) * angleStep * 0.3;
    const r = radius * (0.7 + Math.random() * 0.6);

    const lng = centerLng + r * Math.cos(angle);
    const lat = centerLat + r * Math.sin(angle) * 0.8; // Adjust for lat/lng ratio

    points.push([lng, lat]);
  }

  // Close the polygon
  points.push([...points[0]]);

  return points;
}

/**
 * Filter parcels by viewport bounds
 */
export function filterParcelsByBounds(
  parcels: ParcelBoundary[],
  bounds: { west: number; south: number; east: number; north: number }
): ParcelBoundary[] {
  return parcels.filter(parcel => {
    const [lng, lat] = parcel.centroid;
    return lng >= bounds.west && lng <= bounds.east &&
           lat >= bounds.south && lat <= bounds.north;
  });
}
