# Map Features Guide

Complete guide to the interactive mapping capabilities in DeerCamp.

## Overview

DeerCamp includes powerful mapping features built on Mapbox GL JS, providing satellite imagery, custom markers, and property management tools.

## Map Interface

### Controls

| Control | Location | Function |
|---------|----------|----------|
| Zoom +/- | Bottom right | Zoom in/out |
| Compass | Bottom right | Reset rotation |
| Scale | Bottom left | Distance reference |
| Search | Top left | Find locations |
| Drawing Tools | Top toolbar | Create features |

### Navigation

- **Pan**: Click and drag
- **Zoom**: Scroll wheel or +/- buttons
- **Rotate**: Right-click and drag
- **Tilt**: Ctrl + drag (3D view)

---

## Stand Markers

### Marker Colors

| Color | Status |
|-------|--------|
| Green | Available |
| Amber | Reserved |
| Red | Occupied |
| Gray | Maintenance |

### Marker Icons

| Icon | Stand Type |
|------|------------|
| 🪜 | Ladder stand |
| 🧗 | Climber |
| 🏠 | Blind |
| 📦 | Box stand |

### Stand Popup

Click a marker to see:
- Stand name and type
- Current status
- Description
- Book button (if available)
- Range ring toggle

---

## Layer Controls

Access via the Layers button on the map.

### Available Layers

| Layer | Description | Default |
|-------|-------------|---------|
| Stands | Hunting stand markers | On |
| Property Boundaries | Drawn property lines | On |
| Food Plots | Planted areas | On |
| Access Routes | Roads and trails | On |
| Terrain Features | Points of interest | On |
| Trail Cameras | Camera locations | On |
| Distance Rings | Range circles | Off |
| Public Parcels | County parcel data | Off |

### Toggling Layers

1. Click "Layers" button
2. Toggle individual layers on/off
3. Use "Show All" / "Hide All" for bulk changes

---

## Property Boundaries

### Creating Boundaries

**Requirements:** Manager or Owner role

1. Click "Draw Boundary" in toolbar
2. Click on map to place first point
3. Continue clicking to draw polygon
4. Click first point to close shape
5. Fill in details:
   - Boundary name
   - Type (owned, leased, neighboring, hunting-area)
   - Owner name
   - Color
   - Notes
6. Click "Save"

### Boundary Types

| Type | Description | Typical Color |
|------|-------------|---------------|
| Owned | Property you own | Green |
| Leased | Leased hunting rights | Blue |
| Neighboring | Adjacent properties | Orange |
| Hunting Area | Designated zones | Purple |

### Editing/Deleting

1. Go to Club > Property tab
2. Find boundary in list
3. Click delete icon
4. Confirm deletion

**Note:** Editing requires deleting and redrawing.

---

## Food Plots

### Creating Food Plots

1. Click "Draw Food Plot" in toolbar
2. Draw polygon around planted area
3. Fill in details:
   - Plot name
   - Planted with (crop type)
   - Plant date
   - Notes
4. Click "Save"

### Common Crop Types

- Clover
- Brassica
- Winter wheat
- Oats
- Soybeans
- Turnips
- Chicory

### Food Plot Display

- Green fill color
- Shows name on map
- Popup with planting info
- Calculated acreage

---

## Access Routes

### Creating Routes

1. Click "Draw Route" in toolbar
2. Click to place points along path
3. Double-click to finish line
4. Fill in details:
   - Route name
   - Route type
   - Difficulty
   - Seasonal restrictions
   - Notes
5. Click "Save"

### Route Types

| Type | Color | Description |
|------|-------|-------------|
| Road | Gray | Vehicle accessible |
| ATV Trail | Orange | ATV/UTV paths |
| Walking Path | Yellow | Foot traffic only |
| Quiet Approach | Purple | Stealth routes |

### Route Difficulty

- **Easy**: Clear, flat path
- **Moderate**: Some obstacles
- **Difficult**: Rough terrain, steep

---

## Terrain Features

### Feature Types

| Type | Icon | Description |
|------|------|-------------|
| Water Source | 💧 | Ponds, creeks, springs |
| Bedding Area | 🛏️ | Known bedding locations |
| Feeding Area | 🌾 | Natural food sources |
| Scrape | 🦌 | Deer scrapes |
| Rub Line | 🌲 | Rub line paths |
| Funnel | ⏳ | Terrain funnels |
| Saddle | 🏔️ | Ridge saddles |
| Ridge | ⛰️ | Ridge lines |
| Creek Crossing | 🌊 | Water crossings |

### Adding Features

Terrain features are added through the map interface when drawing tools are enabled.

---

## Trail Cameras

### Camera Markers

Trail cameras show on map as camera icons with:
- Camera name
- Location
- Last check date
- Battery/SD status

### Managing Cameras

Add/edit cameras through Club > Property > Trail Cameras section.

---

## Distance Rings

### Purpose

Show range circles around selected stand:
- 200 yards (bow range)
- 300 yards (rifle comfort zone)
- 400 yards (maximum ethical range)

### Enabling Rings

1. Click on a stand marker
2. Click "Show Range" in popup
3. Circles appear around stand

### Disabling Rings

Click "Hide Range" in stand popup or select different stand.

---

## Measure Tool

### Using the Measure Tool

1. Click "Measure" in toolbar
2. Click starting point on map
3. Click ending point
4. Distance displayed in yards/miles
5. Click "Clear" to reset

### Distance Display

- Under 1000 yards: Shows yards
- Over 1000 yards: Shows miles

---

## Map Search

### Search Types

1. **Address search**: "123 Main St, City, State"
2. **Place search**: "Lake, Park, Town name"
3. **Coordinate search**: "35.5, -90.0" or "35.5°N, 90°W"

### Using Search

1. Click search box (top left)
2. Type search query
3. Select from suggestions
4. Map centers on location

---

## Public Parcels

### What Are Parcels?

Public parcel boundaries from county GIS data showing:
- Property lines
- Owner names
- Parcel IDs
- Acreage

### Enabling Parcels

1. Open Layer Controls
2. Toggle "Public Parcels" on
3. Parcels load for visible area

**Note:** Demo parcels are shown when real data unavailable.

### Parcel Information

Click a parcel to see:
- Owner name
- Parcel ID
- Acreage
- Address (if available)

---

## Best Practices

### Property Management

1. **Start with boundaries**: Define property lines first
2. **Add stands with location**: Position stands on map
3. **Draw access routes**: Mark how to reach stands
4. **Add food plots**: Track planted areas
5. **Mark features**: Note important terrain

### Map Organization

1. Use consistent naming conventions
2. Choose colors that stand out
3. Add notes with relevant details
4. Update regularly (food plots, cameras)

### Performance Tips

1. Hide unused layers
2. Don't draw overly complex shapes
3. Zoom appropriately for task
4. Close popups when not needed

---

## Troubleshooting

### Map Not Loading

1. Check internet connection
2. Verify Mapbox token is valid
3. Clear browser cache
4. Try different browser

### Drawing Not Working

1. Ensure you have manager/owner role
2. Verify club is selected
3. Check for JavaScript errors
4. Try refreshing page

### Markers Not Showing

1. Check layer is enabled
2. Verify stands exist for club
3. Zoom to appropriate level
4. Check for filter settings

### Slow Performance

1. Hide unnecessary layers
2. Reduce zoom level
3. Close other browser tabs
4. Clear browser cache

---

*Map Features documentation for DeerCamp*
