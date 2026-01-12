# 🦌 DeerCamp - Hunting Club Management Platform

A modern, real-time hunting club management application built with React, TypeScript, and Firebase.

![DeerCamp](https://img.shields.io/badge/React-19-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.7-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)

---

## 🎯 Features

### ✅ Implemented

- **🔐 User Authentication**
  - Email/password registration and login
  - Google OAuth integration
  - Auto-generated user profiles with roles

- **🪜 Stand Management**
  - Real-time stand availability tracking
  - Multiple stand types (ladder, climber, blind, box)
  - GPS coordinates for each stand
  - Reserve/release functionality

- **📸 Harvest Logging**
  - Photo uploads to Firebase Storage
  - Species tracking (deer, turkey, pigs, other)
  - Weight and notes recording
  - Real-time harvest feed with filters

- **📊 Dashboard**
  - Personalized user greeting
  - Activity feed
  - Weather widget
  - Quick action buttons
  - Club statistics

- **🎨 Beautiful UI**
  - Glassmorphism design
  - Framer Motion animations
  - Responsive mobile design
  - Dark theme with gradient accents

### 🚧 Planned Features

- Bookings system with calendar view
- Member management page
- Interactive map with stand locations
- Weather API integration
- Advanced search and filtering
- Photo gallery with optimization
- Push notifications
- Analytics dashboard

---

## 🏗️ Tech Stack

- **Frontend**: React 19.2, TypeScript 5.9
- **Build Tool**: Vite 7.2
- **Routing**: React Router DOM 7.12
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 12.24
- **Icons**: Lucide React 0.562
- **Backend**: Firebase 12.7
  - Authentication (Email/Password, Google OAuth)
  - Cloud Firestore (NoSQL Database)
  - Firebase Storage (Photo uploads)
  - Firebase Hosting (Deployment)

---

## 📁 Project Structure

```
DeerCamp/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Navbar.tsx       # Navigation with mobile menu
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── firebase/            # Firebase configuration
│   │   └── config.ts        # Firebase initialization
│   ├── pages/               # Route components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── HarvestPage.tsx  # Harvest logging
│   │   ├── LoginPage.tsx    # Authentication
│   │   └── StandsPage.tsx   # Stand management
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # Shared type interfaces
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── firebase.json            # Firebase configuration
├── .firebaserc              # Firebase project aliases
├── firestore.indexes.json   # Firestore composite indexes
├── .env.local               # Environment variables (gitignored)
├── .env.example             # Environment template
├── FIREBASE_SETUP.md        # Firebase Console setup guide
├── DEPLOYMENT.md            # Deployment instructions
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Firebase CLI: `npm install -g firebase-tools`

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DeerCamp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Firebase credentials.

4. **Start development server**
   ```bash
   npm run dev
   ```
   App will open at http://localhost:5173

---

## 🔥 Firebase Setup

### Quick Start

1. **Enable Firebase services** in Console:
   - Authentication (Email/Password + Google OAuth)
   - Cloud Firestore
   - Firebase Storage
   - Firebase Hosting

2. **Deploy security rules**:
   ```bash
   npm run deploy:rules
   ```

3. **Deploy your app**:
   ```bash
   npm run deploy
   ```

### Detailed Setup

See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for complete Firebase Console configuration.

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for deployment instructions.

---

## 🗄️ Data Models

### Users Collection

```typescript
interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: 'owner' | 'manager' | 'member'
  clubId?: string
  joinDate: string
}
```

### Stands Collection

```typescript
interface Stand {
  id: string
  name: string
  type: 'ladder' | 'climber' | 'blind' | 'box'
  lat: number
  lng: number
  status: 'available' | 'reserved' | 'occupied' | 'maintenance'
}
```

### Harvests Collection

```typescript
interface Harvest {
  id: string
  userId: string
  userName: string
  date: string
  species: 'deer' | 'turkey' | 'pigs' | 'other'
  sex?: 'male' | 'female'
  weight?: number
  photoUrl?: string
  standId?: string
  notes?: string
}
```

### Bookings Collection (Planned)

```typescript
interface Booking {
  id: string
  standId: string
  userId: string
  startTime: string
  endTime: string
}
```

---

## 🔐 Security

### Firestore Security Rules

- **Users**: Read all, write own profile only
- **Stands**: Read all, write for owners/managers only
- **Harvests**: Read all, write own harvests only
- **Bookings**: Read all, write own bookings only, managers can delete any

### Storage Security Rules

- **Harvest Photos**: Read all, write to own folder only
- Max file size: 5MB
- Allowed types: images only

---

## 📜 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run deploy           # Deploy everything to Firebase
npm run deploy:hosting   # Deploy hosting only
npm run deploy:rules     # Deploy security rules only
```

---

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: '#10b981',     // Emerald green
  secondary: '#3b82f6',   // Blue
  dark: '#0f172a',        // Slate dark
}
```

### Firebase Project

Update `.env.local` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with email/password
- [ ] User login with email/password
- [ ] Google OAuth sign-in
- [ ] Create harvest with photo upload
- [ ] View real-time harvest updates
- [ ] Reserve/release stand
- [ ] View real-time stand updates
- [ ] Logout

### Firebase Emulator (Local Testing)

```bash
firebase emulators:start
```

Update `src/firebase/config.ts` to use emulators:

```typescript
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}
```

---

## 📊 Performance Optimization

### Implemented

- ✅ Code splitting with React Router
- ✅ Lazy loading of routes
- ✅ Optimized Vite build
- ✅ Tailwind CSS purging
- ✅ Image compression for uploads (client-side)

### Recommended

- [ ] React.memo for heavy components
- [ ] Virtual scrolling for long lists
- [ ] Image CDN for photo optimization
- [ ] Service Worker for offline support
- [ ] Lighthouse performance audit

---

## 🐛 Troubleshooting

### Common Issues

**Firebase Authentication Error**
- Ensure Authentication is enabled in Firebase Console
- Check authorized domains include `localhost`

**Permission Denied (Firestore/Storage)**
- Deploy security rules: `npm run deploy:rules`
- Verify user is authenticated

**Photos Not Uploading**
- Check file size under 5MB
- Verify Storage rules deployed
- Ensure correct path: `harvests/{userId}/{filename}`

**Build Failures**
- Clear cache: `rm -rf node_modules dist`
- Reinstall: `npm install`
- Check Node.js version: `node -v` (v18+)

---

## 📚 Documentation

- **Firebase Setup**: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vite.dev

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 👥 Team

- **Project**: DeerCamp Hunting Club Management
- **Tech Stack**: React + TypeScript + Firebase
- **Status**: Active Development
- **Version**: 1.0.0

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] User authentication
- [x] Stand management
- [x] Harvest logging with photos
- [x] Real-time updates
- [x] Security rules

### Phase 2 (Next)
- [ ] Booking system with calendar
- [ ] Member management page
- [ ] Interactive map integration
- [ ] Weather API integration
- [ ] Advanced filtering

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Export reports (PDF)
- [ ] Multi-club support

---

## 📞 Support

For issues or questions:
- Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- Open an issue on GitHub

---

**Built with ❤️ for hunters by hunters**

**Last Updated**: 2026-01-08
**Firebase Project**: deercamp-3b648
**Live URL**: https://deercamp-3b648.web.app
