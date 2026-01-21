# DeerCamp Documentation

Welcome to the DeerCamp documentation. This comprehensive guide covers all aspects of the hunting club management platform.

## Table of Contents

### Getting Started
- [Project Overview](./OVERVIEW.md) - Project introduction, features, and architecture
- [Quick Start Guide](./guides/QUICK_START.md) - Get up and running quickly
- [Installation Guide](./guides/INSTALLATION.md) - Detailed setup instructions
- [Configuration](./guides/CONFIGURATION.md) - Environment variables and settings

### Architecture
- [System Architecture](./ARCHITECTURE.md) - Technical architecture overview
- [Database Schema](./firebase/DATABASE_SCHEMA.md) - Firestore collections and structure
- [Security Rules](./firebase/SECURITY_RULES.md) - Firestore and Storage security rules

### API Reference
- [Types & Interfaces](./api/TYPES.md) - TypeScript type definitions
- [Custom Hooks](./hooks/README.md) - React hooks reference
- [Utility Functions](./utils/README.md) - Helper functions reference
- [Firebase Functions](./firebase/CLOUD_FUNCTIONS.md) - Cloud Functions API

### Components
- [Components Overview](./components/README.md) - React components reference
- [UI Components](./components/UI_COMPONENTS.md) - Reusable UI components
- [Map Components](./components/MAP_COMPONENTS.md) - Map-related components

### Pages
- [Pages Overview](./pages/README.md) - Application pages reference
- [Public Pages](./pages/PUBLIC_PAGES.md) - Landing, login, and marketing pages
- [Protected Pages](./pages/PROTECTED_PAGES.md) - Authenticated user pages
- [Admin Pages](./pages/ADMIN_PAGES.md) - Administrator pages

### Guides
- [Deployment Guide](./guides/DEPLOYMENT.md) - Deploy to production
- [Local Development](./guides/LOCAL_DEVELOPMENT.md) - Development with emulators
- [Testing Guide](./guides/TESTING.md) - Testing strategies and tools
- [Contributing](./guides/CONTRIBUTING.md) - Contribution guidelines

### Features
- [Booking System](./guides/BOOKING_SYSTEM.md) - Stand reservation system
- [Member Management](./guides/MEMBER_MANAGEMENT.md) - Club membership features
- [Map Features](./guides/MAP_FEATURES.md) - Interactive map capabilities
- [Trophy Book](./guides/TROPHY_BOOK.md) - Harvest tracking and records

## Quick Links

| Resource | Description |
|----------|-------------|
| [Live App](https://deercamp-3b648.web.app) | Production deployment |
| [Firebase Console](https://console.firebase.google.com/project/deercamp-3b648) | Firebase project management |
| [Mapbox Dashboard](https://account.mapbox.com/) | Map token management |

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Frontend | React | 19.2.0 |
| Language | TypeScript | 5.9.x |
| Build Tool | Vite | 7.2.4 |
| Styling | Tailwind CSS | 3.4.17 |
| Animation | Framer Motion | 12.24.10 |
| Backend | Firebase | 12.7.0 |
| Maps | Mapbox GL JS | 3.17.0 |
| Icons | Lucide React | 0.562.0 |
| Charts | Recharts | 3.6.0 |
| Routing | React Router | 7.12.0 |

## Project Structure

```
DeerCamp/
├── docs/                    # Documentation (you are here)
├── functions/               # Firebase Cloud Functions
│   └── src/
│       └── index.ts        # Function definitions
├── public/                  # Static assets
├── scripts/                 # Build and seed scripts
├── src/
│   ├── assets/             # Images and generated assets
│   ├── components/         # React components
│   │   └── map/           # Map-specific components
│   ├── config/            # Configuration files
│   ├── context/           # React context providers
│   ├── firebase/          # Firebase configuration
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── firebase.json          # Firebase project config
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
└── package.json           # Dependencies and scripts
```

## Support

For issues or questions:
1. Check the [FAQ](./guides/FAQ.md)
2. Review existing [GitHub Issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information

---

*Last updated: January 2026*
