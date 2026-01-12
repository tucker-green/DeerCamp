import { STAND_MARKER_COLORS, STAND_TYPE_ICONS } from '../config/mapboxConfig';
import type { Stand } from '../types';

/**
 * Create HTML element for custom stand marker
 * @param stand Stand object
 * @returns HTML div element styled as a custom marker
 */
export function createStandMarkerElement(stand: Stand): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'stand-marker';
  el.setAttribute('data-stand-id', stand.id);

  el.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50% 50% 50% 0;
    background: ${STAND_MARKER_COLORS[stand.status]};
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  const icon = document.createElement('div');
  icon.style.cssText = `
    transform: rotate(45deg);
    font-size: 18px;
    user-select: none;
  `;
  icon.textContent = STAND_TYPE_ICONS[stand.type];

  el.appendChild(icon);

  // Hover effects
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'rotate(-45deg) scale(1.2)';
    el.style.zIndex = '1000';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'rotate(-45deg) scale(1)';
    el.style.zIndex = '1';
  });

  return el;
}

/**
 * Get status color for a stand
 * @param status Stand status
 * @returns Hex color code
 */
export function getStatusColor(status: Stand['status']): string {
  return STAND_MARKER_COLORS[status];
}

/**
 * Get type icon for a stand
 * @param type Stand type
 * @returns Emoji icon
 */
export function getTypeIcon(type: Stand['type']): string {
  return STAND_TYPE_ICONS[type];
}

/**
 * Get status display name
 * @param status Stand status
 * @returns Human-readable status
 */
export function getStatusDisplayName(status: Stand['status']): string {
  const names: Record<Stand['status'], string> = {
    available: 'Available',
    reserved: 'Reserved',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
  };
  return names[status];
}

/**
 * Get type display name
 * @param type Stand type
 * @returns Human-readable type
 */
export function getTypeDisplayName(type: Stand['type']): string {
  const names: Record<Stand['type'], string> = {
    ladder: 'Ladder Stand',
    climber: 'Climber',
    blind: 'Ground Blind',
    box: 'Box Stand',
  };
  return names[type];
}
