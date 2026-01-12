export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  defaultStyle: import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/mapbox/satellite-streets-v12',
  defaultCenter: [-90.0, 35.0] as [number, number], // Default to mid-US, will be overridden by club location
  defaultZoom: 15,
  minZoom: 10,
  maxZoom: 22,
};

export const STAND_MARKER_COLORS = {
  available: '#22c55e',      // green-500
  reserved: '#f59e0b',       // amber-500
  occupied: '#ef4444',       // red-500
  maintenance: '#6b7280',    // gray-500
};

export const STAND_TYPE_ICONS = {
  ladder: '🪜',
  climber: '🧗',
  blind: '🏠',
  box: '📦',
};
