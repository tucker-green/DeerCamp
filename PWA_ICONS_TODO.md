# PWA Icons TODO

The PWA configuration requires PNG icons that don't exist yet.

## Required Icons:
- `/public/icon-192.png` - 192x192px
- `/public/icon-512.png` - 512x512px
- `/public/apple-touch-icon.png` - 180x180px (Apple devices)

## Current Status:
- ✅ SVG icon created at `/public/icon.svg`
- ❌ PNG icons need to be generated from the SVG

## How to Generate:
You can use one of these methods:

### Option 1: Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload `/public/icon.svg`
3. Download and place the generated icons in `/public/`

### Option 2: ImageMagick (Command Line)
```bash
# Install ImageMagick first
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
convert public/icon.svg -resize 180x180 public/apple-touch-icon.png
```

### Option 3: Figma/Design Tool
1. Open `/public/icon.svg` in Figma or similar
2. Export as PNG at 192x192, 512x512, and 180x180
3. Save to `/public/` directory

## For Now:
The app will work fine with just the SVG icon. PNG icons are only needed for PWA installation on mobile devices.
