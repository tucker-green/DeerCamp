import type { TerrainFeatureType } from '../types';

// Icon mapping for terrain feature types
export const TERRAIN_FEATURE_ICONS: Record<TerrainFeatureType, string> = {
  'water-source': '💧',
  'bedding-area': '🛏️',
  'oak-grove': '🌳',
  'thicket': '🌿',
  'ridge-line': '⛰️',
  'funnel': '🌪️',
  'scrape-area': '🦌',
  'rub-line': '🌲',
  'kill-zone': '🎯',
};

// Color mapping for terrain feature types
export const TERRAIN_FEATURE_COLORS: Record<TerrainFeatureType, string> = {
  'water-source': '#4a9eff',
  'bedding-area': '#8b5e3c',
  'oak-grove': '#52b788',
  'thicket': '#74d4a8',
  'ridge-line': '#6b7280',
  'funnel': '#e9c46a',
  'scrape-area': '#d4a373',
  'rub-line': '#3a6326',
  'kill-zone': '#e63946',
};

// Display names for terrain feature types
export const TERRAIN_FEATURE_LABELS: Record<TerrainFeatureType, string> = {
  'water-source': 'Water Source',
  'bedding-area': 'Bedding Area',
  'oak-grove': 'Oak Grove',
  'thicket': 'Thicket',
  'ridge-line': 'Ridge Line',
  'funnel': 'Funnel',
  'scrape-area': 'Scrape Area',
  'rub-line': 'Rub Line',
  'kill-zone': 'Kill Zone',
};

// Create custom HTML marker element for terrain features
export function createTerrainFeatureMarkerElement(type: TerrainFeatureType): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'terrain-feature-marker';

  const color = TERRAIN_FEATURE_COLORS[type];
  const icon = TERRAIN_FEATURE_ICONS[type];

  el.style.cssText = `
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${color};
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;

  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon;
  iconSpan.style.cssText = `
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  `;

  el.appendChild(iconSpan);

  // Hover effect
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.2)';
    el.style.boxShadow = `0 6px 20px ${color}80`;
    el.style.zIndex = '1000';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
    el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    el.style.zIndex = '';
  });

  return el;
}

// Get description for terrain feature type
export function getTerrainFeatureDescription(type: TerrainFeatureType): string {
  const descriptions: Record<TerrainFeatureType, string> = {
    'water-source': 'Creek, pond, or water hole where deer drink',
    'bedding-area': 'Thick cover where deer rest during the day',
    'oak-grove': 'Oak trees producing acorns (major food source)',
    'thicket': 'Dense brush providing cover and browse',
    'ridge-line': 'High ground for observation and travel routes',
    'funnel': 'Natural terrain feature that concentrates deer movement',
    'scrape-area': 'Active scrapes indicating rutting activity',
    'rub-line': 'Series of rubs showing travel corridor',
    'kill-zone': 'Ideal shooting lane or high-success area',
  };

  return descriptions[type];
}
