/**
 * Geographic utility functions for map calculations
 */

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate distance between two coordinates in yards using Haversine formula
 * @param coord1 First coordinate [lng, lat]
 * @param coord2 Second coordinate [lng, lat]
 * @returns Distance in yards
 */
export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const miles = R * c;
  return Math.round(miles * 1760); // Convert to yards
}

/**
 * Calculate bearing between two coordinates (0-360 degrees)
 * @param coord1 First coordinate [lng, lat]
 * @param coord2 Second coordinate [lng, lat]
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);

  const bearing = Math.atan2(y, x);
  return ((bearing * 180) / Math.PI + 360) % 360;
}

/**
 * Get cardinal direction from bearing
 * @param bearing Bearing in degrees (0-360)
 * @returns Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Calculate center point of an array of coordinates
 * @param coords Array of coordinates [lng, lat][]
 * @returns Center coordinate [lng, lat]
 */
export function calculateCenter(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [0, 0];

  const sum = coords.reduce(
    (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
    [0, 0]
  );

  return [sum[0] / coords.length, sum[1] / coords.length];
}

/**
 * Format distance for display
 * @param yards Distance in yards
 * @returns Formatted distance string
 */
export function formatDistance(yards: number): string {
  if (yards < 100) return `${yards} yd`;
  if (yards < 1760) return `${Math.round(yards / 10) * 10} yd`;
  const miles = yards / 1760;
  return `${miles.toFixed(1)} mi`;
}
