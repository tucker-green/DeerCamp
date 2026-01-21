# Configuration Guide

Complete reference for all configuration options in DeerCamp.

## Environment Variables

### Firebase Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | Google Analytics ID |

### Mapbox Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MAPBOX_ACCESS_TOKEN` | Yes | Mapbox public access token |
| `VITE_MAPBOX_STYLE` | No | Custom map style URL |

**Default style:** `mapbox://styles/mapbox/satellite-streets-v12`

### Development Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_USE_EMULATORS` | No | `false` | Use Firebase emulators |

---

## Configuration Files

### firebase.json

Firebase project configuration.

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions",
    "codebase": "default",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "functions": { "port": 5001 },
    "ui": { "enabled": true, "port": 4000 }
  },
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

### vite.config.js

Vite build configuration.

```javascript
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DeerCamp - Hunting Club Management',
        short_name: 'DeerCamp',
        theme_color: '#16a34a',
        background_color: '#0a0f0a',
        display: 'standalone'
      }
    })
  ]
});
```

### tailwind.config.js

Tailwind CSS configuration.

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif']
      }
    }
  }
};
```

### tsconfig.json

TypeScript configuration references.

```json
{
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### tsconfig.app.json

Application TypeScript settings.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

---

## Mapbox Configuration

### mapboxConfig.ts

Located in `src/config/mapboxConfig.ts`.

```typescript
export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  defaultStyle: import.meta.env.VITE_MAPBOX_STYLE || 
    'mapbox://styles/mapbox/satellite-streets-v12',
  defaultCenter: [-90.0, 35.0] as [number, number],
  defaultZoom: 15,
  minZoom: 10,
  maxZoom: 22
};

export const STAND_MARKER_COLORS = {
  available: '#22c55e',    // Green
  reserved: '#f59e0b',     // Amber
  occupied: '#ef4444',     // Red
  maintenance: '#6b7280'   // Gray
};

export const STAND_TYPE_ICONS = {
  ladder: '🪜',
  climber: '🧗',
  blind: '🏠',
  box: '📦'
};
```

---

## Firebase Emulator Ports

| Service | Port | URL |
|---------|------|-----|
| Auth | 9099 | `http://localhost:9099` |
| Firestore | 8080 | `http://localhost:8080` |
| Storage | 9199 | `http://localhost:9199` |
| Functions | 5001 | `http://localhost:5001` |
| Emulator UI | 4000 | `http://localhost:4000` |

---

## Design System Variables

### CSS Custom Properties

Located in `src/index.css`.

```css
:root {
  /* Colors */
  --color-primary: #3a6326;
  --color-secondary: #8b5e3c;
  --color-accent: #d4a373;
  
  /* Backgrounds */
  --bg-dark: #0a0c08;
  --bg-card: #141812;
  --bg-elevated: #1a1f18;
  
  /* Text */
  --text-main: #f0f2f0;
  --text-muted: #a0a69a;
  --text-dim: #6b7068;
  
  /* Status */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 12px;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

---

## PWA Configuration

### Manifest Settings

Configured in `vite.config.js`:

```javascript
manifest: {
  name: 'DeerCamp - Hunting Club Management',
  short_name: 'DeerCamp',
  description: 'Manage your hunting club',
  theme_color: '#16a34a',
  background_color: '#0a0f0a',
  display: 'standalone',
  orientation: 'portrait-primary',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
  ],
  shortcuts: [
    { name: 'Book Stand', url: '/bookings/new' },
    { name: 'Log Harvest', url: '/harvests' },
    { name: 'View Map', url: '/club' }
  ]
}
```

### Workbox Caching

```javascript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.mapbox\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'mapbox-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 2592000 }
      }
    },
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'firebase-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 604800 }
      }
    }
  ]
}
```

---

## ESLint Configuration

Located in `eslint.config.js`:

```javascript
export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  }
];
```

---

## Hosting Headers

Configured in `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      }
    ]
  }
}
```

---

## Scripts Reference

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:emulator": "cross-env VITE_USE_EMULATORS=true vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:rules": "firebase deploy --only firestore:rules,storage",
    "emulators": "firebase emulators:start",
    "emulators:seed": "tsx scripts/seedEmulator.ts",
    "emulators:export": "firebase emulators:export ./emulator-data",
    "emulators:import": "firebase emulators:start --import=./emulator-data"
  }
}
```

---

*Configuration reference for DeerCamp*
